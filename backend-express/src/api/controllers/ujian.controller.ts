import { Request, Response, NextFunction } from "express";
import { ujianService } from "../../services/ujian.service";

export class UjianController {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ujianService.getAll();
      res.status(200).json({ data, success: true });
    } catch (error) {
      next(error);
    }
  }

  async show(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await ujianService.getById(id);
      if (!data) {
        res.status(404).json({ message: "Ujian tidak ditemukan" });
        return;
      }
      res.status(200).json({ data, success: true });
    } catch (error) {
      next(error);
    }
  }

  async store(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ujianService.store(req.body);
      res.status(201).json({ data, success: true });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await ujianService.update(id, req.body);
      res.status(200).json({ data, success: true });
    } catch (error) {
      next(error);
    }
  }

  async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await ujianService.delete(id);
      res.status(200).json({ message: "Ujian berhasil dihapus." });
    } catch (error) {
      next(error);
    }
  }

  async getByMahasiswa(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const namaJenis = req.query.nama_jenis as string;
      const data = await ujianService.getByMahasiswa(id, namaJenis);
      res.status(200).json({ data, success: true });
    } catch (error) {
      next(error);
    }
  }

  async getSchedulingForm(req: Request, res: Response, next: NextFunction) {
    try {
      const pendaftaranId = req.params.pendaftaranId as string;
      const data = await ujianService.getSchedulingFormData(pendaftaranId);
      res.status(200).json({ data, success: true });
    } catch (error) {
      next(error);
    }
  }

  async createScheduling(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ujianService.createScheduling(req.body);
      res
        .status(201)
        .json({ data, success: true, message: "Jadwal berhasil dibuat" });
    } catch (error) {
      next(error);
    }
  }

  async updateScheduling(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await ujianService.updateScheduling(id, req.body);
      res
        .status(200)
        .json({ data, success: true, message: "Jadwal berhasil diperbarui" });
    } catch (error) {
      next(error);
    }
  }

  async submitAbsensi(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const userId = Number((req as any).user?.id);
      const data = await ujianService.submitAbsensi(
        userId,
        id,
        req.body.absensiList,
      );
      res
        .status(200)
        .json({ data, success: true, message: "Absensi berhasil disubmit" });
    } catch (error) {
      next(error);
    }
  }

  async getFormInputNilai(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const userId = Number((req as any).user?.id);
      const data = await ujianService.getFormInputNilai(userId, id);
      res.status(200).json({ data, success: true });
    } catch (error) {
      next(error);
    }
  }

  async simpanDraftNilai(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const userId = Number((req as any).user?.id);
      const data = await ujianService.simpanDraftNilai(
        userId,
        id,
        req.body.penilaianList,
      );
      res
        .status(200)
        .json({ data, success: true, message: "Draft nilai disimpan" });
    } catch (error) {
      next(error);
    }
  }

  async submitNilaiFinal(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const userId = Number((req as any).user?.id);
      const data = await ujianService.submitNilaiFinal(
        userId,
        id,
        req.body.penilaianList,
      );
      res
        .status(200)
        .json({ data, success: true, message: "Nilai final disubmit" });
    } catch (error) {
      next(error);
    }
  }

  async finalisasiNilai(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const userId = Number((req as any).user?.id);
      const data = await ujianService.finalisasiNilai(userId, id);
      res
        .status(200)
        .json({ data, success: true, message: "Nilai berhasil difinalisasi" });
    } catch (error) {
      next(error);
    }
  }

  async getDataKeputusan(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = await ujianService.getDataKeputusan(id);
      res.status(200).json({ data, success: true });
    } catch (error) {
      next(error);
    }
  }

  async submitKeputusan(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const userId = Number((req as any).user?.id);
      const data = await ujianService.submitKeputusan(userId, id, req.body);
      res
        .status(200)
        .json({ data, success: true, message: "Keputusan berhasil disubmit" });
    } catch (error) {
      next(error);
    }
  }

  async printJadwal(req: Request, res: Response, next: NextFunction) {
    try {
      const pdfBuffer = await ujianService.generateJadwalUjianPdf();

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=Jadwal_Ujian.pdf",
      );
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  async generateBulkPdf(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const pdfBuffer = await ujianService.generateBulkPdf(id);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=Berkas_Ujian_${id}.pdf`,
      );
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }
}

export const ujianController = new UjianController();
