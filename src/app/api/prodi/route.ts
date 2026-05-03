export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prodiService } from "@/server/services/prodi.service";
import { getAuthUser } from "@/lib/auth-helper";

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const data = await prodiService.getAll();
    return NextResponse.json({ data, success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
