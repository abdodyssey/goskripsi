export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { ujianService } from "@/server/services/ujian.service";
import { getAuthUser } from "@/lib/auth-helper";
import { getPaginationParams } from "@/utils/pagination";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized", success: false },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const { skip, limit } = getPaginationParams(request);
    const { searchParams } = new URL(request.url);
    const namaJenis = searchParams.get("namaJenis") || undefined;

    const result = await ujianService.getByMahasiswa({
      mahasiswaId: id,
      namaJenis,
      skip,
      take: limit,
    });

    return NextResponse.json({ ...result, success: true });
  } catch (error: any) {
    console.error("Error in GET /api/ujian/mahasiswa/[id]:", error);
    return NextResponse.json(
      { message: error.message || "Gagal mengambil data ujian mahasiswa", success: false },
      { status: 500 }
    );
  }
}
