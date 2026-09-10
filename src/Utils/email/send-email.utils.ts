import nodemailer from "nodemailer";

export interface ISendEmail {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: ISendEmail): Promise<boolean> => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: `"Job Search App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });

  return info.accepted.length > 0;
};

export const generateOtpEmailTemplate = (otp: string, firstName: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #333;">Hello ${firstName},</h2>
      <p>Thank you for registering with Job Search App. Please use the following One-Time Password (OTP) to verify your email address:</p>
      <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 6px; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #007bff;">
        ${otp}
      </div>
      <p style="color: #666; margin-top: 15px;">This OTP is valid for 10 minutes. If you did not request this code, please ignore this email.</p>
    </div>
  `;
};
