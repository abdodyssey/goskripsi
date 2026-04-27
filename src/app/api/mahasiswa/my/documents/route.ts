import { NextResponse } from "next/server";
import { mahasiswaService } from "@/server/services/mahasiswa.service";
import { getAuthUser } from "@/lib/auth-helper";

/**
 * GET /api/mahasiswa/my/documents
 * Returns a list of all documents uploaded by the currently logged-in student.
 */
export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });

  try {
    // Inject current student's ID from session
    const data = await mahasiswaService.getDocuments(user.id);
    return NextResponse.json({ data, success: true });
  } catch (error: any) {
    console.error("ERROR in GET /api/mahasiswa/my/documents:", error.message);
    return NextResponse.json({ message: error.message, success: false }, { status: 500 });
  }
}

/**
 * POST /api/mahasiswa/my/documents
 * Upserts a student document (KTM, Transkrip, etc.)
 */
export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });

  try {
    const payload = await request.json();
    const data = await mahasiswaService.uploadDocument(user.id, payload);
    return NextResponse.json({ data, success: true });
  } catch (error: any) {
    console.error("ERROR in POST /api/mahasiswa/my/documents:", error.message);
    return NextResponse.json({ message: error.message, success: false }, { status: 500 });
  }
}
