### Changelog

#### 0.0.40

- fix svelte component coverage by pointing sourcemaps back to .svelte components

#### 0.0.39

- change c8 to use --all flag
- change c8 to not includ dist by default

#### 0.0.38

- fix imports of svelte components, they only have a default export. resolveSvelteExports now handles this correctly.
- update dependencies

#### 0.3.37

- svelte mount now correctly resolves # imports map from package.json

#### 0.3.36

- fix: add null guards for TypeScript strict mode in getSvelteExports tests

#### 0.3.35

- works with sveltekit ^3.0.0
- feat: add package.json imports support and module resolution (feat)
- feat: add svelte shims: $app/env added, also resolves as $app/environment
- move test fixtures to test/.fixtures
- chore: update dependencies

##### 0.3.34

- has subfunctions now allow either predicate functions OR literal values to be checked

##### 0.3.33

- update dependencies

##### 0.3.32

- make svelte optional again

##### 0.3.31

- feat: add deadlock detection system (ddl)
- feat: integrate ddl into cache, compile, and import pipeline
- feat: integrate ddl into resolve and package export pipeline
- feat: add loader init, warmup, and $app resolution
- feat: add addEventListener/removeEventListener to globals
- fix(svelte): remove console.error from pathUtils
- fix: add null guard and directory fallback in pathUtils
- fix: update registerLoader usage
- fix: remove REGISTERED message from tsLoader
- fix: fix tsc and eslint errors

##### 0.3.30

- fix(svelte): resolve $app imports to shims instead of @sveltejs/kit runtime (fixes ERR_MODULE_NOT_FOUND in tests)
- fix(svelte): skip non-default exports from .svelte files in barrel compilation (TypeScript types erased at runtime)
- fix(vite): inject $app alias into vite aliases for resolveAlias fallback
- style(svelte): use @magic/fs instead of node:fs for consistency
- fix(c8): correctly order argv for c8 runs.

##### 0.3.29

- feat(svelte): extract pathUtils with shared path resolution helpers (resolveFilePath, EXTENSION_CANDIDATES, FALLBACK_CANDIDATES, isSkipPattern)
- feat(svelte): extract fileWriter module for compiled file output with source map support
- feat(svelte): add resolveNodeModulesRelativeImportsPreprocessor for fixing '..' imports in node_modules
- feat(cache): add dedup function for concurrent promise deduplication
- refactor(svelte): extract loadViteConfig to shared module, consolidate getViteDefine and loadViteDefine
- refactor(svelte): remove resolveViteAlias, consolidate into resolveAlias
- refactor(svelte): use visitor pattern in resolveSvelteOnlyExports (traverseExports + ExportVisitor)
- refactor(svelte): use pathUtils in resolvePackageExport, fix .mjs resolution
- refactor(svelte): update tsLoader to use resolveAlias with includeShims and extractImportsSync
- refactor(svelte): use shared helpers across compile modules (getTempFilePath, fileWriter, processImports)
- fix(svelte): add includeShims option to resolveAlias for bare imports
- fix(vite): vite defines now correctly set in globalThis, by calling JSON.parse during assign.

##### 0.3.28

- fix: $lib/types.js -> the .js gets removed before appending the correct extension
- regression fix: version spec check now correctly errors with expected type again.
- update dependencies

##### 0.3.27

- fix: exclude .d.ts files from test discovery (passed .ts filter, caused import failures)
- fix: always exclude .d.ts from c8 coverage (user --exclude can no longer remove it)
- refactor: restructure c8 exclude logic in t.ts
- chore: move changelog from README.md to CHANGELOG.md (650 lines extracted)

##### 0.3.26

- add customElements to happy-dom globals

##### 0.3.25

- fix: use @magic/types for more type comparisons
- feat: make expect accept an array of typechecks
- test: make more files testable by extracting pure functions
- update dependencies

##### 0.3.24

- feat: show total time including test discovery overhead
- feat: add progress tracking for test discovery
- feat: add DISCOVERY_TIMEOUT env var to control test discovery timeout (default: 30s)
- perf: cache getViteDefine results

##### 0.3.23

- 0.3.22 caused tests to fail because viteconfig was not loaded correctly and lead to recursive imports

##### 0.3.22

- feat: make restoreProperties method public on Isolation class
- fix: move BigInt check before other type checks in makeSafeClone
- refactor: use pathToFileURL for ESM config imports
- refactor: use wrapTest helper consistently in suite
- refactor: simplify suiteHasBeforeAllOrAfterAll condition
- refactor: extract hasFixedPort helper in isolationChecks
- refactor: extract restoreProperties helper
- refactor: deduplicate evaluateWorkerResult by re-exporting evaluateTestResult
- refactor: use CACHE_DIR constant for test temp files
- refactor: use dynamic imports instead of manual config parsing
- refactor(http): extract makeRequest helper to deduplicate get/post
- refactor(mount): handle Svelte 5 snippets properly
- test: fix test type errors for HTMLElement click function
- test: update fixtures for improved test harness
- update dependencies

##### 0.3.21

