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
  <body style="margin:0;padding:0;background:#f0f4f8;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 0;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <tr><td style="background:#426FB6;padding:24px 28px;">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr>
              <td style="padding-right:12px;vertical-align:middle;">
                <div style="width:36px;height:36px;background:#FEDF01;border-radius:8px;text-align:center;line-height:36px;font-size:18px;font-weight:800;color:#1a3a5c;">S</div>
              </td>
              <td style="vertical-align:middle;">
                <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.2px;">SpringWell Bank</span>
              </td>
            </tr></table>
          </td></tr>
          <tr><td style="padding:32px 28px;">
            <h1 style="margin:0 0 16px;color:#1a3a5c;font-size:22px;font-weight:700;">${title}</h1>
            ${innerHtml}
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;padding-top:20px;border-top:1px solid #e5e9ec;">
              <tr><td style="color:#8a95a5;font-size:12px;line-height:1.6;">
                SpringWell Bank &middot; This is an automated message, please do not reply.<br/>
                If you did not request this, you can safely ignore this email.
              </td></tr>
            </table>
          </td></tr>
          <tr><td style="background:#1a3a5c;padding:16px 28px;text-align:center;">
            <span style="color:#8aabc4;font-size:11px;">&copy; ${new Date().getFullYear()} SpringWell Bank. All rights reserved.</span>
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
      `<p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 12px;">Hi ${name},</p>
       <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 12px;">Welcome to <strong style="color:#426FB6;">SpringWell Bank</strong>, your trusted financial partner. Your account has been created and is currently <strong>pending review</strong>. Our team will activate it shortly, and you'll be able to sign in and manage your finances right away.</p>
       <table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;">
         <tr><td style="background:#f0f6ff;border-radius:8px;padding:14px 20px;border-left:4px solid #426FB6;">
           <p style="margin:0;color:#426FB6;font-size:13px;font-weight:600;">What happens next?</p>
           <p style="margin:6px 0 0;color:#555;font-size:13px;line-height:1.6;">Our team reviews your account and activates it. You'll receive an email once you can sign in.</p>
         </td></tr>
       </table>
       <p style="color:#333;font-size:15px;line-height:1.7;margin:0;">If you have any questions, just reply to this email or contact our support team.</p>`
    );
    const text = `Hi ${name},\n\nWelcome to SpringWell Bank, your trusted financial partner. Your account has been created and is pending review. We'll activate it shortly.\n\nIf you have any questions, contact our support team.`;
    await transport().sendMail({ from: from(), to, subject: "Welcome to SpringWell Bank", html, text });
    return { ok: true as const };
  },
});

export const sendOtpEmail = action({
  args: { to: v.string(), code: v.string() },
  handler: async (_ctx, { to, code }) => {
    const html = layout(
      "Your Login Code",
      `<p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 12px;">Use the one-time code below to sign in to your SpringWell Bank account:</p>
       <table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;width:100%;">
         <tr><td style="background:#f0f6ff;border:2px dashed #426FB6;border-radius:12px;padding:20px;text-align:center;">
           <p style="margin:0 0 4px;color:#8a95a5;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;">Your verification code</p>
           <p style="margin:0;color:#1a3a5c;font-size:32px;font-weight:800;letter-spacing:10px;font-family:monospace;">${code}</p>
         </td></tr>
       </table>
       <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;width:100%;">
         <tr><td style="background:#fff8e1;border-radius:8px;padding:12px 16px;border-left:4px solid #FEDF01;">
           <p style="margin:0;color:#8a6d00;font-size:13px;line-height:1.5;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
         </td></tr>
       </table>`
    );
    const text = `Your SpringWell Bank one-time login code is ${code}. It expires in 10 minutes.`;
    await transport().sendMail({ from: from(), to, subject: "Your SpringWell Bank Login Code", html, text });
    return { ok: true as const };
  },
});

