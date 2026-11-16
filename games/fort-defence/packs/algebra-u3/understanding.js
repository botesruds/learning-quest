/* Algebra Unit 3: understanding questions (new for Fort Defence). They earn crystal, the best loot.
   Formats (see js/qui.js UnderstandCard):
     why     { k:"why", q, c:[choices], a:index of the right one, why }
     method  { k:"method", q, c, a, why }
     mistake { k:"mistake", q, lines:[the goblin's worked lines], bad:index of the first wrong line, fixes:[what that line should say], fix, why }
     build   { k:"build", q, tiles:[...], ans:"the expression or equation", why }   (checked by value, so 2 × n + 7 and 2n + 7 both count)
   Choices are shuffled when shown, so the right answer can always be listed first here.
   Keyed by topic id. Written 15 November 2026; checked by Rudi on 16 November (his wording fixes applied). */
const U = {};

/* World 1: Letter Land */
U[1] = [
  { k: "why", q: "Two bags in the same problem are both labelled <b>n</b>. Why must they hold the same number of marbles?", c: ["In one problem, the same letter always stands for the same number", "Bags always hold the same amount", "n is always 5"], a: 0, why: "Inside one problem, a letter is a name for one number. Two bags with the same name hold the same amount." },
  { k: "mistake", q: "\"I think of a number and add 4. I get 11.\" What was the number?", lines: ["n + 4 = 11", "n = 11 + 4", "n = 15"], bad: 1, fixes: ["n = 11 − 4", "n = 4 − 11", "n = 11 × 4"], fix: 0, why: "The bag and 4 marbles make 11, so the bag is 11 take away the 4: n = 7." },
  { k: "method", q: "A bag and 6 loose marbles make 20 marbles. What is the best first move to find what's in the bag?", c: ["Take 6 away from 20", "Add 6 to 20", "Divide 20 by 6"], a: 0, why: "The bag and the 6 together make 20, so the bag is what's left when you take the 6 away: 14." },
  { k: "build", q: "Build this: <b>a bag of n marbles and 3 more marbles</b>.", tiles: ["n", "+", "3", "×", "−"], ans: "n+3", why: "One bag is n, and 3 more marbles is + 3. So it's n + 3." },
  { k: "why", q: "Tom says x must be bigger than 5 \"because x is near the end of the alphabet\". Is he right?", c: ["No. x can be any number; it depends on the problem", "Yes, later letters are bigger numbers", "Yes, x is always 10"], a: 0, why: "A letter is just a number we don't know yet. Which letter we use tells us nothing about its size." },
];
U[2] = [
  { k: "why", q: "Why is <b>3n</b> not the same as <b>n + 3</b>?", c: ["3n is three lots of n, but n + 3 is n with 3 more", "They are the same, just written differently", "3n is always the bigger one"], a: 0, why: "3n means 3 × n. n + 3 means add 3. When n = 10 they are 30 and 13, so they can't be the same." },
  { k: "mistake", q: "n = 5. Work out <b>2n²</b>.", lines: ["2n² means 2 × n²", "n² = 5 × 2 = 10", "2n² = 2 × 10 = 20"], bad: 1, fixes: ["n² = 5 × 5 = 25", "n² = 5 + 5 = 10", "n² = 2 × 5 = 10"], fix: 0, why: "n² means n × n, so 5 × 5 = 25. Then 2n² = 2 × 25 = 50." },
  { k: "build", q: "Build this: <b>four lots of n</b>.", tiles: ["4", "n", "+", "3"], ans: "4n", why: "Four lots of n is 4 × n, written 4n." },
  { k: "method", q: "a = 3 and b = 4. What does <b>2ab</b> mean?", c: ["2 × 3 × 4", "2 + 3 + 4", "The number 234"], a: 0, why: "Numbers and letters stuck together multiply: 2 × a × b = 2 × 3 × 4 = 24." },
];
U[3] = [
  { k: "why", q: "Why does <b>5 − (−2)</b> give 7?", c: ["Taking away a negative is the same as adding the positive number", "Two minus signs always make a minus", "You can ignore the brackets"], a: 0, why: "− (−2) is the same as + 2. So 5 − (−2) = 5 + 2 = 7." },
  { k: "mistake", q: "Work out <b>−3 − 4</b> on a number line.", lines: ["Start at −3", "− 4 means walk 4 to the right", "You land on 1"], bad: 1, fixes: ["− 4 means walk 4 to the left", "− 4 means stay where you are", "− 4 means jump straight to 4"], fix: 0, why: "Taking away a positive number means walking left. From −3, walk 4 to the left and you land on −7." },
  { k: "method", q: "Which of these is the same as <b>6 + (−4)</b>?", c: ["6 − 4", "6 + 4", "−6 − 4"], a: 0, why: "Adding a negative is the same as taking away: + (−4) is − 4. So 6 + (−4) = 2." },
  { k: "why", q: "Why is <b>(−3) × (−2)</b> positive?", c: ["The two numbers have the same sign, so the answer is positive", "You always drop the minus signs when you multiply", "A negative times anything is negative"], a: 0, why: "Same signs give a positive answer; different signs give a negative. So (−3) × (−2) = 6, but (−3) × 2 = −6." },
];
U[4] = [
  { k: "build", q: "Build this: <b>5 less than n</b>.", tiles: ["5", "n", "−", "+"], ans: "n-5", why: "\"5 less than n\" starts with n and takes 5 away: n − 5. Test it with n = 12: 5 less than 12 is 7, and 12 − 5 = 7." },
  { k: "build", q: "Build this: <b>double n, then add 7</b>.", tiles: ["2", "n", "+", "7", "×", "−"], ans: "2n+7", why: "Double n is 2n. Then add 7: 2n + 7." },
  { k: "mistake", q: "Write <b>three more than twice a number</b> as an expression.", lines: ["Call the number n", "Twice the number is 2n", "Three more than that is 3 × 2n"], bad: 2, fixes: ["2n + 3", "3 + n", "2n − 3"], fix: 0, why: "\"More than\" means add. Three more than 2n is 2n + 3." },
  { k: "method", q: "Kai writes \"n less than 8\" as n − 8. What is the best way for him to check?", c: ["Try a number: if n = 2, 2 less than 8 is 6, but 2 − 8 is −6", "Count the letters in the sentence", "Put the letter first, because letters always go first"], a: 0, why: "Testing with a real number shows the order. \"n less than 8\" is 8 − n." },
];
U[5] = [
  { k: "why", q: "Why can't <b>3x + 2y</b> be made any shorter?", c: ["x and y are different letters, so they are not like terms", "3 + 2 is too hard to add", "It can: it's 5xy"], a: 0, why: "Like terms have exactly the same letters. 3x and 2y are like 3 apples and 2 bananas: you can't add them into one pile." },
  { k: "mistake", q: "Simplify <b>5a + 3 − 2a + 4</b>.", lines: ["5a − 2a = 3a", "3 + 4 = 7", "Answer: 10a"], bad: 2, fixes: ["Answer: 3a + 7", "Answer: 10", "Answer: 3a − 7"], fix: 0, why: "3a and 7 are not like terms, so they stay apart: 3a + 7." },
  { k: "mistake", q: "Simplify <b>4x − 6 − x</b>.", lines: ["Circle each term with its sign: +4x, −6, −x", "4x − x = 4x", "Answer: 4x − 6"], bad: 1, fixes: ["4x − x = 3x", "4x − x = 3", "4x − x = 4"], fix: 0, why: "x on its own means 1x. 4x − 1x = 3x, so the answer is 3x − 6." },
  { k: "method", q: "In <b>7y + 2 + 3y² + y</b>, which two terms are like terms?", c: ["7y and y", "7y and 3y²", "2 and 3y²"], a: 0, why: "7y and y both have exactly one y. 3y² is y × y, a different kind of term, and 2 has no letter." },
];
U[6] = [
  { k: "why", q: "Why is <b>a × a</b> written a² and not 2a?", c: ["a × a is a times itself, but 2a is a + a", "They mean the same thing", "Because 2 is smaller than a²"], a: 0, why: "2a means two lots of a (a + a). a² means a multiplied by itself. When a = 5 they are 10 and 25." },
  { k: "mistake", q: "Simplify <b>3x × 4x</b>.", lines: ["Numbers × numbers: 3 × 4 = 12", "Letters × letters: x × x = 2x", "Answer: 12 × 2x = 24x"], bad: 1, fixes: ["x × x = x²", "x × x = x", "x × x = 2"], fix: 0, why: "x × x = x², so 3x × 4x = 12x²." },
  { k: "method", q: "What is the best way to simplify <b>12ab ÷ 4b</b>?", c: ["Divide the numbers, then cancel the matching letter b", "Take 4 away from 12", "Multiply all the numbers and letters together"], a: 0, why: "12 ÷ 4 = 3 and b ÷ b cancels, leaving 3a." },
  { k: "why", q: "Why does <b>6n ÷ 3 = 2n</b>?", c: ["6 lots of n shared into 3 groups gives 2 lots of n in each", "You take 3 away from 6", "The n disappears when you divide"], a: 0, why: "Divide the number part: 6 ÷ 3 = 2. The n stays, so it's 2n." },
];
U[7] = [
  { k: "mistake", q: "Expand <b>3(x + 4)</b>.", lines: ["3 × x = 3x", "3 × 4 = 7", "Answer: 3x + 7"], bad: 1, fixes: ["3 × 4 = 12", "3 × 4 = 34", "3 × 4 = 4"], fix: 0, why: "Everything inside the bracket gets multiplied by 3: 3x + 12." },
  { k: "mistake", q: "Expand <b>2(n − 5)</b>.", lines: ["2 × n = 2n", "2 × (−5) = −10", "Answer: 2n + 10"], bad: 2, fixes: ["Answer: 2n − 10", "Answer: 2n − 5", "Answer: n − 10"], fix: 0, why: "The −5 times 2 is −10, and the sign stays with it: 2n − 10." },
  { k: "why", q: "Why is <b>4(a + 2)</b> equal to 4a + 8 and not 4a + 2?", c: ["The 4 multiplies everything inside the bracket", "Only the letter gets multiplied", "Brackets mean \"do this first\", then you add 2"], a: 0, why: "4(a + 2) is 4 lots of (a + 2): four a's and four 2's. Check with a = 1: 4 × 3 = 12, and 4 + 8 = 12." },
  { k: "build", q: "Build the expanded form of <b>5(y + 1)</b>.", tiles: ["5y", "+", "5", "1", "y", "−"], ans: "5y+5", why: "5 × y = 5y and 5 × 1 = 5, so 5(y + 1) = 5y + 5." },
];
U[8] = [
  { k: "mistake", q: "Find <b>3x²</b> when x = 2.", lines: ["3x² = (3 × 2)²", "= 6²", "= 36"], bad: 0, fixes: ["3x² = 3 × 2²", "3x² = 3 × 2 × 2 × 2", "3x² = 32"], fix: 0, why: "In 3x², only the x is squared: 3 × 2² = 3 × 4 = 12." },
  { k: "mistake", q: "Find <b>n²</b> when n = −3.", lines: ["n² = (−3)²", "= (−3) × (−3)", "= −9"], bad: 2, fixes: ["= 9", "= −6", "= 6"], fix: 0, why: "Same signs give a positive: (−3) × (−3) = 9. A negative number squared is positive." },
  { k: "why", q: "Why do we put brackets round a negative number when we substitute, like 2 × (−4)?", c: ["So the minus sign stays with its number", "Brackets make the answer bigger", "It doesn't matter at all"], a: 0, why: "Brackets keep the sign attached. 2n with n = −4 is 2 × (−4) = −8, not 2 − 4." },
  { k: "method", q: "a = 3. Work out <b>2a + 4 × a</b>. What do you do first?", c: ["Both multiplications (2 × 3 and 4 × 3), then add", "Add 2a and 4 first", "Go left to right: 2 × 3 + 4, then × 3"], a: 0, why: "× and ÷ come before + and −. 2 × 3 = 6 and 4 × 3 = 12, then 6 + 12 = 18." },
];

