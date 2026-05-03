export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { ujianService } from "@/server/services/ujian.service";
import { getAuthUser } from "@/lib/auth-helper";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });

  try {
    const data = await ujianService.getKeputusanOptions();
    return NextResponse.json({ data, success: true });
  } catch (error: any) {
    console.error("ERROR in GET /api/ujian/[id]/keputusan-options:", error.message);
    return NextResponse.json({ message: error.message, success: false }, { status: 500 });
  }
}
