/**
 * Formatters – Utility functions for displaying data.
 */

/**
 * Format reaction time in ms to human-readable string.
 * @param {number|null} ms
 */
export function formatReactionTime(ms) {
  if (ms === null || ms === undefined) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Format a score delta for display (+10, -5, etc.)
 * @param {number} delta
 */
export function formatDelta(delta) {
  if (delta > 0) return `+${delta}`;
  return String(delta);
}

/**
 * Get ordinal suffix for a rank (1st, 2nd, 3rd, etc.)
 * @param {number} n
 */
export function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Truncate a string to maxLen characters.
 */
export function truncate(str, maxLen = 20) {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + '…';
}

/**
 * Get medal emoji for rank.
 */
export function getMedal(rank) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}
