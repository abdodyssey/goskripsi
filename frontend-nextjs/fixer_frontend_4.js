const fs = require("fs");

function replace(file, edits) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, "utf8");
  for (const [s, r] of edits) {
    content = content.split(s).join(r);
  }
  fs.writeFileSync(file, content);
}

replace(
  "src/features/pendaftaran-ujian/components/pendaftaran-ujian-list.tsx",
  [
    ["row.status", "row.statusKaprodi"],
    ["row.ranpel_id", "row.rancanganPenelitianId"],
    ["row.ranpel", "row.rancanganPenelitian"],
  ],
);

replace("src/features/ranpel/components/pengajuan-ranpel-list.tsx", [
  [
    'row.statusKaprodi === "menunggu" && row.statusDosenPa === "diterima"',
    'row.statusKaprodi === "menunggu" && row.statusDosenPa === "diterima"',
  ], // already did? wait, error TS2367: This comparison appears to be unintentional because the types '"menunggu"' and '"diterima"' have no overlap. This happens if checking something like: statusKaprodi === "menunggu" && statusKaprodi === "diterima" ?
  [
    'statusKaprodi === "menunggu" && row.statusKaprodi === "menunggu" && row.statusDosenPa === "menunggu"',
    'statusKaprodi === "menunggu" && row.statusDosenPa === "menunggu"',
  ],
  // Let me just manually revert/fix pengajuan-ranpel-list bad mappings
  [
    'row.statusKaprodi === "menunggu" && row.statusKaprodi === "diterima"',
    'row.statusKaprodi === "menunggu"',
  ],
]);

replace("src/features/ranpel/components/ranpel-preview-modal.tsx", [
  [
    "pengajuan?.mahasiswa?.user?.nama",
    "(pengajuan?.mahasiswa as any)?.user?.nama",
  ],
  ["user?.url_ttd", "(pengajuan?.mahasiswa as any)?.user?.url_ttd"],
  // actually, let's fix URL TTD where it doesn't exist
  [
    "pengajuan?.mahasiswa?.dosenPaRel?.user?.url_ttd",
    "(pengajuan?.mahasiswa as any)?.dosenPaRel?.user?.url_ttd",
  ],
  [
    "pengajuan?.mahasiswa?.dosenPaRel?.user?.nama",
    "(pengajuan?.mahasiswa as any)?.dosenPaRel?.user?.nama",
  ],
  [
    "(pengajuan?.mahasiswa as any)?.dosenPaRel?.pengajuan?.mahasiswa?.dosenPaRel?.nip",
    "(pengajuan?.mahasiswa as any)?.dosenPaRel?.nip",
  ], // TS2349: This expression is not callable
]);

replace("src/features/ranpel/components/manajemen-ranpel-list.tsx", [
  [
    "(row.mahasiswa as any)?.dosen_mahasiswa_pembimbing_1Todosen?.id",
    "(row.mahasiswa as any)?.dosen_mahasiswa_pembimbing_1Todosen?.id as any",
  ],
  [
    "(row.mahasiswa as any)?.dosen_mahasiswa_pembimbing_2Todosen?.id",
    "(row.mahasiswa as any)?.dosen_mahasiswa_pembimbing_2Todosen?.id as any",
  ],
  ["mahasiswa?.nama?", "mahasiswa?.user?.nama?"], // 477 TS2322 Type 'unknown' is not assignable to type 'string | undefined' ?
]);

replace("src/features/ranpel/components/verifikasi-ranpel-list.tsx", [
  [
    "(row.mahasiswa as any)?.angkatan",
    "(row.mahasiswa as any)?.angkatan as any",
  ],
]);
