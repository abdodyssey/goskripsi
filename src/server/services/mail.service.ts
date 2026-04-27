import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY?.trim());

export class MailService {
  private from = "GoSkripsi <notifikasi@rafanovation.cloud>";

  /**
   * Mengirim notifikasi ke Dosen PA saat ada pengajuan baru
   */
  async sendRanpelSubmissionNotification(
    dosenEmail: string,
    dosenNama: string,
    studentNama: string,
    judul: string
  ) {
    if (!process.env.RESEND_API_KEY) return;

    try {
      console.log(`[MailService] Sending Ranpel Submission notification to Dosen PA: ${dosenEmail}`);
      const { data, error } = await resend.emails.send({
        from: this.from,
        to: dosenEmail,
        subject: `[GoSkripsi] Pengajuan Ranpel Baru (${new Date().toLocaleTimeString()}): ${studentNama}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #4f46e5;">Halo Bapak/Ibu ${dosenNama},</h2>
            <p>Terdapat pengajuan Rancangan Penelitian (Ranpel) baru dari mahasiswa bimbingan Anda:</p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p><strong>Nama:</strong> ${studentNama}</p>
              <p><strong>Judul:</strong> "${judul}"</p>
            </div>
            <p>Mohon segera login ke dashboard untuk melakukan verifikasi.</p>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/dashboard" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Buka Dashboard</a>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error("[MailService] Resend Error:", error);
      } else {
        console.log(`[MailService] Submission sent. ID: ${data?.id}`);
      }
    } catch (error) {
      console.error("[MailService] Unexpected Error:", error);
    }
  }

  /**
   * Mengirim notifikasi ke Kaprodi saat Ranpel disetujui Dosen PA
   */
  async sendRanpelApprovalToKaprodiNotification(
    kaprodiEmail: string,
    studentNama: string,
    judul: string
  ) {
    if (!process.env.RESEND_API_KEY) return;

    try {
      console.log(`[MailService] Sending PA Approval notification to Kaprodi: ${kaprodiEmail}`);
      const { data, error } = await resend.emails.send({
        from: this.from,
        to: kaprodiEmail,
        subject: `[GoSkripsi] Menunggu Validasi Kaprodi (${new Date().toLocaleTimeString()}): ${studentNama}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #4f46e5;">Halo Kaprodi,</h2>
            <p>Rancangan Penelitian berikut telah <strong>DISETUJUI oleh Dosen PA</strong> dan sekarang memerlukan validasi akhir Anda:</p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p><strong>Mahasiswa:</strong> ${studentNama}</p>
              <p><strong>Judul:</strong> "${judul}"</p>
            </div>
            <p>Mohon login ke sistem untuk memberikan persetujuan akhir.</p>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/dashboard" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Buka Dashboard</a>
            </div>
          </div>
        `,
      });
      if (error) {
        console.error("[MailService] Resend Error (Kaprodi):", error);
      } else {
        console.log(`[MailService] PA Approval notification sent. ID: ${data?.id}`);
      }
    } catch (error) {
      console.error("[MailService] Unexpected Error (Kaprodi):", error);
    }
  }

  /**
   * Mengirim notifikasi ke Mahasiswa saat ujian mereka dijadwalkan
   */
  async sendExamScheduledNotification(params: {
    studentEmail: string;
    studentNama: string;
    jenisUjian: string;
    judul: string;
    hari: string;
    tanggal: string;
    waktu: string;
    ruangan: string;
  }) {
    if (!process.env.RESEND_API_KEY) return;

    try {
      console.log(`[MailService] Params:`, params);
      const { data, error } = await resend.emails.send({
        from: this.from,
        to: params.studentEmail,
        subject: `[GoSkripsi] Jadwal Ujian ${params.jenisUjian} - ${params.studentNama}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #4f46e5;">Halo ${params.studentNama},</h2>
            <p>Jadwal ujian Anda telah ditetapkan. Berikut adalah rincian jadwal ujian Anda:</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #4f46e5;">
              <p style="margin: 5px 0;"><strong>Jenis Ujian:</strong> ${params.jenisUjian}</p>
              <p style="margin: 5px 0;"><strong>Judul:</strong> "${params.judul}"</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>Hari:</strong> ${params.hari}</p>
              <p style="margin: 5px 0;"><strong>Tanggal:</strong> ${params.tanggal}</p>
              <p style="margin: 5px 0;"><strong>Waktu:</strong> ${params.waktu} WIB</p>
              <p style="margin: 5px 0;"><strong>Ruangan:</strong> ${params.ruangan}</p>
            </div>

            <p>Mohon hadir 15 menit sebelum ujian dimulai dan mempersiapkan segala keperluan ujian.</p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/dashboard" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Lihat Detail di Dashboard</a>
            </div>
            
            <p style="margin-top: 30px; font-size: 0.875rem; color: #64748b;">
              Jika terdapat kekeliruan jadwal, silakan hubungi admin prodi atau bagian akademik.
            </p>
          </div>
        `,
      });

      if (error) {
        console.error("[MailService] Resend Error (Exam Scheduled):", error);
      } else {
        console.log(`[MailService] Exam Scheduled notification sent. ID: ${data?.id}`);
      }
    } catch (error) {
      console.error("[MailService] Unexpected Error (Exam Scheduled):", error);
    }
  }
}

export const mailService = new MailService();
