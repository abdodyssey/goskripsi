import { prisma } from "@/lib/prisma";
import { CreateProdiInput, UpdateProdiInput } from "../schemas/prodi.schema";

export class ProdiService {
  async getAll() {
    return await prisma.prodi.findMany();
  }

  async getById(id: string) {
    return await prisma.prodi.findUnique({ where: { id: Number(id) } });
  }

  async store(payload: CreateProdiInput) {
    return await prisma.prodi.create({
      data: {
        namaProdi: payload.nama_prodi,
        fakultasId: Number(payload.fakultas_id),
      },
    });
  }

  async update(id: string, payload: UpdateProdiInput) {
    const dataUpdate: any = {};
    if (payload.nama_prodi !== undefined)
      dataUpdate.namaProdi = payload.nama_prodi;
    if (payload.fakultas_id !== undefined)
      dataUpdate.fakultasId = payload.fakultas_id
        ? Number(payload.fakultas_id)
        : null;

    return await prisma.prodi.update({
      where: { id: Number(id) },
      data: dataUpdate,
    });
  }

  async delete(id: string) {
    return await prisma.prodi.delete({ where: { id: Number(id) } });
  }
}

export const prodiService = new ProdiService();
