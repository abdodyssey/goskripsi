export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { authService } from "@/server/services/auth.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await authService.login(body);
    return NextResponse.json(result);
  } catch (error: any) {
    const isAuthError = 
      error.message?.includes("Kredensial") || 
      error.message?.includes("User tidak ditemukan") ||
      error.message?.includes("salah");

    if (!isAuthError) {
      console.error("LOGIN_ERROR:", error);
    }

    return NextResponse.json(
      { 
        message: isAuthError ? "Username atau password salah" : (error.message || "Internal Server Error"), 
        success: false 
      },
      { status: isAuthError ? 401 : 500 },
    );
  }
}
