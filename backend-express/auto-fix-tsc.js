const fs = require("fs");

const logOutput = fs.readFileSync("ts_errors.txt", "utf8");
const lines = logOutput.split("\n");

const updates = {}; // { filepath: { lineNum: newContent } }

for (const line of lines) {
  // src/services/auth.service.ts(144,25): error TS2551: Property 'noHp' does not exist on type '{ ... }'. Did you mean 'no_hp'?
  const match = line.match(
    /(src\/services\/.*?\.ts)\((\d+),(\d+)\): error TS2551: Property '(.*?)' does not exist on type '.*?'. Did you mean '(.*?)'\?/,
  );
  if (match) {
    const [_, file, ln, col, badProp, goodProp] = match;
    const lineNum = parseInt(ln, 10);

    if (!updates[file]) updates[file] = {};
    if (!updates[file][lineNum]) {
      // Read file if not in cache
      const fileContent = fs.readFileSync(file, "utf8").split("\n");
      updates[file][lineNum] = fileContent[lineNum - 1];
    }

    // Replace the badProp with goodProp in the line
    // We can do a string replace since it should match exactly
    // but better to be safe, find badProp on that line
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

console.log("Applied TS2551 auto-fixes");
