import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOTPEmail = async (toEmail, otp, type = "verify") => {
  const subject = type === "verify"
    ? "Verify your StockFlow account"
    : "Your StockFlow login OTP";

  const message = type === "verify"
    ? `Welcome to StockFlow! Your verification OTP is:`
    : `Your login OTP is:`;

  await resend.emails.send({
    from: process.env.FROM_EMAIL,
    to: toEmail,
    subject,
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:32px;">
        <h2 style="color:#1e293b;margin-bottom:8px;">StockFlow</h2>
        <p style="color:#64748b;font-size:14px;">${message}</p>
        <div style="background:#f1f5f9;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
          <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#6366f1;">
            ${otp}
          </span>
        </div>
        <p style="color:#94a3b8;font-size:12px;">
          This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.
        </p>
      </div>
    `,
  });
};