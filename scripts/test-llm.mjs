/**
 * test-llm.mjs — Vérifie rapidement que les clés LLM fonctionnent.
 * Usage : node scripts/test-llm.mjs
 * CI    : node scripts/test-llm.mjs  (dans workflow_dispatch pour diagnostic)
 */
import fs from "fs";

const GOOGLE_API_KEY    = process.env.GOOGLE_API_KEY    || "";
const GOOGLE_API_KEY_2  = process.env.GOOGLE_API_KEY_2  || "";
const GROQ_API_KEY      = process.env.GROQ_API_KEY      || "";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

const TEST_PROMPT = `Réponds avec ce JSON exactement, sans rien d'autre :
{"ok":true,"msg":"Gemini fonctionne !","words":42}`;

async function testGemini() {
  if (!GOOGLE_API_KEY) { console.log("GOOGLE_API_KEY : ❌ absent"); return false; }
  console.log(`GOOGLE_API_KEY : ${GOOGLE_API_KEY.slice(0,8)}... (${GOOGLE_API_KEY.length} chars)`);
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: TEST_PROMPT }] }],
        generationConfig: { maxOutputTokens: 200, temperature: 0 }
      })
    });
    const text = await res.text();
    if (res.ok) {
      const data = JSON.parse(text);
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "(vide)";
      console.log(`Gemini 2.0 Flash : ✅ OK — réponse: ${reply.slice(0, 120)}`);
      return true;
    } else {
      console.log(`Gemini 2.0 Flash : ❌ HTTP ${res.status} — ${text.slice(0, 200)}`);
      return false;
    }
  } catch (e) {
    console.log(`Gemini 2.0 Flash : ❌ Exception — ${e.message}`);
    return false;
  }
}

async function testGroq() {
  if (!GROQ_API_KEY) { console.log("GROQ_API_KEY    : ❌ absent"); return false; }
  console.log(`GROQ_API_KEY    : ${GROQ_API_KEY.slice(0,8)}... (${GROQ_API_KEY.length} chars)`);
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0,
        max_tokens: 200,
        messages: [{ role: "user", content: TEST_PROMPT }]
      })
    });
    const data = await res.json();
    if (res.ok) {
      const reply = data?.choices?.[0]?.message?.content || "(vide)";
      console.log(`Groq Llama 3.3  : ✅ OK — réponse: ${reply.slice(0, 120)}`);
      return true;
    } else {
      console.log(`Groq Llama 3.3  : ❌ HTTP ${res.status} — ${JSON.stringify(data).slice(0, 200)}`);
      return false;
    }
  } catch (e) {
    console.log(`Groq Llama 3.3  : ❌ Exception — ${e.message}`);
    return false;
  }
}

async function testAnthropic() {
  if (!ANTHROPIC_API_KEY) { console.log("ANTHROPIC_KEY   : ❌ absent"); return false; }
  console.log(`ANTHROPIC_KEY   : ${ANTHROPIC_API_KEY.slice(0,8)}... (${ANTHROPIC_API_KEY.length} chars)`);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5",
        max_tokens: 200,
        messages: [{ role: "user", content: TEST_PROMPT }]
      })
    });
    const data = await res.json();
    if (res.ok) {
      const reply = data?.content?.[0]?.text || "(vide)";
      console.log(`Anthropic Claude: ✅ OK — réponse: ${reply.slice(0, 120)}`);
      return true;
    } else {
      console.log(`Anthropic Claude: ❌ HTTP ${res.status} — ${JSON.stringify(data?.error || data).slice(0, 200)}`);
      return false;
    }
  } catch (e) {
    console.log(`Anthropic Claude: ❌ Exception — ${e.message}`);
    return false;
  }
}

async function testGemini2() {
  if (!GOOGLE_API_KEY_2) { console.log("GOOGLE_API_KEY_2: ❌ absent (optionnel)"); return false; }
  console.log(`GOOGLE_API_KEY_2: ${GOOGLE_API_KEY_2.slice(0,8)}... (${GOOGLE_API_KEY_2.length} chars)`);
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY_2}`;
    const res = await fetch(url, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: TEST_PROMPT }] }], generationConfig: { maxOutputTokens: 200, temperature: 0 } })
    });
    const text = await res.text();
    if (res.ok) {
      const data = JSON.parse(text);
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "(vide)";
      console.log(`Gemini KEY_2       : ✅ OK — réponse: ${reply.slice(0, 80)}`);
      return true;
    }
    console.log(`Gemini KEY_2       : ❌ HTTP ${res.status} — ${text.slice(0, 120)}`);
    return false;
  } catch (e) { console.log(`Gemini KEY_2       : ❌ ${e.message}`); return false; }
}

console.log("=== Test LLM APIs — nabdriyadah ===\n");
const [g, g2, gr, a] = await Promise.all([testGemini(), testGemini2(), testGroq(), testAnthropic()]);
console.log(`\nRésumé : Gemini1=${g?"✅":"❌"} | Gemini2=${g2?"✅":"❌"} | Groq=${gr?"✅":"❌"} | Anthropic=${a?"✅":"❌"}`);
if (!g && !g2 && !gr && !a) {
  console.log("⛔ AUCUNE API LLM disponible — tous les articles seront en fallback !");
  process.exit(1);
}
process.exit(0);
