// Runs before `npm run dev`: installs packages on first run (or after package.json changes) so the site always starts.
const { existsSync, statSync } = require("fs");
const { execSync } = require("child_process");
const { join } = require("path");

const root = join(__dirname, "..");
const marker = join(root, "node_modules", ".package-lock.json");
const stale = !existsSync(marker) || statSync(join(root, "package.json")).mtimeMs > statSync(marker).mtimeMs;

if (stale) {
  console.log("Installing packages (first run)...");
  execSync("npm install --no-audit --no-fund", { cwd: root, stdio: "inherit" });
}
