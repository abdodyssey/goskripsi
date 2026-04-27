const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  console.log("Cleaning up Bimbingan scores for Penguji 1 & 2...");
  
  // Find the 'Bimbingan' component
  const bimbinganComp = await prisma.komponenPenilaian.findFirst({
    where: { kriteria: "Bimbingan" }
  });
  
  if (!bimbinganComp) {
    console.log("Bimbingan component not found. Skipping.");
    return;
  }
  
  // Find all examiners who are Penguji 1 or 2
  const pengujis = await prisma.pengujiUjian.findMany({
    where: {
      peran: { in: ["penguji_1", "penguji_2"] }
    }
  });
  
  for (const p of pengujis) {
    const deleted = await prisma.penilaian.deleteMany({
      where: {
        ujianId: p.ujianId,
        dosenId: p.dosenId,
        komponenPenilaianId: bimbinganComp.id
      }
    });
    if (deleted.count > 0) {
      console.log(`Deleted ${deleted.count} records for Ujian ID ${p.ujianId}, Dosen ID ${p.dosenId}`);
    }
  }
  
  console.log("Cleanup finished.");
}

cleanup()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
