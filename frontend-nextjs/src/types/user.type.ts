export type StatusAkun = "aktif" | "tidak_aktif";
export type StatusDosen = "aktif" | "tidak_aktif";
export type StatusPengajuan = "menunggu" | "diterima" | "ditolak";
export type StatusPendaftaran =
  | "draft"
  | "menunggu"
  | "revisi"
  | "diterima"
  | "ditolak";
export type StatusUjian = "belum_dijadwalkan" | "dijadwalkan" | "selesai";
export type HasilUjian = "lulus" | "tidak_lulus";
export type PengujiPeran =
  | "ketua_penguji"
  | "sekretaris_penguji"
  | "penguji_1"
  | "penguji_2";
export type HariUjian =
  | "Senin"
  | "Selasa"
  | "Rabu"
  | "Kamis"
  | "Jumat"
  | "Sabtu"
  | "Minggu";
export type NilaiHuruf = "A" | "B" | "C" | "D" | "E";

export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: number;
  username: string;
  nama: string;
  email: string;
  role_id: number;
  status: StatusAkun;
  role?: Role;
}

export interface Prodi {
  id: number;
  nama_prodi: string;
  namaProdi?: string;
  fakultas_id: number;
  fakultasId?: number;
}

export interface Peminatan {
  id: number;
  nama_peminatan: string;
  namaPeminatan?: string;
  prodi_id: number;
  prodiId?: number;
}

export interface Dosen {
  id: number;
  nidn: string | null;
  nip: string | null;
  nama: string;
  email: string | null;
  no_hp: string | null;
  noHp?: string | null;
  alamat: string | null;
  tempat_tanggal_lahir: string | null;
  pangkat: string | null;
  golongan: string | null;
  jabatan: string | null;
  foto: string | null;
  url_ttd: string | null;
  urlTtd?: string | null;
  status: StatusDosen;
  prodi_id: number;
  prodiId?: number;
  prodi?: Prodi;
  user?: User;
}

export interface Mahasiswa {
  id: number;
  nim: string;
  nama?: string; // Flattened name from User
  email?: string; // Flattened email from User
  no_hp: string | null;
  noHp?: string | null;
  alamat: string | null;
  angkatan: string | null;
  semester: number;
  ipk: number;
  foto: string | null;
  url_ttd: string | null;
  urlTtd?: string | null;
  status: StatusAkun;
  prodi_id: number;
  prodiId?: number;
  peminatan_id: number | null;
  peminatanId?: number | null;
  dosen_pa: number | { id: number; nama?: string } | null;
  pembimbing_1: number | { id: number; nama?: string } | null;
  pembimbing_2: number | { id: number; nama?: string } | null;
  prodi?: Prodi;
  peminatan?: Peminatan;
  dosenPa?: Dosen;
  pembimbing1?: Dosen;
  pembimbing2?: Dosen;
  user?: User;
}

export interface FlattenedUser
  extends
    Omit<
      Partial<Mahasiswa>,
      | "id"
      | "dosen_pa"
      | "pembimbing_1"
      | "pembimbing_2"
      | "prodi"
      | "peminatan"
    >,
    Omit<Partial<Dosen>, "id" | "prodi"> {
  id: string;
  user_id: string;
  nama: string;
  email: string;
  username?: string;
  roles?: string[];
  prodi?: Prodi;
  peminatan?: Peminatan;
  dosen_pa?: { id: string; nama: string };
  pembimbing_1?: { id: string; nama: string };
  pembimbing_2?: { id: string; nama: string };
  passed_exams?: number[];
  active_pendaftaran?: { jenis_id: number; status: string }[];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  access_token?: string;
  token?: string; // some legacy check might use this
  token_type?: string;
  user: FlattenedUser; // Flattened user/profile data from backend
  role?: string;
  roles?: string[];
  is_default_password?: boolean;
}
