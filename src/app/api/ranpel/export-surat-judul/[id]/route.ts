import { NextResponse } from "next/server";
import { ranpelService } from "@/server/services/ranpel.service";
import { getAuthUser } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
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

    // 1. Get Kaprodi info (Specifically look for Gusmelia as requested)
    const kaprodiDosen = await prisma.dosen.findFirst({
      where: { user: { nama: { contains: "Gusmelia" } } },
      include: { user: { select: { nama: true } } }
    });

    const dataToPdf = {
      studentName: pengajuan.mahasiswa?.nama,
      studentNim: pengajuan.mahasiswa?.nim,
      studentSemester: pengajuan.mahasiswa?.semester,
      studentProdi: pengajuan.mahasiswa?.prodi?.namaProdi,
      judulPenelitian: (pengajuan as any).rancanganPenelitian?.judulPenelitian,
      dosenPaNama: pengajuan.mahasiswa?.dosenPa?.nama,
      dosenPaNip: (pengajuan.mahasiswa?.dosenPa as any)?.nip || "...................................................",
      pembimbing2Nama: pengajuan.mahasiswa?.pembimbing2?.nama,
      pembimbing2Nip: (pengajuan.mahasiswa?.pembimbing2 as any)?.nip || "...................................................",
      kaprodiNama: kaprodiDosen?.user?.nama || "Gusmelia Testiana, M.Kom.",
      kaprodiNip: kaprodiDosen?.nip || "19750801 200912 2 001",
      tanggal: new Date((pengajuan as any).tanggalReviewKaprodi || new Date()).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }),
    };

    const templatePath = path.join(process.cwd(), "src/server/templates/docs/SURAT_PENGAJUAN_JUDUL_TEMPLATE.docx");
    const scriptPath = path.join(process.cwd(), "src/server/scripts/generate_surat_judul_pdf.py");
    const logoPath = path.join(process.cwd(), "public/uin-logo.png");
    const outputDir = path.join(process.cwd(), "scratch");
    
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
    const outputPath = path.join(outputDir, `SURAT_JUDUL_${pengajuan.mahasiswa?.nim}_${Date.now()}.pdf`);
    const dataPath = path.join(outputDir, `data_surat_${pengajuan.mahasiswa?.nim}_${Date.now()}.json`);
    
    fs.writeFileSync(dataPath, JSON.stringify(dataToPdf));

    // Call Python script
    const command = `python3 "${scriptPath}" "${dataPath}" "${templatePath}" "${outputPath}" "${logoPath}"`;
    
    try {
        execSync(command, { stdio: 'pipe' });
        const pdfBuffer = fs.readFileSync(outputPath);
        
        // Cleanup files
        fs.unlinkSync(outputPath);
        fs.unlinkSync(dataPath);

        return new Response(pdfBuffer as any, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=SURAT_PENGAJUAN_JUDUL_${pengajuan.mahasiswa?.nim}.pdf`,
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
