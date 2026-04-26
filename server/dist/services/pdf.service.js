"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pdfService = exports.PdfService = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class PdfService {
    async generateRanpelPdf(data) {
        console.log("[PdfService] Launching browser...");
        const browser = await puppeteer_1.default.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
            ],
        });
        try {
            console.log("[PdfService] Creating new page...");
            const page = await browser.newPage();
            const htmlContent = this.getRanpelTemplate(data);
            console.log(`[PdfService] HTML content prepared (length: ${htmlContent.length})`);
            console.log("[PdfService] Setting page content...");
            await page.setContent(htmlContent, {
                waitUntil: ["load", "networkidle0"],
            });
            console.log("[PdfService] Generating PDF buffer...");
            const pdfBuffer = await page.pdf({
                format: "A4",
                printBackground: true,
                margin: {
                    top: "30mm",
                    right: "30mm",
                    bottom: "30mm",
                    left: "40mm",
                },
            });
            console.log(`[PdfService] Done. Generated buffer size: ${pdfBuffer.length}`);
            return pdfBuffer;
        }
        catch (error) {
            console.error("[PdfService] ERROR during PDF generation:", error);
            throw error;
        }
        finally {
            await browser.close();
            console.log("[PdfService] Browser closed.");
        }
    }
    async generateBeritaAcaraPdf(data) {
        const browser = await puppeteer_1.default.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        try {
            const page = await browser.newPage();
            const htmlContent = this.getBeritaAcaraContent(data);
            await page.setContent(htmlContent, {
                waitUntil: ["load", "networkidle0"],
            });
            const pdfBuffer = await page.pdf({
                width: "8.5in",
                height: "13in",
                printBackground: true,
                margin: {
                    top: "0.39in",
                    right: "1.0in",
                    bottom: "1.0in",
                    left: "1.0in",
                },
            });
            return pdfBuffer;
        }
        catch (error) {
            console.error("[PdfService] ERROR generating Berita Acara PDF:", error);
            throw error;
        }
        finally {
            await browser.close();
        }
    }
    async generateJadwalUjianPdf(data) {
        const browser = await puppeteer_1.default.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        try {
            const page = await browser.newPage();
            const htmlContent = this.getJadwalUjianTemplate(data);
            await page.setContent(htmlContent, {
                waitUntil: ["load", "networkidle0"],
            });
            const pdfBuffer = await page.pdf({
                format: "A4",
                landscape: true,
                printBackground: true,
                margin: {
                    top: "0.5in",
                    right: "0.5in",
                    bottom: "0.5in",
                    left: "0.5in",
                },
            });
            return pdfBuffer;
        }
        catch (error) {
            console.error("[PdfService] ERROR generating Jadwal Ujian PDF:", error);
            throw error;
        }
        finally {
            await browser.close();
        }
    }
    getRanpelTemplate(data) {
        const { studentName, studentNim, judulPenelitian, masalahDanPenyebab, alternatifSolusi, hasilYangDiharapkan, kebutuhanData, metodePenelitian, jurnalReferensi, dosenPaNama, dosenPaNip, dosenPaSignatureUrl, studentSignatureUrl, tanggal, tanggalReviewPa, tanggalReviewKaprodi, prodiName, statusKaprodi, } = data;
        const formatDate = (dateStr) => {
            if (!dateStr)
                return "";
            return new Date(dateStr).toLocaleDateString("id-ID", {
                dateStyle: "long",
            });
        };
        return `
      <!DOCTYPE html>
      <html lang="id">
      <head>
          <meta charset="UTF-8">
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
              @page {
                size: A4;
                margin: 30mm 30mm 30mm 40mm; /* Strict Academic Margins */
              }
              body {
                  font-family: 'Plus Jakarta Sans', sans-serif;
                  line-height: 1.6;
                  color: #000;
                  font-size: 12pt;
                  margin: 0;
                  padding: 0;
              }
              .doc-header {
                  text-align: center;
                  margin-bottom: 40px;
                  margin-top: 0; /* Align with top margin of page */
              }
              .doc-header h1 {
                  font-size: 24pt;
                  font-weight: normal;
                  margin: 0;
                  text-transform: uppercase;
                  letter-spacing: 1px;
              }
              .blue-line {
                  width: 100%;
                  height: 1.2pt;
                  background-color: #4a90e2;
                  margin-top: 15px;
              }
              .centered-info {
                  text-align: center;
                  margin: 30px 0;
              }
              .centered-info .judul {
                  font-style: italic;
                  font-weight: 500;
                  margin-bottom: 5px;
                  display: block;
              }
              .section {
                  margin-bottom: 35px;
                  display: table;
                  width: 100%;
                  page-break-inside: avoid;
              }
              .section-num {
                  display: table-cell;
                  width: 30px;
                  vertical-align: top;
                  font-weight: 500;
              }
              .section-body {
                  display: table-cell;
                  vertical-align: top;
              }
              .section-title {
                  font-weight: 500;
                  margin-bottom: 10px;
              }
              .section-text {
                  text-align: justify;
                  padding-left: 20px;
              }
              .sig-date {
                  text-align: right;
                  margin-top: 50px;
                  margin-bottom: 30px;
              }
              .sig-grid {
                  display: table;
                  width: 100%;
                  page-break-inside: avoid;
              }
              .sig-col {
                  display: table-cell;
                  width: 50%;
                  vertical-align: top;
              }
              .sig-box {
                  position: relative;
                  height: 90px;
                  margin-bottom: 5px;
              }
              .sig-img {
                  height: 80px;
              }
              .sig-name {
                  font-weight: 500;
              }
              .appendix {
                  margin-top: 50px;
                  padding-top: 30px;
                  border-top: 1px solid #eee;
              }
              .appendix-content {
              }
          </style>
      </head>
      <body>
          <div class="doc-header">
              <h1>RANCANGAN PENELITIAN</h1>
              <div class="blue-line"></div>
          </div>

          <div class="centered-info">
              <span class="judul">&ldquo;${judulPenelitian}&rdquo;</span>
              <span>${studentName} (${studentNim})</span>
          </div>

          <div class="section">
              <div class="section-num">1.</div>
              <div class="section-body">
                  <div class="section-title">Masalah dan Penyebab</div>
                  <div class="section-text">${masalahDanPenyebab || "-"}</div>
              </div>
          </div>

          <div class="section">
              <div class="section-num">2.</div>
              <div class="section-body">
                  <div class="section-title">Alternatif Solusi</div>
                  <div class="section-text">${alternatifSolusi || "-"}</div>
              </div>
          </div>

          <div class="section">
              <div class="section-num">3.</div>
              <div class="section-body">
                  <div class="section-title">Hasil yang diharapkan</div>
                  <div class="section-text">${hasilYangDiharapkan || "-"}</div>
              </div>
          </div>

          <div class="section">
              <div class="section-num">4.</div>
              <div class="section-body">
                  <div class="section-title">Kebutuhan Data</div>
                  <div class="section-text">${kebutuhanData || "-"}</div>
              </div>
          </div>

          <div class="section">
              <div class="section-num">5.</div>
              <div class="section-body">
                  <div class="section-title">Metode Pelaksanaan</div>
                  <div class="section-text">${metodePenelitian || "-"}</div>
              </div>
          </div>

          <div class="sig-date">
              Palembang, ${formatDate(tanggalReviewKaprodi || tanggalReviewPa || new Date().toISOString())}
          </div>

          <div class="sig-grid">
              <div class="sig-col">
                  <div>Menyetujui:</div>
                  <div>Dosen PA,</div>
                  <div class="sig-box">
                      ${dosenPaSignatureUrl ? `<img src="${dosenPaSignatureUrl}" class="sig-img" />` : ""}
                  </div>
                  <div class="sig-name">${dosenPaNama || "Nama Dosen PA"}</div>
                  <div>NIP. ${dosenPaNip || "........................."}</div>
              </div>
              <div class="sig-col" style="padding-left: 50px;">
                  <div>Penulis,</div>
                  <div class="sig-box">
                      ${studentSignatureUrl ? `<img src="${studentSignatureUrl}" class="sig-img" />` : ""}
                  </div>
                  <div class="sig-name">${studentName}</div>
                  <div>NIM. ${studentNim}</div>
              </div>
          </div>

          <div class="appendix">
              <div style="font-weight: 500; margin-bottom: 10px;">Lampiran:</div>
              <div style="font-style: italic; font-size: 10pt; color: #666; margin-bottom: 5px;">*Bentuk sesuai dengan tinjauan pustaka</div>
              <div style="font-weight: 500; margin-bottom: 15px;">Jurnal Referensi:</div>
              <div class="appendix-content">${jurnalReferensi || "-"}</div>
          </div>
      </body>
      </html>
    `;
    }
    async generateBulkPdf(data) {
        const browser = await puppeteer_1.default.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        try {
            const page = await browser.newPage();
            const htmlContent = this.getBulkExamDocumentsTemplate(data);
            await page.setContent(htmlContent, {
                waitUntil: ["load", "networkidle0"],
            });
            const pdfBuffer = await page.pdf({
                width: "8.5in",
                height: "13in",
                printBackground: true,
                margin: {
                    top: "0.39in",
                    right: "1.0in",
                    bottom: "1.0in",
                    left: "1.0in",
                },
            });
            return pdfBuffer;
        }
        catch (error) {
            console.error("[PdfService] ERROR generating Bulk PDF:", error);
            throw error;
        }
        finally {
            await browser.close();
        }
    }
    getBulkExamDocumentsTemplate(data) {
        const { beritaAcara, daftarHadir, rekapitulasi, nilaiIndividual, perbaikan, } = data;
        return `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: 'Arial', sans-serif; font-size: 11pt; line-height: 1.3; margin: 0; padding: 0; }
              .page-break { page-break-after: always; }
              .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 2px solid black; }
              .header-table td { border: 1px solid black; padding: 5px; vertical-align: middle; }
              .logo { width: 60px; height: auto; }
              .univ-info { text-align: left; font-size: 9pt; }
              .doc-info { text-align: center; font-size: 8pt; }
              .main-title { text-align: center; border-top: 2px solid black; padding: 10px; font-weight: bold; text-transform: uppercase; font-size: 10pt; }
              .title-section { text-align: center; margin: 15px 0; font-weight: bold; text-transform: uppercase; text-decoration: underline; font-size: 11pt; }
              .info-table { border-collapse: collapse; margin-left: 10px; width: 100%; }
              .info-table td { padding: 2px 5px; vertical-align: top; font-size: 10pt; }
              .penguji-table, .nilai-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              .penguji-table th, .penguji-table td, .nilai-table th, .nilai-table td { border: 1px solid black; padding: 5px; text-align: left; font-size: 9pt; }
              .penguji-table th, .nilai-table th { text-align: center; background-color: #f2f2f2; }
              .footer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
              .sig-box { font-size: 10pt; }
              .sig-space { height: 50px; }
          </style>
      </head>
      <body>
          <!-- 1. BERITA ACARA -->
          <div class="page-break">
              ${this.getBeritaAcaraContent(beritaAcara)}
          </div>

          <!-- 2. LAMPIRAN BERITA ACARA -->
          <div class="page-break">
              ${this.getLampiranBeritaAcaraContent(beritaAcara)}
          </div>

          <!-- 3. DAFTAR HADIR -->
          <div class="page-break">
            ${this.getDaftarHadirContent(daftarHadir)}
          </div>

          <!-- 4. REKAPITULASI NILAI -->
          <div class="page-break">
            ${this.getRekapitulasiNilaiContent(rekapitulasi)}
          </div>

          <!-- 5-8. NILAI INDIVIDUAL -->
          ${nilaiIndividual
            .map((n) => `
            <div class="page-break">
              ${this.getNilaiIndividualContent(n)}
            </div>
          `)
            .join("")}

          <!-- 9. PERBAIKAN -->
          <div>
            ${this.getPerbaikanContent(perbaikan)}
          </div>
      </body>
      </html>
    `;
    }
    getHeader(formCode, formTitle, revision = "01", date = "1 Agustus 2018") {
        const logoUrl = "https://upload.wikimedia.org/wikipedia/id/8/80/Logo_UIN_Raden_Fatah.png";
        return `
      <table class="header-table">
          <tr>
              <td rowspan="2" align="center" style="width: 80px;">
                  <img src="${logoUrl}" class="logo">
              </td>
              <td colspan="2" class="univ-info">
                  <strong>UIN RADEN FATAH PALEMBANG</strong><br>
                  FAKULTAS SAINS DAN TEKNOLOGI<br>
                  Jl. Prof. K.H. Zainal Abidin Fikry Palembang
              </td>
              <td class="doc-info" style="width: 70px;">Revisi ${revision}</td>
              <td class="doc-info" style="width: 100px;">${date}</td>
          </tr>
          <tr>
              <td colspan="2" class="univ-info" style="border: none;"></td>
              <td colspan="2" class="doc-info">
                  Kode<br>
                  ${formCode}
              </td>
          </tr>
          <tr>
              <td colspan="3" class="main-title">
                  ${formTitle}
              </td>
              <td colspan="2" class="doc-info">
                  Tgl. Terbit<br>
                  1 Februari 2018
              </td>
          </tr>
      </table>
    `;
    }
    getBeritaAcaraContent(data) {
        const { studentName, studentNim, prodiName, judul, jenisUjian, hari, tanggal, bulan, tahun, pengujiList, keputusan, tempat, tanggalDitetapkan, ketuaPenguji, sekretarisPenguji, } = data;
        return `
      ${this.getHeader("FST. FORM SKRIPSI 03", "Formulir Berita Acara Ujian " + jenisUjian)}
      <div class="title-section">BERITA ACARA UJIAN ${jenisUjian.toUpperCase()}</div>
      <p style="font-size: 10pt;">Pada hari ini <strong>${hari}</strong>, tanggal <strong>${tanggal}</strong>, bulan <strong>${bulan}</strong>, tahun <strong>${tahun}</strong> telah dilaksanakan ujian ${jenisUjian.toLowerCase()} skripsi:</p>
      <table class="info-table">
          <tr><td style="width: 120px;">Nama</td><td>: ${studentName}</td></tr>
          <tr><td>NIM</td><td>: ${studentNim}</td></tr>
          <tr><td>Program Studi</td><td>: ${prodiName}</td></tr>
          <tr><td>Judul</td><td>: ${judul}</td></tr>
      </table>
      <p style="font-size: 10pt;">Tim Penguji:</p>
      <table class="penguji-table">
          <thead><tr><th>No</th><th>Nama</th><th>Jabatan</th><th style="width: 100px;">Tanda Tangan</th></tr></thead>
          <tbody>
              ${pengujiList
            .map((p, idx) => `
                <tr><td align="center">${idx + 1}.</td><td>${p.name}</td><td>${p.role}</td>
                <td align="center">${p.signatureUrl ? `<img src="${p.signatureUrl}" style="height: 30px;">` : ""}</td></tr>
              `)
            .join("")}
          </tbody>
      </table>
      <div style="margin-top: 15px; font-weight: bold; font-size: 10pt;">
          MEMUTUSKAN: ${jenisUjian} saudara dinyatakan ${keputusan === "lulus" ? "DITERIMA" : "DITOLAK"} dengan catatan terlampir.
      </div>
      <div style="margin-top: 20px; text-align: right; font-size: 10pt;">
          Ditetapkan di: ${tempat || "Palembang"}<br>Pada tanggal: ${tanggalDitetapkan}
      </div>
      <div class="footer-grid">
          <div class="sig-box">Ketua Penguji,<br><div class="sig-space">${ketuaPenguji?.signatureUrl ? `<img src="${ketuaPenguji.signatureUrl}" style="height: 40px;">` : ""}</div><strong>${ketuaPenguji?.name || "........................."}</strong></div>
          <div class="sig-box">Sekretaris Penguji,<br><div class="sig-space">${sekretarisPenguji?.signatureUrl ? `<img src="${sekretarisPenguji.signatureUrl}" style="height: 40px;">` : ""}</div><strong>${sekretarisPenguji?.name || "........................."}</strong></div>
      </div>
    `;
    }
    getLampiranBeritaAcaraContent(data) {
        const { studentName, studentNim, jenisUjian, catatanRevisi, sekretarisPenguji, } = data;
        return `
      <div class="title-section" style="text-decoration: none;">LAMPIRAN: BERITA ACARA PELAKSANAAN UJIAN ${jenisUjian.toUpperCase()} SKRIPSI</div>
      <table class="info-table" style="margin-bottom: 15px;">
          <tr><td style="width: 120px;">Nama Mahasiswa</td><td>: ${studentName}</td></tr>
          <tr><td>NIM</td><td>: ${studentNim}</td></tr>
      </table>
      <div style="font-size: 10pt; margin-bottom: 5px;">Catatan/Daftar Revisi Penguji:</div>
      <div style="border: 1px solid black; min-height: 400px; padding: 10px; font-size: 10pt; white-space: pre-wrap;">${catatanRevisi || ""}</div>
      <div style="margin-top: 30px; text-align: right; font-size: 10pt;">
          Palembang,<br>Sekretaris Penguji,<br><br><br><br><strong>${sekretarisPenguji?.name || "........................."}</strong>
      </div>
    `;
    }
    getDaftarHadirContent(data) {
        const { hari, tanggal, bulan, tahun, studentName, studentNim, judul, pengujiList, kaprodi, } = data;
        return `
      ${this.getHeader("FST. FORM SKRIPSI 04", "Formulir Daftar Hadir Ujian " + data.jenisUjian)}
      <table class="info-table" style="margin: 15px 0;">
          <tr><td style="width: 120px;">Hari/Tanggal</td><td>: ${hari} / ${tanggal} ${bulan} ${tahun}</td></tr>
          <tr><td>Nama Mahasiswa</td><td>: ${studentName}</td></tr>
          <tr><td>NIM</td><td>: ${studentNim}</td></tr>
          <tr><td>Judul Skripsi</td><td>: ${judul}</td></tr>
      </table>
      <table class="penguji-table">
          <thead><tr><th>No</th><th>Nama</th><th>NIP/NIDN</th><th>Jabatan</th><th style="width: 100px;">Tanda Tangan</th></tr></thead>
          <tbody>
              ${pengujiList
            .map((p, idx) => `
                <tr><td align="center">${idx + 1}.</td><td>${p.name}</td><td>${p.nip || "-"}</td><td>${p.role}</td>
                <td align="center">${p.signatureUrl ? `<img src="${p.signatureUrl}" style="height: 30px;">` : ""}</td></tr>
              `)
            .join("")}
          </tbody>
      </table>
      <div style="margin-top: 40px; text-align: right; font-size: 10pt; padding-right: 50px;">
          Palembang,<br>Ketua Program Studi,<br><br><br><br><strong>${kaprodi?.name}</strong><br>NIP. ${kaprodi?.nip}
      </div>
    `;
    }
    getRekapitulasiNilaiContent(data) {
        const { hari, tanggal, bulan, tahun, studentName, studentNim, judul, pengujiList, totalAngka, rataRata, nilaiHuruf, kaprodi, } = data;
        return `
      ${this.getHeader("FST. FORM SKRIPSI 05", "Formulir Rekapitulasi Nilai Ujian ")}
      <table class="info-table" style="margin: 15px 0;">
          <tr><td style="width: 120px;">Hari/Tanggal</td><td>: ${hari} / ${tanggal} ${bulan} ${tahun}</td></tr>
          <tr><td>Nama/NIM</td><td>: ${studentName} / ${studentNim}</td></tr>
          <tr><td>Judul Skripsi</td><td>: ${judul}</td></tr>
      </table>
      <table class="nilai-table">
          <thead><tr><th>No</th><th>Nama</th><th>Jabatan</th><th>Angka Nilai</th></tr></thead>
          <tbody>
              ${pengujiList
            .map((p, idx) => `
                <tr><td align="center">${idx + 1}.</td><td>${p.name}</td><td>${p.role}</td><td align="center">${p.nilai || "-"}</td></tr>
              `)
            .join("")}
              <tr><td colspan="3" align="right"><strong>Total Angka Nilai</strong></td><td align="center">${totalAngka}</td></tr>
              <tr><td colspan="3" align="right"><strong>Nilai Rata-rata</strong></td><td align="center">${rataRata}</td></tr>
              <tr><td colspan="3" align="right"><strong>Nilai Huruf</strong></td><td align="center">${nilaiHuruf}</td></tr>
          </tbody>
      </table>
      <div style="margin-top: 40px; text-align: right; font-size: 10pt; padding-right: 50px;">
          Palembang,<br>Ketua Program Studi,<br><br><br><br><strong>${kaprodi?.name}</strong><br>NIP. ${kaprodi?.nip}
      </div>
    `;
    }
    getNilaiIndividualContent(data) {
        const { formCode, role, studentName, studentNim, prodiName, pengujiName, pengujiSignatureUrl, penilaians, totalSkor, } = data;
        return `
      ${this.getHeader(formCode, "Formulir Nilai Ujian " + data.jenisUjian)}
      <div style="text-align: center; font-weight: bold; margin-bottom: 10px;">${role.toUpperCase()}</div>
      <table class="info-table" style="margin-bottom: 15px;">
          <tr><td style="width: 120px;">Nama</td><td>: ${studentName}</td></tr>
          <tr><td>NIM</td><td>: ${studentNim}</td></tr>
          <tr><td>Program Studi</td><td>: ${prodiName}</td></tr>
          <tr><td>${role}</td><td>: ${pengujiName}</td></tr>
      </table>
      <table class="nilai-table">
          <thead><tr><th>Kriteria</th><th>Indikator Penilaian</th><th>Bobot (%)</th><th>Skor</th><th>Bobot * Skor</th></tr></thead>
          <tbody>
              ${penilaians
            .map((p) => `
                <tr><td>${p.kriteria}</td><td>${p.indikator}</td><td align="center">${p.bobot}</td><td align="center">${p.skor}</td><td align="center">${p.bobotSkor}</td></tr>
              `)
            .join("")}
              <tr><td colspan="4" align="right"><strong>Skor Akhir Total</strong></td><td align="center">${totalSkor}</td></tr>
          </tbody>
      </table>
      <div style="margin-top: 30px; text-align: right; font-size: 10pt;">
          Palembang,<br>${role},<br><div class="sig-space">${pengujiSignatureUrl ? `<img src="${pengujiSignatureUrl}" style="height: 40px;">` : ""}</div><strong>${pengujiName}</strong>
      </div>
    `;
    }
    getPerbaikanContent(data) {
        const { studentName, studentNim, prodiName, judul, pembimbing1, pembimbing2, tanggalSeminar, ketuaPenguji, sekretarisPenguji, kaprodi, } = data;
        return `
      ${this.getHeader("FST. FORM SKRIPSI 10", "Formulir Perbaikan Proposal Skripsi", "02", "21 Juli 2022")}
      <table class="info-table" style="margin-top: 15px;">
          <tr><td style="width: 150px;">Nama</td><td>: ${studentName}</td></tr>
          <tr><td>NIM</td><td>: ${studentNim}</td></tr>
          <tr><td>Program Studi</td><td>: ${prodiName || "SISTEM INFORMASI"}</td></tr>
          <tr><td>Judul Proposal Setelah</td><td>: ${judul}</td></tr>
      </table>
      <p style="font-size: 9pt; font-style: italic; margin-top: 15px;">(Kepada mahasiswa harap diisi sesuai dengan hasil ujian proposal skripsi)</p>
      <table class="info-table">
          <tr><td style="width: 150px;">Dosen Pembimbing I</td><td>: ${pembimbing1}</td></tr>
          <tr><td style="width: 150px;">Dosen Pembimbing II</td><td>: ${pembimbing2}</td></tr>
          <tr><td style="width: 150px;">Tanggal Seminar</td><td>: ${tanggalSeminar}</td></tr>
      </table>
      <p style="font-size: 10pt; margin-top: 15px;">Telah diperbaiki dan dikonsultasikan dengan Pembimbing/Penguji Proposal Skripsi.</p>
      <table class="penguji-table">
          <thead><tr><th>No</th><th>Nama</th><th>Jabatan</th><th>Tanggal</th><th>Tanda Tangan</th></tr></thead>
          <tbody>
              <tr><td align="center">1.</td><td>${ketuaPenguji?.name}</td><td>Ketua Penguji</td><td></td><td></td></tr>
              <tr><td align="center">2.</td><td>${sekretarisPenguji?.name}</td><td>Sekretaris Penguji</td><td></td><td></td></tr>
          </tbody>
      </table>
      <div style="margin-top: 40px; text-align: right; font-size: 10pt; padding-right: 50px;">
          Palembang,<br>Ketua Program Studi,<br><br><br><br><strong>${kaprodi?.name}</strong><br>NIP. ${kaprodi?.nip}
      </div>
    `;
    }
    getJadwalUjianTemplate(data) {
        const { sections, filterTitle } = data;
        return `
      <!DOCTYPE html>
      <html lang="id">
      <head>
          <meta charset="UTF-8">
          <style>
              body {
                  font-family: 'Arial', sans-serif;
                  font-size: 8pt;
                  color: #000;
                  margin: 20px;
              }
              .section-header {
                  font-size: 14pt;
                  font-weight: bold;
                  margin-top: 30px;
                  margin-bottom: 10px;
                  text-transform: uppercase;
                  border-bottom: 2px solid #000;
                  padding-bottom: 5px;
              }
              table {
                  width: 100%;
                  border-collapse: collapse;
                  table-layout: fixed;
              }
              th, td {
                  border: 1px solid #000;
                  padding: 4px;
                  text-align: left;
                  word-wrap: break-word;
                  vertical-align: top;
              }
              th {
                  background-color: #5b9bd5;
                  color: #fff;
                  font-weight: bold;
                  text-transform: uppercase;
                  text-align: center;
              }
              .no-col { width: 25px; text-align: center; }
              .nim-col { width: 80px; text-align: center; }
              .nama-col { width: 100px; }
              .waktu-col { width: 90px; text-align: center; }
              .ruang-col { width: 60px; text-align: center; }
              .judul-col { width: auto; }
              .penguji-col { width: 95px; }
              
              .sub-text {
                  font-size: 7pt;
                  color: #333;
                  display: block;
              }
              .ruang-detail {
                  font-size: 7pt;
                  font-style: italic;
              }
              .note-box {
                  margin-top: 20px;
                  padding: 10px;
                  border: 1px solid #000;
                  background-color: #f9f9f9;
              }
          </style>
      </head>
      <body>
          <h1 style="text-align: center; font-size: 16pt; margin-bottom: 5px;">JADWAL UJIAN SKRIPSI</h1>
          ${filterTitle ? `<p style="text-align: center; margin-bottom: 20px; font-weight: bold;">${filterTitle}</p>` : ""}

          ${sections
            .map((section) => `
              <div class="section-header">${section.title}</div>
              <table>
                  <thead>
                      <tr>
                          <th class="no-col">NO</th>
                          <th class="nim-col">NIM</th>
                          <th class="nama-col">NAMA</th>
                          <th class="waktu-col">WAKTU</th>
                          <th class="ruang-col">RUANG</th>
                          <th class="judul-col">JUDUL</th>
                          <th class="penguji-col">KETUA PENGUJI</th>
                          <th class="penguji-col">SEKRETARIS PENGUJI</th>
                          <th class="penguji-col">PENGUJI I</th>
                          <th class="penguji-col">PENGUJI II</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${section.items
            .map((item, idx) => `
                          <tr>
                              <td class="no-col">${idx + 1}</td>
                              <td class="nim-col">${item.nim}</td>
                              <td class="nama-col">${item.nama}</td>
                              <td class="waktu-col">
                                  ${item.hari}, ${item.tanggal}<br>
                                  <span class="sub-text">${item.waktu}</span>
                              </td>
                              <td class="ruang-col">
                                   ${item.ruang}
                                   ${item.ruangDetail && item.ruangDetail !== "-" ? `<br><span class="ruang-detail">(${item.ruangDetail})</span>` : ""}
                              </td>
                              <td class="judul-col">${item.judul}</td>
                              <td class="penguji-col">${item.pengujiKetua}</td>
                              <td class="penguji-col">${item.pengujiSekretaris}</td>
                              <td class="penguji-col">${item.penguji1}</td>
                              <td class="penguji-col">${item.penguji2}</td>
                          </tr>
                      `)
            .join("")}
                  </tbody>
              </table>
          `)
            .join("")}

          <div class="note-box">
              <strong>Keterangan:</strong><br>
              Untuk teknis ujian silahkan hubungi pembimbing masing-masing. Peserta diharuskan hadir paling lambat 1 jam sebelum jadwal ujian.
          </div>
      </body>
      </html>
    `;
    }
    async generateSuratJudulPdf(data) {
        const browser = await puppeteer_1.default.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
            ],
        });
        try {
            const page = await browser.newPage();
            // Read logo and convert to base64
            let logoBase64 = "";
            try {
                const logoPath = path_1.default.join(process.cwd(), "public", "uin-logo.png");
                if (fs_1.default.existsSync(logoPath)) {
                    const logoBuffer = fs_1.default.readFileSync(logoPath);
                    logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;
                }
            }
            catch (err) {
                console.error("[PdfService] Error reading logo file:", err);
            }
            const htmlContent = this.getSuratJudulTemplate({ ...data, logoBase64 });
            await page.setContent(htmlContent, {
                waitUntil: ["load", "networkidle0"],
            });
            const pdfBuffer = await page.pdf({
                format: "A4",
                printBackground: true,
                margin: {
                    top: "0.39in",
                    right: "1.0in",
                    bottom: "1.0in",
                    left: "1.0in",
                },
            });
            return pdfBuffer;
        }
        catch (error) {
            console.error("[PdfService] ERROR generating Surat Judul PDF:", error);
            throw error;
        }
        finally {
            await browser.close();
        }
    }
    getSuratJudulTemplate(data) {
        const { studentName, studentNim, studentSemester, prodiName, judul, pembimbing1Name, pembimbing2Name, kaprodi, tanggal, logoBase64, } = data;
        return `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { 
                  font-family: 'Arial', sans-serif; 
                  font-size: 10.5pt; 
                  line-height: 1.3; 
                  margin: 0; 
                  padding: 0; 
                  color: #000;
              }
              @page {
                  size: A4;
                  margin: 0.5in 0.8in 0.5in 0.8in;
              }
              .header-table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin-bottom: 15px; 
                  border: 1.5px solid black; 
              }
              .header-table td { 
                  border: 1px solid black; 
                  padding: 6px; 
                  vertical-align: middle; 
              }
              .logo { width: 65px; height: auto; display: block; margin: 0 auto; }
              .univ-info { text-align: left; font-size: 9pt; line-height: 1.1; }
              .doc-info { text-align: center; font-size: 8pt; }
              .main-title { 
                  text-align: center; 
                  padding: 8px; 
                  font-weight: normal; 
                  font-size: 12pt; 
                  line-height: 1.1;
              }
              
              .content { margin-top: 2px; }
              .date-section { text-align: right; margin-bottom: 10px; margin-right: 10px; }
              .recipient-section { margin-bottom: 10px; }
              
              .info-table { margin: 10px 0; border-collapse: collapse; width: 100%; }
              .info-table td { padding: 2px 5px; vertical-align: top; }
              
              .judul-section { margin: 10px 0; }
              .judul-row { display: flex; margin-bottom: 8px; }
              .judul-num { width: 25px; shrink: 0; }
              .judul-line { border-bottom: 1px dotted black; height: 18px; margin-top: 2px; }

              .sig-section { margin-top: 20px; position: relative; }
              .sig-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              .sig-table td { width: 50%; vertical-align: top; padding-bottom: 5px; }
              .sig-space { height: 55px; }
              
              .pembimbing-table { width: 100%; margin-top: 10px; border-collapse: collapse; }
              .pembimbing-table td { padding: 3px 0; }

              .notes { 
                  margin-top: 15px; 
                  font-size: 8pt; 
                  line-height: 1.2;
              }
              .notes ul { margin: 3px 0; padding-left: 18px; list-style-type: disc; }
              .notes li { margin-bottom: 2px; }

              .line-dots { border-bottom: 1px dotted black; display: inline-block; min-width: 300px; }
          </style>
      </head>
      <body>
          <table class="header-table">
              <tr>
                  <td rowspan="2" align="center" style="width: 90px;">
                      <img src="${logoBase64}" class="logo">
                  </td>
                  <td class="univ-info" style="width: 320px;">
                      <strong>UIN RADEN FATAH PALEMBANG</strong><br>
                      FAKULTAS SAINS DAN TEKNOLOGI<br>
                      Jl. Prof. K.H. Zainal Abidin Fikry<br>
                      Palembang
                  </td>
                  <td class="doc-info" style="width: 80px;">Revisi 01</td>
                  <td class="doc-info" style="width: 100px;">1 Agustus 2018</td>
              </tr>
              <tr>
                  <td colspan="2" class="main-title">
                      Formulir<br>
                      <strong>Pengajuan Judul dan Pembimbing Skripsi</strong>
                  </td>
                  <td class="doc-info">
                      Kode<br>
                      FST. FORM SKRIPSI 01
                  </td>
              </tr>
              <tr>
                  <td colspan="3"></td>
                  <td class="doc-info">
                      Tgl. Terbit<br>
                      1 Pebruari 2018
                  </td>
              </tr>
          </table>
          
          <div class="content">
              <div class="date-section">
                  Palembang, .....................................................................
              </div>
              
              <div class="recipient-section">
                  <table style="width: 100%;">
                      <tr>
                        <td style="width: 70px;">Perihal</td>
                        <td>: <strong>Permohonan Judul & Pembimbing Skripsi</strong></td>
                      </tr>
                  </table>
                  <br>
                  Kepada Yth.<br>
                  Ketua Program Studi ........................................................<br>
                  Fakultas Sains dan Teknologi<br>
                  Universitas Islam Negeri Raden Fatah<br>
                  Palembang
              </div>

              <p style="margin: 5px 0;"><i>Assalamu ‘alaikum Warohmatullahi Wabarokatuh.</i></p>
              
              <p style="margin: 5px 0;">Saya yang bertanda tangan dibawah ini, mahasiswa Program Studi Sistem Informasi Fakultas Sains dan Teknologi Universitas Islam Negeri Raden Fatah Palembang.</p>
              
              <table class="info-table">
                  <tr>
                      <td style="width: 110px;">Nama</td>
                      <td>: <span class="line-dots" style="min-width: 400px;">${studentName || ""}</span></td>
                  </tr>
                  <tr>
                      <td>NIM</td>
                      <td>: <span class="line-dots" style="min-width: 400px;">${studentNim || ""}</span></td>
                  </tr>
                  <tr>
                      <td>Semester</td>
                      <td>: <span class="line-dots" style="min-width: 400px;">${studentSemester || ""}</span></td>
                  </tr>
              </table>

              <p style="margin: 5px 0;">Sehubungan dengan akan berakhirnya studi saya, maka dengan ini mengajukan permohonan judul dan pembimbing Skripsi. Adapun judul yang saya ajukan sebagai berikut:</p>
              
              <div class="judul-section">
                  <div class="judul-row">
                      <div class="judul-num">1.</div>
                      <div style="flex-grow: 1;">
                          <div style="border-bottom: 1px dotted black; min-height: 18px;">${judul || ""}</div>
                          <div class="judul-line"></div>
                      </div>
                  </div>
                  <div class="judul-row">
                      <div class="judul-num">2.</div>
                      <div style="flex-grow: 1;">
                          <div class="judul-line" style="margin-top: 0;"></div>
                          <div class="judul-line"></div>
                      </div>
                  </div>
                  <div class="judul-row">
                      <div class="judul-num">3.</div>
                      <div style="flex-grow: 1;">
                          <div class="judul-line" style="margin-top: 0;"></div>
                          <div class="judul-line"></div>
                      </div>
                  </div>
              </div>

              <p style="margin: 5px 0;">Atas perhatiannya, saya ucapkan terima kasih.</p>
              
              <p style="margin: 5px 0;"><i>Wassalamu ‘alaikum Warohmatullahi Wabarokatuh.</i></p>

              <table class="sig-table">
                  <tr>
                      <td align="center">
                          Ketua Program Studi
                      </td>
                      <td align="center">
                          Hormat saya,
                      </td>
                  </tr>
                  <tr>
                      <td class="sig-space"></td>
                      <td class="sig-space"></td>
                  </tr>
                  <tr>
                      <td align="center">
                          <span class="line-dots" style="min-width: 180px;">${kaprodi?.name || ""}</span><br>
                          NIP. <span class="line-dots" style="min-width: 160px;">${kaprodi?.nip || ""}</span>
                      </td>
                      <td align="center">
                          <span class="line-dots" style="min-width: 180px;">${studentName || ""}</span>
                      </td>
                  </tr>
              </table>

              <table class="pembimbing-table">
                  <tr>
                      <td style="width: 110px;">Pembimbing I</td>
                      <td style="width: 10px;">:</td>
                      <td style="border-bottom: 1px dotted black;">${pembimbing1Name || ""}</td>
                      <td style="width: 180px; text-align: right;">(...........................................)</td>
                  </tr>
                  <tr>
                      <td>Pembimbing II</td>
                      <td>:</td>
                      <td style="border-bottom: 1px dotted black;">${pembimbing2Name || ""}</td>
                      <td style="text-align: right;">(...........................................)</td>
                  </tr>
              </table>

              <div class="notes">
                  <strong>*) Catatan lampiran pengajuan:</strong>
                  <ul>
                      <li>Formulir di isi lengkap (Pembimbing diisi KaProdi dan ditanda tangani pembimbing yang bersangkutan setelah di ACC KaProdi)</li>
                      <li>Rancangan penelitian beserta kelengkapannya</li>
                      <li>Photocopy KTM</li>
                      <li>Photocopy kwitansi pembayaran SPP semester berjalan</li>
                      <li>Photocopy KST yang tercantum Skripsi</li>
                      <li>Photocopy Transkrip Nilai</li>
                      <li>Seluruh berkas dimasukkan dalam map plastik transparan warna biru</li>
                  </ul>
              </div>
          </div>
      </body>
      </html>
    `;
    }
}
exports.PdfService = PdfService;
exports.pdfService = new PdfService();
