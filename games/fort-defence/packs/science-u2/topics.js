/* Science Unit 2 topics: "How are we organised?" (MYP Sciences, Grade 7).
   The content is the checked content document (Rudi: "All good", 22 Nov 2026): lesson cards, question makers and why-questions
   for each of the 12 checklist statements, plus a big-idea day first. Day numbers in the game are one more than in the document
   (the big idea is Day 1). Every question maker returns a fresh question with its choices shuffled. */
import { pick, shuffle } from "../../js/qcore.js";
import { animalCell, plantCell, rootCell, venn, microscope, microView, cellDrawing, diffusionPic, alveolus, DiffusionTool, levelsPic, levelIcon, LEVELS,
  skeleton, protectPic, bonePic, bloodPic, armPic, ArmTool, PulseTool, emojiPic } from "./kit.js";

/* a choice answer with the right one shuffled in */
const C = (right, ...wrong) => { const list = shuffle([right, ...wrong]); return { choice: list, ans: list.indexOf(right) }; };
/* one question: q text, answer spec, why, a hint for Train, and an optional picture */
const Q = (q, a, why, hint, v, p) => ({ q, v, steps: [], final: { p: p || "", a, hint }, why });
/* a why-question for the Brain check, shuffled once */
const ck = (q, right, wrong, why) => { const c = shuffle([right, ...wrong]); return { q, c, a: c.indexOf(right), why }; };
const W = (...w) => ({ words: w });
const pickN = (a, n) => shuffle(a).slice(0, n);

export const STEPS = [];

/* ================= Day 1 (big idea): shape fits the job ================= */
STEPS.push({ id: 1, big: true, title: "Shape fits the job", short: "Shape fits the job",
  learn: [
    { t: "show", h: "Shape tells you the job", b: `<p>A spoon is curved so it can hold soup. A fork has prongs so it can stab food. Scissors have two sharp blades that slide past each other to cut.</p>`, v: () => emojiPic("🥄 🍴 ✂️"), rule: "The shape of a thing fits the job it does." },
    { t: "show", h: "Living things work the same way", b: `<p>A duck's webbed feet push water like paddles. A giraffe's long neck reaches the highest leaves. An eagle's hooked beak tears meat.</p><p>Scientists call this <b>form and function</b>: the form (shape) fits the function (job).</p>`, v: () => emojiPic("🦆 🦒 🦅") },
    { t: "try", h: "Your turn", b: `<p>A woodpecker has a strong, pointed beak like a chisel.</p>`, q: { ask: "What job does that shape help with?", choices: ["Drilling holes in wood", "Sipping nectar", "Scooping fish from water"], ans: 0, why: "A strong, pointed beak can chip into wood like a chisel. Shape fits the job." } },
    { t: "show", h: "You are made of tiny parts", b: `<p>Every living thing is built from <b>cells</b>, the smallest living building blocks. A bacterium is just one cell. You are made of about <b>30 trillion</b> cells.</p><p>Most cells are far too small to see without a microscope.</p>`, v: () => animalCell() },
    { t: "show", h: "Special cells have special shapes", b: `<p>A <b>nerve cell</b> is long and thin, like a wire, so it can carry messages a long way.</p><p>A <b>red blood cell</b> is a small, squashed disc with no nucleus, so it has room for lots of oxygen and can squeeze through tiny blood vessels.</p>`, v: () => bloodPic(), rule: "Special cells have special shapes for their jobs." },
    { t: "try", h: "Your turn", b: `<p>A nerve cell can be over a metre long, from your spine to your toes.</p>`, q: { ask: "Why is a nerve cell so long and thin?", choices: ["To carry messages over long distances", "To store food", "To make blood"], ans: 0, why: "Long and thin, like a wire: it carries messages from one part of the body to another." } },
    { t: "show", h: "Cells work in teams", b: `<p>Cells join to make <b>tissues</b>, tissues make <b>organs</b>, organs make <b>organ systems</b>, and systems make a whole <b>organism</b>. You'll learn this properly later in the quest.</p>`, v: () => levelsPic(), rule: "Cell → tissue → organ → system → organism." },
  ],
  gen: [
    () => pick([
      () => Q("A spoon is curved. What job does that help with?", C("Holding liquid", "Cutting bread", "Keeping rain off"), "The curve makes a little bowl that holds liquid.", "Think about what a curve can hold."),
      () => Q("An umbrella is wide and waterproof. What is its job?", C("Keeping rain off you", "Holding soup", "Cutting paper"), "Wide and waterproof means it catches the rain before it reaches you.", "Shape fits the job."),
      () => Q("A duck has webbed feet. What job does this help with?", C("Swimming, pushing water like a paddle", "Climbing trees", "Digging holes"), "The skin between the toes pushes lots of water, like a paddle.", "What does a paddle do?"),
      () => Q("A giraffe has a very long neck. What job does this help with?", C("Reaching leaves high up in trees", "Running faster", "Keeping warm"), "The long neck reaches food other animals can't.", "Where does a giraffe find its food?"),
    ])(),
    () => pick([
      () => Q("What is the smallest living building block of all living things?", C("A cell", "An organ", "A tissue", "An atom"), "Cells are the smallest units that are alive. Atoms are smaller but not alive.", "It's the word the whole unit is about."),
      () => Q("Type the word: the smallest living building block of all living things is a ___.", W("cell"), "Every living thing is made of one or more cells.", "Four letters, starts with c."),
      () => Q("About how many cells is a human body made of?", C("About 30 trillion", "About 30", "About 3,000"), "There are about 30 trillion cells in your body. That's 30 000 000 000 000!", "It's a huge number."),
    ])(),
    () => pick([
      () => Q("A nerve cell is very long and thin. Which job does this shape help with?", C("Carrying messages over long distances", "Carrying oxygen", "Fighting germs"), "Long and thin like a wire: perfect for carrying messages a long way.", "Think of a long wire."),
      () => Q("A red blood cell is a small flat disc with no nucleus. What job does this help with?", C("Carrying lots of oxygen", "Sending messages", "Moving bones"), "With no nucleus there is more room for oxygen, and the small flat shape squeezes through tiny tubes.", "What does blood carry around your body?", () => bloodPic()),
      () => Q("Which cell would be shaped like a long thin wire?", C("A nerve cell", "A red blood cell", "A fat cell"), "Nerve cells carry messages, so they are long and thin.", "Which cell sends messages?"),
    ])(),
  ],
  checks: [
    ck("Why does a red blood cell have no nucleus?", "It leaves more room to carry oxygen", ["It is too small to have one", "Because it has died", "Because nuclei are only in plants"], "No nucleus means more space for oxygen. The shape fits the job."),
    ck("What does 'form fits function' mean?", "The shape of a part helps it do its job", ["Every part is the same shape", "Forms are filled in at school", "Big things work better than small things"], "Form means shape, function means job: the shape suits the job."),
    ck("Why can't one type of cell do every job in the body?", "Different jobs need different shapes and parts", ["Cells are too small to do anything", "Only the brain does jobs", "All cells are exactly the same"], "A long nerve cell is great for messages but useless for carrying oxygen. Different jobs need different designs."),
    ck("A nerve cell carries messages. Which shape would suit it best?", "Long and thin, like a wire", ["Round like a ball", "Flat like a plate", "Tiny like a dot"], "Messages travel along it, so long and thin is best."),
    ck("Why are cells called the 'building blocks' of life?", "Every living thing is built from them", ["They are square like bricks", "They are made of stone", "Only buildings have them"], "From bacteria to blue whales, every living thing is made of cells."),
  ],
});

