/**
 * animate-cartoon.mjs
 * Uses Kling AI API to animate a cartoon frame (image → video).
 * Outputs a 5-second animated video clip ready for FFmpeg assembly.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createHmac } from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const KLING_ACCESS_KEY = process.env.KLING_ACCESS_KEY;
const KLING_SECRET_KEY = process.env.KLING_SECRET_KEY;
const KLING_API = "https://api.klingai.com";

const OUTPUT_DIR = path.join(ROOT, "public", "generated", "cartoons");

// JWT generation for Kling AI authentication
function generateKlingToken() {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({
      iss: KLING_ACCESS_KEY,
      exp: now + 1800,
      nbf: now - 5,
    })
  ).toString("base64url");

  const signature = createHmac("sha256", KLING_SECRET_KEY)
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${signature}`;
}

async function klingRequest(endpoint, body) {
  const token = generateKlingToken();
  const res = await fetch(`${KLING_API}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Kling API error ${res.status}: ${err}`);
  }

  return res.json();
}

async function pollKlingTask(taskId, maxWaitMs = 300000) {
  const token = generateKlingToken();
  const start = Date.now();

  while (Date.now() - start < maxWaitMs) {
    await new Promise((r) => setTimeout(r, 8000));

    const res = await fetch(
      `${KLING_API}/v1/videos/image2video/${taskId}`,
      { headers: { Authorization: `Bearer ${generateKlingToken()}` } }
    );

    const data = await res.json();
    const task = data.data;

    if (task?.task_status === "succeed") {
      return task.task_result?.videos?.[0]?.url;
    }

    if (task?.task_status === "failed") {
      throw new Error(`Kling task failed: ${task.task_status_msg}`);
    }

    const elapsed = Math.round((Date.now() - start) / 1000);
    console.log(`  ⏳ Animation en cours... (${elapsed}s)`);
  }

  throw new Error("Kling animation timeout");
}

async function downloadVideo(url, outputPath) {
  const res = await fetch(url);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buffer);
}

/**
 * Animate a cartoon frame using Kling AI image-to-video.
 *
 * @param {string} imagePath - Local path to the PNG frame
 * @param {string} slug - Article slug (for output naming)
 * @returns {string} localVideoPath - Path to the animated video
 */
export async function animateCartoonFrame(imagePath, slug) {
  const outputPath = path.join(OUTPUT_DIR, `${slug}_animated.mp4`);

  if (fs.existsSync(outputPath)) {
    console.log(`  ✓ Animation déjà générée: ${outputPath}`);
    return outputPath;
  }

  // Convert local image to base64 for Kling API
  const imageBuffer = fs.readFileSync(imagePath);
  const imageBase64 = imageBuffer.toString("base64");
  const mimeType = "image/png";

  // Motion prompt tailored for sports cartoon style
  const motionPrompt =
    "subtle character animations, slight body movements, blinking eyes, " +
    "smooth floating motion, dynamic energy, cartoon style motion, " +
    "professional motion design feel";

  console.log(`  🎬 Animation Kling AI pour: ${slug}`);

  const taskData = await klingRequest("/v1/videos/image2video", {
    model_name: "kling-v1",
    image: `data:${mimeType};base64,${imageBase64}`,
    prompt: motionPrompt,
    negative_prompt: "shaking, distortion, morphing faces, text changes",
    cfg_scale: 0.5,
    mode: "std",
    duration: "5",
  });

  const taskId = taskData.data?.task_id;
  if (!taskId) throw new Error("No task ID returned from Kling");

  console.log(`  Task ID: ${taskId}`);

  const videoUrl = await pollKlingTask(taskId);
  if (!videoUrl) throw new Error("No video URL in Kling response");

  await downloadVideo(videoUrl, outputPath);

  console.log(`  ✅ Animation générée: ${outputPath}`);
  return outputPath;
}

// CLI: node animate-cartoon.mjs public/generated/cartoons/slug.png slug
if (process.argv[2] && process.argv[3]) {
  animateCartoonFrame(process.argv[2], process.argv[3])
    .then(console.log)
    .catch(console.error);
}
