import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase";

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

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${slug}/${Date.now()}.${ext}`;

  const supabase = createServiceClient();
  const { error } = await supabase.storage.from("project-photos").upload(path, file, {
    contentType: file.type,
    upsert: true,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: urlData } = supabase.storage.from("project-photos").getPublicUrl(path);

  return NextResponse.json({ url: urlData.publicUrl });
}
