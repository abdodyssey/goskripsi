import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { pdfService } from "@/server/services/pdf.service";

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const baseWhere: any = { status: "dijadwalkan" };

    // If the user is not a superadmin, restrict to their prodi (admin/kaprodi/sekprodi)
    if (!user.roles.includes("superadmin") && user.prodiId) {
      baseWhere.pendaftaranUjian = {
        mahasiswa: { prodiId: user.prodiId },
      };
    }

    const ujianList = await prisma.ujian.findMany({
      where: baseWhere,
      orderBy: [{ jadwalUjian: "asc" }, { waktuMulai: "asc" }],
      include: {
        ruangan: true,
        pendaftaranUjian: {
          include: {
            mahasiswa: { include: { user: true } },
            jenisUjian: true,
            rancanganPenelitian: true,
          },
        },
        pengujiUjians: {
          include: { dosen: { include: { user: true } } },
        },
      },
    });

    // Group by jenis ujian
    const grouped: Record<string, typeof ujianList> = {};
    for (const u of ujianList) {
      const jenisKey = u.pendaftaranUjian.jenisUjian?.namaJenis || "Lainnya";
      if (!grouped[jenisKey]) grouped[jenisKey] = [];
      grouped[jenisKey].push(u);
    }

    const sections = Object.entries(grouped).map(([title, items]) => ({
      title,
      items: items.map((u) => {
        const pengujiMap = Object.fromEntries(
          u.pengujiUjians.map((p) => [p.peran, p.dosen?.user?.nama || "-"]),
        );

        const tanggal = u.jadwalUjian
          ? new Date(u.jadwalUjian).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "-";
        const waktuMulai = u.waktuMulai
          ? new Date(u.waktuMulai).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "-";
        const waktuSelesai = u.waktuSelesai
          ? new Date(u.waktuSelesai).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "-";

        return {
          nim: u.pendaftaranUjian.mahasiswa?.nim || "-",
          nama: u.pendaftaranUjian.mahasiswa?.user?.nama || "-",
          hari: u.hariUjian || "-",
          tanggal,
          waktu: `${waktuMulai} - ${waktuSelesai}`,
          ruang: u.ruangan?.namaRuangan || "-",
          ruangDetail: "-",
          judul: u.pendaftaranUjian.rancanganPenelitian?.judulPenelitian || "-",
          pengujiKetua: pengujiMap["ketua_penguji"] || "-",
          pengujiSekretaris: pengujiMap["sekretaris_penguji"] || "-",
          penguji1: pengujiMap["penguji_1"] || "-",
          penguji2: pengujiMap["penguji_2"] || "-",
        };
      }),
    }));

    const pdfBuffer = await pdfService.generateJadwalUjianPdf({
      sections,
      filterTitle: `Daftar Jadwal Ujian Skripsi — Dicetak ${new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}`,
    });

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Jadwal_Ujian_${Date.now()}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("[PDF Jadwal] Error:", error);
    return NextResponse.json(
      { message: error.message || "Gagal membuat PDF" },
      { status: 500 },
    );
  }
}
