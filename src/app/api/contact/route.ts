import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";
import { site } from "@/lib/site";

export const runtime = "nodejs";

const contactSchema = z.object({
  name: z.string().min(1, "Naam is verplicht").max(200),
  email: z.string().email("Ongeldig e-mailadres"),
  phone: z.string().max(30).optional().default(""),
  message: z.string().min(1, "Bericht is verplicht").max(5000),
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

function escape(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validatie mislukt", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const { name, email, phone, message } = parsed.data;
  const to = process.env.QUOTE_TO_EMAIL ?? site.email;
  const subject = `Nieuw contactbericht — ${name}`;

  try {
    // Send notification to the business
    await transporter.sendMail({
      from: `Kunststofkozijnnodig.nl Website <${process.env.GMAIL_USER}>`,
      to,
      replyTo: email,
      subject,
      html: `<!doctype html>
<html><body style="margin:0;padding:0;background:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 20px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 40px -10px rgba(30,58,95,.15)">
        <tr><td style="background:#1e3a5f;padding:32px 40px;color:#fff">
          <h1 style="margin:0;font-size:22px;font-weight:600">Nieuw contactbericht</h1>
          <p style="margin:6px 0 0;opacity:.8;font-size:14px">Via de website van Kunststofkozijnnodig.nl</p>
        </td></tr>
        <tr><td style="padding:32px 40px">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid #dce4ed">
            <tr><td style="padding:10px 16px;color:#6b7280;font-size:13px;background:#f0f4f8;border-bottom:1px solid #dce4ed;width:140px">Naam</td><td style="padding:10px 16px;font-size:14px;border-bottom:1px solid #dce4ed">${escape(name)}</td></tr>
            <tr><td style="padding:10px 16px;color:#6b7280;font-size:13px;background:#f0f4f8;border-bottom:1px solid #dce4ed">E-mail</td><td style="padding:10px 16px;font-size:14px;border-bottom:1px solid #dce4ed"><a href="mailto:${escape(email)}" style="color:#1e40af">${escape(email)}</a></td></tr>
            <tr><td style="padding:10px 16px;color:#6b7280;font-size:13px;background:#f0f4f8;border-bottom:1px solid #dce4ed">Telefoon</td><td style="padding:10px 16px;font-size:14px;border-bottom:1px solid #dce4ed">${phone ? escape(phone) : "—"}</td></tr>
          </table>
          <h2 style="margin:28px 0 12px;font-size:15px;color:#1e3a5f;text-transform:uppercase;letter-spacing:.1em">Bericht</h2>
          <div style="padding:16px 20px;background:#f0f4f8;border-radius:8px;font-size:14px;line-height:1.6;white-space:pre-wrap">${escape(message)}</div>
          <p style="margin:24px 0 0;font-size:13px;color:#6b7280">Reageer direct op deze e-mail om contact op te nemen met ${escape(name)}.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
    });

    // Send confirmation to the visitor
    await transporter.sendMail({
      from: `Kunststofkozijnnodig.nl <${process.env.GMAIL_USER}>`,
      to: email,
      bcc: to,
      subject: "Bedankt voor je bericht — Kunststofkozijnnodig.nl",
      html: `<!doctype html>
<html><body style="margin:0;padding:0;background:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 20px">
    <tr><td align="center">
      <table width="540" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 40px -10px rgba(30,58,95,.15)">
        <tr><td style="background:#1e3a5f;padding:40px;text-align:center;color:#fff">
          <h1 style="margin:0;font-size:24px;font-weight:600">Bedankt voor je bericht!</h1>
        </td></tr>
        <tr><td style="padding:32px 40px;color:#1a1a1a;font-size:15px;line-height:1.6">
          <p>Hoi ${escape(name.split(" ")[0])},</p>
          <p>We hebben je bericht goed ontvangen. We reageren meestal binnen een paar uur op werkdagen.</p>
          <p>Dringend? Bel of app ons gerust op <a href="tel:+31658866070" style="color:#1e40af">+31 6 58 86 60 70</a>.</p>
          <p style="margin-top:24px">Met vriendelijke groet,<br><strong>Team Kunststofkozijnnodig.nl</strong></p>
        </td></tr>
        <tr><td style="padding:20px 40px;background:#f0f4f8;font-size:12px;color:#6b7280;text-align:center">
          Kunststofkozijnnodig.nl &middot; Samsonweg 26F &middot; 1521 RM Wormerveer
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[contact] Mail error:", e);
    return NextResponse.json({ error: "E-mail kon niet worden verstuurd" }, { status: 502 });
  }
}
