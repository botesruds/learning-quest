/* The Scribe's Tower: six writing floors (shared by every subject pack).
   Written from the content document "Scribe's Tower content: writing skills" (22 Nov 2026), checked by Rudi ("Go ahead").
   Each floor: a lesson (I do: the Scribe thinks aloud, we do: with a hint, you do: on his own), a toolkit card, 10 practice
   items for the second star (3 right on his own before 3 misses), and a writing task for the third star, marked by the coach.

   Practice item: { ask, choice: [right, wrong, wrong], why }  or  { ask, order: [cards in the right order], why }.
   Choices are written right answer first; the game shuffles them.
   Writing task: { kind, items: [...] }. Kinds (the fields he writes are in js/scribe.js FIELDS):
     bbs      a fact; he finishes it three ways (because, but, so)
     join     two facts; he joins them with a thinking word
     cmd      two questions with different commands; he answers both
     pe       a question; he writes the Point and the Evidence
     el       a question with its Point and Evidence; he writes the Explain and the Link
     peel     a question; he plans in four boxes, writes all four parts, then checks it
   Each task item carries `facts` (shown on screen and given to the coach) and `model` (given to the coach as a guide;
   shown to him only after he earns the star). */

const P = t => `<span class="pk p">${t}</span>`, E = t => `<span class="pk e">${t}</span>`, X = t => `<span class="pk x">${t}</span>`, L = t => `<span class="pk l">${t}</span>`;

export const THINK_WORDS = ["because", "so", "this shows", "this means", "which means", "therefore", "as a result", "so that"];

