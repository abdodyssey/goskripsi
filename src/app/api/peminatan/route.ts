import { NextResponse } from "next/server";
import { peminatanService } from "@/server/services/peminatan.service";
import { getAuthUser } from "@/lib/auth-helper";

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const prodiId = searchParams.get("prodi_id");

  try {
    const data = await peminatanService.getAll(prodiId || undefined);
    return NextResponse.json({ data, success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
