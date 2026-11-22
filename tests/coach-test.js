// The writing coach function (api/coach.js) with a stand-in Supabase and a stand-in Claude client: no network, no key spent.
// Checks: POST only, unknown task kinds refused, no key -> 503, unpaired device -> 403, a paired device gets the
// rubric's lines in order (whatever the model returns), fix is cleared when all lines are met, the prompt carries the
// rubric, the fact card and his writing (but no pass), and a 400 on the fallback request retries without it.
const path = require("path"), assert = require("assert");
const sdkPath = require.resolve("@anthropic-ai/sdk", { paths: [path.resolve(__dirname, "..")] });
let calls = [], reply = null, rejectFallback = false;
class FakeAnthropic { constructor() { const self = this;
  const create = async (p) => { calls.push(p); if (rejectFallback && p.fallbacks) { const e = new Error("bad"); e.status = 400; throw e; } return { stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify(reply) }] }; };
  self.beta = { messages: { create } }; self.messages = { create }; } }
require.cache[sdkPath] = { id: sdkPath, filename: sdkPath, loaded: true, exports: { Anthropic: FakeAnthropic, default: FakeAnthropic } };
global.fetch = async (url, o) => { const b = JSON.parse(o.body); const ok = b.p_dev === "good" || b.p_key === "goodkey"; return { ok: true, json: async () => ({ ok }) }; };
const coach = require("../api/coach.js");
const run = async (method, body) => { let status = 0, out = null; const res = { setHeader() {}, status(s) { status = s; return this; }, json(j) { out = j; return this; } }; await coach({ method, body }, res); return { status, out }; };
const task = { kind: "peel", question: "Explain why mitochondria are important.", facts: ["They release energy from food in a process called respiration."], model: "model text", parts: { point: "Mitochondria release energy.", evidence: "Respiration.", explain: "This shows cells need it.", link: "Therefore they matter." } };
(async () => {
  delete process.env.ANTHROPIC_API_KEY;
  assert.equal((await run("GET", {})).status, 405); console.log("1 GET refused");
  assert.equal((await run("POST", { task: { kind: "nope" } })).status, 400); console.log("2 unknown kind refused");
  assert.equal((await run("POST", { pass: { dev: "good" }, task })).status, 503); console.log("3 no key -> 503");
  process.env.ANTHROPIC_API_KEY = "test";
  assert.equal((await run("POST", { pass: { dev: "bad" }, task })).status, 403); console.log("4 unpaired device -> 403");
  reply = { lines: [{ name: "Link", met: true, note: "" }, { name: "Point", met: true, note: "" }, { name: "evidence", met: false, note: "add a fact" }, { name: "Explain", met: true, note: "" }, { name: "Facts", met: true, note: "" }], praise: "Nice.", fix: "Add a number?" };
  let r = await run("POST", { pass: { dev: "good" }, task });
  assert.equal(r.status, 200); assert.deepEqual(r.out.lines.map(l => l.name), ["Point", "Evidence", "Explain", "Link", "Facts"]); assert.equal(r.out.lines[1].met, false); assert.equal(r.out.fix, "Add a number?");
  console.log("5 lines in rubric order:", r.out.lines.map(l => l.name + (l.met ? "✓" : "✗")).join(" "));
  const p = calls[calls.length - 1], prompt = p.messages[0].content;
  assert.equal(p.model, "claude-opus-5-5"); assert.ok(p.output_config.format.type === "json_schema"); assert.ok(/Rubric/.test(prompt) && /respiration/.test(prompt) && /<writing>/.test(prompt) && !/good/.test(prompt));
  console.log("6 prompt has rubric, fact card and writing, and no pass; model", p.model, "| fallbacks", p.fallbacks);
  reply = { lines: ["Point", "Evidence", "Explain", "Link", "Facts"].map(name => ({ name, met: true, note: "" })), praise: "All there.", fix: "should be dropped" };
  r = await run("POST", { pass: { key: "goodkey" }, task }); assert.equal(r.out.fix, ""); console.log("7 all met: fix cleared (family key works too)");
  rejectFallback = true; calls = []; r = await run("POST", { pass: { dev: "good" }, task }); assert.equal(r.status, 200); assert.equal(calls.length, 2); assert.ok(!calls[1].fallbacks); console.log("8 fallback refused -> plain retry");
  console.log("ALL PASSED");
})().catch(e => { console.error("FAILED", e); process.exit(1); });
