import { NextResponse } from "next/server";
import { userService } from "@/server/services/user.service";
import { getAuthUser } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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
    const { id } = await params;
    const body = await request.json();

    if (!user.roles.includes("superadmin")) {
      body.prodi_id = user.prodiId ? String(user.prodiId) : body.prodi_id;
    }

    const data = await userService.update(id, body);
    return NextResponse.json({ data, success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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
    const { id } = await params;

    if (!user.roles.includes("superadmin")) {
      const targetUser = await prisma.user.findUnique({
        where: { id: Number(id) },
        select: { prodiId: true },
      });
      if (targetUser && user.prodiId && targetUser.prodiId !== user.prodiId) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
    }

    await userService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    const message = error?.message || "Internal Server Error";

    if (message.includes("tidak valid")) {
      return NextResponse.json({ message }, { status: 400 });
    }

    if (message.includes("tidak ditemukan")) {
      return NextResponse.json({ message }, { status: 404 });
    }

    return NextResponse.json({ message }, { status: 500 });
  }
}
