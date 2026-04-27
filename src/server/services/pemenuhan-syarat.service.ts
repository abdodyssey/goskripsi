import { prisma } from "@/lib/prisma";
import {
  CreatePemenuhanSyaratInput,
  UpdatePemenuhanSyaratInput,
} from "../schemas/pemenuhan-syarat.schema";

export class PemenuhanSyaratService {
  async getAll() {
    return await prisma.pemenuhanSyarat.findMany();
  }

  async getById(id: string) {
    const [pendaftaranUjianId, syaratId] = id.split("_");
    return await prisma.pemenuhanSyarat.findUnique({
      where: {
        pendaftaranUjianId_syaratId: {
          pendaftaranUjianId: Number(pendaftaranUjianId),
          syaratId: Number(syaratId),
        },
      },
    });
  }

  async store(payload: CreatePemenuhanSyaratInput) {
    console.log(payload);
    return await prisma.pemenuhanSyarat.create({
      data: {
        pendaftaranUjianId: Number(payload.pendaftaran_ujian_id),
        syaratId: Number(payload.syarat_id),
        terpenuhi:
          payload.status === "terverifikasi" ||
          payload.status === "terpenuhi" ||
          (payload as any).terpenuhi,
        fileBukti: payload.file_path,
        keterangan: payload.keterangan || null,
      },
    });
  }

  async update(id: string, payload: UpdatePemenuhanSyaratInput) {
    const dataUpdate: any = {};
    if (payload.pendaftaran_ujian_id !== undefined)
      dataUpdate.pendaftaranUjianId = payload.pendaftaran_ujian_id
        ? Number(payload.pendaftaran_ujian_id)
        : null;
    if (payload.syarat_id !== undefined)
      dataUpdate.syaratId = payload.syarat_id
        ? Number(payload.syarat_id)
        : null;
    if (payload.status !== undefined) {
      dataUpdate.terpenuhi =
        payload.status === "terverifikasi" ||
        payload.status === "terpenuhi" ||
        (payload as any).terpenuhi;
    }
    if (payload.file_path !== undefined)
      dataUpdate.fileBukti = payload.file_path;
    if (payload.keterangan !== undefined)
      dataUpdate.keterangan = payload.keterangan;

    const [pendaftaranUjianId, syaratId] = id.split("_");
    return await prisma.pemenuhanSyarat.update({
      where: {
        pendaftaranUjianId_syaratId: {
          pendaftaranUjianId: Number(pendaftaranUjianId),
          syaratId: Number(syaratId),
        },
      },
      data: dataUpdate,
    });
  }

  async delete(id: string) {
    const [pendaftaranUjianId, syaratId] = id.split("_");
    return await prisma.pemenuhanSyarat.delete({
      where: {
        pendaftaranUjianId_syaratId: {
          pendaftaranUjianId: Number(pendaftaranUjianId),
          syaratId: Number(syaratId),
        },
      },
    });
  }
}

export const pemenuhanSyaratService = new PemenuhanSyaratService();
