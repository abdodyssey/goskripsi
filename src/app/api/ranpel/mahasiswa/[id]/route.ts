export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { ranpelService } from "@/server/services/ranpel.service";
import { getAuthUser } from "@/lib/auth-helper";
import { getPaginationParams } from "@/utils/pagination";

/**
 * GET /api/ranpel/mahasiswa/[id]
 * Fetches all research proposals (ranpel) for a specific student.
 * Updated for Next.js 16 (Turbopack) with async params support.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });

    const { id } = await params; // Await params for Next.js 16
    const { skip, limit } = getPaginationParams(request);

    const result = await ranpelService.getPengajuanByMahasiswa({
      mahasiswaId: id,
      skip,
      take: limit,
    });

    return NextResponse.json({ ...result, success: true });
  } catch (error: any) {
    console.error("ERROR in GET /api/ranpel/mahasiswa/[id]:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });

    return NextResponse.json({ 
      message: error.message || "Unknown Error", 
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined 
    }, { status: 500 });
  }
}

/**
 * POST /api/ranpel/mahasiswa/[id]
 * Submits a new research proposal for a specific student.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });

    const { id } = await params; // Await params for Next.js 16
    const body = await request.json();
    
    const data = await ranpelService.storeByMahasiswa(body, id);
    return NextResponse.json({ data, success: true });
  } catch (error: any) {
    console.error("ERROR in POST /api/ranpel/mahasiswa/[id]:", error.message);
    return NextResponse.json({ message: error.message, success: false }, { status: 500 });
  }
}
