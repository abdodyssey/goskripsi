import { Mahasiswa } from "../../../types/user.type";

export interface RancanganPenelitian {
  id: number;
  mahasiswaId: number;
  judulPenelitian: string;
  masalahDanPenyebab: string | null;
  alternatifSolusi: string | null;
  metodePenelitian: string | null;
  hasilYangDiharapkan: string | null;
  kebutuhanData: string | null;
  jurnalReferensi: string | null;
  mahasiswa?: Mahasiswa;
}

export type StatusPengajuan =
  | "menunggu"
  | "diverifikasi"
  | "diterima"
  | "ditolak";

export interface PengajuanRancanganPenelitian {
  id: number;
  rancanganPenelitianId: number;
  mahasiswaId: number;
  tanggalPengajuan: string;
  statusDosenPa: StatusPengajuan;
  catatanDosenPa: string | null;
  tanggalReviewPa: string | null;
  statusKaprodi: StatusPengajuan;
  catatanKaprodi: string | null;
  tanggalReviewKaprodi: string | null;
  rancanganPenelitian?: RancanganPenelitian;
  mahasiswa?: Mahasiswa;
}

export interface PengajuanRanpelResponse {
  data: PengajuanRancanganPenelitian | PengajuanRancanganPenelitian[];
  success: boolean;
}
