import puppeteer from "puppeteer";

export class PdfService {
  async generateRanpelPdf(data: any) {
    console.log("[PdfService] Launching browser...");
    const browser = await puppeteer.launch({
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
      console.log(
        `[PdfService] HTML content prepared (length: ${htmlContent.length})`,
      );

      console.log("[PdfService] Setting page content...");
      await page.setContent(htmlContent, {
        waitUntil: ["load", "networkidle0"],
      });

      console.log("[PdfService] Generating PDF buffer...");
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

      console.log(
        `[PdfService] Done. Generated buffer size: ${pdfBuffer.length}`,
      );
      return pdfBuffer;
    } catch (error) {
      console.error("[PdfService] ERROR during PDF generation:", error);
      throw error;
    } finally {
      await browser.close();
      console.log("[PdfService] Browser closed.");
    }
  }

  async generateBeritaAcaraPdf(data: any) {
    const browser = await puppeteer.launch({
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
    } catch (error) {
      console.error("[PdfService] ERROR generating Berita Acara PDF:", error);
      throw error;
    } finally {
      await browser.close();
    }
  }

  async generateJadwalUjianPdf(data: any) {
    const browser = await puppeteer.launch({
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
    } catch (error) {
      console.error("[PdfService] ERROR generating Jadwal Ujian PDF:", error);
      throw error;
    } finally {
      await browser.close();
    }
  }

  private getRanpelTemplate(data: any) {
    const {
      studentName,
      studentNim,
      judulPenelitian,
      masalahDanPenyebab,
      alternatifSolusi,
      hasilYangDiharapkan,
      kebutuhanData,
      metodePenelitian,
      jurnalReferensi,
      dosenPaNama,
      dosenPaNip,
      dosenPaSignatureUrl,
      studentSignatureUrl,
      tanggal,
    } = data;

    return `
      <!DOCTYPE html>
      <html lang="id">
      <head>
          <meta charset="UTF-8">
          <style>
              body {
                  font-family: 'Times New Roman', serif;
                  line-height: 1.5;
                  color: #1a1a1a;
                  font-size: 12pt;
                  margin: 0;
                  padding: 0;
              }
              .header {
                  text-align: center;
                  margin-bottom: 40px;
              }
              .header h1 {
                  font-size: 26pt;
                  font-weight: bold;
                  margin: 0;
                  text-transform: uppercase;
                  letter-spacing: 2px;
                  color: #1a1a1a;
              }
              .blue-line {
                  height: 3px;
                  background-color: #4a90e2;
                  width: 100%;
                  margin: 10px 0 20px 0;
              }
              .italic-label {
                  font-style: italic;
                  font-size: 12pt;
                  color: #666;
                  margin-bottom: 5px;
              }
              .judul {
                  font-weight: 800;
                  text-transform: uppercase;
                  margin-bottom: 20px;
                  font-size: 14pt;
                  line-height: 1.2;
              }
              .student-info { 
                font-weight: 500;
                color: #444;
                margin-top: 15px;
              }
              .section {
                  display: flex;
                  margin-bottom: 25px;
                  gap: 15px;
              }
              .section-number {
                  width: 25px;
                  font-weight: bold;
              }
              .section-content { flex: 1; }
              .section-title {
                  font-weight: bold;
                  margin-bottom: 4px;
                  font-size: 12pt;
              }
              .section-text {
                text-align: justify;
                color: #333;
              }
              .signature-area {
                  margin-top: 80px;
                  page-break-inside: avoid;
              }
              .date-location {
                  text-align: right;
                  margin-bottom: 30px;
              }
              .signature-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 40px;
              }
              .sig-box {
                  text-align: left;
              }
              .sig-box-right {
                padding-left: 60px;
              }
              .sig-space { height: 100px; }
              .sig-name {
                  font-weight: bold;
                  text-decoration: underline;
              }
              .footer-section {
                  margin-top: 60px;
                  border-top: 1px solid #eee;
                  padding-top: 20px;
              }
              .lampiran-title { font-weight: bold; }
              .lampiran-note { font-style: italic; font-size: 11pt; color: #666; }
              .referensi-box {
                  margin-top: 10px;
                  padding-left: 20px;
                  border-left: 2px solid #4a90e2;
                  text-align: justify;
                  font-size: 11pt;
                  color: #333;
              }
          </style>
      </head>
      <body>
          <div class="header">
              <h1>RANCANGAN PENELITIAN</h1>
              <div class="blue-line"></div>
              <div class="italic-label">Judul Penelitian</div>
              <div class="judul">&ldquo;${judulPenelitian}&rdquo;</div>
              <div class="student-info">${studentName} (${studentNim})</div>
          </div>

          <div class="section">
              <div class="section-number">1.</div>
              <div class="section-content">
                  <div class="section-title">Masalah dan Penyebab</div>
                  <div class="section-text">${masalahDanPenyebab || "-"}</div>
              </div>
          </div>

          <div class="section">
              <div class="section-number">2.</div>
              <div class="section-content">
                  <div class="section-title">Alternatif Solusi</div>
                  <div class="section-text">${alternatifSolusi || "-"}</div>
              </div>
          </div>

          <div class="section">
              <div class="section-number">3.</div>
              <div class="section-content">
                  <div class="section-title">Hasil yang diharapkan</div>
                  <div class="section-text">${hasilYangDiharapkan || "-"}</div>
              </div>
          </div>

          <div class="section">
              <div class="section-number">4.</div>
              <div class="section-content">
                  <div class="section-title">Kebutuhan Data</div>
                  <div class="section-text">${kebutuhanData || "-"}</div>
              </div>
          </div>

          <div class="section">
              <div class="section-number">5.</div>
              <div class="section-content">
                  <div class="section-title">Metode Pelaksanaan</div>
                  <div class="section-text">${metodePenelitian || "-"}</div>
              </div>
          </div>

          <div class="signature-area">
              <div class="date-location">Palembang, ${tanggal}</div>
              <div style="margin-bottom: 15px; font-weight: 500;">Menyetujui:</div>
              <div class="signature-grid">
                  <div class="sig-box">
                      <div>Dosen PA,</div>
                      <div class="sig-space">
                        ${dosenPaSignatureUrl ? `<img src="${dosenPaSignatureUrl}" style="height: 80px; width: auto; max-width: 150px; object-fit: contain;" />` : ""}
                      </div>
                      <div class="sig-name">${dosenPaNama || "Nama Dosen PA"}</div>
                      <div>NIP. ${dosenPaNip || "........................."}</div>
                  </div>
                  <div class="sig-box sig-box-right">
                      <div>Penulis</div>
                      <div class="sig-space">
                        ${studentSignatureUrl ? `<img src="${studentSignatureUrl}" style="height: 80px; width: auto; max-width: 150px; object-fit: contain;" />` : ""}
                      </div>
                      <div class="sig-name">${studentName}</div>
                      <div>NIM ${studentNim}</div>
                  </div>
              </div>
          </div>

          <div class="footer-section">
              <div class="lampiran-title">Lampiran:</div>
              <div class="lampiran-note">*Bentuk sesuai dengan tinjauan pustaka</div>
              <div style="font-weight: bold; margin-top: 15px;">Jurnal Referensi:</div>
              <div class="referensi-box">
                  ${jurnalReferensi || "-"}
              </div>
          </div>
      </body>
      </html>
    `;
  }

  async generateBulkPdf(data: any) {
    const browser = await puppeteer.launch({
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
    } catch (error) {
      console.error("[PdfService] ERROR generating Bulk PDF:", error);
      throw error;
    } finally {
      await browser.close();
    }
  }

  private getBulkExamDocumentsTemplate(data: any) {
    const {
      beritaAcara,
      daftarHadir,
      rekapitulasi,
      nilaiIndividual,
      perbaikan,
    } = data;

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
            .map(
              (n: any) => `
            <div class="page-break">
              ${this.getNilaiIndividualContent(n)}
            </div>
          `,
            )
            .join("")}

          <!-- 9. PERBAIKAN -->
          <div>
            ${this.getPerbaikanContent(perbaikan)}
          </div>
      </body>
      </html>
    `;
  }

  private getHeader(
    formCode: string,
    formTitle: string,
    revision: string = "01",
    date: string = "1 Agustus 2018",
  ) {
    const logoUrl =
      "https://upload.wikimedia.org/wikipedia/id/8/80/Logo_UIN_Raden_Fatah.png";
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

  private getBeritaAcaraContent(data: any) {
    const {
      studentName,
      studentNim,
      prodiName,
      judul,
      jenisUjian,
      hari,
      tanggal,
      bulan,
      tahun,
      pengujiList,
      keputusan,
      tempat,
      tanggalDitetapkan,
      ketuaPenguji,
      sekretarisPenguji,
    } = data;

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
                .map(
                  (p: any, idx: number) => `
                <tr><td align="center">${idx + 1}.</td><td>${p.name}</td><td>${p.role}</td>
                <td align="center">${p.signatureUrl ? `<img src="${p.signatureUrl}" style="height: 30px;">` : ""}</td></tr>
              `,
                )
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

  private getLampiranBeritaAcaraContent(data: any) {
    const {
      studentName,
      studentNim,
      jenisUjian,
      catatanRevisi,
      sekretarisPenguji,
    } = data;
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

  private getDaftarHadirContent(data: any) {
    const {
      hari,
      tanggal,
      bulan,
      tahun,
      studentName,
      studentNim,
      judul,
      pengujiList,
      kaprodi,
    } = data;
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
                .map(
                  (p: any, idx: number) => `
                <tr><td align="center">${idx + 1}.</td><td>${p.name}</td><td>${p.nip || "-"}</td><td>${p.role}</td>
                <td align="center">${p.signatureUrl ? `<img src="${p.signatureUrl}" style="height: 30px;">` : ""}</td></tr>
              `,
                )
                .join("")}
          </tbody>
      </table>
      <div style="margin-top: 40px; text-align: right; font-size: 10pt; padding-right: 50px;">
          Palembang,<br>Ketua Program Studi,<br><br><br><br><strong>${kaprodi?.name}</strong><br>NIP. ${kaprodi?.nip}
      </div>
    `;
  }

  private getRekapitulasiNilaiContent(data: any) {
    const {
      hari,
      tanggal,
      bulan,
      tahun,
      studentName,
      studentNim,
      judul,
      pengujiList,
      totalAngka,
      rataRata,
      nilaiHuruf,
      kaprodi,
    } = data;
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
                .map(
                  (p: any, idx: number) => `
                <tr><td align="center">${idx + 1}.</td><td>${p.name}</td><td>${p.role}</td><td align="center">${p.nilai || "-"}</td></tr>
              `,
                )
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

  private getNilaiIndividualContent(data: any) {
    const {
      formCode,
      role,
      studentName,
      studentNim,
      prodiName,
      pengujiName,
      pengujiSignatureUrl,
      penilaians,
      totalSkor,
    } = data;
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
                .map(
                  (p: any) => `
                <tr><td>${p.kriteria}</td><td>${p.indikator}</td><td align="center">${p.bobot}</td><td align="center">${p.skor}</td><td align="center">${p.bobotSkor}</td></tr>
              `,
                )
                .join("")}
              <tr><td colspan="4" align="right"><strong>Skor Akhir Total</strong></td><td align="center">${totalSkor}</td></tr>
          </tbody>
      </table>
      <div style="margin-top: 30px; text-align: right; font-size: 10pt;">
          Palembang,<br>${role},<br><div class="sig-space">${pengujiSignatureUrl ? `<img src="${pengujiSignatureUrl}" style="height: 40px;">` : ""}</div><strong>${pengujiName}</strong>
      </div>
    `;
  }

  private getPerbaikanContent(data: any) {
    const {
      studentName,
      studentNim,
      prodiName,
      judul,
      pembimbing1,
      pembimbing2,
      tanggalSeminar,
      ketuaPenguji,
      sekretarisPenguji,
      kaprodi,
    } = data;
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

  private getJadwalUjianTemplate(data: any) {
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
              .nim-col { width: 70px; text-align: center; }
              .nama-col { width: 120px; }
              .waktu-col { width: 100px; text-align: center; }
              .ruang-col { width: 80px; text-align: center; }
              .judul-col { width: auto; }
              .penguji-col { width: 110px; }
              
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
            .map(
              (section: any) => `
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
                        .map(
                          (item: any, idx: number) => `
                          <tr>
                              <td class="no-col">${idx + 1}</td>
                              <td class="nim-col">${item.nim}</td>
                              <td class="nama-col">${item.nama}</td>
                              <td class="waktu-col">
                                  ${item.hari}, ${item.tanggal}<br>
                                  <span class="sub-text">${item.waktu}</span>
                              </td>
                              <td class="ruang-col">
                                  ${item.ruang}<br>
                                  <span class="ruang-detail">(${item.ruangDetail})</span>
                              </td>
                              <td class="judul-col">${item.judul}</td>
                              <td class="penguji-col">${item.pengujiKetua}</td>
                              <td class="penguji-col">${item.pengujiSekretaris}</td>
                              <td class="penguji-col">${item.penguji1}</td>
                              <td class="penguji-col">${item.penguji2}</td>
                          </tr>
                      `,
                        )
                        .join("")}
                  </tbody>
              </table>
          `,
            )
            .join("")}

          <div class="note-box">
              <strong>Keterangan:</strong><br>
              Untuk teknis ujian silahkan hubungi pembimbing masing-masing. Peserta diharuskan hadir paling lambat 1 jam sebelum jadwal ujian.
          </div>
      </body>
      </html>
    `;
  }
}

export const pdfService = new PdfService();
