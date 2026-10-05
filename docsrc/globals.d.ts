/**
 * Ambient declarations for view globals that @magic/core injects at
 * runtime via maybeInjectMagic() (src/bin/lib/maybeInjectMagic.ts).
 *
 * Each app module (view components from the docs theme, @magic-modules,
 * etc.) is wrapped in renderString() and assigned to globalThis by its
 * key, so pages in docsrc/pages can use them without importing.
 *
 * These declarations exist so tsc can typecheck the docsrc pages,
 * which are pulled into the test program via test/docsrc imports.
 */

type MagicView = (...args: unknown[]) => string

declare const h1: MagicView
declare const h2: MagicView
declare const h3: MagicView
declare const h4: MagicView
declare const p: MagicView
declare const ul: MagicView
declare const li: MagicView
declare const Pre: MagicView
declare const Link: MagicView
declare const GitBadges: MagicView