/* ================= Day 2: parts of a cell (statement 1) ================= */
const PARTS = [
  { k: "nucleus", n: "nucleus", job: "controls the cell and holds the instructions (DNA)", city: "the town hall 🏛️" },
  { k: "membrane", n: "cell membrane", job: "controls what goes in and out of the cell", city: "the city gate with guards 🚧" },
  { k: "cytoplasm", n: "cytoplasm", job: "is the jelly where most chemical reactions happen", city: "the streets, where the work happens 🛣️" },
  { k: "mitochondria", n: "mitochondria", job: "release energy from glucose by respiration", city: "the power station ⚡" },
  { k: "wall", n: "cell wall", job: "is a strong layer that supports the plant cell (plants only)", city: "the city wall 🧱" },
  { k: "vacuole", n: "vacuole", job: "holds cell sap and keeps a plant cell firm", city: "the water tower 💧" },
  { k: "chloroplast", n: "chloroplasts", job: "absorb light to make food by photosynthesis (plants only)", city: "the solar farm ☀️" },
];
const JOBQ = [
  ["Which part controls what the cell does?", "nucleus", "It's the control centre, like a town hall."],
  ["Which part controls what goes in and out of the cell?", "cell membrane", "It's a thin layer all round the cell, like a gate with guards."],
  ["Where do most chemical reactions in a cell happen?", "cytoplasm", "The jelly filling the cell, like the streets of a city."],
  ["Which part releases energy by respiration?", "mitochondria", "The power stations of the cell."],
  ["Which part makes food using light?", "chloroplasts", "Only in plant cells: the solar farms."],
  ["Which part holds the genetic instructions (DNA)?", "nucleus", "The DNA is kept in the control centre."],
  ["Which strong layer supports a plant cell from outside?", "cell wall", "Outside the membrane, only in plants."],
  ["Which part is full of cell sap and keeps a plant cell firm?", "vacuole", "A big bag of watery sap in the middle of a plant cell."],
];
const allNames = PARTS.map(p => p.n);
STEPS.push({ id: 2, title: "The parts of a cell and their jobs", short: "Cell parts",
  learn: [
    { t: "show", h: "A cell is like a tiny city", b: `<p>Inside every cell are parts with their own jobs. A part inside a cell is called an <b>organelle</b>.</p><p>Let's meet them, one at a time. Each one has a city job to help you remember it.</p>`, v: () => animalCell({ labels: true }), rule: "Each part of a cell has one main job." },
    { t: "show", h: "Nucleus: the town hall 🏛️", b: `<p>The <b>nucleus</b> controls everything the cell does. It holds the cell's instructions, called <b>DNA</b>.</p>`, v: () => animalCell({ mark: "nucleus" }), rule: "Nucleus = control centre, holds DNA." },
    { t: "show", h: "Cell membrane: the gate 🚧", b: `<p>The <b>cell membrane</b> is a thin layer around the outside of the cell. It controls what goes <b>in and out</b>, like guards at a city gate.</p>`, v: () => animalCell({ mark: "membrane" }), rule: "Membrane = controls what goes in and out." },
    { t: "show", h: "Cytoplasm: the streets 🛣️", b: `<p>The <b>cytoplasm</b> is the jelly that fills the cell. Most of the cell's <b>chemical reactions</b> happen here, like the busy streets where a city's work gets done.</p>`, v: () => animalCell({ mark: "cytoplasm" }), rule: "Cytoplasm = jelly where reactions happen." },
    { t: "show", h: "Mitochondria: the power stations ⚡", b: `<p><b>Mitochondria</b> (one is a mitochondrion) are where <b>respiration</b> happens. Respiration releases energy from glucose (sugar) so the cell can work.</p>`, v: () => animalCell({ mark: "mitochondria" }), rule: "Mitochondria = release energy (respiration)." },
    { t: "try", h: "Your turn", q: { ask: "Which part controls what goes in and out of the cell?", choices: ["Cell membrane", "Nucleus", "Cytoplasm"], ans: 0, why: "The membrane is the gate with guards." } },
    { t: "show", h: "Three extra parts in plant cells", b: `<p>🧱 The <b>cell wall</b> is a strong layer outside the membrane, made of cellulose. It supports the cell.</p><p>💧 The <b>vacuole</b> is a big bag of cell sap that keeps the cell firm.</p><p>☀️ <b>Chloroplasts</b> absorb light to make food by <b>photosynthesis</b>.</p>`, v: () => plantCell({ labels: true }) },
    { t: "try", h: "Your turn", q: { ask: "Which part of a plant cell is the solar farm, making food from light?", choices: ["Chloroplast", "Vacuole", "Nucleus"], ans: 0, why: "Chloroplasts absorb light for photosynthesis." } },
  ],
  gen: [
    () => { const [q, a, hint] = pick(JOBQ); return Q(q, C(a, ...pickN(allNames.filter(n => n !== a), 3)), `The ${a} ${PARTS.find(p => p.n === a).job}.`, hint); },
    () => { const p = pick(PARTS.filter(p => !["wall", "vacuole", "chloroplast"].includes(p.k))); return Q(`Tap the <b>${p.n}</b>.`, { tap: { pic: () => animalCell(), ans: p.k, name: p.n } }, `The ${p.n} ${p.job}.`, `It's ${p.city}.`); },
    () => { const p = pick(PARTS); return Q(`Tap the <b>${p.n}</b> in this plant cell.`, { tap: { pic: () => plantCell(), ans: p.k, name: p.n } }, `The ${p.n} ${p.job}.`, `It's ${p.city}.`); },
    () => { const p = pick(PARTS.filter(p => p.k !== "cytoplasm")); const plant = ["wall", "vacuole", "chloroplast"].includes(p.k) || Math.random() < 0.4;
      return Q("What is the part marked <b>?</b> called? Type its name.", W(p.n, ...(p.k === "mitochondria" ? ["mitochondrion"] : p.k === "chloroplast" ? ["chloroplast"] : p.k === "membrane" ? ["membrane"] : p.k === "wall" ? ["wall"] : [])), `That's the ${p.n}: it ${p.job}.`, `It's ${p.city}.`, () => plant ? plantCell({ mark: p.k }) : animalCell({ mark: p.k })); },
    () => { const p = pick(PARTS); return Q(`What does the <b>${p.n}</b> do?`, C(p.job, ...pickN(PARTS.filter(x => x !== p).map(x => x.job), 2)), `The ${p.n} ${p.job}.`, `Remember its city job: ${p.city}.`); },
    () => Q("What is an <b>organelle</b>?", C("A part inside a cell with its own job", "A tiny organ in your stomach", "A type of plant", "A whole cell"), "Organelles are the parts inside a cell, like the nucleus and mitochondria.", "It sounds like 'little organ'."),
  ],
  checks: [
    ck("A muscle cell has lots of mitochondria. Why?", "Muscles need lots of energy to move", ["Muscles need to make food", "Mitochondria make muscles strong", "To control what enters the cell"], "Mitochondria release energy by respiration, and muscles use a lot of energy."),
    ck("Why is the cell membrane important?", "It controls which substances enter and leave the cell", ["It makes food from light", "It holds the DNA", "It makes the cell green"], "Without the gate, harmful things could get in and useful things could leak out."),
    ck("A student says: 'The cell wall controls what enters the cell.' What's the mistake?", "The membrane controls entry; the wall gives support", ["Nothing, that's right", "The nucleus controls entry", "Animal cells have the strongest walls"], "The cell wall is for support. The membrane is the gatekeeper."),
    ck("What would happen to a cell with no nucleus?", "It would have no instructions to control what it does", ["It would make more food", "It would grow faster", "Nothing would change"], "The nucleus holds the DNA, the cell's instructions."),
    ck("Why do leaf cells have lots of chloroplasts?", "Leaves get lots of light, so they can make lots of food", ["Chloroplasts make leaves hard", "To release energy", "To stop water getting in"], "Chloroplasts use light for photosynthesis, and leaves face the sun."),
    ck("Where does respiration happen?", "In the mitochondria", ["In the cell wall", "In the vacuole", "In the chloroplasts only"], "Mitochondria are the power stations where respiration releases energy."),
  ],
});

/* ================= Day 3: plant vs animal cells (statement 2) ================= */
const SORT_PA = [["Nucleus", 1], ["Cell membrane", 1], ["Cytoplasm", 1], ["Mitochondria", 1], ["Cell wall", 0], ["Chloroplasts", 0], ["Large permanent vacuole", 0]];
STEPS.push({ id: 3, title: "Plant and animal cells: same and different", short: "Plant vs animal",
  learn: [
    { t: "show", h: "Parts in both", b: `<p>Plant cells and animal cells both have a <b>nucleus</b>, a <b>cell membrane</b>, <b>cytoplasm</b> and <b>mitochondria</b>.</p>`, v: () => venn(["", "", ""], ["nucleus", "cell membrane", "cytoplasm", "mitochondria"], [""]), rule: "Both: nucleus, membrane, cytoplasm, mitochondria." },
    { t: "show", h: "Only in plant cells", b: `<p>Plant cells have three extra parts: a <b>cell wall</b>, <b>chloroplasts</b> and a <b>large permanent vacuole</b>.</p><p>Animal cells may have small vacuoles that come and go, but never a big permanent one.</p>`, v: () => venn(), rule: "Plant only: cell wall, chloroplasts, large vacuole." },
    { t: "show", h: "Why plants need them", b: `<p>☀️ Plants <b>make their own food</b> from light, so they need chloroplasts. Animals eat their food instead.</p><p>🧱 Plants have <b>no skeleton</b>. Strong cell walls and firm, full vacuoles hold the plant up.</p>`, v: () => emojiPic("🌻 🐄", "Plants make food. Animals eat it.") },
    { t: "try", h: "Your turn", q: { ask: "Why do animal cells not need chloroplasts?", choices: ["Animals get their food by eating", "Animals live in the dark", "Animal cells are too small"], ans: 0, why: "Chloroplasts make food from light. Animals eat food, so they don't need them." } },
    { t: "show", h: "A shape clue", b: `<p>Plant cells usually look like <b>regular boxes</b> because of their walls. Animal cells have <b>rounded, irregular shapes</b>.</p>`, v: () => { const d = document.createElement("div"); d.className = "row"; d.style.justifyContent = "center"; const a = plantCell(), b = animalCell(); a.style.maxWidth = b.style.maxWidth = "210px"; d.append(a, b); return d; } },
    { t: "show", h: "Careful: not every plant cell is green", b: `<p>Root cells are underground, where there is no light. So root cells have <b>no chloroplasts</b>. They still have a cell wall and a vacuole.</p>`, v: () => rootCell(), rule: "Chloroplasts only where there is light." },
    { t: "try", h: "Your turn", q: { ask: "Which part do both plant and animal cells have?", choices: ["Mitochondria", "Cell wall", "Chloroplasts"], ans: 0, why: "Mitochondria are in both, because both need energy from respiration." } },
  ],
  gen: [
    () => { const items = pickN(SORT_PA, 5); return Q("Sort these parts: are they only in <b>plant</b> cells, or in <b>both</b> plant and animal cells?", { sort: { bins: ["Plant only", "Both"], items } }, "Both have a nucleus, membrane, cytoplasm and mitochondria. Only plants have a cell wall, chloroplasts and a large vacuole.", "Plants have three extras: wall, chloroplasts, big vacuole."); },
    () => { const plant = Math.random() < 0.5; return Q("Is this a plant cell or an animal cell?", C(plant ? "Plant cell" : "Animal cell", plant ? "Animal cell" : "Plant cell"), plant ? "It has a cell wall, chloroplasts and a big vacuole: a plant cell." : "No cell wall, no chloroplasts and a rounded shape: an animal cell.", "Look for a cell wall and green chloroplasts.", () => plant ? plantCell() : animalCell()); },
    () => { const plant = Math.random() < 0.5; return Q(`This is a ${plant ? "plant" : "animal"} cell. Which clue tells you?`, plant ? C("It has a cell wall and chloroplasts", "It has a nucleus", "It has cytoplasm", "It has mitochondria") : C("It has no cell wall or chloroplasts", "It has a nucleus", "It has a membrane", "It has mitochondria"), plant ? "Nucleus, cytoplasm and mitochondria are in both, so only the wall and chloroplasts prove it's a plant." : "Parts in both cells can't tell them apart. Missing a wall and chloroplasts does.", "A clue must be something only one type has.", () => plant ? plantCell() : animalCell()); },
    () => pick([
      () => Q("Which part is found in plant cells but <b>not</b> animal cells?", C(pick(["Cell wall", "Chloroplasts"]), "Nucleus", "Cytoplasm", "Cell membrane"), "Cell walls and chloroplasts are only in plant cells.", "Think of the three plant extras."),
      () => Q("Which part is found in <b>both</b> plant and animal cells?", C(pick(["Nucleus", "Cell membrane", "Cytoplasm", "Mitochondria"]), "Cell wall", "Chloroplasts"), "Nucleus, membrane, cytoplasm and mitochondria are in both.", "Cross out the plant-only parts."),
      () => Q("A root cell is from a plant. Which part does it <b>not</b> have?", C("Chloroplasts", "Cell wall", "Nucleus", "Vacuole"), "Roots grow underground with no light, so there's no point having chloroplasts.", "What needs light to work?", () => rootCell()),
    ])(),
  ],
  checks: [
    ck("Why do animal cells not need chloroplasts?", "Animals get food by eating", ["Animals can't see light", "Animal cells have walls instead", "Chloroplasts are too big"], "Chloroplasts make food using light. Animals eat their food."),
    ck("Why are root cells missing chloroplasts?", "No light reaches them, so they can't photosynthesise", ["Roots are too thin", "Roots get food from the soil", "Roots are animal cells"], "Chloroplasts need light. Underground there is none."),
    ck("Why does a plant wilt (droop) when it has no water?", "Its vacuoles lose water, so the cells stop being firm", ["Its cell walls dissolve", "Its chloroplasts fall out", "It grows a skeleton"], "Full vacuoles push against the walls and keep cells firm. Without water they go floppy."),
    ck("How can a plant stand up without a skeleton?", "Cell walls and firm vacuoles support it", ["Its roots pull it up", "Its chloroplasts are hard", "It uses muscles"], "Strong walls and full vacuoles make every cell firm, like a pumped-up tyre."),
    ck("Why do both plant and animal cells have mitochondria?", "Both need to release energy by respiration", ["Both make food from light", "Both need cell walls", "Mitochondria hold the DNA"], "Every living cell needs energy, so both have mitochondria."),
  ],
});

