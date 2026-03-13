const fs = require("fs");
const cp = require("child_process");

function run() {
  let hasChanges = false;
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

  for (const line of lines) {
    const match2551 = line.match(
      /(src\/[a-zA-Z0-9_/-]+?\.ts)\((\d+),(\d+)\): error TS2551: Property '(.*?)' does not exist on type '.*?'. Did you mean '(.*?)'\?/,
    );
    if (match2551) {
      const [_, file, ln, col, badProp, goodProp] = match2551;
      applyFix(updates, file, parseInt(ln, 10), badProp, goodProp);
      hasChanges = true;
    }

    const match2561 = line.match(
      /(src\/[a-zA-Z0-9_/-]+?\.ts)\((\d+),(\d+)\): error TS2561: Object literal may only specify known properties, but '(.*?)' does not exist in type '.*?'. Did you mean to write '(.*?)'\?/,
    );
    if (match2561) {
      const [_, file, ln, col, badProp, goodProp] = match2561;
      applyFix(updates, file, parseInt(ln, 10), badProp, goodProp);
      hasChanges = true;
    }

    const match2552 = line.match(
      /(src\/[a-zA-Z0-9_/-]+?\.ts)\((\d+),(\d+)\): error TS2552: Cannot find name '(.*?)'. Did you mean '(.*?)'\?/,
    );
    if (match2552) {
      const [_, file, ln, col, badProp, goodProp] = match2552;
      applyFix(updates, file, parseInt(ln, 10), badProp, goodProp);
      hasChanges = true;
    }
  }

  if (!hasChanges) {
    fs.writeFileSync("ts_errors.txt", output);
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

  // Replace all occurrences of badProp with goodProp on that line
  updates[file][lineNum] = updates[file][lineNum].split(badProp).join(goodProp);
}

let iteration = 0;
while (run() && iteration < 10) {
  iteration++;
  console.log(`Fix iteration ${iteration} completed.`);
}
console.log(`Done after ${iteration} iterations.`);
