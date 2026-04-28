import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  LoginInput,
  ChangePasswordInput,
  UpdateProfileInput,
} from "../schemas/auth.schema";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const JWT_EXPIRES_IN = "1d";

export class AuthService {
  async login(payload: LoginInput) {
    try {
      const user = await prisma.user.findUnique({
        where: { username: payload.username },
        include: { 
          role: true,
          mahasiswa: {
            include: {
              prodi: { select: { id: true, namaProdi: true, fakultasId: true } },
              peminatan: { select: { id: true, namaPeminatan: true, prodiId: true } },
              pembimbing1Rel: { select: { id: true, user: { select: { nama: true } } } },
              pembimbing2Rel: { select: { id: true, user: { select: { nama: true } } } },
              dosenPaRel: { select: { id: true, user: { select: { nama: true } } } },
              pendaftaranUjians: {
                select: {
                  jenisUjianId: true,
                  status: true,
                  ujian: {
                    select: { hasil: true }
                  }
                }
              }
            }
          },
          dosen: {
            include: {
              prodi: { select: { id: true, namaProdi: true, fakultasId: true } },
            }
          }
        },
      });

      if (!user) throw new Error("User tidak ditemukan");

      const isMatch = await bcrypt.compare(payload.password, user.password);
      if (!isMatch) throw new Error("Kredensial salah");

      const isDefaultPassword = user.username === payload.password;
      const roleName = user.role.name;
      const roleNames = [roleName];

      const token = jwt.sign(
        { id: user.id.toString(), username: user.username, roles: roleNames },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN },
      );

      const userData = await this.getUserDataByRole(user, roleName);

      return {
        message: "Login berhasil",
        success: true,
        role: roleName,
        roles: roleNames,
        permissions: [],
        user: userData,
        is_default_password: isDefaultPassword,
        access_token: token,
        token_type: "Bearer",
      };
    } catch (error: any) {
      throw error;
    }
  }

  async getUserRoles(id: string): Promise<string[]> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: Number(id) },
        select: { role: { select: { name: true } } },
      });
      if (!user) return [];
      return [user.role.name];
    } catch (error) {
      return [];
    }
  }

  async getProfile(id: string) {
    if (!id || isNaN(Number(id))) return null;

    try {
      const user = await prisma.user.findUnique({
        where: { id: Number(id) },
        include: {
          role: true,
          mahasiswa: {
            include: {
              prodi: { select: { id: true, namaProdi: true, fakultasId: true } },
              peminatan: { select: { id: true, namaPeminatan: true, prodiId: true } },
              pembimbing1Rel: { select: { id: true, user: { select: { nama: true } } } },
              pembimbing2Rel: { select: { id: true, user: { select: { nama: true } } } },
              dosenPaRel: { select: { id: true, user: { select: { nama: true } } } },
              pendaftaranUjians: {
                select: {
                  jenisUjianId: true,
                  status: true,
                  ujian: {
                    select: { hasil: true }
                  }
                }
              }
            },
          },
          dosen: {
            include: {
              prodi: { select: { id: true, namaProdi: true, fakultasId: true } },
            },
          },
        },
      });

      if (!user) return null;

      const roleNames = [user.role.name];
      const mainRole = user.role.name;
      const userData = await this.getUserDataByRole(user, mainRole);

      return {
        success: true,
        role: mainRole,
        roles: roleNames,
        user: userData,
        is_default_password: bcrypt.compareSync(user.username, user.password),
      };
    } catch (error: any) {
      if (error.message.includes("relationLoadStrategy")) {
        return await this.getProfileWithoutStrategy(id);
      }
      throw error;
    }
  }

  private async getProfileWithoutStrategy(id: string) {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: {
        role: true,
        mahasiswa: {
          include: {
            prodi: { select: { id: true, namaProdi: true, fakultasId: true } },
            peminatan: { select: { id: true, namaPeminatan: true, prodiId: true } },
            pembimbing1Rel: { select: { id: true, user: { select: { nama: true } } } },
            pembimbing2Rel: { select: { id: true, user: { select: { nama: true } } } },
            dosenPaRel: { select: { id: true, user: { select: { nama: true } } } },
            pendaftaranUjians: {
              select: {
                jenisUjianId: true,
                status: true,
                ujian: {
                  select: { hasil: true }
                }
              }
            }
          },
        },
        dosen: {
          include: {
            prodi: { select: { id: true, namaProdi: true, fakultasId: true } },
          },
        },
      },
    });

    if (!user) return null;

    const roleNames = [user.role.name];
    const mainRole = user.role.name;
    const userData = await this.getUserDataByRole(user, mainRole);

    return {
      success: true,
      role: mainRole,
      roles: roleNames,
      user: userData,
      is_default_password: bcrypt.compareSync(user.username, user.password),
    };
  }

  async changePassword(id: string, payload: ChangePasswordInput) {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });
    if (!user) throw new Error("User tidak ditemukan");

    const isMatch = await bcrypt.compare(payload.current_password, user.password);
    if (!isMatch) throw new Error("Kata sandi lama salah");

    const hashedPassword = await bcrypt.hash(payload.new_password, 10);
    await prisma.user.update({
      where: { id: Number(id) },
      data: { password: hashedPassword },
    });

    return { message: "Kata sandi berhasil diubah", success: true };
  }

  async updateProfile(id: string, payload: UpdateProfileInput) {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: { id: true, role: { select: { name: true } } },
    });

    if (!user) throw new Error("User tidak ditemukan");

    try {
      await prisma.user.update({
        where: { id: Number(id) },
        data: { nama: payload.nama, email: payload.email },
      });
    } catch (error: any) {
      if (error.code === "P2002" && error.meta?.target?.includes("email")) {
        throw new Error("Email sudah digunakan oleh akun lain");
      }
      throw error;
    }

    const roleName = user.role.name;
    if (roleName === "mahasiswa") {
      await prisma.mahasiswa.upsert({
        where: { id: user.id },
        update: {
          noHp: payload.no_hp,
          alamat: payload.alamat,
          urlTtd: payload.url_ttd,
          ipk: payload.ipk ?? undefined,
          semester: payload.semester ?? undefined,
        },
        create: {
          id: user.id,
          nim: user.id.toString(),
          prodiId: 1, 
          noHp: payload.no_hp,
          alamat: payload.alamat,
          urlTtd: payload.url_ttd,
          ipk: payload.ipk || 0,
          semester: payload.semester || 1,
        },
      });
    } else if (["dosen", "kaprodi", "sekprodi"].includes(roleName)) {
      await prisma.dosen.upsert({
        where: { id: user.id },
        update: {
          noHp: payload.no_hp,
          alamat: payload.alamat,
          urlTtd: payload.url_ttd,
          foto: payload.foto,
        },
        create: {
          id: user.id,
          prodiId: 1,
          noHp: payload.no_hp,
          alamat: payload.alamat,
          urlTtd: payload.url_ttd,
          foto: payload.foto,
        },
      });
    }

    return await this.getProfile(id);
  }

  private async getUserDataByRole(user: any, role: string | null) {
    if (role === "mahasiswa" && user.mahasiswa) {
      const m = user.mahasiswa;
      return {
        id: m.id.toString(),
        user_id: user.id.toString(),
        nim: m.nim,
        nama: user.nama,
        email: user.email,
        no_hp: m.noHp,
        alamat: m.alamat,
        semester: m.semester,
        ipk: m.ipk ? Number(m.ipk) : 0,
        prodi_id: m.prodiId,
        prodi: this.transformProdi(m.prodi),
        peminatan_id: m.peminatanId,
        peminatan: this.transformPeminatan(m.peminatan),
        dosen_pa: m.dosenPaRel ? { id: m.dosenPaRel.id.toString(), nama: m.dosenPaRel.user?.nama || "" } : null,
        pembimbing_1: m.pembimbing1Rel ? { id: m.pembimbing1Rel.id.toString(), nama: m.pembimbing1Rel.user?.nama || "" } : null,
        pembimbing_2: m.pembimbing2Rel ? { id: m.pembimbing2Rel.id.toString(), nama: m.pembimbing2Rel.user?.nama || "" } : null,
        status: m.status,
        angkatan: m.angkatan,
        url_ttd: m.urlTtd,
        passed_exams: (m.pendaftaranUjians || [])
          .filter((p: any) => p.ujian?.hasil === "lulus")
          .map((p: any) => p.jenisUjianId),
        active_pendaftaran: (m.pendaftaranUjians || []).map((p: any) => ({
          jenis_id: p.jenisUjianId,
          status: p.status,
        })),
      };
    }

    if (["dosen", "kaprodi", "sekprodi"].includes(role || "") && user.dosen) {
      const d = user.dosen;
      return {
        id: d.id.toString(),
        user_id: user.id.toString(),
        nidn: d.nidn,
        nip: d.nip,
        nama: user.nama,
        email: user.email,
        no_hp: d.noHp,
        alamat: d.alamat,
        prodi_id: d.prodiId,
        prodi: this.transformProdi(d.prodi),
        url_ttd: d.urlTtd,
      };
    }

    return {
      id: user.id.toString(),
      username: user.username,
      nama: user.nama,
      email: user.email,
      prodi: null,
    };
  }

  private transformProdi(p: any) {
    if (!p) return null;
    return { id: p.id, nama_prodi: p.namaProdi, fakultas_id: p.fakultasId };
  }

  private transformPeminatan(p: any) {
    if (!p) return null;
    return { id: p.id, nama_peminatan: p.namaPeminatan, prodi_id: p.prodiId };
  }
}

export const authService = new AuthService();
