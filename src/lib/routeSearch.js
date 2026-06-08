export function searchRoutes(routes, query) {
  if (!query) return routes;

  const normalizedQuery = query.toLowerCase().trim();

  return routes.filter((route) => {
    const searchableText = [
      route.name,
      route.origin,
      route.destination,
      route.status,
      route.source,
      ...(route.municipalities || []),
      ...(route.passesThrough || []),
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}
