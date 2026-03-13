import "dotenv/config";
import { prisma } from "./src/utils/prisma";
import { pendaftaranUjianService } from "./src/services/pendaftaran-ujian.service";

async function testIndex() {
  try {
    console.log("Testing getAll service...");
    const data = await pendaftaranUjianService.getAll();
    console.log("SUCCESS! Found:", data.length, "records");
    if (data.length > 0) {
      console.log("First record ID:", data[0].id.toString());
    }
  } catch (err) {
    console.error("FAILED INDEX!", err);
  } finally {
    process.exit(0);
  }
}

testIndex();
