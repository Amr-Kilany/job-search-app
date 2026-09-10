import { EventEmitter } from "events";
import { generateOtpEmailTemplate, sendEmail } from "../email/send-email.utils.js";

export const emailEvent = new EventEmitter();

emailEvent.on("sendConfirmEmail", async (data: { email: string; otp: string; firstName: string }) => {
  try {
    const html = generateOtpEmailTemplate(data.otp, data.firstName);
    await sendEmail({
      to: data.email,
      subject: "Confirm Your Email - Job Search App",
      html,
    });
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
  }
});

emailEvent.on("sendForgetPasswordEmail", async (data: { email: string; otp: string; firstName: string }) => {
  try {
    const html = generateOtpEmailTemplate(data.otp, data.firstName);
    await sendEmail({
      to: data.email,
      subject: "Reset Your Password - Job Search App",
      html,
    });
  } catch (error) {
    console.error("Failed to send forget password email:", error);
  }
});

export const applicationEventEmitter = new EventEmitter();

applicationEventEmitter.on("applicationDecision", async (data) => {
  const { applicantEmail, applicantName, jobTitle, status } = data;
  const isAccepted = status === "accepted";

  const subject = isAccepted
    ? `Congratulations! Job Offer Update for ${jobTitle}`
    : `Update regarding your application for ${jobTitle}`;

  const html = isAccepted
    ? `<h3>Hello ${applicantName},</h3><p>We are pleased to inform you that your application for <b>${jobTitle}</b> has been accepted!</p>`
    : `<h3>Hello ${applicantName},</h3><p>Thank you for applying for <b>${jobTitle}</b>. Unfortunately, we have decided not to move forward at this time.</p>`;

  await sendEmail({ to: applicantEmail, subject, html });
});