/* ================= Day 4: the microscope and scientific drawing (statement 3) ================= */
const MSTEPS = ["Put the slide on the stage and hold it with the clips", "Turn to the lowest power objective lens", "Look from the side and turn the coarse focus to bring the lens close to the slide", "Look through the eyepiece and turn the coarse focus to move them apart until the cells appear", "Sharpen the picture with the fine focus", "Switch to a higher power lens and use only the fine focus"];
const MPARTS = [["eyepiece", "eyepiece lens", "the lens you look through"], ["objective", "objective lenses", "the lenses that magnify the slide"], ["stage", "stage", "the flat platform the slide sits on"], ["clips", "stage clips", "hold the slide still"], ["lamp", "lamp", "shines light up through the slide"], ["coarse", "coarse focus knob", "the big knob for rough focusing"], ["fine", "fine focus knob", "the small knob for sharp focusing"]];
const FAULTS = [["shading", "It has shading", "Scientific drawings use clear lines only, no shading or colouring."], ["arrows", "The label lines have arrowheads", "Label lines are plain ruler lines with no arrowheads."], ["sketchy", "The lines are sketchy, not clear single lines", "Use one clear, sharp pencil line for each edge."], ["crossing", "The label lines cross over", "Label lines should never cross."], ["notitle", "It has no title or magnification", "Every drawing needs a title and the magnification."]];
STEPS.push({ id: 4, title: "Using a microscope and drawing what you see", short: "Microscope",
  learn: [
    { t: "show", h: "Meet the light microscope", b: `<p>A light microscope uses light and lenses to make tiny things look bigger. You look through the <b>eyepiece lens</b>. The <b>objective lenses</b> sit just above the slide.</p>`, v: () => microscope({ labels: true }) },
    { t: "show", h: "Making a slide", b: `<p>1. Put a very thin layer of cells (like onion skin) on a glass slide.</p><p>2. Add a drop of <b>stain</b> (iodine for onion cells, methylene blue for cheek cells). It makes the parts easier to see.</p><p>3. Lower a <b>cover slip</b> on at an angle, so no air bubbles get trapped.</p>`, v: () => microView(0, 1, true), rule: "Thin layer, stain, cover slip at an angle." },
    { t: "show", h: "How to focus", b: `<ol>${MSTEPS.map(s => `<li>${s}</li>`).join("")}</ol>`, rule: "Start on low power. Look from the side when moving the lens down." },
    { t: "show", h: "Why start on low power?", b: `<p>Low power shows a <b>bigger area</b>, so it's easier to find the cells. Looking from the side stops you <b>crashing the lens</b> into the slide and breaking it.</p><p>On high power the lens is very close to the slide, so use only the <b>fine</b> focus.</p>`, v: () => { const d = document.createElement("div"); d.className = "row"; d.style.justifyContent = "center"; const a = microView(3, 1), b = microView(0, 1.6); a.style.maxWidth = b.style.maxWidth = "150px"; d.append(a, b); return d; } },
    { t: "try", h: "Your turn", q: { ask: "Which knob do you use for the final, sharp focus?", choices: ["Fine focus", "Coarse focus", "The lamp switch"], ans: 0, why: "The fine focus makes small changes to sharpen the picture." } },
    { t: "show", h: "Scientific drawing rules", b: `<ul><li>Sharp <b>pencil</b>, never pen</li><li>Clear single lines: <b>no shading</b>, no sketchy lines</li><li>Draw what you <b>see</b>, not what you expect</li><li>Use a good amount of the space</li><li>Label lines drawn with a <b>ruler</b>: no arrowheads, never crossing</li><li>A <b>title</b> and the <b>magnification</b></li></ul>`, v: () => cellDrawing(""), rule: "Pencil, clear lines, ruler labels, title and magnification." },
    { t: "show", h: "Magnification (extra)", b: `<p>Total magnification = eyepiece × objective.</p><p>A ×10 eyepiece with a ×40 objective magnifies <b>10 × 40 = 400</b> times.</p>`, rule: "Magnification = eyepiece × objective." },
    { t: "try", h: "Your turn", b: `<p>Eyepiece ×10, objective ×4.</p>`, q: { ask: "Total magnification =", a: { num: 40 }, why: "10 × 4 = 40." } },
  ],
  gen: [
    () => { const n = pick([4, 5]); const start = Math.floor(Math.random() * (MSTEPS.length - n + 1)); return Q("Put these microscope steps in the right order.", { order: MSTEPS.slice(start, start + n) }, "Slide on, lowest power, lens down while watching from the side, focus up with coarse, sharpen with fine, then higher power with fine only.", "Start with the slide and the lowest power."); },
    () => { const [k, n, job] = pick(MPARTS); return Q(`Tap the <b>${n}</b>.`, { tap: { pic: () => microscope(), ans: k, name: n } }, `The ${n}: ${job}.`, job[0].toUpperCase() + job.slice(1) + "."); },
    () => { const [k, n, job] = pick(MPARTS); return Q(`Which part ${job.startsWith("the") ? "is " + job : job}?`, C(n, ...pickN(MPARTS.filter(m => m[0] !== k).map(m => m[1]), 3)), `The ${n}: ${job}.`, "Picture the microscope from top to bottom."); },
    () => { const [f, t, why] = pick(FAULTS); return Q("What is wrong with this scientific drawing?", C(t, ...pickN(FAULTS.filter(x => x[0] !== f).map(x => x[1]), 2), "Nothing, it's perfect"), why, "Check: lines, shading, label lines, title.", () => cellDrawing(f)); },
    () => { const e = pick([5, 10, 15]), o = pick([4, 10, 40]); return { q: `A microscope has a ×${e} eyepiece and a ×${o} objective lens. What is the total magnification?`, steps: [{ p: "Which sum do you do?", a: C(`${e} × ${o}`, `${e} + ${o}`, `${o} − ${e}`), hint: "Magnification = eyepiece × objective." }], final: { p: "Total magnification = ×", a: { num: e * o } }, why: `${e} × ${o} = ${e * o}.` }; },
    () => pick([
      () => Q("Why do we add a stain to a slide?", C("To make the cell parts easier to see", "To kill the cells", "To make the slide sticky"), "Stains colour parts like the nucleus so they stand out.", "Without it, onion cells are almost see-through.", () => microView(0, 1, true)),
      () => Q("Which objective lens should you start with?", C("The lowest power", "The highest power", "Any of them"), "Low power shows a bigger area, so the cells are easier to find.", "Start wide, then zoom in."),
      () => Q("What do you draw a scientific drawing with?", C("A sharp pencil", "A felt-tip pen", "Coloured crayons"), "Pencil lines are clear and can be rubbed out.", "Which can you rub out?"),
    ])(),
  ],
  checks: [
    ck("Why do we lower the cover slip at an angle?", "To stop air bubbles getting trapped", ["To make the cells bigger", "To add the stain", "So it doesn't fall off"], "Lowering it slowly at an angle pushes the air out."),
    ck("Why use a pencil, not a pen, for a scientific drawing?", "Mistakes can be rubbed out and lines stay clear", ["Pens are not allowed in science", "Pencil is cheaper", "Pens smudge the slide"], "A sharp pencil gives clear lines you can correct."),
    ck("Why use only the fine focus on high power?", "The coarse focus could crash the lens into the slide", ["The coarse focus is broken on high power", "The fine focus is faster", "High power has no coarse focus"], "On high power the lens is very close to the slide. Big movements could break both."),
    ck("Why look from the side when lowering the objective lens?", "So you can see it doesn't hit the slide", ["So the light is brighter", "To find the stain", "It's quicker"], "Watching from the side stops the lens crashing into the slide."),
    ck("Why start on the lowest power objective?", "You see a bigger area, so it's easier to find the cells", ["It makes the cells bigger", "It's the brightest", "It needs no focusing"], "Find the cells on low power first, then zoom in."),
    ck("Why must you draw what you SEE, not what you expect?", "A scientific drawing is a record of the real evidence", ["Expected drawings are too hard", "Teachers like messy drawings", "So it looks like a textbook"], "Science is about evidence. Draw the real cells, even if they look different from the book."),
  ],
});

/* ================= Day 5: diffusion (statement 4) ================= */
STEPS.push({ id: 5, title: "Diffusion: how materials move in and out of cells", short: "Diffusion",
  learn: [
    { t: "show", h: "Particles never sit still", b: `<p>Everything is made of tiny <b>particles</b>. In liquids and gases they are always moving and bumping, in random directions.</p>`, v: () => diffusionPic("mid") },
    { t: "show", h: "What is diffusion?", b: `<p><b>Diffusion</b> is the spreading out of particles from where there are <b>lots</b> of them (high concentration) to where there are <b>few</b> (low concentration).</p><p><b>Concentration</b> means how crowded the particles are.</p>`, v: () => diffusionPic("start"), rule: "Diffusion: high concentration → low concentration." },
    { t: "tool", h: "Watch it happen", b: `<p>All the particles start on the left. Press play and count them on each side. Then try warming it up.</p>`, tool: () => DiffusionTool() },
    { t: "show", h: "It stops when it's even", b: `<p>Particles keep moving, but once they are <b>evenly spread</b> there's no crowded side left, so nothing changes overall.</p>`, v: () => diffusionPic("even"), rule: "Crowded → spread out, until it's even." },
    { t: "show", h: "Everyday diffusion", b: `<p>🌸 A smell spreads across a room. 🧃 A drop of squash spreads through a glass of water.</p><p>🔥 It's <b>faster when warmer</b>, because particles move faster.</p>`, v: () => emojiPic("🌸 ➡️ 👃") },
    { t: "show", h: "Diffusion in your body", b: `<p>In your lungs, there's lots of <b>oxygen</b> in the air sacs and less in the blood, so oxygen diffuses <b>into the blood</b>. Then it diffuses from the blood <b>into your cells</b>.</p><p><b>Carbon dioxide</b> goes the other way: out of cells, into the blood, into the lungs. <b>Glucose</b> diffuses from the blood into cells.</p>`, v: () => alveolus({ arrows: true }) },
    { t: "show", h: "In plants", b: `<p>Carbon dioxide diffuses into leaves through tiny holes called <b>stomata</b>.</p>`, v: () => emojiPic("🍃"), rule: "Every cell gets what it needs through its membrane by diffusion." },
    { t: "try", h: "Your turn", q: { ask: "Diffusion is the movement of particles from…", choices: ["High concentration to low concentration", "Low concentration to high concentration", "Cold places to hot places"], ans: 0, why: "Always from crowded to spread out." } },
  ],
  gen: [
    () => { const flip = Math.random() < 0.5; return Q("Which way will the particles spread overall?", C(flip ? "From right to left" : "From left to right", flip ? "From left to right" : "From right to left", "They won't move at all"), "From the crowded side (high concentration) to the emptier side (low concentration).", "Find the crowded side.", () => diffusionPic("start", flip)); },
    () => pick([
      () => Q("Where is oxygen more concentrated: the air sac or the blood arriving at the lungs?", C("The air sac", "The blood"), "There's lots of oxygen in the air you breathe in, so it diffuses from the air sac into the blood.", "Count the blue dots.", () => alveolus()),
      () => Q("Which way does oxygen diffuse in the lungs?", C("From the air sacs into the blood", "From the blood into the air sacs", "It doesn't move"), "Lots in the air sac, little in the blood: high to low.", "High to low.", () => alveolus()),
      () => Q("Which way does carbon dioxide diffuse in a working muscle?", C("Out of the muscle cells into the blood", "From the blood into the muscle cells", "It stays put"), "Muscle cells make carbon dioxide during respiration, so there's more inside: it diffuses out.", "Where is there more carbon dioxide?"),
    ])(),
    () => Q("Which of these is an example of diffusion?", C(pick(["A smell of perfume spreading across a room", "Squash spreading through water without stirring", "Oxygen moving from the lungs into the blood"]), "Ice melting in the sun", "A ball rolling down a hill", "Water being poured from a jug"), "Diffusion is particles spreading out on their own, from high to low concentration.", "Look for particles spreading out on their own."),
    () => pick([
      () => Q("Diffusion is the movement of particles from a ___ concentration to a ___ concentration.", C("high … low", "low … high", "hot … cold"), "Always from crowded (high) to less crowded (low).", "Crowded to spread out."),
      () => Q("Type the word: the spreading of particles from high to low concentration is called ___.", W("diffusion"), "That's diffusion.", "It starts with 'diff'."),
      () => Q("What does <b>concentration</b> mean?", C("How crowded the particles are", "How hot something is", "How fast something moves"), "High concentration = lots of particles packed in.", "Think crowded or spread out."),
      () => Q("How does warming up affect diffusion?", C("It makes diffusion faster", "It makes diffusion slower", "It stops diffusion"), "Warmer particles move faster, so they spread out faster.", "Do particles move faster or slower when warm?"),
    ])(),
  ],
  checks: [
    ck("Why does carbon dioxide leave a cell?", "There is more of it inside the cell than in the blood", ["The cell pushes it out with muscles", "It is attracted to oxygen", "Cells don't make carbon dioxide"], "Cells make carbon dioxide, so it's more concentrated inside. It diffuses out, high to low."),
    ck("Why does a smell spread faster in a warm room?", "Particles move faster when they are warmer", ["Warm air is bigger", "Smells like heat", "Cold air has no particles"], "More heat, more movement, faster diffusion."),
    ck("Why does diffusion stop changing things after a while?", "The particles are evenly spread, so no area is more crowded", ["The particles stop moving", "The particles get tired", "They all go back to the start"], "Particles keep moving, but there's no high or low area left."),
    ck("Why does the cell membrane matter for diffusion?", "Substances must pass through it to get in or out of the cell", ["It makes the particles", "It stops all diffusion", "It only lets light through"], "The membrane is the gate every substance passes through."),
    ck("Oxygen diffuses into your blood in your lungs. Why?", "There is more oxygen in the air sacs than in the blood", ["The heart sucks it in", "Blood is warmer", "Oxygen likes red things"], "High concentration in the air sac, low in the blood."),
    ck("Do you need energy to make diffusion happen?", "No, particles spread on their own because they move randomly", ["Yes, the cell pushes them", "Yes, from the sun", "Only in plants"], "Diffusion happens by itself, from high to low concentration."),
  ],
});

