import axios from 'axios';

const client = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
  },
});

/**
 * Global Interceptor for Rate Limiting
 * GitHub's REST API is strict. We catch 403s here to provide 
 * immediate feedback via the UI layer later.
 */
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // 403 usually indicates Rate Limit or Secondary Rate Limit
    if (error.response?.status === 403) {
      const resetHeader = error.response.headers['x-ratelimit-reset'];
      if (resetHeader) {
        const resetDate = new Date(resetHeader * 1000);
        console.error(`Rate limit exceeded. Resets at: ${resetDate.toLocaleTimeString()}`);
      }
    }
    return Promise.reject(error);
  }
);

export default client;