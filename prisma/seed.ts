import "dotenv/config";
import { PrismaClient, PengujiPeran } from "@prisma/client";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";

import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Start seeding...");

  // 0. Cleanup Transaction Data (Flow Ranpel & Ujian)
  console.log("  Cleaning up transaction data...");
  // Delete in correct order for FK constraints
  await prisma.penilaian.deleteMany({});
  await prisma.pengujiUjian.deleteMany({});
  await prisma.ujian.deleteMany({});
  await prisma.pemenuhanSyarat.deleteMany({});
  await prisma.pendaftaranUjian.deleteMany({});
  await prisma.pengajuanRancanganPenelitian.deleteMany({});
  await prisma.rancanganPenelitian.deleteMany({});
  console.log("  Transaction data cleared");

  // 1. Setup Roles
  const roles = [
    "admin",
    "dosen",
    "mahasiswa",
    "kaprodi",
    "sekprodi",
    "superadmin",
    "admin_prodi",
  ];
  const roleMap: Record<string, number> = {};
  for (const r of roles) {
    const roleRecord = await prisma.role.upsert({
      where: { name: r },
      update: {},
      create: { name: r },
    });
    roleMap[r] = roleRecord.id;
  }
  console.log("  Seeded Roles");

  // 2. Setup Fakultas
  const fakultasTIF = await prisma.fakultas.upsert({
    where: { namaFakultas: "Sains dan Teknologi" },
    update: {},
    create: { namaFakultas: "Sains dan Teknologi" },
  });
  console.log("  Seeded Fakultas");

  // 3. Setup Prodi
  const prodiNames = ["Sistem Informasi", "Biologi", "Kimia"];
  const prodiMap: Record<string, number> = {};
  for (const name of prodiNames) {
    const p = await prisma.prodi.upsert({
      where: { namaProdi: name },
      update: {},
      create: {
        namaProdi: name,
        fakultasId: fakultasTIF.id,
      },
    });
    prodiMap[name] = p.id;
  }
  const prodiSIId = prodiMap["Sistem Informasi"];
  console.log("  Seeded Prodi");

  // 4. Setup Peminatan
  const peminatanRPL = await prisma.peminatan.upsert({
    where: { namaPeminatan: "Rekayasa Perangkat Lunak" },
    update: {},
    create: {
      namaPeminatan: "Rekayasa Perangkat Lunak",
      prodiId: prodiSIId,
    },
  });
  console.log("  Seeded Peminatan");

  // 5. Setup Ruangan
  const ruanganData = [
    { namaRuangan: "BF202", deskripsi: null, prodiId: prodiSIId },
    { namaRuangan: "BF203", deskripsi: null, prodiId: prodiSIId },
    {
      namaRuangan: "BF209",
      deskripsi: "Ruang Rapat Prodi",
      prodiId: prodiSIId,
    },
    {
      namaRuangan: "BF310",
      deskripsi: "Ruang Kelas Lantai 3",
      prodiId: prodiSIId,
    },
    { namaRuangan: "BF216", deskripsi: null, prodiId: prodiSIId },
  ];

  for (const r of ruanganData) {
    const existing = await prisma.ruangan.findFirst({
      where: { namaRuangan: r.namaRuangan, prodiId: r.prodiId },
    });
    if (!existing) {
      await prisma.ruangan.create({ data: r });
    } else {
      await prisma.ruangan.update({
        where: { id: existing.id },
        data: r,
      });
    }
  }
  console.log("  Seeded Ruangan");

  const defaultPassword = await bcrypt.hash("password123", 10);

  // 6. Setup Users (Superadmin)
  await prisma.user.upsert({
    where: { username: "superadmin" },
    update: {
      nama: "Super Admin System",
      password: await bcrypt.hash("1", 10),
    },
    create: {
      username: "superadmin",
      nama: "Super Admin System",
      email: "admin@univ.edu",
      password: await bcrypt.hash("1", 10),
      roleId: roleMap["superadmin"],
      status: "aktif",
    },
  });

  // Generic Accounts from User Manual
  const genericAccounts = [
    { username: "Kaprodi12345", nama: "Kaprodi Si", role: "kaprodi" },
    { username: "Sekprodi12345", nama: "Sekprodi Si", role: "sekprodi" },
    {
      username: "AdminSI",
      nama: "Admin Prodi Sistem Informasi",
      role: "admin",
    },
    { username: "AdminBio12345", nama: "Admin Prodi Biologi", role: "admin" },
    { username: "AdminKimia123", nama: "Admin Prodi Kimia", role: "admin" },
    {
      username: "AdminProdiSI",
      nama: "Admin Prodi SI",
      role: "admin_prodi",
    },
  ];

  for (const acc of genericAccounts) {
    await prisma.user.upsert({
      where: { username: acc.username },
      update: {
        nama: acc.nama,
        roleId: roleMap[acc.role],
        password: await bcrypt.hash(acc.username, 10),
      },
      create: {
        username: acc.username,
        nama: acc.nama,
        email: acc.username.toLowerCase() + "@univ.edu",
        password: await bcrypt.hash(acc.username, 10),
        roleId: roleMap[acc.role],
        status: "aktif",
      },
    });

    // Ensure these accounts have a Dosen profile for prodi scoping
    const user = await prisma.user.findUnique({
      where: { username: acc.username },
    });
    if (
      user &&
      (acc.role === "kaprodi" ||
        acc.role === "sekprodi" ||
        acc.role === "admin")
    ) {
      await prisma.dosen.upsert({
        where: { id: user.id },
        update: { prodiId: prodiSIId, status: "aktif" },
        create: {
          id: user.id,
          prodiId: prodiSIId,
          status: "aktif",
        },
      });
    }
  }

  // Note: Kaprodi and Sekprodi are seeded via the Dosen list now to avoid duplication
  // but we will ensure their roles are updated correctly in the loop below.

  // Helper function to generate username (nip_nim -> username) for Dosen
  const generateNipNim = (
    nama: string,
    nip: string,
    overrideFirstname?: string,
  ) => {
    const firstName = overrideFirstname || nama.split(/[,\s]/)[0].toLowerCase();
    const nipDigits = nip.replace(/\D/g, "").substring(0, 8);
    return (firstName + nipDigits).toLowerCase();
  };

  const dosenData = [
    {
      nidn: "2001087503",
      nip: "19750801 200912 2 001",
      nama: "Gusmelia Testiana, M.Kom.",
      tempatTanggalLahir: "Maninjau, 01-08-1975",
      pangkat: "Penata Tk.1",
      golongan: "III.d",
      status: "aktif" as const,
      prodiId: prodiSIId,
    },
    {
      nidn: "2022117502",
      nip: "19751122 200604 1 003",
      nama: "Ruliansyah, S.T., M.Kom.",
      tempatTanggalLahir: "Palembang, 22-11-1975",
      pangkat: "Penata Tk.1",
      golongan: "III.d",
      jabatan: "Dosen / Lektor",
      status: "aktif" as const,
      prodiId: prodiSIId,
    },
    {
      nidn: "2007116701",
      nip: "19671107 199803 2 001",
      nama: "Dr. Fenny Purwani, M.Kom.",
      tempatTanggalLahir: "Yogyakarta, 07-11-1967",
      pangkat: "Penata Tk.1",
      golongan: "III.d",
      jabatan: "Dosen / Lektor",
      status: "aktif" as const,
      prodiId: prodiSIId,
      overrideFirstname: "fenny",
    },
    {
      nidn: "2025117901",
      nip: "19791125 201403 2 002",
      nama: "RUSMALA SANTI, M.Kom.",
      tempatTanggalLahir: "Muba, 25-11-1979",
      pangkat: "Penata Muda Tk.1",
      golongan: "III.b",
      jabatan: "Dosen / Lektor",
      status: "aktif" as const,
      prodiId: prodiSIId,
    },
    {
      nidn: "2003058601",
      nip: "19860503 201903 1 009",
      nama: "Catur Eri Gunawan, S.T., M.Cs.",
      tempatTanggalLahir: "Palembang, 03-05-1986",
      pangkat: "Penata Muda Tk.1",
      golongan: "III.d",
      jabatan: "Dosen / Lektor",
      status: "aktif" as const,
      prodiId: prodiSIId,
    },
    {
      nidn: "0208018701",
      nip: "19870108 202012 1 009",
      nama: "Irfan Dwi Jaya, M.Kom.",
      tempatTanggalLahir: "Palembang, 08-01-1987",
      pangkat: "Penata Muda Tk.1",
      golongan: "III.b",
      jabatan: "Dosen / Asisten Ahli",
      status: "aktif" as const,
      prodiId: prodiSIId,
    },
    {
      nidn: "0214118701",
      nip: "19871114 202321 1 026",
      nama: "Fenando, M.Kom.",
      tempatTanggalLahir: "Palembang, 14-11-1987",
      pangkat: "PPPK",
      golongan: "III.d",
      jabatan: "Dosen / Lektor",
      status: "aktif" as const,
      prodiId: prodiSIId,
    },
    {
      nidn: "0203118601",
      nip: "203118601",
      nama: "Freddy Kurnia Wijaya, S.Kom., M.Eng.",
      tempatTanggalLahir: "Sarolangun Jambi, 03-11-1986",
      pangkat: "Non ASN",
      golongan: "III.b",
      jabatan: "Dosen / Asisten Ahli",
      status: "aktif" as const,
      prodiId: prodiSIId,
    },
    {
      nidn: "0215108502",
      nip: "19851015 202521 2 005",
      nama: "Evi Fadilah, M.Kom.",
      tempatTanggalLahir: "Palembang, 15-10-1985",
      pangkat: "PPPK",
      golongan: "III.c",
      jabatan: "Dosen / Lektor",
      status: "aktif" as const,
      prodiId: prodiSIId,
    },
    {
      nidn: "0223108404",
      nip: "19841023 202321 1 016",
      nama: "Muhamad Kadafi, M.Kom.",
      tempatTanggalLahir: "Palembang, 23-10-1984",
      pangkat: "PPPK",
      golongan: "III.c",
      jabatan: "Dosen / Lektor",
      status: "aktif" as const,
      prodiId: prodiSIId,
      overrideFirstname: "kadafi",
    },
    {
      nidn: "2029128503",
      nip: "19851229 202321 1 020",
      nama: "Muhamad Son Muarie, M.Kom.",
      tempatTanggalLahir: "Lumpatan, 29-12-1985",
      pangkat: "PPPK",
      golongan: "III.b",
      jabatan: "Dosen / Asisten Ahli",
      status: "aktif" as const,
      prodiId: prodiSIId,
      overrideFirstname: "son",
    },
    {
      nidn: "2017118205",
      nip: "19821117 202321 2 021",
      nama: "Fathiyah Nopriani, S.T., M.Kom.",
      tempatTanggalLahir: "Palembang, 17-11-1982",
      pangkat: "PPPK",
      golongan: "III.c",
      status: "aktif" as const,
      prodiId: prodiSIId,
    },
    {
      nidn: "2021128901",
      nip: "19891221 202321 1 018",
      nama: "Imamulhakim Syahid Putra, M.Kom.",
      tempatTanggalLahir: "Jaksel, 21-12-1989",
      pangkat: "PPPK",
      golongan: "III.b",
      jabatan: "Dosen / Asisten Ahli",
      status: "aktif" as const,
      prodiId: prodiSIId,
    },
    {
      nidn: "2010098902",
      nip: "19890910 202321 1 028",
      nama: "Aminullah Imal Alfresi, S.T., M.Kom.",
      tempatTanggalLahir: "Belitang, 10-09-1989",
      pangkat: "PPPK",
      golongan: "III.b",
      jabatan: "Dosen / Asisten Ahli",
      status: "aktif" as const,
      prodiId: prodiSIId,
    },
    {
      nidn: "2004049101",
      nip: "19910104 202321 2 041",
      nama: "Sri Rahayu, M.Kom.",
      tempatTanggalLahir: "Palembang, 04-01-1991",
      pangkat: "PPPK",
      golongan: "III.b",
      jabatan: "Dosen / Asisten Ahli",
      status: "aktif" as const,
      prodiId: prodiSIId,
    },
    {
      nidn: "2030129301",
      nip: "19931230 202321 1 017",
      nama: "M. Leandry Dalafranka, S.SI., M.Kom.",
      tempatTanggalLahir: "Palembang, 30-12-1993",
      pangkat: "PPPK",
      golongan: "III.b",
      jabatan: "Dosen / Asisten Ahli",
      status: "aktif" as const,
      prodiId: prodiSIId,
      overrideFirstname: "leandry",
    },
    {
      nidn: "2023058902",
      nip: "198905232025212020",
      nama: "Indah Hidayanti, S.T., M.Kom.",
      tempatTanggalLahir: "Palembang, 23-05-1989",
      pangkat: "PPPK",
      golongan: "III.b",
      jabatan: "Dosen / Asisten Ahli",
      status: "aktif" as const,
      prodiId: prodiSIId,
    },
    {
      nidn: "2009048801",
      nip: "19880904 202521 2 002",
      nama: "Reni Septiyanti, S.SI., M.Kom.",
      tempatTanggalLahir: "Plaju, 04-09-1988",
      pangkat: "PPPK",
      golongan: "III.b",
      jabatan: "Dosen / Asisten Ahli",
      status: "aktif" as const,
      prodiId: prodiSIId,
    },
    {
      nidn: "2030069402",
      nip: "19940630 202521 2 009",
      nama: "Gina Agiyani, M.Kom.",
      tempatTanggalLahir: "Tanjung Batu, 30-06-1994",
      pangkat: "PPPK",
      golongan: "III.b",
      jabatan: "Dosen / Asisten Ahli",
      status: "aktif" as const,
      prodiId: prodiSIId,
    },
    {
      nidn: "2013047902",
      nip: "19790403 202321 1 007",
      nama: "M. Syendi Apriko, M.Kom.",
      tempatTanggalLahir: "Palembang, 13-04-1979",
      pangkat: "PPPK",
      golongan: "III.b",
      jabatan: "Dosen / Asisten Ahli",
      status: "aktif" as const,
      prodiId: prodiSIId,
      overrideFirstname: "syendi",
    },
    {
      nidn: "0221039001",
      nip: "199003212024031001",
      nama: "Deni Fikari, S.Kom., M.Kom.",
      tempatTanggalLahir: "Kab. Musi Banyuasin, 21 Maret 1990",
      pangkat: "CPNS",
      golongan: "III.b",
      jabatan: "Cados",
      status: "aktif" as const,
      prodiId: prodiSIId,
    },
    {
      nidn: "2001027202",
      nip: "197202012000031004",
      nama: "Dr. Muhammad Isnaini, M.Pd",
      tempatTanggalLahir: null,
      pangkat: "CPNS",
      golongan: "III.b",
      jabatan: "Dekan",
      status: "aktif" as const,
      prodiId: prodiSIId,
      overrideFirstname: "isnaini",
    },
    {
      nidn: "0002018705",
      nip: "198701022018011001",
      nama: "REZA ADE PUTRA, S.Pd, M.Cs",
      tempatTanggalLahir: null,
      pangkat: "CPNS",
      golongan: "III.b",
      jabatan: "Cados",
      status: "tidak_aktif" as const,
      prodiId: prodiSIId,
    },
    {
      nidn: "2015128801",
      nip: "19881215 202321 1 005",
      nama: "DIAN HAFIDH ZULFIKAR, S.Kom., M.Cs.",
      tempatTanggalLahir: "Palembang, 15-12-1988",
      pangkat: "PPPK",
      golongan: "III.b",
      jabatan: "Dosen / Asisten Ahli",
      status: "aktif" as const,
      prodiId: prodiSIId,
    },
  ];

  // 7. Setup Dosen (User and Profile)
  const sequencialDosenIds: number[] = [];

  for (const d of dosenData) {
    const username =
      (d as any).overrideUsername ||
      generateNipNim(d.nama, d.nip, (d as any).overrideFirstname);
    const email = username + "@radenfatah.ac.id";
    const roleName = (d as any).role || "dosen";

    // Specific password mapping from manual
    const specialPasswords: Record<string, string> = {
      kadafi19841023: "muhamad19841023",
      son19851229: "muhamad19851229",
      imamulhakim19891221: "imamulhakim19891222",
      aminullah19890910: "aminullah19890911",
      sri19910104: "sri19910105",
      leandry19931230: "m.19931231",
      reni19880904: "reni19880905",
      gina19940630: "gina19940631",
    };

    const plainPassword = specialPasswords[username] || username;
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // CRITICAL FIX: Avoid Unique constraint violation on NIDN/NIP if username changed.
    // Check if a Dosen already exists with this NIDN or NIP.
    const existingDosen = await prisma.dosen.findFirst({
      where: {
        OR:
          d.nidn && d.nip
            ? [{ nidn: d.nidn }, { nip: d.nip }]
            : d.nidn
              ? [{ nidn: d.nidn }]
              : d.nip
                ? [{ nip: d.nip }]
                : [],
      },
      include: { user: true },
    });

    if (existingDosen && existingDosen.user.username !== username) {
      // Check if 'username' is already taken by ANOTHER user
      const conflictingUser = await prisma.user.findUnique({
        where: { username },
      });
      if (conflictingUser && conflictingUser.id !== existingDosen.id) {
        console.log(
          `  Cleaning up conflicting record for ${username} (ID: ${conflictingUser.id})`,
        );

        // MANUAL CASCADE DELETE for Dosen
        // 1. Check if it has Penguji records
        await prisma.penilaian.deleteMany({
          where: { dosenId: conflictingUser.id },
        });
        await prisma.pengujiUjian.deleteMany({
          where: { dosenId: conflictingUser.id },
        });

        // 2. Clear supervisions (Mahasiswa references)
        await prisma.mahasiswa.updateMany({
          where: { dosenPa: conflictingUser.id },
          data: { dosenPa: null },
        });
        await prisma.mahasiswa.updateMany({
          where: { pembimbing1: conflictingUser.id },
          data: { pembimbing1: null },
        });
        await prisma.mahasiswa.updateMany({
          where: { pembimbing2: conflictingUser.id },
          data: { pembimbing2: null },
        });

        // 3. Delete Dosen profile
        await prisma.dosen.deleteMany({ where: { id: conflictingUser.id } });

        // 4. Delete Mahasiswa profile (if any)
        await prisma.mahasiswa.deleteMany({
          where: { id: conflictingUser.id },
        });

        // 5. Finally delete the user
        await prisma.user.delete({ where: { id: conflictingUser.id } });
      }

      console.log(
        `  Aligning existing user ${existingDosen.user.username} to new username ${username}`,
      );
      await prisma.user.update({
        where: { id: existingDosen.id },
        data: { username },
      });
    }

    const user = await prisma.user.upsert({
      where: { username },
      update: {
        nama: d.nama,
        roleId: roleMap[roleName],
        password: hashedPassword,
      },
      create: {
        username,
        nama: d.nama,
        email,
        password: hashedPassword,
        roleId: roleMap[roleName],
        status: d.status,
      },
    });

    await prisma.dosen.upsert({
      where: { id: user.id },
      update: {
        nidn: d.nidn,
        nip: d.nip,
        email,
        tempatTanggalLahir: d.tempatTanggalLahir,
        pangkat: d.pangkat,
        golongan: d.golongan,
        jabatan: d.jabatan,
        status: d.status,
        prodiId: d.prodiId,
      },
      create: {
        id: user.id,
        nidn: d.nidn,
        nip: d.nip,
        email,
        tempatTanggalLahir: d.tempatTanggalLahir,
        pangkat: d.pangkat,
        golongan: d.golongan,
        jabatan: d.jabatan,
        status: d.status,
        prodiId: d.prodiId,
      },
    });

    sequencialDosenIds.push(user.id);
  }
  console.log("  Seeded Dosen");

  // 8. Setup Mahasiswa
  console.log("Seeding students from external data...");

  // Assume data files are relative to current project space. The initial setup used:
  // ../../ujian-backend/database/data/dosen_pa_initial.csv
  // From logic: backend is at 'server', and ujian-backend might be parallel. Let's make paths robust.
  const csvPath = path.join(
    process.cwd(),
    "..",
    "ujian-backend",
    "database",
    "data",
    "dosen_pa_initial.csv",
  );
  const jsonPath = path.join(
    process.cwd(),
    "..",
    "ujian-backend",
    "database",
    "data",
    "Mahasiswa_Per_Angkatan_2019-2025.json",
  );

  let nimToPaMap = new Map<string, number>();
  if (fs.existsSync(csvPath)) {
    const csvData = fs.readFileSync(csvPath, "utf8");
    csvData.split("\n").forEach((line: string) => {
      const parts = line.split(",");
      if (parts.length >= 5) {
        const nim = parts[1]?.trim();
        const paIndex = parseInt(parts[4]?.trim());
        if (nim && !isNaN(paIndex)) {
          nimToPaMap.set(nim, paIndex);
        }
      }
    });
  } else {
    console.warn("  CSV dosen_pa_initial.csv not found -> SKIPPED PA MAPPINGS");
  }

  if (fs.existsSync(jsonPath)) {
    const jsonContent = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    const years = Object.keys(jsonContent);

    for (const year of years) {
      const students = jsonContent[year];
      console.log(
        `  Processing angkatan ${year} (${students.length} students)`,
      );

      for (const s of students) {
        const nimStr = s.nim.toString();
        const email = `${nimStr}@mhs.radenfatah.ac.id`;

        // Determine Dosen PA ID
        let dosenPaId: number | null = null;
        const csvPaIndex = nimToPaMap.get(nimStr);
        if (
          csvPaIndex &&
          csvPaIndex > 0 &&
          csvPaIndex <= sequencialDosenIds.length
        ) {
          dosenPaId = sequencialDosenIds[csvPaIndex - 1];
        }

        const user = await prisma.user.upsert({
          where: { username: nimStr },
          update: {
            nama: s.nama,
            email,
            password: defaultPassword,
          },
          create: {
            username: nimStr,
            nama: s.nama,
            email,
            password: defaultPassword,
            roleId: roleMap["mahasiswa"],
            status: "aktif",
          },
        });

        await prisma.mahasiswa.upsert({
          where: { id: user.id },
          update: {
            nim: nimStr,
            angkatan: year,
            dosenPa: dosenPaId,
            status: "aktif",
          },
          create: {
            id: user.id,
            prodiId: prodiSIId,
            nim: nimStr,
            angkatan: year,
            semester: 8,
            ipk: 3.5,
            status: "aktif",
            dosenPa: dosenPaId,
          },
        });
      }
    }
    console.log("  Seeded Mahasiswa");
  } else {
    console.warn("  JSON Mahasiswa_Per_Angkatan.json not found -> SKIPPED MHS");
  }

  // 9. Setup Jenis Ujian
  console.log("Seeding types and formats...");

  const jenisUjians = [
    { id: 1, namaJenis: "Seminar Proposal", aktif: true },
    { id: 2, namaJenis: "Ujian Hasil", aktif: true },
    { id: 3, namaJenis: "Ujian Skripsi", aktif: true },
  ];

  for (const jenis of jenisUjians) {
    await prisma.jenisUjian.upsert({
      where: { id: jenis.id },
      update: { aktif: jenis.aktif, namaJenis: jenis.namaJenis },
      create: jenis,
    });
  }

  // 10. Setup Syarat
  console.log("  Seeding Syarat (Requirements)...");

  // Clear existing Syarat to avoid duplicates and ensure sync with seeder
  await prisma.syarat.deleteMany({});

  const syaratData = [
    // 1. Seminar Proposal (ID: 1)
    {
      jenisUjianId: 1,
      items: [
        "Bukti Lulus mata kuliah Metodologi Penelitian (minimal C)",
        "SKS yang telah ditempuh minimal >= 100 sks",
        "Transkrip nilai sementara yang dilegalisir",
        "Formulir pengajuan judul dan pembimbing skripsi yang telah ditanda tangani Koordinator Skripsi dan Ketua Program Studi",
        "Halaman pengesahan proposal skripsi yang di tanda tangani Pembimbing dan Ketua Program Studi",
        "Surat Keterangan Lulus Cek Plagiat",
        "File Proposal Skripsi Lengkap dengan format PDF dikirim ke email si@radenfatah.ac.id dengan nama file Nama-NIM-Proposal",
        "Form Perbaikan Proposal untuk ujian ke-2, 3 dst.",
      ],
    },
    // 2. Ujian Hasil (ID: 2)
    {
      jenisUjianId: 2,
      items: [
        "Bukti pembayaran SPP semester berjalan",
        "KST yang tercantum Skripsi",
        "Transkrip nilai sementara yang dilegalisir",
        "Surat Keterangan Lulus Ujian Seminar Proposal",
        "Bukti lulus ujian BTA (sertifikat BTA)",
        "Bukti lulus TOEFL >= 400",
        "Bukti hafalan 10 surat Juz 'Amma",
        "Ijazah SMA/MA",
        "Sertifikat KKN",
        "Bukti hadir dalam seminar proposal",
        "Halaman Pengesahan Skripsi untuk ujian hasil yang ditanda tangani Pembimbing dan Ketua Program Stud",
        "Formulir Mengikuti Ujian Hasil",
        "Surat Keterangan Lulus Cek Plagiat",
        "File Hasil Skripsi Lengkap dengan format PDF dikirim ke email si@radenfatah.ac.id dengan nama file Nama-NIM-Hasil",
        "Formulir Perbaikan Proposal Skripsi",
        "Form Perbaikan Hasil untuk ujian ke-2, 3 dst.",
      ],
    },
    // 3. Ujian Skripsi (ID: 3)
    {
      jenisUjianId: 3,
      items: [
        "Skripsi yang di ACC Pembimbing I dan II",
        "Surat Kelengkapan Berkas Yang Telah Ditanda tangani oleh Ka. Prodi / Sek. Prodi",
        "Surat Rekapitulasi Nilai Ujian Komprehensif",
        "Surat Ket. Perubahan Judul (Jika Berubah)",
        "Surat Izin Penelitian",
        "KTM",
        "Bukti pembayaran SPP semester berjalan",
        "Transkrip nilai sementara yang dilegalisir",
        "Surat Keterangan Lulus Ujian Seminar Proposal",
        "Bukti lulus ujian BTA (sertifikat BTA)",
        "Sertifikat KKN",
        "Formulir Mengikuti Ujian Skripsi",
        "Surat Keterangan Lulus Ujian Hasil",
        "Surat Keterangan Lulus Cek Plagiat",
        "Bukti mengirim (Submit) jurnal ilmiah",
        "Sertifikat OSPEK",
        "Halaman Pengesahan Skripsi yang ditanda tangani oleh Pembimbing dan ketua Program Studi",
        "File Skripsi Lengkap dengan format PDF dikirim ke email si@radenfatah.ac.id dengan nama file Nama-NIM-Skripsi",
        "Formulir Perbaikan Hasil Skripsi",
        "Form Perbaikan Skripsi untuk ujian ke-2, 3 dst.",
      ],
    },
  ];

  for (const group of syaratData) {
    for (const item of group.items) {
      const lowerItem = item.toLowerCase();
      // Determine Obligatory (Wajib)
      let wajib = true;
      if (
        lowerItem.includes("perbaikan") ||
        lowerItem.includes("jika berubah")
      ) {
        wajib = false;
      }

      await prisma.syarat.create({
        data: {
          jenisUjianId: group.jenisUjianId,
          namaSyarat: item,
          wajib: wajib,
        },
      });
    }
  }

  // 11. Setup Komponen Penilaian (Untuk Semua Penguji) - Proposal Seminar
  const komponenData = [
    {
      kriteria: "Efektivitas Pendahuluan",
      indikatorPenilaian: null,
      jenisUjianId: 1,
    },
    {
      kriteria: "Motivasi pada Penelitian",
      indikatorPenilaian: null,
      jenisUjianId: 1,
    },
    { kriteria: "Literatur Review", indikatorPenilaian: null, jenisUjianId: 1 },
    { kriteria: "Metodologi", indikatorPenilaian: null, jenisUjianId: 1 },
    { kriteria: "Sikap/Presentasi", indikatorPenilaian: null, jenisUjianId: 1 },
    { kriteria: "Bimbingan", indikatorPenilaian: null, jenisUjianId: 1 },
  ];

  const komponenMap: Record<string, number> = {};
  for (const k of komponenData) {
    const ex = await prisma.komponenPenilaian.findFirst({
      where: { kriteria: k.kriteria, jenisUjianId: k.jenisUjianId },
    });
    let created;
    if (!ex) created = await prisma.komponenPenilaian.create({ data: k });
    else
      created = await prisma.komponenPenilaian.update({
        where: { id: ex.id },
        data: k,
      });

    komponenMap[k.kriteria] = created.id;
  }

  // 12. Setup Bobot Komponen Peran
  // Data target bobot berdasarkan request
  const bobotPeranData = [
    // ketua, sekretaris, p1, p2
    { kriteria: "Efektivitas Pendahuluan", bobots: [20, 20, 20, 20] },
    { kriteria: "Motivasi pada Penelitian", bobots: [15, 15, 15, 15] },
    { kriteria: "Literatur Review", bobots: [15, 15, 15, 15] },
    { kriteria: "Metodologi", bobots: [15, 15, 15, 15] },
    { kriteria: "Sikap/Presentasi", bobots: [20, 20, 35, 35] },
    { kriteria: "Bimbingan", bobots: [15, 15, null, null] },
  ];

  const perans: PengujiPeran[] = [
    "ketua_penguji",
    "sekretaris_penguji",
    "penguji_1",
    "penguji_2",
  ];

  for (const row of bobotPeranData) {
    const kompId = komponenMap[row.kriteria];
    if (!kompId) continue;

    for (let i = 0; i < 4; i++) {
      const bobot = row.bobots[i];
      if (bobot === null) continue; // Skip bimbingan for p1 and p2

      const peran = perans[i];
      const ex = await prisma.bobotKomponenPeran.findFirst({
        where: { komponenPenilaianId: kompId, peran },
      });
      if (!ex) {
        await prisma.bobotKomponenPeran.create({
          data: {
            komponenPenilaianId: kompId,
            peran,
            bobot,
          },
        });
      } else {
        await prisma.bobotKomponenPeran.update({
          where: { id: ex.id },
          data: { bobot },
        });
      }
    }
  }
  // 13. Setup Master Keputusan
  console.log("  Seeding Master Keputusan...");
  const keputusanData = [
    // Ujian Proposal (jenisUjianId = 1)
    { kode: "PROPOSAL_DITERIMA", namaKeputusan: "Diterima", jenisUjianId: 1 },
    {
      kode: "PROPOSAL_DITOLAK",
      namaKeputusan: "Ditolak dengan catatan terlampir",
      jenisUjianId: 1,
    },

    // Ujian Hasil (jenisUjianId = 2)
    {
      kode: "HASIL_DITERIMA_TANPA_PERBAIKAN",
      namaKeputusan: "Dapat diterima tanpa perbaikan",
      jenisUjianId: 2,
    },
    {
      kode: "HASIL_DITERIMA_PERBAIKAN_KECIL",
      namaKeputusan: "Dapat diterima dengan perbaikan kecil",
      jenisUjianId: 2,
    },
    {
      kode: "HASIL_DITERIMA_PERBAIKAN_BESAR",
      namaKeputusan: "Dapat diterima dengan perbaikan besar",
      jenisUjianId: 2,
    },
    {
      kode: "HASIL_BELUM_DITERIMA",
      namaKeputusan: "Belum dapat diterima",
      jenisUjianId: 2,
    },

    // Ujian Skripsi (jenisUjianId = 3)
    {
      kode: "SKRIPSI_DITERIMA_TANPA_PERBAIKAN",
      namaKeputusan: "Dapat diterima tanpa perbaikan",
      jenisUjianId: 3,
    },
    {
      kode: "SKRIPSI_DITERIMA_PERBAIKAN_KECIL",
      namaKeputusan: "Dapat diterima dengan perbaikan kecil",
      jenisUjianId: 3,
    },
    {
      kode: "SKRIPSI_DITERIMA_PERBAIKAN_BESAR",
      namaKeputusan: "Dapat diterima dengan perbaikan besar",
      jenisUjianId: 3,
    },
    {
      kode: "SKRIPSI_BELUM_DITERIMA",
      namaKeputusan: "Belum dapat diterima",
      jenisUjianId: 3,
    },
  ];

  for (const k of keputusanData) {
    await prisma.keputusan.upsert({
      where: { kode: k.kode },
      update: {
        namaKeputusan: k.namaKeputusan,
        jenisUjianId: k.jenisUjianId,
        aktif: true,
      },
      create: {
        kode: k.kode,
        namaKeputusan: k.namaKeputusan,
        jenisUjianId: k.jenisUjianId,
        aktif: true,
      },
    });
  }
  console.log("  Master Keputusan seeded");

  console.log("Seeding finished.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
