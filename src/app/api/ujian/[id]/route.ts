import { NextResponse } from "next/server";
import { ujianService } from "@/server/services/ujian.service";
import { getAuthUser } from "@/lib/auth-helper";

/**
 * GET /api/ujian/[id]
 * Fetches full details of a specific exam, including examiners and grades.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });

  try {
    const { id } = await params;
    const data = await ujianService.getById(id);
    
    if (!data) {
      return NextResponse.json(
        { message: `Ujian dengan ID ${id} tidak ditemukan`, success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({ data, success: true });
  } catch (error: any) {
    console.error(`ERROR in GET /api/ujian/[id]:`, error.message);
    return NextResponse.json(
      { message: error.message || "Gagal mengambil data ujian", success: false }, 
      { status: error.status || 500 }
    );
  }
}

/**
 * DELETE /api/ujian/[id]
 * Deletes an exam and its associated grading data.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });

  try {
    const { id } = await params;
    await ujianService.delete(id);
    return NextResponse.json({ success: true, message: "Ujian berhasil dihapus" });
  } catch (error: any) {
    console.error(`ERROR in DELETE /api/ujian/[id]:`, error.message);
    return NextResponse.json({ message: error.message, success: false }, { status: 500 });
  }
}
