import nodemailer from "nodemailer";

// Create transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465,
  secure: process.env.SMTP_SECURE === "true" || true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || process.env.SENDER_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Verify connection configuration (optional, logs on server start)
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Transport Error:", error.message);
  } else {
    console.log("SMTP Transport Ready:", success);
  }
});

export default transporter;
