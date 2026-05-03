export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { pendaftaranUjianService } from "@/server/services/pendaftaran-ujian.service";
import { getAuthUser } from "@/lib/auth-helper";
import { HttpError } from "@/utils/http-error";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const formData = await request.formData();
    
    const berkasFiles = formData.getAll("berkas") as File[];
    const filesToUpload = await Promise.all(
      berkasFiles.map(async (file) => ({
        buffer: Buffer.from(await file.arrayBuffer()),
        originalname: file.name,
        mimetype: file.type,
        size: file.size,
      }))
    );

    const data = await pendaftaranUjianService.uploadRevisi(id, filesToUpload);
    return NextResponse.json({ data, success: true, message: "Revisi berhasil diupload" });
  } catch (error: any) {
    const status = error instanceof HttpError ? error.statusCode : 500;
    return NextResponse.json({ message: error.message }, { status });
  }
}
