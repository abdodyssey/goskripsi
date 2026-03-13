import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Starting URL fix migration...");

  // 1. DokumenMahasiswa
  const docs = await prisma.dokumenMahasiswa.findMany({
    where: {
      fileUrl: {
        contains: "/object/authenticated/",
      },
    },
  });
  console.log(`Found ${docs.length} DokumenMahasiswa to fix.`);
  for (const doc of docs) {
    const newUrl = doc.fileUrl.replace(
      "/object/authenticated/",
      "/object/public/",
    );
    await prisma.dokumenMahasiswa.update({
      where: { id: doc.id },
      data: { fileUrl: newUrl },
    });
  }

  // 2. PemenuhanSyarat
  const syarats = await prisma.pemenuhanSyarat.findMany({
    where: {
      fileBukti: {
        contains: "/object/authenticated/",
      },
    },
  });
  console.log(`Found ${syarats.length} PemenuhanSyarat to fix.`);
  for (const s of syarats) {
    if (s.fileBukti) {
      const newUrl = s.fileBukti.replace(
        "/object/authenticated/",
        "/object/public/",
      );
      await prisma.pemenuhanSyarat.update({
        where: { id: s.id },
        data: { fileBukti: newUrl },
      });
    }
  }

  // 3. User signatures (Mahasiswa & Dosen)
  const mahasiswas = await prisma.mahasiswa.findMany({
    where: {
      urlTtd: {
        contains: "/object/authenticated/",
      },
    },
  });
  console.log(`Found ${mahasiswas.length} Mahasiswa signatures to fix.`);
  for (const m of mahasiswas) {
    if (m.urlTtd) {
      const newUrl = m.urlTtd.replace(
        "/object/authenticated/",
        "/object/public/",
      );
      await prisma.mahasiswa.update({
        where: { id: m.id },
        data: { urlTtd: newUrl },
      });
    }
  }

  const dosens = await prisma.dosen.findMany({
    where: {
      urlTtd: {
        contains: "/object/authenticated/",
      },
    },
  });
  console.log(`Found ${dosens.length} Dosen signatures to fix.`);
  for (const d of dosens) {
    if (d.urlTtd) {
      const newUrl = d.urlTtd.replace(
        "/object/authenticated/",
        "/object/public/",
      );
      await prisma.dosen.update({
        where: { id: d.id },
        data: { urlTtd: newUrl },
      });
    }
  }

  console.log("Migration completed successfully.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
