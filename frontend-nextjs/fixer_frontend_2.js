const fs = require("fs");

function replace(file, edits) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, "utf8");
  for (const [s, r] of edits) {
    content = content.split(s).join(r);
  }
  fs.writeFileSync(file, content);
}

// Global property name fixes
const globalEdits = [
  ["judul_penelitian", "judulPenelitian"],
  ["masalah_dan_penyebab", "masalahDanPenyebab"],
  ["alternatif_solusi", "alternatifSolusi"],
  ["metode_penelitian", "metodePenelitian"],
  ["hasil_yang_diharapkan", "hasilYangDiharapkan"],
  ["kebutuhan_data", "kebutuhanData"],
  ["jurnal_referensi", "jurnalReferensi"],
];

// pendaftaran-ujian-list
replace(
  "src/features/pendaftaran-ujian/components/pendaftaran-ujian-list.tsx",
  [
    ["row.status", "row.statusKaprodi"],
    ["row.ranpel_id", "row.rancanganPenelitianId"],
    ["row.ranpel", "row.rancanganPenelitian"],
    ["row.rancanganPenelitian.", "row.rancanganPenelitian?."],
    ["statusKaprodi ===", "statusKaprodi ==="], // just in case
  ],
);

// manajemen-ranpel-list
replace("src/features/ranpel/components/manajemen-ranpel-list.tsx", [
  ...globalEdits,
  [
    'row.statusKaprodi === "diverifikasi"',
    'row.statusKaprodi === "menunggu" && row.statusDosenPa === "diterima"',
  ],
  [
    'row.statusKaprodi !== "diverifikasi"',
    '!(row.statusKaprodi === "menunggu" && row.statusDosenPa === "diterima")',
  ],
  ['statusKaprodi === "diverifikasi"', 'statusKaprodi === "menunggu"'],
  ['value: "diverifikasi",', 'value: "menunggu",'],
  ['label: "Diverifikasi (Menunggu Kaprodi)",', 'label: "Menunggu Kaprodi",'],
  ["? user?.nama", "? row.mahasiswa?.user?.nama"],
  ["(item.mahasiswa as any)?.angkatan", "(item.mahasiswa as any)?.angkatan"], // TS2322 Type 'unknown' is not assignable to type 'ReactNode'... wait that's line 235 inside DataTable Mahasiswa?
  ["{row.mahasiswa?.nama}", "{row.mahasiswa?.user?.nama}"], // to fix ReactNode issue
  ["row.id", "(row.id as any)"], // id string vs BigInt generic fix?
]);

// pengajuan-ranpel-list
replace("src/features/ranpel/components/pengajuan-ranpel-list.tsx", [
  ...globalEdits,
  [
    'row.statusKaprodi === "diverifikasi"',
    'row.statusKaprodi === "menunggu" && row.statusDosenPa === "diterima"',
  ],
  ['row.statusKaprodi === "revisi"', 'row.statusKaprodi === "ditolak"'],
  [
    'row.statusKaprodi === "menunggu"',
    'row.statusKaprodi === "menunggu" && row.statusDosenPa === "menunggu"',
  ],
]);

// ranpel-form-modal
replace("src/features/ranpel/components/ranpel-form-modal.tsx", [
  ...globalEdits,
  ["editData.rancanganPenelitian.", "editData?.rancanganPenelitian?."],
  ["values: any", "values: any"],
  ["issue: any", "issue: any"],
]);

// ranpel-preview-modal
replace("src/features/ranpel/components/ranpel-preview-modal.tsx", [
  ...globalEdits,
  [
    'pengajuan.statusKaprodi === "diverifikasi"',
    'pengajuan.statusKaprodi === "menunggu" && pengajuan.statusDosenPa === "diterima"',
  ],
  ["user?.url_ttd", "pengajuan.mahasiswa?.dosenPaRel?.user?.url_ttd"],
  ["user?.nama", "pengajuan.mahasiswa?.dosenPaRel?.user?.nama"],
  [
    "pengajuan.mahasiswa?.dosenPaRel?.user?.nama?.url_ttd",
    "pengajuan.mahasiswa?.dosenPaRel?.user?.url_ttd",
  ],
  // Nip error
  ["nip", "pengajuan.mahasiswa?.dosenPaRel?.nip"],
]);

// verifikasi-ranpel-list
replace("src/features/ranpel/components/verifikasi-ranpel-list.tsx", [
  ...globalEdits,
  ['row.statusDosenPa === "diverifikasi"', 'row.statusDosenPa === "diterima"'],
  ['statusDosenPa === "diverifikasi"', 'statusDosenPa === "diterima"'],
  ["{row.mahasiswa?.nama}", "{row.mahasiswa?.user?.nama}"],
]);

// fix TS in user types inside mahasiswa list components?
