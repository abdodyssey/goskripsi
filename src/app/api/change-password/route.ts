export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { authService } from "@/server/services/auth.service";
import { getAuthUser } from "@/lib/auth-helper";

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized", success: false },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const result = await authService.changePassword(user.id, body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal Server Error", success: false },
      { status: 500 },
    );
  }
}
