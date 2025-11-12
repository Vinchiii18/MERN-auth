import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587, // Use 587
  secure: false, // false for STARTTLS
  auth: {
    user: process.env.SMTP_USER || process.env.SENDER_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // needed for some cloud hosts
  },
});

// Optional: verify connection on start
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Transport Error:", error.message);
  } else {
    console.log("SMTP Transport Ready:", success);
  }
});

export default transporter;
