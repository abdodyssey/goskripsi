import { prisma } from "@/lib/prisma";
import { createPaginationMeta } from "@/utils/pagination";

export class PerbaikanJudulService {
  async getAll(params: { skip?: number; take?: number } = {}) {
    const { skip = 0, take = 10 } = params;
    
    const [list, total] = await Promise.all([
      prisma.perbaikanJudul.findMany({
        skip,
        take,
        include: {
          mahasiswa: {
            include: {
              user: { select: { id: true, nama: true, email: true } }
            }
          }
        },
        orderBy: { tanggalPengajuan: 'desc' }
      }),
      prisma.perbaikanJudul.count()
    ]);

    return {
      data: list,
      meta: createPaginationMeta(total, Math.floor(skip / take) + 1, take)
    };
  }

  async getByMahasiswa(mahasiswaId: string, params: { skip?: number; take?: number } = {}) {
    const { skip = 0, take = 10 } = params;
    
    if (!mahasiswaId || isNaN(Number(mahasiswaId))) {
      return { data: [], meta: createPaginationMeta(0, 1, take) };
    }

    const where = { mahasiswaId: Number(mahasiswaId) };

    const [list, total] = await Promise.all([
      prisma.perbaikanJudul.findMany({
        where,
        skip,
        take,
        include: {
          mahasiswa: {
            include: {
              user: { select: { id: true, nama: true, email: true } }
            }
          }
        },
        orderBy: { tanggalPengajuan: 'desc' }
      }),
      prisma.perbaikanJudul.count({ where })
    ]);

    return {
      data: list,
      meta: createPaginationMeta(total, Math.floor(skip / take) + 1, take)
    };
  }

  async getById(id: string) {
    if (!id || isNaN(Number(id))) return null;
    return await prisma.perbaikanJudul.findUnique({
      where: { id: Number(id) },
      include: {
        mahasiswa: {
          include: {
            user: { select: { id: true, nama: true } }
          }
        }
      }
    });
  }

  async store(payload: {
    mahasiswa_id: string;
    judul_lama: string;
    judul_baru: string;
    file_surat: string;
  }) {
    return await prisma.perbaikanJudul.create({
      data: {
        mahasiswaId: Number(payload.mahasiswa_id),
        judulLama: payload.judul_lama,
        judulBaru: payload.judul_baru,
        fileSurat: payload.file_surat,
        status: 'menunggu',
        tanggalPengajuan: new Date()
      },
      include: {
        mahasiswa: {
          include: {
            user: { select: { id: true, nama: true } }
          }
        }
      }
    });
  }

  async delete(id: string) {
    if (!id || isNaN(Number(id))) return null;
    return await prisma.perbaikanJudul.delete({
      where: { id: Number(id) }
    });
  }
}

export const perbaikanJudulService = new PerbaikanJudulService();
