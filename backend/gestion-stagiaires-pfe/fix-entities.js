const fs = require("fs");
const path = require("path");

const ENTITIES_DIR = path.join(__dirname, "src"); // change if needed

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  // Regex to match class properties without ! or initializer
  const updated = content.replace(
    /^(\s+)([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_<>\[\]]+);/gm,
    (match, indent, name, type) => {
      // Ignore already fixed or decorators edge cases
      if (match.includes("!")) return match;
      return `${indent}${name}!: ${type};`;
    }
  );

  if (content !== updated) {
    fs.writeFileSync(filePath, updated, "utf8");
    console.log(`✅ Fixed: ${filePath}`);
  }
}

function scanDir(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const fullPath = path.join(dir, file);

    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath);
    } else if (file.endsWith(".entity.ts")) {
      processFile(fullPath);
    }
  });
}

scanDir(ENTITIES_DIR);

console.log("🎉 All entities processed!");