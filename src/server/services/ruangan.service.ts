import { prisma } from "@/lib/prisma";
import {
  CreateRuanganInput,
  UpdateRuanganInput,
} from "../schemas/ruangan.schema";

export class RuanganService {
  async getAll() {
    const list = await prisma.ruangan.findMany();
    return list.map((r) => this.transformRuangan(r));
  }

  async getById(id: string) {
    const r = await prisma.ruangan.findUnique({ where: { id: Number(id) } });
    return this.transformRuangan(r);
  }

  async store(payload: CreateRuanganInput) {
    const result = await prisma.ruangan.create({
      data: {
        namaRuangan: payload.nama_ruangan,
        deskripsi: payload.deskripsi,
        prodiId: Number(payload.prodi_id),
      },
    });
    return this.transformRuangan(result);
  }

  async update(id: string, payload: UpdateRuanganInput) {
    const dataUpdate: any = {};
    if (payload.nama_ruangan !== undefined)
      dataUpdate.namaRuangan = payload.nama_ruangan;
    if (payload.deskripsi !== undefined)
      dataUpdate.deskripsi = payload.deskripsi;
    if (payload.prodi_id !== undefined)
      dataUpdate.prodiId = payload.prodi_id ? Number(payload.prodi_id) : null;

    const result = await prisma.ruangan.update({
      where: { id: Number(id) },
      data: dataUpdate,
    });
    return this.transformRuangan(result);
  }

  async delete(id: string) {
    return await prisma.ruangan.delete({ where: { id: Number(id) } });
  }

  private transformRuangan(r: any) {
    if (!r) return null;
    return {
      id: r.id,
      namaRuangan: r.namaRuangan,
      deskripsi: r.deskripsi,
      prodiId: r.prodiId,
    };
  }
}

export const ruanganService = new RuanganService();
