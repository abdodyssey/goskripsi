const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function recalculate() {
  const ujianId = 8;
  console.log(`Recalculating Ujian ID ${ujianId}...`);

  const ujian = await prisma.ujian.findUnique({
    where: { id: ujianId },
    include: {
      pengujiUjians: { where: { hadir: true } },
    },
  });

  if (!ujian) {
    console.error("Ujian not found");
    return;
  }

  const presentDosenIds = ujian.pengujiUjians.map((p) => p.dosenId);
  const penilaians = await prisma.penilaian.findMany({
    where: { ujianId, dosenId: { in: presentDosenIds } },
    include: {
      komponenPenilaian: { include: { bobotKomponenPerans: true } },
    },
  });

  const rolesMap = new Map();
  ujian.pengujiUjians.forEach((p) => rolesMap.set(p.dosenId, p.peran));

  let sumNilaiBobot = 0;
  let sumBobot = 0;
  let anyScoreUnder60 = false;

  for (const p of penilaians) {
    const peran = rolesMap.get(p.dosenId);
    const bobotData = p.komponenPenilaian.bobotKomponenPerans.find(
      (b) => b.peran === peran,
    );
    const bobot = bobotData?.bobot || 0;
    const nilai = Number(p.nilai) || 0;

    if (bobot > 0 && nilai < 60) {
      console.log(`- Found score < 60: Dosen ${p.dosenId}, Component ${p.komponenPenilaianId}, Value ${nilai}`);
      anyScoreUnder60 = true;
    }

    sumNilaiBobot += nilai * bobot;
    sumBobot += bobot;
  }

  if (sumBobot === 0) {
    console.error("Total weight is 0");
    return;
  }

  const nilaiAkhir = sumNilaiBobot / sumBobot;
  let nilaiHuruf = "E";
  if (nilaiAkhir >= 80) nilaiHuruf = "A";
  else if (nilaiAkhir >= 70) nilaiHuruf = "B";
  else if (nilaiAkhir >= 60) nilaiHuruf = "C";
  else if (nilaiAkhir >= 56) nilaiHuruf = "D";

  const lulusByGrade = ["A", "B", "C"].includes(nilaiHuruf);
  const hasilFinal = lulusByGrade && !anyScoreUnder60 ? "lulus" : "tidak_lulus";

  console.log(`New Result -> Nilai Akhir: ${nilaiAkhir.toFixed(2)}, Huruf: ${nilaiHuruf}, Hasil: ${hasilFinal}`);

  await prisma.ujian.update({
    where: { id: ujianId },
    data: {
      nilaiAkhir: nilaiAkhir,
      nilaiHuruf: nilaiHuruf,
      hasil: hasilFinal,
    },
  });

  console.log("Update successful.");
}

recalculate()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
