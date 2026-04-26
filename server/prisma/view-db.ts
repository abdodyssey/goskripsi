import "dotenv/config";
import { prisma } from "../src/utils/prisma";

async function main() {
  const prodi = await prisma.prodi.findMany();
  console.log("Prodi:", JSON.stringify(prodi, null, 2));

  const ruangan = await prisma.ruangan.findMany();
  console.log("Ruangan:", JSON.stringify(ruangan, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
