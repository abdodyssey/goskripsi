export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { ujianService } from "@/server/services/ujian.service";
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
    const data = await ujianService.getSchedulingFormData(Number(id));
    return NextResponse.json({ data, success: true });
  } catch (error: any) {
    const status = error instanceof HttpError ? error.statusCode : 500;
    return NextResponse.json({ message: error.message }, { status });
  }
}
