📊 Pulse Auditor (V3)
Pulse Auditor is a conservative repository reliability tool built to help developers move beyond "Star Bias." It prioritizes maintenance resilience and operational risk over raw popularity.

🛠 What It Is
A frontend-heavy diagnostic utility that evaluates GitHub repositories using a custom Reliability Heuristic (V3). It acts as a "Reliability Analyst," providing an objective verdict on whether a dependency is safe for long-term production use.

🔍 What It Does
Active Validation Scoring: Repositories must "earn" their score through consistent, unique days of activity rather than high-volume bursts.
Maintenance Drift Detection: Implements a "Stagnation Tax" that penalizes projects based on the time elapsed since the last meaningful heartbeat.
Bus Factor Analysis: Quantifies "Maintainer Concentration" to identify single points of failure (SPOFs) where one developer owns >75% of recent work.
Confidence Intervals: Explicitly flags audits as "Low Confidence" if there is insufficient data (e.g., < 5 commits) to make a reliable judgment.
Markdown Export: Generates professional audit summaries to be pasted into Jira, Slack, or GitHub issues for team decision-making.

🚫 What It Doesn't Do
No Code Quality Analysis: It does not read your source code or check for bugs; it evaluates the maintenance process.
No Popularity Contests: It ignores star counts and forks as "vanity metrics" that don't guarantee current maintenance.
No Future Predictions: It evaluates historical and current signals; it cannot predict if a maintainer will quit tomorrow.
🏗 The Reliability Heuristic (The Logic)
The project uses an Active-Validation Model. Unlike traditional metrics that start at 100, Pulse assumes High Uncertainty and requires data to prove reliability.

Scoring Weights:
Activity Consistency (40%): Measures unique days of activity to penalize "Zingen-style" bursts.
Responsiveness (30%): Measures average issue resolution speed.
Baseline Resilience (30%): A starting baseline that is eroded by Stagnation Penalties and High Bus Factors.

🚀 Tech Stack & Development
Core: React.js, Tailwind CSS, Framer Motion.
API: GitHub REST API (Client-side fetching).
Workflow: Developed using an AI-Orchestrated workflow, where I acted as the Architect and Reliability Analyst, identifying and patching "Ghost Vitality" edge cases through iterative prompt engineering and rigorous manual testing.

⚡ Quick Start
Clone the repo.
Add your VITE_GITHUB_TOKEN to .env.
npm install && npm run dev
Paste any GitHub URL for an instant audit.
