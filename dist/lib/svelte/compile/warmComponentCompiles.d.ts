/**
 * Recursively collect component paths referenced by test entries.
 * Handles arrays, nested test objects, and both the `component: 'path'` and
 * `component: ['path', props]` forms. Functions (lazy tests) and other
 * non-data values are skipped. Cyclic object graphs (config plugins often
 * self-reference) are broken with the `seen` set; a first visit already
 * collects everything beneath a node, so skipping later visits loses nothing.
 */
export declare const collectComponentPaths: (
  node: unknown,
  out: Set<string>,
  seen: WeakSet<object>,
) => void
/**
 * Resolve a component reference (import-map specifier, absolute or relative
 * path) to an existing file, or null. Unresolvable `#` specs are dropped
 * (the mount surfaces the real error later) instead of falling back to a
 * literal `#...` path that can never exist.
 */
export declare const resolveComponentPath: (componentPath: string) => Promise<string | null>
/**
 * Pre-compile all Svelte components referenced by the collected tests.
 *
 * The first compilation of a component pays for its entire Svelte dependency
 * graph (node_modules .svelte files, barrels), which can take tens of seconds
 * (much longer under c8 / V8 coverage). Running this during the collection
 * phase - outside any per-test timeout - means the first test that mounts a
 * component hits warm caches instead of timing out on the one-time compile.
 *
 * Failures are logged but non-fatal: the actual mount surfaces the error at
 * test time.
 */
export declare const warmComponentCompiles: (tests: unknown) => Promise<void>
