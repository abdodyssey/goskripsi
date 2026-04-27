import { prisma } from "@/lib/prisma";
import {
  CreateMahasiswaInput,
  UpdateMahasiswaInput,
} from "../schemas/mahasiswa.schema";
import { Prisma } from "@prisma/client";
import { createPaginationMeta } from "@/utils/pagination";

const MAHASISWA_SELECT = {
  id: true,
  nim: true,
  noHp: true,
  alamat: true,
  prodiId: true,
  peminatanId: true,
  semester: true,
  ipk: true,
  status: true,
  angkatan: true,
  foto: true,
  urlTtd: true,
  prodi: { select: { id: true, namaProdi: true, fakultasId: true } },
  peminatan: { select: { id: true, namaPeminatan: true, prodiId: true } },
  user: { select: { id: true, email: true, nama: true } },
  pembimbing1Rel: {
    select: { id: true, user: { select: { nama: true } } },
  },
  pembimbing2Rel: {
    select: { id: true, user: { select: { nama: true } } },
  },
  dosenPaRel: {
    select: { id: true, user: { select: { nama: true } } },
  },
};

export class MahasiswaService {
  async getAll(params: { userId?: string; roles?: string[]; skip?: number; take?: number }) {
    const { userId, roles = [], skip = 0, take = 10 } = params;
    
    // Guard Clause for invalid ID
    if (userId && isNaN(Number(userId))) {
       return { data: [], meta: createPaginationMeta(0, 1, take) };
    }

    let whereClause: Prisma.MahasiswaWhereInput = {};

    if (userId) {
      const uId = Number(userId);
      const isDosen = roles.includes("dosen") || roles.includes("kaprodi") || roles.includes("sekprodi");
      
      if (isDosen) {
        // If the requester is a Dosen/Staff, show students they mentor/advise
        whereClause = {
          OR: [
            { dosenPa: uId },
            { pembimbing1: uId },
            { pembimbing2: uId },
          ],
        };
      } else if (roles.includes("mahasiswa")) {
        // If the requester is a student, show only their own record
        whereClause = { id: uId };
      }
      // Admins/Superadmins get all records (whereClause remains {})
    }

    const [list, total] = await Promise.all([
      prisma.mahasiswa.findMany({
        where: whereClause,
        skip,
        take,
        select: MAHASISWA_SELECT,
        orderBy: { id: "desc" },
        // @ts-ignore
        relationLoadStrategy: 'join',
      }),
      prisma.mahasiswa.count({ where: whereClause }),
    ]);

    return {
      data: list.map((m) => this.transformMahasiswa(m)),
      meta: createPaginationMeta(total, Math.floor(skip / take) + 1, take),
    };
  }

  async getById(id: string) {
    if (!id || isNaN(Number(id))) throw new Error("ID Mahasiswa tidak valid");

    const mahasiswa = await prisma.mahasiswa.findUnique({
      where: { id: Number(id) },
      select: MAHASISWA_SELECT,
      // @ts-ignore
      relationLoadStrategy: 'join',
    });

    if (!mahasiswa) throw new Error("Mahasiswa not found");
    return this.transformMahasiswa(mahasiswa);
  }

  async create(payload: CreateMahasiswaInput) {
    const result = await prisma.mahasiswa.create({
      data: {
        nim: payload.nim,
        noHp: payload.no_hp,
        alamat: payload.alamat,
        prodiId: Number(payload.prodi_id),
        peminatanId: payload.peminatan_id ? Number(payload.peminatan_id) : null,
        semester: payload.semester,
        ipk: new Prisma.Decimal(payload.ipk),
        dosenPa: payload.dosen_pa ? Number(payload.dosen_pa) : null,
        pembimbing1: payload.pembimbing_1 ? Number(payload.pembimbing_1) : null,
        pembimbing2: payload.pembimbing_2 ? Number(payload.pembimbing_2) : null,
        status: payload.status,
        angkatan: payload.angkatan,
        id: Number(payload.user_id),
      } as Prisma.MahasiswaUncheckedCreateInput,
    });
    return this.transformMahasiswa(result);
  }

  async update(id: string, payload: UpdateMahasiswaInput, fileUrl?: string) {
    const dataToUpdate: Prisma.MahasiswaUpdateInput = {};

    if (payload.nim !== undefined) dataToUpdate.nim = payload.nim;
    if (payload.no_hp !== undefined) dataToUpdate.noHp = payload.no_hp;
    if (payload.alamat !== undefined) dataToUpdate.alamat = payload.alamat;
    if (payload.semester !== undefined)
      dataToUpdate.semester = payload.semester;
    if (payload.status !== undefined)
      dataToUpdate.status = payload.status as any;
    if (payload.angkatan !== undefined)
      dataToUpdate.angkatan = payload.angkatan;

    if (payload.prodi_id !== undefined)
      dataToUpdate.prodi = { connect: { id: Number(payload.prodi_id) } };
    if (payload.peminatan_id !== undefined)
      dataToUpdate.peminatan = payload.peminatan_id
        ? { connect: { id: Number(payload.peminatan_id) } }
        : { disconnect: true };
    if (payload.dosen_pa !== undefined)
      dataToUpdate.dosenPaRel = payload.dosen_pa
        ? { connect: { id: Number(payload.dosen_pa) } }
        : { disconnect: true };
    if (payload.pembimbing_1 !== undefined)
      dataToUpdate.pembimbing1Rel = payload.pembimbing_1
        ? { connect: { id: Number(payload.pembimbing_1) } }
        : { disconnect: true };
    if (payload.pembimbing_2 !== undefined)
      dataToUpdate.pembimbing2Rel = payload.pembimbing_2
        ? { connect: { id: Number(payload.pembimbing_2) } }
        : { disconnect: true };
    if (payload.ipk !== undefined)
      dataToUpdate.ipk = new Prisma.Decimal(payload.ipk);
    if (fileUrl) dataToUpdate.foto = fileUrl;

    const result = await prisma.mahasiswa.update({
      where: { id: Number(id) },
      data: dataToUpdate,
      select: MAHASISWA_SELECT,
    });

    return this.transformMahasiswa(result);
  }

