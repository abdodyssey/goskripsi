export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { ujianService } from "@/server/services/ujian.service";
import { getAuthUser } from "@/lib/auth-helper";
import { HttpError } from "@/utils/http-error";
import { getPaginationParams } from "@/utils/pagination";

import { authService } from "@/server/services/auth.service";

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { skip, limit } = getPaginationParams(request);

  try {
    const roles = await authService.getUserRoles(user.id);
    const result = await ujianService.getAll({
      skip,
      take: limit,
      prodiId: user.prodiId,
      roles,
      userId: user.id,
    });
    return NextResponse.json({ ...result, success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
