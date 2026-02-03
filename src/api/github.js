import client from './client';

/**
 * Fetches core repository metadata
 */
export const fetchRepoDetails = async (owner, repo) => {
  const { data } = await client.get(`/repos/${owner}/${repo}`);
  return data;
};

/**
 * Fetches commits from the last 30 days
 */
export const fetchRecentCommits = async (owner, repo) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data } = await client.get(`/repos/${owner}/${repo}/commits`, {
    params: { since: thirtyDaysAgo.toISOString(), per_page: 100 },
  });
  return data;
};

/**
 * Fetches the most recent closed issues to calculate resolution speed
 */
export const fetchClosedIssues = async (owner, repo) => {
  const { data } = await client.get(`/repos/${owner}/${repo}/issues`, {
    params: { state: 'closed', per_page: 30 },
  });
  // Filter out Pull Requests if they are mixed in the issues response
  return data.filter(item => !item.pull_request);
};

/**
 * Search functionality for the landing page
 */
export const searchRepositories = async (query) => {
  if (!query) return [];
  try {
    const response = await client.get('/search/repositories', {
      params: { q: query, sort: 'stars', order: 'desc', per_page: 10 },
    });

    // DEBUG LOG: See exactly what GitHub sent back
    console.log("GitHub API Response:", response.data);

    // GitHub search results are nested inside 'items'
    return response.data.items || []; 
  } catch (error) {
    console.error("Search API Error:", error);
    return [];
  }
};