/* World 2: Balance Bridge */
U[9] = [
  { k: "why", q: "Why does subtracting 5 undo adding 5?", c: ["Adding 5 then taking 5 away leaves you where you started", "Because 5 − 5 is always 10", "Subtracting is always the first step"], a: 0, why: "Add 5 and you move 5 up. Take 5 away and you move 5 back down, so you end at the number you started with." },
  { k: "method", q: "A machine does <b>× 3</b> and then <b>+ 4</b>. The output is 19. What do you undo first?", c: ["Undo the + 4 (take 4 away)", "Undo the × 3 (divide by 3)", "It doesn't matter which"], a: 0, why: "Undo the last step first, like taking off your shoes before your socks. 19 − 4 = 15, then 15 ÷ 3 = 5." },
  { k: "mistake", q: "A number was doubled, then 6 was added. The answer was 20. Find the number.", lines: ["20 ÷ 2 = 10", "10 − 6 = 4", "The number is 4"], bad: 0, fixes: ["20 − 6 = 14", "20 + 6 = 26", "20 × 2 = 40"], fix: 0, why: "The + 6 happened last, so it gets undone first: 20 − 6 = 14, then 14 ÷ 2 = 7. Check: 7 doubled is 14, add 6 is 20." },
  { k: "why", q: "What undoes <b>÷ 4</b>?", c: ["× 4", "− 4", "÷ 4 again"], a: 0, why: "Dividing by 4 splits into 4 equal parts. Multiplying by 4 puts the 4 parts back together." },
];
U[10] = [
  { k: "why", q: "The scale says <b>x + 3 = 10</b> and is level. Why can you take 3 off BOTH sides?", c: ["Taking the same amount off both sides keeps the scale level", "Because 3 is a small number", "You only need to take it off the left"], a: 0, why: "Both sides weigh the same. Take the same amount from each and they still weigh the same, so the scale stays level: x = 7." },
  { k: "mistake", q: "Solve 2x + 1 = 9 on the balance.", lines: ["2x + 1 = 9", "2x = 9", "x = 4.5"], bad: 1, fixes: ["2x = 8", "2x = 10", "2x + 1 = 8"], fix: 0, why: "The 1 was taken off the left, so it must come off the right as well: 9 − 1 = 8. Then 2x = 8 and x = 4." },
  { k: "why", q: "What does <b>=</b> mean in 3 + 5 = 4 + 4?", c: ["Both sides have the same value", "\"Write the answer next\"", "The left side is bigger"], a: 0, why: "= means the two sides balance. 3 + 5 is 8 and 4 + 4 is 8, so they are equal. It doesn't mean \"the answer comes next\"." },
  { k: "method", q: "The scale shows <b>3 bags = 12 marbles</b>. What keeps it level and finds one bag?", c: ["Split both sides into 3 equal groups", "Take 3 marbles off the right", "Add a bag to the right side"], a: 0, why: "Share both sides into 3 equal groups. One bag balances one group of 4 marbles, so one bag holds 4 marbles." },
];
U[11] = [
  { k: "why", q: "Inputs 1, 2, 3 give outputs 5, 8, 11. Why is the rule \"× 3 then something\"?", c: ["The outputs go up by 3 each time the input goes up by 1", "Because 3 is the first odd number", "Because there are 3 inputs"], a: 0, why: "Each time the input goes up by 1, the output jumps by 3, so the input is being multiplied by 3. Then 1 × 3 = 3 and 5 − 3 = 2, so the rule is × 3 + 2." },
  { k: "mistake", q: "Find the rule: input 1 → 7, input 2 → 9, input 3 → 11.", lines: ["The jump is 2, so × 2", "1 × 2 = 2, and 7 − 2 = 5", "Rule: × 2 then + 7"], bad: 2, fixes: ["Rule: × 2 then + 5", "Rule: × 7 then + 2", "Rule: + 2 each time"], fix: 0, why: "After × 2 you still need + 5 to reach 7. Check input 3: 3 × 2 + 5 = 11. ✓" },
  { k: "build", q: "Build the rule as a formula: <b>multiply the input x by 4, then take away 1</b>.", tiles: ["4", "x", "−", "1", "+"], ans: "4x-1", why: "Multiply x by 4 to get 4x, then take away 1: 4x − 1." },
  { k: "method", q: "You know the rule is <b>× 2 + 3</b> and the output is 15. How do you find the input?", c: ["Run the machine backwards: − 3, then ÷ 2", "Do × 2 + 3 to 15", "Divide 15 by 3"], a: 0, why: "To go from output back to input, undo each step in reverse: 15 − 3 = 12, 12 ÷ 2 = 6. Check: 6 × 2 + 3 = 15." },
];
U[12] = [
  { k: "why", q: "To solve <b>x − 8 = 5</b>, why do you ADD 8?", c: ["Adding 8 undoes the − 8 and leaves x on its own", "Because you always add in equations", "Because 8 is bigger than 5"], a: 0, why: "x had 8 taken away. Adding 8 undoes that, so x = 5 + 8 = 13. Do it to both sides to keep the balance." },
  { k: "method", q: "Solve <b>x ÷ 3 = 6</b>. What's the move?", c: ["Multiply both sides by 3", "Divide both sides by 3", "Take 3 from both sides"], a: 0, why: "x has been divided by 3. Multiplying by 3 undoes it: x = 18. Check: 18 ÷ 3 = 6." },
  { k: "mistake", q: "Solve 4x = 20.", lines: ["4x = 20", "x = 20 − 4", "x = 16"], bad: 1, fixes: ["x = 20 ÷ 4", "x = 20 × 4", "x = 4 − 20"], fix: 0, why: "4x means 4 × x, so undo it by dividing by 4: x = 5. Check: 4 × 5 = 20." },
  { k: "method", q: "You solved x + 9 = 14 and got x = 5. What is the best way to check?", c: ["Put 5 back in: 5 + 9 = 14 ✓", "Solve it again the same way", "Ask if 5 is a nice number"], a: 0, why: "Substituting your answer back into the equation shows whether both sides really balance." },
];
U[13] = [
  { k: "why", q: "In <b>3x + 2 = 17</b>, why do you take away the 2 BEFORE dividing by 3?", c: ["The + 2 was the last thing done to x, so it's undone first", "Because subtraction always comes first", "Dividing first would make x negative"], a: 0, why: "x was multiplied by 3, then 2 was added. Undo in reverse order: 17 − 2 = 15, then 15 ÷ 3 = 5." },
  { k: "mistake", q: "Solve 5x − 3 = 22.", lines: ["5x = 22 − 3", "5x = 19", "x = 3.8"], bad: 0, fixes: ["5x = 22 + 3", "5x = 22 ÷ 3", "x − 3 = 22 ÷ 5"], fix: 0, why: "The 3 was taken away, so undo it by adding 3: 5x = 25, so x = 5. Check: 5 × 5 − 3 = 22." },
  { k: "method", q: "Solve <b>x/2 + 4 = 10</b>. What's the first move?", c: ["Take 4 from both sides", "Multiply both sides by 2", "Divide both sides by 4"], a: 0, why: "The + 4 was done last, so undo it first: x/2 = 6, then × 2 gives x = 12." },
  { k: "build", q: "Build the equation: <b>three bags of n and 4 marbles balance 19 marbles</b>.", tiles: ["3n", "+", "4", "=", "19", "n"], ans: "3n+4=19", why: "Three bags is 3n, add 4 marbles: 3n + 4. It balances 19, so 3n + 4 = 19 (and n = 5)." },
];
U[14] = [
  { k: "why", q: "In <b>5x + 2 = 3x + 10</b>, why take 3x off both sides (not 5x)?", c: ["Taking the smaller number of x's leaves x's on one side only, and no negatives", "Because 3 is odd", "You can't take 5x away"], a: 0, why: "Taking 3x off both sides gives 2x + 2 = 10, with all the x's on the left. Taking 5x would also work, but leaves negative x's." },
  { k: "mistake", q: "Expand and solve 2(x + 4) = 18.", lines: ["2x + 4 = 18", "2x = 14", "x = 7"], bad: 0, fixes: ["2x + 8 = 18", "2x + 6 = 18", "x + 8 = 18"], fix: 0, why: "The 2 multiplies everything in the bracket: 2 × x and 2 × 4. So 2x + 8 = 18, 2x = 10, x = 5." },
  { k: "method", q: "Solve <b>4x − 1 = x + 11</b>. What's a good first move?", c: ["Take x off both sides", "Add 4 to both sides", "Divide everything by 4"], a: 0, why: "Taking x off both sides gives 3x − 1 = 11. Then add 1 (3x = 12) and divide by 3: x = 4." },
  { k: "why", q: "Is <b>3(x + 2) = 3x + 6</b> true for every x?", c: ["Yes: the 3 multiplies both x and 2", "No, only when x = 2", "No, it should be 3x + 2"], a: 0, why: "Expanding the bracket gives 3 × x + 3 × 2 = 3x + 6, whatever x is. Try x = 10: 3 × 12 = 36 and 30 + 6 = 36." },
];
U[15] = [
  { k: "build", q: "Build the equation: <b>Sam has n stickers. Mia has 3 more than Sam. Together they have 21.</b>", tiles: ["n", "+", "n", "+", "3", "=", "21", "×"], ans: "n+n+3=21", why: "Sam has n and Mia has n + 3. Together: n + n + 3 = 21, which is 2n + 3 = 21, so n = 9." },
  { k: "method", q: "\"A rectangle is 3 cm longer than it is wide. Its perimeter is 26 cm.\" What should you do first?", c: ["Name the width w, so the length is w + 3", "Divide 26 by 4", "Multiply 26 by 3"], a: 0, why: "Name it, write it, solve it, answer it. With width w the perimeter is w + w + 3 + w + w + 3 = 4w + 6 = 26, so w = 5 cm." },
  { k: "mistake", q: "\"I think of a number, multiply it by 4 and subtract 7. I get 25.\"", lines: ["4n − 7 = 25", "4n = 18", "n = 4.5"], bad: 1, fixes: ["4n = 32", "4n = 25", "n − 7 = 100"], fix: 0, why: "Undo the − 7 by adding 7: 4n = 32, so n = 8. Check: 8 × 4 − 7 = 25." },
  { k: "why", q: "You solve a word problem and get n = 6. Why write a sentence answer like \"Sam has 6 stickers\"?", c: ["The question asked about stickers, not n", "Sentences get more marks for neatness", "Because n is a secret"], a: 0, why: "n is just the name you gave the unknown. The answer should say what it means in the story, with units." },
];
U[16] = [
  { k: "why", q: "Make a the subject of <b>P = a + b</b>. Why do you subtract b from both sides?", c: ["It undoes + b and leaves a on its own", "Because P is bigger than b", "Because you always subtract letters"], a: 0, why: "Rearranging is solving but keeping the letters: P − b = a, so a = P − b." },
  { k: "mistake", q: "Make x the subject of <b>y = 3x + 2</b>.", lines: ["y = 3x + 2", "y − 2 = 3x", "x = (y − 2) × 3"], bad: 2, fixes: ["x = (y − 2) ÷ 3", "x = y ÷ 3 − 2", "x = y − 2 − 3"], fix: 0, why: "x was multiplied by 3, so divide by 3 to undo it: x = (y − 2) ÷ 3." },
  { k: "method", q: "Make w the subject of <b>A = l × w</b>.", c: ["Divide both sides by l", "Take l from both sides", "Multiply both sides by l"], a: 0, why: "w is multiplied by l, so divide both sides by l: w = A ÷ l." },
  { k: "why", q: "Why does rearranging <b>d = s × t</b> to <b>t = d ÷ s</b> work?", c: ["Dividing both sides by s undoes × s and keeps the balance", "Because d, s and t are in alphabetical order", "Because t is always the smallest"], a: 0, why: "It's the same as solving: s × t = d, so divide both sides by s. Check with numbers: 12 = 4 × 3 gives 3 = 12 ÷ 4." },
];

