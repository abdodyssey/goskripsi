const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const mId = 471; // Based on the user's recent log: POST /api/ranpel/mahasiswa/471
  console.log(`Checking Mahasiswa ID ${mId}...`);
  
  const mhs = await prisma.mahasiswa.findUnique({
    where: { id: mId },
    include: {
      user: true,
      dosenPaRel: { include: { user: true } }
    }
  });
  
  if (!mhs) {
    console.log("Mahasiswa not found.");
    return;
  }
  
  console.log(`Mhs: ${mhs.user.nama} (${mhs.user.email})`);
  if (mhs.dosenPaRel) {
    console.log(`Dosen PA: ${mhs.dosenPaRel.user.nama} (${mhs.dosenPaRel.user.email})`);
  } else {
    console.log("Dosen PA not assigned.");
  }
}

check().catch(e => console.error(e)).finally(() => prisma.$disconnect());
