import { useState, useEffect } from 'react';
import { fetchRepoDetails, fetchRecentCommits, fetchClosedIssues } from '../../api/github';
import { calculateHealthScore } from './scoringFormula';

export const useRepoStats = (owner, repo) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // Prevent fetching if params are missing
      if (!owner || !repo) return;
      
      setLoading(true);
      setError(null);

      try {
        const [details, commits, issues] = await Promise.all([
          fetchRepoDetails(owner, repo),
          fetchRecentCommits(owner, repo),
          fetchClosedIssues(owner, repo)
        ]);

        const resTimes = issues.map(i => (new Date(i.closed_at) - new Date(i.created_at)) / 86400000);
        const avgRes = resTimes.length ? resTimes.reduce((a, b) => a + b, 0) / resTimes.length : 0;

        const metrics = {
          commits, // Necessary for unique days/consistency
          avgResolutionDays: avgRes,
          openIssues: details.open_issues_count,
          isArchived: details.archived,
          stars: details.stargazers_count,
          full_name: details.full_name,
          owner: details.owner,
          name: details.name
        };

        const reliabilityResult = calculateHealthScore(metrics);
        setData({ ...metrics, ...reliabilityResult });
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // CRITICAL: Dependency array must include owner/repo
  }, [owner, repo]); 

  return { data, loading, error };
};