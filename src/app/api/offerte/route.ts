import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { quoteSchema, label, type QuoteData } from "@/lib/quote";
import { site } from "@/lib/site";

export const runtime = "nodejs";

/**
 * Zelfde SMTP-conventie als het CRM (zie KunststofkozijnnodigCRM/src/lib/email.ts),
 * zodat beide projecten dezelfde variabelenamen delen. De oude GMAIL_USER /
 * GMAIL_APP_PASSWORD blijven werken als fallback.
 */
const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
const smtpFrom = process.env.SMTP_FROM || smtpUser;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: false,
  auth: { user: smtpUser, pass: smtpPass },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

/**
 * Ontbrekende mailconfiguratie gaf eerder dezelfde generieke 502 als een echte
 * verzendfout, waardoor niet te zien was dat de credentials simpelweg niet in
 * Vercel stonden. Nu staat dat expliciet in de log.
 */
function missingMailEnv(): string[] {
  const missing: string[] = [];
  if (!smtpUser) missing.push("SMTP_USER (of GMAIL_USER)");
  if (!smtpPass) missing.push("SMTP_PASS (of GMAIL_APP_PASSWORD)");
  return missing;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });
  }

  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validatie mislukt", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const data = parsed.data;
  const to = process.env.QUOTE_TO_EMAIL ?? site.email;
  const subject = `Nieuwe offerteaanvraag — ${data.firstName} ${data.lastName} (${label(data.customerType)})`;

  // Build attachments for nodemailer
  const mailAttachments = (data.attachments ?? []).map((a) => ({
    filename: a.name,
    content: a.data,
    encoding: "base64" as const,
    contentType: a.type,
  }));

  const missing = missingMailEnv();
  if (missing.length > 0) {
    // De aanvraag is geldig maar kan nergens heen. Log de aanvraag volledig,
    // zodat de lead terug te vinden is in de Vercel-logs en niet verdwijnt.
    console.error(
      `[offerte] Mail niet geconfigureerd — ontbrekende env vars: ${missing.join(", ")}. ` +
        `Onverzonden aanvraag: ${JSON.stringify(data)}`,
    );
    return NextResponse.json({ error: "E-mail is niet geconfigureerd" }, { status: 502 });
  }

  try {
    // 1. Send full quote to info@kunststofkozijnnodig.nl (with attachments)
    await transporter.sendMail({
      from: `Kunststofkozijnnodig.nl Website <${smtpFrom}>`,
      to,
      replyTo: data.email,
      subject,
      html: renderEmail(data),
      attachments: mailAttachments,
    });

    // 2. Send confirmation to customer + BCC to info@ so you always know
    await transporter.sendMail({
      from: `Kunststofkozijnnodig.nl <${smtpFrom}>`,
      to: data.email,
      bcc: to,
      subject: "Bedankt voor je offerteaanvraag — Kunststofkozijnnodig.nl",
      html: renderConfirmation(data),
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (e) {
    // Ook hier de aanvraag meeloggen: liever een lead uit de logs vissen dan
    // hem kwijt zijn omdat de mailserver even niet meewerkte.
    console.error("[offerte] Mail error:", e);
    console.error(`[offerte] Onverzonden aanvraag: ${JSON.stringify(data)}`);
    return NextResponse.json({ error: "E-mail kon niet worden verstuurd" }, { status: 502 });
  }
}

function escape(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function row(k: string, v: string): string {
  return `<tr><td style="padding:10px 16px;color:#6b7280;font-size:13px;background:#f7f5f0;border-bottom:1px solid #e8e4db;width:180px">${escape(k)}</td><td style="padding:10px 16px;color:#1a1a1a;font-size:14px;background:#ffffff;border-bottom:1px solid #e8e4db">${escape(v)}</td></tr>`;
}

function renderEmail(d: QuoteData): string {
  const addr = `${d.street} ${d.houseNumber}, ${d.postalCode} ${d.city}`;
  const totalItems = d.items.reduce((sum, i) => sum + i.quantity, 0);

  // Build items section
  let itemsHtml = "";
  for (const item of d.items) {
    itemsHtml += `<tr><td colspan="2" style="padding:12px 16px;background:#0b3d2e;color:#fff;font-weight:600;font-size:14px;border-bottom:1px solid #e8e4db">${escape(label(item.product))} — ${item.quantity}×</td></tr>`;
    if (item.dimensions) {
      for (let i = 0; i < item.dimensions.length; i++) {
        const dim = item.dimensions[i];
        const w = dim.width ? `${dim.width}` : "?";
        const h = dim.height ? `${dim.height}` : "?";
        const size = dim.width || dim.height ? `${w} × ${h} mm` : "Nog niet opgegeven";
        const note = dim.note ? ` — ${escape(dim.note)}` : "";
        itemsHtml += row(`#${i + 1}`, `${size}${note}`);
      }
    }
  }

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f7f5f0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5f0;padding:40px 20px">
    <tr><td align="center">
      <table width="640" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 40px -10px rgba(30,58,95,.15)">
        <tr><td style="background:#0b3d2e;padding:32px 40px;color:#fff">
          <h1 style="margin:0;font-size:24px;font-weight:600">Nieuwe offerteaanvraag</h1>
          <p style="margin:6px 0 0;opacity:.8;font-size:14px">Via de website van Kunststofkozijnnodig.nl — ${totalItems} product${totalItems === 1 ? "" : "en"}</p>
        </td></tr>
        <tr><td style="padding:32px 40px">

          <h2 style="margin:0 0 16px;font-size:16px;color:#0b3d2e;text-transform:uppercase;letter-spacing:.1em">Aanvraag</h2>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid #e8e4db">
            ${row("Type klant", label(d.customerType))}
            ${row("Project", label(d.projectType))}
            ${row("Dienst", label(d.service))}
            ${row("Houtlook verbinding", d.houtlookVerbinding ? "Ja" : "Nee (standaard verstek)")}
            ${row("Merk", label(d.brand))}
            ${row("Kleur buiten", label(d.colorBuiten))}
            ${row("Kleur binnen", label(d.colorBinnen))}
            ${row("Glas", label(d.glass))}
            ${row("Planning", label(d.timeline))}
          </table>

          <h2 style="margin:32px 0 16px;font-size:16px;color:#0b3d2e;text-transform:uppercase;letter-spacing:.1em">Producten & afmetingen</h2>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid #e8e4db">
            ${itemsHtml}
          </table>

          <h2 style="margin:32px 0 16px;font-size:16px;color:#0b3d2e;text-transform:uppercase;letter-spacing:.1em">Contact</h2>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid #e8e4db">
            ${d.companyName ? row("Bedrijf", d.companyName) : ""}
            ${row("Naam", `${d.firstName} ${d.lastName}`)}
            ${row("E-mail", d.email)}
            ${row("Telefoon", d.phone)}
            ${row("Adres", addr)}
          </table>

          ${d.description
            ? `<h2 style="margin:32px 0 12px;font-size:16px;color:#0b3d2e;text-transform:uppercase;letter-spacing:.1em">Beschrijving</h2>
               <div style="padding:16px 20px;background:#f7f5f0;border-radius:8px;font-size:14px;color:#1a1a1a;white-space:pre-wrap">${escape(d.description)}</div>`
            : ""}

          ${(d.attachments?.length ?? 0) > 0
            ? `<h2 style="margin:32px 0 12px;font-size:16px;color:#0b3d2e;text-transform:uppercase;letter-spacing:.1em">Bijlagen</h2>
               <div style="padding:16px 20px;background:#f7f5f0;border-radius:8px;font-size:14px;color:#1a1a1a">${d.attachments!.length} bestand${d.attachments!.length === 1 ? "" : "en"} bijgevoegd: ${d.attachments!.map((a) => escape(a.name)).join(", ")}</div>`
            : ""}

          ${d.notes
            ? `<h2 style="margin:32px 0 12px;font-size:16px;color:#0b3d2e;text-transform:uppercase;letter-spacing:.1em">Opmerkingen</h2>
               <div style="padding:16px 20px;background:#f7f5f0;border-radius:8px;font-size:14px;color:#1a1a1a;white-space:pre-wrap">${escape(d.notes)}</div>`
            : ""}

          <p style="margin:32px 0 0;font-size:13px;color:#6b7280">Reageer direct op deze e-mail om contact op te nemen met ${escape(d.firstName)}.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function renderConfirmation(d: QuoteData): string {
  const totalItems = d.items.reduce((sum, i) => sum + i.quantity, 0);
  const summary = d.items.map((i) => `${i.quantity}× ${label(i.product)}`).join(", ");

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f7f5f0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5f0;padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 40px -10px rgba(30,58,95,.15)">
        <tr><td style="background:#0b3d2e;padding:40px;text-align:center;color:#fff">
          <h1 style="margin:0;font-size:26px;font-weight:600">Bedankt voor je aanvraag!</h1>
        </td></tr>
        <tr><td style="padding:32px 40px;color:#1a1a1a;font-size:15px;line-height:1.6">
          <p>Hoi ${escape(d.firstName)},</p>
          <p>We hebben je offerteaanvraag goed ontvangen voor <strong>${summary}</strong> (${totalItems} ${totalItems === 1 ? "stuk" : "stuks"}).</p>
          <p>Binnen <strong>1 werkdag</strong> nemen we persoonlijk contact met je op om de details door te nemen en een prijs op maat te maken.</p>
          <p style="margin-top:24px">Vragen? Bel of app ons gerust op <a href="tel:+31658866070" style="color:#0b3d2e">+31 6 58 86 60 70</a>.</p>
          <p style="margin-top:24px">Met vriendelijke groet,<br><strong>Team Kunststofkozijnnodig.nl</strong></p>
        </td></tr>
        <tr><td style="padding:20px 40px;background:#f7f5f0;font-size:12px;color:#6b7280;text-align:center">
          Kunststofkozijnnodig.nl · Samsonweg 26F · 1521 RM Wormerveer · info@kunststofkozijnnodig.nl
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
