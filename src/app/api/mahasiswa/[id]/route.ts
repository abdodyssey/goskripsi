export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { mahasiswaService } from "@/server/services/mahasiswa.service";
import { getAuthUser } from "@/lib/auth-helper";

// GET /api/mahasiswa/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const data = await mahasiswaService.getById(id);
    return NextResponse.json({ data, success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }
}

// PATCH /api/mahasiswa/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const data = await mahasiswaService.update(id, body);
    return NextResponse.json({ data, success: true, message: "Mahasiswa berhasil diupdate" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// DELETE /api/mahasiswa/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await mahasiswaService.delete(id);
    return NextResponse.json({ success: true, message: "Mahasiswa berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
