"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerbaikanJudulService = void 0;
const perbaikan_judul_repository_1 = require("../repositories/perbaikan-judul.repository");
class PerbaikanJudulService {
    repository = new perbaikan_judul_repository_1.PerbaikanJudulRepository();
    async submitRequest(data) {
        return this.repository.create(data);
    }
    async getAllRequests() {
        return this.repository.findAll();
    }
    async getMyRequests(mahasiswaId) {
        return this.repository.findByMahasiswaId(mahasiswaId);
    }
    async reviewRequest(id, data) {
        const request = await this.repository.findById(id);
        if (!request)
            throw new Error('Request not found');
        const updatedRequest = await this.repository.updateStatus(id, data);
        if (data.status === 'diterima') {
            await this.repository.updateMahasiswaTitle(request.mahasiswaId, request.judulBaru);
        }
        return updatedRequest;
    }
}
exports.PerbaikanJudulService = PerbaikanJudulService;
