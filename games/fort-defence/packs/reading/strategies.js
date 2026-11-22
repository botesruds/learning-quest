/* The Library tower's six reading strategies (shared by every subject pack).
   Each floor teaches one strategy: a lesson (I do: the Librarian thinks aloud, we do: with hints, you do: on his own),
   a toolkit card he can open from any reading question, and a few short practice texts so the floor's Challenge
   always has questions, even before many science days are open.
   Written from the content document "Library tower: reading strategies and science passages" (22 Nov 2026).

   A reading question (here and in each pack's dispatches):
     { s: strategy key, ask, choice: [right, wrong, wrong], clue: sentence index to point at after a miss, why }
     { s: "evidence", ask, key: "the key word", ans: [sentence indices that prove it], why }
     { s: "summarise", ask, order: [points in the text's order], why }
   Choices are written right answer first; the game shuffles them. A practice item also carries its own
   short text: { title, pic, text: [sentences], ...question }. */

export const STRATEGIES = [
  {
    n: 1, k: "predict", name: "Predict", icon: "🔮",
    does: "Use the title, picture and first line to guess what the text is about.",
    card: ["Read the title.", "Look at the picture.", "Read the first sentence.", "Guess: \"I think this is about…\"", "After reading, check: was I right?"],
    lesson: [
      { t: "show", h: "Why predict?", b: "<p>Good readers make a guess <b>before</b> they read. Your brain then reads to check the guess, which makes it easier to understand and remember.</p><p>A wrong guess is fine. The point is to <b>check</b>.</p>", rule: "Title + picture + first line = my guess." },
      { t: "show", h: "Watch the Librarian", b: "<p>📖 Title: <b>Why do onions make good slides?</b> 🔬</p><p><i>\"The title asks <b>why</b>, so the text will give reasons. The microscope tells me it's about looking at cells. I predict it explains why onion skin is easy to see through.\"</i></p>", rule: "\"The title asks… The picture shows… So I think…\"" },
      { t: "try", h: "We do: with a hint", b: "<p>📖 Title: <b>The longest bone in your body</b> 🦵</p><p>💡 Hint: look at the picture. Which part of the body is it?</p>", q: { ask: "What will this text be about?", choices: ["The femur, in the leg", "How to grow taller", "The bones in your hand"], ans: 0, why: "The title says longest bone and the picture is a leg, so it's about the thigh bone, the femur." } },
      { t: "try", h: "You do: on your own", b: "<p>📖 Title: <b>Pull, never push</b> 💪</p><p>First line: <i>Muscles move your bones, but they can only pull.</i></p>", q: { ask: "What will this text explain?", choices: ["How muscles move bones by pulling", "How to push a heavy door", "Why bones are hard"], ans: 0, why: "The title and first line are both about muscles pulling." } },
    ],
    practice: [
      { title: "Tiny power stations", pic: "⚡🦠", text: ["Mitochondria are tiny parts inside cells.", "They release energy from food in a process called respiration.", "Busy cells, like muscle cells, have lots of them."], ask: "Look at the title and picture. What will this text be about?", choice: ["Parts of a cell that release energy", "How power stations make electricity", "How to draw a cell"], why: "\"Power stations\" plus a cell picture: it's about the parts of a cell that release energy." },
      { title: "Guarding the brain", pic: "💀🧠", text: ["The brain is soft and easy to damage.", "The skull is a hard case of bone around it.", "It takes a big knock without the brain getting hurt."], ask: "What will this text explain?", choice: ["How the skull protects the brain", "How we think", "Why people wear hats"], why: "Guarding + skull + brain: it's about protection." },
      { title: "Spreading out", pic: "🌸👃", text: ["When you spray perfume, soon the whole room smells of it.", "The particles spread from where there are lots of them to where there are few.", "This is called diffusion."], ask: "What will this text be about?", choice: ["How particles spread out", "How to make perfume", "How noses work"], why: "Spreading out plus a smell spreading: it's about particles spreading, which is diffusion." },
      { title: "Cell walls and boxes", pic: "🟩🟩", text: ["Plant cells have a stiff cell wall.", "The wall gives them a regular box shape.", "Animal cells have no wall, so they are rounder."], ask: "What will this text compare?", choice: ["The shapes of plant and animal cells", "Different kinds of boxes", "How walls are built"], why: "Cell walls and boxes: it's about why plant cells are box-shaped." },
    ],
  },
  {
    n: 2, k: "clarify", name: "Clarify", icon: "🔦",
    does: "Work out a tricky word from the clues around it.",
    card: ["Stop at the word you don't know.", "Reread the sentence.", "Look for clues before and after it: a comma, \"which means\", \"or\", \"called\", an example.", "Try your meaning in the sentence. Does it make sense?"],
    lesson: [
      { t: "show", h: "Tricky words have clues", b: "<p>Science texts are full of new words. Often the text <b>explains the word right next to it</b>.</p><p>Clue signals: a comma after the word, <b>which means</b>, <b>or</b>, <b>called</b>, <b>such as</b>.</p>", rule: "Find the word, then hunt for its clue." },
      { t: "show", h: "Watch the Librarian", b: "<p><i>Muscles are attached to bones by <b>tendons</b>, tough cords that do not stretch.</i></p><p><i>\"The comma after tendons tells me the next words explain it. So a tendon is a tough cord.\"</i></p>", rule: "A comma after a new word often means: here's what it is." },
      { t: "try", h: "We do: with a hint", b: "<p><i>Particles move from an area of <b>high concentration</b>, where they are crowded together, to low concentration.</i></p><p>💡 Hint: read the words after the comma.</p>", q: { ask: "What does high concentration mean?", choices: ["Where particles are crowded together", "Where it is very hot", "Thinking very hard"], ans: 0, why: "The words after the comma explain it: where they are crowded together." } },
      { t: "try", h: "You do: on your own", b: "<p><i>The bones of the backbone are called <b>vertebrae</b>.</i></p>", q: { ask: "What are vertebrae?", choices: ["The bones of the backbone", "Muscles in the back", "Nerves"], ans: 0, why: "\"…are called vertebrae\": the sentence tells you vertebrae are the bones of the backbone." } },
    ],
    practice: [
      { title: "Making food", pic: "🌿☀️", text: ["Leaves have chloroplasts.", "They make food using light, a process called photosynthesis.", "That is why most leaves are green."], ask: "What is photosynthesis?", choice: ["Making food using light", "Taking a photo", "Breathing"], clue: 1, why: "\"…using light, a process called photosynthesis\": the clue is right before the word." },
      { title: "Bones meet", pic: "🦴🦴", text: ["Bones meet at joints.", "Strong bands called ligaments hold the bones together there.", "Without them, the bones would slip apart."], ask: "What are ligaments?", choice: ["Strong bands that hold bones together", "Muscles", "Blood cells"], clue: 1, why: "\"Strong bands called ligaments hold the bones together.\"" },
      { title: "Keeping firm", pic: "🌱💧", text: ["Plant cells have a large vacuole.", "It is full of sap, a watery liquid.", "When the vacuole is full, the cell stays firm."], ask: "What is sap?", choice: ["A watery liquid", "A kind of wall", "A green part"], clue: 1, why: "The words after the comma explain it: a watery liquid." },
      { title: "Looking closer", pic: "🔬", text: ["A microscope uses lenses to make tiny things look bigger.", "This is magnification: how many times bigger something looks.", "A ×10 lens makes things look ten times bigger."], ask: "What does magnification mean?", choice: ["How many times bigger something looks", "How bright the light is", "How heavy the lens is"], clue: 1, why: "The colon gives the meaning: how many times bigger something looks." },
    ],
  },
  {
    n: 3, k: "question", name: "Question", icon: "❓",
    does: "Ask who, what, why and how while reading, then read on for the answers.",
    card: ["Who or what is this about?", "What happens?", "Why does it happen?", "How does it work?", "Read on to find the answers."],
    lesson: [
      { t: "show", h: "Read like a detective", b: "<p>Good readers ask questions <b>while</b> they read. A question gives your brain a job: find the answer.</p><p>Useful starters: <b>Who? What? Why? How?</b></p>", rule: "Ask a question, then read on to answer it." },
      { t: "show", h: "Watch the Librarian", b: "<p><i>Red blood cells have no nucleus.</i></p><p><i>\"Why not? I'll keep reading to find out… Here it is: it leaves more room to carry oxygen. My question is answered.\"</i></p>", rule: "Why? → read on → found it." },
      { t: "try", h: "We do: with a hint", b: "<p><i>Muscles can only pull. So they work in pairs. When one contracts, the other relaxes.</i></p><p>💡 Hint: one question is answered, one isn't mentioned, and one is far too big.</p>", q: { ask: "Which question does this text answer?", choices: ["Why do muscles work in pairs?", "How many muscles do we have?", "How does the whole body work?"], ans: 0, why: "The text says muscles can only pull, SO they work in pairs. That answers why." } },
      { t: "try", h: "You do: on your own", b: "<p><i>Diffusion is faster when it is warmer, because the particles move faster.</i></p>", q: { ask: "Which question does this sentence answer?", choices: ["Why is diffusion faster when it's warm?", "What is a particle made of?", "Who discovered diffusion?"], ans: 0, why: "\"…because the particles move faster\" answers why." } },
    ],
    practice: [
      { title: "Root hairs", pic: "🌱", text: ["Root hair cells have a long thin part that pokes into the soil.", "This gives a big surface for soaking up water.", "They live underground, so they have no chloroplasts."], ask: "Which question does this text answer?", choice: ["Why do root hair cells have no chloroplasts?", "How tall do plants grow?", "Who studies plants?"], clue: 2, why: "\"They live underground, so they have no chloroplasts\" answers why." },
      { title: "Babies' bones", pic: "👶🦴", text: ["Babies are born with about 300 bones.", "As they grow, some bones join together.", "That is why adults have 206."], ask: "Which question does this text answer?", choice: ["Why do adults have fewer bones than babies?", "How heavy is a baby?", "What do bones eat?"], clue: 2, why: "Some bones join together as a child grows: that's why adults have fewer." },
      { title: "Helmets", pic: "🚴⛑️", text: ["The skull protects the brain.", "But a very big force can still hurt it.", "That is why cyclists wear helmets."], ask: "Which question does this text answer?", choice: ["Why do cyclists wear helmets?", "How fast can a bike go?", "What is a skull made of?"], clue: 2, why: "\"That is why cyclists wear helmets\" answers the why question." },
      { title: "Fair tests", pic: "⏱️❤️", text: ["In a fair test you change only one thing.", "You keep everything else the same.", "Then you know the change caused the result."], ask: "Which question does this text answer?", choice: ["Why change only one thing in a fair test?", "How fast does a heart beat?", "Who invented tests?"], clue: 2, why: "Then you know the change caused the result: that's why." },
    ],
  },
  {
    n: 4, k: "evidence", name: "Find the evidence", icon: "🔎",
    does: "Tap the sentence that proves an answer.",
    card: ["Read the question.", "Find its key word.", "Scan the text for that word, or one that means the same.", "Read that sentence carefully. Does it prove the answer?"],
    lesson: [
      { t: "show", h: "Prove it!", b: "<p>In tests, you often have to show <b>where</b> the text says something. That's evidence.</p><p>Find the question's <b>key word</b>, then scan the text for it.</p>", rule: "Key word → scan → read that sentence → does it prove it?" },
      { t: "show", h: "Watch the Librarian", b: "<p>Question: <i>What protects the brain?</i></p><p><i>\"My key word is <b>brain</b>. I scan… here: 'The skull is a hard case around the brain.' That proves it: the skull.\"</i></p>", rule: "The proof sentence contains the key word or one that means the same." },
      { t: "try", h: "We do: with a hint", b: "<p>1. Red blood cells are small discs. 2. They carry oxygen around the body. 3. White blood cells fight infection.</p><p>💡 Hint: the key word is <b>infection</b>.</p>", q: { ask: "Which sentence proves what white blood cells do?", choices: ["Sentence 3", "Sentence 1", "Sentence 2"], ans: 0, why: "Sentence 3 has the key words white blood cells and infection." } },
      { t: "try", h: "You do: on your own", b: "<p>1. A tendon joins a muscle to a bone. 2. A ligament joins bone to bone. 3. Both are very strong.</p>", q: { ask: "Which sentence proves what a ligament does?", choices: ["Sentence 2", "Sentence 1", "Sentence 3"], ans: 0, why: "Sentence 2 has the key word ligament and says what it joins." } },
    ],
    practice: [
      { title: "Cell city", pic: "🏙️🦠", text: ["The nucleus controls the cell.", "The cell membrane controls what goes in and out.", "Mitochondria release energy from food."], ask: "Tap the sentence that proves what controls what goes in and out.", key: "in and out", ans: [1], why: "\"The cell membrane controls what goes in and out.\"" },
      { title: "Lungs", pic: "🫁", text: ["Air sacs in the lungs are called alveoli.", "Oxygen diffuses from the alveoli into the blood.", "Carbon dioxide diffuses out of the blood."], ask: "Tap the sentence that proves how oxygen gets into the blood.", key: "oxygen", ans: [1], why: "\"Oxygen diffuses from the alveoli into the blood.\"" },
      { title: "Healthy bones", pic: "🥛☀️", text: ["Calcium builds strong bones.", "Vitamin D helps the body use calcium.", "Protein helps muscles grow and repair."], ask: "Tap the sentence that proves what helps muscles repair.", key: "muscles", ans: [2], why: "\"Protein helps muscles grow and repair.\"" },
      { title: "Microscope steps", pic: "🔬", text: ["Always start with the lowest-power lens.", "Focus with the coarse knob first.", "Then sharpen the picture with the fine knob."], ask: "Tap the sentence that proves which lens to start with.", key: "lens", ans: [0], why: "\"Always start with the lowest-power lens.\"" },
    ],
  },
  {
    n: 5, k: "summarise", name: "Summarise", icon: "🧺",
    does: "Keep the main idea, drop the small details.",
    card: ["A summary is the main idea in a few words.", "What is the whole text about?", "What is the most important thing it says?", "Leave out examples and small details."],
    lesson: [
      { t: "show", h: "Squeeze it down", b: "<p>A summary keeps the <b>big idea</b> and throws away the small details.</p><p>Two common mistakes: <b>too much detail</b> (one small fact), or <b>missing the main idea</b> (about something else).</p>", rule: "Whole text, most important point, few words." },
      { t: "show", h: "Watch the Librarian", b: "<p><i>Muscles can only pull. So they work in pairs. When the biceps contracts, the triceps relaxes, and the arm bends.</i></p><p>❌ \"The biceps contracts.\" <i>Too small: just one detail.</i><br>❌ \"Arms are useful.\" <i>Misses the main idea.</i><br>✅ \"Muscles work in pairs because they can only pull.\" <i>The whole idea in a few words.</i></p>", rule: "Not too small, not off-topic: just right." },
      { t: "try", h: "We do: with a hint", b: "<p><i>The skeleton supports the body. It protects organs. It helps us move. It makes blood cells.</i></p><p>💡 Hint: the best one covers ALL of the text.</p>", q: { ask: "Which is the best summary?", choices: ["The skeleton has four jobs: support, protection, movement and making blood.", "The skeleton makes blood cells.", "Bones are hard."], ans: 0, why: "It covers the whole text. The others are one detail, or off the main idea." } },
      { t: "try", h: "You do: on your own", b: "<p><i>Particles spread from where there are lots of them to where there are few. This is diffusion. It needs no energy.</i></p>", q: { ask: "Which is the best summary?", choices: ["Diffusion is particles spreading from crowded to less crowded places, with no energy needed.", "Particles exist.", "Diffusion needs no energy."], ans: 0, why: "It says what diffusion is AND its key fact. The others are too small." } },
    ],
    practice: [
      { title: "Levels", pic: "🧱", text: ["Cells make up tissues.", "Tissues make up organs.", "Organs work together in organ systems.", "All the systems together make an organism."], ask: "Which is the best summary?", choice: ["Living things are built up in levels, from cells to the whole organism.", "Cells make up tissues.", "Organs are important."], why: "It covers all four sentences. The others are one detail or too vague." },
      { title: "Plant extras", pic: "🌿", text: ["Plant cells have everything animal cells have.", "They also have a cell wall, chloroplasts and a large vacuole.", "These help them stay firm and make food."], ask: "Which is the best summary?", choice: ["Plant cells have the same parts as animal cells, plus three extras for support and making food.", "Plants are green.", "Plant cells have a wall."], why: "It keeps the main idea: same parts plus extras." },
      { title: "Injuries", pic: "🩹", text: ["A fracture is a broken bone.", "A sprain is a stretched or torn ligament.", "A strain is an overstretched or torn muscle or tendon."], ask: "Which is the best summary?", choice: ["There are three injuries: a fracture hurts a bone, a sprain a ligament, and a strain a muscle or tendon.", "A fracture is a broken bone.", "Sport is dangerous."], why: "It covers all three injuries in one sentence." },
      { title: "Your pulse", pic: "❤️⏱️", text: ["Your pulse rate is how many times your heart beats in a minute.", "Count the beats for 15 seconds.", "Multiply by 4."], ask: "Which is the best summary?", choice: ["Pulse rate is heartbeats per minute: count for 15 seconds and multiply by 4.", "Multiply by 4.", "Hearts are muscles."], why: "It gives what a pulse rate is AND how to measure it." },
    ],
  },
  {
    n: 6, k: "infer", name: "Infer", icon: "🧩",
    does: "Work out what the text means but doesn't say.",
    card: ["The text doesn't say everything.", "Find the clues.", "Add what you already know.", "Clue + what I know = my answer."],
    lesson: [
      { t: "show", h: "Reading between the lines", b: "<p>Writers don't spell out everything. You fill the gap with <b>clues from the text</b> plus <b>what you already know</b>.</p>", rule: "Clue + what I know = my answer." },
      { t: "show", h: "Watch the Librarian", b: "<p><i>After the race, Sam's heart was pounding and he was breathing fast.</i></p><p><i>\"It doesn't say why. Clue: he just raced. What I know: working muscles need more oxygen. So his heart is pumping more blood to his muscles.\"</i></p>", rule: "Clue: … What I know: … So: …" },
      { t: "try", h: "We do: with a hint", b: "<p><i>Under the microscope, Zara saw box-shaped cells with lots of green dots.</i></p><p>💡 Hint: which cells have green chloroplasts and walls?</p>", q: { ask: "What were the cells from?", choices: ["A leaf", "Zara's cheek", "A root"], ans: 0, why: "Box shape = cell wall, green dots = chloroplasts, and leaves get light. So: a leaf." } },
      { t: "try", h: "You do: on your own", b: "<p><i>Ben broke his leg. The doctor put it in a cast for six weeks.</i></p>", q: { ask: "Why use a cast?", choices: ["To hold the bone still so it can mend", "To keep the leg warm", "To make the leg stronger than before"], ans: 0, why: "Clue: broken leg + cast. What I know: new bone grows to rejoin a fracture if it is kept still." } },
    ],
    practice: [
      { title: "Cold tea", pic: "🫖❄️", text: ["Mia dropped one tea bag into hot water and one into cold water.", "After a minute, one cup was much darker."], ask: "Which cup was darker, and why?", choice: ["The hot one, because particles move faster when warm", "The cold one, because cold water is heavier", "Both the same"], clue: 0, why: "Clue: hot and cold water. What I know: diffusion is faster when warmer." },
      { title: "The swimmer", pic: "🏊", text: ["Lily swims every day.", "Her doctor said her muscles and bones are very strong."], ask: "What can you infer?", choice: ["Regular exercise made them stronger", "Swimming makes bones grow longer", "Her bones have no marrow"], clue: 0, why: "Clue: swims every day. What I know: exercise makes muscles and bones stronger." },
      { title: "The cut", pic: "🩸", text: ["Tom cut his finger.", "After a few minutes, the bleeding stopped and a scab began to form."], ask: "Which part of the blood did that?", choice: ["Platelets", "Red blood cells", "Yellow marrow"], clue: 1, why: "Clue: bleeding stopped. What I know: platelets help blood clot." },
      { title: "Leo's test", pic: "❤️👟", text: ["Leo measured his pulse after 1, 2 and 3 minutes of skipping.", "He used a different friend for each time."], ask: "What is wrong with Leo's test?", choice: ["It isn't fair: the person should stay the same", "He skipped too slowly", "Nothing is wrong"], clue: 1, why: "Clue: a different friend each time. What I know: in a fair test only one thing changes." },
    ],
  },
];

export const STRATEGY = Object.fromEntries(STRATEGIES.map(s => [s.k, s]));
