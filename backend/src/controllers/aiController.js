// src/controllers/aiController.js
import prisma from "../prisma/client.js";

// ========================
// AI DEMAND PREDICTION
// ========================
export const getDemandPrediction = async (req, res) => {
  try {
    // Gather past 30 days of sales data grouped by product
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesData = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      where: {
        order: {
          createdAt: { gte: thirtyDaysAgo },
          status: { not: "CANCELLED" },
        },
      },
    });

    const products = await prisma.product.findMany({
      select: { id: true, name: true, quantity: true, threshold: true, price: true },
    });

    // Merge sales data with product info
    const enriched = products.map((p) => {
      const sold = salesData.find((s) => s.productId === p.id);
      return {
        id:             p.id,
        name:           p.name,
        currentStock:   p.quantity,
        threshold:      p.threshold,
        soldLast30Days: sold?._sum?.quantity || 0,
      };
    });

    // Build prompt for Claude
    const prompt = `
You are an inventory analyst. Based on the last 30 days of sales data below, provide:
1. Demand prediction for next 30 days (per product)
2. Restock recommendations (which products to order and how much)
3. Any alerts for critically low or overstocked items

Sales data (JSON):
${JSON.stringify(enriched, null, 2)}

Respond in JSON format:
{
  "predictions": [
    { "productId": 1, "productName": "...", "predictedDemand": 50, "confidence": "HIGH|MEDIUM|LOW" }
  ],
  "restockRecommendations": [
    { "productId": 1, "productName": "...", "recommendedQty": 100, "urgency": "URGENT|NORMAL|LOW" }
  ],
  "alerts": ["..."]
}
`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":         "application/json",
        "x-api-key":            process.env.ANTHROPIC_API_KEY,
        "anthropic-version":    "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-opus-4-5",
        max_tokens: 1024,
        messages:   [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const rawText = aiData.content?.[0]?.text || "{}";

    // Strip markdown fences if present
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const parsed  = JSON.parse(cleaned);

    res.json({ success: true, data: { salesSummary: enriched, aiAnalysis: parsed } });
  } catch (err) {
    console.error("AI Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};