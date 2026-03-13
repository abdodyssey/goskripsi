const fs = require("fs");
const logOutput = fs.readFileSync("ts_errors.txt", "utf8");
const lines = logOutput.split("\n");

const updates = {}; // { filepath: { lineNum: newContent } }

for (const line of lines) {
  // src/services/prodi.service.ts(17,9): error TS2561: Object literal may only specify known properties, but 'fakultas_id' does not exist in type '...'. Did you mean to write 'fakultasId'?
  const match2561 = line.match(
    /(src\/services\/.*?\.ts)\((\d+),(\d+)\): error TS2561: Object literal may only specify known properties, but '(.*?)' does not exist in type '.*?'. Did you mean to write '(.*?)'\?/,
  );

  if (match2561) {
    const [_, file, ln, col, badProp, goodProp] = match2561;
    const lineNum = parseInt(ln, 10);

    if (!updates[file]) updates[file] = {};
    if (!updates[file][lineNum]) {
      const fileContent = fs.readFileSync(file, "utf8").split("\n");
      updates[file][lineNum] = fileContent[lineNum - 1];
    }

    updates[file][lineNum] = updates[file][lineNum].replace(badProp, goodProp);
  }
}

for (const file in updates) {
  let fileContent = fs.readFileSync(file, "utf8").split("\n");
  for (const lineNum in updates[file]) {
    fileContent[lineNum - 1] = updates[file][lineNum];
  }
  fs.writeFileSync(file, fileContent.join("\n"));
}

console.log("Applied TS2561 auto-fixes");
