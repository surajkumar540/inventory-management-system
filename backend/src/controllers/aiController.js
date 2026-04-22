import prisma from "../prisma/client.js";

export const getDemandPrediction = async (req, res) => {
  try {
    // Last 30 days ka sales data fetch karo
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesData = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: {
          createdAt: { gte: thirtyDaysAgo },
          status: "COMPLETED",
        },
      },
      _sum: { quantity: true },
      _count: { orderId: true },
    });

    // Product details merge karo
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        quantity: true,
        threshold: true,
        price: true,
      },
    });

    const enrichedData = products.map((p) => {
      const sales = salesData.find((s) => s.productId === p.id);
      return {
        productId: p.id,
        name: p.name,
        sku: p.sku,
        currentStock: p.quantity,
        threshold: p.threshold,
        price: p.price,
        unitsSoldLast30Days: sales?._sum?.quantity || 0,
        orderCount: sales?._count?.orderId || 0,
      };
    });

    // Grok API call
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 1500,
          messages: [
            {
              role: "system",
              content: `You are an inventory management AI assistant. 
Analyze sales data and return ONLY a valid JSON object — no markdown, no explanation, no backticks.
Response format:
{
  "predictions": [
    {
      "productId": number,
      "productName": string,
      "predictedDemand": number,
      "confidence": "HIGH" | "MEDIUM" | "LOW",
      "recommendation": string
    }
  ],
  "restockRecommendations": [
    {
      "productId": number,
      "productName": string,
      "currentStock": number,
      "suggestedRestockQty": number,
      "urgency": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
    }
  ],
  "alerts": [
    {
      "type": "LOW_STOCK" | "HIGH_DEMAND" | "OVERSTOCK",
      "message": string,
      "productId": number
    }
  ]
}`,
            },
            {
              role: "user",
              content: `Analyze this inventory data and give demand predictions:\n${JSON.stringify(enrichedData, null, 2)}`,
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Grok API Error:", errText);
      return res
        .status(500)
        .json({ error: "AI service failed", details: errText });
    }

    const data = await response.json();
    const rawText = data.choices[0].message.content;

    // JSON parse karo
    let parsed;
    try {
      const clean = rawText.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch (e) {
      console.error("JSON parse failed:", rawText);
      return res
        .status(500)
        .json({ error: "AI response parse failed", raw: rawText });
    }

    res.json({
      success: true,
      generatedAt: new Date().toISOString(),
      dataPoints: enrichedData.length,
      data: {
        aiAnalysis: {
          predictions: parsed.predictions,
          restockRecommendations: parsed.restockRecommendations,
          alerts: parsed.alerts,
        },
        salesSummary: enrichedData.map((p) => ({
          id: p.productId,
          name: p.name,
          currentStock: p.currentStock,
          threshold: p.threshold,
          soldLast30Days: p.unitsSoldLast30Days,
        })),
      },
    });
  } catch (err) {
    console.error("AI Controller Error:", err);
    res.status(500).json({ error: err.message });
  }
};
