import "dotenv/config";
import { prisma } from "./src/utils/prisma";
import { pendaftaranUjianService } from "./src/services/pendaftaran-ujian.service";

async function test() {
  process.on("unhandledRejection", (e) => console.error("UNHANDLED:", e));
  try {
    console.log("Testing pendaftaran ujian service...");
    // Mock files
    const mockFiles = [
      {
        originalname: "Test Syarat.pdf",
        buffer: Buffer.from("dummy pdf content"),
        fieldname: "berkas",
        encoding: "7bit",
        mimetype: "application/pdf",
        size: 18,
      },
    ] as any;

    const payload = {
      mahasiswa_id: 3,
      ranpel_id: 4,
      jenis_ujian_id: 1,
      keterangan: "TEST FROM SCRIPT",
    } as any;

    const result = await pendaftaranUjianService.store(payload, mockFiles);
    console.log(
      "SUCCESS!",
      JSON.stringify(
        result,
        (k, v) => (typeof v === "bigint" ? v.toString() : v),
        2,
      ),
    );
  } catch (err) {
    console.error("FAILED!", err);
  } finally {
    process.exit(0);
  }
}

test();
