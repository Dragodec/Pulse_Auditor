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
          commits, // Full array required for unique days calculation and bus factor
          avgResolutionDays: avgRes,
          openIssues: details.open_issues_count,
          isArchived: details.archived,
          stars: details.stargazers_count,
          full_name: details.full_name,
          owner: details.owner,
          name: details.name
        };

        const reliabilityData = calculateHealthScore(metrics);
        return { ...metrics, ...reliabilityData }; // score is inside reliabilityData
      }));
      setComparisonResults(results);
    } catch (err) {
      console.error("Showdown Audit Failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-7xl font-black tracking-tighter italic mb-8">PULSE</h1>
        <div className="inline-flex p-1 bg-white/5 rounded-xl border border-white/10">
          <button 
            onClick={() => { setMode('audit'); setComparisonResults(null); }}
            className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${mode === 'audit' ? 'bg-emerald-500 text-black' : 'text-neutral-500 hover:text-white'}`}
          >
            Audit
          </button>
          <button 
            onClick={() => { setMode('showdown'); setComparisonResults(null); }}
            className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${mode === 'showdown' ? 'bg-emerald-500 text-black' : 'text-neutral-500 hover:text-white'}`}
          >
            Showdown
          </button>
        </div>
      </div>

      {mode === 'audit' ? (
        <div className="max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Paste GitHub URL for instant audit..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-xl outline-none focus:border-emerald-500/50 transition-all text-center"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          {!comparisonResults ? (
            <div className="max-w-xl mx-auto space-y-4">
              {compareInputs.map((val, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`Repo URL ${i + 1} ${i === 2 ? '(Optional)' : '(Required)'}`}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-emerald-500/50 transition-all"
                  value={val}
                  onChange={(e) => {
                    const next = [...compareInputs];
                    next[i] = e.target.value;
                    setCompareInputs(next);
                  }}
                />
              ))}
              <Button 
                className="w-full py-4 bg-emerald-500 text-black font-black uppercase tracking-widest disabled:opacity-20"
                onClick={handleShowdown}
                disabled={loading || compareInputs.filter(getPath).length < 2}
              >
                {loading ? 'Analyzing...' : 'Run Showdown'}
              </Button>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black italic">RESULTS</h2>
                <button onClick={() => setComparisonResults(null)} className="text-emerald-500 text-xs font-bold hover:underline">
                  RESET SHOWDOWN
                </button>
              </div>
              <ComparisonTable repos={comparisonResults} />
            </div>
          )}
        </div>
      )}

      {/* Methodology Disclaimer */}
      <div className="mt-20 p-8 rounded-3xl bg-white/[0.04] border border-white/10 text-center backdrop-blur-md">
        <p className="text-sm text-neutral-300 font-medium max-w-2xl mx-auto leading-relaxed">
          <span className="text-emerald-400 font-black uppercase tracking-[0.2em] block mb-3 text-[10px]">
            Methodology & Risk Notice
          </span>
          Pulse scores prioritize <b>consistency over bursts</b>. A lack of recent activity is penalized as "Maintenance Drift" rather than rewarded as stability.
        </p>
      </div>
    </div>
  );
};

export default Home;