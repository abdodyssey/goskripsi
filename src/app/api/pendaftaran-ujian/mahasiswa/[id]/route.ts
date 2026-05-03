export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { pendaftaranUjianService } from "@/server/services/pendaftaran-ujian.service";
import { getAuthUser } from "@/lib/auth-helper";
import { getPaginationParams } from "@/utils/pagination";

/**
 * GET /api/pendaftaran-ujian/mahasiswa/[id]
 * Fetches all exam registrations for a specific student.
 * Created to resolve 404 errors in the student dashboard.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });

    const { id } = await params;
    const { skip, limit } = getPaginationParams(request);

    const result = await pendaftaranUjianService.getByMahasiswa({
      mahasiswaId: id,
      skip,
      take: limit,
    });

    return NextResponse.json({ ...result, success: true });
  } catch (error: any) {
    console.error("ERROR in GET /api/pendaftaran-ujian/mahasiswa/[id]:", error.message);
    return NextResponse.json({ message: error.message, success: false }, { status: 500 });
  }
}
