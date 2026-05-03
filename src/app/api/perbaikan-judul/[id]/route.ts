export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { perbaikanJudulService } from "@/server/services/perbaikan-judul.service";
import { getAuthUser } from "@/lib/auth-helper";

/**
 * DELETE /api/perbaikan-judul/[id]
 * Allows a student to cancel their own title revision request if it's still 'menunggu'.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });

  try {
    const { id } = await params;
    const existing = await perbaikanJudulService.getById(id);

    if (!existing) {
      return NextResponse.json({ message: "Pengajuan tidak ditemukan", success: false }, { status: 404 });
    }

    // Security check: Only the owner can delete, and only if status is 'menunggu'
    // (Admins can also delete, but for now we focus on student cancellation)
    if (existing.mahasiswaId !== Number(user.id)) {
      return NextResponse.json({ message: "Forbidden", success: false }, { status: 403 });
    }

    if (existing.status !== "menunggu") {
      return NextResponse.json({ 
        message: "Pengajuan yang sudah diproses tidak dapat dibatalkan", 
        success: false 
      }, { status: 400 });
    }

    await perbaikanJudulService.delete(id);
    
    return NextResponse.json({ success: true, message: "Pengajuan berhasil dibatalkan" });
  } catch (error: any) {
    console.error("ERROR in DELETE /api/perbaikan-judul/[id]:", error.message);
    return NextResponse.json({ message: error.message, success: false }, { status: 500 });
  }
}
