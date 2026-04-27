import { prisma } from "@/lib/prisma";
import {
  CreateJenisUjianInput,
  UpdateJenisUjianInput,
} from "../schemas/jenis-ujian.schema";

export class JenisUjianService {
  async getAll() {
    const list = await prisma.jenisUjian.findMany();
    return list.map((j) => this.transformJenisUjian(j));
  }

  async getById(id: string) {
    const j = await prisma.jenisUjian.findUnique({ where: { id: Number(id) } });
    return this.transformJenisUjian(j);
  }

  async store(payload: CreateJenisUjianInput) {
    const result = await prisma.jenisUjian.create({
      data: {
        namaJenis: payload.nama_jenis,
        deskripsi: payload.deskripsi,
      },
    });
    return this.transformJenisUjian(result);
  }

  async update(id: string, payload: UpdateJenisUjianInput) {
    const dataUpdate: any = {};
    if (payload.nama_jenis !== undefined)
      dataUpdate.namaJenis = payload.nama_jenis;
    if (payload.deskripsi !== undefined)
      dataUpdate.deskripsi = payload.deskripsi;

    const result = await prisma.jenisUjian.update({
      where: { id: Number(id) },
      data: dataUpdate,
    });
    return this.transformJenisUjian(result);
  }

  async delete(id: string) {
    return await prisma.jenisUjian.delete({ where: { id: Number(id) } });
  }

  private transformJenisUjian(j: any) {
    if (!j) return null;
    return {
      id: j.id,
      namaJenis: j.namaJenis,
      deskripsi: j.deskripsi,
      aktif: j.aktif,
    };
  }
}

export const jenisUjianService = new JenisUjianService();
