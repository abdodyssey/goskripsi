const fs = require("fs");
const cp = require("child_process");

function run() {
  let output;
  try {
    output = cp.execSync("npx tsc --noEmit", {
      encoding: "utf8",
      stdio: "pipe",
    });
  } catch (e) {
    output = e.stdout + "\n" + e.stderr;
  }

  const lines = output.split("\n");
  const updates = {};
  let hasChanges = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    let match = line.match(
      /(src\/.*?\.ts)\((\d+),(\d+)\): error TS(2551|2561|2552|2339): .*?Did you mean(?: to write)? '(.*?)'\?/,
    );
    if (match) {
      const file = match[1];
      const lineNum = parseInt(match[2], 10);
      const goodProp = match[5];

      // Extract the bad property name.
      let badPropMatch =
        line.match(
          /(?:Property|name|but) '(.*?)' (?:does not exist|is missing|Cannot find)/,
        ) || line.match(/but '(.*?)' does not exist/);

      if (badPropMatch) {
        const badProp = badPropMatch[1];
        applyFix(updates, file, lineNum, badProp, goodProp);
        hasChanges = true;
      }
    }
  }

  if (!hasChanges) {
    return false;
  }

  for (const file in updates) {
    let fileContent = fs.readFileSync(file, "utf8").split("\n");
    for (const lineNum in updates[file]) {
      fileContent[lineNum - 1] = updates[file][lineNum];
    }
    fs.writeFileSync(file, fileContent.join("\n"));
  }

  return true;
}

function applyFix(updates, file, lineNum, badProp, goodProp) {
  if (!updates[file]) updates[file] = {};
  if (!updates[file][lineNum]) {
    const fileContent = fs.readFileSync(file, "utf8").split("\n");
    updates[file][lineNum] = fileContent[lineNum - 1];
  }

  // Replace the first occurrence of badProp with goodProp on that line
  updates[file][lineNum] = updates[file][lineNum].replace(badProp, goodProp);
  console.log(`Replaced ${badProp} -> ${goodProp} at ${file}:${lineNum}`);
}

let iteration = 0;
while (run() && iteration < 5) {
  iteration++;
  console.log(`Fix iteration ${iteration} completed.`);
}
console.log("Done fixing.");
