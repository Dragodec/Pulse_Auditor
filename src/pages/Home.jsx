import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRepoDetails, fetchRecentCommits, fetchClosedIssues } from '../api/github';
import { calculateHealthScore } from '../features/auditor/scoringFormula';
import ComparisonTable from '../features/auditor/ComparisonTable';
import Button from '../components/ui/Button';

const Home = () => {
  const [mode, setMode] = useState('audit'); 
  const [query, setQuery] = useState('');
  const [compareInputs, setCompareInputs] = useState(['', '', '']);
  const [comparisonResults, setComparisonResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getPath = (input) => {
    try {
      const url = new URL(input.startsWith('http') ? input : `https://${input}`);
      if (url.hostname === 'github.com') {
        const parts = url.pathname.split('/').filter(Boolean);
        if (parts.length >= 2) return `${parts[0]}/${parts[1].replace('.git', '')}`;
      }
    } catch (e) { return null; }
    return null;
  };

  useEffect(() => {
    if (mode === 'audit') {
      const path = getPath(query);
      if (path) navigate(`/${path}`);
    }
  }, [query, navigate, mode]);

  const handleShowdown = async () => {
    setLoading(true);
    try {
      const validPaths = compareInputs.map(getPath).filter(Boolean);
      const results = await Promise.all(validPaths.map(async (path) => {
        const [owner, name] = path.split('/');
        const [details, commits, issues] = await Promise.all([
          fetchRepoDetails(owner, name),
          fetchRecentCommits(owner, name),
          fetchClosedIssues(owner, name)
        ]);
        const resTimes = issues.map(i => (new Date(i.closed_at) - new Date(i.created_at)) / 86400000);
        const avgRes = resTimes.length ? resTimes.reduce((a,b)=>a+b,0)/resTimes.length : 0;
        const metrics = {
          commits,
          avgResolutionDays: avgRes,
          openIssues: details.open_issues_count,
          isArchived: details.archived,
          stars: details.stargazers_count,
          full_name: details.full_name,
          owner: details.owner,
          name: details.name,
          license: details.license?.spdx_id || "None"
        };
        const reliabilityData = calculateHealthScore(metrics);
        return { ...metrics, ...reliabilityData };
      }));
      setComparisonResults(results);
    } catch (err) {
      console.error("Showdown Audit Failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-16 overflow-x-hidden min-h-screen">
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter italic mb-8 select-none">PULSE</h1>
        <div className="inline-flex p-1 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
          <button 
            onClick={() => { setMode('audit'); setComparisonResults(null); }}
            className={`px-6 sm:px-8 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${mode === 'audit' ? 'bg-emerald-500 text-black' : 'text-neutral-500 hover:text-white'}`}
          >
            Audit
          </button>
          <button 
            onClick={() => { setMode('showdown'); setComparisonResults(null); }}
            className={`px-6 sm:px-8 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${mode === 'showdown' ? 'bg-emerald-500 text-black' : 'text-neutral-500 hover:text-white'}`}
          >
            Showdown
          </button>
        </div>
      </div>

      {mode === 'audit' ? (
        <div className="max-w-2xl mx-auto px-2">
          <input
            type="text"
            placeholder="Paste GitHub URL..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all text-center placeholder:text-neutral-600"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          {!comparisonResults ? (
            <div className="max-w-xl mx-auto space-y-4 px-2">
              {compareInputs.map((val, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`Repo URL ${i + 1} ${i === 2 ? '(Optional)' : ''}`}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-emerald-500/50 transition-all text-sm"
                  value={val}
                  onChange={(e) => {
                    const next = [...compareInputs];
                    next[i] = e.target.value;
                    setCompareInputs(next);
                  }}
                />
              ))}
              <Button 
                className="w-full py-5 bg-emerald-500 text-black font-black uppercase tracking-[0.2em] text-xs mt-6"
                onClick={handleShowdown}
                disabled={loading || compareInputs.filter(getPath).length < 2}
              >
                {loading ? 'Analyzing Artifacts...' : 'Execute Showdown'}
              </Button>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-500 w-full overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 px-2">
                <h2 className="text-2xl font-black italic tracking-tighter uppercase">Showdown Results</h2>
                <button onClick={() => setComparisonResults(null)} className="text-emerald-500 text-[10px] font-black hover:underline uppercase tracking-widest">
                  Reset Comparison
                </button>
              </div>
              <div className="w-full overflow-x-auto rounded-3xl border border-white/10 shadow-2xl">
                <ComparisonTable repos={comparisonResults} />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-20 p-8 rounded-[40px] bg-white/[0.02] border border-white/5 text-center backdrop-blur-xl mx-2">
        <p className="text-xs text-neutral-500 font-medium max-w-2xl mx-auto leading-relaxed">
          <span className="text-emerald-500 font-black uppercase tracking-[0.3em] block mb-4 text-[9px]">
            Technical Methodology
          </span>
          Pulse uses deterministic heuristics to prioritize consistency over bursts. Stagnation is explicitly penalized via temporal decay functions.
        </p>
      </div>
    </div>
  );
};

export default Home;