/* ================= Day 6: levels of organisation (statement 5) ================= */
const LVDEF = { cell: "the smallest living unit", tissue: "a group of similar cells working together to do one job", organ: "a group of different tissues working together", system: "a group of organs working together for a life process", organism: "a whole living thing" };
const LVNAME = { cell: "cell", tissue: "tissue", organ: "organ", system: "organ system", organism: "organism" };
const LVEX = [["red blood cell", "cell"], ["bone cell", "cell"], ["palisade cell", "cell"], ["muscle tissue", "tissue"], ["nerve tissue", "tissue"], ["bone tissue", "tissue"], ["heart", "organ"], ["stomach", "organ"], ["brain", "organ"], ["leaf", "organ"], ["lung", "organ"], ["skeletal system", "system"], ["digestive system", "system"], ["circulatory system", "system"], ["dog", "organism"], ["oak tree", "organism"], ["human", "organism"], ["bacterium", "organism"]];
STEPS.push({ id: 6, title: "Levels of organisation: cell to organism", short: "Levels",
  learn: [
    { t: "show", h: "Building a body, level by level", b: `<p>Cells are the bricks. Bricks build walls, walls build rooms, rooms build a house. Your body is built the same way.</p>`, v: () => levelsPic({ examples: true }), rule: "Cell → tissue → organ → organ system → organism." },
    { t: "show", h: "Cell and tissue", b: `<p>A <b>cell</b> is the smallest living unit, like a muscle cell.</p><p>A <b>tissue</b> is a group of <b>similar</b> cells working together to do one job, like muscle tissue.</p>`, v: () => levelsPic({ mark: "tissue" }) },
    { t: "show", h: "Organ", b: `<p>An <b>organ</b> is a group of <b>different</b> tissues working together. The heart has muscle tissue to squeeze, nerve tissue to control the beat, and other tissues too.</p>`, v: () => levelsPic({ mark: "organ" }), rule: "Tissue = similar cells. Organ = different tissues." },
    { t: "show", h: "Organ system and organism", b: `<p>An <b>organ system</b> is a group of organs working together for a life process. The circulatory system is the heart, blood vessels and blood.</p><p>All the systems together make an <b>organism</b>: a whole living thing.</p>`, v: () => levelsPic({ mark: "system" }) },
    { t: "show", h: "Plants have levels too", b: `<p>Palisade cell → palisade tissue → leaf (an organ) → shoot system → plant.</p>`, v: () => levelsPic({ plant: true, examples: true }) },
    { t: "show", h: "Every level depends on the one below", b: `<p>If heart muscle cells are damaged, the heart tissue is weaker, so the heart pumps less well, so the whole circulatory system suffers, and the person feels ill.</p>`, rule: "Each level is built from the one before." },
    { t: "try", h: "Your turn", q: { ask: "A group of similar cells doing the same job is a…", choices: ["Tissue", "Organ", "System"], ans: 0, why: "Similar cells working together make a tissue." } },
  ],
  gen: [
    () => { const plant = Math.random() < 0.3, n = pick([4, 5]), start = n === 4 ? pick([0, 1]) : 0; const lv = LEVELS.slice(start, start + n);
      return Q(`Put these in order, from <b>smallest</b> to <b>largest</b>.`, { order: lv.map(k => LVNAME[k]) }, "Cell → tissue → organ → organ system → organism.", "Start with the smallest living unit: the cell."); },
    () => { const items = pickN(LVEX, 5).map(([e, l]) => [e, ["cell", "tissue", "organ", "system", "organism"].indexOf(l)]); return Q("Which level is each one?", { sort: { bins: ["Cell", "Tissue", "Organ", "System", "Organism"], items } }, "Cells make tissues, tissues make organs, organs make systems, systems make an organism.", "Is it one cell, a group of the same cells, a body part, a team of organs, or a whole living thing?"); },
    () => { const k = pick(LEVELS); return Q(`Which level is this: <b>${LVDEF[k]}</b>?`, C(LVNAME[k], ...LEVELS.filter(x => x !== k).map(x => LVNAME[x]).slice(0, 3)), `A ${LVNAME[k]} is ${LVDEF[k]}.`, "Cell, tissue, organ, organ system, organism."); },
    () => { const [e, l] = pick(LVEX.filter(x => x[1] === "organ" || x[1] === "system")); return Q(`Which is ${l === "organ" ? "an organ" : "an organ system"}?`, C(e, ...pickN(LVEX.filter(x => x[1] !== l), 3).map(x => x[0])), `The ${e} is ${l === "organ" ? "an organ, made of different tissues" : "an organ system, a team of organs"}.`, l === "organ" ? "A body part with its own job, like the heart." : "A team of organs, usually called a 'system'."); },
    () => { const k = pick(["tissue", "organ", "system"]); return Q("Type the name of the level marked <b>?</b>.", W(LVNAME[k], ...(k === "system" ? ["system"] : [])), `It's the ${LVNAME[k]}: ${LVDEF[k]}.`, "Count along: cell, tissue, organ, organ system, organism.", () => levelsPic({ mark: k })); },
  ],
  checks: [
    ck("Why is the heart an organ and not a tissue?", "It is made of several different tissues working together", ["It is very big", "It is made of only one type of cell", "It is inside the body"], "Tissue = similar cells. Organ = different tissues working together."),
    ck("Why does damage to cells affect the whole organism?", "Each level is built from the one below", ["Cells control the weather", "Organisms have no cells", "It doesn't affect it at all"], "Damaged cells → weaker tissue → organ works less well → system suffers → the organism is ill."),
    ck("A bacterium is one single cell. Why is it called an organism?", "It is a whole living thing on its own", ["It is a tissue", "It is part of a human", "Because it is very small"], "An organism is any whole living thing, even one made of just one cell."),
    ck("Why do organs work in systems?", "Big jobs like moving blood need several organs working together", ["Organs are too small alone", "To look tidy", "Organs can't do anything"], "The heart pumps, the vessels carry, the blood transports: together they are the circulatory system."),
    ck("What is the difference between a tissue and an organ?", "A tissue is similar cells; an organ is different tissues together", ["They are the same thing", "Organs are smaller than tissues", "Tissues are only in plants"], "Similar cells make tissues; different tissues make organs."),
  ],
});

