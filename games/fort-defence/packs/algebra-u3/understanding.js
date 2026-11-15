/* Algebra Unit 3: understanding questions (new for Fort Defence). They earn crystal, the best loot.
   Formats (see js/qui.js UnderstandCard):
     why     { k:"why", q, c:[choices], a:index of the right one, why }
     method  { k:"method", q, c, a, why }
     mistake { k:"mistake", q, lines:[the goblin's worked lines], bad:index of the first wrong line, fixes:[what that line should say], fix, why }
     build   { k:"build", q, tiles:[...], ans:"the expression or equation", why }   (checked by value, so 2 × n + 7 and 2n + 7 both count)
   Choices are shuffled when shown, so the right answer can always be listed first here.
   Keyed by topic id. Written 15 November 2026 for Rudi to check. */
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
  { k: "why", q: "Why does <b>5 − (−2)</b> give 7?", c: ["Taking away a negative is the same as adding it", "Two minus signs always make a minus", "You can ignore the brackets"], a: 0, why: "− (−2) is the same as + 2. So 5 − (−2) = 5 + 2 = 7." },
  { k: "mistake", q: "Work out <b>−3 − 4</b> on a number line.", lines: ["Start at −3", "− 4 means walk 4 to the right", "You land on 1"], bad: 1, fixes: ["− 4 means walk 4 to the left", "− 4 means stay where you are", "− 4 means jump straight to 4"], fix: 0, why: "Taking away a positive number means walking left. From −3, walk 4 to the left and you land on −7." },
  { k: "method", q: "Which of these is the same as <b>6 + (−4)</b>?", c: ["6 − 4", "6 + 4", "−6 − 4"], a: 0, why: "Adding a negative is the same as taking away: + (−4) is − 4. So 6 + (−4) = 2." },
  { k: "why", q: "Why is <b>(−3) × (−2)</b> positive?", c: ["The two numbers have the same sign, so the answer is positive", "You always drop the minus signs when you multiply", "A negative times anything is negative"], a: 0, why: "Same signs give a positive answer; different signs give a negative. So (−3) × (−2) = 6, but (−3) × 2 = −6." },
];
U[4] = [
  { k: "build", q: "Build this: <b>5 less than n</b>.", tiles: ["5", "n", "−", "+"], ans: "n-5", why: "\"5 less than n\" starts with n and takes 5 away: n − 5. Test it: 5 less than 10 is 5, and 10 − 5 = 5." },
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

export const UNDERSTANDING = U;
