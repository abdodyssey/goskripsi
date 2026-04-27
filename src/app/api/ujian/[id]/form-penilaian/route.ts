import { NextResponse } from "next/server";
import { ujianService } from "@/server/services/ujian.service";
import { getAuthUser } from "@/lib/auth-helper";

/**
 * GET /api/ujian/[id]/form-penilaian
 * Provides the full grading context, including the current lecturer's form,
 * all submitted scores from the examiner team, and session status.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });

  try {
    const { id } = await params;
    // Pass user.id to distinguish between the current examiner's sheet and others
    const data = await ujianService.getFormPenilaian(id, user.id);
    return NextResponse.json({ data, success: true });
  } catch (error: any) {
    console.error("ERROR in GET /api/ujian/[id]/form-penilaian:", error.message);
    return NextResponse.json({ message: error.message, success: false }, { status: error.status || 500 });
  }
}
