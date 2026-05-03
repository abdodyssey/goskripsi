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
    const data = await pendaftaranUjianService.submit(id);
    return NextResponse.json({ data, success: true, message: "Pendaftaran berhasil disubmit" });
  } catch (error: any) {
    const status = error instanceof HttpError ? error.statusCode : 500;
    return NextResponse.json({ message: error.message }, { status });
  }
}
