/* Riddles (understanding questions) for Science Unit 2: explain why, and spot the mistake in a student's explanation.
   Asked after Train and after a Challenge win. Keyed by topic id. */
export const UNDERSTANDING = {
  2: [
    { k: "mistake", q: "Sam explained how a cell works. Which line is wrong?", lines: ["The nucleus controls the cell.", "The cell membrane controls what goes in and out.", "The mitochondria make food from light.", "The cytoplasm is where most reactions happen."], bad: 2, fixes: ["The mitochondria release energy by respiration.", "The mitochondria hold the DNA.", "The mitochondria control the cell."], fix: 0, why: "Chloroplasts make food from light. Mitochondria release energy." },
    { k: "why", q: "Sperm cells swim a long way and have lots of mitochondria. Why?", c: ["Swimming needs lots of energy", "To make food on the way", "To hold extra DNA"], a: 0, why: "Mitochondria release energy, and swimming uses a lot of it." },
  ],
  3: [
    { k: "mistake", q: "Mia compared plant and animal cells. Which line is wrong?", lines: ["Both have a nucleus and a membrane.", "Both have mitochondria.", "Only animal cells have a cell wall.", "Only plant cells have chloroplasts."], bad: 2, fixes: ["Only plant cells have a cell wall.", "Both have a cell wall.", "Neither has a cell wall."], fix: 0, why: "The cell wall is one of the three plant-only parts." },
    { k: "why", q: "A cactus cell and a human skin cell: which would have a cell wall, and why?", c: ["The cactus cell, because it's a plant and needs support", "The skin cell, because skin is tough", "Both, because all cells have walls"], a: 0, why: "Only plant cells have cell walls. They support the plant." },
  ],
  4: [
    { k: "mistake", q: "Leo wrote how to use a microscope. Which step is wrong?", lines: ["Put the slide on the stage.", "Start with the highest power objective lens.", "Focus with the coarse focus.", "Sharpen with the fine focus."], bad: 1, fixes: ["Start with the lowest power objective lens.", "Start with no lens.", "Start with the eyepiece removed."], fix: 0, why: "Low power first: it shows a bigger area, so the cells are easier to find." },
  ],
  5: [
    { k: "mistake", q: "Zara explained diffusion. Which line is wrong?", lines: ["Particles are always moving.", "Diffusion is particles spreading out.", "They move from low concentration to high concentration.", "It is faster when it's warmer."], bad: 2, fixes: ["They move from high concentration to low concentration.", "They only move when stirred.", "They move from cold to hot."], fix: 0, why: "Diffusion always goes from crowded (high) to spread out (low)." },
    { k: "why", q: "A teabag in hot water colours the water faster than in cold water. Why?", c: ["Particles move faster in hot water, so they diffuse faster", "Hot water is thinner", "Tea likes heat"], a: 0, why: "Warmer particles move faster, so diffusion is quicker." },
  ],
  6: [
    { k: "mistake", q: "Ben put the levels in order. Which line is wrong?", lines: ["Cell", "Organ", "Tissue", "Organ system", "Organism"], bad: 1, fixes: ["Tissue", "Organism", "Cell"], fix: 0, why: "Cell → tissue → organ → organ system → organism. Tissue comes before organ." },
  ],
  7: [
    { k: "why", q: "Why is the spine made of lots of small bones instead of one long one?", c: ["So you can bend and twist", "So it's lighter than air", "So it can make more blood"], a: 0, why: "Many small vertebrae with joints between them let your back bend while still supporting you." },
  ],
  10: [
    { k: "mistake", q: "Ella explained how the arm bends. Which line is wrong?", lines: ["The biceps contracts.", "It gets shorter and pulls.", "The ligament pulls on the radius.", "The forearm moves up at the elbow."], bad: 2, fixes: ["The tendon pulls on the radius.", "The bone pulls on the muscle.", "The joint pushes the radius."], fix: 0, why: "Tendons join muscle to bone. Ligaments join bone to bone." },
  ],
  11: [
    { k: "mistake", q: "Omar explained straightening the arm. Which line is wrong?", lines: ["The triceps contracts.", "The biceps contracts too.", "The triceps pulls on its tendon.", "The arm straightens."], bad: 1, fixes: ["The biceps relaxes.", "The biceps pushes.", "The biceps breaks."], fix: 0, why: "In an antagonistic pair, one contracts while the other relaxes." },
    { k: "why", q: "When you stand on tiptoe, your calf muscle contracts. What does the muscle at the front of your shin do?", c: ["Relaxes", "Contracts too", "Pushes"], a: 0, why: "They're an antagonistic pair, so one relaxes while the other contracts." },
  ],
  12: [
    { k: "mistake", q: "Kai explained why a footballer should eat well. Which line is wrong?", lines: ["Calcium builds strong bones.", "Vitamin D helps the body use calcium.", "Protein helps muscles grow and repair.", "Sugar makes bones denser."], bad: 3, fixes: ["Weight-bearing exercise makes bones denser.", "Fat makes bones denser.", "Salt makes bones denser."], fix: 0, why: "Bones get denser from weight-bearing exercise, with calcium and vitamin D." },
  ],
  13: [
    { k: "mistake", q: "Nia planned her pulse investigation. Which line is wrong?", lines: ["I will change how long I skip for.", "I will measure my pulse rate.", "I will use a different person for each test.", "I will rest before each test."], bad: 2, fixes: ["I will use the same person for each test.", "I will not measure anything.", "I will change the exercise each time."], fix: 0, why: "The person is a control variable: keep it the same to make it a fair test." },
    { k: "why", q: "Nia's results: 70, 72 and 110 bpm after the same exercise. What should she think about 110?", c: ["It's an odd result, so she should check it or repeat", "It's the most accurate one", "She should only use 110"], a: 0, why: "One reading far from the others is an anomaly. Repeats help you spot it." },
  ],
};
