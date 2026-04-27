import { prisma } from "@/lib/prisma";
import {
  CreateKeputusanInput,
  UpdateKeputusanInput,
} from "../schemas/keputusan.schema";

export class KeputusanService {
  async getAll() {
    return await prisma.keputusan.findMany({
      include: {
        jenisUjian: true,
      },
    });
  }

  async getById(id: string | number) {
    return await prisma.keputusan.findUnique({
      where: { id: Number(id) },
      include: {
        jenisUjian: true,
      },
    });
  }

  async store(payload: CreateKeputusanInput) {
    return await prisma.keputusan.create({
      data: {
        kode: payload.kode,
        namaKeputusan: payload.nama_keputusan,
        jenisUjianId: payload.jenis_ujian_id
          ? Number(payload.jenis_ujian_id)
          : null,
        aktif: payload.aktif ?? true,
      },
    });
  }

  async update(id: string | number, payload: UpdateKeputusanInput) {
    const dataUpdate: any = {};
    if (payload.kode !== undefined) dataUpdate.kode = payload.kode;
    if (payload.nama_keputusan !== undefined)
      dataUpdate.namaKeputusan = payload.nama_keputusan;
    if (payload.jenis_ujian_id !== undefined)
      dataUpdate.jenisUjianId = payload.jenis_ujian_id
        ? Number(payload.jenis_ujian_id)
        : null;
    if (payload.aktif !== undefined) dataUpdate.aktif = payload.aktif;

    return await prisma.keputusan.update({
      where: { id: Number(id) },
      data: dataUpdate,
    });
  }

  async delete(id: string | number) {
    return await prisma.keputusan.delete({
      where: { id: Number(id) },
    });
  }
}

export const keputusanService = new KeputusanService();
