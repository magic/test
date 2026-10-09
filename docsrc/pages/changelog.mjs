export const View = () => [
  h1({ id: 'changelog' }, 'Changelog'),

  h2({}, '0.3.41'),
  ul([
    li('svelte component coverage fully fixed, 0.0.40 was using the wrong paths'),
    li('move test/.fixtures to src/lib/svelte/testFixtures to make them exposed to c8 coverage'),
  ]),

  h2({}, '0.3.40'),
  ul([li('fix svelte component coverage by pointing sourcemaps back to .svelte components')]),

  h2({}, '0.3.39'),
  ul([li('change c8 to use --all flag'), li('change c8 to not include dist by default')]),

  h2({}, '0.3.38'),
  ul([
    li(
      'fix imports of svelte components, they only have a default export. resolveSvelteExports now handles this correctly.',
    ),
    li('update dependencies'),
  ]),

  h2({}, '0.3.37'),
  ul([li('svelte mount now correctly resolves # imports map from package.json')]),

  h2({}, '0.3.36'),
  ul([li('fix: add null guards for TypeScript strict mode in getSvelteExports tests')]),

  h2({}, '0.3.35'),
  ul([
    li('works with sveltekit ^3.0.0'),
    li('feat: add package.json imports support and module resolution (feat)'),
    li('feat: add svelte shims: $app/env added, also resolves as $app/environment'),
    li('move test fixtures to test/.fixtures'),
    li('chore: update dependencies'),
  ]),

  h2({}, '0.3.34'),
  p('has subfunctions now allow either predicate functions OR literal values to be checked'),

  h2({}, '0.3.33'),
  ul([li('update dependencies')]),

  h2({}, '0.3.32'),
  ul([li('make svelte optional again')]),

  h2({}, '0.3.31'),
  ul([
    li('feat: add deadlock detection system (ddl)'),
    li('feat: integrate ddl into cache, compile, and import pipeline'),
    li('feat: integrate ddl into resolve and package export pipeline'),
    li('feat: add loader init, warmup, and $app resolution'),
    li('feat: add addEventListener/removeEventListener to globals'),
    li('fix(svelte): remove console.error from pathUtils'),
    li('fix: add null guard and directory fallback in pathUtils'),
    li('fix: update registerLoader usage'),
    li('fix: remove REGISTERED message from tsLoader'),
    li('fix: fix tsc and eslint errors'),
  ]),

  h2({}, '0.3.30'),
  ul([
    li(
      'fix(svelte): resolve $app imports to shims instead of @sveltejs/kit runtime (fixes ERR_MODULE_NOT_FOUND in tests)',
    ),
    li(
      'fix(svelte): skip non-default exports from .svelte files in barrel compilation (TypeScript types erased at runtime)',
    ),
    li('fix(vite): inject $app alias into vite aliases for resolveAlias fallback'),
    li('style(svelte): use @magic/fs instead of node:fs for consistency'),
    li('fix(c8): correctly order argv for c8 runs.'),
  ]),

  h2({}, '0.3.29'),
  ul([
    li(
      'feat(svelte): extract pathUtils with shared path resolution helpers (resolveFilePath, EXTENSION_CANDIDATES, FALLBACK_CANDIDATES, isSkipPattern)',
    ),
    li('feat(svelte): extract fileWriter module for compiled file output with source map support'),
    li(
      "feat(svelte): add resolveNodeModulesRelativeImportsPreprocessor for fixing '..' imports in node_modules",
    ),
    li('feat(cache): add dedup function for concurrent promise deduplication'),
    li(
      'refactor(svelte): extract loadViteConfig to shared module, consolidate getViteDefine and loadViteDefine',
    ),
    li('refactor(svelte): remove resolveViteAlias, consolidate into resolveAlias'),
    li(
      'refactor(svelte): use visitor pattern in resolveSvelteOnlyExports (traverseExports + ExportVisitor)',
    ),
    li('refactor(svelte): use pathUtils in resolvePackageExport, fix .mjs resolution'),
    li(
      'refactor(svelte): update tsLoader to use resolveAlias with includeShims and extractImportsSync',
    ),
    li(
      'refactor(svelte): use shared helpers across compile modules (getTempFilePath, fileWriter, processImports)',
    ),
    li('fix(svelte): add includeShims option to resolveAlias for bare imports'),
    li(
      'fix(vite): vite defines now correctly set in globalThis, by calling JSON.parse during assign.',
    ),
  ]),

  h2({}, '0.3.28'),
  ul([
    li('fix: $lib/types.js -> the .js gets removed before appending the correct extension'),
    li('regression fix: version spec check now correctly errors with expected type again.'),
    li('update dependencies'),
  ]),

  h2({}, '0.3.27'),
  ul([
    li('fix: exclude .d.ts files from test discovery (passed .ts filter, caused import failures)'),
    li('fix: always exclude .d.ts from c8 coverage (user --exclude can no longer remove it)'),
    li('refactor: restructure c8 exclude logic in t.ts'),
    li('chore: move changelog from README.md to CHANGELOG.md (650 lines extracted)'),
  ]),

  h2({}, '0.3.26'),
  ul([li('add customElements to happy-dom globals')]),

  h2({}, '0.3.25'),
  ul([
    li('fix: use @magic/types for more type comparisons'),
    li('feat: make expect accept an array of typechecks'),
    li('test: make more files testable by extracting pure functions'),
    li('update dependencies'),
  ]),

  h2({}, '0.3.24'),
  ul([
    li('feat: show total time including test discovery overhead'),
    li('feat: add progress tracking for test discovery'),
    li('feat: add DISCOVERY_TIMEOUT env var to control test discovery timeout (default: 30s)'),
    li('perf: cache getViteDefine results'),
  ]),

  h2({}, '0.3.23'),
  ul([
    li(
      '0.3.22 caused tests to fail because viteconfig was not loaded correctly and lead to recursive imports',
    ),
  ]),

  h2({}, '0.3.22'),
  ul([
    li('feat: make restoreProperties method public on Isolation class'),
    li('fix: move BigInt check before other type checks in makeSafeClone'),
    li('refactor: use pathToFileURL for ESM config imports'),
    li('refactor: use wrapTest helper consistently in suite'),
    li('refactor: simplify suiteHasBeforeAllOrAfterAll condition'),
    li('refactor: extract hasFixedPort helper in isolationChecks'),
    li('refactor: extract restoreProperties helper'),
    li('refactor: deduplicate evaluateWorkerResult by re-exporting evaluateTestResult'),
    li('refactor: use CACHE_DIR constant for test temp files'),
    li('refactor: use dynamic imports instead of manual config parsing'),
    li('refactor(http): extract makeRequest helper to deduplicate get/post'),
    li('refactor(mount): handle Svelte 5 snippets properly'),
    li('test: fix test type errors for HTMLElement click function'),
    li('test: update fixtures for improved test harness'),
    li('update dependencies'),
  ]),

  h2({}, '0.3.21'),
  ul([
    li('various build performance improvements, especially for svelte components'),
    li('add timing traces with MAGIC_TEST_TRACE env var and --trace CLI flag'),
    li('add promise-based caching via CacheManager'),
    li('consolidate worker pool into single source'),
    li('centralize caching in CacheManager at tsLoader level'),
    li('increase default test timeout to 30s'),
    li('fixed tsLoader .ts file handling'),
    li('add more tests for @magic/test itself'),
    li('implement persistent disk cache in node_modules/.magic-test-cache'),
    li('parallelize import resolution, barrel exports, and fs.exists checks'),
    li('cache fs.exists results, processImports results, and resolveViteAlias results'),
    li('skip writing unchanged files during compilation'),
    li('consolidate caches into single pendingPromises map'),
    li('add more tests for @magic/test itself'),
    li('update dependencies'),
  ]),

  h2({}, '0.3.20'),
  ul([li('prevent double-compilation of svelte components'), li('update dependencies')]),

  h2({}, '0.3.19'),
  ul([li('svelte edge cases'), li('custom test defines for globals')]),

  h2({}, '0.3.18'),
  ul([
    li('better resolution for imported dependencies in tests'),
    li('especially <script> tags in svelte components that export functions/variables'),
    li('update dependencies'),
  ]),

  h2({}, '0.3.17'),
  ul([li('better test discovery, had edge cases where tests were not found')]),

  h2({}, '0.3.16'),
  ul([
    li('better kill handling for workers and child_process'),
    li('README fixes'),
    li('remove @systemkollektiv devDependencies, those packages are private for now'),
    li('update dependencies'),
  ]),

  h2({}, '0.3.15'),
  ul([li('fix import of .svelte.js/.ts files if js/ts extension is omitted')]),

  h2({}, '0.3.14'),
  ul([li('fireEvent function now correctly handles various addEventListener event types')]),

  h2({}, '0.3.13'),
  ul([li('update dependencies')]),

  h2({}, '0.3.12'),
  ul([li('make svelte optional for consumers'), li('update dependencies')]),

  h2({}, '0.3.11'),
  ul([
    li('performance improvements, better checks if tests need to be isolated'),
    li('fix timing issues in isolation code'),
    li('replace regex code checks with ast checks'),
    li('add `has` functionality for object checks'),
    li('update dependencies'),
  ]),

  h2({}, '0.3.10'),
  ul([
    li('fix more edge cases in svelte compilation steps'),
    li('add .css import support'),
    li('update dependencies'),
  ]),

  h2({}, '0.3.9'),
  ul([li('fix imports of test/index.(mjs|ts|js) files')]),

  h2({}, '0.3.8'),
  ul([
    li('add --workers flag to control max parallel workers (default: auto-detect CPU count)'),
    li('canvas polyfill works properly in happy-dom environment'),
    li('svelte: resolve svelte-only package exports'),
    li('svelte: fix import chain handling for components'),
    li('version: check if Lib is missing exports'),
    li('worker isolation: beforeAll and afterAll run in workers directly'),
    li('before fields in tests get awaited if they return a raw promise'),
  ]),

  h2({}, '0.3.7'),
  ul([
    li(
      'advanced worker isolation, executing minimum number of needed workers for tests. lots of internal changes to achieve this.',
    ),
  ]),

  h2({}, '0.3.6'),
  p('broken - tried implementing better isolation'),

  h2({}, '0.3.5'),
  ul([li('better tsLoader resolve mechanism')]),

  h2({}, '0.3.4'),
  ul([li('also run registerLoader in workers')]),

  h2({}, '0.3.3'),
  ul([li('replace all import .ts with .js'), li('some test output fixes')]),

  h2({}, '0.3.2'),
  p('broken: some .ts references for worker.ts and unit.ts'),
  ul([li('publish dist dir with .js files for consumers.')]),

  h2({}, '0.3.1'),
  p('broken, dist dir missing'),

  h2({}, '0.3.0'),
  p('broken. node can not strip types in node_modules...'),
  ul([
    li('added html support (using happy-dom, experimental!)'),
    li('added svelte support (experimental!)'),
    li('various improvements to test logic and structure of internal lib'),
    li('more tests.'),
  ]),

  h2({}, '0.2.30'),
  ul([
    li('allow tests to be written using typescript, .ts files can be test files now.'),
    li('add some internal tests'),
    li('update dependencies'),
  ]),

  h2({}, '0.2.29'),
  ul([li('tryCatch: pass on empty args'), li('update dependencies')]),

  h2({}, '0.2.28'),
  ul([
    li(
      'use node:module register function for loader, allowing use of the --import flag instead of soon deprecated --loader.',
    ),
  ]),

  h2({}, '0.2.27'),
  ul([
    li('allow resolving .js files as .ts files, this mimics typescript .js file resolver'),
    li('update @types/node'),
  ]),

  h2({}, '0.2.26'),
  ul([li('update dependencies')]),

  h2({}, '0.2.25'),
  ul([li('update dependencies')]),

  h2({}, '0.2.24'),
  ul([li('fix @magic/core tests on windows.')]),

  h2({}, '0.2.23'),
  ul([li('readd npm run prepublishOnly task'), li('update dependencies')]),

  h2({}, '0.2.22'),
  ul([
    li('add comprehensive typescript types'),
    li('rework some functionality to be typesafe and typeguarded'),
    li('update dependencies'),
  ]),

  h2({}, '0.2.21'),
  ul([li('update dependencies')]),

  h2({}, '0.2.20'),
  ul([li('update dependencies')]),

  h2({}, '0.2.19'),
  ul([
    li('update dependencies'),
    li('add unused http.post. probably should replace http with fetch...'),
  ]),

  h2({}, '0.2.18'),
  ul([
    li('add missing fs.statfs, fs.statfsSync and fs.promises.constants to test/spec'),
    li('update dependencies'),
  ]),

  h2({}, '0.2.17'),
  ul([
    li('remove calls and coveralls-next, c8 takes care of coverage.'),
    li('update dependencies'),
  ]),

  h2({}, '0.2.16'),
  ul([li('update dependencies')]),

  h2({}, '0.2.15'),
  ul([
    li('update dependencies'),
    li('percentage outputs print nicer numbers'),
    li('added http export that allows http requests in tests. only supports get requests for now.'),
  ]),

  h2({}, '0.2.14'),
  ul([li('update dependencies')]),

  h2({}, '0.2.13'),
  ul([li('update dependencies')]),

  h2({}, '0.2.12'),
  ul([li('update dependencies')]),

  h2({}, '0.2.11'),
  ul([li('update dependencies')]),

  h2({}, '0.2.10'),
  ul([li('@magic/test can now test @magic/core again')]),

  h2({}, '0.2.9'),
  ul([li('update dependencies')]),

  h2({}, '0.2.8'),
  ul([li('update dependencies')]),

  h2({}, '0.2.7'),
  ul([li('update dependencies'), li('replace coveralls with coveralls-next')]),

  h2({}, '0.2.6'),
  ul([li('update dependencies')]),

  h2({}, '0.2.5'),
  ul([li('update dependencies'), li('@magic/core is a dev dependency now.')]),

  h2({}, '0.2.4'),
  ul([
    li(
      "lib/version: spec can have objects defined with ['obj', false], which will test the parent to be an object, but does not test the key/value pairs in the object.",
    ),
    li(
      'maybeInjectMagic: made magic injection more robust and much faster if magic is not being used.',
    ),
    li('t -p now does not show the coverage information'),
  ]),

  h2({}, '0.2.3'),
  ul([li('update dependencies')]),

  h2({}, '0.2.2'),
  ul([
    li(
      'spec values can be functions, allowing arbitrary equality testing to be executed by @magic/test.version',
    ),
  ]),

  h2({}, '0.2.1'),
  ul([
    li('internal restructuring'),
    li('tests now output their run duration'),
    li('add @magic/error dependency and export it from index'),
    li('index.js files have the same functionality as index.js files'),
    li('update dependencies'),
  ]),

  h2({}, '0.2.0'),
  ul([li('update dependencies'), li('version now tests spec and lib in a single run.')]),

  h2({}, '0.1.77'),
  ul([li('update dependencies')]),

  h2({}, '0.1.76'),
  ul([li('update dependencies')]),

  h2({}, '0.1.75'),
  ul([li('update dependencies')]),

  h2({}, '0.1.74'),
  ul([li('update dependencies')]),

  h2({}, '0.1.73'),
  ul([li('update dependencies')]),

  h2({}, '0.1.72'),
  ul([li('update @magic/types and intermediate deps to avoid circular dependency')]),

  h2({}, '0.1.71'),
  ul([li('update dependencies')]),

  h2({}, '0.1.70'),
  ul([li('update dependencies')]),

  h2({}, '0.1.69'),
  ul([li('import of magic config should work on windows')]),

  h2({}, '0.1.68'),
  ul([li('update @magic/core to fix tests if magic.js does not exist')]),

  h2({}, '0.1.67'),
  ul([li('silence errors if magic.js does not exist')]),

  h2({}, '0.1.66'),
  ul([li('better handling if magic is not in use')]),

  h2({}, '0.1.65'),
  ul([
    li('update dependencies'),
    li('testing of @magic-modules is now built in.'),
    li(
      'if @magic/core is installed, the tests will "just work" and return html for @magic-modules',
    ),
  ]),

  h2({}, '0.1.64'),
  ul([li('update dependencies (@magic/fs)')]),

  h2({}, '0.1.63'),
  ul([li('update dependencies (c8)')]),

  h2({}, '0.1.62'),
  ul([
    li('add html flag to tests, now @magic-modules can be tested \\o/'),
    li('update dependencies'),
  ]),

  h2({}, '0.1.61'),
  ul([li('update dependencies')]),

  h2({}, '0.1.60'),
  ul([li('bump required node version to 14.15.4'), li('update dependencies')]),

  h2({}, '0.1.59'),
  ul([li('update dependencies')]),

  h2({}, '0.1.58'),
  ul([li('update dependencies')]),

  h2({}, '0.1.57'),
  ul([li('update dependencies')]),

  h2({}, '0.1.56'),
  ul([li('update dependencies')]),

  h2({}, '0.1.55'),
  ul([li('update dependencies')]),

  h2({}, '0.1.54'),
  ul([li('update dependencies')]),

  h2({}, '0.1.53'),
  ul([li('update dependencies')]),

  h2({}, '0.1.52'),
  ul([li('update dependencies'), li('remove hyperapp from exports.')]),

  h2({}, '0.1.51'),
  ul([li('update dependencies')]),

  h2({}, '0.1.50'),
  ul([li('remove @magic/css export'), li('update c8')]),

  h2({}, '0.1.49'),
  ul([li('update @magic/css')]),

  h2({}, '0.1.48'),
  ul([li('bump required node version to 14.2.0'), li('update dependencies')]),

  h2({}, '0.1.47'),
  ul([li('update c8, yargs-parser')]),

  h2({}, '0.1.46'),
  ul([li('update @magic/css')]),

  h2({}, '0.1.45'),
  ul([li('security fix: update dependencies, yargs-parser.')]),

  h2({}, '0.1.44'),
  ul([li('update dependencies')]),

  h2({}, '0.1.43'),
  ul([li('update dependencies')]),

  h2({}, '0.1.42'),
  ul([li('update dependencies')]),

  h2({}, '0.1.41'),
  ul([li('update dependencies')]),

  h2({}, '0.1.40'),
  ul([li('update dependencies')]),

  h2({}, '0.1.39'),
  ul([li('update coveralls, fix minimist issue above.')]),

  h2({}, '0.1.38'),
  ul([li('update dependencies, minimist sec issue.')]),

  h2({}, '0.1.37'),
  ul([li('fix: arguments for both node and c8 tests work. broken in 0.1.36')]),

  h2({}, '0.1.36'),
  ul([li('c8: --exclude, --include and --all get applied correctly.')]),

  h2({}, '0.1.35'),
  ul([li('fix: c8 errored if coverage dir did not exist'), li('update dependencies')]),

  h2({}, '0.1.34'),
  ul([li('fix: c8 needs "report" command now')]),

  h2({}, '0.1.33'),
  ul([li('update exported dependencies')]),

  h2({}, '0.1.32'),
  ul([
    li('tests now work on windows \\o/'),
    li('uncaught errors will cause tests to fail with process.exit(1)'),
  ]),

  h2({}, '0.1.31'),
  ul([li('update dependencies')]),

  h2({}, '0.1.30'),
  ul([li('export @magic/fs')]),

  h2({}, '0.1.29'),
  ul([li('help text can show up when --help is used')]),

  h2({}, '0.1.28'),
  ul([li('package: engineStrict: true'), li('update cli: missing @magic/cases dependency')]),

  h2({}, '0.1.27'),
  ul([li('remove prettier from deps')]),

  h2({}, '0.1.26'),
  ul([li('remove commonjs support. node 13+ required. awesome.')]),

  h2({}, '0.1.25'),
  ul([
    li('currying now throws errors instead of returning them.'),
    li('update @magic/css'),
    li('update @magic/types which now uses @magic/deep for is.deep.eq and is.deep.diff'),
  ]),

  h2({}, '0.1.24'),
  ul([li('update @magic/css'), li('update c8')]),

  h2({}, '0.1.23'),
  ul([li('update @magic dependencies to use npm packages instead of github')]),

  h2({}, '0.1.22'),
  ul([li('update dependencies')]),

  h2({}, '0.1.21'),
  ul([li('update @magic/cli to allow default args')]),

  h2({}, '0.1.20'),
  ul([li('update broken dependencies')]),

  h2({}, '0.1.19'),
  ul([li('update dependencies')]),

  h2({}, '0.1.18'),
  ul([li('update dependencies'), li('require node 12.13.0')]),

  h2({}, '0.1.17'),
  ul([li('add node 13 json support for coverage reports.')]),

  h2({}, '0.1.16'),
  ul([li('update @magic/cli for node 13 support.')]),

  h2({}, '0.1.15'),
  ul([li('update dependencies')]),

  h2({}, '0.1.14'),
  ul([li('windows support now supports index.js files that provide test structure')]),

  h2({}, '0.1.13'),
  ul([li('windows support is back')]),

  h2({}, '0.1.12'),
  ul([li('update dependencies')]),

  h2({}, '0.1.11'),
  ul([li('update prettier, coveralls'), li('add and export @magic/css to test css validity')]),

  h2({}, '0.1.10'),
  ul([li('node 12.4.0 does not use --experimental-json-modules flag. removed it in 12.4+.')]),

  h2({}, '0.1.9'),
  ul([
    li('test/beforeAll.js gets loaded separately if it exists and executed before all tests'),
    li('test/afterAll.js gets loaded separately if it exists and executed after all tests'),
    li(
      'if the function exported from test/beforeAll.js returns another function, this returned function will also be executed after all tests',
    ),
    li('export hyperapp beta 18'),
  ]),

  h2({}, '0.1.8'),
  ul([li('update @magic/cli')]),

  h2({}, '0.1.7'),
  ul([li('readded calls npm run script'), li('updated c8')]),

  h2({}, '0.1.6'),
  ul([
    li('update this readme and html docs.'),
    li('tests should always process.exit(1) if they errored.'),
  ]),

  h2({}, '0.1.5'),
  ul([li('use ecmascript version of @magic/deep')]),

  h2({}, '0.1.4'),
  ul([li('npm run scripts of @magic/test itself can be run on windows.')]),

  h2({}, '0.1.3'),
  ul([li('cli now works everywhere')]),

  h2({}, '0.1.2'),
  ul([li('cli now works on windows again (actually, this version is broken on all platforms.)')]),

  h2({}, '0.1.1'),
  ul([li('rework of bin scripts and update dependencies to esmodules')]),

  h2({}, '0.1.0'),
  ul([li('use esmodules instead of commonjs.')]),
]
