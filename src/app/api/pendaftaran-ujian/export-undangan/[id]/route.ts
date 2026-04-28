import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const execPromise = promisify(exec);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    const pendaftaran = await prisma.pendaftaranUjian.findUnique({
      where: { id },
      include: {
        mahasiswa: {
          include: {
            user: true,
            prodi: true,
            pembimbing1Rel: { include: { user: true } },
            pembimbing2Rel: { include: { user: true } },
          },
        },
        jenisUjian: true,
        rancanganPenelitian: true,
        ujian: {
          include: {
            ruangan: true,
            pengujiUjians: {
              include: {
                dosen: { include: { user: true } },
              },
            },
          },
        },
      },
    });

    if (!pendaftaran) {
      return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });
    }

    // Get Kaprodi data (Gusmelia)
    const kaprodi = await prisma.dosen.findFirst({
      where: {
        user: {
          nama: { contains: "Gusmelia", mode: "insensitive" },
        },
      },
      include: { user: true },
    });

    const dataToPdf = {
      type: pendaftaran.jenisUjian.namaJenis.toLowerCase().includes("proposal") ? "sempro" :
            pendaftaran.jenisUjian.namaJenis.toLowerCase().includes("hasil") ? "hasil" : "skripsi",
      data: {
        TANGGAL_SURAT: new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        NAMA: pendaftaran.mahasiswa.user.nama.toUpperCase(),
        NIM: pendaftaran.mahasiswa.nim,
        JUDUL: pendaftaran.rancanganPenelitian.judulPenelitian.toUpperCase(),
        PEMBIMBING_1: pendaftaran.mahasiswa.pembimbing1Rel?.user.nama || "-",
        PEMBIMBING_2: pendaftaran.mahasiswa.pembimbing2Rel?.user.nama || "-",
        HARI_TANGGAL: pendaftaran.ujian?.jadwalUjian ? 
          `${pendaftaran.ujian.hariUjian} / ${new Date(pendaftaran.ujian.jadwalUjian).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}` : "-",
        PUKUL: pendaftaran.ujian?.waktuMulai ? 
          `${new Date(pendaftaran.ujian.waktuMulai).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}-${pendaftaran.ujian.waktuSelesai ? new Date(pendaftaran.ujian.waktuSelesai).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : ""} WIB` : "-",
        TEMPAT: pendaftaran.ujian?.ruangan?.namaRuangan || "-",
        KETUA: pendaftaran.ujian?.pengujiUjians.find(p => p.peran === "ketua_penguji")?.dosen.user.nama || "-",
        SEKRETARIS: pendaftaran.ujian?.pengujiUjians.find(p => p.peran === "sekretaris_penguji")?.dosen.user.nama || "-",
        PENGUJI_1: pendaftaran.ujian?.pengujiUjians.find(p => p.peran === "penguji_1")?.dosen.user.nama || "-",
        PENGUJI_2: pendaftaran.ujian?.pengujiUjians.find(p => p.peran === "penguji_2")?.dosen.user.nama || "-",
        KAPRODI_NAMA: kaprodi?.user.nama || "Gusmelia Testiana, M.Kom.",
        KAPRODI_NIP: kaprodi?.nip || "19750801 200912 2 001",
      },
      outputPath: path.join(process.cwd(), "scratch", `UNDANGAN_${uuidv4()}.pdf`),
    };

    const configPath = path.join(process.cwd(), "scratch", `config_${uuidv4()}.json`);
    fs.writeFileSync(configPath, JSON.stringify(dataToPdf));

    const scriptPath = path.join(process.cwd(), "src/server/scripts/generate_undangan_ujian_pdf.py");
    await execPromise(`python3 ${scriptPath} ${configPath}`);

    const pdfBuffer = fs.readFileSync(dataToPdf.outputPath);

    // Cleanup
    fs.unlinkSync(configPath);
    fs.unlinkSync(dataToPdf.outputPath);

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=UNDANGAN_${pendaftaran.mahasiswa.nim}.pdf`,
      },
    });
  } catch (error) {
    console.error("Export Undangan Error:", error);
    return NextResponse.json({ message: "Gagal generate undangan" }, { status: 500 });
  }
}
