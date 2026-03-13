import "dotenv/config";
import { authService } from "./src/services/auth.service";

async function test() {
  const ids = ["6", "33", "34", "35", "36", "37", "3749", "3750"];
  for (const id of ids) {
    try {
      console.log(`Testing ID ${id}...`);
      await authService.getProfile(id);
      console.log(`ID ${id} OK`);
    } catch (err) {
      console.error(`ID ${id} FAILED:`, err);
    }
  }
}

test();
