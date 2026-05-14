import nodemailer from "nodemailer";

let transporter;

// Create fake SMTP account (Ethereal)
const createTransporter = async () => {
  const testAccount = await nodemailer.createTestAccount();

  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  console.log("📧 Ethereal Account Created:");
  console.log("User:", testAccount.user);
  console.log("Pass:", testAccount.pass);
};

await createTransporter();

export const sendOTPEmail = async (toEmail, otp, type = "verify") => {
  const subject =
    type === "verify"
      ? "Verify your StockFlow account"
      : "Your login OTP";

  const info = await transporter.sendMail({
    from: `"StockFlow" <no-reply@stockflow.com>`,
    to: toEmail,
    subject,
    html: `
      <div style="font-family:sans-serif;padding:20px">
        <h2>StockFlow</h2>
        <p>Your OTP is:</p>
        <h1 style="letter-spacing:5px;color:#6366f1">${otp}</h1>
        <p>Valid for 10 minutes</p>
      </div>
    `,
  });

  // 🔥 THIS IS MAGIC LINE
  console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
};