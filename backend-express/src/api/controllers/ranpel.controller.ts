import { Request, Response, NextFunction } from "express";
import { ranpelService } from "../../services/ranpel.service";
import { pdfService } from "../../services/pdf.service";
import { supabaseAdmin } from "../../utils/supabase";

export class RanpelController {
  // --- Ranpel Endpoints ---
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ranpelService.getAllRanpel();
      res.status(200).json({ data, success: true });
    } catch (error) {
      next(error);
    }
  }

  async store(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ranpelService.storeRanpel(req.body);
      res.status(201).json({ data, success: true });
    } catch (error) {
      next(error);
    }
  }

  // --- Pengajuan Ranpel by Mahasiswa Endpoints ---
  async getByMahasiswa(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await ranpelService.getPengajuanByMahasiswa(id);
      res.status(200).json({ data, success: true });
    } catch (error) {
      next(error);
    }
  }

  async storeByMahasiswa(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await ranpelService.storeByMahasiswa(req.body, id);
      res.status(201).json({ data, success: true });
    } catch (error) {
      next(error);
    }
  }

  async updateRanpelByMahasiswa(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const ranpelId = req.params.ranpelId as string;
      const data = await ranpelService.updateRanpelByMahasiswa(
        ranpelId,
        req.body,
      );
      res.status(200).json({ data, success: true });
    } catch (error) {
      next(error);
    }
  }

  // --- Core Pengajuan Ranpel Approval Endpoint ---
  async getAllPengajuan(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      let roles: string[] = [];
      if (user) {
        const { authService } = await import("../../services/auth.service");
        roles = await authService.getUserRoles(user.id);
      }

      const data = await ranpelService.getAllPengajuan(user?.id, roles);
      res.status(200).json({ data, success: true });
    } catch (error) {
      next(error);
    }
  }

  async updatePengajuan(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await ranpelService.updatePengajuan(id, req.body);
      res.status(200).json({ data, success: true });
    } catch (error) {
      next(error);
    }
  }

  // DELETES
  async destroyRanpel(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await ranpelService.deleteRanpel(id);
      res.status(200).json({ message: "Ranpel berhasil dihapus." });
    } catch (error) {
      next(error);
    }
  }

  async exportPdf(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      console.log(`[PDF] Request export for ID: ${id}`);

      const pengajuan = await ranpelService.getPengajuanById(id);

      if (!pengajuan) {
        console.warn(`[PDF] Pengajuan with ID ${id} not found`);
        return res.status(404).json({ message: "Pengajuan not found" });
      }

      let dosenPaSignatureUrl = null;
      if (
        (pengajuan as any).statusDosenPa !== "menunggu" ||
        (pengajuan as any).statusKaprodi !== "menunggu"
      ) {
        const dosen = pengajuan.mahasiswa?.dosenPa;
        if (dosen && dosen.url_ttd) {
          // Extract path from Supabase URL
          // Format: ...authenticated/skripsi_docs/signatures/19800101/ttd_official.png
          const parts = dosen.url_ttd.split("skripsi_docs/");
          if (parts.length > 1) {
            const path = parts[1];
            const { data: signedData } = await supabaseAdmin.storage
              .from("skripsi_docs")
              .createSignedUrl(path, 600); // 10 minutes for puppeteer
            dosenPaSignatureUrl = signedData?.signedUrl;
          } else {
            dosenPaSignatureUrl = dosen.url_ttd;
          }
        }
      }

      let studentSignatureUrl = null;
      const student = pengajuan.mahasiswa as any;
      if (student && student.url_ttd) {
        const parts = student.url_ttd.split("skripsi_docs/");
        if (parts.length > 1) {
          const path = parts[1];
          const { data: signedData } = await supabaseAdmin.storage
            .from("skripsi_docs")
            .createSignedUrl(path, 600);
          studentSignatureUrl = signedData?.signedUrl;
        } else {
          studentSignatureUrl = student.url_ttd;
        }
      }

      const dataToPdf = {
        studentName: pengajuan.mahasiswa?.nama,
        studentNim: pengajuan.mahasiswa?.nim,
        judulPenelitian: (pengajuan as any).rancanganPenelitian
          ?.judulPenelitian,
        masalahDanPenyebab: (pengajuan as any).rancanganPenelitian
          ?.masalahDanPenyebab,
        alternatifSolusi: (pengajuan as any).rancanganPenelitian
          ?.alternatifSolusi,
        hasilYangDiharapkan: (pengajuan as any).rancanganPenelitian
          ?.hasilYangDiharapkan,
        kebutuhanData: (pengajuan as any).rancanganPenelitian?.kebutuhanData,
        metodePenelitian: (pengajuan as any).rancanganPenelitian
          ?.metodePenelitian,
        jurnalReferensi: (pengajuan as any).rancanganPenelitian
          ?.jurnalReferensi,
        dosenPaNama: pengajuan.mahasiswa?.dosenPa?.nama,
        dosenPaNip:
          pengajuan.mahasiswa?.dosenPa?.nip || ".........................",
        dosenPaSignatureUrl,
        studentSignatureUrl,
        tanggal: new Date().toLocaleDateString("id-ID", { dateStyle: "long" }),
      };

      console.log("[PDF] Data prepared, calling pdfService...");
      const pdfBuffer = await pdfService.generateRanpelPdf(dataToPdf);

      console.log(`[PDF] Buffer generated. Length: ${pdfBuffer.length}`);

      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=RANPEL_${pengajuan.mahasiswa?.nim}.pdf`,
        "Content-Length": pdfBuffer.length.toString(),
      });

      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  async destroyPengajuan(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await ranpelService.deletePengajuan(id);
      res.status(200).json({ message: "Pengajuan ranpel berhasil dihapus." });
    } catch (error) {
      next(error);
    }
  }
}

export const ranpelController = new RanpelController();
