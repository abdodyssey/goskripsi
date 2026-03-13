import "dotenv/config";
import { supabaseAdmin } from "./src/utils/supabase";
import path from "path";

async function testUpload() {
  try {
    const nim = "10111111";
    const buffer = Buffer.from("test content");
    const timestamp = Date.now();
    const storagePath = `submissions/${nim}/test_${timestamp}.pdf`;

    console.log(`Uploading to Supabase: ${storagePath}`);
    const { data, error } = await supabaseAdmin.storage
      .from("skripsi_docs")
      .upload(storagePath, buffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (error) {
      console.error("UPLOAD ERROR:", error);
    } else {
      console.log("UPLOAD SUCCESS!", data);
    }
  } catch (err) {
    console.error("SCRIPT ERROR:", err);
  }
}

testUpload();
