import { NextResponse } from "next/server";
import { pendaftaranUjianService } from "@/server/services/pendaftaran-ujian.service";
import { getAuthUser } from "@/lib/auth-helper";
import { HttpError } from "@/utils/http-error";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { status, keterangan } = await request.json();
    const data = await pendaftaranUjianService.review(id, status, keterangan);
    return NextResponse.json({ data, success: true });
  } catch (error: any) {
    const statusCode = error instanceof HttpError ? error.statusCode : 500;
    return NextResponse.json({ message: error.message }, { status: statusCode });
  }
}
