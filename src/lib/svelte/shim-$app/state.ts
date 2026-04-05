// Shim for $app/state
// Provides page, navigating, updated stores

import { writable } from 'svelte/store';

export interface Page {
  url: URL;
  params: Record<string, string>;
  routeId: string;
  data: any;
  status: number;
  error: any; // can be Error or null
  form?: any;
}

export interface Navigation {
  from: URL;
  to: URL;
  type: string;
  willUnload: boolean;
  delta: number;
  complete: () => void;
}

const makeDefaultPage = (): Page => ({
  url: new URL('http://localhost/'),
  params: {},
  routeId: '',
  data: {},
  status: 200,
  error: null,
  form: undefined
});

export const page = writable<Page>(makeDefaultPage());

// navigating: null when idle, otherwise Navigation object
export const navigating = writable<Navigation | null>(null);

// updated: { get current(): boolean; check(): Promise<boolean> }
export const updated = {
  get current(): boolean {
    return false;
  },
  check: (): Promise<boolean> => Promise.resolve(false)
};

// Reset function for test isolation
export function reset() {
  page.set(makeDefaultPage());
  navigating.set(null);
}
