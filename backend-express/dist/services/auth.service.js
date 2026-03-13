"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const prisma_1 = require("../utils/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const JWT_EXPIRES_IN = "1d";
class AuthService {
    async login(payload) {
        // The request now strictly uses username
        const user = await prisma_1.prisma.user.findUnique({
            where: { username: payload.username },
            include: { role: true },
        });
        if (!user) {
            throw new Error("User tidak ditemukan atau kredensial salah");
        }
        const isMatch = await bcrypt_1.default.compare(payload.password, user.password);
        if (!isMatch) {
            throw new Error("User tidak ditemukan atau kredensial salah");
        }
        const isDefaultPassword = user.username === payload.password;
        const roleName = user.role.name;
        const roleNames = [roleName];
        const mainRole = roleName;
        // Token creation mapping ID, Username, and Roles
        const token = jsonwebtoken_1.default.sign({ id: user.id.toString(), username: user.username, roles: roleNames }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        const userData = await this.getUserDataByRole(user, mainRole);
        return {
            message: "Login berhasil",
            success: true,
            role: mainRole,
            roles: roleNames,
            permissions: [], // Can map permissions here similarly if needed
            user: userData,
            is_default_password: isDefaultPassword,
            access_token: token,
            token_type: "Bearer",
        };
    }
    async getUserRoles(id) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: Number(id) },
            include: { role: true },
        });
        if (!user)
            return [];
        return [user.role.name];
    }
    async getProfile(id) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: Number(id) },
            include: { role: true },
        });
        if (!user)
            throw new Error("User tidak ditemukan");
        const roleNames = [user.role.name];
        const mainRole = user.role.name;
        const userData = await this.getUserDataByRole(user, mainRole);
        return {
            success: true,
            role: mainRole,
            roles: roleNames,
            user: userData,
            is_default_password: user.username === user.password,
        };
    }
    async changePassword(id, payload) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: Number(id) },
        });
        if (!user)
            throw new Error("User tidak ditemukan");
        const isMatch = await bcrypt_1.default.compare(payload.current_password, user.password);
        if (!isMatch) {
            throw new Error("Kata sandi lama salah");
        }
        const hashedPassword = await bcrypt_1.default.hash(payload.new_password, 10);
        await prisma_1.prisma.user.update({
            where: { id: Number(id) },
            data: {
                password: hashedPassword,
            },
        });
        return {
            message: "Kata sandi berhasil diubah",
            success: true,
        };
    }
    async updateProfile(id, payload) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: Number(id) },
            include: { role: true },
        });
        if (!user)
            throw new Error("User tidak ditemukan");
        // Update core user table
        await prisma_1.prisma.user.update({
            where: { id: Number(id) },
            data: {
                nama: payload.nama,
                email: payload.email,
            },
        });
        const roleName = user.role.name;
        if (roleName === "mahasiswa") {
            await prisma_1.prisma.mahasiswa.update({
                where: { id: user.id },
                data: {
                    noHp: payload.no_hp,
                    alamat: payload.alamat,
                    urlTtd: payload.url_ttd,
                    ipk: payload.ipk !== undefined && payload.ipk !== null
                        ? payload.ipk
                        : undefined,
                    semester: payload.semester !== undefined && payload.semester !== null
                        ? payload.semester
                        : undefined,
                },
            });
        }
        if (roleName === "dosen" ||
            roleName === "kaprodi" ||
            roleName === "sekprodi") {
            await prisma_1.prisma.dosen.update({
                where: { id: user.id },
                data: {
                    noHp: payload.no_hp,
                    alamat: payload.alamat,
                    urlTtd: payload.url_ttd,
                    foto: payload.foto,
                },
            });
        }
        return await this.getProfile(id);
    }
    async getUserDataByRole(user, role) {
        // Determine prodi based on related profiles, as it's no longer directly on 'user'
        // Let's get it from dosen or mahasiswa if applicable.
        if (role === "mahasiswa") {
            const mahasiswa = await prisma_1.prisma.mahasiswa.findUnique({
                where: { id: user.id },
                include: {
                    prodi: true,
                    peminatan: true,
                    pembimbing1Rel: { include: { user: true } },
                    pembimbing2Rel: { include: { user: true } },
                    dosenPaRel: { include: { user: true } },
                },
            });
            if (mahasiswa) {
                return {
                    id: mahasiswa.id.toString(),
                    user_id: user.id.toString(),
                    nim: mahasiswa.nim,
                    nama: user.nama,
                    email: user.email,
                    noHp: mahasiswa.noHp,
                    alamat: mahasiswa.alamat,
                    semester: mahasiswa.semester,
                    ipk: mahasiswa.ipk?.toNumber(),
                    prodi: mahasiswa.prodi,
                    peminatan: mahasiswa.peminatan,
                    dosen_pa: mahasiswa.dosenPaRel
                        ? {
                            id: mahasiswa.dosenPaRel.id.toString(),
                            nama: mahasiswa.dosenPaRel.user?.nama || "",
                        }
                        : null,
                    pembimbing1: mahasiswa.pembimbing1Rel
                        ? {
                            id: mahasiswa.pembimbing1Rel.id.toString(),
                            nama: mahasiswa.pembimbing1Rel.user?.nama || "",
                        }
                        : null,
                    pembimbing2: mahasiswa.pembimbing2Rel
                        ? {
                            id: mahasiswa.pembimbing2Rel.id.toString(),
                            nama: mahasiswa.pembimbing2Rel.user?.nama || "",
                        }
                        : null,
                    status: mahasiswa.status,
                    angkatan: mahasiswa.angkatan,
                    urlTtd: mahasiswa.urlTtd,
                };
            }
        }
        if (role === "dosen" || role === "kaprodi" || role === "sekprodi") {
            const dosen = await prisma_1.prisma.dosen.findUnique({
                where: { id: user.id },
                include: { prodi: true, user: true },
            });
            if (dosen) {
                return {
                    id: dosen.id.toString(),
                    user_id: user.id.toString(),
                    nidn: dosen.nidn,
                    nip: dosen.nip,
                    nama: dosen.user?.nama || "",
                    email: user.email,
                    noHp: dosen.noHp,
                    alamat: dosen.alamat,
                    prodi: dosen.prodi,
                    urlTtd: dosen.urlTtd,
                };
            }
        }
        return {
            id: user.id.toString(),
            username: user.username,
            nama: user.nama,
            email: user.email,
            prodi: null,
        };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
