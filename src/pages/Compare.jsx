import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useComparison } from '../features/auditor/useComparison';
import { fetchRepoDetails, fetchRecentCommits, fetchClosedIssues } from '../api/github';
import { calculateHealthScore } from '../features/auditor/scoringFormula';
import ComparisonTable from '../features/auditor/ComparisonTable';
import Button from '../components/ui/Button';

const Compare = () => {
  const { basket, clearComparison } = useComparison();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      if (basket.length < 2) return;
      setLoading(true);
      
      try {
        const results = await Promise.all(
          basket.map(async (repo) => {
            const [details, commits, issues] = await Promise.all([
              fetchRepoDetails(repo.owner.login, repo.name),
              fetchRecentCommits(repo.owner.login, repo.name),
              fetchClosedIssues(repo.owner.login, repo.name)
            ]);

            const resolutionTimes = issues.map(issue => {
              const created = new Date(issue.created_at);
              const closed = new Date(issue.closed_at);
              return (closed - created) / (1000 * 60 * 60 * 24);
            });

            const avgResolutionDays = resolutionTimes.length 
              ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length 
              : 0;

            const metrics = {
              commitsCount: commits.length,
              avgResolutionDays,
              openIssues: details.open_issues_count,
              isArchived: details.archived,
              stars: details.stargazers_count,
              full_name: details.full_name,
              owner: details.owner,
              name: details.name
            };

            const scoreData = calculateHealthScore(metrics);
            return { ...metrics, ...scoreData, score: scoreData.total };
          })
        );
        setData(results);
      } catch (err) {
        console.error("Showdown failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [basket]);

  if (basket.length < 2) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-32 text-center">
        <h1 className="text-4xl font-black mb-4">SHOWDOWN EMPTY</h1>
        <p className="text-neutral-500 mb-8">Add 2 or 3 libraries to start a side-by-side audit.</p>
        <Button onClick={() => navigate('/')}>Find Libraries</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic">Showdown</h1>
          <p className="text-neutral-400 font-medium">Data-driven performance audit for {basket.length} libraries.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none" onClick={clearComparison}>Clear</Button>
          <Button className="flex-1 md:flex-none" onClick={() => navigate('/')}>Add More</Button>
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/5 animate-pulse">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">Auditing Source Data...</p>
        </div>
      ) : (
        <ComparisonTable repos={data} />
      )}
    </div>
  );
};

export default Compare;