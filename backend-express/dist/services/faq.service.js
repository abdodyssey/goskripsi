"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.faqService = exports.FaqService = void 0;
const prisma_1 = require("../utils/prisma");
class FaqService {
    async getAll() {
        return await prisma_1.prisma.faq.findMany();
    }
    async getById(id) {
        return await prisma_1.prisma.faq.findUnique({ where: { id: BigInt(id) } });
    }
    async store(payload) {
        return await prisma_1.prisma.faq.create({
            data: {
                question: payload.question,
                answer: payload.answer,
                is_active: payload.is_active !== undefined && payload.is_active !== null
                    ? payload.is_active
                    : true,
                created_at: new Date(),
                updated_at: new Date(),
            },
        });
    }
    async update(id, payload) {
        const dataUpdate = { updated_at: new Date() };
        if (payload.question !== undefined)
            dataUpdate.question = payload.question;
        if (payload.answer !== undefined)
            dataUpdate.answer = payload.answer;
        if (payload.is_active !== undefined)
            dataUpdate.is_active = payload.is_active;
        return await prisma_1.prisma.faq.update({
            where: { id: BigInt(id) },
            data: dataUpdate,
        });
    }
    async delete(id) {
        return await prisma_1.prisma.faq.delete({ where: { id: BigInt(id) } });
    }
}
exports.FaqService = FaqService;
exports.faqService = new FaqService();
