import { NextResponse } from "next/server";
import { authService } from "@/server/services/auth.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await authService.login(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal Server Error", success: false },
      { status: error.message.includes("kredensial") ? 401 : 500 },
    );
  }
}
