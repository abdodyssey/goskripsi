export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { ranpelService } from "@/server/services/ranpel.service";
import { getAuthUser } from "@/lib/auth-helper";
import { authService } from "@/server/services/auth.service";
import { getPaginationParams } from "@/utils/pagination";

/**
 * GET /api/ranpel/pengajuan
 * Fetches all research proposals (pengajuan ranpel) with role-based filtering.
 * Created to resolve persistent 404 errors in the management dashboard.
 */
export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });

  const { skip, limit } = getPaginationParams(request);

  try {
    const roles = await authService.getUserRoles(user.id);
    const result = await ranpelService.getAllPengajuan({
      userId: user.id,
      roles,
      skip,
      take: limit,
    });
    return NextResponse.json({ ...result, success: true });
  } catch (error: any) {
    console.error("ERROR in GET /api/ranpel/pengajuan:", error.message);
    return NextResponse.json({ message: error.message, success: false }, { status: 500 });
  }
}
