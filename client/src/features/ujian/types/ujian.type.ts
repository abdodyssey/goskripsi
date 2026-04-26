import {
  Dosen,
  HariUjian,
  HasilUjian,
  NilaiHuruf,
  PengujiPeran,
  StatusUjian,
} from "../../../types/user.type";
import { PendaftaranUjian } from "../../pendaftaran-ujian/types/pendaftaran-ujian.type";

export interface Ruangan {
  id: number;
  nama_ruangan: string;
}

export interface Keputusan {
  id: number;
  nama_keputusan: string;
}

export interface Ujian {
  id: number;
  pendaftaran_ujian_id: number;
  hari_ujian: HariUjian | null;
  jadwal_ujian: string | null;
  waktu_mulai: string | null;
  waktu_selesai: string | null;
  ruangan_id: number | null;
  status: StatusUjian;
  hasil: HasilUjian | null;
  nilai_akhir: number | null;
  nilai_huruf: NilaiHuruf | null;
  catatan_revisi: string | null;
  keputusan_id: number | null;
  pendaftaran_ujian?: PendaftaranUjian;
  ruangan?: Ruangan;
  keputusan?: Keputusan;
  penguji_ujian?: PengujiUjian[];
}

export interface PengujiUjian {
  id: number;
  ujian_id: number;
  dosen_id: number;
  peran: PengujiPeran;
  dosen?: Dosen;
}

export interface KomponenPenilaian {
  id: number;
  jenis_ujian_id: number;
  kriteria: string;
  indikator_penilaian: string | null;
  bobot_komponen_peran?: BobotKomponenPeran[];
}

export interface BobotKomponenPeran {
  id: number;
  komponen_penilaian_id: number;
  peran: PengujiPeran;
  bobot: number;
}

export interface Penilaian {
  ujian_id: number;
  dosen_id: number;
  komponen_penilaian_id: number;
  nilai: number | null;
  komentar: string | null;
  komponen_penilaian?: KomponenPenilaian;
  dosen?: Dosen;
}
