What you are looking for is called an **Adaptive Learning Algorithm** or a **Dynamic Difficulty Adjustment (DDA)** system.

If you want the difficulty to feel smooth, natural, and unpredictable (instead of a jarring jump every 3 or 4 questions), you need to move away from "rule-based" increments and move toward **probabilistic** or **continuous** scaling.

Here are the best algorithms and frameworks that achieve exactly this, ranked from standard educational models to more unpredictable, game-like systems.

---

## 1. Item Response Theory (IRT) & Computer Adaptive Testing (CAT)

This is the gold standard used by major exams like the GRE, GMAT, and Duolingo.

* **How it works:** Instead of just tracking *how many* questions you get right, IRT calculates the specific **probability** that a user with a certain ability level will answer a specific question correctly.
* **Why it feels unpredictable:** Every question in your database is tagged with a "difficulty parameter." If a user gets a question right, the system recalculates their estimated ability instantly and picks a new question from a pool that matches that new ability. Because questions have varying degrees of difficulty, the progression feels like a smooth, organic curve rather than a staircase.

## 2. The Elo Rating System (with Volatility)

Originally designed for chess, the Elo rating system is fantastic for adaptive learning. You treat the **User** as Player A and the **Question** as Player B.

* **How it works:** Both the user and the questions have a rating (e.g., 1200).
* If the user answers correctly, they "win" points from the question, increasing their rating.
* If they answer incorrectly, they "lose" points to the question.


* **Why it feels unpredictable:** The difficulty doesn't scale linearly. If a user gets a *very hard* question right, their rating jumps significantly. If they get an *easy* question right, their rating barely moves. Because the algorithm constantly searches for a question close to the user's current rating, the progression feels completely fluid and personalized.

## 3. The Multi-Armed Bandit (Epsilon-Greedy / Thompson Sampling)

If you want to intentionally inject unpredictability so the user can't guess the pattern, you use a reinforcement learning approach like the Multi-Armed Bandit.

* **How it works:** The algorithm balances **Exploitation** (giving the user a question at the exact difficulty they should be at) and **Exploration** (randomly throwing in a slightly easier or slightly harder question to test their limits or give them a breather).
* **Why it feels unpredictable:** Using an **$\epsilon$-greedy (epsilon-greedy)** approach, you might set the algorithm to exploit 85% of the time, but *explore* 15% of the time. That 15% randomness ensures the user never feels like they are on a predictable assembly line of escalating difficulty.

---

## How to implement this simply (The "Micro-Step + Random Pool" Approach)

If you don't want to build a heavy mathematical model, you can code a simple, unpredictable system using a **Continuous Score + Floating Window** logic:

1. **Track a Hidden Score:** Give the user a continuous skill score (e.g., starting at `1.0`).
2. **Micro-Adjustments:** Instead of adding `+1` difficulty after 3 right answers, adjust the score after *every single question* by a small decimal based on time taken or confidence. (e.g., Correct answer = `+0.15`, Fast correct answer = `+0.22`).
3. **The Floating Window (The Secret to Unpredictability):** When fetching the next question, don't look for a question that equals exactly `1.35`. Look for a question in a random range around that score (e.g., `Current Score ± 0.3`).

This ensures that even if the user is getting smarter, the next question might occasionally be a tiny bit easier or a step harder, keeping them engaged without feeling a predictable "level up" pattern.

Which of these approaches fits the tech stack or project you are building best?


For a learning application, the best choice depends entirely on your current stage of development and the size of your question database.

Here is the breakdown of which one to choose, but **the Elo Rating System is usually the undisputed winner for modern learning apps.**

## 1. The Winner: The Elo Rating System

If you are building an app meant to scale (like a language learning app, coding platform, or math tutor), **Elo is your best choice.**

**Why it’s perfect for learning apps:**
The biggest headache in building a learning app is figuring out how difficult a question actually is. You might *think* a question is a "Level 3," but users might fail it 80% of the time, making it a "Level 8."

Elo solves this through **self-calibration**.

* Every time a user gets a question wrong, the user's rating drops, and the *question's* rating increases (because it proved to be hard).
* Over time, your system automatically figures out exactly how hard every single question in your database is without you having to manually tag them.

**The Math (Simplified):**
When a user (Rating $R_A$) answers a question (Rating $R_B$), you calculate their expected probability of getting it right:


$$E_A = \frac{1}{1 + 10^{(R_B - R_A)/400}}$$


If they get it right, their new rating is adjusted using a multiplier ($K$):


$$R_A^\prime = R_A + K(1 - E_A)$$


If they get it wrong, the formula is:


$$R_A^\prime = R_A + K(0 - E_A)$$

## 2. The MVP Choice: Micro-Step + Floating Window

If you are building an MVP (Minimum Viable Product), have a small database (under 500 questions), or don't have thousands of users yet, **go with the Micro-Step + Floating Window.**

**Why it’s perfect for early apps:**
Elo requires a decent amount of user data to accurately calibrate the questions. If you only have 50 users, the Elo ratings will swing too wildly. The Micro-Step approach relies on your manual tags (e.g., questions tagged 1 to 10) but adds the necessary unpredictability.

* **Step 1:** User starts at difficulty `2.0`.
* **Step 2:** They get a question right. Score moves to `2.2`.
* **Step 3:** The app searches for the next question. Instead of looking for `2.2`, it generates a random number between `1.8` and `2.6` and serves that question.

It takes less than an hour to write the logic, requires no advanced math, and provides that smooth, unpredictable difficulty curve you are looking for immediately.

## What to Avoid

Do not try to implement **Item Response Theory (IRT)**. While it is incredibly accurate, it requires pre-testing your questions on hundreds of users to calculate statistical curves before the app even launches. It is massive overkill for almost all startup learning applications.