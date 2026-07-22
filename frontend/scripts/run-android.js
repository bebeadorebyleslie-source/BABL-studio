const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const isWin = process.platform === "win32";

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function listWingetAdbCandidates() {
  const base = path.join(process.env.LOCALAPPDATA || "", "Microsoft", "WinGet", "Packages");
  if (!fileExists(base)) return [];

  let dirs = [];
  try {
    dirs = fs.readdirSync(base, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name.toLowerCase().includes("platformtools"))
      .map((entry) => path.join(base, entry.name, "platform-tools", "adb.exe"));
  } catch {
    return [];
  }

  return dirs;
}

function findAdbPath() {
  const candidates = [];

  if (process.env.ANDROID_HOME) {
    candidates.push(path.join(process.env.ANDROID_HOME, "platform-tools", "adb.exe"));
  }
  if (process.env.ANDROID_SDK_ROOT) {
    candidates.push(path.join(process.env.ANDROID_SDK_ROOT, "platform-tools", "adb.exe"));
  }

  const localAppData = process.env.LOCALAPPDATA || "";
  const userProfile = process.env.USERPROFILE || "";

  candidates.push(path.join(localAppData, "Android", "Sdk", "platform-tools", "adb.exe"));
  candidates.push(path.join(userProfile, "AppData", "Local", "Android", "Sdk", "platform-tools", "adb.exe"));
  candidates.push(...listWingetAdbCandidates());

  for (const adbPath of candidates) {
    if (fileExists(adbPath)) return adbPath;
  }

  return null;
}

function run() {
  const adbPath = isWin ? findAdbPath() : null;

  if (isWin && !adbPath) {
    console.error("Erreur: adb introuvable. Installe Android SDK Platform-Tools puis relance.");
    process.exit(1);
  }

  const env = { ...process.env };
  if (adbPath) {
    const adbDir = path.dirname(adbPath);
    const sdkRoot = path.dirname(adbDir);
    env.PATH = `${adbDir}${path.delimiter}${process.env.PATH || ""}`;
    if (!env.ANDROID_HOME) {
      env.ANDROID_HOME = sdkRoot;
    }
    if (!env.ANDROID_SDK_ROOT) {
      env.ANDROID_SDK_ROOT = sdkRoot;
    }
  }

  const userArgs = process.argv.slice(2);
  const hasPortArg = userArgs.some((arg) => arg === "--port" || arg === "-p" || arg.startsWith("--port="));
  const resolvedArgs = hasPortArg ? userArgs : ["--port", "8083", ...userArgs];

  const expoCli = path.join(process.cwd(), "node_modules", "expo", "bin", "cli");
  const expoCommand = fileExists(expoCli) ? process.execPath : (isWin ? "npx.cmd" : "npx");
  const expoArgs = fileExists(expoCli)
    ? [expoCli, "start", "--android", ...resolvedArgs]
    : ["expo", "start", "--android", ...resolvedArgs];

  const child = spawn(expoCommand, expoArgs, {
    stdio: "inherit",
    env,
    shell: false,
  });

  child.on("exit", (code) => {
    process.exit(code ?? 1);
  });
}

run();
