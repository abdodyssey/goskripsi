import { z } from "zod";

export const createRanpelFormSchema = z.object({
  judul_penelitian: z.string().min(1, "Judul penelitian wajib diisi"),
  masalah_dan_penyebab: z.string().optional().nullable(),
  alternatif_solusi: z.string().optional().nullable(),
  metode_penelitian: z.string().optional().nullable(),
  hasil_yang_diharapkan: z.string().optional().nullable(),
  kebutuhan_data: z.string().optional().nullable(),
  jurnal_referensi: z.string().optional().nullable(),
});

export type CreateRanpelFormValues = z.infer<typeof createRanpelFormSchema>;
