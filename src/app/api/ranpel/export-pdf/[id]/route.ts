import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { ranpelService } from "@/server/services/ranpel.service";
import { getAuthUser } from "@/lib/auth-helper";
import { supabaseAdmin } from "@/lib/supabase";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

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
      tanggal: new Date((pengajuan as any).tanggalReviewKaprodi || new Date()).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }),
    };

    const templatePath = path.join(process.cwd(), "src/server/templates/docs/RANCANGAN_PENELITIAN_TEMPLATE.docx");
    const scriptPath = path.join(process.cwd(), "src/server/scripts/generate_ranpel_pdf.py");
    const outputDir = path.join(process.cwd(), "scratch");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
    const outputPath = path.join(outputDir, `RANPEL_${pengajuan.mahasiswa?.nim}_${Date.now()}.pdf`);

    const dataPath = path.join(outputDir, `data_${pengajuan.mahasiswa?.nim}_${Date.now()}.json`);
    fs.writeFileSync(dataPath, JSON.stringify(dataToPdf));

    // Call Python script
    const command = `python3 "${scriptPath}" "${dataPath}" "${templatePath}" "${outputPath}"`;
    
    try {
        execSync(command, { stdio: 'pipe' });
        const pdfBuffer = fs.readFileSync(outputPath);
        
        // Cleanup files
        fs.unlinkSync(outputPath);
        fs.unlinkSync(dataPath);

        return new Response(pdfBuffer as any, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=RANPEL_${pengajuan.mahasiswa?.nim}.pdf`,
          },
        });
    } catch (err: any) {
        const stderr = err.stderr?.toString() || err.message;
        console.error("Python PDF generation failed:", stderr);
        throw new Error(`Failed to generate PDF: ${stderr}`);
    }
  } catch (error: any) {
    console.error("Export error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
