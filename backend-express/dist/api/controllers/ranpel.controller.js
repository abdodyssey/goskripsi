"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ranpelController = exports.RanpelController = void 0;
const ranpel_service_1 = require("../../services/ranpel.service");
const pdf_service_1 = require("../../services/pdf.service");
const supabase_1 = require("../../utils/supabase");
class RanpelController {
    // --- Ranpel Endpoints ---
    async index(req, res, next) {
        try {
            const data = await ranpel_service_1.ranpelService.getAllRanpel();
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async store(req, res, next) {
        try {
            const data = await ranpel_service_1.ranpelService.storeRanpel(req.body);
            res.status(201).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    // --- Pengajuan Ranpel by Mahasiswa Endpoints ---
    async getByMahasiswa(req, res, next) {
        try {
            const id = req.params.id;
            const data = await ranpel_service_1.ranpelService.getPengajuanByMahasiswa(id);
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async storeByMahasiswa(req, res, next) {
        try {
            const id = req.params.id;
            const data = await ranpel_service_1.ranpelService.storeByMahasiswa(req.body, id);
            res.status(201).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async updateRanpelByMahasiswa(req, res, next) {
        try {
            const ranpelId = req.params.ranpelId;
            const data = await ranpel_service_1.ranpelService.updateRanpelByMahasiswa(ranpelId, req.body);
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    // --- Core Pengajuan Ranpel Approval Endpoint ---
    async getAllPengajuan(req, res, next) {
        try {
            const user = req.user;
            let roles = [];
            if (user) {
                const { authService } = await Promise.resolve().then(() => __importStar(require("../../services/auth.service")));
                roles = await authService.getUserRoles(user.id);
            }
            const data = await ranpel_service_1.ranpelService.getAllPengajuan(user?.id, roles);
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async updatePengajuan(req, res, next) {
        try {
            const id = req.params.id;
            const data = await ranpel_service_1.ranpelService.updatePengajuan(id, req.body);
            res.status(200).json({ data, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    // DELETES
    async destroyRanpel(req, res, next) {
        try {
            const id = req.params.id;
            await ranpel_service_1.ranpelService.deleteRanpel(id);
            res.status(200).json({ message: "Ranpel berhasil dihapus." });
        }
        catch (error) {
            next(error);
        }
    }
    async exportPdf(req, res, next) {
        try {
            const id = req.params.id;
            console.log(`[PDF] Request export for ID: ${id}`);
            const pengajuan = await ranpel_service_1.ranpelService.getPengajuanById(id);
            if (!pengajuan) {
                console.warn(`[PDF] Pengajuan with ID ${id} not found`);
                return res.status(404).json({ message: "Pengajuan not found" });
            }
            let dosenPaSignatureUrl = null;
            if (pengajuan.statusDosenPa !== "menunggu" ||
                pengajuan.statusKaprodi !== "menunggu") {
                const dosen = pengajuan.mahasiswa?.dosenPaRel;
                if (dosen && dosen.url_ttd) {
                    // Extract path from Supabase URL
                    // Format: ...authenticated/skripsi_docs/signatures/19800101/ttd_official.png
                    const parts = dosen.url_ttd.split("skripsi_docs/");
                    if (parts.length > 1) {
                        const path = parts[1];
                        const { data: signedData } = await supabase_1.supabaseAdmin.storage
                            .from("skripsi_docs")
                            .createSignedUrl(path, 600); // 10 minutes for puppeteer
                        dosenPaSignatureUrl = signedData?.signedUrl;
                    }
                    else {
                        dosenPaSignatureUrl = dosen.url_ttd;
                    }
                }
            }
            let studentSignatureUrl = null;
            const student = pengajuan.mahasiswa;
            if (student && student.url_ttd) {
                const parts = student.url_ttd.split("skripsi_docs/");
                if (parts.length > 1) {
                    const path = parts[1];
                    const { data: signedData } = await supabase_1.supabaseAdmin.storage
                        .from("skripsi_docs")
                        .createSignedUrl(path, 600);
                    studentSignatureUrl = signedData?.signedUrl;
                }
                else {
                    studentSignatureUrl = student.url_ttd;
                }
            }
            const dataToPdf = {
                studentName: pengajuan.mahasiswa?.user?.nama,
                studentNim: pengajuan.mahasiswa?.nim,
                judulPenelitian: pengajuan.rancanganPenelitian?.judulPenelitian,
                masalahDanPenyebab: pengajuan.rancanganPenelitian?.masalahDanPenyebab,
                alternatifSolusi: pengajuan.rancanganPenelitian?.alternatifSolusi,
                hasilYangDiharapkan: pengajuan.rancanganPenelitian?.hasilYangDiharapkan,
                kebutuhanData: pengajuan.rancanganPenelitian?.kebutuhanData,
                metodePenelitian: pengajuan.rancanganPenelitian?.metodePenelitian,
                jurnalReferensi: pengajuan.rancanganPenelitian?.jurnalReferensi,
                dosenPaNama: pengajuan.mahasiswa?.dosenPaRel?.user?.nama,
                dosenPaNip: pengajuan.mahasiswa?.dosenPaRel?.nip ||
                    ".........................",
                dosenPaSignatureUrl,
                studentSignatureUrl,
                tanggal: new Date().toLocaleDateString("id-ID", { dateStyle: "long" }),
            };
            console.log("[PDF] Data prepared, calling pdfService...");
            const pdfBuffer = await pdf_service_1.pdfService.generateRanpelPdf(dataToPdf);
            console.log(`[PDF] Buffer generated. Length: ${pdfBuffer.length}`);
            res.set({
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename=RANPEL_${pengajuan.mahasiswa?.nim}.pdf`,
                "Content-Length": pdfBuffer.length.toString(),
            });
            res.send(pdfBuffer);
        }
        catch (error) {
            next(error);
        }
    }
    async destroyPengajuan(req, res, next) {
        try {
            const id = req.params.id;
            await ranpel_service_1.ranpelService.deletePengajuan(id);
            res.status(200).json({ message: "Pengajuan ranpel berhasil dihapus." });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.RanpelController = RanpelController;
exports.ranpelController = new RanpelController();
