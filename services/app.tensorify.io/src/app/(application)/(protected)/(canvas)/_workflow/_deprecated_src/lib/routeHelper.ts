/**
 * Adds a new route level to an existing route, handling trailing slashes
 * @example
 * addRouteLevel('/', 'foo')      // '/foo'
 * addRouteLevel('/foo', 'bar')   // '/foo/bar'
 * addRouteLevel('/foo/', 'bar')  // '/foo/bar'
 * addRouteLevel('foo', 'bar')    // 'foo/bar'
 */
export const addRouteLevel = (route: string, newLevel: string): string => {
  const trimmedRoute = route.replace(/\/+$/, '');
  if (trimmedRoute === '/' || trimmedRoute === '') return `/${newLevel}`;
  return `${trimmedRoute}/${newLevel}`;
};

/**
 * Removes the last level from a route
 * @example
 * removeLastRouteLevel('/foo/bar') // '/foo'
 * removeLastRouteLevel('/foo')     // '/'
 * removeLastRouteLevel('foo/bar')  // 'foo'
 */
export const removeLastRouteLevel = (route: string): string => {
  const trimmed = route.replace(/\/+$/, '');
  const parts = trimmed.split('/').filter(p => p);
  parts.pop();
  
  if (parts.length === 0) return route.startsWith('/') ? '/' : '';
  const newRoute = parts.join('/');
  return route.startsWith('/') ? `/${newRoute}` : newRoute;
};

/**
 * Normalizes route formatting by:
 * - Removing trailing slashes
 * - Ensuring root is represented as '/'
 * - Removing duplicate slashes
 * @example
 * normalizeRoute('/foo/bar/') // '/foo/bar'
 * normalizeRoute('foo//bar')  // '/foo/bar'
 * normalizeRoute('')          // '/'
 */
export const normalizeRoute = (route: string): string => {
  const cleaned = route.replace(/\/+/g, '/').replace(/\/+$/, '');
  if (!cleaned || cleaned === '/') return '/';
  return cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
};

/**
 * Gets parent route, considering both absolute and relative routes
 * @example
 * getParentRoute('/foo/bar') // '/foo'
 * getParentRoute('foo/bar')  // 'foo'
 * getParentRoute('/foo')     // '/'
 */
export const getParentRoute = (route: string): string => {
  const normalized = normalizeRoute(route);
  if (normalized === '/') return '/';
  return removeLastRouteLevel(normalized);
};

/**
 * Gets route levels as an array
 * @example
 * getRouteLevels('/foo/bar') // ['foo', 'bar']
 * getRouteLevels('foo/bar')  // ['foo', 'bar']
 */
export const getRouteLevels = (route: string): string[] => {
  return normalizeRoute(route)
    .split('/')
    .filter(level => level && level !== '/');
};

/**
 * Checks if route2 is directly inside route1 (not nested)
 * @example
 * isDirectMatchRoute('/foo/bar', '/foo/bar') // true
 * isDirectMatchRoute('/foo/bar', '/foo/bar/lol') // false
 * isDirectMatchRoute('/foo', '/foo/bar') // false
 */
export const isDirectMatchRoute = (route1: string, route2: string): boolean => {
  return normalizeRoute(route1) === normalizeRoute(route2);
};
