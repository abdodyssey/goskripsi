"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentService = exports.CommentService = void 0;
const prisma_1 = require("../utils/prisma");
class CommentService {
    async getAll() {
        return await prisma_1.prisma.comment.findMany();
    }
    async getById(id) {
        return await prisma_1.prisma.comment.findUnique({ where: { id: BigInt(id) } });
    }
    async store(payload) {
        return await prisma_1.prisma.comment.create({
            data: {
                proposal_id: BigInt(payload.proposal_id),
                section_id: payload.section_id,
                user_id: BigInt(payload.user_id),
                message: payload.message,
                is_resolved: payload.is_resolved !== undefined && payload.is_resolved !== null
                    ? payload.is_resolved
                    : false,
                created_at: new Date(),
                updated_at: new Date(),
            },
        });
    }
    async update(id, payload) {
        const dataUpdate = { updated_at: new Date() };
        if (payload.proposal_id !== undefined)
            dataUpdate.proposal_id = payload.proposal_id
                ? BigInt(payload.proposal_id)
                : null;
        if (payload.section_id !== undefined)
            dataUpdate.section_id = payload.section_id;
        if (payload.user_id !== undefined)
            dataUpdate.user_id = payload.user_id ? BigInt(payload.user_id) : null;
        if (payload.message !== undefined)
            dataUpdate.message = payload.message;
        if (payload.is_resolved !== undefined)
            dataUpdate.is_resolved = payload.is_resolved;
        return await prisma_1.prisma.comment.update({
            where: { id: BigInt(id) },
            data: dataUpdate,
        });
    }
    async delete(id) {
        return await prisma_1.prisma.comment.delete({ where: { id: BigInt(id) } });
    }
}
exports.CommentService = CommentService;
exports.commentService = new CommentService();
