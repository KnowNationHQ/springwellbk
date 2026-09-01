"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import nodemailer from "nodemailer";

function transport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function from() {
  return process.env.MAIL_FROM ?? process.env.SMTP_USER;
}

function layout(title: string, innerHtml: string) {
  return `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
  <body style="margin:0;padding:0;background:#f4f6f5;font-family:Segoe UI,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f5;padding:24px 0;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,0.06);">
          <tr>          <td style="background:#0f5132;padding:22px 28px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <svg width="30" height="30" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="SpringWell Bank"><circle cx="32" cy="32" r="28" fill="none" stroke="#ffffff" stroke-width="4"/><path d="M41 22c-4-4-12-4-15 1-3 4 0 8 4 9s9 3 9 7-4 8-11 7" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M39 11c2.1-4.3 7.2-5.6 11.2-4-1.6 4.3-6.1 7-11.2 4z" fill="#ffffff"/></svg>
              <span style="color:#ffffff;font-size:19px;font-weight:700;letter-spacing:0.3px;">SpringWell Bank</span>
            </div>
          </td></tr>
          <tr><td style="padding:28px;">
            <h1 style="margin:0 0 14px;color:#0f5132;font-size:22px;">${title}</h1>
            ${innerHtml}
            <p style="margin-top:26px;padding-top:18px;border-top:1px solid #e6eae8;color:#8a958f;font-size:12px;">
              SpringWell Bank · This is an automated message, please do not reply.<br/>
              If you did not request this, you can safely ignore this email.
            </p>
          </td></tr>
          <tr><td style="background:#0f5132;padding:14px 28px;text-align:center;color:#cfe9d8;font-size:12px;">
            &copy; ${new Date().getFullYear()} SpringWell Bank. All rights reserved.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

export const sendEmail = action({
  args: { to: v.string(), subject: v.string(), html: v.string(), text: v.string() },
  handler: async (_ctx, { to, subject, html, text }) => {
    await transport().sendMail({ from: from(), to, subject, html, text });
    return { ok: true as const };
  },
});

export const sendWelcomeEmail = action({
  args: { to: v.string(), firstName: v.string() },
  handler: async (_ctx, { to, firstName }) => {
    const name = firstName || "there";
    const html = layout(
      "Welcome to SpringWell Bank",
      `<p style="color:#333;font-size:15px;line-height:1.6;">Hi ${name},</p>
       <p style="color:#333;font-size:15px;line-height:1.6;">Welcome to <strong>SpringWell Bank</strong> — your trusted financial partner. Your account has been created and is currently <strong>pending review</strong>. Our team will activate it shortly, and you'll be able to sign in and manage your finances right away.</p>
       <p style="color:#333;font-size:15px;line-height:1.6;">If you have any questions, just reply to this email or contact our support team.</p>`
    );
    const text = `Hi ${name},\n\nWelcome to SpringWell Bank — your trusted financial partner. Your account has been created and is pending review. We'll activate it shortly.\n\nIf you have any questions, contact our support team.`;
    await transport().sendMail({ from: from(), to, subject: "Welcome to SpringWell Bank", html, text });
    return { ok: true as const };
  },
});

export const sendOtpEmail = action({
  args: { to: v.string(), code: v.string() },
  handler: async (_ctx, { to, code }) => {
    const html = layout(
      "Your login code",
      `<p style="color:#333;font-size:15px;line-height:1.6;">Use the one-time code below to sign in to your SpringWell Bank account:</p>
       <div style="margin:18px 0;padding:16px 20px;background:#f1f7f3;border:1px dashed #0f5132;border-radius:10px;text-align:center;font-size:30px;letter-spacing:8px;font-weight:700;color:#0f5132;">${code}</div>
       <p style="color:#333;font-size:15px;line-height:1.6;">This code expires in <strong>10 minutes</strong>.</p>`
    );
    const text = `Your SpringWell Bank one-time login code is ${code}. It expires in 10 minutes.`;
    await transport().sendMail({ from: from(), to, subject: "Your SpringWell Bank login code", html, text });
    return { ok: true as const };
  },
});

export const sendPasswordResetEmail = action({
  args: { to: v.string(), code: v.string() },
  handler: async (_ctx, { to, code }) => {
    const html = layout(
      "Reset your password",
      `<p style="color:#333;font-size:15px;line-height:1.6;">We received a request to reset the password for your SpringWell Bank account.</p>
       <p style="color:#333;font-size:15px;line-height:1.6;">Use the verification code below to choose a new password:</p>
       <div style="margin:18px 0;padding:16px 20px;background:#f1f7f3;border:1px dashed #0f5132;border-radius:10px;text-align:center;font-size:30px;letter-spacing:8px;font-weight:700;color:#0f5132;">${code}</div>
       <p style="color:#333;font-size:15px;line-height:1.6;">This code expires in <strong>30 minutes</strong>. If you didn't request this, no action is needed.</p>`
    );
    const text = `Your SpringWell Bank password reset code is ${code}. It expires in 30 minutes. If you didn't request this, no action is needed.`;
    await transport().sendMail({ from: from(), to, subject: "Reset your SpringWell Bank password", html, text });
    return { ok: true as const };
  },
});
