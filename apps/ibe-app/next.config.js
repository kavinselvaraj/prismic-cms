const fs = require("node:fs");
const path = require("node:path");

const initialEnvKeys = new Set(Object.keys(process.env));

for (const envFilePath of [
  path.resolve(__dirname, "../../.env"),
  path.resolve(__dirname, "../../.env.local"),
  path.resolve(__dirname, ".env"),
  path.resolve(__dirname, ".env.local"),
]) {
  loadEnvFile(envFilePath);
}

/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = nextConfig;

function loadEnvFile(envFilePath) {
  if (!fs.existsSync(envFilePath)) {
    return;
  }

  const file = fs.readFileSync(envFilePath, "utf8");

  for (const line of file.split(/\r?\n/)) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine.slice(separatorIndex + 1).trim();

    if (!key || initialEnvKeys.has(key)) {
      continue;
    }

    process.env[key] = value.replace(/^["']|["']$/g, "");
  }
}
