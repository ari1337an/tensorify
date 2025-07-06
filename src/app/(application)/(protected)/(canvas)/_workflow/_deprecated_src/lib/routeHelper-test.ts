import '@testing-library/jest-dom';
import { 
  addRouteLevel, 
  removeLastRouteLevel, 
  normalizeRoute, 
  getParentRoute, 
  getRouteLevels, 
  isDirectMatchRoute 
} from '@/lib/routeHelper';

describe('Testing @/lib/routeHelper.ts', () => {

  test('addRouteLevel', () => {
    expect(addRouteLevel('/', 'foo')).toBe('/foo');
    expect(addRouteLevel('/foo', 'bar')).toBe('/foo/bar');
    expect(addRouteLevel('/foo/', 'bar')).toBe('/foo/bar');
    expect(addRouteLevel('foo', 'bar')).toBe('foo/bar');
  });

  test('removeLastRouteLevel', () => {
    expect(removeLastRouteLevel('/foo/bar')).toBe('/foo');
    expect(removeLastRouteLevel('/foo')).toBe('/');
    expect(removeLastRouteLevel('foo/bar')).toBe('foo');
    expect(removeLastRouteLevel('/')).toBe('/');
    expect(removeLastRouteLevel('')).toBe('');
  });

  test('normalizeRoute', () => {
    expect(normalizeRoute('/foo/bar/')).toBe('/foo/bar');
    expect(normalizeRoute('foo//bar')).toBe('/foo/bar');
    expect(normalizeRoute('')).toBe('/');
    expect(normalizeRoute('/')).toBe('/');
    expect(normalizeRoute('//foo//bar//')).toBe('/foo/bar');
  });

  test('getParentRoute', () => {
    expect(getParentRoute('/foo/bar')).toBe('/foo');
    expect(getParentRoute('foo/bar')).toBe('/foo');
    expect(getParentRoute('/foo')).toBe('/');
    expect(getParentRoute('/')).toBe('/');
  });

  test('getRouteLevels', () => {
    expect(getRouteLevels('/foo/bar')).toEqual(['foo', 'bar']);
    expect(getRouteLevels('foo/bar')).toEqual(['foo', 'bar']);
    expect(getRouteLevels('/')).toEqual([]);
    expect(getRouteLevels('')).toEqual([]);
    expect(getRouteLevels('/foo//bar/')).toEqual(['foo', 'bar']);
  });

  test('isDirectMatchRoute', () => {
    expect(isDirectMatchRoute('/foo/bar', '/foo/bar')).toBe(true);
    expect(isDirectMatchRoute('/foo/bar', '/foo/bar/lol')).toBe(false);
    expect(isDirectMatchRoute('/foo', '/foo/bar')).toBe(false);
    expect(isDirectMatchRoute('/foo//bar', '/foo/bar/')).toBe(true);
  });

});