/* ================= Day 7: the skeleton and its jobs (statement 6) ================= */
const BONES = [["skull", "skull", "protects the brain"], ["jaw", "jaw (mandible)", "lets you chew"], ["clavicle", "collarbone (clavicle)", "joins the arm to the body"], ["ribs", "ribs", "protect the heart and lungs"], ["sternum", "breastbone (sternum)", "joins the ribs at the front"], ["spine", "spine (backbone)", "holds you up and protects the spinal cord"], ["humerus", "humerus", "the upper arm bone"], ["radius", "radius", "a lower arm bone (thumb side)"], ["ulna", "ulna", "a lower arm bone (little finger side)"], ["pelvis", "pelvis", "the hip bone"], ["femur", "femur", "the thigh bone, the longest bone"], ["patella", "kneecap (patella)", "protects the knee joint"], ["tibia", "tibia", "the shin bone"], ["fibula", "fibula", "the thin lower leg bone"]];
const BWORD = { skull: ["skull", "cranium"], jaw: ["jaw", "mandible"], clavicle: ["clavicle", "collarbone", "collar bone"], ribs: ["ribs", "rib", "ribcage", "rib cage"], sternum: ["sternum", "breastbone", "breast bone"], spine: ["spine", "backbone", "vertebrae", "vertebral column"], humerus: ["humerus"], radius: ["radius"], ulna: ["ulna"], pelvis: ["pelvis", "hip bone"], femur: ["femur", "thigh bone"], patella: ["patella", "kneecap", "knee cap"], tibia: ["tibia", "shin bone"], fibula: ["fibula"] };
const JOBS4 = ["Support", "Protection", "Movement", "Making blood cells"];
STEPS.push({ id: 7, title: "The skeleton and its four jobs", short: "Skeleton",
  learn: [
    { t: "show", h: "Your skeleton", b: `<p>An adult has <b>206 bones</b>. Babies are born with about 300, and some join together as they grow.</p>`, v: () => skeleton({ labels: true }) },
    { t: "show", h: "Four jobs", b: `<p>Your skeleton does four jobs:</p><p>🏗️ <b>Support</b>: holds you up and gives you shape.</p><p>🛡️ <b>Protection</b>: surrounds soft organs.</p><p>🏃 <b>Movement</b>: muscles pull on bones.</p><p>🩸 <b>Making blood cells</b>: in the bone marrow.</p>`, rule: "Support, Protect, Move, Make blood." },
    { t: "show", h: "Support", b: `<p>Without bones you'd be a floppy heap! The skeleton is a frame. Your muscles and organs hang on it, and the spine and leg bones carry your weight.</p>`, v: () => emojiPic("🏗️") },
    { t: "show", h: "Movement and joints", b: `<p>Bones meet at <b>joints</b>. Muscles pull on bones to move them at the joints.</p><p><b>Ligaments</b> are strong bands that hold the bones together at a joint.</p><p>The knee and elbow are <b>hinge</b> joints (they bend one way). The hip and shoulder are <b>ball and socket</b> joints (they move in many directions).</p>`, rule: "Joint = where bones meet. Ligaments hold them together." },
    { t: "try", h: "Your turn", q: { ask: "Which is the longest bone in the body?", choices: ["Femur (thigh bone)", "Skull", "Radius"], ans: 0, why: "The femur, in your thigh, is the longest and strongest bone." } },
    { t: "try", h: "Your turn", q: { ask: "Which is NOT a job of the skeleton?", choices: ["Digesting food", "Protection", "Support"], ans: 0, why: "The four jobs are support, protection, movement and making blood cells. Digesting food is the digestive system's job." } },
  ],
  gen: [
    () => { const [k, n, j] = pick(BONES); return Q(`Tap the <b>${n}</b>.`, { tap: { pic: () => skeleton(), ans: k, name: n } }, `The ${n}: ${j}.`, j[0].toUpperCase() + j.slice(1) + "."); },
    () => { const [k, n, j] = pick(BONES.filter(b => !["sternum", "clavicle", "jaw"].includes(b[0]) || Math.random() < 0.4)); return Q("What is the bone marked <b>?</b> called? Type its name.", W(...BWORD[k]), `That's the ${n}: ${j}.`, `It ${j.startsWith("the") ? "is " + j : j}.`, () => skeleton({ mark: k })); },
    () => { const pickJ = pickN([0, 1, 2, 3], 4); const items = [["Support", 0], ["Protection", 0], ["Movement", 0], ["Making blood cells", 0], ["Digesting food", 1], ["Pumping blood", 1]]; return Q("Which of these are jobs of the skeleton?", { sort: { bins: ["Skeleton job", "Not a skeleton job"], items: pickN(items, 5) } }, "The four jobs are support, protection, movement and making blood cells.", "Support, Protect, Move, Make blood."); },
    () => pick([
      () => Q("What holds bones together at a joint?", C("Ligaments", "Tendons", "Cartilage", "Muscles"), "Ligaments join bone to bone. (Tendons join muscle to bone: that's coming in Muscle Mountain.)", "Ligaments link bone to bone."),
      () => Q("How many bones does an adult have?", C("206", "300", "106", "50"), "Adults have 206. Babies have about 300, and some fuse together as they grow.", "It's just over 200."),
      () => Q("Which joint is a hinge joint, bending only one way?", C(pick(["Knee", "Elbow"]), "Hip", "Shoulder"), "Knees and elbows are hinge joints. Hips and shoulders are ball and socket joints.", "Think of a door hinge."),
      () => Q("Which joint can move in many directions?", C(pick(["Shoulder", "Hip"]), "Knee", "Elbow"), "Ball and socket joints, like the shoulder and hip, swing in many directions.", "Swing your arm in a circle."),
      () => Q("Which bone protects the brain?", C("Skull", "Ribs", "Pelvis", "Femur"), "The skull is a hard case around the brain.", "It's in your head."),
    ])(),
  ],
  checks: [
    ck("Why is the femur so big and strong?", "It supports the body's weight and moves the leg", ["It protects the heart", "It makes all the blood", "It has to be light"], "Your thigh bones carry your whole weight when you stand, walk and jump."),
    ck("Why do we need joints?", "Without them, bones couldn't move against each other", ["Joints make blood", "Joints protect the brain", "To make bones longer"], "A skeleton with no joints would be one stiff piece."),
    ck("Why does a jellyfish not need a skeleton the way we do?", "The water supports its body", ["Jellyfish don't move", "Jellyfish are not alive", "Jellyfish have 206 bones"], "Water holds a jellyfish up. On land we need bones for support."),
    ck("What would happen without a skeleton?", "We'd have no support, no protection and couldn't move", ["Nothing would change", "We'd move faster", "We'd be taller"], "Bones support us, protect our organs and give muscles something to pull on."),
    ck("Why are babies born with more bones than adults?", "Some bones join together as a child grows", ["Adults lose bones", "Babies are bigger", "They break in half"], "About 300 at birth, 206 by adulthood, because some fuse together."),
  ],
});

/* ================= Day 8: how the skeleton protects the body (statement 9) ================= */
const PROT = [["brain", "skull"], ["heart", "ribcage"], ["lungs", "ribcage"], ["spinal cord", "spine (vertebrae)"]];
STEPS.push({ id: 8, title: "Body armour: how the skeleton protects us", short: "Protection",
  learn: [
    { t: "show", h: "Bones as armour", b: `<p>Some of your most delicate organs are wrapped in bone, like a knight in armour.</p>`, v: () => protectPic({ labels: true }) },
    { t: "show", h: "Skull: a helmet for the brain", b: `<p>The <b>skull</b> is a hard case of bones fused (joined) together. It protects the <b>brain</b>, which is soft and controls your whole body. The face bones also shield the eyes.</p>`, v: () => protectPic({ mark: "skull" }), rule: "Skull protects the brain." },
    { t: "show", h: "Ribcage: a cage for the heart and lungs", b: `<p>There are <b>12 pairs of ribs</b>, joined to the spine at the back and the sternum at the front. They protect the <b>heart</b> and <b>lungs</b>.</p><p>The ribcage can <b>move</b>: it rises and falls when you breathe, so your lungs can fill up. A solid box couldn't do that.</p>`, v: () => protectPic({ mark: "ribs" }), rule: "Ribcage protects heart and lungs, and moves for breathing." },
    { t: "show", h: "Spine: a tunnel for the spinal cord", b: `<p>The bones of the spine (<b>vertebrae</b>) protect the <b>spinal cord</b>, the bundle of nerves carrying messages between your brain and body.</p><p>The <b>pelvis</b> also helps protect organs low in your belly, like the bladder.</p>`, v: () => protectPic({ mark: "cord" }), rule: "Vertebrae protect the spinal cord." },
    { t: "show", h: "Hard and curved", b: `<p>Curved bones like the skull and ribs spread the force of a hit over a wider area, like a helmet does.</p>`, v: () => emojiPic("⛑️ 🛡️") },
    { t: "try", h: "Your turn", q: { ask: "Which organs does the ribcage protect?", choices: ["Heart and lungs", "Brain", "Stomach and legs"], ans: 0, why: "The ribs surround the heart and lungs in your chest." } },
  ],
  gen: [
    () => { const items = pickN(PROT, 3).map(([o, b]) => [o, b === "skull" ? 0 : b === "ribcage" ? 1 : 2]); return Q("Which bone protects each organ?", { sort: { bins: ["Skull", "Ribcage", "Spine"], items: [...items, ...(items.length < 4 ? [] : [])] } }, "Skull → brain. Ribcage → heart and lungs. Spine (vertebrae) → spinal cord.", "Skull for the brain, ribs for the chest, spine for the cord."); },
    () => { const [o, b] = pick(PROT); return Q(`Which bone protects the <b>${o}</b>?`, C(b, ...["skull", "ribcage", "spine (vertebrae)", "femur", "pelvis"].filter(x => x !== b).slice(0, 3)), `The ${b} protects the ${o}.`, "Where is that organ in your body?"); },
    () => { const k = pick(["brain", "heart", "lungs", "skull", "ribs", "cord"]); const nm = { brain: "brain", heart: "heart", lungs: "lungs", skull: "skull", ribs: "ribcage", cord: "spinal cord" }[k]; return Q(`Tap the <b>${nm}</b>.`, { tap: { pic: () => protectPic(), ans: k, name: nm } }, { brain: "The brain sits inside the skull.", heart: "The heart sits inside the ribcage.", lungs: "The lungs fill the ribcage.", skull: "The skull wraps round the brain.", ribs: "The ribs curve round the heart and lungs.", cord: "The spinal cord runs inside the backbone." }[k], "Look for the organ inside its bony armour."); },
    () => pick([
      () => Q("Why do cyclists wear helmets even though they have a skull?", C("For extra protection against a big force", "Because the skull is soft", "To keep their hair tidy"), "The skull protects against everyday knocks. A crash is a much bigger force, so a helmet adds protection.", "Think about how hard a crash is."),
      () => Q("How many pairs of ribs do humans have?", C("12", "6", "24", "206"), "12 pairs, so 24 ribs in total.", "Twelve pairs."),
      () => Q("What does the spine protect?", C("The spinal cord", "The heart", "The stomach", "The brain"), "The vertebrae form a tunnel around the spinal cord.", "It runs down your back inside the bones."),
      () => Q("Type the word: the bony case that protects the brain is the ___.", W("skull", "cranium"), "The skull protects the brain.", "Five letters, starts with s."),
    ])(),
  ],
  checks: [
    ck("Why is the ribcage made of separate ribs, not one solid plate?", "So it can move when we breathe", ["Solid bone is too heavy to grow", "So food can pass through", "To let light in"], "The ribs rise and fall so the lungs can fill with air."),
    ck("Why is the brain protected by bone all the way round?", "It is soft and controls the whole body", ["It is the heaviest organ", "It makes blood", "It's the easiest organ to replace"], "Damage to the brain can affect everything, so it gets a full helmet."),
    ck("Why does the spinal cord need protection?", "Damage can stop messages travelling between the brain and the body", ["It pumps blood", "It digests food", "It makes the bones grow"], "The spinal cord carries messages. If it's damaged, parts of the body may not move or feel."),
    ck("Why are the skull and ribs curved?", "Curves spread the force of a hit over a bigger area", ["Curves look nicer", "To make them lighter than air", "So they can bend like rubber"], "Like a helmet, a curved shape spreads out the force. Shape fits the job!"),
    ck("Why are the heart and lungs protected by the same bones?", "They sit together in the chest, inside the ribcage", ["They are the same organ", "The ribs make them work", "The skull is too small"], "Both are in the chest, so the ribcage protects both."),
  ],
});

