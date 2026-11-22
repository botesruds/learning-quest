/* Science Unit 2 thinking tasks, from the content document "Thinking tasks: science content to check" (22 Nov 2026,
   Rudi: "go" and "nice. add it", defaults kept). Read by js/think.js.
   - GAPS[day]: fill the gap. text uses ___ for each gap; ans in order; bank = the word bank (answers + distractors).
   - SPW[day]: Sentence, Phrase, Word on that day's Library dispatch. best = accepted sentence indexes (first = the expert pick),
     phrase and word = the expert picks, why = one line shown with the expert pick.
   - EXPLAIN[day]: an "Explain it" Brain check rune. must = the key ideas; each idea is a list of words or phrases, any one
     of which counts, plus a hint shown when that idea is missing. model = the model answer shown afterwards.
   - MAPS[region number]: the Map Room's mind-map for that land. */

export const GAPS = {
  1: [{ text: "The ___ of a thing fits the ___ it does.", ans: ["shape", "job"], bank: ["shape", "job", "colour", "size"] },
      { text: "A red blood cell has no ___, so it has more room to carry ___.", ans: ["nucleus", "oxygen"], bank: ["nucleus", "oxygen", "membrane", "water"] }],
  2: [{ text: "The ___ controls the cell and holds the instructions, called DNA.", ans: ["nucleus"], bank: ["nucleus", "membrane", "cytoplasm"] },
      { text: "Mitochondria release ___ from glucose. This is called ___.", ans: ["energy", "respiration"], bank: ["energy", "respiration", "oxygen", "photosynthesis"] }],
  3: [{ text: "Only plant cells have a cell ___, chloroplasts and a large permanent ___.", ans: ["wall", "vacuole"], bank: ["wall", "vacuole", "nucleus", "membrane"] },
      { text: "Root hair cells have no ___, because there is no ___ underground.", ans: ["chloroplasts", "light"], bank: ["chloroplasts", "light", "mitochondria", "water"] }],
  4: [{ text: "Total magnification = ___ lens × ___ lens.", ans: ["eyepiece", "objective"], bank: ["eyepiece", "objective", "stage", "lamp"] },
      { text: "Always start with the ___ power objective. On high power, use only the ___ focus.", ans: ["lowest", "fine"], bank: ["lowest", "fine", "highest", "coarse"] }],
  5: [{ text: "In diffusion, particles spread from a ___ concentration to a ___ concentration.", ans: ["high", "low"], bank: ["high", "low", "even", "cold"] },
      { text: "In the lungs, ___ diffuses into the blood and ___ diffuses out of it.", ans: ["oxygen", "carbon dioxide"], bank: ["oxygen", "carbon dioxide", "glucose", "water"] }],
  6: [{ text: "A tissue is a group of ___ cells. An organ is a group of ___ tissues.", ans: ["similar", "different"], bank: ["similar", "different", "dead", "tiny"] },
      { text: "cell → tissue → ___ → organ system → ___", ans: ["organ", "organism"], bank: ["organ", "organism", "atom", "skeleton"] }],
  7: [{ text: "The skeleton's four jobs are support, ___, movement and making ___ cells.", ans: ["protection", "blood"], bank: ["protection", "blood", "digestion", "nerve"] },
      { text: "Bones meet at ___. They are held together by ___.", ans: ["joints", "ligaments"], bank: ["joints", "ligaments", "tendons", "muscles"] }],
  8: [{ text: "The ___ protects the brain. The ___ protects the heart and lungs.", ans: ["skull", "ribcage"], bank: ["skull", "ribcage", "pelvis", "femur"] },
      { text: "The spinal cord runs through a tunnel inside the ___ of the backbone.", ans: ["vertebrae"], bank: ["vertebrae", "ribs", "ligaments"] }],
  9: [{ text: "Red bone marrow makes new ___ cells. It is inside the ___ bone.", ans: ["blood", "spongy"], bank: ["blood", "spongy", "nerve", "compact"] },
      { text: "___ blood cells carry oxygen. ___ blood cells fight infection.", ans: ["Red", "White"], bank: ["Red", "White", "Yellow", "Blue"] }],
  10: [{ text: "When a muscle ___, it gets shorter and fatter and pulls.", ans: ["contracts"], bank: ["contracts", "relaxes", "pushes"] },
       { text: "___ join muscle to bone. ___ join bone to bone.", ans: ["Tendons", "Ligaments"], bank: ["Tendons", "Ligaments", "Joints", "Nerves"] }],
  11: [{ text: "To bend the elbow, the ___ contracts and the ___ relaxes.", ans: ["biceps", "triceps"], bank: ["biceps", "triceps", "hamstrings", "tendon"] },
       { text: "Two muscles that pull in opposite directions are called an ___ pair.", ans: ["antagonistic"], bank: ["antagonistic", "identical", "hinge"] }],
  12: [{ text: "___ builds strong bones. Vitamin D helps the body use it.", ans: ["Calcium"], bank: ["Calcium", "Protein", "Sugar"] },
       { text: "A sprain is a stretched or torn ___. A strain is an overstretched or torn ___ or tendon.", ans: ["ligament", "muscle"], bank: ["ligament", "muscle", "bone", "joint"] }],
  13: [{ text: "The independent variable is the thing I ___. The dependent variable is the thing I ___.", ans: ["change", "measure"], bank: ["change", "measure", "keep", "guess"] },
       { text: "Count the beats for 15 seconds, then multiply by ___ to get beats per minute.", ans: ["4"], bank: ["4", "15", "60"] }],
};

/* sentence indexes are 0-based into the dispatch's text array (packs/science-u2/reading.js) */
export const SPW = {
  1: { best: [7, 1], phrase: "form fits function", word: "function", why: "The last sentence sums up every example in the text." },
  2: { best: [0, 2], phrase: "a tiny city", word: "city", why: "Every other sentence is one building in that city.", none: true },
  3: { best: [2, 0], phrase: "a large permanent vacuole", word: "chloroplasts", why: "The difference between the cells is the point of the text." },
  4: { best: [0, 3], phrase: "make tiny things look bigger", word: "lenses", why: "The first sentence says what the whole tool is for." },
  5: { best: [2, 1], phrase: "from a high concentration to a low concentration", word: "diffusion", why: "It is the definition the rest of the text gives examples of." },
  6: { best: [0, 5], phrase: "organised in levels", word: "levels", why: "The first sentence names the idea, and each later sentence is one level." },
  7: { best: [2], phrase: "four jobs", word: "skeleton", why: "The four sentences after it each give one job, so this one holds them together." },
  8: { best: [0], phrase: "so bones guard them", word: "guard", why: "It gives the reason for every bone named after it." },
  9: { best: [3, 4], phrase: "a blood factory", word: "marrow", why: "The rest of the text is what the factory makes and where it sits." },
  10: { best: [0, 1], phrase: "they can only pull", word: "pull", why: "The title and every later sentence come back to pulling." },
  11: { best: [0, 1], phrase: "pull in opposite directions", word: "pairs", why: "It gives both the idea and the reason for it." },
  12: { best: [0, 1], phrase: "changes your bones and muscles", word: "changes", why: "Exercise, diet, smoking and injury are all examples of how you live.", none: true },
  13: { best: [4, 6], phrase: "so the test is fair", word: "variables", why: "The title is \"A fair test\" and this sentence says how to make one." },
};

