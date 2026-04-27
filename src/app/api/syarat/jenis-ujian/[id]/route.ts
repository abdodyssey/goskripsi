import { NextResponse } from "next/server";
import { syaratService } from "@/server/services/syarat.service";
import { getAuthUser } from "@/lib/auth-helper";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const data = await syaratService.getByJenisUjian(id);
    return NextResponse.json({ data, success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
