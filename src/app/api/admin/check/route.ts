import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return NextResponse.json({ auth: false }, { status: 401 });

  try {
    const decoded = Buffer.from(token, "base64").toString();
    const pw = decoded.split(":").slice(1).join(":");
    if (pw !== process.env.ADMIN_PASSWORD) throw new Error("Invalid");
    return NextResponse.json({ auth: true });
  } catch {
    return NextResponse.json({ auth: false }, { status: 401 });
  }
}
