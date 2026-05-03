export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { syaratService } from "@/server/services/syarat.service";
import { getAuthUser } from "@/lib/auth-helper";

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const data = await syaratService.getAll();
    return NextResponse.json({ data, success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const data = await syaratService.store(body);
    return NextResponse.json({ data, success: true, message: "Syarat berhasil dibuat" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
