import { Resend } from "resend";

import { verifyEmailTemplate } from "./templates/verifyEmail";
import { resetPasswordTemplate } from "./templates/resetPassword";
import { patientQuestionnaireCompletedTemplate } from "./templates/patientQuestionnaireCompleted";

const resend = new Resend(process.env.RESEND_API_KEY);
const isEmailDebugEnabled =
  process.env.EMAIL_DEBUG === "1" || process.env.EMAIL_DEBUG === "true";

function logEmailDebug(message: string, data?: Record<string, unknown>) {
  if (!isEmailDebugEnabled) return;
  if (data) {
    console.log(`[resend] ${message}`, data);
    return;
  }
  console.log(`[resend] ${message}`);
}

// TODO: Update with your verified domain email
// For now, you can use: onboarding@resend.dev (Resend's test email)
// Or verify your domain in Resend and use: noreply@yourdomain.com
const FROM_EMAIL = "Visoria Medical <onboarding@resend.dev>";
const SUBJECT = (subject: string) => `Visoria Medical - ${subject}`;

export async function sendBatch(emails: any[]) {
  return await resend.batch.send(emails);
}

export async function sendVerifyEmail({
  email,
  url,
  name,
}: {
  email: string;
  url: string;
  name: string;
}) {
  if (!email) return;
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: SUBJECT("Verifica tu correo electrónico"),
    html: verifyEmailTemplate({ email, url, name }),
  });

  if (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }

  console.log("Verification email sent:", data);
  return data;
}

export async function sendResetPasswordEmail({
  email,
  url,
  name,
}: {
  email: string;
  url: string;
  name: string;
}) {
  if (!email) return;

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: SUBJECT("Restablece tu contraseña"),
    html: resetPasswordTemplate({ email, url, name }),
  });

  if (error) {
    console.error("Error sending reset password email:", error);
    throw error;
  }

  console.log("Reset password email sent:", data);
  return data;
}

export async function sendPatientQuestionnaireCompletedEmail({
  email,
  name,
}: {
  email: string;
  name: string;
}) {
  if (!email) {
    logEmailDebug("Skipped patient questionnaire completed email: missing recipient email");
    return;
  }

  logEmailDebug("Attempting patient questionnaire completed email send", {
    to: email,
    hasApiKey: Boolean(process.env.RESEND_API_KEY),
    from: FROM_EMAIL,
  });

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: SUBJECT("Cuestionario completado"),
    html: patientQuestionnaireCompletedTemplate({ email, name }),
  });

  if (error) {
    logEmailDebug("Resend API returned error for questionnaire completion email", {
      to: email,
      error,
    });
    console.error("Error sending patient questionnaire completion email:", error);
    throw error;
  }

  logEmailDebug("Resend API accepted questionnaire completion email", {
    to: email,
    response: data,
  });
  console.log("Patient questionnaire completion email sent:", data);
  return data;
}
