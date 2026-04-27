import { prisma } from "@/lib/prisma";
import {
  CreatePeminatanInput,
  UpdatePeminatanInput,
} from "../schemas/peminatan.schema";

export class PeminatanService {
  async getAll(prodiId?: string) {
    return await prisma.peminatan.findMany({
      where: prodiId ? { prodiId: Number(prodiId) } : {},
    });
  }

  async getById(id: string) {
    return await prisma.peminatan.findUnique({ where: { id: Number(id) } });
  }

  async store(payload: CreatePeminatanInput) {
    return await prisma.peminatan.create({
      data: {
        namaPeminatan: payload.nama_peminatan,
        prodiId: Number(payload.prodi_id),
      },
    });
  }

  async update(id: string, payload: UpdatePeminatanInput) {
    const dataUpdate: any = {};
    if (payload.nama_peminatan !== undefined)
      dataUpdate.namaPeminatan = payload.nama_peminatan;
    if (payload.prodi_id !== undefined)
      dataUpdate.prodiId = payload.prodi_id ? Number(payload.prodi_id) : null;

    return await prisma.peminatan.update({
      where: { id: Number(id) },
      data: dataUpdate,
    });
  }

  async delete(id: string) {
    return await prisma.peminatan.delete({ where: { id: Number(id) } });
  }
}

export const peminatanService = new PeminatanService();
