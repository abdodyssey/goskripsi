import { prisma } from '../utils/prisma';
import { CreateFakultasInput, UpdateFakultasInput } from '../schemas/fakultas.schema';

export class FakultasService {
  async getAll() {
    return await prisma.fakultas.findMany();
  }

  async getById(id: string) {
    return await prisma.fakultas.findUnique({ where: { id: Number(id) } });
  }

  async store(payload: CreateFakultasInput) {
    return await prisma.fakultas.create({
      data: {
        namaFakultas: payload.nama_fakultas,
        
        

      }
    });
  }

  async update(id: string, payload: UpdateFakultasInput) {
    const dataUpdate: any = {  };
    if (payload.nama_fakultas !== undefined) dataUpdate.namaFakultas = payload.nama_fakultas;


    return await prisma.fakultas.update({
      where: { id: Number(id) },
      data: dataUpdate
    });
  }

  async delete(id: string) {
    return await prisma.fakultas.delete({ where: { id: Number(id) } });
  }
}

export const fakultasService = new FakultasService();
