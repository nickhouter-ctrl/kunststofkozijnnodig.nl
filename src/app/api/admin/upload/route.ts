import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import sharp from "sharp";
import { createServiceClient } from "@/lib/supabase";
import { WATERMARK_PNG_BASE64 } from "@/lib/watermark-data";

export const runtime = "nodejs";

const watermarkSource = Buffer.from(WATERMARK_PNG_BASE64, "base64");

/**
 * Brandt het Kunststofkozijnnodig.nl-watermerk rechtsonder in de foto.
 * Respecteert EXIF-oriëntatie en behoudt het oorspronkelijke formaat.
 * Valt bij een fout terug op de originele bytes zodat een upload nooit faalt
 * door het watermerk.
 */
async function watermark(input: Buffer, mime: string): Promise<{ buffer: Buffer; contentType: string }> {
  try {
    // EXIF-rotatie toepassen zodat dims en hoek kloppen
    const oriented = await sharp(input, { failOn: "none" }).rotate().toBuffer();
    const base = sharp(oriented, { failOn: "none" });
    const meta = await base.metadata();
    const W = meta.width ?? 1600;
    const H = meta.height ?? 1200;

    const wmWidth = Math.max(180, Math.round(W * 0.26));
    const wm = await sharp(watermarkSource).resize({ width: wmWidth }).toBuffer();
    const wmMeta = await sharp(wm).metadata();
    const margin = Math.round(W * 0.025);
    const left = Math.max(0, W - (wmMeta.width ?? wmWidth) - margin);
    const top = Math.max(0, H - (wmMeta.height ?? 0) - margin);

    let pipeline = base.composite([{ input: wm, left, top }]);
    let contentType = mime;
    if (mime.includes("png")) pipeline = pipeline.png();
    else if (mime.includes("webp")) pipeline = pipeline.webp({ quality: 90 });
    else {
      pipeline = pipeline.jpeg({ quality: 90 });
      contentType = "image/jpeg";
    }
    return { buffer: await pipeline.toBuffer(), contentType };
  } catch {
    return { buffer: input, contentType: mime };
  }
}

async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, "base64").toString();
    const pw = decoded.split(":").slice(1).join(":");
    return pw === process.env.ADMIN_PASSWORD;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const slug = formData.get("slug") as string;

  if (!file || !slug) return NextResponse.json({ error: "Missing file or slug" }, { status: 400 });

  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const { buffer, contentType } = await watermark(inputBuffer, file.type || "image/jpeg");

  const extByType: Record<string, string> = { "image/png": "png", "image/webp": "webp", "image/jpeg": "jpg" };
  const ext = extByType[contentType] || file.name.split(".").pop() || "jpg";
  const path = `${slug}/${Date.now()}.${ext}`;

  const supabase = createServiceClient();
  const { error } = await supabase.storage.from("project-photos").upload(path, buffer, {
    contentType,
    upsert: true,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: urlData } = supabase.storage.from("project-photos").getPublicUrl(path);

  return NextResponse.json({ url: urlData.publicUrl });
}
