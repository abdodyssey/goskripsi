const fs = require("fs");

const snakeToCamel = (str) =>
  str
    .toLowerCase()
    .replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase().replace("-", "").replace("_", ""),
    );

function autoFix() {
  const output = fs.readFileSync("ts_errors.txt", "utf8");
  const lines = output.split("\n");
  const updates = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    let match2551 = line.match(
      /(src\/[a-zA-Z0-9_/-]+?\.ts)\((\d+),(\d+)\): error TS(2551): .*?Property '(.*?)' does not exist on type '.*?'. Did you mean '(.*?)'\?/,
    );
    if (match2551) {
      const file = match2551[1];
      const lineNum = parseInt(match2551[2], 10);
      const badProp = match2551[5]; // noHp
      const goodProp = match2551[6]; // no_hp

      // if we are accessing payload.noHp, change to payload.no_hp
      applyRegexFix(
        updates,
        file,
        lineNum,
        new RegExp(`\\.${badProp}\\b`, "g"),
        `.${goodProp}`,
      );
    }

    // Object literal may only specify known properties, but 'pendaftaran_ujian_id' does not exist in type 'XYZ'. Did you mean to write 'pendaftaranUjianId'?
    let match2561 = line.match(
      /(src\/[a-zA-Z0-9_/-]+?\.ts)\((\d+),(\d+)\): error TS(2561): Object literal may only specify known properties, but '(.*?)' does not exist in type '.*?'. Did you mean to write '(.*?)'\?/,
    );
    if (match2561) {
      const file = match2561[1];
      const lineNum = parseInt(match2561[2], 10);
      const badProp = match2561[4]; // pendaftaran_ujian_id
      const goodProp = match2561[5]; // pendaftaranUjianId

      // This happens on the LEFT side of assignment:  pendaftaran_ujian_id: something,
      applyRegexFix(
        updates,
        file,
        lineNum,
        new RegExp(`\\b${badProp}\\s*:`, "g"),
        `${goodProp}:`,
      );
    }
  }

  for (const file in updates) {
    let fileContent = fs.readFileSync(file, "utf8").split("\n");
    for (const lineNum in updates[file]) {
      fileContent[lineNum - 1] = updates[file][lineNum];
    }
    fs.writeFileSync(file, fileContent.join("\n"));
  }
}

function applyRegexFix(updates, file, lineNum, regex, replacement) {
  if (!updates[file]) updates[file] = {};
  if (!updates[file][lineNum]) {
    const fileContent = fs.readFileSync(file, "utf8").split("\n");
    updates[file][lineNum] = fileContent[lineNum - 1];
  }
  updates[file][lineNum] = updates[file][lineNum].replace(regex, replacement);
}

autoFix();
console.log("Fixes applied.");
