import { prisma } from "../utils/prisma";
import { CreateSyaratInput, UpdateSyaratInput } from "../schemas/syarat.schema";

export class SyaratService {
  async getAll() {
    return await prisma.syarat.findMany({ include: { jenisUjian: true } });
  }

  async getByJenisUjian(jenisUjianId: string) {
    const list = await prisma.syarat.findMany({
      where: { jenisUjianId: Number(jenisUjianId) },
      orderBy: [{ wajib: "desc" }, { id: "asc" }],
    });
    return list.map((s) => this.transformSyarat(s));
  }

  async getById(id: string) {
    return await prisma.syarat.findUnique({ where: { id: Number(id) } });
  }

  async store(payload: CreateSyaratInput) {
    const result = await prisma.syarat.create({
      data: {
        jenisUjianId: Number(payload.jenis_ujian_id),
        namaSyarat: payload.nama_syarat,
        deskripsi: payload.deskripsi || null,
        wajib: payload.wajib !== undefined ? payload.wajib : true,
      },
    });
    return this.transformSyarat(result);
  }

  async update(id: string, payload: UpdateSyaratInput) {
    const dataUpdate: any = {};
    if (payload.jenis_ujian_id !== undefined)
      dataUpdate.jenisUjianId = payload.jenis_ujian_id
        ? Number(payload.jenis_ujian_id)
        : null;
    if (payload.nama_syarat !== undefined)
      dataUpdate.namaSyarat = payload.nama_syarat;
    if (payload.deskripsi !== undefined)
      dataUpdate.deskripsi = payload.deskripsi;
    if (payload.wajib !== undefined) dataUpdate.wajib = payload.wajib;

    const result = await prisma.syarat.update({
      where: { id: Number(id) },
      data: dataUpdate,
    });
    return this.transformSyarat(result);
  }

  async delete(id: string) {
    return await prisma.syarat.delete({ where: { id: Number(id) } });
  }

  private transformSyarat(s: any) {
    if (!s) return null;
    return {
      id: s.id,
      jenisUjianId: s.jenisUjianId,
      namaSyarat: s.namaSyarat,
      deskripsi: s.deskripsi,
      wajib: s.wajib,
    };
  }
}

export const syaratService = new SyaratService();
