import "dotenv/config";
import { authService } from "./src/services/auth.service";

async function test() {
  try {
    // Let's find a real user ID first
    const profile = await authService.getProfile("33");
    console.log("Profile result:", JSON.stringify(profile, null, 2));
  } catch (err) {
    console.error("Test failed with error:", err);
  }
}

test();