const I = (w, hint) => ({ w, hint });
export const EXPLAIN = {
  1: { q: "Explain why a nerve cell is long and thin.", starter: "A nerve cell is long and thin because", model: "A nerve cell is long and thin because it carries messages a long way around the body, like a wire.",
       must: [I(["message", "signal", "information"], "What does a nerve cell carry?"), I(["long way", "far", "distance", "long", "whole body", "toes", "brain"], "How far does it carry them?")] },
  2: { q: "Explain what the cell membrane does.", starter: "The cell membrane", model: "The cell membrane controls what goes in and out of the cell, like guards at a city gate.",
       must: [I(["control", "decide", "let", "allow", "guard", "choose"], "What does it do to things at the edge of the cell?"), I(["in and out", "in or out", "enter", "leave", "goes in", "out of", "into"], "Which way do things move through it?")] },
  3: { q: "Explain why a root hair cell has no chloroplasts.", starter: "A root hair cell has no chloroplasts because", model: "A root hair cell has no chloroplasts because it lives underground where there is no light, and chloroplasts need light to make food.",
       must: [I(["underground", "no light", "dark", "soil", "under the ground", "in the ground"], "Where does a root hair cell live?"), I(["light", "photosynthesis", "photosynthesise", "make food", "sun"], "What do chloroplasts need to work?")] },
  4: { q: "Explain why you start on the lowest power.", starter: "You start on low power because", model: "You start on low power because it shows a bigger area, so it is easier to find the cells.",
       must: [I(["bigger area", "more area", "wider", "more of the slide", "bigger view", "see more", "larger area", "big area"], "How much of the slide can you see on low power?"), I(["find", "easier", "locate", "spot"], "What does that help you do?")] },
  5: { q: "Explain why oxygen moves from the air sacs into the blood.", starter: "Oxygen moves into the blood because", model: "Oxygen moves into the blood because there is lots of oxygen in the air sacs and less in the blood, so it diffuses from high to low concentration.",
       must: [I(["lots", "more", "high", "lot of", "crowded", "many"], "Where is there lots of oxygen?"), I(["less", "low", "fewer", "little", "not much"], "Where is there less?")] },
  6: { q: "Explain why damaged heart muscle cells can make a person feel ill.", starter: "If heart muscle cells are damaged,", model: "If heart muscle cells are damaged, the heart tissue is weaker, so the heart pumps less well, so the circulatory system suffers and the person feels ill.",
       must: [I(["pump", "weak", "tissue", "heart doesn't", "heart does not", "heart can't", "heart cannot", "beat"], "What happens to the heart?"), I(["system", "blood", "body", "whole", "circulat", "organism", "rest"], "And then what happens to the level above it?")] },
  7: { q: "Explain how the skeleton helps us move.", starter: "The skeleton helps us move because", model: "The skeleton helps us move because muscles pull on the bones, and the bones move at the joints.",
       must: [I(["muscle"], "What pulls on the bones?"), I(["joint", "hinge", "ball and socket", "bend"], "Where do the bones move?")] },
  8: { q: "Explain why the ribcage needs to be able to move.", starter: "The ribcage needs to move so that", model: "The ribcage needs to move so that the lungs can fill with air when you breathe in.",
       must: [I(["lung"], "Which organ is inside the ribcage and needs room?"), I(["air", "breath", "breathe", "fill", "expand", "inflate"], "What do the lungs need to do?")] },
  9: { q: "Explain why bone marrow makes millions of red blood cells every second.", starter: "Bone marrow makes so many because", model: "Bone marrow makes so many because a red blood cell only lives about 120 days, so old ones must be replaced all the time.",
       must: [I(["120", "die", "wear out", "worn out", "only live", "don't live", "do not live", "old"], "How long does a red blood cell live?"), I(["replace", "new", "instead", "keep making", "more"], "So what has to happen?")] },
  10: { q: "Explain why a tendon must not stretch.", starter: "A tendon must not stretch because", model: "A tendon must not stretch because when the muscle contracts, the pull has to reach the bone to move it.",
       must: [I(["pull", "contract", "muscle"], "What does the muscle do?"), I(["bone"], "Where does the pull need to go?")] },
  11: { q: "Explain why muscles have to work in pairs.", starter: "Muscles work in pairs because", model: "Muscles work in pairs because a muscle can only pull, so another muscle has to pull the other way to move the bone back.",
       must: [I(["only pull", "can't push", "cannot push", "can not push", "never push", "not push", "only contract"], "What can a muscle never do?"), I(["other way", "opposite", "back", "other muscle", "another muscle", "straighten", "pull it back"], "So what does the second muscle do?")] },
  12: { q: "Explain how running and jumping affect your bones.", starter: "Running and jumping", model: "Running and jumping are weight-bearing exercise, so they make bones denser and stronger.",
       must: [I(["weight", "carry", "your own body", "load"], "What kind of exercise are they?"), I(["dens", "strong", "thick", "hard"], "What happens to the bones?")] },
  13: { q: "Explain why you repeat each test three times.", starter: "You repeat each test because", model: "You repeat each test because it helps you spot odd results, and the mean of three is more reliable.",
       must: [I(["odd", "mistake", "strange", "wrong", "anomal", "weird", "error", "outlier"], "What can repeats help you spot?"), I(["reliable", "mean", "average", "accurate", "trust", "fair", "sure"], "What does it do to your result?")] },
};

/* Map Room. Each branch: name (a primary card), link = the accepted link word from the centre (level 3),
   cards = secondary cards; a card may also fit another branch (also: [branch index]). */
export const MAPS = {
  1: {
    centre: "Cells: the building blocks of life",
    branches: [
      { name: "Shape fits the job", link: "come in different shapes for", cards: ["red blood cell: no nucleus, room for oxygen", "nerve cell: long and thin, carries messages", "root hair cell: big surface for water"] },
      { name: "Cell parts", link: "are made of", cards: ["nucleus: control, DNA", "cell membrane: controls in and out", "cytoplasm: where reactions happen", "mitochondria: respiration, energy"] },
      { name: "Plant cells only", link: "in plants also have", cards: ["cell wall: support", "chloroplasts: photosynthesis", "large permanent vacuole: sap keeps the cell firm"] },
      { name: "Seeing cells", link: "are seen with a microscope", cards: ["eyepiece × objective = magnification", "start on low power", "stain makes parts easier to see", "pencil drawing, no shading"] },
      { name: "Diffusion", link: "get what they need by", cards: ["high to low concentration", "oxygen into the blood", "faster when warmer", "needs no energy"] },
    ],
    also: { "red blood cell: no nucleus, room for oxygen": [1, 4], "oxygen into the blood": [0] },
    cross: { from: "cell membrane: controls in and out", to: 4, link: "lets substances in by", wrong: ["is made of", "protects the brain by"] },
    words: ["cell", "nucleus", "membrane", "cytoplasm", "mitochondria", "cell wall", "chloroplast", "vacuole", "microscope", "magnification", "stain", "diffusion", "concentration", "oxygen", "nerve cell", "red blood cell", "root hair cell", "form fits function"],
  },
};
