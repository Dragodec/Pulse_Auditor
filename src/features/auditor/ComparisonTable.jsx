import React from 'react';
import { getScoreSeverity } from './scoringFormula';

const ComparisonTable = ({ repos }) => {
  if (!repos || repos.length === 0) return null;

  const rows = [
    { label: 'Score', key: 'score', format: (v) => `${v}/100` },
    { label: 'Confidence', key: 'confidence', format: (v) => v.toUpperCase() },
    { label: 'Lead Share', key: 'riskRatio', format: (v) => `${v}%` },
    { label: 'Stars', key: 'stars', format: (v) => v.toLocaleString() },
  ];

  return (
    <div className="w-full overflow-hidden rounded-[40px] border border-white/10 bg-neutral-900/50 shadow-2xl backdrop-blur-md">
      <div className="overflow-x-auto custom-scrollbar">
        {/* Increased min-width to ensure columns have breathing room */}
        <table className="w-full text-left border-collapse min-w-[850px]">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="sticky left-0 z-30 bg-neutral-900 p-8 text-[11px] font-black uppercase tracking-[0.3em] text-neutral-500 border-r border-white/5">
                Metric
              </th>
              {repos.map((repo) => (
                <th key={repo.full_name} className="p-8">
                  <div className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-2">
                    {repo.owner.login}
                  </div>
                  {/* Larger header typography */}
                  <div className="text-white text-2xl font-black tracking-tighter leading-tight break-words max-w-[250px]">
                    {repo.name}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                <td className="sticky left-0 z-20 bg-neutral-900 p-8 font-black text-xs uppercase tracking-widest text-neutral-400 group-hover:text-white transition-colors border-r border-white/5 shadow-[10px_0_15px_rgba(0,0,0,0.2)]">
                  {row.label}
                </td>
                {repos.map((repo) => {
                  const severity = getScoreSeverity(repo.score);
                  return (
                    <td key={`${repo.full_name}-${row.label}`} className="p-8 font-mono font-black text-lg md:text-xl text-white">
                      <span className={
                        row.key === 'score' 
                          ? (severity === 'healthy' ? 'text-emerald-400' : severity === 'warning' ? 'text-amber-400' : 'text-rose-400') 
                          : 'opacity-90'
                      }>
                        {row.format(repo[row.key])}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
            
            {/* Risk Flags Row with better spacing */}
            <tr className="hover:bg-white/[0.02] transition-colors group">
              <td className="sticky left-0 z-20 bg-neutral-900 p-8 font-black text-xs uppercase tracking-widest text-neutral-400 group-hover:text-white border-r border-white/5 shadow-[10px_0_15px_rgba(0,0,0,0.2)]">
                Alerts
              </td>
              {repos.map((repo) => (
                <td key={`${repo.full_name}-flags`} className="p-8">
                  <div className="flex flex-wrap gap-2 max-w-[250px]">
                    {repo.flags && repo.flags.length > 0 ? (
                      repo.flags.map(f => (
                        <span key={f} className="text-[9px] bg-rose-500/10 text-rose-500 px-3 py-1.5 rounded-xl border border-rose-500/20 font-black uppercase tracking-tight whitespace-nowrap">
                          ⚠️ {f.replace(/_/g, ' ')}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-lg">
                        Optimal
                      </span>
                    )}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonTable;