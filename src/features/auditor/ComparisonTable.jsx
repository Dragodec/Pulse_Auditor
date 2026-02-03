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
    <div className="w-full overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[650px]">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="sticky left-0 z-20 bg-neutral-900 p-6 text-[10px] font-black uppercase tracking-widest text-neutral-500">Metric</th>
              {repos.map((repo) => (
                <th key={repo.full_name} className="p-6">
                  <div className="text-emerald-500 text-[10px] font-black uppercase mb-1">{repo.owner.login}</div>
                  <div className="text-white text-lg font-black leading-none">{repo.name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                <td className="sticky left-0 z-10 bg-neutral-900 p-6 font-bold text-sm text-neutral-400 group-hover:text-white transition-colors">
                  {row.label}
                </td>
                {repos.map((repo) => {
                  const severity = getScoreSeverity(repo.score);
                  return (
                    <td key={`${repo.full_name}-${row.label}`} className="p-6 font-mono font-black text-white">
                      <span className={
                        row.key === 'score' 
                          ? (severity === 'healthy' ? 'text-emerald-400' : severity === 'warning' ? 'text-amber-400' : 'text-rose-400') 
                          : ''
                      }>
                        {row.format(repo[row.key])}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
            {/* New Row: Risk Flags */}
            <tr className="hover:bg-white/5 transition-colors">
              <td className="sticky left-0 z-10 bg-neutral-900 p-6 font-bold text-sm text-neutral-400">Alerts</td>
              {repos.map((repo) => (
                <td key={`${repo.full_name}-flags`} className="p-6">
                  <div className="flex flex-wrap gap-1">
                    {repo.flags.length > 0 ? repo.flags.map(f => (
                      <span key={f} className="text-[8px] bg-rose-500/10 text-rose-500 px-1.5 py-0.5 rounded border border-rose-500/20 font-black">
                        {f}
                      </span>
                    )) : <span className="text-[8px] text-emerald-500 font-black uppercase">Clear</span>}
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