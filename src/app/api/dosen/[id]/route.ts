export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { dosenService } from "@/server/services/dosen.service";
import { getAuthUser } from "@/lib/auth-helper";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const data = await dosenService.getById(id);
    return NextResponse.json({ data, success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const data = await dosenService.update(id, body);
    return NextResponse.json({ data, success: true, message: "Dosen berhasil diupdate" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await dosenService.delete(id);
    return NextResponse.json({ success: true, message: "Dosen berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
