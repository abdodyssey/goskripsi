export interface Mahasiswa {
  id: number;
  nama: string;
  nim: string;
  noHp: string;
  alamat: string;
  semester: number;
  dosenPaId: number;
  prodi: {
    id: number;
    nama: string;
  };
  dosenPa: {
    id: number;
    nama: string;
  };
  createdAt?: string;
  updatedAt?: string;
}
