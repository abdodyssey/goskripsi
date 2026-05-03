export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { userService } from "@/server/services/user.service";
import { getAuthUser } from "@/lib/auth-helper";

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const roles = await userService.getRoles();
    return NextResponse.json({ data: roles, success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
