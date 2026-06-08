const CONTRIBUTIONS_KEY = "mi-combi-contributions";
const FAVORITES_KEY = "mi-combi-route-favorites";
const SEARCH_HISTORY_KEY = "mi-combi-search-history";

function readStoredArray(key) {
  if (typeof window === "undefined") return [];

  try {
    const storedValue = JSON.parse(window.localStorage.getItem(key));
    return Array.isArray(storedValue) ? storedValue : [];
  } catch {
    return [];
  }
}

function writeStoredArray(key, value) {
  if (typeof window === "undefined") return [];

  window.localStorage.setItem(key, JSON.stringify(value));
  return value;
}

export function getLocalContributions() {
  return readStoredArray(CONTRIBUTIONS_KEY);
}

export function saveLocalContribution(contribution) {
  if (typeof window === "undefined") return [];

  const currentContributions = getLocalContributions();
  const nextContributions = [
    {
      ...contribution,
      id: crypto.randomUUID(),
      status: "received",
      createdAt: new Date().toISOString(),
    },
    ...currentContributions,
  ];

  window.localStorage.setItem(
    CONTRIBUTIONS_KEY,
    JSON.stringify(nextContributions)
  );

  return nextContributions;
}

export function getRouteFavorites() {
  return readStoredArray(FAVORITES_KEY);
}

export function toggleRouteFavorite(routeId) {
  const currentFavorites = getRouteFavorites();
  const nextFavorites = currentFavorites.includes(routeId)
    ? currentFavorites.filter((id) => id !== routeId)
    : [routeId, ...currentFavorites];

  return writeStoredArray(FAVORITES_KEY, nextFavorites);
}

export function getSearchHistory() {
  return readStoredArray(SEARCH_HISTORY_KEY);
}

export function saveSearchHistoryItem(query) {
  const normalizedQuery = String(query || "").trim();
  if (normalizedQuery.length < 3) return getSearchHistory();

  const currentHistory = getSearchHistory();
  const nextHistory = [
    normalizedQuery,
    ...currentHistory.filter(
      (item) => item.toLowerCase() !== normalizedQuery.toLowerCase()
    ),
  ].slice(0, 8);

  return writeStoredArray(SEARCH_HISTORY_KEY, nextHistory);
}

export function clearSearchHistory() {
  return writeStoredArray(SEARCH_HISTORY_KEY, []);
}