/* World 3: Pattern Peaks */
U[17] = [
  { k: "why", q: "A pattern of squares: 4, 7, 10, 13 matchsticks. Why does \"3 × position + 1\" work for EVERY position?", c: ["Each new square adds 3 matchsticks, and there is 1 starting stick", "Because it works for the first one", "Because 3 + 1 = 4"], a: 0, why: "Every square needs 3 new sticks, and one extra stick starts the row. So position n needs 3n + 1 sticks." },
  { k: "method", q: "Tom checks a rule on position 1 only and says it's right. What should he do?", c: ["Test it on other positions too", "Nothing, one check is enough", "Change the rule"], a: 0, why: "A rule must work for every position. Lots of different rules fit one position; testing more positions shows it's the right one." },
  { k: "mistake", q: "Tables seat people: 1 table → 6, 2 tables → 10, 3 tables → 14.", lines: ["It goes up by 4 each time", "So the rule is 4 × tables", "10 tables seat 40"], bad: 1, fixes: ["The rule is 4 × tables + 2", "The rule is 6 × tables", "The rule is tables + 4"], fix: 0, why: "4 × 1 = 4, but 1 table seats 6, so add 2: 4 × tables + 2. Then 10 tables seat 42." },
  { k: "why", q: "In a pattern, what is the part that \"stays the same\"?", c: ["The bit that is in every picture, no matter the position", "The first picture", "The biggest number"], a: 0, why: "Look for what is in every picture (the constant) and what grows each time (the jump). Together they make the rule." },
];
U[18] = [
  { k: "method", q: "Find the 10th term of 5, 9, 13, 17, …", c: ["Find the jump (4) and keep adding, or use a rule", "Multiply 17 by 10", "Add 10 to 17"], a: 0, why: "The jump is 4. Keep adding 4: 21, 25, 29, 33, 37, 41, so the 10th term is 41." },
  { k: "mistake", q: "Continue 20, 17, 14, 11, …", lines: ["The jump is − 3", "Next terms: 8, 5, 2", "Then: 1, 0"], bad: 2, fixes: ["Then: −1, −4", "Then: 2, 2", "Then: 0, −3"], fix: 0, why: "Keep taking 3 away, even past zero: 2 − 3 = −1, −1 − 3 = −4." },
  { k: "why", q: "Is 50 in the sequence 3, 7, 11, 15, …?", c: ["No: every term is 1 less than a multiple of 4, and 50 isn't", "Yes, the sequence goes up forever", "Yes, 50 is even"], a: 0, why: "The terms are 4, 8, 12, 16… take away 1. 51 would be 1 less than 52, but 50 isn't 1 less than a multiple of 4." },
  { k: "build", q: "Build the term-to-term rule for 2, 6, 18, 54, … as \"next = …\" using <b>t</b> for this term.", tiles: ["3", "t", "+", "4", "×"], ans: "3t", why: "Each term is 3 times the one before: 2 × 3 = 6, 6 × 3 = 18. So next = 3t." },
];
U[19] = [
  { k: "why", q: "The sequence 7, 10, 13, 16 goes up by 3. Why does its nth term start with <b>3n</b>?", c: ["Going up by 3 each time is like the 3 times table", "Because the first term is 3 away from 10", "Because there are 3 digits"], a: 0, why: "The 3 times table (3, 6, 9, 12) also jumps by 3. Each term is 4 more than the matching number in the 3 times table (3, 6, 9, 12), so the nth term is 3n + 4." },
  { k: "mistake", q: "Find the nth term of 5, 7, 9, 11.", lines: ["The jump is 2, so 2n", "2n gives 2, 4, 6, 8", "Each term is 2n + 5"], bad: 2, fixes: ["Each term is 2n + 3", "Each term is 5n + 2", "Each term is n + 2"], fix: 0, why: "5 − 2 = 3, so add 3: 2n + 3. Check n = 4: 2 × 4 + 3 = 11. ✓" },
  { k: "build", q: "Build the nth term of 1, 5, 9, 13, …", tiles: ["4n", "−", "3", "+", "n"], ans: "4n-3", why: "Jump 4 → 4n gives 4, 8, 12, 16. Each term is 3 less, so 4n − 3." },
  { k: "method", q: "Which term of 4n + 1 equals 41?", c: ["Solve 4n + 1 = 41", "Work out 4 × 41 + 1", "Divide 41 by 4"], a: 0, why: "Set the nth term equal to 41 and solve: 4n = 40, so n = 10. The 10th term is 41." },
];
U[20] = [
  { k: "why", q: "1, 4, 9, 16, 25: the jumps are 3, 5, 7, 9. Why does that tell you n² is involved?", c: ["The jumps grow by the same amount (2) each time, which is what square numbers do", "Because the jumps are odd", "Because 25 is the biggest"], a: 0, why: "A linear sequence has a fixed jump. When the jumps themselves grow steadily, the sequence is quadratic, and n² is in the rule." },
  { k: "mistake", q: "Find the nth term of 4, 7, 12, 19, 28.", lines: ["Jumps: 3, 5, 7, 9, growing by 2", "So n² is involved: 1, 4, 9, 16, 25", "Each term is n² × 4"], bad: 2, fixes: ["Each term is n² + 3", "Each term is 2n² + 2", "Each term is n + 3"], fix: 0, why: "Compare with n²: 4 − 1 = 3, 7 − 4 = 3, 12 − 9 = 3. The same each time, so n² + 3." },
  { k: "method", q: "Find the nth term of 2, 8, 18, 32.", c: ["Compare it with n² (1, 4, 9, 16): each term is double", "Find the jump and use the times table", "Add 6 each time"], a: 0, why: "2 = 2 × 1, 8 = 2 × 4, 18 = 2 × 9. Each term is double the square number: 2n²." },
  { k: "build", q: "Build the nth term: <b>each term is 1 less than a square number</b>.", tiles: ["n²", "−", "1", "+", "2n"], ans: "n²-1", why: "The square numbers are n², so 1 less is n² − 1: 0, 3, 8, 15…" },
];

