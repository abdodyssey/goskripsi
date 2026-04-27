const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const ujianId = 8;
  const penilaians = await prisma.penilaian.findMany({
    where: { ujianId },
    include: {
      komponenPenilaian: { include: { bobotKomponenPerans: true } },
      dosen: { include: { user: true } }
    }
  });

  console.log(`Scores for Ujian ID ${ujianId}:`);
  penilaians.forEach(p => {
    const roleRel = p.komponenPenilaian.bobotKomponenPerans.find(b => b.bobot > 0); // This is not reliable for role
    // We need to know the role from pengujiUjian
    console.log(`- Dosen: ${p.dosen.user.nama}, Komponen: ${p.komponenPenilaian.kriteria}, Nilai: ${p.nilai}`);
  });

  const ujian = await prisma.ujian.findUnique({ where: { id: ujianId } });
  console.log(`\nUjian Status: ${ujian.status}, Hasil: ${ujian.hasil}, Nilai Akhir: ${ujian.nilaiAkhir}`);
}

check().catch(e => console.error(e)).finally(() => prisma.$disconnect());