/* ================= Day 9: how blood is produced (statement 10) ================= */
STEPS.push({ id: 9, title: "The blood factory: bone marrow", short: "Bone marrow",
  learn: [
    { t: "show", h: "Bone is alive", b: `<p>Bones aren't just dry sticks. Living bone has its own <b>blood supply</b> and living cells, and it can <b>repair</b> itself when it breaks.</p>`, v: () => bonePic() },
    { t: "show", h: "Inside a bone", b: `<p>The outside is hard <b>compact bone</b>. Inside the ends is <b>spongy bone</b>, full of holes. In adults the hollow middle of long bones is filled with <b>yellow marrow</b>, which is mostly fat.</p>`, v: () => bonePic({ labels: true }) },
    { t: "show", h: "Red marrow: the blood factory 🏭", b: `<p><b>Red bone marrow</b>, in the spongy bone, makes new blood cells. In adults it's mostly in flat bones and the ends of long bones: the hips, ribs, sternum, spine, skull, and the ends of the femur and humerus.</p>`, v: () => bonePic({ mark: "red" }), rule: "Red bone marrow makes blood cells." },
    { t: "show", h: "What it makes", b: `<p>🔴 <b>Red blood cells</b> carry oxygen.</p><p>⚪ <b>White blood cells</b> fight infection.</p><p>🟠 <b>Platelets</b> help blood clot, to seal a cut.</p>`, v: () => bloodPic({ labels: true }) },
    { t: "show", h: "Why so many?", b: `<p>A red blood cell only lives about <b>120 days</b> (4 months), so your marrow makes <b>millions every second</b> to replace the old ones.</p>`, rule: "Old cells wear out, so marrow keeps making new ones." },
    { t: "try", h: "Your turn", q: { ask: "Where are blood cells made?", choices: ["In the red bone marrow", "In the heart", "In the lungs"], ans: 0, why: "The heart pumps blood, but bone marrow makes the cells." } },
  ],
  gen: [
    () => pick([
      () => Q("Where are new blood cells made?", C("In the red bone marrow", "In the heart", "In the lungs", "In the stomach"), "Red bone marrow, inside spongy bone, is the blood factory.", "It's inside bones."),
      () => Q("Type the words: blood cells are made in the bone ___.", W("marrow", "bone marrow", "red bone marrow", "red marrow"), "Red bone marrow makes blood cells.", "It starts with m."),
      () => Q("Which kind of bone marrow makes blood cells?", C("Red marrow", "Yellow marrow"), "Red marrow makes blood. Yellow marrow is mostly fat.", "Red for blood."),
    ])(),
    () => { const items = pickN([["Carries oxygen", 0], ["Fights infection", 1], ["Helps blood clot", 2], ["Kills germs", 1], ["Seals a cut", 2], ["Has no nucleus, lots of room for oxygen", 0]], 4); return Q("Match each job to the part of the blood.", { sort: { bins: ["Red cells", "White cells", "Platelets"], items } }, "Red cells carry oxygen, white cells fight infection, platelets help blood clot.", "Red = oxygen, white = fight germs, platelets = plug a cut."); },
    () => { const k = pick(["red", "yellow", "compact"]); const nm = { red: "red bone marrow", yellow: "yellow bone marrow", compact: "hard (compact) bone" }[k]; return Q(`Tap the <b>${nm}</b>.`, { tap: { pic: () => bonePic(), ans: k, name: nm } }, { red: "Red marrow is in the spongy ends of the bone.", yellow: "Yellow marrow fills the hollow middle.", compact: "Compact bone is the hard outer layer." }[k], { red: "It's in the ends, speckled with red.", yellow: "It's in the hollow middle.", compact: "It's the hard outside." }[k]); },
    () => { const k = pick(["red", "white", "platelet"]); const nm = { red: "red blood cell", white: "white blood cell", platelet: "platelet" }[k]; return Q(`Tap a <b>${nm}</b>.`, { tap: { pic: () => bloodPic(), ans: k, name: nm } }, { red: "Red blood cells are red discs. They carry oxygen.", white: "White blood cells are bigger, with a purple nucleus. They fight infection.", platelet: "Platelets are tiny bits that help blood clot." }[k], { red: "Small red discs.", white: "The big pale one.", platelet: "The tiny orange bits." }[k]); },
    () => Q("About how long does a red blood cell live?", C("About 120 days", "About 1 day", "About 50 years", "Forever"), "About 120 days, so the marrow keeps making new ones.", "About 4 months."),
  ],
  checks: [
    ck("Why must the body keep making red blood cells?", "Old ones wear out after about 120 days", ["They get used up as food", "The heart eats them", "They turn into bones"], "Red cells only last about 4 months, so millions are made every second."),
    ck("Why might damage to bone marrow make someone ill more often?", "Fewer white blood cells are made to fight infection", ["Their bones get longer", "They can't breathe", "Their heart stops"], "White blood cells fight germs, and they come from the marrow."),
    ck("Why is making blood counted as a job of the skeleton?", "The marrow that makes blood is inside bones", ["Bones are red", "Blood flows through joints", "The skull pumps blood"], "The blood factory sits inside your bones."),
    ck("Why do we need platelets?", "They help blood clot to seal a cut", ["They carry oxygen", "They make bones hard", "They digest food"], "Without platelets, a small cut would keep bleeding."),
    ck("The heart pumps blood. Does it make blood cells?", "No, red bone marrow makes them", ["Yes, all of them", "Only white cells", "Only platelets"], "The heart moves blood around. The marrow makes the cells."),
  ],
});

/* ================= Day 10: muscles, bones and tendons (statement 7) ================= */
STEPS.push({ id: 10, title: "How muscles and bones make movement", short: "Muscles and tendons",
  learn: [
    { t: "show", h: "Muscles can only pull", b: `<p>A muscle makes things move by <b>contracting</b>: it gets <b>shorter and fatter</b> and pulls.</p><p>A muscle can <b>never push</b>.</p>`, v: () => armPic({ bent: true, labels: true }), rule: "Muscles pull. They never push." },
    { t: "show", h: "Tendons: the ropes", b: `<p><b>Tendons</b> are tough cords that attach <b>muscles to bones</b>. They don't stretch, so when a muscle contracts, the tendon pulls the bone.</p>`, v: () => armPic({ mark: "tendon" }), rule: "Tendon = muscle to bone." },
    { t: "show", h: "Ligaments are different", b: `<p><b>Ligaments</b> join <b>bone to bone</b> at a joint.</p><p>Memory trick: <b>T</b>endon = muscle <b>T</b>o bone. <b>L</b>igament = <b>L</b>inks bone to bone.</p>` },
    { t: "show", h: "Joints are pivots", b: `<p>The bone moves around the joint, like a door swinging on its hinge. The <b>biceps</b> is attached by tendons to the shoulder blade and to the <b>radius</b> in the forearm. When it contracts, it pulls the forearm up and the elbow bends.</p>`, v: () => armPic({ bent: true, mark: "joint" }) },
    { t: "tool", h: "Try it", b: `<p>Make the biceps contract and watch the forearm move.</p>`, tool: () => ArmTool() },
    { t: "show", h: "Relaxing", b: `<p>When a muscle <b>relaxes</b> it stops pulling. It doesn't push. It can then be stretched back to its long shape.</p><p>Bones give a firm frame, muscles pull, tendons pass the pull on, and joints let it happen.</p>`, rule: "Bones + muscles + tendons + joints = movement." },
    { t: "try", h: "Your turn", q: { ask: "What attaches a muscle to a bone?", choices: ["A tendon", "A ligament", "A joint"], ans: 0, why: "Tendon = muscle To bone." } },
  ],
  gen: [
    () => pick([
      () => Q("What attaches a muscle to a bone?", C("Tendon", "Ligament", "Cartilage", "Marrow"), "Tendons attach muscles to bones. Ligaments join bone to bone.", "Tendon = muscle To bone."),
      () => Q("What joins bone to bone at a joint?", C("Ligament", "Tendon", "Muscle", "Marrow"), "Ligaments link bone to bone.", "Ligament = Links bone to bone."),
      () => Q("Type the word: the tough cord joining a muscle to a bone is a ___.", W("tendon"), "That's a tendon.", "It starts with t."),
    ])(),
    () => pick([
      () => Q("When a muscle contracts, it gets…", C("Shorter and fatter", "Longer and thinner", "Harder and colder"), "Contracting means shortening, which pulls on the tendon and bone.", "Contract = shorten."),
      () => Q("Can a muscle push a bone?", C("No, muscles can only pull", "Yes, always", "Only leg muscles can push"), "Muscles can only pull. That's why they work in pairs.", "Think about a rope."),
      () => Q("When a muscle relaxes, what happens?", C("It stops pulling and can be stretched back", "It pushes the bone", "It gets shorter"), "Relaxing means it stops pulling. Another muscle stretches it back.", "Relax = stop pulling."),
    ])(),
    () => { const k = pick(["biceps", "triceps", "tendon", "humerus", "joint", "radius"]); const nm = { biceps: "biceps", triceps: "triceps", tendon: "tendon", humerus: "humerus", joint: "elbow joint", radius: "radius" }[k]; return Q(`Tap the <b>${nm}</b>.`, { tap: { pic: () => armPic({ bent: Math.random() < 0.5 }), ans: k, name: nm } }, { biceps: "The biceps is on the front of the upper arm.", triceps: "The triceps is on the back of the upper arm.", tendon: "Tendons are the white cords at the ends of the muscles.", humerus: "The humerus is the upper arm bone.", joint: "The elbow joint is where the upper and lower arm meet.", radius: "The radius is a forearm bone." }[k], { biceps: "Front of the upper arm.", triceps: "Back of the upper arm.", tendon: "The white cords.", humerus: "The bone in the upper arm.", joint: "Where the arm bends.", radius: "A bone in the forearm." }[k]); },
    () => Q("Put the steps of bending your arm in order.", { order: ["The biceps contracts", "The biceps pulls on its tendon", "The tendon pulls the radius", "The forearm moves up at the elbow joint"] }, "Muscle contracts → pulls tendon → tendon pulls bone → bone moves at the joint.", "Start with the muscle."),
  ],
  checks: [
    ck("Why must tendons not stretch?", "Otherwise the pull would be lost and the bone wouldn't move", ["So they can grow", "Stretchy tendons would break the bone", "To store energy"], "A stretchy rope wouldn't pass on a pull. Tendons must be tough and strong."),
    ck("Why does a torn tendon stop a joint moving?", "The muscle can no longer pull on the bone", ["The bone breaks too", "The joint fills with blood", "The muscle starts pushing"], "Without the tendon, the muscle's pull never reaches the bone."),
    ck("Why do we need both bones and muscles to move?", "Muscles pull, but they need firm bones to pull on", ["Bones move by themselves", "Muscles push bones", "Only muscles are needed"], "Like a rope and a lever: the muscle pulls, the bone moves."),
    ck("What's the difference between a tendon and a ligament?", "Tendons join muscle to bone; ligaments join bone to bone", ["They are the same", "Ligaments join muscle to bone", "Tendons make blood"], "Tendon = muscle To bone. Ligament = Links bone to bone."),
    ck("Why is a joint needed for the arm to bend?", "The bones need a pivot to move around", ["Joints make the muscles", "Joints hold blood", "Joints push the arm"], "The forearm swings at the elbow joint, like a door on a hinge."),
  ],
});

