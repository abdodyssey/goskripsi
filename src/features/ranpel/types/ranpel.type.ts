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
  | "ditolak"
  | "proses";

export interface PengajuanRancanganPenelitian {
  id: number;
  rancanganPenelitianId: number;
  mahasiswaId: number;
  tanggalPengajuan: string;
  statusDosenPa: StatusPengajuan;
  statusKaprodi: StatusPengajuan;
  catatanDosenPa: string | null;
  tanggalReviewPa: string | null;
  catatanKaprodi: string | null;
  tanggalReviewKaprodi: string | null;
  
  // PA Section Comments
  komenPaMasalah?: string | null;
  komenPaSolusi?: string | null;
  komenPaHasil?: string | null;
  komenPaData?: string | null;
  komenPaMetode?: string | null;

  // Kaprodi Section Comments
  komenKprMasalah?: string | null;
  komenKprSolusi?: string | null;
  komenKprHasil?: string | null;
  komenKprData?: string | null;
  komenKprMetode?: string | null;

  rancanganPenelitian?: RancanganPenelitian;
  mahasiswa?: Mahasiswa;
}

export interface PengajuanRanpelResponse {
  data: PengajuanRancanganPenelitian | PengajuanRancanganPenelitian[];
  success: boolean;
}
