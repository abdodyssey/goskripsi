export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { userService } from "@/server/services/user.service";
import { getAuthUser } from "@/lib/auth-helper";
import { getPaginationParams } from "@/utils/pagination";

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  // Security: Only superadmin or admin can list users
  if (
    !user.roles.includes("superadmin") &&
    !user.roles.includes("admin") &&
    !user.roles.includes("kaprodi") &&
    !user.roles.includes("sekprodi")
  ) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { skip, limit } = getPaginationParams(request);
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || undefined;

  try {
    const result = await userService.getAll({
      skip,
      take: limit,
      search,
      prodiId: user.prodiId,
      roles: user.roles,
    });
    return NextResponse.json({ ...result, success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  if (
    !user.roles.includes("superadmin") &&
    !user.roles.includes("admin") &&
    !user.roles.includes("kaprodi") &&
    !user.roles.includes("sekprodi")
  ) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();

    if (!user.roles.includes("superadmin")) {
      body.prodi_id = user.prodiId ? String(user.prodiId) : body.prodi_id;
    }

    const data = await userService.store(body);
    return NextResponse.json({ data, success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
