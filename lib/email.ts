/**
 * Email sending via Resend.
 */

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? "Triply <onboarding@resend.dev>";
const APP_URL = process.env.APP_BASE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

export async function sendVerificationEmail(
  to: string,
  token: string
): Promise<{ ok: boolean; error?: string }> {
  if (!isEmailConfigured()) {
    return { ok: false, error: "Email not configured" };
  }

  const url = `${APP_URL.replace(/\/$/, "")}/verify-email?token=${encodeURIComponent(token)}`;

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: [to],
      subject: "Verify your email – Triply",
      html: `
        <h1>Verify your email</h1>
        <p>Thanks for signing up for Triply. Click the link below to verify your email address.</p>
        <p><a href="${url}" style="color: #2563eb; font-weight: 600;">Verify email</a></p>
        <p>This link expires in 24 hours. If you didn't sign up, you can ignore this email.</p>
        <p>Triply Team</p>
      `,
    });

    if (error) {
      console.error("[Email] Resend error:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (e) {
    console.error("[Email] Send error:", e);
    return { ok: false, error: e instanceof Error ? e.message : "Failed to send" };
  }
}
