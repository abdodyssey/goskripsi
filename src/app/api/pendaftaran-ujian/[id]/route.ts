import { NextResponse } from "next/server";
import { pendaftaranUjianService } from "@/server/services/pendaftaran-ujian.service";
import { getAuthUser } from "@/lib/auth-helper";
import { HttpError } from "@/utils/http-error";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const data = await pendaftaranUjianService.getById(id);
    if (!data) return NextResponse.json({ message: "Pendaftaran tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ data, success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await pendaftaranUjianService.delete(id);
    return NextResponse.json({ success: true, message: "Pendaftaran berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const formData = await request.formData();
    
    const payload = {
      jenis_ujian_id: formData.get("jenis_ujian_id") as string,
      ranpel_id: formData.get("ranpel_id") as string,
      keterangan: formData.get("keterangan") as string,
      status: formData.get("status") as string,
    };

    const berkasFiles = formData.getAll("berkas") as File[];
    const filesToUpload = await Promise.all(
      berkasFiles.map(async (file) => ({
        buffer: Buffer.from(await file.arrayBuffer()),
        originalname: file.name,
        mimetype: file.type,
        size: file.size,
      }))
    );

    const data = await pendaftaranUjianService.update(id, payload as any, filesToUpload);
    return NextResponse.json({ data, success: true });
  } catch (error: any) {
    const status = error instanceof HttpError ? error.statusCode : 500;
    return NextResponse.json({ message: error.message }, { status });
  }
}
