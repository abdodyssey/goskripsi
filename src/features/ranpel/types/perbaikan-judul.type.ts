import { Mahasiswa } from "../../../types/user.type";
import { StatusPengajuan } from "./ranpel.type";

export interface PerbaikanJudul {
  id: number;
  mahasiswaId: number;
  judulLama: string;
  judulBaru: string;
  fileSurat: string;
  status: StatusPengajuan;
  catatanSekprodi: string | null;
  tanggalPengajuan: string;
  tanggalReview: string | null;
  mahasiswa?: Mahasiswa;
}

export interface PerbaikanJudulResponse {
  data: PerbaikanJudul | PerbaikanJudul[];
  success: boolean;
}
