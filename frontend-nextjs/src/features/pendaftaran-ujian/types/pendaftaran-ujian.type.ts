import { Mahasiswa, StatusPendaftaran } from "../../../types/user.type";
import { RancanganPenelitian } from "../../ranpel/types/ranpel.type";

export interface JenisUjian {
  id: number;
  namaJenis: string;
  deskripsi: string | null;
}

export interface Syarat {
  id: number;
  jenisUjianId: number;
  namaSyarat: string;
  wajib: boolean;
}

export interface PemenuhanSyarat {
  id: number;
  pendaftaranUjianId: number;
  syaratId: number;
  fileBukti: string | null;
  terpenuhi: boolean;
  keterangan: string | null;
  syarat?: Syarat;
}

export interface PengujiUjian {
  id: number;
  ujianId: number;
  dosenId: number;
  peran: string;
  dosen?: { id: number; user?: { nama: string }; nama?: string };
}

export interface Ujian {
  id: number;
  pendaftaranUjianId: number;
  jadwalUjian: string | null;
  waktuMulai: string | null;
  waktuSelesai: string | null;
  hariUjian: string | null;
  ruanganId: number | null;
  status: string;
  catatan: string | null;
  nilaiAkhir?: number | null;
  nilaiHuruf?: string | null;
  hasil?: string | null;
  nilaiDifinalisasi?: boolean;
  ruangan?: { namaRuangan: string };
  pengujiUjians?: PengujiUjian[];
}

export interface PendaftaranUjian {
  id: number;
  mahasiswaId: number;
  rancanganPenelitianId: number;
  jenisUjianId: number;
  tanggalPendaftaran: string;
  tanggalDisetujui: string | null;
  status: StatusPendaftaran;
  keterangan: string | null;
  mahasiswa?: Mahasiswa;
  rancanganPenelitian?: RancanganPenelitian;
  jenisUjian?: JenisUjian;
  pemenuhanSyarats?: PemenuhanSyarat[];
  ujian?: Ujian;
}

export interface PendaftaranUjianResponse {
  data: PendaftaranUjian[] | PendaftaranUjian;
  success: boolean;
}
