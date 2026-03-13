const fs = require("fs");
let schema = fs.readFileSync("prisma/schema.prisma", "utf8");

// The regex will look for `, map: "any_string"` or `, map: "any_string"` inside @relation(...)
// since the errors complain about the relation constraint names clashing with the index constraint names.
schema = schema.replace(
  /,\s*map:\s*"[^"]+"/g,
  function (match, offset, string) {
    if (
      string.lastIndexOf("@relation", offset) >
      string.lastIndexOf("@@index", offset)
    ) {
      return ""; // remove it from @relation
    }
    // Also remove from @@index too just to be 100% safe with postgres uniqueness,
    // let prisma auto-generate all index names and constraint names!
    return "";
  },
);

// Remove map entirely from @unique, @relation, @@index because Prisma auto-generates excellent names for PostgreSQL
schema = schema.replace(/@unique\(map:\s*"[^"]+"\)/g, "@unique");
schema = schema.replace(
  /@@index\(\[([^\]]+)\]\s*,\s*map:\s*"[^"]+"\)/g,
  "@@index([$1])",
);
schema = schema.replace(
  /@relation\(([^,]+),\s*map:\s*"[^"]+"\)/g,
  "@relation($1)",
);
schema = schema.replace(/,\s*map:\s*"[^"]+"/g, "");

fs.writeFileSync("prisma/schema.prisma", schema);
console.log("Sanitized relation/index map names for PostgreSQL");
