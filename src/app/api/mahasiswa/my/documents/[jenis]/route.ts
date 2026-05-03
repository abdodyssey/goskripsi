export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { mahasiswaService } from "@/server/services/mahasiswa.service";
import { getAuthUser } from "@/lib/auth-helper";

/**
 * DELETE /api/mahasiswa/my/documents/[jenis]
 * Deletes a specific document of the logged-in student.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ jenis: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });

  try {
    const { jenis } = await params;
    await mahasiswaService.deleteDocument(user.id, jenis);
    return NextResponse.json({ message: "Document deleted successfully", success: true });
  } catch (error: any) {
    const { jenis: jenisLog } = await params;
    console.error(`ERROR in DELETE /api/mahasiswa/my/documents/${jenisLog}:`, error.message);
    return NextResponse.json({ message: error.message, success: false }, { status: 500 });
  }
}
