"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templateService = exports.TemplateService = void 0;
const prisma_1 = require("../utils/prisma");
class TemplateService {
    async getAll() {
        return await prisma_1.prisma.template.findMany();
    }
    async getById(id) {
        return await prisma_1.prisma.template.findUnique({ where: { id: BigInt(id) } });
    }
    async store(payload) {
        return await prisma_1.prisma.template.create({
            data: {
                jenis_ujian_id: BigInt(payload.jenis_ujian_id),
                nama_template: payload.nama_template,
                deskripsi: payload.deskripsi,
                file_path: payload.file_path,
                created_at: new Date(),
                updated_at: new Date(),
            }
        });
    }
    async update(id, payload) {
        const dataUpdate = { updated_at: new Date() };
        if (payload.jenis_ujian_id !== undefined)
            dataUpdate.jenis_ujian_id = payload.jenis_ujian_id ? BigInt(payload.jenis_ujian_id) : null;
        if (payload.nama_template !== undefined)
            dataUpdate.nama_template = payload.nama_template;
        if (payload.deskripsi !== undefined)
            dataUpdate.deskripsi = payload.deskripsi;
        if (payload.file_path !== undefined)
            dataUpdate.file_path = payload.file_path;
        return await prisma_1.prisma.template.update({
            where: { id: BigInt(id) },
            data: dataUpdate
        });
    }
    async delete(id) {
        return await prisma_1.prisma.template.delete({ where: { id: BigInt(id) } });
    }
}
exports.TemplateService = TemplateService;
exports.templateService = new TemplateService();
