import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { getScoreSeverity } from './scoringFormula';

/**
 * VitalityCard
 * Displays the core health metrics and the animated score.
 * Demonstrates GSAP for numerical precision and Tailwind for dynamic styling.
 */
const VitalityCard = ({ stats }) => {
  const scoreRef = useRef(null);
  const severity = getScoreSeverity(stats.score);

  // GSAP: Animate the number from 0 to the calculated score
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        scoreRef.current,
        { textContent: 0 },
        {
          textContent: stats.score,
          duration: 1.5,
          ease: 'power3.out',
          snap: { textContent: 1 },
          stagger: {
            each: 1.0,
          },
        }
      );
    });
    return () => ctx.revert();
  }, [stats.score]);

  // Dynamic Styles based on health
  const themes = {
    healthy: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
    warning: 'border-amber-500/20 bg-amber-500/5 text-amber-400',
    critical: 'border-rose-500/20 bg-rose-500/5 text-rose-400',
  };

  return (
    <div className={`rounded-2xl border p-8 transition-all ${themes[severity]}`}>
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        
        {/* Left: Main Score Display */}
        <div className="flex-1">
          <h2 className="text-sm font-medium uppercase tracking-widest opacity-70">
            Vitality Score
          </h2>
          <div className="flex items-baseline gap-2">
            <span 
              ref={scoreRef} 
              className="text-8xl font-black tracking-tighter"
            >
              0
            </span>
            <span className="text-2xl font-bold opacity-50">/100</span>
          </div>
          <p className="mt-4 max-w-md text-lg leading-relaxed brightness-125">
            {stats.description || "No description provided for this repository."}
          </p>
        </div>

        {/* Right: Breakdown Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto">
          <StatBox 
            label="Monthly Commits" 
            value={stats.commitsCount} 
            sub="Last 30 days" 
          />
          <StatBox 
            label="Avg Resolution" 
            value={`${stats.avgResolutionDays.toFixed(1)}d`} 
            sub="Issue turnaround" 
          />
          <StatBox 
            label="Open Issues" 
            value={stats.openIssues} 
            sub="Current backlog" 
          />
          <StatBox 
            label="License" 
            value={stats.license} 
            sub="Legal health" 
          />
        </div>
      </div>

      {/* Visual Indicator Bar */}
      <div className="mt-8 h-2 w-full bg-black/20 rounded-full overflow-hidden">
        <div 
          className="h-full bg-current transition-all duration-1000 ease-out"
          style={{ width: `${stats.score}%` }}
        />
      </div>
    </div>
  );
};

/**
 * Internal Sub-component for consistent stat layout
 */
const StatBox = ({ label, value, sub }) => (
  <div className="p-4 rounded-xl bg-black/10 border border-white/5 flex flex-col">
    <span className="text-xs uppercase opacity-60 font-semibold">{label}</span>
    <span className="text-2xl font-bold my-1">{value}</span>
    <span className="text-[10px] opacity-50 uppercase tracking-tighter">{sub}</span>
  </div>
);

export default VitalityCard;