/* The content packs this game plays. Each pack is its own subject track with its own map, lands and forts;
   materials, gold, plans and the hero travel between them. The home page opens a pack with ?subject=<pack id or subject>.
   To add a subject, add its pack here and a card in catalog.js. */
import algebraU3 from "./algebra-u3/pack.js";
import scienceU2 from "./science-u2/pack.js";

export const PACKS = [algebraU3, scienceU2];

/* the pack being played: ?subject=science (or the pack id); the first pack when nothing is asked for */
export function activePack() {
  let want = "";
  try { want = (new URLSearchParams(location.search).get("subject") || "").toLowerCase(); } catch (e) {}
  return PACKS.find(p => p.id === want || (p.subject || "").toLowerCase() === want) || PACKS[0];
}