export const FLOORS = [
  {
    n: 1, k: "bbs", name: "Sentence power", icon: "🔗",
    does: "Grow one fact three ways: because (why?), but (something different), so (what happens).",
    card: ["because = why?", "but = something different or surprising", "so = what happens as a result", "Read your sentence aloud: is it true?"],
    lesson: [
      { t: "show", h: "Why these three words?", b: "<p>One fact can grow three ways.</p><p><b>because</b> makes you give a reason.<br><b>but</b> makes you think of something different.<br><b>so</b> makes you think of what happens next.</p><p>Each one makes your brain do a different job.</p>", rule: "because = why · but = different · so = result" },
      { t: "show", h: "Watch the Scribe", b: "<p>Fact: <i>Plant cells have a cell wall.</i></p><p><i>\"Why? Plant cells have a cell wall <b>because</b> it supports the cell.<br>What's different? Plant cells have a cell wall, <b>but</b> animal cells do not.<br>What happens as a result? Plant cells have a cell wall, <b>so</b> they have a regular box shape.\"</i></p>", rule: "One fact → three sentences." },
      { t: "try", h: "We do: with a hint", b: "<p><i>Root hair cells have no chloroplasts <b>because</b>…</i></p><p>💡 Hint: think about where they live.</p>", q: { ask: "Which ending is right?", choices: ["they live underground where there is no light", "they are very long", "they need water"], ans: 0, why: "Chloroplasts need light, and there is no light underground." } },
      { t: "try", h: "You do: on your own", b: "<p><i>The skull is hard, <b>so</b>…</i></p>", q: { ask: "Which ending is right?", choices: ["it protects the brain", "it is made of cells", "the brain is soft"], ans: 0, why: "So = what happens as a result. Because the skull is hard, it protects the brain." } },
    ],
    practice: [
      { ask: "Nerve cells are very long <b>because</b>…", choice: ["they carry messages from your toes to your brain", "they are made of bone", "they are found in plants"], why: "Because = the reason. Their length lets them carry messages a long way." },
      { ask: "Diffusion is faster when it is warmer <b>because</b>…", choice: ["the particles move faster", "cells get bigger", "it needs energy from the cell"], why: "Warmer particles move faster, so they spread out faster." },
      { ask: "Muscles can only pull, <b>so</b>…", choice: ["they work in pairs", "they never get tired", "bones push instead"], why: "So = the result. Because they can only pull, they need a partner to pull the other way." },
      { ask: "Muscles can only pull, <b>but</b>…", choice: ["we can still bend and straighten our arms", "they pull on bones", "so they work in pairs"], why: "But = something different or surprising: even though they only pull, we can move both ways." },
      { ask: "Babies are born with about 300 bones, <b>but</b>…", choice: ["adults have 206, because some join together", "babies are small", "bones make blood cells"], why: "But shows the surprise: adults have fewer." },
      { ask: "Red bone marrow makes millions of blood cells, <b>so</b>…", choice: ["it is called a blood factory", "bones are hollow", "it mostly stores fat"], why: "So = the result: making so many blood cells is why we call it a blood factory." },
      { ask: "Animal cells have no cell wall, <b>so</b>…", choice: ["they are rounder and less even", "they make their own food", "they are box-shaped"], why: "Without a stiff wall, animal cells are rounder." },
      { ask: "Which word fits? <i>Running makes bones denser, ___ they get stronger.</i>", choice: ["so", "but", "because"], why: "Getting stronger is the result, so the word is so." },
      { ask: "Which word fits? <i>Tendons join muscle to bone, ___ ligaments join bone to bone.</i>", choice: ["but", "so", "because"], why: "The second part is something different, so the word is but." },
      { ask: "Which word fits? <i>We repeat each test three times ___ one result could be a mistake.</i>", choice: ["because", "but", "so"], why: "The second part is the reason, so the word is because." },
    ],
    task: { kind: "bbs", items: [
      { fact: "The ribcage surrounds the heart and lungs", facts: ["The ribcage, made of 12 pairs of ribs, curves around the heart and lungs.", "The heart and lungs are soft and easy to damage.", "A very big force can still cause harm."], model: { because: "they are soft and easy to damage", but: "a very big force can still cause harm", so: "they are protected" } },
      { fact: "Plant cells have chloroplasts", facts: ["Chloroplasts make food by photosynthesis, using light.", "Root hair cells live underground, where there is no light, so they have none.", "That is why most leaves are green."], model: { because: "they make food by photosynthesis", but: "root hair cells have none", so: "most leaves are green" } },
      { fact: "Oxygen diffuses from the alveoli into the blood", facts: ["In your lungs, oxygen diffuses from tiny air sacs called alveoli into the blood, where there is less oxygen.", "Carbon dioxide diffuses the other way, out of the blood.", "Red blood cells carry oxygen around the body."], model: { because: "there is less oxygen in the blood", but: "carbon dioxide diffuses the other way", so: "the blood can carry it to the body's cells" } },
    ] },
  },
  {
    n: 2, k: "think", name: "Thinking words", icon: "🪧",
    does: "Use signpost words that show how two ideas connect.",
    card: ["Give an example: for example, such as", "Say what it proves: this shows that, this means that", "Give a result: therefore, as a result", "Show something different: however, whereas", "Pick the word by its job."],
    lesson: [
      { t: "show", h: "Signposts for the reader", b: "<p>A thinking word tells the reader what kind of sentence is coming next, like a signpost on a road.</p><p>Without them, sentences sit side by side and the reader has to guess how they connect.</p><table class=\"wtab\"><tr><td>Example</td><td><b>for example, such as</b></td></tr><tr><td>What it proves</td><td><b>this shows that, this means that</b></td></tr><tr><td>Result</td><td><b>therefore, as a result</b></td></tr><tr><td>Different</td><td><b>however, whereas</b></td></tr></table>", rule: "Pick the word by its job." },
      { t: "show", h: "Watch the Scribe", b: "<p><i>Red blood cells have no nucleus. They have more room to carry oxygen.</i></p><p><i>\"The second sentence is what happens because of the first, so I need a result word.\"</i></p><p><i>Red blood cells have no nucleus. <b>As a result,</b> they have more room to carry oxygen.</i></p>", rule: "Ask: what job does the next sentence do?" },
      { t: "try", h: "We do: with a hint", b: "<p><i>Muscles can only pull. ___, they work in pairs.</i></p><p>💡 Hint: is the second sentence an example, a result or something different?</p>", q: { ask: "Which word fits?", choices: ["Therefore", "For example", "However"], ans: 0, why: "Working in pairs is the result of only being able to pull." } },
      { t: "try", h: "You do: on your own", b: "<p><i>Plant cells have a cell wall, ___ animal cells do not.</i></p>", q: { ask: "Which word fits?", choices: ["whereas", "therefore", "for example"], ans: 0, why: "The second part is something different, so whereas fits." } },
    ],
    practice: [
      { ask: "<i>Bones protect soft organs. ___, the skull protects the brain.</i>", choice: ["For example", "However", "Therefore"], why: "The skull is one example of bones protecting organs." },
      { ask: "<i>A very big force can still harm the brain. ___, cyclists wear helmets.</i>", choice: ["Therefore", "For example", "Whereas"], why: "Wearing helmets is the result." },
      { ask: "<i>Plant cells are box-shaped, ___ animal cells are rounder.</i>", choice: ["whereas", "therefore", "such as"], why: "Whereas shows something different." },
      { ask: "<i>Muscle cells have lots of mitochondria. ___ they need lots of energy.</i>", choice: ["This shows that", "However", "For example"], why: "The second sentence says what the first fact proves." },
      { ask: "<i>Bones are hard. ___, they are not solid all the way through.</i>", choice: ["However", "Therefore", "For example"], why: "However shows something different or surprising is coming." },
      { ask: "<i>Some organisms are just one cell, ___ bacteria.</i>", choice: ["such as", "therefore", "however"], why: "Bacteria are an example, so such as fits." },
      { ask: "<i>Weight-bearing exercise makes bones denser. ___, they become stronger.</i>", choice: ["As a result", "However", "Such as"], why: "Becoming stronger is the result." },
      { ask: "What job does <b>however</b> do?", choice: ["Shows something different is coming", "Gives an example", "Gives a result"], why: "However = something different or surprising." },
      { ask: "What job does <b>for example</b> do?", choice: ["Shows one case of the idea is coming", "Shows something different", "Says what it proves"], why: "For example = here is one case of it." },
      { ask: "What job does <b>this shows that</b> do?", choice: ["Says what the fact proves", "Gives an example", "Starts a new topic"], why: "This shows that = here is what the fact proves. You'll use it a lot in PEEL." },
    ],
    task: { kind: "join", items: [
      { a: "The ribcage can move.", b: "Your lungs can fill with air.", facts: ["The ribcage can move, so your lungs can fill with air."], model: "The ribcage can move. Therefore, your lungs can fill with air." },
      { a: "Tendons do not stretch.", b: "The pull of the muscle reaches the bone.", facts: ["Tendons are tough cords that do not stretch, so the pull reaches the bone."], model: "Tendons do not stretch. This means that the pull of the muscle reaches the bone." },
      { a: "Red bone marrow makes blood cells.", b: "Yellow bone marrow mostly stores fat.", facts: ["Red bone marrow, inside the spongy bone, makes blood cells.", "Yellow bone marrow, in the hollow middle, mostly stores fat."], model: "Red bone marrow makes blood cells, whereas yellow bone marrow mostly stores fat." },
    ] },
  },
  {
    n: 3, k: "command", name: "What is the question asking?", icon: "🎯",
    does: "Read the command word first, then build the answer it asks for.",
    card: ["State: a name, number or short answer, no reasons", "Describe: what it is like or what happens, in detail", "Explain: how or why, with reasons (because, so)", "Compare: how two things are alike", "Contrast: how two things are different"],
    lesson: [
      { t: "show", h: "The command is an order", b: "<p>The first word of a question tells you what kind of answer to build, and how big.</p><table class=\"wtab\"><tr><td><b>State</b></td><td>a name, number or short answer</td></tr><tr><td><b>Describe</b></td><td>what it is like, or what happens</td></tr><tr><td><b>Explain</b></td><td>how or why, with reasons</td></tr><tr><td><b>Compare</b></td><td>how two things are alike</td></tr><tr><td><b>Contrast</b></td><td>how two things are different</td></tr></table><p>A perfect description gets few marks if the question said <b>explain</b>.</p>", rule: "Read the command first, then answer that." },
      { t: "show", h: "Watch the Scribe", b: "<p>One topic, three commands.</p><p><b>State</b> the job of red blood cells: <i>carry oxygen.</i> That's all it wants.</p><p><b>Describe</b> a red blood cell: <i>small discs, thinner in the middle, with no nucleus.</i> That's what it looks like.</p><p><b>Explain</b> why it has no nucleus: <i>it leaves more room to carry oxygen, so the cell can carry more oxygen around the body.</i> That's the why.</p>", rule: "State = short · Describe = what · Explain = why" },
      { t: "try", h: "We do: with a hint", b: "<p><b>Explain</b> why plant cells are box-shaped.</p><p>💡 Hint: explain wants a reason.</p>", q: { ask: "Which answer fits the command?", choices: ["They have a stiff cell wall, which gives them a regular box shape.", "Plant cells are box-shaped.", "Plant cells have a cell wall, chloroplasts and a vacuole."], ans: 0, why: "Only the first gives a reason: the stiff wall." } },
      { t: "try", h: "You do: on your own", b: "<p><b>State</b> how many bones an adult has.</p>", q: { ask: "Which answer fits the command?", choices: ["206", "Because some bones join together", "Bones support the body"], ans: 0, why: "State wants a short answer: the number." } },
    ],
    practice: [
      { ask: "Which command wants a reason?", choice: ["Explain", "State", "Describe"], why: "Explain = how or why, with reasons." },
      { ask: "Which command wants one short answer?", choice: ["State", "Explain", "Compare"], why: "State = a name, number or short answer." },
      { ask: "Which command wants how two things are different?", choice: ["Contrast", "Compare", "State"], why: "Contrast = differences." },
      { ask: "Which command wants how two things are alike?", choice: ["Compare", "Contrast", "Describe"], why: "Compare = how they are alike." },
      { ask: "<b>State</b> the job of white blood cells.", choice: ["They fight infection.", "They are bigger, with a purple nucleus.", "Platelets help blood clot."], why: "State = a short answer: their job is to fight infection." },
      { ask: "<b>Describe</b> what happens to the biceps when you bend your elbow.", choice: ["It contracts: it gets shorter and fatter and pulls on the bone it is joined to.", "Biceps.", "Because muscles can only pull."], why: "Describe = what happens, in detail." },
      { ask: "<b>Compare</b> plant and animal cells.", choice: ["Both have a nucleus, a cell membrane, cytoplasm and mitochondria.", "Plant cells have a cell wall.", "Animal cells are round."], why: "Compare = how they are alike, with both in the answer." },
      { ask: "<b>Contrast</b> plant and animal cells.", choice: ["Plant cells have a cell wall, chloroplasts and a large vacuole, whereas animal cells do not.", "Both have a nucleus.", "Cells are very small."], why: "Contrast = how they are different, with both in the answer." },
      { ask: "<b>Explain</b> why muscles work in pairs.", choice: ["Muscles can only pull, so a second muscle is needed to pull the bone back the other way.", "Muscles work in pairs.", "The biceps and the triceps."], why: "Explain = the reason: muscles can only pull." },
      { ask: "This answer is a description: <i>\"Red blood cells are small discs, thinner in the middle, with no nucleus.\"</i> Which question was it written for?", choice: ["Describe a red blood cell.", "Explain why red blood cells have no nucleus.", "State how many bones an adult has."], why: "It says what the cell is like, which is what describe asks for." },
    ],
    task: { kind: "cmd", items: [
      { qs: ["<b>State</b> what diffusion is.", "<b>Explain</b> why diffusion is faster when it is warmer."], facts: ["Diffusion is particles moving from a high concentration to a low concentration.", "It needs no energy from the cell.", "Diffusion is faster when it is warmer, because particles move faster."], model: ["Diffusion is particles moving from a high concentration to a low concentration.", "It is faster when it is warmer because the particles move faster, so they spread out more quickly."] },
      { qs: ["<b>Describe</b> how to measure your pulse rate.", "<b>Explain</b> why we repeat each test three times."], facts: ["To measure your pulse, press two fingers on your wrist, count the beats for 15 seconds, then multiply by 4.", "Repeat each test three times and find the mean."], model: ["Press two fingers on your wrist, count the beats for 15 seconds, then multiply by 4.", "One result could be a mistake, so repeating the test and finding the mean gives a result we can trust more."] },
    ] },
  },
  {
    n: 4, k: "pe", name: "PEEL: Point and Evidence", icon: "🧱",
    does: "Answer the question first (Point), then prove it with a fact (Evidence).",
    card: ["Point = What do you think? Answer the question in one sentence, using its words.", "Evidence = How do you know? Give a fact, number or example.", "Evidence starters: For example, · We know this because · Scientists have found that"],
    lesson: [
      { t: "show", h: "The reader's four questions", b: "<p>When you write, the reader can't stop you to ask questions. So a good paragraph answers them in order:</p><p>" + P("What do you think?") + " → " + E("How do you know?") + " → " + X("So what?") + " → " + L("Why does that answer the question?") + "</p><p>Those are the four bricks of <b>PEEL</b>: " + P("Point") + " " + E("Evidence") + " " + X("Explain") + " " + L("Link") + ". This floor is the first two.</p>", rule: "Answer first, then prove it." },
      { t: "show", h: "A whole PEEL paragraph", b: "<p><b>Explain how the skeleton protects the body.</b></p><p class=\"peelp\">" + P("The skeleton protects the body's soft organs from damage.") + " " + E("For example, the skull is a hard case of bone around the brain, and the ribcage curves around the heart and lungs.") + " " + X("This shows that the organs that are easiest to damage are wrapped in hard bone, so a knock hits the bone first instead of the organ.") + " " + L("Therefore, protection is one of the skeleton's four jobs.") + "</p>", rule: "Four bricks, four colours." },
      { t: "show", h: "Watch the Scribe", b: "<p><b>Explain why muscles work in pairs.</b></p><p><i>\"First I answer the question straight away.\"</i></p><p>" + P("Muscles work in pairs because they can only pull.") + "</p><p><i>\"Now, how do I know? I need a real example.\"</i></p><p>" + E("For example, the biceps contracts to bend the elbow and the triceps contracts to straighten it.") + "</p>", rule: "Point answers · Evidence proves" },
      { t: "try", h: "We do: with a hint", b: "<p><b>Explain why red blood cells have no nucleus.</b></p><p>💡 Hint: the Point answers the question.</p>", q: { ask: "Which is the best Point?", choices: ["Red blood cells have no nucleus so they have more room to carry oxygen.", "Red blood cells are small discs.", "There are many types of cells."], ans: 0, why: "It answers the why straight away." } },
      { t: "try", h: "You do: on your own", b: "<p>Point: " + P("Plant and animal cells share some parts.") + "</p>", q: { ask: "Which is the best Evidence?", choices: ["Both have a nucleus, a cell membrane, cytoplasm and mitochondria.", "Plant cells have chloroplasts.", "Cells are tiny."], ans: 0, why: "It gives the facts that prove they share parts." } },
    ],
    practice: [
      { ask: "Best Point: <i>Explain why nerve cells are long.</i>", choice: ["Nerve cells are long so they can carry messages over long distances.", "Nerve cells are cells.", "There are lots of types of cells."], why: "It answers the question directly." },
      { ask: "Best Point: <i>Explain how the skeleton helps us move.</i>", choice: ["The skeleton helps us move because muscles pull on bones at joints.", "The skeleton has 206 bones.", "Muscles are strong."], why: "It answers how, using the question's words." },
      { ask: "Best Point: <i>Explain why tendons must not stretch.</i>", choice: ["Tendons must not stretch so that the muscle's pull reaches the bone.", "Tendons are cords.", "Ligaments join bone to bone."], why: "It answers why." },
      { ask: "Best Point: <i>Explain why exercise is good for bones.</i>", choice: ["Exercise makes bones stronger.", "Bones are inside the body.", "Running is fun."], why: "It answers the question in one sentence." },
      { ask: "Best Evidence for: <i>Bone marrow is a blood factory.</i>", choice: ["Red bone marrow makes millions of new blood cells every second.", "The outside of a bone is hard.", "Yellow marrow mostly stores fat."], why: "This fact proves it makes blood." },
      { ask: "Best Evidence for: <i>Diffusion moves oxygen into the blood.</i>", choice: ["In the lungs, oxygen diffuses from the alveoli into the blood, where there is less oxygen.", "Diffusion needs no energy.", "Particles are very small."], why: "It is a real example of exactly that." },
      { ask: "Best Evidence for: <i>Living things are organised in levels.</i>", choice: ["Cells make tissues, tissues make organs, and organs make organ systems.", "Bacteria are small.", "The heart pumps blood."], why: "It shows the levels." },
      { ask: "Best Evidence for: <i>How we live affects our bones.</i>", choice: ["Weight-bearing exercise makes bones denser, and smoking weakens them.", "A fracture is a broken bone.", "Bones are inside the body."], why: "It gives two ways living affects bones." },
      { ask: "Which sentence is the Evidence?<br>(1) Muscles work in antagonistic pairs because they can only pull. (2) For example, to bend the elbow the biceps contracts and the triceps relaxes. (3) This shows that one muscle is needed to pull each way. (4) So without pairs, we could bend an arm but never straighten it.", choice: ["Sentence 2", "Sentence 1", "Sentence 3"], why: "Sentence 2 gives the real example that proves the Point. It starts with For example." },
      { ask: "Point: <i>The skull protects the brain.</i> Evidence: <i>The skull is very important.</i> What is wrong with this Evidence?", choice: ["It gives no fact; it just repeats the Point.", "It is too long.", "It uses a thinking word."], why: "Evidence needs a fact, such as: the skull is a hard case of bone around the brain." },
    ],
    task: { kind: "pe", items: [
      { q: "Explain why root hair cells are a good shape for their job.", facts: ["Root hair cells have a long thin part that pokes into the soil.", "This gives a big surface to soak up water.", "They live underground, so they have no chloroplasts."], model: { point: "Root hair cells have a shape that helps them soak up water.", evidence: "For example, they have a long thin part that pokes into the soil, which gives a big surface." } },
      { q: "Explain why plant cells stay firm.", facts: ["Plant cells have a large vacuole.", "It is full of sap, a watery liquid.", "When the vacuole is full, the cell stays firm."], model: { point: "Plant cells stay firm because of their large vacuole.", evidence: "The vacuole is full of sap, a watery liquid, and when it is full the cell stays firm." } },
    ] },
  },
  {
    n: 5, k: "el", name: "PEEL: Explain and Link", icon: "🌉",
    does: "Say how the evidence proves the point (Explain), then go back to the question (Link).",
    card: ["Explain = So what? Say how your Evidence proves your Point.", "Explain starters: This shows that · This means that · so · because", "Link = Why does that answer the question? Use the question's words.", "Link starters: Therefore, · This is why"],
    lesson: [
      { t: "show", h: "The So what? test", b: "<p>Read your Evidence and ask: <b>So what?</b> Your " + X("Explain") + " sentence is the answer. It is the bridge between the fact and your Point.</p><p>Two traps:<br>❌ repeating the Evidence in other words<br>❌ adding a new fact instead of explaining</p>", rule: "Evidence says what. Explain says so what." },
      { t: "show", h: "Watch the Scribe", b: "<p>" + E("For example, the biceps contracts to bend the elbow and the triceps contracts to straighten it.") + "</p><p><i>\"So what? Each muscle can only pull one way.\"</i></p><p>" + X("This shows that each muscle can only move the bone one way, so a second muscle is needed to pull it back.") + "</p><p><i>\"Now back to the question.\"</i></p><p>" + L("Therefore, muscles must work in pairs for us to move a joint both ways.") + "</p>", rule: "So what? → Explain. Back to the question → Link." },
      { t: "try", h: "We do: with a hint", b: "<p>Evidence: " + E("Red blood cells have no nucleus.") + "</p><p>💡 Hint: which one answers So what?</p>", q: { ask: "Which is the stronger Explain?", choices: ["This means there is more space inside for oxygen, so each cell can carry more oxygen around the body.", "Red blood cells do not have a nucleus.", "White blood cells fight infection."], ans: 0, why: "It says why having no nucleus matters. The others repeat the fact or add a new one." } },
      { t: "try", h: "You do: on your own", b: "<p>Question: <b>Explain how the skeleton protects the body.</b></p>", q: { ask: "Which is the best Link?", choices: ["Therefore, protection is one of the skeleton's four jobs.", "Muscles are joined to bones by tendons.", "The skull is hard."], ans: 0, why: "It goes back to the question: the skeleton and protection." } },
    ],
    practice: [
      { ask: "Stronger Explain. Evidence: <i>Nerve cells are very long.</i>", choice: ["This shows that their long shape fits their job of carrying messages over long distances.", "Nerve cells are very long.", "Red blood cells carry oxygen."], why: "It says what the fact proves. The others repeat it or add a new fact." },
      { ask: "Stronger Explain. Evidence: <i>Weight-bearing exercise, like running, makes bones denser.</i>", choice: ["A denser bone has more bone packed into it, so it is harder to break.", "Running is a weight-bearing exercise.", "Muscles get stronger too."], why: "It answers So what?" },
      { ask: "Stronger Explain. Evidence: <i>Oxygen diffuses from the alveoli into the blood, where there is less oxygen.</i>", choice: ["This shows that oxygen moves from where there is more to where there is less, so the blood keeps picking it up.", "Alveoli are tiny air sacs.", "Oxygen goes into the blood."], why: "It explains the idea behind the fact." },
      { ask: "Evidence: <i>The femur is the longest bone.</i> Explain: <i>The femur is in the thigh.</i> What is wrong with this Explain?", choice: ["It adds a new fact instead of saying what the Evidence proves.", "It is too short.", "It does not use the word because."], why: "An Explain says so what, not another fact." },
      { ask: "Which sentence answers <b>So what?</b> after: <i>Plant cells have a stiff cell wall.</i>", choice: ["This means plant cells are supported and keep a regular box shape.", "Animal cells have no cell wall.", "The wall is part of the cell."], why: "It says what the wall does for the cell." },
      { ask: "Best Link for: <i>Explain why red blood cells have no nucleus.</i>", choice: ["Therefore, having no nucleus helps red blood cells do their job of carrying oxygen.", "Platelets help blood clot.", "Red blood cells are red."], why: "It goes back to the question's words." },
      { ask: "Best Link for: <i>Explain why warming up is important.</i>", choice: ["This is why warming up is an important part of exercising safely.", "Running is good for bones.", "A sprain is a stretched or torn ligament."], why: "It ties back to the question." },
      { ask: "Which is a good way to start a Link?", choice: ["Therefore,", "For example,", "Such as"], why: "Therefore signals the conclusion." },
      { ask: "Put these in PEEL order.", order: ["Muscles work in antagonistic pairs because they can only pull.", "For example, to bend the elbow the biceps contracts and the triceps relaxes.", "This shows that one muscle is needed to pull each way.", "So without pairs, we could bend an arm but never straighten it."], why: "Point, Evidence, Explain, Link." },
      { ask: "Which part is missing? Point: <i>The skeleton lets us move.</i> Evidence: <i>Muscles pull on bones at joints.</i> Link: <i>Therefore, movement is one of the skeleton's jobs.</i>", choice: ["Explain", "Point", "Evidence"], why: "Nothing says so what between the Evidence and the Link." },
    ],
    task: { kind: "el", items: [
      { q: "Explain why the backbone is important.", point: "The backbone protects the spinal cord.", evidence: "The spinal cord runs through a tunnel inside the vertebrae.", facts: ["The backbone is a column of small bones called vertebrae.", "The spinal cord, which carries messages between the brain and body, runs through a tunnel inside them."], model: { explain: "This means the spinal cord, which carries messages between the brain and body, is surrounded by bone, so it is hard to damage.", link: "Therefore, the backbone is important because it keeps the body's message pathway safe." } },
      { q: "Explain why a fair test needs control variables.", point: "A fair test needs control variables so that only one thing changes.", evidence: "For example, in the pulse investigation we use the same person and the same exercise.", facts: ["Control variables are kept the same so the test is fair, such as the same person and the same exercise.", "The independent variable is the thing you change; the dependent variable is the thing you measure."], model: { explain: "This means any change in pulse rate must be caused by how long we exercised, not by something else.", link: "Therefore, control variables are what make the test fair." } },
    ] },
  },
  {
    n: 6, k: "plan", name: "Plan, write, check", icon: "📝",
    does: "Plan in notes, write in sentences, then check one thing at a time.",
    card: ["Plan in four boxes, a few words each.", "Write: turn each box into one sentence.", "Check 1: does my Point answer the command?", "Check 2: is every fact true? Look at the fact card.", "Check 3: does my Explain answer So what?", "Check 4: press 🔊 read-aloud. Does it sound right, with capitals and full stops?"],
    lesson: [
      { t: "show", h: "Why plan in notes?", b: "<p>Your brain can only hold a few things at once. If you plan in full sentences, you use up that space on wording. <b>Notes save space for thinking.</b></p><p>And no one writes a perfect first draft. Checking is part of writing, not a punishment.</p>", rule: "Plan in notes, write in sentences, check one thing at a time." },
      { t: "show", h: "Watch the Scribe plan", b: "<p><b>Explain why mitochondria are important.</b></p><p>" + P("P: release energy cells need") + "<br>" + E("E: respiration; muscle cells have lots") + "<br>" + X("E: busy cell → more energy → more mitochondria") + "<br>" + L("L: no mitochondria → no energy to work") + "</p>", rule: "A few words per box." },
      { t: "show", h: "Then write, then check", b: "<p class=\"peelp\">" + P("Mitochondria are important because they release the energy that cells need.") + " " + E("They release energy from food in a process called respiration, and busy cells, like muscle cells, have lots of them.") + " " + X("This shows that the more work a cell does, the more energy it needs, so the number of mitochondria fits the cell's job.") + " " + L("Therefore, without mitochondria, cells would not have the energy to work.") + "</p><p><i>\"Check 1: my Point answers why. Check 2: every fact matches the fact card. Check 3: my Explain answers So what. Check 4: I'll listen to it read aloud.\"</i></p>", rule: "Four checks, one at a time." },
      { t: "try", h: "We do: with a hint", b: "<p>💡 Hint: a plan uses a few words per box.</p>", q: { ask: "Which is a plan, not a paragraph?", choices: ["skull → protects brain · hard case of bone · knock hits bone first · protection = a job", "The skull protects the brain because it is a hard case of bone.", "Skull."], ans: 0, why: "Short notes for each of the four boxes." } },
      { t: "try", h: "You do: on your own", b: "<p><b>Explain why plant cells are box-shaped.</b><br>Point: <i>Plant cells are box-shaped.</i></p>", q: { ask: "Which check does this fail?", choices: ["Check 1: the Point doesn't answer why", "Check 2: a fact is wrong", "Check 4: it is missing a full stop"], ans: 0, why: "It repeats the question instead of answering why." } },
    ],
    practice: [
      { ask: "Which note goes in the Evidence box for <i>Explain how the skull protects the brain</i>?", choice: ["hard case of bone around brain", "therefore = a skeleton job", "knock hits bone first"], why: "Evidence is the fact: the skull is a hard case of bone." },
      { ask: "Which note goes in the Link box for <i>Explain how the skull protects the brain</i>?", choice: ["protection = one of the skeleton's jobs", "hard case of bone", "skull, brain"], why: "The Link goes back to the question." },
      { ask: "Check 1. <i>Explain why red blood cells have no nucleus.</i> Point: <i>Red blood cells are small discs.</i> Does the Point answer the command?", choice: ["No, it describes instead of giving a reason.", "Yes", "No, it is too short."], why: "Explain wants a reason." },
      { ask: "Check 2. Spot the wrong fact: <i>Tendons join bone to bone.</i>", choice: ["Ligaments join bone to bone; tendons join muscle to bone.", "The fact is right.", "Tendons join muscle to muscle."], why: "Tendon = muscle To bone." },
      { ask: "Check 2. Spot the wrong fact: <i>An adult skeleton has 300 bones.</i>", choice: ["An adult has 206; babies have about 300.", "The fact is right.", "An adult has 100."], why: "Some bones join together as we grow." },
      { ask: "Check 2. Spot the wrong fact: <i>Diffusion needs energy from the cell.</i>", choice: ["Diffusion needs no energy from the cell.", "The fact is right.", "Diffusion only happens in plants."], why: "Particles spread out on their own." },
      { ask: "Check 3. Evidence: <i>Red bone marrow makes millions of blood cells every second.</i> Which Explain fails So what?", choice: ["Red bone marrow makes lots of blood cells.", "This means the body can keep replacing its blood cells.", "This shows that bones do more than hold us up."], why: "It just repeats the Evidence." },
      { ask: "Check 4. Which word is missing? <i>Muscles can only ___, so they work in pairs.</i>", choice: ["pull", "push", "bend"], why: "Reading aloud helps you hear a missing word." },
      { ask: "Check 4. Which sentence needs fixing?", choice: ["the heart is inside the ribcage", "The heart is inside the ribcage.", "The lungs are inside the ribcage."], why: "It needs a capital letter and a full stop." },
      { ask: "What is the right order?", choice: ["Plan, write, check", "Write, check, plan", "Check, plan, write"], why: "Plan in notes first, then write, then check." },
    ],
    task: { kind: "peel", items: [
      { q: "Explain why mitochondria are important.", facts: ["Mitochondria are tiny parts inside cells.", "They release energy from food in a process called respiration.", "Busy cells, like muscle cells, have lots of them."], model: "Mitochondria are important because they release the energy that cells need. They release energy from food in a process called respiration, and busy cells, like muscle cells, have lots of them. This shows that the more work a cell does, the more energy it needs, so the number of mitochondria fits the cell's job. Therefore, without mitochondria, cells would not have the energy to work." },
      { q: "Explain how muscles and bones work together to make movement.", facts: ["Muscles move your bones, but they can only pull.", "When a muscle contracts, it gets shorter and fatter, and it pulls on the bone it is joined to.", "Muscles are joined to bones by tendons: tough cords that do not stretch.", "The skeleton lets us move, because muscles pull on bones at joints."], model: "Muscles and bones work together because muscles pull on bones to move them. For example, when the biceps contracts, it gets shorter and pulls on the bone it is joined to by a tendon, which bends the elbow. This means the muscle gives the pull and the bone moves at the joint, so the arm bends. Therefore, movement needs muscles and bones working together." },
    ] },
  },
];

export const FLOOR = Object.fromEntries(FLOORS.map(f => [f.k, f]));
