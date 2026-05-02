import { NextResponse } from "next/server";
import { pendaftaranUjianService } from "@/server/services/pendaftaran-ujian.service";
import { getAuthUser } from "@/lib/auth-helper";
import { HttpError } from "@/utils/http-error";
import { getPaginationParams } from "@/utils/pagination";

import { authService } from "@/server/services/auth.service";

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { skip, limit } = getPaginationParams(request);

  try {
    const roles = await authService.getUserRoles(user.id);
    const result = await pendaftaranUjianService.getAll({
      skip,
      take: limit,
      prodiId: user.prodiId,
      roles,
    });
    return NextResponse.json({ ...result, success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const formData = await request.formData();

    // Extract fields
    const payload = {
      mahasiswa_id: formData.get("mahasiswa_id") as string,
      ranpel_id: formData.get("ranpel_id") as string,
      jenis_ujian_id: formData.get("jenis_ujian_id") as string,
      keterangan: (formData.get("keterangan") as string) || "",
    };

    // Extract files (berkas[])
    const berkasFiles = formData.getAll("berkas") as File[];
    const filesToUpload = await Promise.all(
      berkasFiles.map(async (file) => ({
        buffer: Buffer.from(await file.arrayBuffer()),
        originalname: file.name,
        mimetype: file.type,
        size: file.size,
      })),
    );

    const data = await pendaftaranUjianService.store(
      payload as any,
      filesToUpload,
    );
    return NextResponse.json({ data, success: true });
  } catch (error: any) {
    const status = error instanceof HttpError ? error.statusCode : 500;
    return NextResponse.json({ message: error.message }, { status });
  }
}
