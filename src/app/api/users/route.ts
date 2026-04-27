import { NextResponse } from "next/server";
import { userService } from "@/server/services/user.service";
import { getAuthUser } from "@/lib/auth-helper";
import { getPaginationParams } from "@/utils/pagination";

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  
  // Security: Only superadmin can list users
  if (!user.roles.includes("superadmin")) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { skip, limit } = getPaginationParams(request);
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || undefined;

  try {
    const result = await userService.getAll({ skip, take: limit, search });
    return NextResponse.json({ ...result, success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  
  if (!user.roles.includes("superadmin")) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = await userService.store(body);
    return NextResponse.json({ data, success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
