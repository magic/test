declare let base: string
declare let assets: string
/**
 * Resolve a pathname by prepending the base path, or resolve a route ID with params.
 */
export declare function resolve(
  ...args: [pathname: string] | [routeId: string, params: Record<string, string>]
): string
interface MatchResult {
  id: string
  params: Record<string, string>
}
/**
 * Match a URL to a route ID.
 * Very simple implementation: converts routeId like /blog/[slug] to regex.
 */
export declare function match(url: string | URL): Promise<MatchResult | null>
/**
 * Asset helper: prefix with assets or base.
 */
export declare function asset(file: string): string
/**
 * Expose base and assets for testing/configuration
 */
export { base, assets }