export const sendPasswordResetEmail = action({
  args: { to: v.string(), code: v.string() },
  handler: async (_ctx, { to, code }) => {
    const html = layout(
      "Reset Your Password",
      `<p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 12px;">We received a request to reset the password for your SpringWell Bank account.</p>
       <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 12px;">Use the verification code below to choose a new password:</p>
       <table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;width:100%;">
         <tr><td style="background:#f0f6ff;border:2px dashed #426FB6;border-radius:12px;padding:20px;text-align:center;">
           <p style="margin:0 0 4px;color:#8a95a5;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;">Password reset code</p>
           <p style="margin:0;color:#1a3a5c;font-size:32px;font-weight:800;letter-spacing:10px;font-family:monospace;">${code}</p>
         </td></tr>
       </table>
       <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;width:100%;">
         <tr><td style="background:#fff8e1;border-radius:8px;padding:12px 16px;border-left:4px solid #FEDF01;">
           <p style="margin:0;color:#8a6d00;font-size:13px;line-height:1.5;">This code expires in <strong>30 minutes</strong>. If you didn't request this, no action is needed.</p>
         </td></tr>
       </table>`
    );
    const text = `Your SpringWell Bank password reset code is ${code}. It expires in 30 minutes. If you didn't request this, no action is needed.`;
    await transport().sendMail({ from: from(), to, subject: "Reset Your SpringWell Bank Password", html, text });
    return { ok: true as const };
  },
});

export const sendVerificationCodes = action({
  args: { to: v.string(), firstName: v.string(), cotCode: v.optional(v.string()), bsacCode: v.optional(v.string()), vatCode: v.optional(v.string()) },
  handler: async (_ctx, { to, firstName, cotCode, bsacCode, vatCode }) => {
    const name = firstName || "there";
    const codeBox = (label: string, code: string) =>
      `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:10px 0;width:100%;">
        <tr><td style="background:#f0f6ff;border:2px dashed #426FB6;border-radius:12px;padding:16px 20px;text-align:center;">
          <p style="margin:0 0 4px;color:#8a95a5;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;">${label}</p>
          <p style="margin:0;color:#1a3a5c;font-size:28px;font-weight:800;letter-spacing:8px;font-family:monospace;">${code}</p>
        </td></tr>
      </table>`;
    const codeBoxes = [
      cotCode && codeBox("COT Code", cotCode),
      bsacCode && codeBox("BSAC Code", bsacCode),
      vatCode && codeBox("VAT Code", vatCode),
    ].filter(Boolean).join("");
    const html = layout(
      "Your Transfer Verification Code",
      `<p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 12px;">Hi ${name},</p>
       <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 8px;">Your transfer is being processed. Enter this code in the SpringWell Bank portal to continue:</p>
       ${codeBoxes}
       <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;width:100%;">
         <tr><td style="background:#f0f6ff;border-radius:8px;padding:14px 16px;">
           <p style="margin:0;color:#426FB6;font-size:13px;font-weight:600;">Enter codes in order:</p>
           <p style="margin:4px 0 0;color:#555;font-size:13px;">COT &rarr; BSAC &rarr; VAT</p>
         </td></tr>
       </table>
       <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0;width:100%;">
         <tr><td style="background:#fef2f2;border-radius:8px;padding:12px 16px;border-left:4px solid #dc2626;">
           <p style="margin:0;color:#dc2626;font-size:13px;font-weight:600;">Do not share this code with anyone.</p>
         </td></tr>
       </table>`
    );
    const text = `Hi ${name},\n\nYour transfer verification code:\n${cotCode ? `COT: ${cotCode}` : bsacCode ? `BSAC: ${bsacCode}` : `VAT: ${vatCode}`}\n\nEnter it in the SpringWell Bank portal. Do not share this code with anyone.`;
    await transport().sendMail({ from: from(), to, subject: "Your SpringWell Bank Verification Code", html, text });
    return { ok: true as const };
  },
});
