/* Fort Defence save layer.
   - Cloud mode: the family cloud save (shared/family.js), game id "fort-defence". Saves locally first,
     then online within ~1s, retrying when offline. The newer copy always wins.
   - Practice mode: no family connection (preview pages, ?practice). Saves only in this browser,
     under a separate key, so it can never touch a real player's progress.
   - First run in cloud mode copies Oliver's Algebra Quest progress once (read only). */

export const GAME = "fort-defence";
const OLD_GAME = "algebra-quest";

export const blank = () => ({
  v: 1, updated: 0, backupAt: 0, seededFrom: null, startedAt: 0,
  // learning progress (same meaning as Algebra Quest, so the mastery rules carry over unchanged)
  hist: {}, learned: {}, learnDone: {}, checks: {}, lv: {}, bosses: {}, repair: {}, exams: [],
  chests: {}, classNow: {}, unlockAll: false, badges: {}, days: [], last: {},
  // fort game
  gold: 0, hero: "knight", owned: ["knight"],
  mats: { wood: 0, stone: 0, iron: 0, crystal: 0 },
  blueprints: {},            // piece type -> count available to place
  forts: {},                 // region number -> { pieces: [{t,x,z,r,hp}] }
  weak: {},                  // topic id -> wall cracks waiting for repair
  uq: {},                    // understanding questions: topic key -> { seen:[indices], right }
  kit: 0, bonusLand: 0,
  region: 1, day: 1,
  sound: true, music: true,
});

const FAM = () => (typeof window !== "undefined" && window.Family) || null;

function practiceWanted() {
  const q = new URLSearchParams(location.search);
  return q.has("practice") || !FAM() || !FAM().ready;
}

export function createSave({ onExternalChange, onStatus } = {}) {
  const practice = practiceWanted();
  const player = practice ? "practice" : FAM().player;
  const LS = `fortdefence.v1.${player}`;
  let S = loadLocal();
  let timer = null, inflight = false, err = null, retry = 2000;

  function loadLocal() {
    try { const r = localStorage.getItem(LS); if (r) return Object.assign(blank(), JSON.parse(r)); } catch (e) {}
    return blank();
  }
  function persistLocal() { try { localStorage.setItem(LS, JSON.stringify(S)); } catch (e) {} }
  const dirty = () => (S.updated || 0) > (S.backupAt || 0);
  const status = () => {
    if (practice) return { ok: true, mode: "practice", text: "Practice save (this device only)" };
    if (err) return { ok: false, mode: "cloud", text: "Not saved yet. It will keep trying." };
    return { ok: true, mode: "cloud", text: dirty() ? "Saving…" : "Saved" };
  };
  const tell = () => onStatus && onStatus(status());

  async function writeNow() {
    if (practice || !dirty()) { tell(); return; }
    if (inflight) { clearTimeout(timer); timer = setTimeout(writeNow, 400); return; }
    inflight = true; clearTimeout(timer); timer = null;
    const u = S.updated || Date.now();
    try {
      const r = await FAM().save(GAME, S, u);
      if (r && r.ok) { if ((S.backupAt || 0) < u) S.backupAt = u; persistLocal(); err = null; retry = 2000; }
      else if (r && r.error === "newer" && r.state) { adopt(r.state); err = null; onExternalChange && onExternalChange("newer"); }
      else err = (r && r.error) || "failed";
    } catch (e) { err = "offline"; }
    inflight = false;
    if (err === "offline" || err === "failed") { clearTimeout(timer); timer = setTimeout(writeNow, retry); retry = Math.min(retry * 2, 60000); }
    tell();
  }
  function adopt(st) { S = Object.assign(blank(), st); S.backupAt = S.updated || 0; persistLocal(); }

  /* copy learning progress from Algebra Quest once; never writes to the old game */
  function seedFrom(old) {
    const keep = ["hist", "learned", "learnDone", "checks", "lv", "bosses", "repair", "exams", "chests", "classNow", "unlockAll", "badges", "days", "last", "sound"];
    keep.forEach(k => { if (old[k] !== undefined) S[k] = JSON.parse(JSON.stringify(old[k])); });
    S.gold = Math.max(0, Math.round(old.coins || 0));
    S.seededFrom = OLD_GAME;
  }

  async function boot() {
    if (practice) { if (!S.startedAt) { S.startedAt = Date.now(); commit(); } tell(); return { mode: "practice" }; }
    try {
      const r = await FAM().load(GAME);
      if (r && r.ok && r.state && (r.updated || 0) >= (S.updated || 0)) adopt(r.state);
      else if (r && r.ok && !r.state && !S.updated) {
        // brand new: bring Algebra Quest progress across (read only)
        const old = await FAM().load(OLD_GAME).catch(() => null);
        if (old && old.ok && old.state && old.state.v === 2) seedFrom(old.state);
        S.startedAt = Date.now(); commit();
      } else if (r && r.error) err = r.error;
      else if (dirty()) writeNow();
    } catch (e) { err = "offline"; }
    tell();
    return { mode: "cloud" };
  }

  function commit() { S.updated = Date.now(); persistLocal(); clearTimeout(timer); timer = setTimeout(writeNow, practice ? 0 : 600); tell(); }

  addEventListener("pagehide", () => { if (!practice && dirty()) { try { FAM().save(GAME, S, S.updated, true); } catch (e) {} } });
  addEventListener("online", () => { if (dirty()) writeNow(); });

  return {
    get state() { return S; },
    get practice() { return practice; },
    boot, commit, status, saveNow: writeNow,
    resetPractice() { if (!practice) return; S = blank(); S.startedAt = Date.now(); commit(); },
  };
}
