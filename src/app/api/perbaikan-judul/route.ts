export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { perbaikanJudulService } from "@/server/services/perbaikan-judul.service";
import { getAuthUser } from "@/lib/auth-helper";
import { getPaginationParams } from "@/utils/pagination";

/**
 * GET /api/perbaikan-judul
 * Fetches all title revision requests (Management view).
 */
export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });

    const { skip, limit } = getPaginationParams(request);
    const result = await perbaikanJudulService.getAll({ skip, take: limit });

    return NextResponse.json({ ...result, success: true });
  } catch (error: any) {
    console.error("ERROR in GET /api/perbaikan-judul:", error.message);
    return NextResponse.json({ message: error.message, success: false }, { status: 500 });
  }
}

/**
 * POST /api/perbaikan-judul
 * Submits a new title revision request for the current student.
 */
export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });

    const body = await request.json();
    
    // Align camelCase frontend keys with snake_case service expectations
    // Inject the authenticated user ID as the student ID
    const payload = {
      mahasiswa_id: user.id,
      judul_lama: body.judulLama,
      judul_baru: body.judulBaru,
      file_surat: body.fileSurat
    };

    const data = await perbaikanJudulService.store(payload);

    return NextResponse.json({ data, success: true });
  } catch (error: any) {
    console.error("ERROR in POST /api/perbaikan-judul:", error.message);
    return NextResponse.json({ message: error.message, success: false }, { status: 500 });
  }
}
