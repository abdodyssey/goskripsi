import "dotenv/config";
import { prisma } from "./src/utils/prisma";
import { pendaftaranUjianService } from "./src/services/pendaftaran-ujian.service";

async function test() {
  process.on("unhandledRejection", (e) => console.error("UNHANDLED:", e));
  try {
    console.log("Testing with 10 files...");
    const mockFiles = Array.from({ length: 10 }).map((_, i) => ({
      originalname: `Syarat Ke ${i + 1} (Mandatory).pdf`,
      buffer: Buffer.from(`dummy pdf content ${i}`),
      fieldname: "berkas",
      encoding: "7bit",
      mimetype: "application/pdf",
      size: 18,
    })) as any;

    const payload = {
      mahasiswa_id: 3,
      ranpel_id: 4,
      jenis_ujian_id: 1,
      keterangan: "TEST 10 FILES",
    } as any;

    const result = await pendaftaranUjianService.store(payload, mockFiles);
    console.log("SUCCESS! Created with:", result.berkas.length, "files");
  } catch (err) {
    console.error("FAILED!", err);
  } finally {
    process.exit(0);
  }
}

test();
