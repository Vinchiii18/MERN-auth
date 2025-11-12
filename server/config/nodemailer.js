import nodemailer from "nodemailer";

// Use port 587 for TLS, works better on cloud providers
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
  secure: process.env.SMTP_SECURE === "true" || false, // false for port 587
  auth: {
    user: process.env.SMTP_USER || process.env.SENDER_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // bypass self-signed certs
  },
});

// Verify transporter on server start
transporter.verify((err, success) => {
  if (err) {
    console.error("SMTP Transport Error:", err.message);
  } else {
    console.log("SMTP Transport Ready:", success);
  }
});

export default transporter;
