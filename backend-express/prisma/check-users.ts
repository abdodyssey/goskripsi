import "dotenv/config";
import { prisma } from "../src/utils/prisma";

async function main() {
  const users = await prisma.user.findMany({
    include: { role: true },
  });
  console.log("Users in DB:");
  users.forEach((u) => {
    console.log(
      `ID: ${u.id}, Username: ${u.username}, Role: ${u.role.name}, Name: ${u.nama}`,
    );
  });

  const specific = await prisma.user.findUnique({
    where: { username: "gusmelia19750801" },
  });
  console.log(
    "\nSpecific user 'gusmelia19750801':",
    specific ? "FOUND" : "NOT FOUND",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
