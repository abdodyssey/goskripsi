import { prisma } from "@/lib/prisma";
import {
  CreatePenilaianInput,
  UpdatePenilaianInput,
} from "../schemas/penilaian.schema";
import { ujianService } from "./ujian.service";

export class PenilaianService {
  async getAll() {
    return await prisma.penilaian.findMany({
      include: {
        ujian: true,
        dosen: true,
        komponenPenilaian: true,
      },
    });
  }

  async getById(id: string) {
    if (!id) return null;
    const [ujianId, dosenId, komponenPenilaianId] = id.split("_");
    if (isNaN(Number(ujianId)) || isNaN(Number(dosenId)) || isNaN(Number(komponenPenilaianId))) return null;

    return await prisma.penilaian.findUnique({
      where: {
        ujianId_dosenId_komponenPenilaianId: {
          ujianId: Number(ujianId),
          dosenId: Number(dosenId),
          komponenPenilaianId: Number(komponenPenilaianId),
        },
      },
      include: {
        ujian: true,
        dosen: true,
        komponenPenilaian: true,
      },
    });
  }

  async store(payload: CreatePenilaianInput) {
    if ("data" in payload && Array.isArray(payload.data)) {
      // ✅ BATCH INSERT
      return await prisma.$transaction(async (tx) => {
        const createData = payload.data.map((item: any) => ({
          ujianId: Number(item.ujian_id),
          dosenId: Number(item.dosen_id),
          komponenPenilaianId: Number(item.komponen_penilaian_id),
          nilai: item.nilai,
          komentar: item.komentar || null,
        }));

        await tx.penilaian.createMany({ data: createData });

        const ujianIds = [
          ...new Set(payload.data.map((item: any) => Number(item.ujian_id))),
        ];
        for (const uId of ujianIds) {
          await ujianService.hitungNilaiAkhir(Number(uId));
        }

        if (ujianIds.length === 0) return [];

        return await tx.penilaian.findMany({
          where: {
            ujianId: { in: ujianIds.map((uId) => Number(uId)) },
          },
        });
      });
    }

    // ✅ SINGLE INSERT
    return await prisma.$transaction(async (tx) => {
      if (!("ujian_id" in payload)) throw new Error("Invalid payload");

      const penilaian = await tx.penilaian.create({
        data: {
          ujianId: Number(payload.ujian_id),
          dosenId: Number(payload.dosen_id),
          komponenPenilaianId: Number(payload.komponen_penilaian_id),
          nilai: payload.nilai,
          komentar: payload.komentar || null,
        },
      });

      await ujianService.hitungNilaiAkhir(penilaian.ujianId);
      return penilaian;
    });
  }

  async update(id: string | undefined, payload: UpdatePenilaianInput) {
    if ("data" in payload && Array.isArray(payload.data)) {
      // ✅ BATCH UPDATE
      return await prisma.$transaction(async (tx) => {
        const ujianIds = new Set<number>();

        for (const item of payload.data) {
          const [uId, dId, kId] =
            typeof (item as any).id === "string"
              ? (item as any).id.split("_")
              : [
                  String((item as any).ujian_id),
                  String((item as any).dosen_id),
                  String((item as any).komponen_penilaian_id),
                ];

          const rec = await tx.penilaian.update({
            where: {
              ujianId_dosenId_komponenPenilaianId: {
                ujianId: Number(uId),
                dosenId: Number(dId),
                komponenPenilaianId: Number(kId),
              },
            },
            data: {
              nilai: item.nilai,
              komentar: item.komentar || null,
            },
          });
          ujianIds.add(rec.ujianId);
        }

        for (const uId of ujianIds) {
          await ujianService.hitungNilaiAkhir(uId);
        }

        return Array.from(ujianIds);
      });
    }

    // ✅ SINGLE UPDATE
    return await prisma.$transaction(async (tx) => {
      if (!id) throw new Error("ID parameter required for single update");
      const [uId, dId, kId] = id.split("_");

      const dataUpdate: any = { ...payload };
      delete dataUpdate.id; // Just in case
      dataUpdate.updated_at = new Date();

      const penilaian = await tx.penilaian.update({
        where: {
          ujianId_dosenId_komponenPenilaianId: {
            ujianId: Number(uId),
            dosenId: Number(dId),
            komponenPenilaianId: Number(kId),
          },
        },
        data: dataUpdate,
      });

      await ujianService.hitungNilaiAkhir(penilaian.ujianId);
      return penilaian;
    });
  }

  async delete(id: string) {
    return await prisma.$transaction(async (tx) => {
      const [uId, dId, kId] = id.split("_");

      const penilaian = await tx.penilaian.findUnique({
        where: {
          ujianId_dosenId_komponenPenilaianId: {
            ujianId: Number(uId),
            dosenId: Number(dId),
            komponenPenilaianId: Number(kId),
          },
        },
      });
      if (!penilaian) throw new Error("Penilaian tidak ditemukan");

      const ujianId = penilaian.ujianId;

      await tx.penilaian.delete({
        where: {
          ujianId_dosenId_komponenPenilaianId: {
            ujianId: Number(uId),
            dosenId: Number(dId),
            komponenPenilaianId: Number(kId),
          },
        },
      });
      await ujianService.hitungNilaiAkhir(ujianId);

      return true;
    });
  }
}

export const penilaianService = new PenilaianService();
