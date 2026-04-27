import { NextResponse } from "next/server";
import { ranpelService } from "@/server/services/ranpel.service";
import { getAuthUser } from "@/lib/auth-helper";
import { authService } from "@/server/services/auth.service";
import { getPaginationParams } from "@/utils/pagination";

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { page, limit, skip } = getPaginationParams(request);

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
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const data = await ranpelService.storeRanpel(body);
    return NextResponse.json({ data, success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