/* ================= Day 11: antagonistic muscle pairs (statement 8) ================= */
STEPS.push({ id: 11, title: "Antagonistic muscle pairs", short: "Muscle pairs",
  learn: [
    { t: "show", h: "A problem", b: `<p>Muscles can only <b>pull</b>. The biceps pulls your arm up. So how does your arm straighten again?</p>`, v: () => armPic({ bent: true }) },
    { t: "show", h: "Muscles work in pairs", b: `<p>Muscles work in <b>pairs</b> that pull in <b>opposite directions</b>. This is called an <b>antagonistic pair</b>. (Antagonistic means working against each other.)</p><p>The biceps and triceps are an antagonistic pair.</p>`, v: () => armPic({ labels: true }), rule: "Antagonistic pair: two muscles pulling opposite ways." },
    { t: "show", h: "Bending the arm", b: `<p><b>Biceps contracts</b> (shortens and pulls). <b>Triceps relaxes</b>. The arm bends.</p>`, v: () => armPic({ bent: true, bCol: "#d32f2f", tCol: "#ef9a9a" }) },
    { t: "show", h: "Straightening the arm", b: `<p><b>Triceps contracts</b>. <b>Biceps relaxes</b>. The arm straightens.</p>`, v: () => armPic({ bent: false, tCol: "#d32f2f", bCol: "#ef9a9a" }), rule: "One pulls, the other relaxes. They take turns." },
    { t: "tool", h: "Try it", b: `<p>Contract each muscle in turn. What happens if both pull at once?</p>`, tool: () => ArmTool() },
    { t: "show", h: "Other pairs", b: `<p>In your thigh, the <b>hamstrings</b> (back) and <b>quadriceps</b> (front) are an antagonistic pair. They bend and straighten the knee.</p>` },
    { t: "try", h: "Your turn", q: { ask: "To straighten your arm, which muscle contracts?", choices: ["Triceps", "Biceps", "Both"], ans: 0, why: "The triceps pulls the arm straight while the biceps relaxes." } },
  ],
  gen: [
    () => { const bend = Math.random() < 0.5, which = Math.random() < 0.5 ? "contracts" : "relaxes"; const ans = bend === (which === "contracts") ? "Biceps" : "Triceps";
      return { q: `To <b>${bend ? "bend" : "straighten"}</b> the arm, which muscle <b>${which}</b>?`, v: () => armPic({ bent: bend }), steps: [{ p: `Which muscle pulls the arm ${bend ? "up (bends it)" : "straight"}?`, a: C(bend ? "Biceps" : "Triceps", bend ? "Triceps" : "Biceps"), hint: "Biceps on the front bends. Triceps on the back straightens." }], final: { p: `Which ${which}?`, a: C(ans, ans === "Biceps" ? "Triceps" : "Biceps", "Both") }, why: bend ? "Bending: biceps contracts, triceps relaxes." : "Straightening: triceps contracts, biceps relaxes." }; },
    () => pick([
      () => Q("Name an antagonistic pair of muscles.", C(pick(["Biceps and triceps", "Hamstrings and quadriceps"]), "Heart and lungs", "Skull and ribs", "Tendons and ligaments"), "Biceps and triceps (arm) and hamstrings and quadriceps (thigh) pull in opposite directions.", "Two muscles that pull opposite ways."),
      () => Q("Type the words: two muscles that pull in opposite directions are called an ___ pair.", W("antagonistic", "antagonistic pair"), "An antagonistic pair.", "It starts with 'antag'."),
      () => Q("What does <b>antagonistic</b> mean?", C("Working against each other, in opposite directions", "Working at the same time", "Very strong"), "The two muscles pull opposite ways, taking turns.", "Think 'opposite'."),
    ])(),
    () => Q("Spot the mistake: <i>\"The triceps pushes the arm straight.\"</i>", C("Muscles can't push: the triceps pulls the arm straight", "It's the biceps that pushes", "Nothing is wrong"), "Muscles only pull. The triceps pulls on the back of the elbow to straighten the arm.", "Can a muscle ever push?"),
    () => { const items = pickN([["Biceps when you bend your arm", 0], ["Triceps when you bend your arm", 1], ["Triceps when you straighten your arm", 0], ["Biceps when you straighten your arm", 1]], 4); return Q("Does each muscle contract or relax?", { sort: { bins: ["Contracts", "Relaxes"], items } }, "Bend: biceps contracts, triceps relaxes. Straighten: triceps contracts, biceps relaxes.", "The muscle that pulls the way the arm moves is the one contracting."); },
  ],
  checks: [
    ck("Why are muscles found in pairs?", "Each can only pull, so a second muscle pulls the other way", ["To look the same on both sides", "One is a spare", "Pairs are stronger at pushing"], "One muscle bends the joint, its partner straightens it."),
    ck("Why must one muscle relax when the other contracts?", "Otherwise they pull against each other and nothing moves", ["To save the tendon", "Relaxing makes it push", "So the bone can grow"], "If both pull, it's a tug of war: the arm locks."),
    ck("Why is the word 'antagonistic' used for muscle pairs?", "The two muscles work against each other, in opposite directions", ["They always fight", "They are the strongest muscles", "They are in the brain"], "Antagonistic means opposing: they pull opposite ways."),
    ck("Your arm is bent. Which muscle must contract to straighten it?", "Triceps", ["Biceps", "Both at once", "Neither"], "The triceps, on the back, pulls the arm straight."),
    ck("The quadriceps contracts to straighten the knee. What does the hamstring do?", "Relaxes", ["Contracts too", "Pushes the knee", "Turns into a tendon"], "They're an antagonistic pair: when one contracts, the other relaxes."),
  ],
});

/* ================= Day 12: lifestyle and injury (statement 11) ================= */
const INJ = [["A ligament is stretched or torn at a joint, like the ankle", "Sprain"], ["A muscle or tendon is overstretched or torn", "Strain"], ["A bone is broken", "Fracture"], ["A bone is pushed out of its joint", "Dislocation"], ["Bones become weak and brittle, often in older people", "Osteoporosis"]];
const GOODBAD = [["Running and jumping", 0], ["Drinking milk (calcium)", 0], ["Sunlight (vitamin D)", 0], ["Eating protein", 0], ["Smoking", 1], ["Never exercising", 1], ["Lots of alcohol", 1], ["Not warming up before sport", 1]];
STEPS.push({ id: 12, title: "How lifestyle and injury affect bones and muscles", short: "Lifestyle and injury",
  learn: [
    { t: "show", h: "Exercise", b: `<p><b>Weight-bearing exercise</b> (running, jumping, dancing) makes bones <b>denser and stronger</b>. Regular exercise makes muscles bigger and stronger.</p><p>No exercise does the opposite: bones lose density and muscles get weaker and smaller.</p>`, v: () => emojiPic("🏃 ⚽ 🤸"), rule: "Use it or lose it." },
    { t: "show", h: "Diet", b: `<p>🥛 <b>Calcium</b> (milk, cheese, leafy greens) builds strong bones.</p><p>☀️ <b>Vitamin D</b> (sunlight, eggs, oily fish) helps the body use calcium.</p><p>🍗 <b>Protein</b> helps muscles grow and repair.</p>`, rule: "Calcium + vitamin D for bones, protein for muscles." },
    { t: "show", h: "Things that harm", b: `<p>🚬 <b>Smoking</b> and 🍺 <b>too much alcohol</b> both weaken bones and slow healing.</p>` },
    { t: "show", h: "Injuries", b: `<table class="sci-t"><tr><th>Injury</th><th>What happens</th></tr><tr><td><b>Fracture</b></td><td>A broken bone. A cast holds it still so new bone can grow and rejoin it.</td></tr><tr><td><b>Sprain</b></td><td>A <b>ligament</b> is stretched or torn at a joint, like an ankle.</td></tr><tr><td><b>Strain</b></td><td>A <b>muscle or tendon</b> is overstretched or torn: a "pulled muscle".</td></tr><tr><td><b>Dislocation</b></td><td>A bone is pushed out of its joint.</td></tr></table>`, rule: "Sprain = ligament. Strain = muscle or tendon." },
    { t: "show", h: "Osteoporosis", b: `<p><b>Osteoporosis</b> makes bones weak and brittle, so they break more easily. It's more common in older people. Calcium, vitamin D and exercise help prevent it.</p>` },
    { t: "show", h: "Staying safe", b: `<p>Warm up and stretch, wear protective gear, and use the right technique.</p><p>To explain an effect, say three things: the <b>factor</b>, what it <b>does</b>, and <b>why</b>.</p>`, rule: "Factor → effect → why." },
    { t: "try", h: "Your turn", q: { ask: "A ligament in the ankle is stretched and torn. This is a…", choices: ["Sprain", "Strain", "Fracture"], ans: 0, why: "Sprain = ligament. Strain = muscle or tendon." } },
  ],
  gen: [
    () => { const [d, n] = pick(INJ); return Q(`Which injury is this? <i>${d}.</i>`, C(n, ...pickN(INJ.filter(x => x[1] !== n).map(x => x[1]), 3)), `${n}: ${d.toLowerCase()}.`, "Sprain = ligament, strain = muscle or tendon, fracture = broken bone."); },
    () => Q("Sort these: good or bad for your bones and muscles?", { sort: { bins: ["Good", "Bad"], items: pickN(GOODBAD, 5) } }, "Exercise, calcium, vitamin D and protein help. Smoking, alcohol, no exercise and skipping warm-ups harm.", "Would a sports coach recommend it?"),
    () => pick([
      () => Q("Which nutrient builds strong bones?", C("Calcium", "Sugar", "Fat", "Salt"), "Calcium, found in milk, cheese and leafy greens.", "It's in milk."),
      () => Q("Which vitamin helps your body use calcium?", C("Vitamin D", "Vitamin C", "Vitamin A"), "Vitamin D, which your skin makes in sunlight.", "The sunshine vitamin."),
      () => Q("What does weight-bearing exercise do to bones?", C("Makes them denser and stronger", "Makes them weaker", "Makes them longer"), "Bones respond to the load by getting denser.", "Use it or lose it."),
      () => Q("Why is a broken arm put in a cast?", C("To hold the bone still so it heals in the right place", "To keep it warm", "To make the arm stronger than before"), "New bone grows to rejoin the break. Keeping it still means it heals straight.", "What happens if the bone keeps moving?"),
    ])(),
    () => Q("Build the explanation: put it in order.", { order: shuffle([["Regular running", "puts load on the leg bones,", "so they become denser and stronger."], ["Not getting enough calcium", "means bones can't be built properly,", "so they become weak and break more easily."], ["Smoking", "weakens bones and slows healing,", "so fractures are more likely and take longer to mend."]])[0] }, "A full explanation: factor → what it does → why it matters.", "Start with the factor."),
  ],
  checks: [
    ck("Why does a broken arm go in a cast?", "To keep the bone still so it can heal in the right place", ["To stop germs", "To make it lighter", "To push the bone together"], "If the pieces move, the bone could heal crooked."),
    ck("Why do astronauts lose bone strength in space?", "Their bones carry no weight, like not exercising", ["Space is too cold", "They eat too much calcium", "Their muscles push too hard"], "With no gravity there's no load, so bones lose density."),
    ck("Why are older people more likely to break bones?", "Bones can become less dense and brittle (osteoporosis)", ["Their bones are longer", "They have more bones", "They have too much vitamin D"], "Osteoporosis makes bones weak, so a small fall can cause a fracture."),
    ck("Why does warming up help prevent strains?", "Warm muscles stretch more easily without tearing", ["It makes bones harder", "It stops sweating", "It makes tendons shorter"], "Cold, stiff muscles tear more easily."),
    ck("What's the difference between a sprain and a strain?", "A sprain hurts a ligament; a strain hurts a muscle or tendon", ["They are the same", "A sprain is a broken bone", "A strain is a dislocation"], "Sprain = ligament. Strain = muscle or tendon."),
    ck("Why does a lack of vitamin D affect bones, even if you eat calcium?", "Vitamin D helps the body use calcium", ["Vitamin D is a bone", "Vitamin D replaces calcium", "It doesn't affect bones"], "Without vitamin D, the calcium can't be used well to build bone."),
  ],
});

