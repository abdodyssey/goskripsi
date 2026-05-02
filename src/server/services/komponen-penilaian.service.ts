import { prisma } from "@/lib/prisma";
import {
  CreateKomponenPenilaianInput,
  UpdateKomponenPenilaianInput,
} from "../schemas/komponen-penilaian.schema";

export class KomponenPenilaianService {
  async getAll() {
    return await prisma.komponenPenilaian.findMany({
      orderBy: { jenisUjianId: "asc" },
    });
  }

  async getById(id: string) {
    return await prisma.komponenPenilaian.findUnique({
      where: { id: Number(id) },
    });
  }

  async store(payload: CreateKomponenPenilaianInput) {
    return await prisma.komponenPenilaian.create({
      data: {
        jenisUjianId: Number(payload.jenis_ujian_id),
        kriteria: payload.kriteria,
      },
    });
  }

  async update(id: string, payload: UpdateKomponenPenilaianInput) {
    const dataUpdate: any = {};
    if (payload.jenis_ujian_id !== undefined)
      dataUpdate.jenisUjianId = payload.jenis_ujian_id
        ? Number(payload.jenis_ujian_id)
        : null;
    if (payload.kriteria !== undefined)
      dataUpdate.kriteria = payload.kriteria;

    return await prisma.komponenPenilaian.update({
      where: { id: Number(id) },
      data: dataUpdate,
    });
  }

  async delete(id: string) {
    return await prisma.komponenPenilaian.delete({
      where: { id: Number(id) },
    });
  }
}

export const komponenPenilaianService = new KomponenPenilaianService();