- various build performance improvements, especially for svelte components
- add timing traces with MAGIC_TEST_TRACE env var and --trace CLI flag
- add promise-based caching via CacheManager
- consolidate worker pool into single source
- centralize caching in CacheManager at tsLoader level
- increase default test timeout to 30s
- fixed tsLoader .ts file handling
- add more tests for @magic/test itself
- implement persistent disk cache in node_modules/.magic-test-cache
- parallelize import resolution, barrel exports, and fs.exists checks
- cache fs.exists results, processImports results, and resolveViteAlias results
- skip writing unchanged files during compilation
- consolidate caches into single pendingPromises map
- add more tests for @magic/test itself
- update dependencies

##### 0.3.20

- prevent double-compilation of svelte components
- update dependencies

##### 0.3.19

- svelte edge cases
- custom test defines for globals

##### 0.3.18

- better resolution for imported dependencies in tests, especially <script> tags in svelte components that export functions/variables
- update dependencies

##### 0.3.17

- update test discovery, had edge cases where tests were not found

##### 0.3.16

- better kill handling for workers and child_process
- README fixes
- remove @systemkollektiv devDependencies, those packages are private for now
- update dependencies

##### 0.3.15

- fix import of .svelte.js/.ts files if js/ts extension is omitted

##### 0.3.14

- fireEvent function now correctly handles various addEventListener event types

##### 0.3.13

- update dependencies

##### 0.3.12

- make svelte optional for consumers
- update dependencies

##### 0.3.11

- performance improvements, better checks if tests need to be isolated
- fix timing issues in isolation code
- replace regex code checks with ast checks
- add `has` functionality for object checks
- update dependencies

##### 0.3.10

- fix more edge cases in svelte compilation steps
- add .css import support
- update dependencies

##### 0.3.9

- fix imports of test/index.(mjs|ts|js) files

##### 0.3.8

- add `--workers` flag to control max parallel workers (default: auto-detect CPU count)
- canvas polyfill works properly in happy-dom environment
- svelte: resolve svelte-only package exports
- svelte: fix import chain handling for components
- version: check if Lib is missing exports
- worker isolation: beforeAll and afterAll run in workers directly
- before fields in tests get awaited if they return a raw promise

##### 0.3.7

- advanced worker isolation, executing minimum number of needed workers for tests. lots of internal changes to achieve this.

##### 0.3.6 - broken

- tried implementing better isolation

##### 0.3.5

- better tsLoader resolve mechanism

##### 0.3.4

- also run registerLoader in workers

##### 0.3.3

- replace all import .ts with .js
- some test output fixes

##### 0.3.2 - BROKEN: some .ts references for worker.ts and unit.ts

- publish dist dir with .js files for consumers.

##### 0.3.1 - BROKEN, dist dir missing

##### 0.3.0 - BROKEN. node can not strip types in node_modules...

- added html support (using happy-dom, experimental!)
- added svelte support (experimental!)
- various improvements to test logic and structure of internal lib
- more tests.

##### 0.2.30

- allow tests to be written using typescript, .ts files can be test files now.
- add some internal tests
- update dependencies

##### 0.2.29

- tryCatch: pass on empty args
- update dependencies

##### 0.2.28

- use node:module register function for loader, allowing use of the --import flag instead of soon deprecated --loader.

##### 0.2.27

- allow resolving .js files as .ts files, this mimics typescript .js file resolver
- update @types/node

##### 0.2.26

- update dependencies

##### 0.2.25

- update dependencies

##### 0.2.24

- fix @magic/core tests on windows.

##### 0.2.23

- readd npm run prepublishOnly task
- update dependencies

##### 0.2.22

- add comprehensive typescript types
- rework some functionality to be typesafe and typeguarded
- update dependencies

##### 0.2.21

- update dependencies

##### 0.2.20

- update dependencies

##### 0.2.19

- update dependencies
- add unused http.post. probably should replace http with fetch...

##### 0.2.18

- add missing fs.statfs, fs.statfsSync and fs.promises.constants to test/spec
- update dependencies

##### 0.2.17

- remove calls and coveralls-next, c8 takes care of coverage.
- update dependencies

##### 0.2.16

update dependencies

##### 0.2.15

- update dependencies
- percentage outputs print nicer numbers
- added http export that allows http requests in tests. only supports get requests for now.

##### 0.2.14

update dependencies

##### 0.2.13

update dependencies

##### 0.2.12

update dependencies

##### 0.2.11

update dependencies

##### 0.2.10

@magic/test can now test @magic/core again

##### 0.2.9

update dependencies

##### 0.2.8

update dependencies

##### 0.2.7

- update dependencies
- replace coveralls with coveralls-next

##### 0.2.6

update dependencies

##### 0.2.5

- update dependencies
- @magic/core is a dev dependency now.

##### 0.2.4

- lib/version: spec can have objects defined with ['obj', false], which will test the parent to be an object,
  but does not test the key/value pairs in the object.
- maybeInjectMagic: made magic injection more robust and much faster if magic is not being used.
- t -p now does not show the coverage information

##### 0.2.3

update dependencies

##### 0.2.2

spec values can be functions, allowing arbitrary equality testing to be executed by @magic/test.version

