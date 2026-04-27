import { NextResponse } from "next/server";
import { ranpelService } from "@/server/services/ranpel.service";
import { getAuthUser } from "@/lib/auth-helper";
import { generatePdf } from "@/lib/pdf-helper";
import { getRanpelTemplate } from "@/server/templates/ranpel.template";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const pengajuan = await ranpelService.getPengajuanById(id);
    if (!pengajuan) return NextResponse.json({ message: "Not Found" }, { status: 404 });

    // Handle signatures (get signed URLs)
    let dosenPaSignatureUrl = null;
    const dosen = pengajuan.mahasiswa?.dosenPa;
    if (dosen?.url_ttd) {
        const parts = dosen.url_ttd.split("skripsi_docs/");
        if (parts.length > 1) {
            const { data } = await supabaseAdmin.storage.from("skripsi_docs").createSignedUrl(parts[1], 600);
            dosenPaSignatureUrl = data?.signedUrl;
        } else {
            dosenPaSignatureUrl = dosen.url_ttd;
        }
    }

    let studentSignatureUrl = null;
    const student = pengajuan.mahasiswa as any;
    if (student?.url_ttd) {
        const parts = student.url_ttd.split("skripsi_docs/");
        if (parts.length > 1) {
            const { data } = await supabaseAdmin.storage.from("skripsi_docs").createSignedUrl(parts[1], 600);
            studentSignatureUrl = data?.signedUrl;
        } else {
            studentSignatureUrl = student.url_ttd;
        }
    }

    const dataToPdf = {
      studentName: pengajuan.mahasiswa?.nama,
      studentNim: pengajuan.mahasiswa?.nim,
      judulPenelitian: (pengajuan as any).rancanganPenelitian?.judulPenelitian,
      masalahDanPenyebab: (pengajuan as any).rancanganPenelitian?.masalahDanPenyebab,
      alternatifSolusi: (pengajuan as any).rancanganPenelitian?.alternatifSolusi,
      hasilYangDiharapkan: (pengajuan as any).rancanganPenelitian?.hasilYangDiharapkan,
      kebutuhanData: (pengajuan as any).rancanganPenelitian?.kebutuhanData,
      metodePenelitian: (pengajuan as any).rancanganPenelitian?.metodePenelitian,
      jurnalReferensi: (pengajuan as any).rancanganPenelitian?.jurnalReferensi,
      dosenPaNama: pengajuan.mahasiswa?.dosenPa?.nama,
      dosenPaNip: pengajuan.mahasiswa?.dosenPa?.nip,
      dosenPaSignatureUrl,
      studentSignatureUrl,
      tanggalReviewPa: (pengajuan as any).tanggalReviewPa,
      tanggalReviewKaprodi: (pengajuan as any).tanggalReviewKaprodi,
    };

    const htmlContent = getRanpelTemplate(dataToPdf);
    const pdfBuffer = await generatePdf(htmlContent, {
        margin: { top: "30mm", right: "30mm", bottom: "30mm", left: "40mm" }
    });

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=RANPEL_${pengajuan.mahasiswa?.nim}.pdf`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
