export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helper";
import { supabaseAdmin } from "@/lib/supabase";
import path from "path";

const BUCKET = "skripsi_docs";

/**
 * POST /api/upload
 * Generic file upload handler.
 * Expected by frontend: { data: { fullUrl: string } }
 */
export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "general";

    if (!file) {
      return NextResponse.json({ message: "No file provided", success: false }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name) || ".pdf";
    const timestamp = Date.now();
    // Sanitize filename
    const safeName = file.name
      .replace(/[^a-zA-Z0-9_\-\s]/g, "")
      .replace(/\s+/g, "_")
      .toLowerCase()
      .substring(0, 50);
    
    const storagePath = `${folder}/${user.id}/${safeName}_${timestamp}${ext}`;

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) throw error;

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(data.path);

    // Aligned with frontend expectation in PerbaikanJudulFormModal.tsx:
    // uploadRes.data.data.fullUrl
    return NextResponse.json({
      success: true,
      data: {
        fullUrl: publicUrlData.publicUrl,
        path: data.path,
      }
    });
  } catch (error: any) {
    console.error("Upload Error:", error.message);
    return NextResponse.json({ message: error.message, success: false }, { status: 500 });
  }
}
