const fs = require("fs");
const glob = require("glob");

const replacements = [{ pattern: /bigint/g, replace: "number" }];

function processFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = require("path").join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processFiles(fullPath);
    } else if (fullPath.endsWith(".ts")) {
      let content = fs.readFileSync(fullPath, "utf8");
      replacements.forEach(({ pattern, replace }) => {
        content = content.replace(pattern, replace);
      });
      fs.writeFileSync(fullPath, content);
    }
  }
}

processFiles(__dirname + "/src/services");
processFiles(__dirname + "/src/api/controllers");
console.log("Applied bigint type fixes");