/* World 4: Robot Factory */
U[22] = [
  { k: "why", q: "Why must a robot's instructions be exact?", c: ["A robot does exactly what it's told, nothing more", "Robots like long instructions", "So it goes faster"], a: 0, why: "A robot can't guess what you meant. Each step must be clear and in the right order." },
  { k: "mistake", q: "Flowchart: start with 6, × 2, − 5, output.", lines: ["6 × 2 = 12", "12 − 5 = 17", "Output 17"], bad: 1, fixes: ["12 − 5 = 7", "6 − 5 = 1", "12 + 5 = 17"], fix: 0, why: "Follow each box in order: 6 × 2 = 12, then 12 − 5 = 7." },
  { k: "method", q: "A flowchart asks <b>\"Is the number bigger than 10?\"</b> with Yes and No arrows. What is this box for?", c: ["It makes a decision, so different numbers take different paths", "It adds 10", "It ends the flowchart"], a: 0, why: "A diamond-shaped decision box sends the number down the Yes path or the No path." },
  { k: "build", q: "A flowchart does: input n, × 5, + 2. Build the output as a formula.", tiles: ["5n", "+", "2", "×", "n"], ans: "5n+2", why: "n times 5 is 5n, then add 2: 5n + 2." },
];

export const UNDERSTANDING = U;