##### 0.2.1

- internal restructuring
- tests now output their run duration
- add @magic/error dependency and export it from index
- index.js files have the same functionality as index.js files
- update dependencies

##### 0.2.0

- update dependencies
- version now tests spec and lib in a single run.

##### 0.1.77

update dependencies

##### 0.1.76

update dependencies

##### 0.1.75

update dependencies

##### 0.1.74

update dependencies

##### 0.1.73

update dependencies

##### 0.1.72

update @magic/types and intermediate deps to avoid circular dependency

##### 0.1.71

update dependencies

##### 0.1.70

update dependencies

##### 0.1.69

import of magic config should work on windows

##### 0.1.68

update @magic/core to fix tests if magic.js does not exist

##### 0.1.67

- silence errors if magic.js does not exist

##### 0.1.66

- better handling if magic is not in use

##### 0.1.65

- update dependencies
- testing of @magic-modules is now built in.
  if @magic/core is installed, the tests will "just work" and return html for @magic-modules

##### 0.1.64

update dependencies (@magic/fs)

##### 0.1.63

update dependencies (c8)

##### 0.1.62

- add html flag to tests, now @magic-modules can be tested \o/
- update dependencies

##### 0.1.61

update dependencies

##### 0.1.60

- bump required node version to 14.15.4
- update dependencies

##### 0.1.59

update dependencies

##### 0.1.58

update dependencies

##### 0.1.58

update dependencies

##### 0.1.57

update dependencies

##### 0.1.56

update dependencies

##### 0.1.55

update dependencies

##### 0.1.54

update dependencies

##### 0.1.53

update dependencies

##### 0.1.52

- update dependencies
- remove hyperapp from exports.

##### 0.1.51

- update dependencies

##### 0.1.50

- remove @magic/css export
- update c8

##### 0.1.49

update @magic/css

##### 0.1.48

bump required node version to 14.2.0
update dependencies

##### 0.1.47

update c8, yargs-parser

##### 0.1.46

update @magic/css

##### 0.1.45

security fix: update dependencies, yargs-parser.

##### 0.1.44

update dependencies

##### 0.1.43

update dependencies

##### 0.1.42

update dependencies

##### 0.1.41

update dependencies

##### 0.1.40

update dependencies

#### 0.1.39

update coveralls, fix minimist issue above.

#### 0.1.38

update dependencies, minimist sec issue.

#### 0.1.37

fix: arguments for both node and c8 tests work. broken in 0.1.36

#### 0.1.36

c8: --exclude, --include and --all get applied correctly.

#### 0.1.35

- fix: c8 errored if coverage dir did not exist
- update dependencies

#### 0.1.34

fix: c8 needs "report" command now

#### 0.1.33

update exported dependencies

#### 0.1.32

- tests now work on windows \o/
- uncaught errors will cause tests to fail with process.exit(1)

#### 0.1.31

update dependencies

#### 0.1.30

export @magic/fs

#### 0.1.29

help text can show up when --help is used

#### 0.1.28

- package: engineStrict: true
- update cli: missing @magic/cases dependency

#### 0.1.27

remove prettier from deps

#### 0.1.26

remove commonjs support. node 13+ required. awesome.

#### 0.1.25

- currying now throws errors instead of returning them.
- update @magic/css
- update @magic/types which now uses @magic/deep for is.deep.eq and is.deep.diff

#### 0.1.24

- update @magic/css
- update c8

#### 0.1.23

update @magic dependencies to use npm packages instead of github

#### 0.1.22

update dependencies

#### 0.1.21

update @magic/cli to allow default args

#### 0.1.20

update broken dependencies

#### 0.1.19

update dependencies

#### 0.1.18

- update dependencies
- require node 12.13.0

#### 0.1.17

add node 13 json support for coverage reports.

#### 0.1.16

update @magic/cli for node 13 support.

#### 0.1.15

update dependencies

#### 0.1.14

windows support now supports index.js files that provide test structure

#### 0.1.13

windows support is back

#### 0.1.12

update dependencies

#### 0.1.11

- update prettier, coveralls
- add and export @magic/css to test css validity

#### 0.1.10

node 12.4.0 does not use --experimental-json-modules flag. removed it in 12.4+.

#### 0.1.9

- test/beforeAll.js gets loaded separately if it exists and executed before all tests
- test/afterAll.js gets loaded separately if it exists and executed after all tests
- if the function exported from test/beforeAll.js returns another function,
  this returned function will also be executed after all tests
- export hyperapp beta 18

#### 0.1.8

update @magic/cli

#### 0.1.7

- readded calls npm run script
- updated c8

#### 0.1.6

- update this readme and html docs.
- tests should always process.exit(1) if they errored.

#### 0.1.5

use ecmascript version of @magic/deep

#### 0.1.4

npm run scripts of @magic/test itself can be run on windows.

#### 0.1.3

cli now works everywhere

#### 0.1.2

cli now works on windows again (actually, this version is broken on all platforms.)

#### 0.1.1

rework of bin scripts and update dependencies to esmodules

#### 0.1.0

use esmodules instead of commonjs.