/* ================= Day 13: the pulse-rate investigation (Criterion B) ================= */
const VARS = [["Time spent exercising (minutes)", 0], ["Pulse rate (beats per minute)", 1], ["The same person each time", 2], ["The same type of exercise", 2], ["Resting before each test", 2], ["Measuring the pulse the same way", 2], ["Exercising at the same speed", 2]];
const HYPS = [["If I increase the time I exercise, then my pulse rate will increase, because my muscles need more oxygen, so my heart pumps faster.", true], ["Exercise is good for you.", false], ["My pulse might change.", false], ["Pulse rate is interesting to measure.", false], ["If I skip for longer, my pulse rate will go up, because my muscles need more oxygen for respiration.", true]];
STEPS.push({ id: 13, title: "Planning the pulse-rate investigation", short: "Pulse investigation",
  learn: [
    { t: "show", h: "Your pulse", b: `<p>Your <b>pulse rate</b> is how many times your heart beats in one minute, in <b>beats per minute (bpm)</b>.</p><p>Feel it on your wrist (below your thumb) or the side of your neck with <b>two fingers</b>. Not your thumb: it has its own pulse!</p>`, v: () => emojiPic("❤️ ⏱️") },
    { t: "tool", h: "Measure yours", b: `<p>Count the beats for 15 seconds, then multiply by 4.</p>`, tool: () => PulseTool() },
    { t: "show", h: "Measuring carefully", b: `<p>Count for 15 seconds and × 4, or count for a full minute.</p><p><b>Repeat</b> 3 times and find the <b>mean</b>: add them up and divide by 3. Repeats help you spot odd results and make it more reliable.</p>`, rule: "Repeat 3 times, then find the mean." },
    { t: "show", h: "The science behind it", b: `<p>When you exercise, your muscles need more <b>oxygen</b> and <b>glucose</b> for respiration. So your heart beats faster to deliver more blood.</p>` },
    { t: "show", h: "Variables", b: `<p>🔧 <b>Independent variable</b>: the thing <b>I change</b>. For example, the time spent exercising (0, 1, 2, 3 minutes).</p><p>📏 <b>Dependent variable</b>: the thing <b>I measure</b>: pulse rate in bpm.</p><p>🔒 <b>Control variables</b>: things I <b>keep the same</b> to make it a fair test: the same person, same exercise, same speed, same way of measuring, resting before each test.</p>`, rule: "Change one, measure one, keep the rest the same." },
    { t: "show", h: "A testable hypothesis", b: `<p>A good hypothesis names both variables, predicts which way it will go, and gives a <b>scientific reason</b>:</p><p><i>"If I increase the time I exercise, then my pulse rate will increase, because my muscles need more oxygen for respiration, so my heart pumps faster to deliver it."</i></p><p><b>Testable</b> means you can measure it. "Exercise is good for you" can't be tested in this investigation.</p>`, rule: "If I change ___, then ___ will ___, because ___." },
    { t: "try", h: "Your turn", b: `<p>You counted 20 beats in 15 seconds.</p>`, q: { ask: "Pulse rate in beats per minute =", a: { num: 80 }, why: "20 × 4 = 80 bpm." } },
  ],
  gen: [
    () => Q("Sort the variables for the pulse-rate investigation.", { sort: { bins: ["Independent (I change)", "Dependent (I measure)", "Control (keep the same)"], items: [VARS[0], VARS[1], ...pickN(VARS.slice(2), 3)] } }, "Change the time exercising, measure the pulse rate, keep everything else the same.", "Change one, measure one, keep the rest the same."),
    () => { const n = pick([15, 16, 17, 18, 19, 20, 21, 22, 24, 25, 28, 30]); return { q: `Oliver counted <b>${n}</b> beats in 15 seconds. What is his pulse rate in beats per minute?`, steps: [{ p: "How many 15-second chunks are in a minute?", a: { num: 4 }, hint: "60 ÷ 15." }], final: { p: "Pulse rate (bpm) =", a: { num: n * 4 } }, why: `${n} × 4 = ${n * 4} beats per minute.` }; },
    () => { const m = pick([68, 70, 72, 75, 80, 90, 96, 110, 120]), d = pick([2, 3, 4]); const a = m - d, b = m, c = m + d; return { q: `Three readings: <b>${a}</b>, <b>${b}</b> and <b>${c}</b> bpm. What is the mean?`, steps: [{ p: `Add them: ${a} + ${b} + ${c} =`, a: { num: a + b + c }, hint: "Add the first two, then the third." }], final: { p: "Mean (bpm) =", a: { num: m } }, why: `${a + b + c} ÷ 3 = ${m}.` }; },
    () => { const right = pick(HYPS.filter(x => x[1]))[0]; return Q("Which is a testable hypothesis?", C(right, ...HYPS.filter(x => !x[1]).map(x => x[0]).slice(0, 3)), "It says what changes, what will happen to the pulse, and why. You can measure it.", "Look for 'If… then… because…'."); },
    () => Q("Build the hypothesis: put the parts in order.", { order: ["If I exercise for longer,", "then my pulse rate", "will increase,", "because my muscles need more oxygen for respiration."] }, "If (what I change), then (what I measure) will (prediction), because (science).", "Start with 'If'."),
    () => pick([
      () => Q("In the investigation, what is the <b>dependent</b> variable?", C("Pulse rate", "Time spent exercising", "The type of exercise"), "The dependent variable is what you measure: the pulse rate.", "What do you measure?"),
      () => Q("In the investigation, what is the <b>independent</b> variable?", C("Time spent exercising", "Pulse rate", "The person"), "The independent variable is what you change on purpose.", "What do you change?"),
      () => Q("Why should you rest between tests?", C("So the pulse goes back to resting and each test starts the same", "To save time", "So you can drink water"), "Resting is a control: every test starts from the same pulse.", "Think fair test."),
    ])(),
  ],
  checks: [
    ck("Why rest between tests?", "So the pulse returns to resting and each test starts the same", ["So the heart can grow", "Because exercise is bad", "To change the independent variable"], "Starting from rest every time keeps it a fair test."),
    ck("Why repeat each measurement three times?", "To spot odd results and make the results more reliable", ["Because three is lucky", "To get tired", "To change the variable"], "One reading could be a mistake. The mean of three is more reliable."),
    ck("Why should only one variable be changed?", "Otherwise you can't tell which change caused the result", ["It's quicker", "Two variables can't be measured", "The teacher said so"], "If you change two things, you don't know which one made the pulse change."),
    ck("Why does a 'because' make a hypothesis stronger?", "It uses science to explain the prediction", ["It makes it longer", "It means you don't need to test it", "It changes the variable"], "The because shows you understand why: muscles need more oxygen for respiration."),
    ck("Why does your pulse rate go up when you exercise?", "Muscles need more oxygen and glucose, so the heart pumps faster", ["The heart gets bigger", "Exercise makes blood thicker", "The lungs stop working"], "More respiration in muscles needs more oxygen, delivered faster by the blood."),
    ck("Why count with two fingers and not your thumb?", "Your thumb has its own pulse, which could confuse your count", ["Thumbs are too big", "Fingers are warmer", "It's faster"], "You might count your own thumb's pulse by mistake."),
  ],
});

/* ================= scout reports (previews of what's coming in class) ================= */
export const PREVIEWS = {
  1: { title: "Coming up: how are we organised?", cards: [
    { t: "show", h: "Welcome to the science quest!", b: `<p>This unit asks: <b>how are living things organised?</b> From tiny cells to a whole human, you'll find out how each part's shape fits its job.</p>`, v: () => levelsPic() },
    { t: "show", h: "Tiny cities", b: `<p>Each cell is like a tiny city with a control centre, a gate, power stations and more. Plant cells even have solar farms!</p>`, v: () => plantCell() },
    { t: "show", h: "Then the body", b: `<p>Later you'll explore your skeleton, your muscles, and how they work together to move you.</p>`, v: () => emojiPic("🦴 💪") },
  ] },
  2: { title: "Coming up: bones and the body plan", cards: [
    { t: "show", h: "From cells to you", b: `<p>Cells team up into tissues, then organs, then organ systems. You'll put them in order.</p>`, v: () => levelsPic({ examples: true }) },
    { t: "show", h: "206 bones", b: `<p>Your skeleton holds you up, protects you, helps you move, and even makes your blood!</p>`, v: () => skeleton() },
  ] },
  3: { title: "Coming up: muscles and movement", cards: [
    { t: "show", h: "Muscles only pull", b: `<p>Here's a puzzle for later: if muscles can only pull, how do you straighten your arm again?</p>`, v: () => armPic({ bent: true }) },
    { t: "show", h: "Keeping your body strong", b: `<p>You'll also find out what makes bones and muscles strong, and what injuries like sprains and fractures are.</p>`, v: () => emojiPic("🥛 🏃 🩹") },
  ] },
  4: { title: "Coming up: your own investigation", cards: [
    { t: "show", h: "Be the scientist", b: `<p>You'll plan an investigation into how exercise changes your <b>pulse rate</b>: what to change, what to measure, and what to keep the same.</p>`, v: () => emojiPic("❤️ ⏱️ 📋") },
  ] },
};

export const FINAL_TOPICS = [2, 2, 3, 4, 4, 5, 5, 6, 7, 8, 9, 10, 11, 12, 13, 13];
export const BADGES = [
  { k: "sci2:l2", e: "🏙️", n: "Cell City Planner", d: "Master the parts of a cell" },
  { k: "sci2:l4", e: "🔬", n: "Microscope Master", d: "Master the microscope day" },
  { k: "sci2:l5", e: "💨", n: "Diffusion Detective", d: "Master diffusion" },
  { k: "sci2:w1", e: "🦠", n: "Blob Buster", d: "Beat the Blob King" },
  { k: "sci2:l7", e: "🦴", n: "Bone Expert", d: "Master the skeleton" },
  { k: "sci2:w2", e: "🛡️", n: "Body Guard", d: "Beat the Bone Breaker" },
  { k: "sci2:l11", e: "💪", n: "Muscle Mechanic", d: "Master antagonistic pairs" },
  { k: "sci2:w3", e: "⛰️", n: "Mountain Mover", d: "Beat the Cramp Colossus" },
  { k: "sci2:l13", e: "🧪", n: "Lab Scientist", d: "Master the pulse investigation" },
  { k: "sci2:final", e: "🧠", n: "Body Champion", d: "Beat the Great Germ" },
];
