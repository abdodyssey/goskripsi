export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { komponenPenilaianService } from "@/server/services/komponen-penilaian.service";
import { getAuthUser } from "@/lib/auth-helper";

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const data = await komponenPenilaianService.getAll();
    return NextResponse.json({ data, success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const payload = await request.json();
    const data = await komponenPenilaianService.store(payload);
    return NextResponse.json({ data, success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
