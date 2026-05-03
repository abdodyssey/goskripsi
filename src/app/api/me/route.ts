export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { authService } from "@/server/services/auth.service";
import { getAuthUser } from "@/lib/auth-helper";

/**
 * GET /api/me
 * Identifies the currently logged-in user and returns their full profile.
 * Standardized for Next.js 16 and Prisma v7.
 */
export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    
    if (!user || !user.id) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 },
      );
    }

    const profile = await authService.getProfile(user.id);
    
    if (!profile) {
      return NextResponse.json(
        { message: "Profile not found", success: false },
        { status: 404 },
      );
    }
    
    return NextResponse.json(profile);
  } catch (error: any) {
    console.error(`[API] /api/me error:`, error);

    return NextResponse.json(
      { 
        message: error.message || "Internal Server Error", 
        success: false,
        error: error.message
      },
      { status: 500 },
    );
  }
}
