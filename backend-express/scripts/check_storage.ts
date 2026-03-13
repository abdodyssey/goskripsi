import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkStorage() {
  console.log("Checking bucket 'skripsi_docs' contents...");

  const { data, error } = await supabase.storage
    .from("skripsi_docs")
    .list("signatures", {
      limit: 100,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });

  if (error) {
    console.error("Error listing signatures folder:", error);
    return;
  }

  console.log(
    "Folders in 'signatures/':",
    data.map((f) => f.name),
  );

  for (const folder of data) {
    if (folder.name.includes(".")) continue; // skip files if any at this level

    const { data: files, error: fileError } = await supabase.storage
      .from("skripsi_docs")
      .list(`signatures/${folder.name}`);

    if (fileError) {
      console.error(`Error listing signatures/${folder.name}:`, fileError);
      continue;
    }

    console.log(
      `Files in signatures/${folder.name}:`,
      files.map((f) => f.name),
    );
  }
}

checkStorage();
