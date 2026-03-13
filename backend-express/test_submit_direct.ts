import { pendaftaranUjianService } from "./src/services/pendaftaran-ujian.service";
import { prisma } from "./src/utils/prisma";

async function testSubmit() {
  try {
    const result = await pendaftaranUjianService.submit("1");
    console.log("SUCCESS:", JSON.stringify(result, null, 2));
  } catch (err: any) {
    console.error("ERROR_MESSAGE:", err.message);
    if (err.stack) console.error("STACK:", err.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testSubmit();
