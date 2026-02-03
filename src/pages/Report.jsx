import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRepoStats } from '../features/auditor/useRepoStats';
import { generateMarkdownReport } from '../features/auditor/exportUtils';
import VitalityCard from '../features/auditor/VitalityCard';
import Button from '../components/ui/Button';
import { toast } from 'react-hot-toast';

const Report = () => {
  const { owner, repo } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useRepoStats(owner, repo);

  const handleCopyReport = () => {
    if (!data) return;
    const report = generateMarkdownReport(data);
    navigator.clipboard.writeText(report);
    toast.success('Report cached to clipboard', { icon: '📋' });
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto px-6 py-24 animate-pulse">
      <div className="h-10 w-48 bg-white/5 rounded-xl mb-6" />
      <div className="h-96 w-full bg-white/5 rounded-[40px] mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <div key={i} className="h-48 bg-white/5 rounded-3xl" />)}
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="max-w-xl mx-auto px-6 py-32 text-center">
      <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 font-black text-2xl">!</div>
      <h1 className="text-2xl font-black mb-4 uppercase tracking-tighter">Analysis Interrupted</h1>
      <Button onClick={() => navigate('/')}>Return to Pulse</Button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-16 overflow-x-hidden min-h-screen">
      {/* Header - Fixed Buttons and Title wrap */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 mb-12">
        <div className="space-y-6 w-full max-w-full overflow-hidden">
          <button 
            onClick={() => navigate('/')} 
            className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            ← Back to Auditor
          </button>
          
          <div className="max-w-full">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter text-white break-words leading-[0.9]">
              {owner}<span className="text-white/20">/</span><br className="sm:hidden" />{repo}
            </h1>
            
            <div className="mt-6 flex flex-wrap gap-3">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-lg shadow-black/20 ${
                data.confidence === 'high' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              }`}>
                Confidence: {data.confidence}
              </span>
              <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-white/5 border-white/10 text-neutral-400">
                Lead Share: {data.riskRatio}%
              </span>
            </div>
          </div>
        </div>

        {/* Buttons - Always in viewport and grid on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full xl:w-auto shrink-0">
          <Button variant="outline" className="w-full sm:min-w-[200px] text-xs py-4 font-black uppercase tracking-widest" onClick={handleCopyReport}>
            Copy Analysis
          </Button>
          <Button 
            className="w-full sm:min-w-[200px] py-4 text-xs font-black uppercase tracking-widest bg-white text-black hover:bg-neutral-200" 
            onClick={() => window.open(`https://github.com/${owner}/${repo}`, '_blank')}
          >
            Open GitHub
          </Button>
        </div>
      </div>

      <div className="w-full">
        <VitalityCard stats={data} />
      </div>

      {/* Analyst Verdict */}
      <div className="mt-12 p-8 md:p-10 rounded-[40px] bg-white/[0.02] border border-white/5 backdrop-blur-md">
        <h3 className="text-[10px] font-black uppercase text-neutral-500 mb-4 tracking-[0.2em]">Analyst Verdict</h3>
        <p className="text-xl md:text-2xl font-bold text-white leading-tight mb-8 italic">{data.explanation}</p>
        
        {data.flags.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {data.flags.map(flag => (
              <div key={flag} className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-xl">
                ⚠️ {flag.replace('_', ' ')}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Final Grid */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
        <AnalysisBlock 
          title="Velocity"
          value={`${data.commits.length} Commits`}
          description="Signals frequency of iteration. Healthy velocity suggests a living codebase."
          status={data.commits.length > 20 ? 'healthy' : 'warning'}
        />
        <AnalysisBlock 
          title="Response"
          value={`~${data.avgResolutionDays.toFixed(1)} Days`}
          description="Average turnaround for issue resolution. Measures maintainer availability."
          status={data.avgResolutionDays < 7 ? 'healthy' : 'warning'}
        />
        <AnalysisBlock 
          title="Backlog"
          value={`${data.openIssues} Issues`}
          description="Current open debt. Massive backlogs without resolution indicate drift."
          status={data.openIssues < 100 ? 'healthy' : 'caution'}
        />
      </div>

      <div className="mt-24 p-10 rounded-[50px] bg-white/[0.02] border border-white/5 text-center mx-2 backdrop-blur-3xl shadow-2xl">
        <p className="text-[11px] text-neutral-500 font-bold max-w-2xl mx-auto leading-relaxed uppercase tracking-tight">
          <span className="text-emerald-500 font-black tracking-[0.4em] block mb-4 text-[9px]">
            Auditor Standard
          </span>
          Decisions are derived from API signals. This model rewards maintenance resilience over star-based popularity.
        </p>
      </div>
    </div>
  );
};

const AnalysisBlock = ({ title, value, description, status }) => (
  <div className="p-10 rounded-[40px] bg-white/[0.03] border border-white/5 flex flex-col h-full hover:border-white/10 hover:bg-white/[0.05] transition-all group">
    <div className="flex justify-between items-start mb-8">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 group-hover:text-emerald-500 transition-colors">{title}</h3>
      <div className={`w-2.5 h-2.5 rounded-full ${
        status === 'healthy' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 
        status === 'warning' ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' : 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'
      }`} />
    </div>
    <div className="text-3xl md:text-4xl font-black text-white mb-4 italic tracking-tighter">{value}</div>
    <p className="text-xs text-neutral-500 leading-relaxed font-medium">
      {description}
    </p>
  </div>
);

export default Report;