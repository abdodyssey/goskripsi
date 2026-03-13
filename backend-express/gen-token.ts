import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const token = jwt.sign(
  { id: "33", username: "2130803095", roles: ["mahasiswa"] },
  JWT_SECRET,
  { expiresIn: "1d" },
);
console.log(token);
