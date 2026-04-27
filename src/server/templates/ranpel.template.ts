export const getRanpelTemplate = (data: any) => {
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
    tanggalReviewPa,
    tanggalReviewKaprodi,
    prodiName,
    statusKaprodi,
  } = data;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      dateStyle: "long",
    });
  };

  return `
      <!DOCTYPE html>
      <html lang="id">
      <head>
          <meta charset="UTF-8">
          <style>
              @page {
                size: A4;
                margin: 30mm 30mm 30mm 40mm;
              }
              body {
                  font-family: 'Arial', sans-serif;
                  line-height: 1.6;
                  color: #000;
                  font-size: 12pt;
                  margin: 0;
                  padding: 0;
              }
              .doc-header {
                  text-align: center;
                  margin-bottom: 40px;
              }
              .doc-header h1 {
                  font-size: 20pt;
                  font-weight: bold;
                  margin: 0;
                  text-transform: uppercase;
              }
              .blue-line {
                  width: 100%;
                  height: 2pt;
                  background-color: #000;
                  margin-top: 10px;
              }
              .centered-info {
                  text-align: center;
                  margin: 20px 0;
              }
              .centered-info .judul {
                  font-weight: bold;
                  display: block;
                  margin-bottom: 5px;
              }
              .section {
                  margin-bottom: 25px;
              }
              .section-title {
                  font-weight: bold;
                  margin-bottom: 5px;
              }
              .section-text {
                  text-align: justify;
              }
              .sig-date {
                  text-align: right;
                  margin-top: 40px;
              }
              .sig-grid {
                  display: flex;
                  justify-content: space-between;
                  margin-top: 20px;
              }
              .sig-col {
                  width: 45%;
              }
              .sig-box {
                  height: 80px;
              }
              .sig-img {
                  height: 70px;
              }
          </style>
      </head>
      <body>
          <div class="doc-header">
              <h1>RANCANGAN PENELITIAN</h1>
              <div class="blue-line"></div>
          </div>

          <div class="centered-info">
              <span class="judul">"${judulPenelitian}"</span>
              <span>${studentName} (${studentNim})</span>
          </div>

          <div class="section">
              <div class="section-title">1. Masalah dan Penyebab</div>
              <div class="section-text">${masalahDanPenyebab || "-"}</div>
          </div>

          <div class="section">
              <div class="section-title">2. Alternatif Solusi</div>
              <div class="section-text">${alternatifSolusi || "-"}</div>
          </div>

          <div class="section">
              <div class="section-title">3. Hasil yang diharapkan</div>
              <div class="section-text">${hasilYangDiharapkan || "-"}</div>
          </div>

          <div class="section">
              <div class="section-title">4. Kebutuhan Data</div>
              <div class="section-text">${kebutuhanData || "-"}</div>
          </div>

          <div class="section">
              <div class="section-title">5. Metode Pelaksanaan</div>
              <div class="section-text">${metodePenelitian || "-"}</div>
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
                  <div class="sig-name">${dosenPaNama}</div>
                  <div>NIP. ${dosenPaNip || "........................."}</div>
              </div>
              <div class="sig-col">
                  <div>Penulis,</div>
                  <div class="sig-box">
                      ${studentSignatureUrl ? `<img src="${studentSignatureUrl}" class="sig-img" />` : ""}
                  </div>
                  <div class="sig-name">${studentName}</div>
                  <div>NIM. ${studentNim}</div>
              </div>
          </div>
      </body>
      </html>
    `;
};
