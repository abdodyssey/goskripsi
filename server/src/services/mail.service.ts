import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export class MailService {
  /**
   * Mengirim notifikasi ke Dosen PA saat ada pengajuan baru
   */
  async sendRanpelSubmissionNotification(
    dosenEmail: string,
    dosenNama: string,
    studentNama: string,
    judul: string
  ) {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY tidak ditemukan. Email tidak terkirim.");
      return;
    }

    try {
      await resend.emails.send({
        from: "GoSkripsi <notifikasi@rafanovation.cloud>", // Ganti dengan domain terverifikasi Anda nanti
        to: dosenEmail,
        subject: `[GoSkripsi] Notifikasi Pengajuan Ranpel: ${studentNama}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #4f46e5; margin-bottom: 20px;">Halo Bapak/Ibu ${dosenNama},</h2>
            <p style="color: #475569; font-size: 16px;">Terdapat pengajuan Rancangan Penelitian (Ranpel) baru dari mahasiswa bimbingan akademik Anda yang memerlukan verifikasi:</p>
            
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Nama Mahasiswa:</strong> ${studentNama}</p>
              <p style="margin: 5px 0;"><strong>Judul Penelitian:</strong> "${judul}"</p>
            </div>

            <p style="color: #475569;">Silakan login ke sistem GoSkripsi untuk meninjau dan memberikan verifikasi terhadap pengajuan tersebut.</p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/dashboard" 
                 style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                Buka Dashboard GoSkripsi
              </a>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">Ini adalah pesan otomatis dari sistem GoSkripsi Jurusan Sistem Informasi.</p>
          </div>
        `,
      });
      console.log(`Email notifikasi terkirim ke ${dosenEmail}`);
    } catch (error) {
      console.error("Gagal mengirim email notifikasi submission:", error);
    }
  }

  /**
   * Mengirim notifikasi ke Mahasiswa saat Ranpel mereka direview
   */
  async sendRanpelReviewNotification(
    studentEmail: string,
    studentNama: string,
    reviewerNama: string,
    status: string,
    catatan: string
  ) {
    if (!process.env.RESEND_API_KEY) return;

    try {
      const statusLabel = status === "setujui" ? "DISETUJUI" : "REVISI/DITOLAK";
      const statusColor = status === "setujui" ? "#059669" : "#dc2626";

      await resend.emails.send({
        from: "GoSkripsi <notifikasi@rafanovation.cloud>",
        to: studentEmail,
        subject: `[GoSkripsi] Update Status Pengajuan Ranpel Anda`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #4f46e5; margin-bottom: 20px;">Halo ${studentNama},</h2>
            <p style="color: #475569; font-size: 16px;">Pengajuan Rancangan Penelitian (Ranpel) Anda telah direview oleh <strong>${reviewerNama}</strong>.</p>
            
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid ${statusColor};">
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${statusLabel}</span></p>
              <p style="margin: 5px 0;"><strong>Catatan:</strong> ${catatan || "-"}</p>
            </div>

            <p style="color: #475569;">Silakan catat masukan tersebut dan lakukan langkah selanjutnya sesuai dengan panduan sistem.</p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/dashboard" 
                 style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                Lihat Detail di Dashboard
              </a>
            </div>
          </div>
        `,
      });
      console.log(`Email update status terkirim ke ${studentEmail}`);
    } catch (error) {
      console.error("Gagal mengirim email update status:", error);
    }
  }
}

export const mailService = new MailService();
