import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { createPaginationMeta } from "@/utils/pagination";

export class UserService {
  async getAll(params: { skip?: number; take?: number; search?: string } = {}) {
    const { skip = 0, take = 10, search } = params;

    const where: any = {
      // Exclude 'mahasiswa' role from the user management list as requested
      role: {
        name: {
          not: 'mahasiswa'
        }
      }
    };
    
    if (search) {
      where.AND = [
        {
          OR: [
            { nama: { contains: search, mode: 'insensitive' } },
            { username: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ]
        }
      ];
    }

    const [list, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        include: { role: true },
        orderBy: { id: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: list.map(u => ({
        id: u.id,
        username: u.username,
        nama: u.nama,
        email: u.email,
        role: u.role.name,
        roleId: u.roleId,
        createdAt: u.createdAt,
      })),
      meta: createPaginationMeta(total, Math.floor(skip / take) + 1, take),
    };
  }

  async getRoles() {
    return await prisma.role.findMany({
      orderBy: { id: 'asc' }
    });
  }

  async store(payload: any) {
    const hashedPassword = await bcrypt.hash(payload.password || payload.username, 10);
    
    try {
      return await prisma.user.create({
        data: {
          username: payload.username,
          password: hashedPassword,
          nama: payload.nama,
          email: payload.email,
          roleId: Number(payload.role_id),
        },
        include: { role: true }
      });
    } catch (error: any) {
      if (error.code === "P2002") {
        const target = error.meta?.target || [];
        if (target.includes("email")) throw new Error("Email sudah digunakan");
        if (target.includes("username")) throw new Error("Username sudah digunakan");
      }
      throw error;
    }
  }

  async update(id: string, payload: any) {
    const data: any = {
      nama: payload.nama,
      email: payload.email,
      roleId: Number(payload.role_id),
    };

    if (payload.password) {
      data.password = await bcrypt.hash(payload.password, 10);
    }

    try {
      return await prisma.user.update({
        where: { id: Number(id) },
        data,
        include: { role: true }
      });
    } catch (error: any) {
      if (error.code === "P2002") {
        const target = error.meta?.target || [];
        if (target.includes("email")) throw new Error("Email sudah digunakan");
        if (target.includes("username")) throw new Error("Username sudah digunakan");
      }
      throw error;
    }
  }

  async delete(id: string) {
    return await prisma.user.delete({
      where: { id: Number(id) }
    });
  }
}

export const userService = new UserService();
