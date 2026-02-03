import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRepoStats } from '../features/auditor/useRepoStats';
import { generateMarkdownReport } from '../features/auditor/exportUtils';
import VitalityCard from '../features/auditor/VitalityCard';
import Button from '../components/ui/Button';
import { toast } from 'react-hot-toast';

/**
 * Pulse Report: Deep-Dive Analysis View
 * Combines Reliability Heuristic(Risk Flags/Confidence) 
 * with granular maintenance metrics for complete transparency.
 */
const Report = () => {
  const { owner, repo } = useParams();
  const navigate = useNavigate();
  
  // Custom hook fetches data and executes Heuristic logic
  const { data, loading, error } = useRepoStats(owner, repo);

  const handleCopyReport = () => {
    if (!data) return;
    const report = generateMarkdownReport(data);
    navigator.clipboard.writeText(report);
    toast.success('Audit report copied to clipboard!', {
      icon: '📊',
      style: { borderRadius: '12px', background: '#171717', color: '#fff' }
    });
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto px-6 py-24 animate-pulse">
      <div className="h-12 w-64 bg-white/5 rounded-2xl mb-8" />
      <div className="h-80 w-full bg-white/5 rounded-3xl mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <div key={i} className="h-40 bg-white/5 rounded-2xl" />)}
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="max-w-xl mx-auto px-6 py-32 text-center">
      <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-8">
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h1 className="text-3xl font-black mb-4 uppercase">Audit Interrupted</h1>
      <p className="text-neutral-500 mb-10 leading-relaxed">
        The GitHub API couldn't resolve this repository. It may be private, deleted, or you've hit the rate limit.
      </p>
      <Button onClick={() => navigate('/')} className="px-10">Return to Pulse Home</Button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div className="space-y-4">
          <button 
            onClick={() => navigate('/')} 
            className="text-xs font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-2 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Audit
          </button>
          
          <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
              {owner}<span className="text-white/20">/</span>{repo}
            </h1>
            
            {/*Meta: Confidence & Maintainer Risk */}
            <div className="mt-4 flex flex-wrap gap-3">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                data.confidence === 'high' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
              }`}>
                Confidence: {data.confidence}
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-white/5 border-white/10 text-neutral-400">
                Lead Share: {data.riskRatio}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none py-3 px-6" onClick={handleCopyReport}>
            Copy Markdown Report
          </Button>
          <Button 
            className="flex-1 md:flex-none py-3 px-6 bg-white text-black hover:bg-neutral-200" 
            onClick={() => window.open(`https://github.com/${owner}/${repo}`, '_blank')}
          >
            GitHub
          </Button>
        </div>
      </div>

      {/* Primary Score Component */}
      <VitalityCard stats={data} />

      {/* Analyst Verdict / Explanation */}
      <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/5">
        <h3 className="text-xs font-black uppercase text-neutral-500 mb-2 tracking-widest">Analyst Verdict</h3>
        <p className="text-xl font-bold text-white leading-snug">{data.explanation}</p>
        
        {/* Risk Flags Display */}
        {data.flags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {data.flags.map(flag => (
              <div key={flag} className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-lg">
                ⚠️ {flag.replace('_', ' ')}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* The Metrics Grid - Re-integrated granular data */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <AnalysisBlock 
          title="Maintenance Velocity"
          value={`${data.commits.length} Commits`}
          description="Frequency of changes in the last 30 days. Higher velocity indicates a project that is actively evolving."
          status={data.commits.length > 20 ? 'healthy' : 'warning'}
        />
        <AnalysisBlock 
          title="Issue Response"
          value={`~${data.avgResolutionDays.toFixed(1)} Days`}
          description="Average time to close recent issues. Measures the attentiveness of core maintainers."
          status={data.avgResolutionDays < 7 ? 'healthy' : 'warning'}
        />
        <AnalysisBlock 
          title="Sustainable Backlog"
          value={`${data.openIssues} Issues`}
          description="Total open issues relative to project size. A manageable backlog is key to avoiding debt."
          status={data.openIssues < 100 ? 'healthy' : 'caution'}
        />
      </div>

      {/* Methodology Disclaimer Section */}
      <div className="mt-20 p-8 rounded-3xl bg-white/[0.04] border border-white/10 text-center backdrop-blur-md">
        <p className="text-sm text-neutral-300 font-medium max-w-2xl mx-auto leading-relaxed">
          <span className="text-emerald-400 font-black uppercase tracking-[0.2em] block mb-3 text-[10px]">
            Decision Support Methodology
          </span>
          Pulse scores prioritize <b>consistency over bursts</b>. Uncertainty (low data points) is explicitly penalized. This tool helps developers avoid maintenance surprises, not certify code quality.
        </p>
      </div>
    </div>
  );
};

/**
 * Helper: Analysis Card
 */
const AnalysisBlock = ({ title, value, description, status }) => (
  <div className="p-8 rounded-3xl bg-white/5 border border-white/5 flex flex-col h-full hover:border-white/10 transition-colors group">
    <div className="flex justify-between items-start mb-6">
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500 group-hover:text-neutral-400 transition-colors">{title}</h3>
      <div className={`w-2 h-2 rounded-full ${
        status === 'healthy' ? 'bg-emerald-500' : 
        status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
      }`} />
    </div>
    <div className="text-3xl font-black text-white mb-4 italic tracking-tighter">{value}</div>
    <p className="text-sm text-neutral-500 leading-relaxed mt-auto">
      {description}
    </p>
  </div>
);

export default Report;