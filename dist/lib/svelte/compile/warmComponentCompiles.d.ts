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
