import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { pdfService } from "@/server/services/pdf.service";
import { getAuthUser } from "@/lib/auth-helper";
import { HttpError } from "@/utils/http-error";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const ujianId = Number(id);

    const ujian = await prisma.ujian.findUnique({
      where: { id: ujianId },
      include: {
        pendaftaranUjian: {
          include: {
            mahasiswa: { include: { user: true } },
            jenisUjian: true,
            rancanganPenelitian: true,
          }
        },
        pengujiUjians: {
          include: {
            dosen: { include: { user: true } }
          }
        },
        penilaians: {
          include: {
            komponenPenilaian: true,
            dosen: { include: { user: true } }
          }
        }
      }
    });

    if (!ujian) throw new HttpError(404, "Ujian tidak ditemukan");
    if (!ujian.nilaiDifinalisasi) throw new HttpError(400, "Nilai belum difinalisasi");

    const prodiName = "SISTEM INFORMASI"; // Can be dynamic from DB if available

    const dateObj = new Date(ujian.jadwalUjian || new Date());
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    const ketua = ujian.pengujiUjians.find(p => p.peran === "ketua_penguji");
    const sekretaris = ujian.pengujiUjians.find(p => p.peran === "sekretaris_penguji");

    const pdfData = {
      studentName: ujian.pendaftaranUjian.mahasiswa.user.nama,
      studentNim: ujian.pendaftaranUjian.mahasiswa.nim,
      prodiName: prodiName,
      judul: ujian.pendaftaranUjian.rancanganPenelitian.judulPenelitian,
      jenisUjian: ujian.pendaftaranUjian.jenisUjian.namaJenis,
      hari: days[dateObj.getDay()],
      tanggal: dateObj.getDate(),
      bulan: months[dateObj.getMonth()],
      tahun: dateObj.getFullYear(),
      pengujiList: ujian.pengujiUjians.map(p => ({
        name: p.dosen?.user?.nama || "................",
        role: p.peran === 'ketua_penguji' ? 'Ketua Penguji' : p.peran === 'sekretaris_penguji' ? 'Sekretaris' : p.peran === 'penguji_1' ? 'Penguji 1' : 'Penguji 2',
        signatureUrl: null, // Placeholder
      })),
      keputusan: ujian.hasil,
      tempat: "Palembang",
      tanggalDitetapkan: new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }),
      ketuaPenguji: {
        name: ketua?.dosen?.user?.nama || "................",
        signatureUrl: null,
      },
      sekretarisPenguji: {
        name: sekretaris?.dosen?.user?.nama || "................",
        signatureUrl: null,
      },
      catatanRevisi: ujian.catatanRevisi || "",
    };

    const pdfBuffer = await pdfService.generateBeritaAcaraPdf(pdfData);

    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Berita_Acara_Ujian_${id}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("PDF Export Error:", error);
    const status = error instanceof HttpError ? error.statusCode : 500;
    return NextResponse.json({ message: error.message }, { status });
  }
}