  async delete(id: string) {
    return await prisma.mahasiswa.delete({ where: { id: Number(id) } });
  }

  async getDocuments(mahasiswaId: string) {
    if (!mahasiswaId || isNaN(Number(mahasiswaId))) return [];

    const documents = await prisma.dokumenMahasiswa.findMany({
      where: {
        mahasiswaId: Number(mahasiswaId),
      },
    });

    return documents.map((doc) => ({
      id: doc.id,
      jenis: doc.jenis,
      fileUrl: doc.fileUrl,
      uploadedAt: doc.uploadedAt,
    }));
  }

  async uploadDocument(mahasiswaId: string, payload: { jenis: string; fileUrl: string }) {
    if (!mahasiswaId || isNaN(Number(mahasiswaId))) throw new Error("ID Mahasiswa tidak valid");

    return await prisma.dokumenMahasiswa.upsert({
      where: {
        mahasiswaId_jenis: {
          mahasiswaId: Number(mahasiswaId),
          jenis: payload.jenis as any,
        },
      },
      update: {
        fileUrl: payload.fileUrl,
        uploadedAt: new Date(),
      },
      create: {
        mahasiswaId: Number(mahasiswaId),
        jenis: payload.jenis as any,
        fileUrl: payload.fileUrl,
      },
    });
  }

  async deleteDocument(mahasiswaId: string, jenis: string) {
    if (!mahasiswaId || isNaN(Number(mahasiswaId))) throw new Error("ID Mahasiswa tidak valid");

    try {
      return await prisma.dokumenMahasiswa.delete({
        where: {
          mahasiswaId_jenis: {
            mahasiswaId: Number(mahasiswaId),
            jenis: jenis as any,
          },
        },
      });
    } catch (error: any) {
      // If record not found, we consider it deleted (idempotent)
      if (error.code === 'P2025') {
        return { message: "Document already deleted or not found" };
      }
      throw error;
    }
  }

  private transformMahasiswa(m: any) {
    if (!m) return null;
    return {
      id: m.id,
      nim: m.nim,
      nama: m.user?.nama,
      email: m.user?.email,
      noHp: m.noHp,
      alamat: m.alamat,
      prodiId: m.prodiId,
      prodi: this.transformProdi(m.prodi),
      peminatanId: m.peminatanId,
      peminatan: this.transformPeminatan(m.peminatan),
      semester: m.semester,
      ipk: m.ipk ? Number(m.ipk) : 0,
      dosenPa: m.dosenPaRel
        ? { id: m.dosenPaRel.id, nama: m.dosenPaRel.user?.nama }
        : null,
      pembimbing1: m.pembimbing1Rel
        ? { id: m.pembimbing1Rel.id, nama: m.pembimbing1Rel.user?.nama }
        : null,
      pembimbing2: m.pembimbing2Rel
        ? { id: m.pembimbing2Rel.id, nama: m.pembimbing2Rel.user?.nama }
        : null,
      status: m.status,
      angkatan: m.angkatan,
      foto: m.foto,
      urlTtd: m.urlTtd,
      // legacy support
      no_hp: m.noHp,
      prodi_id: m.prodiId,
      peminatan_id: m.peminatanId,
      dosen_pa: m.dosenPaRel
        ? { id: m.dosenPaRel.id, nama: m.dosenPaRel.user?.nama }
        : null,
      pembimbing_1: m.pembimbing1Rel
        ? { id: m.pembimbing1Rel.id, nama: m.pembimbing1Rel.user?.nama }
        : null,
      pembimbing_2: m.pembimbing2Rel
        ? { id: m.pembimbing2Rel.id, nama: m.pembimbing2Rel.user?.nama }
        : null,
      url_ttd: m.urlTtd,
    };
  }

  private transformProdi(p: any) {
    if (!p) return null;
    return {
      id: p.id,
      namaProdi: p.namaProdi,
      fakultasId: p.fakultasId,
      // legacy
      nama_prodi: p.namaProdi,
      fakultas_id: p.fakultasId,
    };
  }

  private transformPeminatan(p: any) {
    if (!p) return null;
    return {
      id: p.id,
      namaPeminatan: p.namaPeminatan,
      prodiId: p.prodiId,
      // legacy
      nama_peminatan: p.namaPeminatan,
      prodi_id: p.prodiId,
    };
  }
}

export const mahasiswaService = new MahasiswaService();
