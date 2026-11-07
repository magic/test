/**
 * Run `fn` inside a mocked SvelteKit request store when @sveltejs/kit is
 * installed in the tested project. Otherwise run `fn` as-is.
 */
export declare const withSvelteKitStore: (fn: () => unknown) => Promise<unknown>
