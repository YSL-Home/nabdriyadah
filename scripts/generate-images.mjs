/**
 * generate-images.mjs — CI image generation script
 * Delegates entirely to generate-article-images.mjs (the richer version).
 * This file exists only because the CI workflow calls it by name.
 */
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const target = path.join(__dirname, "generate-article-images.mjs");

console.log("generate-images.mjs → delegating to generate-article-images.mjs");
execSync(`node "${target}"`, { stdio: "inherit" });
