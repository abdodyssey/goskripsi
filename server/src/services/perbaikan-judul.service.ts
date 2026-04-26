import { PerbaikanJudulRepository } from '../repositories/perbaikan-judul.repository';
import { StatusPengajuan } from '@prisma/client';

export class PerbaikanJudulService {
  private repository = new PerbaikanJudulRepository();

  async submitRequest(data: {
    mahasiswaId: number;
    judulLama: string;
    judulBaru: string;
    fileSurat: string;
  }) {
    return this.repository.create(data);
  }

  async getAllRequests() {
    return this.repository.findAll();
  }

  async getMyRequests(mahasiswaId: number) {
    return this.repository.findByMahasiswaId(mahasiswaId);
  }

  async reviewRequest(
    id: number,
    data: {
      status: StatusPengajuan;
      catatanSekprodi?: string;
    }
  ) {
    const request = await this.repository.findById(id);
    if (!request) throw new Error('Request not found');

    const updatedRequest = await this.repository.updateStatus(id, data);

    if (data.status === 'diterima') {
      await this.repository.updateMahasiswaTitle(request.mahasiswaId, request.judulBaru);
    }

    return updatedRequest;
  }
}
