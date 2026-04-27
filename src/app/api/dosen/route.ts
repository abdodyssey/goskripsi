import { NextResponse } from "next/server";
import { dosenService } from "@/server/services/dosen.service";
import { getAuthUser } from "@/lib/auth-helper";
import { getPaginationParams } from "@/utils/pagination";

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { page, limit, skip } = getPaginationParams(request);
  const prodiId = new URL(request.url).searchParams.get("prodi_id");
  const role = new URL(request.url).searchParams.get("role");

  try {
    const result = await dosenService.getAll({
      prodiId: prodiId || undefined,
      role: role || undefined,
      skip,
      take: limit,
    });
    return NextResponse.json({ ...result, success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const data = await dosenService.create(body);
    return NextResponse.json({ data, success: true, message: "Dosen berhasil dibuat" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
