"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pdfService = exports.PdfService = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
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
                    top: "20mm",
                    right: "25mm",
                    bottom: "20mm",
                    left: "25mm",
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
    getRanpelTemplate(data) {
        const { studentName, studentNim, judulPenelitian, masalahDanPenyebab, alternatifSolusi, hasilYangDiharapkan, kebutuhanData, metodePenelitian, jurnalReferensi, dosenPaNama, dosenPaNip, dosenPaSignatureUrl, studentSignatureUrl, tanggal, } = data;
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
}
exports.PdfService = PdfService;
exports.pdfService = new PdfService();
