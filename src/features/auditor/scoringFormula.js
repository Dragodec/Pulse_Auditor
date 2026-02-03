/**
 * Pulse Reliability Heuristic V3
 * Focus: Risk Mitigation, Consistency, and Data Confidence.
 */

const STAGNATION_THRESHOLD_DAYS = 90;  // First sign of drift
const CRITICAL_STAGNATION_DAYS = 365; // Total abandonment
const BUS_FACTOR_THRESHOLD = 0.75;    // >75% control by one person is a SPOF
const MIN_DATA_POINTS = 5;            // Minimum events to feel "Confident"

export const calculateHealthScore = (metrics) => {
  const { commits = [], avgResolutionDays, openIssues, isArchived } = metrics;
  
  const flags = [];
  let confidence = "high";
  
  // 1. ARCHIVAL KILL-SWITCH
  if (isArchived) {
    return {
      score: 0,
      severity: "critical",
      confidence: "high",
      flags: ["ARCHIVED"],
      explanation: "Repository is officially archived and read-only."
    };
  }

  const totalCommits = commits.length;
  const lastCommitDate = commits[0] ? new Date(commits[0].commit.author.date) : null;
  const daysSinceLastCommit = lastCommitDate ? (new Date() - lastCommitDate) / 86400000 : 999;

  // 2. DATA SUFFICIENCY (CONFIDENCE)
  if (totalCommits < MIN_DATA_POINTS) confidence = "low";
  else if (totalCommits < 15) confidence = "medium";

  // 3. ACTIVITY CONSISTENCY (40 Points)
  // Calculate unique days with commits to distinguish "Consistency" from "Bursts"
  const uniqueDays = new Set(commits.map(c => new Date(c.commit.author.date).toDateString())).size;
  let activityScore = (uniqueDays / 10) * 40; 
  if (uniqueDays < 2 && totalCommits > 0) flags.push("BURST_ACTIVITY");

  // 4. RESPONSIVENESS (30 Points)
  let responsivenessScore = 0;
  if (avgResolutionDays > 0) {
    responsivenessScore = Math.max(0, 30 - (avgResolutionDays * 3));
  } else if (totalCommits > 0) {
    responsivenessScore = 10; // Neutral baseline for repos with no issues
    flags.push("NO_ISSUE_DATA");
  }

  // 5. MAINTENANCE DRIFT (The Stagnation Tax)
  let stagnationPenalty = 0;
  if (daysSinceLastCommit > STAGNATION_THRESHOLD_DAYS) {
    stagnationPenalty = 20;
    flags.push("STALE_MAINTENANCE");
  }
  if (daysSinceLastCommit > CRITICAL_STAGNATION_DAYS) {
    stagnationPenalty = 60;
    flags.push("ABANDONED");
  }

  // 6. MAINTAINER CONCENTRATION (Bus Factor)
  const contribMap = commits.reduce((acc, c) => {
    const author = c.author?.login || 'unknown';
    acc[author] = (acc[author] || 0) + 1;
    return acc;
  }, {});
  const counts = Object.values(contribMap).sort((a,b)=>b-a);
  const topShare = (counts[0] || 0) / (totalCommits || 1);
  const busFactorPenalty = topShare > BUS_FACTOR_THRESHOLD ? 15 : 0;
  if (busFactorPenalty > 0) flags.push("HIGH_BUS_FACTOR");

  // FINAL CALCULATION
  const rawScore = Math.round(activityScore + responsivenessScore + 30 - stagnationPenalty - busFactorPenalty);
  const score = Math.max(0, Math.min(100, rawScore));

  // SEVERITY MAPPING
  let severity = "healthy";
  if (score < 80) severity = "warning";
  if (score < 50 || daysSinceLastCommit > CRITICAL_STAGNATION_DAYS) severity = "critical";
  if (confidence === "low" && score > 50) severity = "unknown";

  return {
    score,
    severity,
    confidence,
    flags,
    riskRatio: Math.round(topShare * 100),
    explanation: generateSummary(score, daysSinceLastCommit, topShare, flags)
  };
};

const generateSummary = (score, days, share, flags) => {
  if (days > 365) return "Project is functionally abandoned.";
  if (share > 0.9) return "Critical dependency on a single maintainer.";
  if (flags.includes("BURST_ACTIVITY")) return "Activity is irregular; maintenance may be inconsistent.";
  return score > 80 ? "Project shows healthy, distributed maintenance." : "Project shows signs of maintenance drift.";
};
/**
 * Helper to determine UI coloring based on score
 * Used by ComparisonTable and other UI components
 */
export const getScoreSeverity = (score) => {
  if (score >= 80) return 'healthy';
  if (score >= 50) return 'warning';
  return 'critical';
};