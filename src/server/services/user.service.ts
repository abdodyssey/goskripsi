import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createPaginationMeta } from "@/utils/pagination";

export class UserService {
  async getAll(
    params: {
      skip?: number;
      take?: number;
      search?: string;
      prodiId?: number | null;
      roles?: string[];
    } = {},
  ) {
    const { skip = 0, take = 10, search, prodiId, roles = [] } = params;

    const where: any = {};

    if (search) {
      where.OR = [
        { nama: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // If user is admin/kaprodi/sekprodi (but not superadmin) with a prodiId, filter by user's prodi
    if (
      (roles.includes("admin") ||
        roles.includes("kaprodi") ||
        roles.includes("sekprodi")) &&
      !roles.includes("superadmin") &&
      prodiId
    ) {
      where.prodiId = prodiId;
    }

    const [list, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        include: { role: true, prodi: true },
        orderBy: { id: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: list.map((u) => ({
        id: u.id,
        username: u.username,
        nama: u.nama,
        email: u.email,
        role: u.role.name,
        roleId: u.roleId,
        status: u.status,
        prodiId: u.prodiId,
        prodiName: u.prodi?.namaProdi || null,
      })),
      meta: createPaginationMeta(total, Math.floor(skip / take) + 1, take),
    };
  }

  async getRoles() {
    return await prisma.role.findMany({
      orderBy: { id: "asc" },
    });
  }

  async store(payload: any) {
    const hashedPassword = await bcrypt.hash(
      payload.password || payload.username,
      10,
    );

    try {
      return await prisma.user.create({
        data: {
          username: payload.username,
          password: hashedPassword,
          nama: payload.nama,
          email: payload.email,
          roleId: Number(payload.role_id),
          status: payload.status || undefined,
          prodiId: payload.prodi_id ? Number(payload.prodi_id) : undefined,
        },
        include: { role: true, prodi: true },
      });
    } catch (error: any) {
      if (error.code === "P2002") {
        const target = error.meta?.target || [];
        if (target.includes("email")) throw new Error("Email sudah digunakan");
        if (target.includes("username"))
          throw new Error("Username sudah digunakan");
      }
      throw error;
    }
  }

  async update(id: string, payload: any) {
    const data: any = {
      username: payload.username,
      nama: payload.nama,
      email: payload.email,
      roleId: Number(payload.role_id),
      status: payload.status,
      prodiId: payload.prodi_id ? Number(payload.prodi_id) : null,
    };

    if (payload.password) {
      data.password = await bcrypt.hash(payload.password, 10);
    }

    try {
      return await prisma.user.update({
        where: { id: Number(id) },
        data,
        include: { role: true, prodi: true },
      });
    } catch (error: any) {
      if (error.code === "P2002") {
        const target = error.meta?.target || [];
        if (target.includes("email")) throw new Error("Email sudah digunakan");
        if (target.includes("username"))
          throw new Error("Username sudah digunakan");
      }
      throw error;
    }
  }

  async delete(id: string) {
    const userId = Number(id);

    if (Number.isNaN(userId)) {
      throw new Error("ID user tidak valid");
    }

    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          dosen: { select: { id: true } },
          mahasiswa: { select: { id: true } },
        },
      });

      if (!user) {
        throw new Error("User tidak ditemukan");
      }

      if (user.dosen) {
        await tx.mahasiswa.updateMany({
          where: { dosenPa: userId },
          data: { dosenPa: null },
        });
        await tx.mahasiswa.updateMany({
          where: { pembimbing1: userId },
          data: { pembimbing1: null },
        });
        await tx.mahasiswa.updateMany({
          where: { pembimbing2: userId },
          data: { pembimbing2: null },
        });

        await tx.pengujiUjian.deleteMany({ where: { dosenId: userId } });
        await tx.penilaian.deleteMany({ where: { dosenId: userId } });
        await tx.dosen.delete({ where: { id: userId } });
      }

      if (user.mahasiswa) {
        const pendaftaranIds = (
          await tx.pendaftaranUjian.findMany({
            where: { mahasiswaId: userId },
            select: { id: true },
          })
        ).map((item) => item.id);

        if (pendaftaranIds.length > 0) {
          const ujianIds = (
            await tx.ujian.findMany({
              where: { pendaftaranUjianId: { in: pendaftaranIds } },
              select: { id: true },
            })
          ).map((item) => item.id);

          if (ujianIds.length > 0) {
            await tx.pengujiUjian.deleteMany({
              where: { ujianId: { in: ujianIds } },
            });
            await tx.penilaian.deleteMany({
              where: { ujianId: { in: ujianIds } },
            });
            await tx.ujian.deleteMany({ where: { id: { in: ujianIds } } });
          }

          await tx.pemenuhanSyarat.deleteMany({
            where: { pendaftaranUjianId: { in: pendaftaranIds } },
          });
          await tx.pendaftaranUjian.deleteMany({
            where: { id: { in: pendaftaranIds } },
          });
        }

        const rancanganIds = (
          await tx.rancanganPenelitian.findMany({
            where: { mahasiswaId: userId },
            select: { id: true },
          })
        ).map((item) => item.id);

        if (rancanganIds.length > 0) {
          await tx.pengajuanRancanganPenelitian.deleteMany({
            where: { rancanganPenelitianId: { in: rancanganIds } },
          });
          await tx.rancanganPenelitian.deleteMany({
            where: { id: { in: rancanganIds } },
          });
        }

        await tx.pengajuanRancanganPenelitian.deleteMany({
          where: { mahasiswaId: userId },
        });
        await tx.perbaikanJudul.deleteMany({ where: { mahasiswaId: userId } });
        await tx.dokumenMahasiswa.deleteMany({
          where: { mahasiswaId: userId },
        });
        await tx.mahasiswa.delete({ where: { id: userId } });
      }

      await tx.user.delete({ where: { id: userId } });

      return { success: true };
    });
  }
}

export const userService = new UserService();
