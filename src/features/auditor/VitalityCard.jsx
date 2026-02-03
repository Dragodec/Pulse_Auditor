import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { getScoreSeverity } from './scoringFormula';

const VitalityCard = ({ stats }) => {
  const scoreRef = useRef(null);
  const severity = getScoreSeverity(stats.score);

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
        }
      );
    });
    return () => ctx.revert();
  }, [stats.score]);

  const themes = {
    healthy: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
    warning: 'border-amber-500/20 bg-amber-500/5 text-amber-400',
    critical: 'border-rose-500/20 bg-rose-500/5 text-rose-400',
  };

  return (
    <div className={`rounded-3xl border p-6 md:p-10 transition-all ${themes[severity]}`}>
      <div className="flex flex-col lg:flex-row justify-between items-start gap-10">
        
        {/* Left: Main Score Display */}
        <div className="flex-1 w-full">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-2">
            Vitality Score
          </h2>
          <div className="flex items-baseline gap-3">
            <span 
              ref={scoreRef} 
              className="text-7xl md:text-9xl font-black tracking-tighter"
            >
              0
            </span>
            <span className="text-3xl font-bold opacity-40">/100</span>
          </div>
          <p className="mt-6 max-w-xl text-lg md:text-xl font-medium leading-relaxed brightness-110">
            {stats.description || "No description provided for this repository."}
          </p>
        </div>

        {/* Right: Breakdown Stats - Larger text and robust grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-[450px]">
          <StatBox 
            label="Monthly Commits" 
            value={stats.commits.length} 
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
            value={stats.license || "N/A"} 
            sub="Legal health" 
          />
        </div>
      </div>

      {/* Visual Indicator Bar */}
      <div className="mt-10 h-3 w-full bg-black/30 rounded-full overflow-hidden">
        <div 
          className="h-full bg-current transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(0,0,0,0.5)]"
          style={{ width: `${stats.score}%` }}
        />
      </div>
    </div>
  );
};

const StatBox = ({ label, value, sub }) => (
  <div className="p-5 rounded-2xl bg-black/20 border border-white/5 flex flex-col justify-center min-h-[110px]">
    <span className="text-[10px] uppercase opacity-50 font-black tracking-widest mb-1">{label}</span>
    <span className="text-3xl font-black text-white">{value}</span>
    <span className="text-[10px] opacity-40 uppercase font-bold mt-1">{sub}</span>
  </div>
);

export default VitalityCard;