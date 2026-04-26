import { StatusPengajuan } from '@prisma/client';
import { prisma } from '../utils/prisma';

export class PerbaikanJudulRepository {
  async create(data: {
    mahasiswaId: number;
    judulLama: string;
    judulBaru: string;
    fileSurat: string;
  }) {
    return prisma.perbaikanJudul.create({
      data: {
        mahasiswaId: data.mahasiswaId,
        judulLama: data.judulLama,
        judulBaru: data.judulBaru,
        fileSurat: data.fileSurat,
        status: 'menunggu',
      },
    });
  }

  async findAll() {
    return prisma.perbaikanJudul.findMany({
      include: {
        mahasiswa: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        tanggalPengajuan: 'desc',
      },
    });
  }

  async findByMahasiswaId(mahasiswaId: number) {
    return prisma.perbaikanJudul.findMany({
      where: { mahasiswaId },
      orderBy: {
        tanggalPengajuan: 'desc',
      },
    });
  }

  async findById(id: number) {
    return prisma.perbaikanJudul.findFirst({
      where: { id },
      include: {
        mahasiswa: true,
      },
    });
  }

  async updateStatus(
    id: number,
    data: {
      status: StatusPengajuan;
      catatanSekprodi?: string;
    }
  ) {
    return prisma.perbaikanJudul.update({
      where: { id },
      data: {
        status: data.status,
        catatanSekprodi: data.catatanSekprodi,
        tanggalReview: new Date(),
      },
    });
  }

  async updateMahasiswaTitle(mahasiswaId: number, newTitle: string) {
    // Usually title is in RancanganPenelitian.
    // We update the LATEST accepted RancanganPenelitian for this student.
    const latestRanpel = await prisma.rancanganPenelitian.findFirst({
      where: {
        mahasiswaId,
        pengajuanRancanganPenelitians: {
          some: {
            statusKaprodi: 'diterima',
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

    if (latestRanpel) {
      return prisma.rancanganPenelitian.update({
        where: { id: latestRanpel.id },
        data: { judulPenelitian: newTitle },
      });
    }
    return null;
  }
}
