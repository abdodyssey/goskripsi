export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { mahasiswaService } from "@/server/services/mahasiswa.service";
import { getAuthUser } from "@/lib/auth-helper";
import { authService } from "@/server/services/auth.service";
import { getPaginationParams } from "@/utils/pagination";

/**
 * GET /api/mahasiswa
 * Fetches a list of students with role-based filtering.
 * If user_id is provided, it filters students mentored by that user (for Dosen).
 * Defaults to the current user's identity if they are a Dosen.
 */
export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized", success: false },
      { status: 401 },
    );
  }

  const { skip, limit } = getPaginationParams(request);
  const searchParams = new URL(request.url).searchParams;
  const userId = searchParams.get("user_id");

  try {
    // Get roles of the authenticated user to determine filtering logic
    const roles = await authService.getUserRoles(user.id);

    const result = await mahasiswaService.getAll({
      // Default to current user's ID if no specific user_id is requested
      userId: userId || user.id,
      roles,
      prodiId: user.prodiId,
      skip,
      take: limit,
    });

    return NextResponse.json({ ...result, success: true });
  } catch (error: any) {
    console.error("ERROR in GET /api/mahasiswa:", error.message);
    return NextResponse.json(
      { message: error.message || "Internal Server Error", success: false },
      { status: 500 },
    );
  }
}
