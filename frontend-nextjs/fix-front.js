const fs = require('fs');

function replaceAll(str, mapObj){
    const re = new RegExp(Object.keys(mapObj).join("|"), "gi");
    return str.replace(re, (matched) => mapObj[matched]);
}

const mappings = {
    'ranpel_id': 'rancanganPenelitianId',
    'ranpel': 'rancanganPenelitian',
    'tanggal_pengajuan': 'tanggalPengajuan',
    'tanggal_diverifikasi': 'tanggalReviewPa', // Assuming diverifikasi is equivalent to review_pa
    'tanggal_diterima': 'tanggalReviewKaprodi',
    'catatan_kaprodi': 'catatanKaprodi',
    'status': 'statusKaprodi' // Needs manual review for Dosen PA uses statusDosenPa
};

const mapManajemen = {
    'status': 'statusKaprodi',
    'ranpel': 'rancanganPenelitian',
    'tanggal_diverifikasi': 'tanggalReviewPa',
    'toLowerCase()': 'toLowerCase()',
};

// ... Wait, let's just do targeted fixes using string replacement for each file

function fixFile(file, edits) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    for (const [search, replace] of edits) {
        content = content.split(search).join(replace);
    }
    fs.writeFileSync(file, content);
    console.log(`Fixed ${file}`);
}

// 1. Pendaftaran Ujian List
fixFile('src/features/pendaftaran-ujian/components/pendaftaran-ujian-list.tsx', [
    ['row.status', 'row.statusKaprodi'],
    ['row.ranpel_id', 'row.rancanganPenelitianId'],
    ['row.ranpel', 'row.rancanganPenelitian']
]);

// 2. Manajemen Ranpel List (Kaprodi)
fixFile('src/features/ranpel/components/manajemen-ranpel-list.tsx', [
    ['row.status', 'row.statusKaprodi'],
    ['status: "', 'statusKaprodi: "'],
    ['status ===', 'statusKaprodi ==='],
    ['status ', 'statusKaprodi '],
    ['status,', 'statusKaprodi,'],
    ['{status}', '{statusKaprodi}'],
    ['statusFilter', 'statusFilter'],
    ['row.rancanganPenelitianKaprodi', 'row.statusKaprodi'], // fix bad replace
    ['tanggal_diverifikasi', 'tanggalReviewPa'],
    ['ranpel', 'rancanganPenelitian'],
    ['?.user?.nama', '?.user?.nama'], // the error 9/22: Type 'unknown' is not assignable to type 'ReactNode' because of 'Peminatan' mapping maybe?
]);

// 3. Verifikasi Ranpel List (Dosen PA)
fixFile('src/features/ranpel/components/verifikasi-ranpel-list.tsx', [
    ['row.status', 'row.statusDosenPa'],
    ['status:', 'statusDosenPa:'],
    ['status ==', 'statusDosenPa =='],
    ['status ', 'statusDosenPa '],
    ['{status}', '{statusDosenPa}'],
    ['ranpel', 'rancanganPenelitian'],
    ['tanggal_pengajuan', 'tanggalPengajuan'],
    ['tanggal_diterima', 'tanggalReviewPa'], // Dosen PA approval date
]);

// 4. Pengajuan Ranpel List (Mahasiswa/General)
fixFile('src/features/ranpel/components/pengajuan-ranpel-list.tsx', [
    ['row.status', 'row.statusKaprodi'], // assuming kaprodi status is the final one
    ['ranpel_id', 'rancanganPenelitianId'],
    ['ranpel', 'rancanganPenelitian'],
    ['tanggal_pengajuan', 'tanggalPengajuan'],
    ['keterangan', 'catatanDosenPa'],
    ['catatan_kaprodi', 'catatanKaprodi']
]);

// 5. Ranpel Form
fixFile('src/features/ranpel/components/ranpel-form-modal.tsx', [
    ['ranpel.', 'rancanganPenelitian.'],
    ['ranpel_id', 'rancanganPenelitianId']
]);

// 6. Ranpel Preview
fixFile('src/features/ranpel/components/ranpel-preview-modal.tsx', [
    ['pengajuan.ranpel', 'pengajuan.rancanganPenelitian'],
    ['pengajuan.status', 'pengajuan.statusKaprodi'],
    ['dosen_mahasiswa_dosen_paTodosen.url_ttd', 'user?.url_ttd'],
    ['dosen_mahasiswa_dosen_paTodosen?.nama', 'user?.nama'],
    ['dosen_mahasiswa_dosen_paTodosen?.nip', 'nip']
]);

