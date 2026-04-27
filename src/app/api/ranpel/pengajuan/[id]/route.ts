import { NextResponse } from "next/server";
import { ranpelService } from "@/server/services/ranpel.service";
import { getAuthUser } from "@/lib/auth-helper";

/**
 * GET /api/ranpel/pengajuan/[id]
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });

  try {
    const { id } = await params;
    const data = await ranpelService.getPengajuanById(id);
    if (!data) return NextResponse.json({ message: "Pengajuan tidak ditemukan", success: false }, { status: 404 });
    return NextResponse.json({ data, success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message, success: false }, { status: 500 });
  }
}

/**
 * PUT /api/ranpel/pengajuan/[id]
 * Updates the review status and comments of a research proposal submission.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const result = await ranpelService.updatePengajuan(id, body);
    return NextResponse.json({ data: result, success: true, message: "Pengajuan berhasil diperbarui" });
  } catch (error: any) {
    console.error(`ERROR in PUT /api/ranpel/pengajuan/[id]:`, error.message);
    return NextResponse.json({ message: error.message, success: false }, { status: 500 });
  }
}

/**
 * DELETE /api/ranpel/pengajuan/[id]
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });

  try {
    const { id } = await params;
    await ranpelService.deletePengajuan(id);
    return NextResponse.json({ success: true, message: "Pengajuan berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message, success: false }, { status: 500 });
  }
}
