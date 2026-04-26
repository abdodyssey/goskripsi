const fs = require("fs");
let schema = fs.readFileSync("prisma/schema.prisma", "utf8");

// replace provider
schema = schema.replace(/provider\s*=\s*"mysql"/, 'provider = "postgresql"');

// remove all @db.* and @db.*(..) annotations
schema = schema.replace(/@db\.\w+(\(\d+\))?/g, "");

// remove @db.UnsignedBigInt specifically if the previous regex failed on some spaces
schema = schema.replace(/@db\.UnsignedBigInt/g, "");

// ensure enum types or spaces don't break
fs.writeFileSync("prisma/schema.prisma", schema);
console.log("Schema sanitized for PostgreSQL");
