import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const isWindows = process.platform === "win32";
const npm = isWindows ? "npm.cmd" : "npm";
const commandShell = process.env.ComSpec ?? "cmd.exe";
const localPython = isWindows
  ? join(root, "ml-service", "venv", "Scripts", "python.exe")
  : join(root, "ml-service", "venv", "bin", "python");

if (!existsSync(localPython)) {
  console.error("ML virtual environment is missing.");
  console.error("Create ml-service/venv and install ml-service/requirements.txt first.");
  process.exit(1);
}

const requiredEnvironmentFiles = [
  join(root, "backend", ".env"),
  join(root, "ml-service", ".env"),
  join(root, "frontend", ".env.local"),
];

for (const environmentFile of requiredEnvironmentFiles) {
  if (!existsSync(environmentFile)) {
    console.warn(`[dev] Warning: missing ${environmentFile}`);
  }
}

const definitions = [
  {
    name: "frontend",
    command: isWindows ? commandShell : npm,
    args: isWindows ? ["/d", "/s", "/c", "npm.cmd run dev -- -p 3000"] : ["run", "dev", "--", "-p", "3000"],
    cwd: join(root, "frontend"),
  },
  {
    name: "backend",
    command: isWindows ? commandShell : npm,
    args: isWindows ? ["/d", "/s", "/c", "npm.cmd run dev"] : ["run", "dev"],
    cwd: join(root, "backend"),
  },
  { name: "ml", command: localPython, args: ["app.py"], cwd: join(root, "ml-service") },
];

const children = [];
let stopping = false;

function stopChild(child) {
  if (!child.pid || child.exitCode !== null) return;

  if (isWindows) {
    spawnSync("taskkill.exe", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    return;
  }

  try {
    process.kill(-child.pid, "SIGTERM");
  } catch {
    // The process may have already stopped.
  }
}

function shutdown(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  console.log("\n[dev] Stopping all services...");
  for (const child of children) stopChild(child);
  process.exit(exitCode);
}

console.log("[dev] Starting frontend http://localhost:3000");
console.log("[dev] Starting backend  http://localhost:5000");
console.log("[dev] Starting ML       http://localhost:8000");
console.log("[dev] Press Ctrl+C to stop everything.\n");

for (const definition of definitions) {
  const child = spawn(definition.command, definition.args, {
    cwd: definition.cwd,
    env: process.env,
    stdio: "inherit",
    detached: !isWindows,
  });

  children.push(child);

  child.on("error", (error) => {
    console.error(`[dev] ${definition.name} failed to start: ${error.message}`);
    shutdown(1);
  });

  child.on("exit", (code, signal) => {
    if (stopping) return;
    const reason = signal ? `signal ${signal}` : `code ${code ?? 1}`;
    console.error(`\n[dev] ${definition.name} stopped with ${reason}.`);
    shutdown(code ?? 1);
  });
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
process.on("uncaughtException", (error) => {
  console.error(`[dev] ${error.message}`);
  shutdown(1);
});
