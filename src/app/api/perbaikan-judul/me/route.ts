import { NextResponse } from "next/server";
import { perbaikanJudulService } from "@/server/services/perbaikan-judul.service";
import { getAuthUser } from "@/lib/auth-helper";
import { getPaginationParams } from "@/utils/pagination";

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user || !user.id) {
      return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });
    }

    const { skip, limit } = getPaginationParams(request);
    
    // Fetching revisions for the current user (using their ID as student ID)
    const result = await perbaikanJudulService.getByMahasiswa(user.id, {
      skip,
      take: limit,
    });

    return NextResponse.json({ ...result, success: true });
  } catch (error: any) {
    console.error("ERROR in GET /api/perbaikan-judul/me:", error.message);
    return NextResponse.json({ message: error.message, success: false }, { status: 500 });
  }
}
