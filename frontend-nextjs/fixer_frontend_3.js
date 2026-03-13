const fs = require("fs");

function replace(file, edits) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, "utf8");
  for (const [s, r] of edits) {
    content = content.split(s).join(r);
  }
  fs.writeFileSync(file, content);
}

// Fix schema
replace("src/features/ranpel/schemas/ranpel.schema.ts", [
  ["judul_penelitian", "judulPenelitian"],
  ["masalah_dan_penyebab", "masalahDanPenyebab"],
  ["alternatif_solusi", "alternatifSolusi"],
  ["metode_penelitian", "metodePenelitian"],
  ["hasil_yang_diharapkan", "hasilYangDiharapkan"],
  ["kebutuhan_data", "kebutuhanData"],
  ["jurnal_referensi", "jurnalReferensi"],
]);

// Fix pendaftaran-ujian-list double kaprodi
replace(
  "src/features/pendaftaran-ujian/components/pendaftaran-ujian-list.tsx",
  [
    ["statusKaprodiKaprodi", "status"], // pendaftaran ujian table has status string status: "belum_dijadwalkan" | "dijadwalkan" | "selesai"
    ["rancanganPenelitian.", "ranpel."],
    ["row.statusKaprodi", "row.status"], // revert
    ["row.rancanganPenelitianId", "row.ranpel_id"],
    ["row.rancanganPenelitian", "row.ranpel"],
    [
      "row.rancanganPenelitian?.judulPenelitian",
      "row.ranpel?.judul_penelitian",
    ],
  ],
);

const globalEdits = [
  ["judul_penelitian", "judulPenelitian"],
  ["masalah_dan_penyebab", "masalahDanPenyebab"],
  ["alternatif_solusi", "alternatifSolusi"],
  ["metode_penelitian", "metodePenelitian"],
  ["hasil_yang_diharapkan", "hasilYangDiharapkan"],
  ["kebutuhan_data", "kebutuhanData"],
  ["jurnal_referensi", "jurnalReferensi"],
];

replace("src/features/ranpel/components/manajemen-ranpel-list.tsx", [
  ...globalEdits,
  ["row.id", "(row.id as any)"],
  ["(item.mahasiswa as any)?.angkatan", "(item.mahasiswa as any)?.angkatan"],
]);

replace("src/features/ranpel/components/pengajuan-ranpel-list.tsx", [
  ...globalEdits,
  [
    'row.statusKaprodi === "menunggu" && row.statusDosenPa === "diterima"',
    'row.statusKaprodi === "menunggu" && row.statusDosenPa === "diterima"',
  ],
  [
    'row.statusKaprodi === "menunggu" && row.statusKaprodi === "menunggu" && row.statusDosenPa === "menunggu"',
    'row.statusKaprodi === "menunggu" && row.statusDosenPa === "menunggu"',
  ],
]);

replace("src/features/ranpel/components/ranpel-preview-modal.tsx", [
  ...globalEdits,
  [
    'pengajuan.statusKaprodi === "menunggu" && pengajuan.statusDosenPa === "diterima"',
    'pengajuan?.statusKaprodi === "menunggu" && pengajuan?.statusDosenPa === "diterima"',
  ],
  [
    "pengajuan.mahasiswa?.dosenPaRel?.user?.url_ttd",
    "(pengajuan?.mahasiswa as any)?.dosenPaRel?.user?.url_ttd",
  ],
  [
    "pengajuan.mahasiswa?.dosenPaRel?.user?.nama",
    "(pengajuan?.mahasiswa as any)?.dosenPaRel?.user?.nama",
  ],
  [
    "pengajuan.mahasiswa?.dosenPaRel?.nip",
    "(pengajuan?.mahasiswa as any)?.dosenPaRel?.nip",
  ],
  ["pengajuan?", "pengajuan"], // just making sure not double question mark if any
]);

replace("src/features/ranpel/components/verifikasi-ranpel-list.tsx", [
  ...globalEdits,
  ['row.statusDosenPa === "diterima"', 'row.statusDosenPa === "diterima"'],
  ['statusDosenPa === "diterima"', 'statusDosenPa === "diterima"'],
  ["(row.mahasiswa as any)?.angkatan", "(row.mahasiswa as any)?.angkatan"],
]);

// One TS 2339 property 'ranpel' does not exist on PengajuanRanpel inside ranpel-form-modal
replace("src/features/ranpel/components/ranpel-form-modal.tsx", [
  ...globalEdits,
  ["editData?.rancanganPenelitian?.", "editData?.rancanganPenelitian?."],
  ["editData.ranpel", "editData?.rancanganPenelitian"],
  ["rancanganPenelitian.", "rancanganPenelitian?."],
]);
