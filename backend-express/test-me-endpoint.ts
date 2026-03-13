import "dotenv/config";
import app from "./src/app";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

async function testMe() {
  const token = jwt.sign(
    { id: "33", username: "2130803095", roles: ["mahasiswa"] },
    JWT_SECRET,
    { expiresIn: "1d" },
  );

  // We can't easily use 'supertest' here without installing it,
  // but we can just use the app directly with mock req/res if we want.
  // Better yet, let's just use curl against the running server.
  console.log("Token:", token);
}

testMe();
