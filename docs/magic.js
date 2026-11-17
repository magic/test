const __MAGIC__=()=>{var e,t,s,o,r,i,a,n,l,c,p,d,u,f,m,h,g,v,x,y;let{h:b,app:w}=(e={},s=(t=[]).map,o=Array.isArray,r="u">typeof requestAnimationFrame?requestAnimationFrame:setTimeout,i=function(e){var t="";if("string"==typeof e)return e;if(o(e)&&e.length>0)for(var s,r=0;r<e.length;r++)""!==(s=i(e[r]))&&(t+=(t&&" ")+s);else for(var r in e)e[r]&&(t+=(t&&" ")+r);return t},a=function(e,t){var s={};for(var o in e)s[o]=e[o];for(var o in t)s[o]=t[o];return s},n=function(e){return e.reduce(function(e,t){return e.concat(t&&!0!==t?"function"==typeof t[0]?[t]:n(t):0)},t)},l=function(e,t){if(e!==t)for(var s in a(e,t)){var r,i;if(e[s]!==t[s]&&(r=e[s],i=t[s],!(o(r)&&o(i))||r[0]!==i[0]||"function"!=typeof r[0]))return!0;t[s]=e[s]}},c=function(e,t,s){for(var o,r,i=0,a=[];i<e.length||i<t.length;i++)o=e[i],a.push((r=t[i])?!o||r[0]!==o[0]||l(r[1],o[1])?[r[0],r[1],r[0](s,r[1]),o&&o[2]()]:o:o&&o[2]());return a},p=function(e,t,s,o,r,n){if("key"===t);else if("style"===t)for(var l in a(s,o))s=null==o||null==o[l]?"":o[l],"-"===l[0]?e[t].setProperty(l,s):e[t][l]=s;else"o"===t[0]&&"n"===t[1]?((e.actions||(e.actions={}))[t=t.slice(2)]=o)?s||e.addEventListener(t,r):e.removeEventListener(t,r):!n&&"list"!==t&&"children"!==t&&t in e?e[t]=null==o?"":o:null!=o&&!1!==o&&("class"!==t||(o=i(o)))?"children"!==t&&e.setAttribute(t,o):e.removeAttribute(t)},d=function(e,t,s){var o=e.props,r=3===e.type?document.createTextNode(e.name):(s=s||"svg"===e.name)?document.createElementNS("http://www.w3.org/2000/svg",e.name,{is:o.is}):document.createElement(e.name,{is:o.is});for(var i in o)p(r,i,null,o[i],t,s);for(var a=0,n=e.children.length;a<n;a++)r.appendChild(d(e.children[a]=g(e.children[a]),t,s));return e.node=r},u=function(e){return null==e?null:e.key},f=function(e,t,s,o,r,i){if(s===o);else if(null!=s&&3===s.type&&3===o.type)s.name!==o.name&&(t.nodeValue=o.name);else if(null==s||s.name!==o.name)t=e.insertBefore(d(o=g(o),r,i),t),null!=s&&e.removeChild(s.node);else{var n,l,c,m,h=s.props,v=o.props,x=s.children,y=o.children,b=0,w=0,E=x.length-1,k=y.length-1;for(var T in i=i||"svg"===o.name,a(h,v))("value"===T||"selected"===T||"checked"===T?t[T]:h[T])!==v[T]&&p(t,T,h[T],v[T],r,i);for(;w<=k&&b<=E&&null!=(c=u(x[b]))&&c===u(y[w]);)f(t,x[b].node,x[b],y[w]=g(y[w++],x[b++]),r,i);for(;w<=k&&b<=E&&null!=(c=u(x[E]))&&c===u(y[k]);)f(t,x[E].node,x[E],y[k]=g(y[k--],x[E--]),r,i);if(b>E)for(;w<=k;)t.insertBefore(d(y[w]=g(y[w++]),r,i),(l=x[b])&&l.node);else if(w>k)for(;b<=E;)t.removeChild(x[b++].node);else{for(var T=b,S={},C={};T<=E;T++)null!=(c=x[T].key)&&(S[c]=x[T]);for(;w<=k;){if(c=u(l=x[b]),m=u(y[w]=g(y[w],l)),C[c]||null!=m&&m===u(x[b+1])){null==c&&t.removeChild(l.node),b++;continue}null==m||1===s.type?(null==c&&(f(t,l&&l.node,l,y[w],r,i),w++),b++):(c===m?(f(t,l.node,l,y[w],r,i),C[m]=!0,b++):null!=(n=S[m])?(f(t,t.insertBefore(n.node,l&&l.node),n,y[w],r,i),C[m]=!0):f(t,l&&l.node,null,y[w],r,i),w++)}for(;b<=E;)null==u(l=x[b++])&&t.removeChild(l.node);for(var T in S)null==C[T]&&t.removeChild(S[T].node)}}return o.node=t},m=function(e,t){for(var s in e)if(e[s]!==t[s])return!0;for(var s in t)if(e[s]!==t[s])return!0},h=function(e){return"object"==typeof e?e:x(e)},g=function(e,t){return 2===e.type?((!t||!t.lazy||m(t.lazy,e.lazy))&&((t=h(e.lazy.view(e.lazy))).lazy=e.lazy),t):e},v=function(e,t,s,o,r,i){return{name:e,props:t,children:s,node:o,type:i,key:r}},x=function(s,o){return v(s,e,t,o,void 0,3)},y=function(t){return 3===t.nodeType?x(t.nodeValue,t):v(t.nodeName.toLowerCase(),e,s.call(t.childNodes,y),t,void 0,1)},{h:function(t,s){for(var r,i=[],a=[],n=arguments.length;n-- >2;)i.push(arguments[n]);for(;i.length>0;)if(o(r=i.pop()))for(var n=r.length;n-- >0;)i.push(r[n]);else!1===r||!0===r||null==r||a.push(h(r));return s=s||e,"function"==typeof t?t(s,a):v(t,s,a,void 0,s.key)},app:function(e){var t={},s=!1,i=e.view,a=e.node,l=a&&y(a),p=e.subscriptions,d=[],u=function(e){v(this.actions[e.type],e)},m=function(e){return t!==e&&(t=e,p&&(d=c(d,n([p(t)]),v)),i&&!s&&r(x,s=!0)),t};let{middleware:g=e=>e}=e,v=g((e,s)=>"function"==typeof e?v(e(t,s)):o(e)?"function"==typeof e[0]||o(e[0])?v(e[0],"function"==typeof e[1]?e[1](s):e[1]):(n(e.slice(1)).map(function(e){e&&e[0](v,e[1])},m(e[0])),t):m(e));var x=function(){s=!1,a=f(a.parentNode,a,l,l=h(i(t)),u)};v(e.init)}}),E=e=>(t={},s)=>{let o=(e,...t)=>t.some(t=>t===typeof e);if(o(s,"undefined")){if(t.props)return b(e,{},[t]);o(t,"string","number","function")||Array.isArray(t)?(s=t,t={}):o(t.View,"function")&&(s=t.View,t={})}return b(e,t,s)},k=E("a"),T=E("button"),S=E("circle"),C=E("code");E("description");let R=E("div"),_=E("footer"),A=E("g"),O=E("h1"),I=E("h2"),N=E("h3"),M=E("h4"),j=E("header"),P=E("img"),D=E("input"),F=E("li");E("link");let L=E("main");E("meta");let U=E("nav"),G=E("p"),q=E("path"),W=E("pre");E("script");let V=E("span"),$=E("svg"),H=E("table"),z=E("td"),B=E("th");E("title");let K=E("tr"),J=E("ul"),X=({to:e,action:t=ee.go,text:s,...o},r)=>{let{href:i,nofollow:a,noreferrer:n,...l}=o;return l.href=e=e||i||"",s&&r?s=[s,r]:s||(s=r||e),"/"===e[0]||"#"===e[0]?l.onclick=[t,Z.preventDefault]:(l.target="_blank",l.rel="noopener",a&&(l.rel+=" nofollow"),n&&(l.rel+=" noreferrer")),k(l,s)},Y=e=>{let{collapse:t,items:s=[],text:o,url:r,...i}=e,a={class:{}},{to:n}=i;n===r&&(a.class.active=!0);let l=[];return(!t||r.includes(n))&&s.length&&(l=J(s.map(e=>Y({url:r,collapse:t,...e})))),F(a,[n?X(i,o):V(i,o),l])},Q=(e,t)=>{"string"==typeof e?e={content:e}:t?e={content:t,...e}:Array.isArray(e)&&(e={content:e.join("")});let{content:s,lines:o=!0}=e;return R({class:{Pre:!0,lines:o&&"false"!==o}},[R({class:"menu"},[T({onclick:[ee.pre.clip,e=>({e,content:s})]},"copy")]),W(s.trim().split("\n").map(Q.Line))])};Q.Comment=e=>V({class:"comment"},e),Q.Line=e=>C({class:"line"},Q.Words(e)),Q.Word=e=>{if(!e)return"";let t=e.includes("://"),s=e.startsWith("mailto:")||e.includes("@")&&e.includes(".");if(t||s)return X({to:e,text:e});let o="";return("state"===e?o="state":"actions"===e?o="actions":"effects"===e?o="effects":"subscriptions"===e?o="subscriptions":Z.pre.keywords.includes(e)?o="keyword":Z.pre.builtins.includes(e)?o="builtin":Z.pre.booleans.includes(e)&&(o="boolean"),o)?V({class:o},e):e},Q.Words=e=>{let[t,...s]=e.split(Z.pre.commentRegex);if(!t.endsWith(":")&&s.length)return[Q.Words(t),Q.Comment(s.join("").split(Z.pre.wordRegex).map(Q.Word))];let o=[],r=e;return(e.replace(Z.pre.stringRegex,e=>{if(r){let[t,s]=r.split(e);t&&o.push(t.split(Z.pre.wordRegex).map(Q.Word).filter(e=>e)),r=s}o.push(V({class:"string"},e))}),r!==e)?(r&&o.push(r.split(Z.pre.wordRegex).map(Q.Word).filter(e=>e)),o):e.split(Z.pre.wordRegex).filter(e=>e).map(Q.Word)};let Z={pre:{booleans:["true","false"],builtins:["Array","Object","String","Number","RegExp","Null","Symbol","Set","WeakSet","Map","WeakMap","setInterval","setTimeout","Promise","JSON","Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Uint16Array","Int32Array","Uint32Array","Float32Array","Float64Array"],commentRegex:/(\/\/)/gim,keywords:["let","this","long","package","float","goto","private","class","if","short","while","protected","with","debugger","case","continue","volatile","interface","instanceof","super","synchronized","throw","extends","final","export","throws","try","import","double","enum","boolean","abstract","function","implements","typeof","transient","break","default","do","static","void","int","new","async","native","switch","else","delete","null","public","var","await","byte","finally","catch","in","return","for","get","const","char","module","exports","require","npm","install","=>"],stringRegex:/("|')(.*?)\1/gim,wordRegex:/( )/gim},preventDefault:e=>(e.preventDefault(),e)},ee={changeTheme:e=>({...e,pageClass:{...e.pageClass,light:"dark"===e.theme},theme:"dark"===e.theme?"light":"dark"}),go:(e,t)=>{if(!t||!t.currentTarget)return e;let s=t.currentTarget.href.replace(window.location.origin,""),[o,r=""]=s.split("#");if(o===e.url&&r===e.hash)return r&&(window.location.hash=r),e;let i=e.pages&&e.pages[o]&&e.pages[o].title;i&&(document.title=e.title=i),o!==e.url?r||window.scrollTo({top:0}):window.location.hash=r;let{scrollY:a}=window;return window.history.pushState({url:o,hash:r,scrollY:a},e.title,s),{...e,url:o,hash:r,prev:e.url}},nospy:{toggle:e=>(e.nospy.show=!e.nospy.show,{...e})},pop:(e,t)=>{let{pathname:s,hash:o}=window.location;o=o.substring(1);let r=0;return t.state&&(s=t.state.url,o=t.state.hash,r=t.state.scrollY||0),o?window.location.hash=o:window.scroll({top:r}),{...e,url:s,hash:o}},pre:{clip:(e,{content:t})=>{if("u">typeof document&&"function"==typeof document.execCommand){let e=document.createElement("textarea");e.id="copy",e.innerHTML=t,document.body.appendChild(e);let s=document.getElementById("copy");s.select(),document.execCommand("copy"),document.body.removeChild(s)}return e}}},et=(e,t)=>{let s=s=>e(t,s);return addEventListener("popstate",s),()=>removeEventListener("popstate",s)},es={"/test/":()=>[O({id:"magictest"},"@magic/test"),G(["Declaratively test your ecmascript module files."," No transpiling of either your codebase nor the tests."," Fast."]),(e=>{if("string"==typeof e)e={project:e};else if(!e.project)return;let{branch:t="master",host:s="github"}=e,{project:o=!1}=e,r="",i=o;o.startsWith("@")?(r="@",o=o.substr(1)):i=o.split("/")[1];let a=[["npm",(e=o)=>e&&{to:`https://www.npmjs.com/package/${i}`,src:`https://img.shields.io/npm/v/${r}${e}?color=blue`}],["node",(e=o)=>e&&{src:`https://img.shields.io/node/v/${r}${e}?color=blue`}],["license",(e=o)=>e&&{src:`https://img.shields.io/npm/l/${r}${e}?color=blue`}],["travis",(e=o)=>e&&{to:`https://travis-ci.com/${e}`,src:`https://img.shields.io/travis/com/${e}/${t}`}],["appveyor",(e=o)=>{if(e){let[s,o]=e.split("/");return s=s.replace(/-/g,""),{to:`https://ci.appveyor.com/project/${s}/${o}/branch/${t}`,src:`https://img.shields.io/appveyor/ci/${s}/${o}/${t}.svg`}}}],["coveralls",(e=o)=>({to:`https://coveralls.io/${s}/${e}`,src:`https://img.shields.io/coveralls/${s}/${e}/${t}.svg`})],["snyk",(e=o)=>e&&{to:`https://snyk.io/test/${s}/${e}`,src:`https://img.shields.io/snyk/vulnerabilities/github/${e}.svg`}]].map(([t,s])=>s(e[t]));if(a.length)return J({class:"GitBadges"},a.map(({to:e,src:t})=>{if(!t)return;let s=(e=>{"string"==typeof e&&(e={src:e});let{loading:t="lazy"}=e;if(e.src)return e.hasOwnProperty("alt")||(e.title?e.alt=e.title:e.alt=""),e.loading=t,P(e)})({src:t,height:"23"});return e?F(X({to:e},s)):F(s)}))})("@magic/test"),I({id:"getting-started"},"Getting Started"),G(["the ",X({to:"/getting-started/"},"Getting Started")," page walks you through the whole thing."]),Q({lines:"false"},"npm i --save-dev --save-exact @magic/test"),Q(`
// test/yourFileToTest.js
export default [
  { fn: () => true, expect: true, info: 'true is true' },
]
`),I({id:"features"},"Features"),J([F([X({to:"/writing-tests/"},"Write tests")," in plain JavaScript or TypeScript"]),F([X({to:"/lib/"},"Utility functions")," for deep equality, mocking, HTTP, and more"]),F([X({to:"/svelte/"},"Svelte 5")," component testing built-in"]),F([X({to:"/cli/"},"CLI tools")," with sharding for parallel test execution"]),F([X({to:"/test-isolation/"},"Test isolation")," for preventing state leakage"]),F([X({to:"/error-codes/"},"Error codes")," for programmatic error handling"])]),I({id:"quick-examples"},"Quick Examples"),N({},"Simple test"),Q(`
export default [
  { fn: () => 1 + 1, expect: 2 },
  { fn: () => 'hello', expect: 'hello' },
]
`),N({},"Async test"),Q(`
import { promise } from '@magic/test'

export default [
  {
    fn: promise(cb => setTimeout(() => cb(null, true), 100)),
    expect: true,
    info: 'handle promises',
  },
]
`),N({},"Deep equality"),Q(`
import { is } from '@magic/test'

export default [
  {
    fn: () => ({ a: 1, b: 2 }),
    expect: is.deep.equal({ a: 1, b: 2 }),
    info: 'deep compare objects',
  },
]
`),N({},"Mock function"),Q(`
import { mock } from '@magic/test'

export default [
  {
    fn: () => {
      const spy = mock.fn()
      spy('arg1')
      return spy.calls.length === 1
    },
    expect: true,
    info: 'mock tracks calls',
  },
]
`),I({id:"learn-more"},"Next steps"),J([F([X({to:"/getting-started/"},"Getting Started")," - install, setup, first test"]),F([X({to:"/writing-tests/"},"Writing Tests")," - hooks, promises, types, multiple tests"]),F([X({to:"/lib/"},"Utility Functions")," - deep, fs, curry, log, vals, env, http, mock, has"]),F([X({to:"/svelte/"},"Svelte Testing")," - mount components, interact, assert"]),F([X({to:"/svelte/4-vs-5/"},"Svelte 4 vs 5")," - feature comparison"]),F([X({to:"/cli/"},"CLI & Usage")," - flags, sharding, performance tips"]),F([X({to:"/cli/flags/"},"CLI Flags Reference")," - detailed flag table"]),F([X({to:"/cli/sharding-cheatsheet/"},"CLI Sharding Cheat-Sheet")," - CI/CD examples"]),F([X({to:"/cli/performance-tips/"},"Performance Tips")," - optimization techniques"]),F([X({to:"/cli/common-pitfalls/"},"Common Pitfalls")," - troubleshooting tips"]),F([X({to:"/test-isolation/"},"Test Isolation")," - prevent state leakage between tests"]),F([X({to:"/error-codes/"},"Error Codes")," - programmatic error handling"]),F([X({to:"/error-codes-quicklook/"},"Error Codes Quick Look")," - quick reference table"]),F(X({to:"/changelog/"},"Changelog")," - detailed release history")]),G(["This library tests itself. Have a look at ",X({to:"https://github.com/magic/test/tree/master/test",text:"the tests"})," on GitHub."])],"/test/404/":()=>R("404 - not found."),"/test/changelog/":()=>[O({id:"changelog"},"Changelog"),I({},"0.3.58"),J([F("fix: the ESM loader now serves `.svelte.js` files from the compile cache verbatim instead of re-transpiling them — the re-transpiled in-memory source was longer than the on-disk file, so V8 coverage offsets remapped against the on-disk source map produced phantom uncovered statements/branches/functions (some past EOF), capping branch coverage of Svelte projects at ~94% no matter how many tests were added"),F("test: regression for verbatim serving of cache `.svelte.js` files (plus transpilation of `.svelte.js` files outside the cache, which is unchanged)"),F("perf: the auto worker pool is capped at 4 workers by default and adapts to system load (halves between 1\xd7 and 2\xd7 the core count, drops to 1 above that; `MAGIC_TEST_ADAPTIVE=0` or CI disables it) — a test run no longer saturates a 16-core machine"),F("feat: `--nice` / `MAGIC_TEST_NICE` (default 10): on macOS/Linux the run is wrapped in `nice` when the machine is busy at spawn (1-min load average above half the cores) so the user's own work stays responsive; on an idle machine the suite runs at full speed; `--nice 0` / `MAGIC_TEST_NICE=0` disables throttling"),F("fix: on a busy machine at spawn the wall-clock budgets are bumped — per-file discovery/import 30 s → 120 s, per-test 30 s → 300 s, worker round-trip backstop 120 s → 600 s — a starved run is slow, not hung; explicit `MAGIC_TEST_DISCOVERY_TIMEOUT` / `MAGIC_TEST_TIMEOUT` / `--timeout` / `MAGIC_TEST_WORKER_TIMEOUT_MS` still win"),F("fix: the getTestTimeout tests no longer leak their MAGIC_TEST_TIMEOUT mutation into the ambient process env — a leaked delete downgraded every later test in the process to the stock 30 s default"),F("test: worker-pool, E2E-child and DDL-watchdog deadlines now scale with the load, so the suite stays green on a busy machine (tight contracts unchanged on an idle one)"),F("perf: components are no longer recompiled on every mount — compileSvelteWithWrite checks the persistent compile cache first (mtime+size fast path, hash authoritative), so an unchanged .svelte file costs a stat instead of a full compile + file write + manifest rewrite; set MAGIC_TEST_COMPILE_CACHE=0 to restore the old always-recompile behavior"),F("fix: the compile-cache manifest is updated under a cross-process file lock with a fresh disk read inside the lock — concurrent workers could previously clobber each other's entries, silently losing cache entries (phantom misses and duplicate compiles)"),F("fix: a cached compile is only served when the source hash still matches (hash cache entries are stat-validated, so a rewritten file within one mtime tick is detected) and when its compiled relative imports still exist — deleted sibling components no longer leave stale imports behind"),F("fix: the compile cache is invalidated when the installed svelte version changes; sources outside the project root (pnpm store, monorepo siblings, /tmp fixtures) are cached under outside/ in the cache directory instead of being scattered into the project tree"),F("perf: TypeScript transpilation (.ts / .svelte.ts / .mjs) is cached persistently by content hash — a warm run transpiles nothing that a previous run already transpiled"),F("perf: vite/tsconfig alias resolution is cached per project root (revalidated with 2-3 stat calls per resolve) — removes multi-second tail latency from suite startup on projects with many aliased imports"),F("perf: happy-dom is loaded lazily and the svelte rune-detection parse is skipped for components without $state( / $derived( call sites"),F("fix: sharding configuration is no longer exported to the process environment — child processes spawned by tests could inherit a sharded view of the suite"),F("test: self-tests for the persistent manifest (hit/miss, invalidation, stale sweep, outside/ anchoring), cache-aware compile (no rewrite on hit, css parity, stale-island healing, kill switch), transpile cache, and the alias cache lifecycle"),F("test: sveltekit navigation tests capture the URL into component state after pushState (instead of reading the page proxy at render time, which the global flush queue could evaluate under a foreign context) and run sequentially with a context reset between tests")]),I({},"0.3.57"),J([F("@magic/deep mutated the values passed to is.deep.equal, leading to irregular test results in narrow edge cases"),F("update dependencies")]),I({},"0.3.56"),J([F('fix: rare DDL watchdog flake ("waiting: false") — `globalThis.__DDL` (the 5s-watchdog singleton held by test/lib/svelte/compile/ddl.ts) is now in the isolation skipProps list, so a sibling isolated test\'s snapshot/restore cycle can no longer delete it mid-test'),F("fix: snapshot/restore no longer deep-clones `WebAssembly`, `Intl`, `Atomics`, `customElements`, or the shared happy-dom window — deep cloning turned them into broken shells (`WebAssembly.Module is not a constructor`, dead `WeakRef`s inside a cloned window) that restore installed over the real globals"),F("fix: localStorage/sessionStorage are captured as entries and re-populated into the LIVE storage on restore instead of being replaced by a clone whose private state is empty"),F("fix: worker postMessage payloads are sanitized recursively (functions nested in a test's result/expect become their source string) — a single unclonable value previously threw DataCloneError and killed the worker mid-batch, losing every remaining test of the file"),F("fix: the globals detector no longer false-positives on global names inside string/template literals, comments, or as identifier substrings (`globalStartTime`, `windowWidth`, `subprocess.`) — fewer suites routed to unnecessary workers"),F("test: deterministic regression for the __DDL restore race, storage restore, skipProps additions, and payload sanitization"),F("feat: `--exclude` / `-e` now also applies to the auto-generated .d.ts type tests — excluded dirs and files are not collected or checked"),F("feat: .d.ts tests now use types declarations from tsconfig.json of the tested repository")]),I({},"0.3.55"),J([F("importing virtual: modules does not crash the test suite, instead an empty module is returned, better than nothing...")]),I({},"0.3.54"),J([F("update dependencies")]),I({},"0.3.53"),J([F("feat: local c8 replacement — v8 coverage reader with source-map remapping and istanbul text report"),F("feat: coverage stats + summary output, results-file handoff between processes"),F("feat: drop c8 dependency, test:native now uses `t --native`"),F("feat: local coverage via NODE_V8_COVERAGE, add `--native` flag, summary printed after coverage"),F("feat: cover stats summary, coverage table, results file output"),F("chore: replace functions with const declarations"),F(".gitignore: ignore /coverage and /.plans only in top dir"),F("update dist")]),I({},"0.3.52"),J([F("feat: default worker reuse on — a file's isolated tests now run sequentially in one shared worker by default (faster, ~22 s → ~15 s wall time on a 159-test SvelteKit suite). Set `MAGIC_TEST_WORKER_REUSE=0` to force one fresh worker per test (full per-test isolation)."),F("fix: remove run-tests.sh"),F("test: silence console.log for info message test"),F("fix: replace canvas with @napi-rs/canvas"),F("update dependencies, formatting and linting uses ox toolchain now."),F("fix: stop watchdog from pinning test process (f33b2aac)"),F("bin/lib/registerLoader: avoid deprecated version of mod.register, better error handling (a88b264b)"),F("src/bin: fix CLI execution checks, use `fs.realpathSync` instead of `urlToFilePath` (cb06d19b)"),F("feat: type-check .d.ts files in every test run (204d331a)"),F("add overrides for glob and minimatch (1a556be4)"),F("pkg, oxlint.config.ts: use @magic/lint, update dependencies (d04b2671)"),F("src/run.ts: export `getShardForTest` for testing (918dc0aa)"),F("remove magic-string dependency, comes from svelte (7823d6ca)")]),I({},"0.3.51"),J([F("feat: changed usage of `--production` / `-p` flag — reads prod mode from CLI arg instead of `NODE_ENV`, sets `MAGIC_TEST_ENV`; SvelteKit dev/prod sentinels read `MAGIC_TEST_ENV` instead of `NODE_ENV`"),F("feat: synthesize `$app/env/private` and `$app/env/public` from `src/env.ts` — parses top-level `defineEnvVars` keys from `src/env.ts` (cached per project root), emits temp module files exporting `process.env.<var>` at module-evaluation time"),F("feat: support remote module URLs and raw string Vite defines — materialize remote `http/https` modules as local cached files; rewrite relative specifiers in remote sources to absolute URLs; keep `http/https` alias targets verbatim; parse Vite define values as JSON when possible, keep raw strings otherwise"),F("deps: update dependencies"),F("chore: switch from ESLint to Oxlint"),F("fix: replace `@typescript-eslint/parser` with `oxc-parser` for static source analysis (import/export extraction, module-state mutation checks, Svelte rune & compiled-output detection). `oxc-parser` is the same parser oxlint is built on, ~3\xd7 faster than the previous one."),F("chore: update tsconfig for VS Code linting of @types/node types"),F("chore: remove Travis CI and AppVeyor configs"),F("docs: add `MAGIC-TEST-SKILL.md` and reference it in README.md")]),I({},"0.3.50"),J([F("feat: add -s, --slow, --timing flag to get slow test information"),F("feat: `has.not` — negated versions of every `has.*` check: `has.not.property`,"),F("feat: `has.at(index, checks[])` — an array of checks now passes only when")]),I({},"0.3.49"),J([F("fix: prevent maximum call stack size exceeded in collectComponentPaths")]),I({},"0.3.48"),J([F("perf: component import graphs — per-process memoization of resolved import"),F("perf: barrel wrappers are now persistent. `compileBarrel` writes the"),F("perf: `compileSvelteWithWrite` (the warmup path) records its output in the"),F("perf/robustness: compile-cache writes are atomic (temp + rename), the"),F("feat: prewarm component graphs before test workers start — a small pool of"),F("feat: `MAGIC_TEST_WORKER_REUSE=1` — run a file's isolated tests"),F("fix: svelte-only barrel generation — the per-export compile raced a 30 s")]),I({},"0.3.47"),J([F("fix: coverage attribution for .ts/.svelte modules — removed the per-module"),F("fix: component tests can now mount components with side-effect asset"),F("fix: compiled output for sources outside the project (e.g. file:-symlinked"),F("test: regression tests for processImports side-effect handling")]),I({},"0.3.45"),J([F("better handling of _unknown_ string in svelte components"),F("update dependencies")]),I({},"0.3.44"),J([F("add sveltekit server store support, allowing sveltekit apps to test server side code paths")]),I({},"0.3.43"),J([F("feat: support context factory function in mount() with target/props"),F("fix(tsLoader): resolve bare package specifiers from CACHE_DIR against real node_modules"),F("feat: add MAGIC_TEST_VERBOSE_ERRORS for detailed import/runtime diagnostics"),F("fix: initialize DOM globals before importing test files (main process and workers)"),F("fix: stop mutating shared ESM failure errors in import error messages")]),I({},"0.3.42"),J([F("src/run/lib/prepareTest: add componentContext to returned args"),F("remove unused componentContext args"),F("test: fix expected values for Derived and Input"),F("perf: pre-compile svelte components before test run"),F("perf: cache resolveSvelteOnlyExports results on disk (keyed by content hash) to skip per-file AST parse during test collection on warm runs"),F("perf: increase component pre-compile concurrency from 2 to 6"),F("feat: support context option for component tests"),F("fix: resolve bare svelte imports to client runtime in ts loader"),F("tsconfig: remove allowSyntheticDefaultImports and allowImportingTsExtensions, add types/node"),F("remove TestComponent.svelte from testFixtures/barrelFixtures, is in testFixtures/components"),F("format")]),I({},"0.3.41"),J([F("svelte component coverage fully fixed, 0.3.40 was using the wrong paths"),F("move test/.fixtures to src/lib/svelte/testFixtures to make them exposed to c8 coverage")]),I({},"0.3.40"),J([F("fix svelte component coverage by pointing sourcemaps back to .svelte components")]),I({},"0.3.39"),J([F("change c8 to use --all flag"),F("change c8 to not include dist by default")]),I({},"0.3.38"),J([F("fix imports of svelte components, they only have a default export. resolveSvelteExports now handles this correctly."),F("update dependencies")]),I({},"0.3.37"),J([F("svelte mount now correctly resolves # imports map from package.json")]),I({},"0.3.36"),J([F("fix: add null guards for TypeScript strict mode in getSvelteExports tests")]),I({},"0.3.35"),J([F("works with sveltekit ^3.0.0"),F("feat: add package.json imports support and module resolution (feat)"),F("feat: add svelte shims: $app/env added, also resolves as $app/environment"),F("move test fixtures to test/.fixtures"),F("chore: update dependencies")]),I({},"0.3.34"),G("has subfunctions now allow either predicate functions OR literal values to be checked"),I({},"0.3.33"),J([F("update dependencies")]),I({},"0.3.32"),J([F("make svelte optional again")]),I({},"0.3.31"),J([F("feat: add deadlock detection system (ddl)"),F("feat: integrate ddl into cache, compile, and import pipeline"),F("feat: integrate ddl into resolve and package export pipeline"),F("feat: add loader init, warmup, and $app resolution"),F("feat: add addEventListener/removeEventListener to globals"),F("fix(svelte): remove console.error from pathUtils"),F("fix: add null guard and directory fallback in pathUtils"),F("fix: update registerLoader usage"),F("fix: remove REGISTERED message from tsLoader"),F("fix: fix tsc and eslint errors")]),I({},"0.3.30"),J([F("fix(svelte): resolve $app imports to shims instead of @sveltejs/kit runtime (fixes ERR_MODULE_NOT_FOUND in tests)"),F("fix(svelte): skip non-default exports from .svelte files in barrel compilation (TypeScript types erased at runtime)"),F("fix(vite): inject $app alias into vite aliases for resolveAlias fallback"),F("style(svelte): use @magic/fs instead of node:fs for consistency"),F("fix(c8): correctly order argv for c8 runs.")]),I({},"0.3.29"),J([F("feat(svelte): extract pathUtils with shared path resolution helpers (resolveFilePath, EXTENSION_CANDIDATES, FALLBACK_CANDIDATES, isSkipPattern)"),F("feat(svelte): extract fileWriter module for compiled file output with source map support"),F("feat(svelte): add resolveNodeModulesRelativeImportsPreprocessor for fixing '..' imports in node_modules"),F("feat(cache): add dedup function for concurrent promise deduplication"),F("refactor(svelte): extract loadViteConfig to shared module, consolidate getViteDefine and loadViteDefine"),F("refactor(svelte): remove resolveViteAlias, consolidate into resolveAlias"),F("refactor(svelte): use visitor pattern in resolveSvelteOnlyExports (traverseExports + ExportVisitor)"),F("refactor(svelte): use pathUtils in resolvePackageExport, fix .mjs resolution"),F("refactor(svelte): update tsLoader to use resolveAlias with includeShims and extractImportsSync"),F("refactor(svelte): use shared helpers across compile modules (getTempFilePath, fileWriter, processImports)"),F("fix(svelte): add includeShims option to resolveAlias for bare imports"),F("fix(vite): vite defines now correctly set in globalThis, by calling JSON.parse during assign.")]),I({},"0.3.28"),J([F("fix: $lib/types.js -> the .js gets removed before appending the correct extension"),F("regression fix: version spec check now correctly errors with expected type again."),F("update dependencies")]),I({},"0.3.27"),J([F("fix: exclude .d.ts files from test discovery (passed .ts filter, caused import failures)"),F("fix: always exclude .d.ts from c8 coverage (user --exclude can no longer remove it)"),F("refactor: restructure c8 exclude logic in t.ts"),F("chore: move changelog from README.md to CHANGELOG.md (650 lines extracted)")]),I({},"0.3.26"),J([F("add customElements to happy-dom globals")]),I({},"0.3.25"),J([F("fix: use @magic/types for more type comparisons"),F("feat: make expect accept an array of typechecks"),F("test: make more files testable by extracting pure functions"),F("update dependencies")]),I({},"0.3.24"),J([F("feat: show total time including test discovery overhead"),F("feat: add progress tracking for test discovery"),F("feat: add DISCOVERY_TIMEOUT env var to control test discovery timeout (default: 30s)"),F("perf: cache getViteDefine results")]),I({},"0.3.23"),J([F("0.3.22 caused tests to fail because viteconfig was not loaded correctly and lead to recursive imports")]),I({},"0.3.22"),J([F("feat: make restoreProperties method public on Isolation class"),F("fix: move BigInt check before other type checks in makeSafeClone"),F("refactor: use pathToFileURL for ESM config imports"),F("refactor: use wrapTest helper consistently in suite"),F("refactor: simplify suiteHasBeforeAllOrAfterAll condition"),F("refactor: extract hasFixedPort helper in isolationChecks"),F("refactor: extract restoreProperties helper"),F("refactor: deduplicate evaluateWorkerResult by re-exporting evaluateTestResult"),F("refactor: use CACHE_DIR constant for test temp files"),F("refactor: use dynamic imports instead of manual config parsing"),F("refactor(http): extract makeRequest helper to deduplicate get/post"),F("refactor(mount): handle Svelte 5 snippets properly"),F("test: fix test type errors for HTMLElement click function"),F("test: update fixtures for improved test harness"),F("update dependencies")]),I({},"0.3.21"),J([F("various build performance improvements, especially for svelte components"),F("add timing traces with MAGIC_TEST_TRACE env var and --trace CLI flag"),F("add promise-based caching via CacheManager"),F("consolidate worker pool into single source"),F("centralize caching in CacheManager at tsLoader level"),F("increase default test timeout to 30s"),F("fixed tsLoader .ts file handling"),F("add more tests for @magic/test itself"),F("implement persistent disk cache in node_modules/.magic-test-cache"),F("parallelize import resolution, barrel exports, and fs.exists checks"),F("cache fs.exists results, processImports results, and resolveViteAlias results"),F("skip writing unchanged files during compilation"),F("consolidate caches into single pendingPromises map"),F("add more tests for @magic/test itself"),F("update dependencies")]),I({},"0.3.20"),J([F("prevent double-compilation of svelte components"),F("update dependencies")]),I({},"0.3.19"),J([F("svelte edge cases"),F("custom test defines for globals")]),I({},"0.3.18"),J([F("better resolution for imported dependencies in tests"),F("especially <script> tags in svelte components that export functions/variables"),F("update dependencies")]),I({},"0.3.17"),J([F("better test discovery, had edge cases where tests were not found")]),I({},"0.3.16"),J([F("better kill handling for workers and child_process"),F("README fixes"),F("remove @systemkollektiv devDependencies, those packages are private for now"),F("update dependencies")]),I({},"0.3.15"),J([F("fix import of .svelte.js/.ts files if js/ts extension is omitted")]),I({},"0.3.14"),J([F("fireEvent function now correctly handles various addEventListener event types")]),I({},"0.3.13"),J([F("update dependencies")]),I({},"0.3.12"),J([F("make svelte optional for consumers"),F("update dependencies")]),I({},"0.3.11"),J([F("performance improvements, better checks if tests need to be isolated"),F("fix timing issues in isolation code"),F("replace regex code checks with ast checks"),F("add `has` functionality for object checks"),F("update dependencies")]),I({},"0.3.10"),J([F("fix more edge cases in svelte compilation steps"),F("add .css import support"),F("update dependencies")]),I({},"0.3.9"),J([F("fix imports of test/index.(mjs|ts|js) files")]),I({},"0.3.8"),J([F("add --workers flag to control max parallel workers (default: auto-detect CPU count)"),F("canvas polyfill works properly in happy-dom environment"),F("svelte: resolve svelte-only package exports"),F("svelte: fix import chain handling for components"),F("version: check if Lib is missing exports"),F("worker isolation: beforeAll and afterAll run in workers directly"),F("before fields in tests get awaited if they return a raw promise")]),I({},"0.3.7"),J([F("advanced worker isolation, executing minimum number of needed workers for tests. lots of internal changes to achieve this.")]),I({},"0.3.6"),G("broken - tried implementing better isolation"),I({},"0.3.5"),J([F("better tsLoader resolve mechanism")]),I({},"0.3.4"),J([F("also run registerLoader in workers")]),I({},"0.3.3"),J([F("replace all import .ts with .js"),F("some test output fixes")]),I({},"0.3.2"),G("broken: some .ts references for worker.ts and unit.ts"),J([F("publish dist dir with .js files for consumers.")]),I({},"0.3.1"),G("broken, dist dir missing"),I({},"0.3.0"),G("broken. node can not strip types in node_modules..."),J([F("added html support (using happy-dom, experimental!)"),F("added svelte support (experimental!)"),F("various improvements to test logic and structure of internal lib"),F("more tests.")]),I({},"0.2.30"),J([F("allow tests to be written using typescript, .ts files can be test files now."),F("add some internal tests"),F("update dependencies")]),I({},"0.2.29"),J([F("tryCatch: pass on empty args"),F("update dependencies")]),I({},"0.2.28"),J([F("use node:module register function for loader, allowing use of the --import flag instead of soon deprecated --loader.")]),I({},"0.2.27"),J([F("allow resolving .js files as .ts files, this mimics typescript .js file resolver"),F("update @types/node")]),I({},"0.2.26"),J([F("update dependencies")]),I({},"0.2.25"),J([F("update dependencies")]),I({},"0.2.24"),J([F("fix @magic/core tests on windows.")]),I({},"0.2.23"),J([F("readd npm run prepublishOnly task"),F("update dependencies")]),I({},"0.2.22"),J([F("add comprehensive typescript types"),F("rework some functionality to be typesafe and typeguarded"),F("update dependencies")]),I({},"0.2.21"),J([F("update dependencies")]),I({},"0.2.20"),J([F("update dependencies")]),I({},"0.2.19"),J([F("update dependencies"),F("add unused http.post. probably should replace http with fetch...")]),I({},"0.2.18"),J([F("add missing fs.statfs, fs.statfsSync and fs.promises.constants to test/spec"),F("update dependencies")]),I({},"0.2.17"),J([F("remove calls and coveralls-next, c8 takes care of coverage."),F("update dependencies")]),I({},"0.2.16"),J([F("update dependencies")]),I({},"0.2.15"),J([F("update dependencies"),F("percentage outputs print nicer numbers"),F("added http export that allows http requests in tests. only supports get requests for now.")]),I({},"0.2.14"),J([F("update dependencies")]),I({},"0.2.13"),J([F("update dependencies")]),I({},"0.2.12"),J([F("update dependencies")]),I({},"0.2.11"),J([F("update dependencies")]),I({},"0.2.10"),J([F("@magic/test can now test @magic/core again")]),I({},"0.2.9"),J([F("update dependencies")]),I({},"0.2.8"),J([F("update dependencies")]),I({},"0.2.7"),J([F("update dependencies"),F("replace coveralls with coveralls-next")]),I({},"0.2.6"),J([F("update dependencies")]),I({},"0.2.5"),J([F("update dependencies"),F("@magic/core is a dev dependency now.")]),I({},"0.2.4"),J([F("lib/version: spec can have objects defined with ['obj', false], which will test the parent to be an object, but does not test the key/value pairs in the object."),F("maybeInjectMagic: made magic injection more robust and much faster if magic is not being used."),F("t -p now does not show the coverage information")]),I({},"0.2.3"),J([F("update dependencies")]),I({},"0.2.2"),J([F("spec values can be functions, allowing arbitrary equality testing to be executed by @magic/test.version")]),I({},"0.2.1"),J([F("internal restructuring"),F("tests now output their run duration"),F("add @magic/error dependency and export it from index"),F("index.js files have the same functionality as index.js files"),F("update dependencies")]),I({},"0.2.0"),J([F("update dependencies"),F("version now tests spec and lib in a single run.")]),I({},"0.1.77"),J([F("update dependencies")]),I({},"0.1.76"),J([F("update dependencies")]),I({},"0.1.75"),J([F("update dependencies")]),I({},"0.1.74"),J([F("update dependencies")]),I({},"0.1.73"),J([F("update dependencies")]),I({},"0.1.72"),J([F("update @magic/types and intermediate deps to avoid circular dependency")]),I({},"0.1.71"),J([F("update dependencies")]),I({},"0.1.70"),J([F("update dependencies")]),I({},"0.1.69"),J([F("import of magic config should work on windows")]),I({},"0.1.68"),J([F("update @magic/core to fix tests if magic.js does not exist")]),I({},"0.1.67"),J([F("silence errors if magic.js does not exist")]),I({},"0.1.66"),J([F("better handling if magic is not in use")]),I({},"0.1.65"),J([F("update dependencies"),F("testing of @magic-modules is now built in."),F('if @magic/core is installed, the tests will "just work" and return html for @magic-modules')]),I({},"0.1.64"),J([F("update dependencies (@magic/fs)")]),I({},"0.1.63"),J([F("update dependencies (c8)")]),I({},"0.1.62"),J([F("add html flag to tests, now @magic-modules can be tested \\o/"),F("update dependencies")]),I({},"0.1.61"),J([F("update dependencies")]),I({},"0.1.60"),J([F("bump required node version to 14.15.4"),F("update dependencies")]),I({},"0.1.59"),J([F("update dependencies")]),I({},"0.1.58"),J([F("update dependencies")]),I({},"0.1.57"),J([F("update dependencies")]),I({},"0.1.56"),J([F("update dependencies")]),I({},"0.1.55"),J([F("update dependencies")]),I({},"0.1.54"),J([F("update dependencies")]),I({},"0.1.53"),J([F("update dependencies")]),I({},"0.1.52"),J([F("update dependencies"),F("remove hyperapp from exports.")]),I({},"0.1.51"),J([F("update dependencies")]),I({},"0.1.50"),J([F("remove @magic/css export"),F("update c8")]),I({},"0.1.49"),J([F("update @magic/css")]),I({},"0.1.48"),J([F("bump required node version to 14.2.0"),F("update dependencies")]),I({},"0.1.47"),J([F("update c8, yargs-parser")]),I({},"0.1.46"),J([F("update @magic/css")]),I({},"0.1.45"),J([F("security fix: update dependencies, yargs-parser.")]),I({},"0.1.44"),J([F("update dependencies")]),I({},"0.1.43"),J([F("update dependencies")]),I({},"0.1.42"),J([F("update dependencies")]),I({},"0.1.41"),J([F("update dependencies")]),I({},"0.1.40"),J([F("update dependencies")]),I({},"0.1.39"),J([F("update coveralls, fix minimist issue above.")]),I({},"0.1.38"),J([F("update dependencies, minimist sec issue.")]),I({},"0.1.37"),J([F("fix: arguments for both node and c8 tests work. broken in 0.1.36")]),I({},"0.1.36"),J([F("c8: --exclude, --include and --all get applied correctly.")]),I({},"0.1.35"),J([F("fix: c8 errored if coverage dir did not exist"),F("update dependencies")]),I({},"0.1.34"),J([F('fix: c8 needs "report" command now')]),I({},"0.1.33"),J([F("update exported dependencies")]),I({},"0.1.32"),J([F("tests now work on windows \\o/"),F("uncaught errors will cause tests to fail with process.exit(1)")]),I({},"0.1.31"),J([F("update dependencies")]),I({},"0.1.30"),J([F("export @magic/fs")]),I({},"0.1.29"),J([F("help text can show up when --help is used")]),I({},"0.1.28"),J([F("package: engineStrict: true"),F("update cli: missing @magic/cases dependency")]),I({},"0.1.27"),J([F("remove prettier from deps")]),I({},"0.1.26"),J([F("remove commonjs support. node 13+ required. awesome.")]),I({},"0.1.25"),J([F("currying now throws errors instead of returning them."),F("update @magic/css"),F("update @magic/types which now uses @magic/deep for is.deep.eq and is.deep.diff")]),I({},"0.1.24"),J([F("update @magic/css"),F("update c8")]),I({},"0.1.23"),J([F("update @magic dependencies to use npm packages instead of github")]),I({},"0.1.22"),J([F("update dependencies")]),I({},"0.1.21"),J([F("update @magic/cli to allow default args")]),I({},"0.1.20"),J([F("update broken dependencies")]),I({},"0.1.19"),J([F("update dependencies")]),I({},"0.1.18"),J([F("update dependencies"),F("require node 12.13.0")]),I({},"0.1.17"),J([F("add node 13 json support for coverage reports.")]),I({},"0.1.16"),J([F("update @magic/cli for node 13 support.")]),I({},"0.1.15"),J([F("update dependencies")]),I({},"0.1.14"),J([F("windows support now supports index.js files that provide test structure")]),I({},"0.1.13"),J([F("windows support is back")]),I({},"0.1.12"),J([F("update dependencies")]),I({},"0.1.11"),J([F("update prettier, coveralls"),F("add and export @magic/css to test css validity")]),I({},"0.1.10"),J([F("node 12.4.0 does not use --experimental-json-modules flag. removed it in 12.4+.")]),I({},"0.1.9"),J([F("test/beforeAll.js gets loaded separately if it exists and executed before all tests"),F("test/afterAll.js gets loaded separately if it exists and executed after all tests"),F("if the function exported from test/beforeAll.js returns another function, this returned function will also be executed after all tests"),F("export hyperapp beta 18")]),I({},"0.1.8"),J([F("update @magic/cli")]),I({},"0.1.7"),J([F("readded calls npm run script"),F("updated c8")]),I({},"0.1.6"),J([F("update this readme and html docs."),F("tests should always process.exit(1) if they errored.")]),I({},"0.1.5"),J([F("use ecmascript version of @magic/deep")]),I({},"0.1.4"),J([F("npm run scripts of @magic/test itself can be run on windows.")]),I({},"0.1.3"),J([F("cli now works everywhere")]),I({},"0.1.2"),J([F("cli now works on windows again (actually, this version is broken on all platforms.)")]),I({},"0.1.1"),J([F("rework of bin scripts and update dependencies to esmodules")]),I({},"0.1.0"),J([F("use esmodules instead of commonjs.")])],"/test/cli/":()=>[O({id:"cli"},"CLI & Usage"),I({id:"cli-packagejson"},"package.json (recommended)"),G("Add the magic/test bin scripts to package.json:"),Q(`
{
  "scripts": {
    "test": "t -p",
    "coverage": "t",
  },
  "devDependencies": {
    "@magic/test": "github:magic/test"
  }
}
`),G("Then use the npm run scripts:"),Q(`
npm test
npm run coverage
`),I({id:"cli-global"},"Globally (not recommended)"),G(["You can install this library globally,"," but adding the dependency and scripts to package.json is better."]),G(["everyone sees the dependency,"," and your shell stays free of clutter."]),Q(`
npm i -g @magic/test

// run tests in production mode
t -p

// run tests and get coverage in verbose mode
t
`),I({id:"cli-flags"},"CLI Flags"),G("Available command-line flags:"),J([F("-p, --production, --prod - Run tests without coverage (faster)"),F("-l, --verbose, --loud - Show detailed output including passing tests"),F("-i, --include - Files to include in coverage"),F("-e, --exclude - Files to exclude from coverage"),F("--shards N - Total number of shards to split tests across"),F("--shard-id N - Shard ID (0-indexed) to run"),F("-w, --workers N - Max parallel workers (default: auto)"),F("-s, --slow, --timing - Show the slowest tests"),F("--nice N - CPU nice value for the test process (default 10, 0 disables)"),F("--native - Use the native node --test runner (with coverage)"),F("--help - Show help text")]),G(["Use --shards and --shard-id together."," --shard-id is 0-indexed (0 to N-1)."]),I({id:"sharding"},"Sharding Tests"),G("Run tests in parallel across multiple processes to speed up large test suites:"),Q(`
# Run 4 shards, this is shard 0 (of 0-3)
t --shards 4 --shard-id 0

# Run shard 1
t --shards 4 --shard-id 1

# Combine with other flags
t -p --shards 4 --shard-id 2
`),G(["Tests are distributed with a hash of the test file path:"," same file, same shard, every run."]),G("Add to your package.json for CI/CD:"),Q(`
{
  "scripts": {
    "test": "t -p",
    "test:shard:0": "t -p --shards 4 --shard-id 0",
    "test:shard:1": "t -p --shards 4 --shard-id 1",
    "test:shard:2": "t -p --shards 4 --shard-id 2",
    "test:shard:3": "t -p --shards 4 --shard-id 3"
  }
}
`),G("Or use a single command to run all shards in parallel:"),Q(`
# Run all 4 shards in parallel and wait for all to complete
npm run test:shard:0 & npm run test:shard:1 & npm run test:shard:2 & npm run test:shard:3 & wait
`),I({id:"exit-codes"},"Exit Codes"),G("exit codes:"),G("| Exit Code | Meaning |"),G("| --------- | ------- |"),G("| 0 | All tests passed |"),G("| 1 | One or more tests failed |"),Q(`
# Run tests and check exit code
npm test
echo "Exit code: $?"  # 0 = success, 1 = failure
`),I({id:"verbose-output"},"Verbose Output"),G("The -l (or --verbose, --loud) flag enables detailed output:"),Q(`
# Shows all tests including passing ones
t -l
`),G("What verbose mode shows:"),J([F("All test results (not just failures)"),F("Individual test execution time"),F("Full test names with suite hierarchy"),F("Detailed error messages with stack traces")]),G("Default mode (without -l):"),J([F("Only shows failing tests"),F("Shows summary only for passing suites"),F("Faster output for large test suites")]),G("Example output without -l:"),Q(`
### Testing package: my-lib
/addition.js => Pass: 3/3 100%
/multiplication.js => Pass: 4/4 100%
Ran 7 tests in 12ms. Passed 7/7 100%
`),G("Example output with -l:"),Q(`
### Testing package: my-lib
* pass: got 3 expected 3
* pass: got "hello" expected "hello"
--- /addition.js, Pass: 3/3 100% 2ms
/addition.js => Pass: 3/3 100%
--- /multiplication.js, Pass: 4/4 100% 3ms
/multiplication.js => Pass: 4/4 100%
Ran 7 tests in 12ms. Passed 7/7 100%
`),I({},".d.ts type tests"),G(["every run also type-checks the .d.ts files of your project (the __dts__ suites in the output)."," They read types from the tsconfig.json of the tested repository."," -e / --exclude applies to them too, and MAGIC_TEST_SKIP_DTS_TESTS=1 skips them."]),I({id:"performance-tips"},"Performance Tips"),G(["see the ",X({to:"/cli/performance-tips/"},"Performance Tips")," page."]),N({},"Quick Reference"),Q(`
# Fast mode - no coverage
t -p

# Shard across 4 processes
t --shards 4 --shard-id 0
`),I({id:"common-pitfalls"},"Common Pitfalls"),G(["see the ",X({to:"/cli/common-pitfalls/"},"Common Pitfalls")," page."]),N({},"Quick Reference"),G("Avoid these common mistakes:"),J([F("Forgetting to return in async tests"),F("Not wrapping callback functions"),F("Mutating shared state between tests"),F("Using the wrong equality check"),F("Not awaiting async operations"),F("Incorrect hook usage")])],"/test/cli/common-pitfalls/":()=>[O({id:"common-pitfalls"},"Common Pitfalls"),G("Avoid these common mistakes when writing tests:"),I({},"1. Forgetting to Return in Async Tests"),G(["The test finishes before the promise resolves. Always return the promise:"]),Q(`
# Wrong: promise resolves before test checks result
export default {
  fn: async () => {
    const result = await someAsyncFunction()
    // missing return!
  },
  expect: true,
}

# Correct:
export default {
  fn: async () => {
    return await someAsyncFunction()
  },
  expect: true,
}
`),I({},"2. Not Wrapping Callback Functions"),Q(`
# Wrong: function gets called immediately
export default {
  fn: doSomething(),  // executes immediately!
  expect: true,
}

# Correct: wrap in function to defer execution
export default {
  fn: () => doSomething(),
  expect: true,
}
`),I({},"3. Mutating Shared State Between Tests"),Q(`
# Wrong: counter persists between tests
let counter = 0
export default [
  { fn: () => ++counter, expect: 1 },
  { fn: () => ++counter, expect: 1 }, // fails! counter is now 2
]

# Correct: use beforeEach to reset state
export default {
  beforeEach: () => { counter = 0 },
  tests: [
    { fn: () => ++counter, expect: 1 },
    { fn: () => ++counter, expect: 1 }, // passes - reset before each
  ],
}
`),I({},"4. Using the Wrong Equality Check"),Q(`
# Wrong: checks reference equality
export default {
  fn: () => [1, 2, 3],
  expect: [1, 2, 3], // fails! different arrays
}

# Correct: use @magic/types for deep comparison
import { is } from '@magic/test'
export default {
  fn: () => [1, 2, 3],
  expect: is.deep.equal([1, 2, 3]),
}
`),I({},"5. Not Awaiting Async Operations"),Q(`
# Wrong: test finishes before promise resolves
export default {
  fn: () => {
    setTimeout(() => {
      // This never gets checked!
    }, 100)
  },
  expect: true,
}

# Correct: return the promise
export default {
  fn: () => new Promise(resolve => {
    setTimeout(() => resolve(true), 100)
  }),
  expect: true,
}

# Or use the promise helper:
import { promise } from '@magic/test'
export default {
  fn: promise(cb => setTimeout(() => cb(null, true), 100)),
  expect: true,
}
`),I({},"6. Incorrect Hook Usage"),Q(`
# Wrong: before/after hooks on individual tests, not suites
export default [
  {
    fn: () => true,
    beforeAll: () => {}, // wrong! beforeAll is for suites
    afterAll: () => {},
    expect: true,
  },
]

# Correct: hooks at suite level
export default {
  beforeAll: () => {},
  afterAll: () => {},
  tests: [
    { fn: () => true, expect: true },
  ],
}
`)],"/test/cli/flags/":()=>[O({id:"cli-flags-reference"},"CLI Flags Reference"),G("Available command-line flags for @magic/test:"),I({},"Flag Reference Table"),Q('| Flag | Aliases | Default | Env Var | Description | Example |\n| :--- | :----- | :-----: | :------ | :---------- | :------ |\n| -p, --production, --prod |  |  |  | Run tests without coverage (faster) | t -p |\n| -l, --verbose, --loud |  |  |  | Show detailed output including passing tests | t -l |\n| -i, --include |  |  |  | Files to include in coverage | t -i "src/*.js" |\n| -e, --exclude |  |  |  | Files to exclude from coverage and .d.ts type tests | t -e "src/test.js" |\n| --shards N |  |  |  | Total number of shards to split tests across | t --shards 4 --shard-id 0 |\n| --shard-id N |  |  |  | Shard ID (0-indexed) to run | t --shards 4 --shard-id 2 |\n| -s, --slow, --timing |  |  | MAGIC_TEST_TIMING | Show the slowest tests | t -s |\n| --error-length N |  | 70 | MAGIC_TEST_ERROR_LENGTH | Max length for error strings (0 = no limit) | t --error-length 0 |\n| --timeout N | -t, --to | 30000 | MAGIC_TEST_TIMEOUT | Test timeout in ms | t --timeout 60000 |\n| -w, --workers N |  | auto | MAGIC_TEST_WORKERS | Max parallel workers (auto: capped at 4, load-adaptive) | t -p --workers 2 |\n| --nice N |  | 10 | MAGIC_TEST_NICE | CPU nice value 0-19 for the test process (0 disables) | t --nice 5 |\n| --native |  |  |  | Run with the native node --test runner (with coverage) | t --native |\n| --help |  |  |  | Show help text | t --help |'),I({},"Flag Notes"),J([F("--shards and --shard-id must be used together"),F("--shard-id is 0-indexed (0 to N-1)"),F("Use -p flag for faster development runs (no coverage)"),F("--workers controls parallel test execution")]),I({},"Example Usage"),N({},"Basic Test Run"),Q(`
npm run coverage  # runs with coverage

npm test  # t -p, no coverage (faster)
`),N({},"Shard Large Test Suite"),Q(`
# Run 4 shards, this is shard 0 (of 0-3)
t --shards 4 --shard-id 0

# Run shard 1
t --shards 4 --shard-id 1

# Combine with other flags
t -p --shards 4 --shard-id 2 --workers 2
`),I({},"See Also"),J([F([X({to:"/cli/"},"CLI & Usage")," - detailed usage guide"]),F([X({to:"/cli/performance-tips/"},"Performance Tips")," - optimization techniques"]),F([X({to:"/cli/sharding-cheatsheet/"},"CLI Sharding Cheat-Sheet")," - CI/CD examples"])])],"/test/cli/performance-tips/":()=>[O({id:"performance-tips"},"Performance Tips"),G("make runs faster:"),I({},"Use the -p Flag"),G(["Run tests in production mode to skip coverage and get faster output:"]),Q(`
# fast mode - no coverage, only shows failures
t -p
# or via the recommended npm script
npm test
`),I({},"Shard Large Test Suites"),G(["Split tests across multiple processes to speed up large suites:"]),Q(`
# Split tests across 4 processes
t --shards 4 --shard-id 0
`),G(["tests are distributed with a hash of the file path — same file, same shard."]),I({},"Minimize Async Overhead"),G(["Async tests are slower than sync tests. Use sync where possible:"]),Q(`
# Slower: unnecessary async
export default {
  fn: async () => true,
  expect: true,
}

# Faster: sync test
export default {
  fn: () => true,
  expect: true,
}
`),I({},"Use Local State Instead of Globals"),G(["Global state requires isolation overhead. Local state is naturally isolated:"]),Q(`
# Slower: global state requires isolation
export const __isolate = true

# Faster: local state is naturally isolated
export default [
  {
    fn: () => {
      const counter = 0
      return ++counter
    },
    expect: 1,
  },
]
`),I({},"Batch Related Tests"),G(["Single suite with multiple tests is faster than multiple suites:"]),Q(`
# Faster: single suite with multiple tests
export default [
  { fn: () => add(1, 2), expect: 3 },
  { fn: () => add(0, 0), expect: 0 },
  { fn: () => add(-1, 1), expect: 0 },
]
`),I({},"Worker Concurrency"),G(["Control max parallel workers with the"," --workers ","flag. Default is auto-detect CPU count:"]),G(["Control max parallel workers with the"," --workers ","flag. The auto default spawns max(1, min(CPUs - 2, 4)) workers,"," and throttles itself on a busy machine (MAGIC_TEST_ADAPTIVE=0 or CI disables it):"]),Q(`
# use 2 workers
t -p --workers 2
`),I({},"Be nice"),G(["on a busy machine the run is wrapped in nice (default 10)"," so your own work stays responsive. --nice 0 disables it:"]),Q(`
t --nice 5
t --nice 0
`),I({},"Compile cache"),G(["svelte and ts compilation is cached persistently between runs."," Set MAGIC_TEST_COMPILE_CACHE=0 to restore the old always-recompile behavior:"]),Q(`
MAGIC_TEST_COMPILE_CACHE=0 t -p
`),G(["see ",X({to:"/cli/"},"CLI & Usage")," for the full flag reference."])],"/test/cli/sharding-cheatsheet/":()=>[O({id:"cli/sharding-cheatsheet"},"CLI Sharding Cheat-Sheet"),G("Run tests in parallel across multiple processes to speed up large test suites:"),I({},"Basic Sharding Commands"),Q(`
# Run 4 shards, this is shard 0 (of 0-3)
t --shards 4 --shard-id 0

# Run shard 1
t --shards 4 --shard-id 1

# Run shard 2
t --shards 4 --shard-id 2

# Run shard 3
t --shards 4 --shard-id 3
`),G(["Tests are distributed deterministically using a hash of the test file path,"," ensuring each test always runs in the same shard."]),I({},"Combine with Other Flags"),Q(`
# Run with production mode (no coverage)
t -p --shards 4 --shard-id 2

# Add verbose output
t -l --shards 4 --shard-id 1

# Custom worker count
t --shards 4 --shard-id 0 --workers 2
`),I({},"Package.json for CI/CD"),G("Add these scripts to your package.json:"),Q(`
{
  "scripts": {
    "test": "t -p",
    "test:shard:0": "t -p --shards 4 --shard-id 0",
    "test:shard:1": "t -p --shards 4 --shard-id 1",
    "test:shard:2": "t -p --shards 4 --shard-id 2",
    "test:shard:3": "t -p --shards 4 --shard-id 3"
  }
}
`),I({},"Run All Shards in Parallel"),G("One command to run all shards in parallel (the scripts already run with -p):"),Q(`
# run all 4 shards in parallel and wait for all to complete
npm run test:shard:0 & npm run test:shard:1 & npm run test:shard:2 & npm run test:shard:3 & wait
`),I({},"Deterministic Distribution"),G(["distribution is deterministic: same file, same shard, every run."," CI runs stay consistent."]),I({},"See Also"),J([F([X({to:"/cli/"},"CLI & Usage")," - full CLI documentation"]),F([X({to:"/cli/flags/"},"CLI Flags Reference")," - detailed flag list"]),F([X({to:"/cli/performance-tips/"},"Performance Tips")," - optimization techniques"])])],"/test/error-codes-quicklook/":()=>[O({id:"error-codes-quicklook"},"Error Codes Quick Look"),G("quick reference for @magic/test error codes — all imported from @magic/test:"),Q(`
import { ERRORS, createError } from '@magic/test'
`),I({},"Error Codes Reference Table"),Q('| Code | Description | Example Usage |\n| :--- | :---------- | :------------ |\n| ERRORS.E_EMPTY_SUITE | Test suite is not exporting any tests | createError(ERRORS.E_EMPTY_SUITE, "Empty test suite") |\n| ERRORS.E_RUN_SUITE_UNKNOWN | Unknown error occurred while running a suite | createError(ERRORS.E_RUN_SUITE_UNKNOWN, "Unexpected execution error") |\n| ERRORS.E_TEST_NO_FN | Test object is missing the `fn` property | createError(ERRORS.E_TEST_NO_FN, "Missing test function") |\n| ERRORS.E_TEST_EXPECT | Test expectation failed | createError(ERRORS.E_TEST_EXPECT, "Expected value does not match") |\n| ERRORS.E_TEST_BEFORE | Before hook failed | createError(ERRORS.E_TEST_BEFORE, "Setup hook threw error") |\n| ERRORS.E_TEST_BEFORE_EACH | BeforeEach hook failed (suite) | createError(ERRORS.E_TEST_BEFORE_EACH, "BeforeEach hook failed") |\n| ERRORS.E_TEST_AFTER | After hook failed | createError(ERRORS.E_TEST_AFTER, "Cleanup hook threw error") |\n| ERRORS.E_TEST_AFTER_EACH | AfterEach hook failed (suite) | createError(ERRORS.E_TEST_AFTER_EACH, "AfterEach hook failed") |\n| ERRORS.E_TEST_FN | Test function threw an error | createError(ERRORS.E_TEST_FN, "Test function crashed") |\n| ERRORS.E_NO_TESTS | No test suites found | createError(ERRORS.E_NO_TESTS, "No test files discovered") |\n| ERRORS.E_IMPORT | Failed to import a test file | createError(ERRORS.E_IMPORT, "Cannot resolve test file path") |\n| ERRORS.E_MAGIC_TEST | General test execution error | createError(ERRORS.E_MAGIC_TEST, "Internal test runner error") |'),I({},"Usage Example"),G("make your own errors with a code:"),Q(`
import { createError, ERRORS } from '@magic/test'

export default [
  {
    fn: () => createError(ERRORS.E_TEST_NO_FN, 'Missing fn property'),
    expect: e => e.code === 'E_TEST_NO_FN' && e.message === 'Missing fn property',
    info: 'createError creates errors with code and message',
  },
]
`),I({},"Error Object Properties"),J([F('code - The error code string (e.g., "E_TEST_NO_FN")'),F("message - Human-readable error message"),F("stack - Stack trace for debugging")]),G(["See also: ",X({to:"/error-codes/"},"Full Error Codes Reference")])],"/test/error-codes/":()=>[O({id:"error-codes"},"Error Codes"),G(["@magic/test uses error codes to help with debugging and programmatic error handling."," You can import these constants from @magic/test:"]),Q(`
import { ERRORS, createError } from '@magic/test'
`),I({},"Available Error Codes"),G("| Code | Description |"),G("| ---- | ----------- |"),G("| ERRORS.E_EMPTY_SUITE | Test suite is not exporting any tests |"),G("| ERRORS.E_RUN_SUITE_UNKNOWN | Unknown error occurred while running a suite |"),G("| ERRORS.E_TEST_NO_FN | Test object is missing the fn property |"),G("| ERRORS.E_TEST_EXPECT | Test expectation failed |"),G("| ERRORS.E_TEST_BEFORE | Before hook failed |"),G("| ERRORS.E_TEST_BEFORE_EACH | BeforeEach hook failed (suite) |"),G("| ERRORS.E_TEST_AFTER | After hook failed |"),G("| ERRORS.E_TEST_AFTER_EACH | AfterEach hook failed (suite) |"),G("| ERRORS.E_TEST_FN | Test function threw an error |"),G("| ERRORS.E_NO_TESTS | No test suites found |"),G("| ERRORS.E_IMPORT | Failed to import a test file |"),G("| ERRORS.E_MAGIC_TEST | General test execution error |"),I({},"createError"),G("make your own errors with a code:"),Q(`
import { createError, ERRORS } from '@magic/test'

export default [
  {
    fn: () => createError(ERRORS.E_TEST_NO_FN, 'Missing fn property'),
    expect: e => e.code === 'E_TEST_NO_FN' && e.message === 'Missing fn property',
    info: 'createError creates errors with code and message',
  },
]
`),I({},"Usage Example"),Q(`
try {
  // run tests
} catch (e) {
  if (e.code === ERRORS.E_TEST_NO_FN) {
    console.error('Test is missing fn property:', e.message)
  } else if (e.code === ERRORS.E_TEST_FN) {
    console.error('Test function threw an error:', e.message)
  } else if (e.code === ERRORS.E_IMPORT) {
    console.error('Failed to import test file:', e.message)
  }
}
`),I({},"Error Object Properties"),J([F('code - The error code string (e.g., "E_TEST_NO_FN")'),F("message - Human-readable error message"),F("stack - Stack trace for debugging")])],"/test/getting-started/":()=>[O({id:"getting-started"},"Getting Started"),G("Be in a nodejs project."),I({},"Install"),Q({lines:"false"},"npm i --save-dev --save-exact @magic/test"),I({},"Create a Test File"),G(["Create a test file in the ","test/"," directory. The filename is used in test output, and the path should mirror your source structure:"]),Q(`
// test/yourFileToTest.js
export default [
  { fn: () => true, expect: true, info: 'true is true' },
  { fn: () => 1 + 1, expect: 2, info: 'basic math' },
]
`),G(["heads up: the test function gets called automatically, ","expect: true ","is optional."]),I({},"Add npm Scripts"),G("Add test scripts to your package.json:"),Q(`
{
  "scripts": {
    "test": "t -p",
    "coverage": "t"
  }
}
`),G(["t -p ","runs tests in production mode (no coverage, faster). ","t"," runs with coverage."]),I({},"Run Tests"),Q(`
npm test
`),I({},"Example Output"),Q(`
### Testing package: @magic/test
Ran 2 tests in 3ms. Passed 2/2 100%
`),G("Faster output from a bigger project:"),Q(`
### Testing package: @artificialmuseum/engine
Ran 90307 tests in 274.5ms. Passed 90307/90307 100%
`),I({id:"next-steps"},"Next Steps"),J([F([X({to:"/writing-tests/"},"Writing Tests")," - hooks, promises, types, multiple tests"]),F([X({to:"/lib/"},"Utility Functions")," - deep, fs, curry, log, vals, env, http, mock, has"]),F([X({to:"/svelte/"},"Svelte Testing")," - mount components, interact, assert"]),F([X({to:"/cli/"},"CLI & Usage")," - flags, sharding, performance tips"]),F([X({to:"/test-isolation/"},"Test Isolation")," - prevent state leakage between tests"]),F([X({to:"/error-codes/"},"Error Codes")," - programmatic error handling"])])],"/test/lib/":()=>[O({id:"lib"},"Utility Belt"),G(["@magic/test exports some utility functions"," that make complex test workflows easier."]),I({id:"lib-deep"},"deep"),G(["Exported from ",X({to:"https://github.com/magic/deep",text:"@magic/deep"}),", deep equality and comparison utilities."]),Q(`
import { deep, is } from '@magic/test'

export default [
  {
    fn: () => ({ a: 1, b: 2 }),
    expect: deep.equal({ a: 1, b: 2 }),
    info: 'deep equals comparison',
  },
  {
    fn: () => ({ a: 1 }),
    expect: deep.different({ a: 2 }),
    info: 'deep different comparison',
  },
  {
    fn: () => ({ a: { b: 1 } }),
    expect: deep.equal({ a: { b: 1 } }),
    info: 'nested deep equality',
  },
]
`),G("Available functions:"),J([F("deep.equal(a, b) - deep equality check"),F("deep.different(a, b) - deep difference check"),F("deep.contains(container, item) - deep inclusion check"),F("deep.changes(a, b) - get differences between objects")]),I({id:"lib-fs"},"fs"),G(["Exported from ",X({to:"https://github.com/magic/fs",text:"@magic/fs"}),", file system utilities."]),Q(`
import { fs } from '@magic/test'

export default [
  {
    fn: async () => {
      const content = await fs.readFile('./package.json', 'utf-8')
      return content.includes('name')
    },
    expect: true,
    info: 'read file content',
  },
]
`),G("Common methods:"),J([F("fs.readFile(path, encoding) - read file content"),F("fs.writeFile(path, data) - write file content"),F("fs.exists(path) - check if file exists"),F("fs.mkdir(path, options) - create directory"),F("fs.rmdir(path) - remove directory"),F("fs.stat(path) - get file stats"),F("fs.readdir(path) - read directory contents"),F("Plus async versions in fs.promises")]),I({id:"lib-curry"},"curry"),G(["splits a function's arguments into nested functions,"," handy for shimming functions with lots of arguments."]),Q(`
import { curry } from '@magic/test'

const compare = (a, b) => a === b
const curried = curry(compare)
const shimmed = curried('shimmed_value')

export default {
  fn: shimmed('shimmed_value'),
  expect: true,
  info: 'expect will be called with a and b and a will equal b',
}
`),I({id:"lib-log"},"log"),G("log to test output, colors included."),Q(`
import { log } from '@magic/test'

log.debug('Debug info')
log.info('Something happened')
log.warn('Heads up')
log.error('Something went wrong')
log.critical('Game over')
`),G("Supports multiple arguments:"),Q(`
log.info('Testing', library, 'at version', version)
`),I({id:"lib-vals"},"vals"),G(["JavaScript type constants for testing against any value."," Handy for fuzzing and property-based testing."]),Q(`
import { vals, is } from '@magic/test'

export default [
  { fn: () => 'test', expect: is.string, info: 'test if value is a string' },
  { fn: () => vals.true, expect: true, info: 'boolean true value' },
  { fn: () => vals.email, expect: is.email, info: 'valid email format' },
  { fn: () => vals.error, expect: is.error, info: 'error instance' },
]
`),G("Available Constants:"),J([F("Primitives: true, false, number, num, float, int, string, str"),F("Empty values: nil, emptystr, emptyobject, emptyarray, undef"),F("Collections: array, object, obj"),F("Time: date, time"),F("Errors: error, err"),F("Colors: rgb, rgba, hex3, hex6, hexa4, hexa8"),F("Other: func, truthy, falsy, email, regexp")]),I({id:"lib-env"},"env"),G("check the environment, branch your tests on it."),G("Available utilities:"),J([F("isNodeProd - checks if NODE_ENV is set to production"),F("isNodeDev - checks if NODE_ENV is set to development"),F("isProd - checks if -p flag is passed to the CLI"),F("isVerbose - checks if -l flag is passed to the CLI"),F("getErrorLength - returns error length limit from MAGIC_TEST_ERROR_LENGTH env var (0 = unlimited)")]),Q(`
import { env, isProd, isTest, isDev } from '@magic/test'

export default [
  {
    fn: env.isNodeProd,
    expect: process.env.NODE_ENV === 'production',
    info: 'checks if NODE_ENV is production',
  },
  {
    fn: env.isNodeDev,
    expect: process.env.NODE_ENV === 'development',
    info: 'checks if NODE_ENV is development',
  },
  {
    fn: env.isProd,
    expect: process.argv.includes('-p'),
    info: 'checks if -p flag is passed',
  },
  {
    fn: env.isVerbose,
    expect: process.argv.includes('-l'),
    info: 'checks if -l flag is passed',
  },
  {
    fn: env.getErrorLength,
    expect: undefined,
    info: 'get error length limit (undefined until set)',
  },
]
`),I({id:"lib-env-vars"},"Env vars"),G("environment variables read by @magic/test:"),J([F("MAGIC_TEST_WORKERS — max parallel workers (same as --workers)"),F("MAGIC_TEST_VERBOSE — 1 = verbose output (same as -l)"),F("MAGIC_TEST_ERROR_LENGTH — error string limit, 0 = unlimited (same as --error-length)"),F("MAGIC_TEST_TIMEOUT — per-test timeout in ms (same as --timeout)"),F("MAGIC_TEST_DISCOVERY_TIMEOUT — per-file discovery/import budget in ms"),F("MAGIC_TEST_WORKER_TIMEOUT_MS — worker round-trip backstop in ms"),F("MAGIC_TEST_NICE — CPU nice value 0-19 (same as --nice)"),F("MAGIC_TEST_ADAPTIVE — 0 = disable load-adaptive worker throttling (also off on CI)"),F("MAGIC_TEST_WORKER_REUSE — 0 = one fresh worker per test"),F("MAGIC_TEST_COMPILE_CACHE — 0 = disable the persistent svelte/ts compile cache"),F("MAGIC_TEST_SKIP_DTS_TESTS — 1 = skip the auto-generated .d.ts type tests"),F("MAGIC_TEST_PREWARM — 0 = skip the pre-run component-graph prewarm"),F("MAGIC_TEST_PREWARM_WORKERS — prewarm thread count (default 4)"),F("MAGIC_TEST_HTTP_REJECT_UNAUTHORIZED — false/0 = accept self-signed certificates"),F("MAGIC_TEST_VERBOSE_ERRORS — 1 = verbose error output")]),N({id:"lib-env-constants"},"Environment Constants"),G("These boolean constants reflect the current NODE_ENV:"),Q(`
import { isProd, isTest, isDev } from '@magic/test'

export default [
  { fn: isProd, expect: process.env.NODE_ENV === 'production' },
  { fn: isTest, expect: process.env.NODE_ENV === 'test' },
  { fn: isDev, expect: process.env.NODE_ENV === 'development' },
]
`),I({id:"lib-promises"},"promises"),G(["wrap node callbacks and promises, try/catch handled for you."," resolves to the value, rejects with the error."]),Q(`
import { promise, is } from '@magic/test'

export default [
  {
    fn: promise(cb => setTimeout(() => cb(null, true), 200)),
    expect: true,
    info: 'handle promises in a nice way',
  },
  {
    fn: promise(cb => setTimeout(() => cb(new Error('error'), 200)),
    expect: is.error,
    info: 'handle promise errors in a nice way',
  },
]
`),I({id:"lib-http"},"http"),G("http/https requests from tests."),Q(`
import { http } from '@magic/test'

export default [
  {
    fn: http.get('https://api.example.com/data'),
    expect: { success: true },
    info: 'fetches data from API',
  },
  {
    fn: http.post('https://api.example.com/users', { name: 'John' }),
    expect: { id: 1, name: 'John' },
    info: 'creates a new user',
  },
  {
    fn: http.post('http://localhost:3000/data', 'raw string'),
    expect: 'raw string',
    info: 'posts raw string data',
  },
]
`),G("Error Handling:"),Q(`
import { http, is } from '@magic/test'

export default [
  {
    fn: http.get('https://invalid-domain-that-does-not-exist.com'),
    expect: is.error,
    info: 'rejects on network error',
  },
  {
    fn: http.get('https://api.example.com/nonexistent'),
    expect: res => res.status === 404,
    info: 'handles 404 responses',
  },
]
`),G("http handles for you:"),J([F("Protocol detection (HTTP vs HTTPS)"),F("JSON parsing for responses with Content-Type: application/json"),F("Raw string returns for non-JSON responses"),F("rejectUnauthorized defaults to true — pass false (or set MAGIC_TEST_HTTP_REJECT_UNAUTHORIZED=false) for self-signed certificates")]),N({},"HttpOptions"),Q(`
import type { HttpOptions } from '@magic/test'
`),G("| Option | Type | Default | Description |"),G("| ------ | ---- | ------- | ----------- |"),G("| timeout | number | 30000 | Request timeout in milliseconds |"),G("| rejectUnauthorized | boolean | true | Reject self-signed certs |"),G("| maxSize | number | - | Maximum response size in bytes |"),G("| requestOptions | RequestOptions | - | Additional request options |"),I({id:"lib-trycatch"},"trycatch"),G("run a function and catch what it throws, without it bubbling into the runtime"),Q(`
import { is, tryCatch } from '@magic/test'

const throwing = () => throw new Error('oops')
const healthy = () => true

export default [
  {
    fn: tryCatch(throwing()),
    expect: is.error,
    info: 'function throws an error',
  },
  {
    fn: tryCatch(healthy()),
    expect: true,
    info: 'function does not throw',
  },
]
`),I({id:"lib-error"},"error"),G(["re-exports ",X({to:"https://github.com/magic/error",text:"@magic/error"})," — errors with optional names."]),Q(`
import { error } from '@magic/test'

export default [
  {
    fn: tryCatch(error('Message', 'E_NAME')),
    expect: e => e.name === 'E_NAME' && e.message === 'Message',
    info: 'Errors have messages and (optional) names.',
  },
]
`),I({id:"lib-mock"},"mock"),G("spies and mocks for functions."),Q(`
import { mock, tryCatch } from '@magic/test'

export default [
  {
    fn: () => {
      const spy = mock.fn()
      spy('arg1')
      return spy.calls.length === 1 && spy.calls[0][0] === 'arg1'
    },
    expect: true,
    info: 'mock.fn tracks call arguments',
  },
  {
    fn: () => {
      const spy = mock.fn().mockReturnValue('mocked')
      return spy() === 'mocked'
    },
    expect: true,
    info: 'mock.fn.mockReturnValue sets return value',
  },
  {
    fn: async () => {
      const spy = mock.fn().mockThrow(new Error('fail'))
      const caught = await tryCatch(spy)()
      return caught instanceof Error
    },
    expect: true,
    info: 'mock.fn.mockThrow works with tryCatch',
  },
  {
    fn: () => {
      const obj = { greet: () => 'hello' }
      const spy = mock.spy(obj, 'greet', () => 'world')
      const result = obj.greet()
      spy.mockRestore()
      return result === 'world' && obj.greet() === 'hello'
    },
    expect: true,
    info: 'mock.spy replaces and restores methods',
  },
]
`),N({},"mock.fn properties"),J([F("calls - Array of all call arguments"),F("returns - Array of all return values"),F("errors - Array of all thrown errors (null for non-throwing calls)"),F("callCount - Number of times called")]),N({},"mock.fn methods"),J([F("mockReturnValue(value) - Set return value (chainable)"),F("mockThrow(error) - Set error to throw (chainable)"),F("getCalls() - Get all call arguments"),F("getReturns() - Get all return values"),F("getErrors() - Get all thrown errors")]),N({id:"lib-mock-log"},"mock.log"),G("log calls that respect NODE_ENV:"),Q(`
import { mock } from '@magic/test'

mock.log.log('Debug info')      // Logs if not NODE_ENV=production
mock.log.warn('Heads up')       // Logs if not NODE_ENV=production
mock.log.error('Something went wrong')  // Always logs
mock.log.time('operation')     // Logs timing if not NODE_ENV=production
mock.log.timeEnd('operation')   // Logs timing end if not NODE_ENV=production
`),I({id:"lib-has"},"has"),G(["assert on object properties, array contents and strings,"," without type annotations or stringifying."]),G(["Full documentation for every has.* check, including has.not, lives on the ",X({to:"/lib/has/"},"has page"),"."]),Q(`
import { has, is } from '@magic/test'
`),N({},"has.property(key, check)"),G("Check a single property. Accepts either a predicate or a literal value."),Q(`
// With predicate
{
  fn: () => getUser(),
  expect: has.property('name', is.string),
  info: 'user name is a string',
}

// With literal value (uses is.deep.equal)
{
  fn: () => getUser(),
  expect: has.property('age', 25),
  info: 'user age is 25',
}
`),N({},"has.properties(spec)"),G("Check multiple properties. Mix predicates and literal values."),Q(`
{
  fn: () => getUser(),
  expect: has.properties({ name: is.string, age: is.num }),
  info: 'user has required properties',
}
`),N({},"has.any(spec)"),G("Check at least one property matches. Accepts predicates or literals."),Q(`
{
  fn: () => parseResult(),
  expect: has.any({ error: is.error, data: is.object }),
  info: 'result has either error or data',
}
`),N({},"has.nested(path, predicate)"),G("Check a nested property path."),Q(`
{
  fn: () => getData(),
  expect: has.nested('user.profile.name', is.string),
  info: 'deep nested property exists',
}
`),N({},"has.string(substring)"),G("Check if value is a string containing substring."),Q(`
{
  fn: () => error.message,
  expect: has.string('failed to connect'),
  info: 'error message contains helpful context',
}
`),N({},"has.key(keyName)"),G("Check if object has a specific key."),N({},"has.keys(keyNames[])"),G("Check if object has all specified keys."),N({},"has.includes(item)"),G("Check if array or string contains item (uses deep.equal for arrays)."),N({},"has.oneOf(options[])"),G("Check if value equals one of the options (uses deep.equal)."),N({},"has.matches(regex)"),G("Check if string matches regex pattern."),I({id:"lib-version"},"version"),G(["checks your exports against a spec you write,"," so export changes make noise."]),G(["the spec uses ",X({to:"https://github.com/magic/types",text:"@magic/types"})," — every type it exports is a valid spec string."]),Q(`
import { version } from '@magic/test'

// import your lib as your codebase requires
// import * as lib from '../src/index.js'
// import lib from '../src/index.js

const spec = {
  stringValue: 'string',
  numberValue: 'number',

  objectValue: [
    'obj',
    {
      key: 'Willbechecked',
    },
  ],

  objectNoChildCheck: ['obj', false],
}

export default version(lib, spec)
`),G(["Using `['obj', false]` in a spec will test that the parent is an object"," without checking the key/value pairs inside."]),I({id:"lib-dom"},"DOM Environment"),G(["@magic/test automatically initializes a DOM environment when imported,"," making browser APIs available in Node.js."]),N({},"Available globals"),J([F("Core: document, window, self, navigator, location, history"),F("DOM types: Node, Element, HTMLElement, SVGElement, Document, DocumentFragment"),F("Events: Event, CustomEvent, MouseEvent, KeyboardEvent, InputEvent, TouchEvent, PointerEvent"),F("Forms: FormData, File, FileList, Blob"),F("Networking: URL, URLSearchParams, XMLHttpRequest, fetch, WebSocket"),F("Storage: Storage, sessionStorage, localStorage"),F("Observers: MutationObserver, IntersectionObserver, ResizeObserver"),F("File APIs: FileReader, AbortController, AbortSignal"),F("Streams: ReadableStream, WritableStream, TransformStream"),F("Misc: DOMParser, XMLSerializer, TextEncoder, TextDecoder, atob, btoa"),F("Timers: setTimeout, setInterval, requestAnimationFrame")]),N({},"DOM Utilities"),Q(`
import { initDOM, getDocument, getWindow } from '@magic/test'

// Get the document and window instances
const doc = getDocument()
const win = getWindow()

// Manually re-initialize if needed
initDOM()
`),N({},"Canvas/Image Polyfills"),J([F("new Image() - Parses PNG data URLs to extract dimensions"),F('canvas.getContext("2d") - Returns node-canvas context'),F("canvas.toDataURL() - Serializes canvas to data URL")])],"/test/lib/has/":()=>[O({id:"has"},"has"),G(["assert on object properties, array contents and strings,"," without type annotations or stringifying."," Every has.* check returns a predicate, so it works directly"," as a test expectation:"]),Q(`
import { has, is } from '@magic/test'

{
  fn: () => getUser(),
  expect: has.property('name', is.string),
  info: 'user name is a string',
}
`),I({id:"has-property"},"has.property(key, check)"),G("Check a single property. Accepts either a predicate or a literal value (uses is.deep.equal)."),Q(`
// With predicate
{
  fn: () => getUser(),
  expect: has.property('name', is.string),
  info: 'user name is a string',
}

// With literal value (uses is.deep.equal)
{
  fn: () => getUser(),
  expect: has.property('age', 25),
  info: 'user age is 25',
}
`),I({id:"has-properties"},"has.properties(spec)"),G("Check multiple properties. Mix predicates and literal values."),Q(`
{
  fn: () => getUser(),
  expect: has.properties({ name: is.string, age: is.num }),
  info: 'user has required properties',
}

// All literals
{
  fn: () => getUser(),
  expect: has.properties({ name: 'John', age: 25 }),
  info: 'exact user match',
}
`),I({id:"has-any"},"has.any(spec)"),G("Check at least one property matches. Accepts predicates or literals."),Q(`
{
  fn: () => parseResult(),
  expect: has.any({ error: is.error, data: is.object }),
  info: 'result has either error or data',
}

// With literals
{
  fn: () => parseResult(),
  expect: has.any({ error: 'not found', data: null }),
  info: 'result has specific error or null data',
}
`),I({id:"has-nested"},"has.nested(path, check)"),G("Check a nested property path. Accepts predicates or literal values."),Q(`
{
  fn: () => getData(),
  expect: has.nested('user.profile.name', is.string),
  info: 'deep nested property exists',
}
`),I({id:"has-string"},"has.string(substrings)"),G("Check if value is a string containing every given substring. Substring entries can also be predicates receiving the full string."),Q(`
{
  fn: () => error.message,
  expect: has.string('failed to connect'),
  info: 'error message contains helpful context',
}

// can also check multiple args
{
  fn: () => error.message,
  expect: has.string('failed', 'to', 'connect'),
  info: 'error message contains all parts',
}
`),I({id:"has-at"},"has.at(index, check)"),G("Check the element at a given index of an array. Accepts a predicate, a literal value, or an array of checks (all must pass)."),Q(`
{
  fn: () => getItems(),
  expect: has.at(0, is.string),
  info: 'first item is a string',
}

// multiple checks must all pass
{
  fn: () => getItems(),
  expect: has.at(0, [is.string, item => item === 'first']),
  info: 'first item is the string "first"',
}
`),I({id:"has-key"},"has.key(keyName)"),G("Check if object has a specific key."),Q(`
{
  fn: () => result,
  expect: has.key('data'),
  info: 'result has data key',
}
`),I({id:"has-keys"},"has.keys(keyNames[])"),G("Check if object has all specified keys."),Q(`
{
  fn: () => user,
  expect: has.keys(['name', 'email']),
  info: 'user has required fields',
}
`),I({id:"has-includes"},"has.includes(...items)"),G("Check if array or string contains item (uses deep.equal for arrays). With multiple items, every item must be present."),Q(`
const roles = ['admin', 'root', 'user']
{
  fn: () => roles,
  expect: has.includes('admin', 'root'),
  info: 'user has admin and root roles',
}
`),I({id:"has-oneof"},"has.oneOf(options)"),G("Check if value equals one of the options (uses deep.equal)."),Q(`
// if only one arg and first arg is an array:
{
  fn: () => status,
  expect: has.oneOf(['pending', 'done', 'failed']),
  info: 'status is a valid value',
},
// also valid
{
  fn: () => status,
  expect: has.oneOf('pending', 'done', 'failed'),
  info: 'status is a valid value',
},
`),I({id:"has-matches"},"has.matches(regex)"),G("Check if string matches regex pattern."),Q(`
{
  fn: () => phoneNumber,
  expect: has.matches(/^\\d{3}-\\d{4}$/),
  info: 'phone number is valid format',
}
`),I({id:"has-not"},"has.not"),G(["Negated versions of every has.* check. has.not.X(...) passes exactly"," when the matching has.X(...) would fail (pure logical negation):"]),J([F("has.not.property(key, check)"),F("has.not.properties(spec)"),F("has.not.any(spec)"),F("has.not.nested(path, check)"),F("has.not.string(substring)"),F("has.not.at(index, check)"),F("has.not.key(keyName)"),F("has.not.keys(keyNames[])"),F("has.not.includes(item)"),F("has.not.oneOf(options[])"),F("has.not.matches(regex)")]),Q(`
{
  fn: () => status,
  expect: has.not.oneOf(['pending', 'done']),
  info: 'status is not a valid state',
}

{
  fn: () => error.message,
  expect: has.not.string('timeout'),
  info: 'error is not a timeout',
}

{
  fn: () => user,
  expect: has.not.property('isAdmin', true),
  info: 'user is not an admin',
}

{
  fn: () => items,
  expect: has.not.includes('admin'),
  info: 'items do not contain admin',
}
`),G(["negation is purely logical: has.not.X passes wherever has.X fails."," So has.not.property(...)(null) is true (has.property is false for null),"," and has.not.keys([])({...}) is false (has.keys([]) always passes for objects)."])],"/test/svelte/":()=>[O({id:"svelte"},"Svelte Testing"),G(["@magic/test has built-in support for testing Svelte 5 components:"," it compiles your components, mounts them in a DOM,"," and hands you helpers to poke at and assert on."]),G(["internally uses happy-dom to create the DOM and html elements."]),I({id:"lib-svelte"},"mount"),Q(`
import { mount, html } from '@magic/test/svelte'

const component = './path/to/MyComponent.svelte'

export default [
  {
    component,
    props: { message: 'Hello' },
    fn: ({ target }) => html(target).includes('Hello'),
    expect: true,
    info: 'renders the message prop',
  },
]
`),N({},"Exported Functions"),J([F("mount(filePath, options) - mounts a component, returns { target, component, unmount, css }"),F("html(target) - innerHTML of a mounted component's target element"),F("text(target) - textContent of a target element"),F("component(instance) - the component instance, for accessing exported values"),F("props(target) - attribute name/value pairs from the target element"),F("createSnippet(renderFn) - a raw snippet to pass as a children prop"),F("tick() - svelte's tick, retry-wrapped — await it after interactions")]),N({},"Interaction Functions"),G("fire everything a user can do:"),J([F("mouse: click (target, selector?), dblClick, contextMenu, mouseDown/Up/Move/Enter/Leave/Over/Out"),F("keys: keyDown, keyPress, keyUp (target, key), type, input, change"),F("focus: focus, focusIn, focusOut, blur, submit"),F("pointer: pointerDown, pointerUp, pointerMove, pointerOver, pointerOut"),F("touch: touchStart, touchMove, touchEnd"),F("drag: dragStart, drag, dragEnd, dragEnter, dragLeave, dragOver, drop"),F("clipboard: copy, cut, paste"),F("media: play, pause, ended, volumeChange"),F("animation: animationStart, animationEnd, animationIteration, transitionEnd"),F("other: resize(target, w, h), scroll(target, x, y), checked, fireEvent, trigger(target, eventType, options?)")]),N({},"Test Properties"),J([F("component - path to the .svelte file"),F("props - props to pass to the component"),F("context - svelte context: a static object, or a factory (info: { target, props }) => object"),F("fn - test function receiving { target, component, unmount }")]),I({id:"svelte-state"},"Accessing Component State"),Q(`
import { mount } from '@magic/test/svelte'

const component = './src/lib/svelte/components/Counter.svelte'

export default [
  {
    component,
    fn: async ({ target, component: instance }) => {
      return instance.count
    },
    expect: 0,
    info: 'initial count is 0',
  },
]
`),I({id:"svelte-auto-export"},"Automatic Test Exports"),G(["$state and $derived variables are exported automatically,"," so they are accessible in tests without manual exports."," Svelte 5 only — svelte 4 components can't do this."]),Q(`
<!-- Component.svelte -->
<script>
  let count = $state(0)
  let doubled = $derived(count * 2)
  <!-- No export needed! -->
</script>

<button class="inc">+</button>
<span>{doubled}</span>
`),G("and in the test:"),Q(`
import { mount } from '@magic/test'

export default [
  {
    component: './Component.svelte',
    fn: async ({ component }) => component.count,  // 0
    expect: 0,
    info: 'access $state without manual export',
  },
  {
    component: './Component.svelte',
    fn: async ({ component }) => component.doubled,  // 0 (derived)
    expect: 0,
    info: 'access $derived without manual export',
  },
]
`),G("works for every $state and $derived rune, no config."),I({id:"svelte-error"},"Testing Error Handling"),Q(`
import { tryCatch } from '@magic/test'
import { mount } from '@magic/test/svelte'

const component = './src/lib/svelte/components/MyComponent.svelte'

export default [
  {
    fn: tryCatch(mount, component, { props: null }),
    expect: t => t.message === 'Props must be an object, got object',
    info: 'throws when props is null',
  },
]
`),I({id:"lib-sveltekit-mocks"},"SvelteKit Mocks"),G("mocks SvelteKit $app modules:"),Q(`
import { browser, dev, prod, createStaticPage } from '@magic/test/svelte'

export default [
  {
    fn: () => browser, // mocks a browser environment
    expect: true,
    info: 'always true',
  },
  {
    fn: () => dev, // production mode is set by -p
    expect: process.env.MAGIC_TEST_ENV !== 'production',
    info: 'true unless the run is in production mode (-p)',
  },
  {
    fn: () => prod, // production mode is set by -p
    expect: process.env.MAGIC_TEST_ENV === 'production',
    info: 'true only in production mode (-p)',
  },
]
`),I({id:"lib-create-static-page"},"createStaticPage"),G("creates a static $app/state page proxy (url/params/state):"),Q(`
import { createStaticPage } from '@magic/test/svelte'

export default [
  {
    fn: () => {
      const page = createStaticPage({ url: 'http://example.com', params: { id: '1' } })
      return page.url.hostname === 'example.com' && page.params.id === '1'
    },
    expect: true,
    info: 'createStaticPage returns a page proxy with url/params/state',
  },
]
`),I({id:"lib-compile-svelte"},"compileSvelte"),G("compile a .svelte file to js/css (async, file path in):"),Q(`
import { compileSvelte } from '@magic/test/svelte'

export default [
  {
    fn: async () => {
      const { js } = await compileSvelte('./path/to/button.svelte')
      return typeof js === 'string'
    },
    expect: true,
    info: 'compiles a svelte file to js/css',
  },
]
`),G("Available functions:"),J([F("compileSvelte(source, filename) - Compiles Svelte source to JS/CSS modules"),F("ensureSvelte() - Lazy-loads the Svelte package, throws if not installed")]),I({id:"svelte-ensure"},"ensureSvelte"),G("lazy-loads the svelte package, throws if it is not installed:"),Q(`
import { ensureSvelte } from '@magic/test/svelte'

export default [
  {
    fn: async () => {
      const svelte = await ensureSvelte()
      return svelte.version.startsWith('5')
    },
    expect: true,
    info: 'loads svelte package',
  },
]
`)],"/test/svelte/4-vs-5/":()=>[O({id:"svelte-4-vs-5"},"Svelte 4 vs 5"),G(["Testing Svelte components with @magic/test has different"," capabilities depending on the Svelte version.","These limitations are inherited from svelte."]),G("The svelte 4 functionality is not tested, we moved all our libraries to svelte 5, there be dragons."),I({},"Feature Comparison"),H([K([B("Feature"),B("Svelte 4"),B("Svelte 5")]),K([z("Component mounting"),z({class:"align-center"},"✅"),z({class:"align-center"},"✅")]),K([z("Component interaction"),z({class:"align-center"},"✅"),z({class:"align-center"},"✅")]),K([z("Auto-export ($state/$derived)"),z("❌"),z({class:"align-center"},"✅")]),K([z("Runes"),z("❌"),z({class:"align-center"},"✅")]),K([z("compileSvelte"),z({class:"align-center"},"✅"),z({class:"align-center"},"✅")]),K([z("createStaticPage"),z({class:"align-center"},"✅"),z({class:"align-center"},"✅")]),K([z("SvelteKit mocks"),z({class:"align-center"},"✅"),z({class:"align-center"},"✅")])]),I({},"What Works in Both"),J([F("Mounting components with mount()"),F("Component interaction via events (click, input, etc.)"),F("HTML assertions with html() and text()"),F("compileSvelte for source compilation"),F("createStaticPage for SvelteKit testing")]),I({},"Svelte 5 Only"),J([F("Auto-export of $state and $derived runes"),F("Rune-based reactivity")]),G(["Svelte 5 automatically exports $state and $derived variables,"," making them accessible in tests without manual exports."]),I({},"Workarounds for Svelte 4"),G(["Svelte 4 does not support automatic export of reactive state."," To access component state in tests:"]),N({},"Manual Export in Svelte 4"),Q(`
<!-- Component.svelte -->
<script>
  export let count = 0;
</script>

<button on:click={() => count++}>
  {count}
</button>
`),Q(`
import { mount } from '@magic/test/svelte'

export default [
  {
    component: './Component.svelte',
    fn: async ({ component }) => component.count,
    expect: 0,
    info: 'access exported count prop',
  },
]
`),N({},"Svelte 5 Auto-Export"),Q(`
<!-- Component.svelte (Svelte 5) -->
<script>
  let count = $state(0)
</script>

<button class="inc">+</button>
<span>{count}</span>
`),Q(`
import { mount } from '@magic/test/svelte'

export default [
  {
    component: './Component.svelte',
    fn: async ({ component }) => component.count,  // works automatically!
    expect: 0,
    info: 'access $state without manual export',
  },
]
`),I({},"See Also"),X({to:"/svelte/"},"Svelte Testing Guide")],"/test/test-isolation/":()=>[O({id:"test-isolation"},"Test Isolation"),G(["@magic/test supports test isolation to prevent tests from affecting each other."," Tests in the same suite can share state, but you can isolate them:"]),Q(`
export default [
  // This test runs in isolation from others
  {
    fn: () => {
      const state = { counter: 0 }
      state.counter++
      return state.counter
    },
    expect: 1,
    info: 'isolated test with local state',
  },
]
`),I({id:"isolate"},"__isolate"),G("Global Isolation Mode:"),G(["By default, tests in the same file share global state."," To enable strict isolation where each test gets a fresh environment,"," add the __isolate export at the top of your test file:"]),Q(`
export const __isolate = true

export default [
  { fn: () => (global.test = 1), expect: 1 },
  { fn: () => global.test === undefined, expect: true, info: 'fresh global state' },
]
`),G(["each test starts with fresh globals."]),I({},"Programmatic Detection"),G(["suiteNeedsIsolation(tests) tells you if a suite requires isolation:"]),Q(`
import { suiteNeedsIsolation } from '@magic/test'

const needsIsolation = suiteNeedsIsolation(tests)
`),G(["for custom runners / test tooling."])],"/test/writing-tests/":()=>[O({id:"writing-tests"},"Writing Tests"),I({id:"tests"},"Single Test"),G("A test can be a literal value, function, or promise:"),Q(`
export default { fn: true, expect: true, info: 'expect true to be true' }

// expect: true is the default and can be omitted
export default { fn: true, info: 'expect true to be true' }

// if fn is a function, expect is the returned value of the function
export default { fn: () => false, expect: false, info: 'expect true to be true' }

// if expect is a function, the return value of the test gets passed to it
export default { fn: false, expect: t => t === false, info: 'expect true to be true' }

// if fn is a promise, the resolved value will be returned
export default { fn: new Promise(r => r(true)), expect: true, info: 'promise resolves to true' }

// if expect is a promise, it will resolve before being compared to the fn return value
export default { fn: true, expect: new Promise(r => r(true)), info: 'expect is a promise' }

// callback functions can be tested easily too:
import { promise } from '@magic/test'
const fnWithCallback = (err, arg, cb) => cb(err, arg)
export default { fn: promise(fnWithCallback(null, 'arg', (e, a) => a)), expect: 'arg' }
`),I({id:"tests-multiple"},"Multiple Tests"),G("Export an array (or an object of named arrays) of test objects:"),Q(`
export default [
  { fn: () => true, expect: true, info: 'expect true to be true' },
  { fn: () => false, expect: false, info: 'expect false to be false' },
]
`),G("Or an object of named arrays:"),Q(`
export default {
  multipleTests: [
    { fn: () => true, expect: true, info: 'expect true to be true' },
    { fn: () => false, expect: false, info: 'expect false to be false' },
  ]
}
`),I({id:"tests-runs"},"Running Tests Multiple Times"),G("The runs property runs a test multiple times:"),Q(`
import { is } from '@magic/test'

export default [
  {
    fn: Math.random(),
    expect: is.number,
    runs: 5,
    info: 'runs the test 5 times and expects all returns to be numbers',
  },
]
`),I({id:"tests-types"},"Testing Types"),G(["Types can be compared using ",X({to:"https://github.com/magic/types",text:"@magic/types"})]),G(["@magic/types is a full-featured type library, zero dependencies."," It is exported from this library for convenience."]),Q(`
import { is } from '@magic/test'

export default [
  { fn: () => 'string',
    expect: is.string,
    info: 'test if a function returns a string'
  },
  {
    fn: () => 'string',
    expect: is.length.equal(6),
    info: 'test length of returned value'
  },
  // Testing for deep equality. simple.
  {
    fn: () => [1, 2, 3],
    expect: is.deep.equal([1, 2, 3]),
    info: 'deep compare arrays/objects for equality',
  },
  {
    fn: () => ({ key: 1 }),
    expect: is.deep.different({ value: 1 }),
    info: 'deep compare arrays/objects for difference',
  },
]
`),N({id:"predicates-and-values"},"Predicates & Values Array"),G(["Combine type checks with value checks in a single expect array."," Each element is checked independently against the test result."," All must pass (AND semantics):"]),Q(`
import { is } from '@magic/test'

export default [
  {
    fn: () => 'wrong',
    expect: [is.string, 'wrong'],
    info: 'is a string AND equals "wrong"',
  },
  {
    fn: () => [1, 2, 3],
    expect: [is.array, [1, 2, 3]],
    info: 'is an array AND deep equals [1, 2, 3]',
  },
  {
    fn: () => ({ key: 'val' }),
    expect: [is.object, { key: 'val' }],
    info: 'is an object AND deep equals',
  },
]
`),G("Mix as many predicates and values as needed:"),Q(`
export default {
  fn: () => 42,
  expect: [is.number, v => v > 0, 42],
  info: 'is number, is greater than 0, equals 42',
}
`),G(["Predicate elements are functions — evaluated with the test result."," Non-predicates are compared with strict equality (primitives) or deep equality (objects/arrays)."," Pure value arrays without functions, like `expect: [1, 2, 3]`, still use deep equality as before."]),N({id:"caveat"},"Caveat"),G(["To test that a function is a function, wrap it in another function."," Bare functions passed to fn get called."]),Q(`
import { is } from '@magic/test'

const fnToTest = () => {}

export default [
  {
    fn: () => fnToTest,
    expect: is.function,
    info: 'function is a function',
  },
]
`),I({id:"tests-typescript"},"TypeScript Support"),G(["@magic/test runs .ts test files directly — no transpilation."]),Q(`
import type { Test } from '@magic/test'

export default [
  { fn: () => true, expect: true, info: 'TypeScript test works!' }
] satisfies Test[]
`),G("This requires Node.js 22.18.0 or later."),I({id:"tests-promises"},"Promises"),Q(`
import { promise, is } from '@magic/test'

export default [
  // kinda clumsy, but works. until you try handling errors.
  {
    fn: new Promise(cb => setTimeout(() => cb(true), 2000)),
    expect: true,
    info: 'handle promises',
  },
  // better!
  {
    fn: promise(cb => setTimeout(() => cb(null, true), 200)),
    expect: true,
    info: 'handle promises in a nicer way',
  },
  {
    fn: promise(cb => setTimeout(() => cb(new Error('error')), 200)),
    expect: is.error,
    info: 'handle promise errors in a nice way',
  },
]
`),I({id:"tests-cb"},"Callback Functions"),Q(`
import { promise, is } from '@magic/test'

const fnWithCallback = (err, arg, cb) => cb(err, arg)

export default [
  {
    fn: promise(cb => fnWithCallback(null, true, cb)),
    expect: true,
    info: 'handle callback functions as promises',
  },
  {
    fn: promise(cb => fnWithCallback(new Error('oops'), true, cb)),
    expect: is.error,
    info: 'handle callback function error as promise',
  },
]
`),I({id:"tests-hooks"},"Hooks"),N({},"Individual Test Hooks"),G("Run functions before and/or after individual tests:"),Q(`
const after = () => {
  global.testing = 'Test has finished, cleanup.'
}

const before = () => {
  global.testing = false

  // if a function gets returned,
  // this function will be executed once the test finishes.
  return after
}

export default [
  {
    fn: () => { global.testing = 'changed in test' },
    before,
    after,
    expect: () => global.testing === 'changed in test',
  },
]
`),N({id:"tests-suite-hooks"},"Suite Hooks"),G("Run functions before and/or after a suite of tests:"),Q(`
const afterAll = () => {
  global.testing = undefined
}

const beforeAll = () => {
  global.testing = false

  // if a function gets returned,
  // this function will be executed once the test suite finishes.
  return afterAll
}

export default {
  beforeAll,
  // this is optional if beforeAll returns a function
  afterAll,
  tests: [
    {
      fn: () => { global.testing = 'changed in test' },
      expect: () => global.testing === 'changed in test',
    },
  ],
}
`),G(["Suites that use beforeAll, afterAll, beforeEach or afterEach"," run in a worker, so globals are not polluted for other suites."]),M({},"File-based Hooks"),G(["You can also create test/beforeAll.js and test/afterAll.js files"," that run before/after all tests."]),G("**Note:** These files must be placed at the **root** `test/` directory (not in subdirectories)."),Q(`
// test/beforeAll.js
export default () => {
  global.setup = true
  // optionally return a cleanup function
  return () => {
    global.setup = false
  }
}
`),Q(`
// test/afterAll.js
export default () => {
  // cleanup after all tests
}
`),N({id:"tests-each-hooks"},"beforeEach and afterEach"),G("Define beforeEach and afterEach hooks that run before/after each individual test:"),Q(`
const beforeEach = () => {
  // Runs before each test in this suite
  global.testState = { initialized: true }
}

const afterEach = () => {
  // Runs after each test
  global.testState = null
}

export default {
  beforeEach,
  afterEach,
  tests: [
    { fn: () => global.testState.initialized, expect: true },
    { fn: () => true, expect: true },
  ],
}
`),I({id:"tests-magic-modules"},"Magic Modules"),G(["@magic-modules assume all HTML tags to be globally defined."," To create those globals for your test and check if a @magic-module returns the correct markup,"," just use one of those tags in your tests."]),Q(`
const expect = [
  'i',
  [
    { class: 'testing' },
    'testing',
  ],
]

const props = { class: 'testing' }

export default [
  {
    fn: () => i(props, 'testing'),
    expect,
    info: 'magic/test can now test html',
  },
]
`),I({id:"test-suites"},"Test Suites"),G("What good tests look like:"),J([F("src and test directories have the same structure and files"),F("one test file per src file"),F("one suite per function"),F("one test per feature")]),N({},"Filesystem Based Naming"),G("The following directory structure:"),Q(`./test/
  ./suite1.js
  ./suite2.js`),G("yields the same result as exporting the following from ./test/index.js:"),Q(`import suite1 from './suite1'
import suite2 from './suite2'

export default {
  suite1,
  suite2,
}
`),N({},"Data Driven Naming"),G("Export test structure directly from index.js:"),Q(`
export default {
  suite1: [
    { fn: () => true, expect: true },
  ],
  suite2: [
    { fn: () => false, expect: false },
  ],
}
`),N({id:"tests-file-mappings"},"Important File Mappings"),G(["If test/index.js exists, no other files will be loaded."," If test/lib/index.js exists, no other files from that subdirectory will be loaded."," Instead, the exports of those index.js will be expected to be tests."])]};w({init:{...{description:["Declaratively test your ecmascript module files."," No transpiling required for ecmascript."," Fast."],logotext:"@magic/test",menu:[{text:"Home",to:"/test/"},{text:"Getting Started",to:"/test/getting-started/"},{items:[{text:"Single Test",to:"/test/writing-tests/#tests"},{text:"Multiple Tests",to:"/test/writing-tests/#tests-multiple"},{text:"Running Multiple Times",to:"/test/writing-tests/#tests-runs"},{text:"Testing Types",to:"/test/writing-tests/#tests-types"},{text:"Promises",to:"/test/writing-tests/#tests-promises"},{text:"Callbacks",to:"/test/writing-tests/#tests-cb"},{text:"Hooks",to:"/test/writing-tests/#tests-hooks"},{text:"Suite Hooks",to:"/test/writing-tests/#tests-suite-hooks"},{text:"beforeEach/afterEach",to:"/test/writing-tests/#tests-each-hooks"},{text:"Magic Modules",to:"/test/writing-tests/#tests-magic-modules"},{text:"Test Suites",to:"/test/writing-tests/#test-suites"}],text:"Writing Tests",to:"/test/writing-tests/"},{items:[{text:"deep",to:"/test/lib/#lib-deep"},{text:"fs",to:"/test/lib/#lib-fs"},{text:"curry",to:"/test/lib/#lib-curry"},{text:"log",to:"/test/lib/#lib-log"},{text:"vals",to:"/test/lib/#lib-vals"},{text:"env",to:"/test/lib/#lib-env"},{text:"promises",to:"/test/lib/#lib-promises"},{text:"http",to:"/test/lib/#lib-http"},{text:"tryCatch",to:"/test/lib/#lib-trycatch"},{text:"error",to:"/test/lib/#lib-error"},{text:"mock",to:"/test/lib/#lib-mock"},{text:"mock.log",to:"/test/lib/#lib-mock-log"},{text:"has",to:"/test/lib/has/"},{text:"version",to:"/test/lib/#lib-version"},{text:"DOM Environment",to:"/test/lib/#lib-dom"}],text:"Utilities",to:"/test/lib/"},{items:[{text:"mount",to:"/test/svelte/#lib-svelte"},{text:"Component State",to:"/test/svelte/#svelte-state"},{text:"Auto Exports",to:"/test/svelte/#svelte-auto-export"},{text:"Error Handling",to:"/test/svelte/#svelte-error"},{text:"SvelteKit Mocks",to:"/test/svelte/#lib-sveltekit-mocks"},{text:"createStaticPage",to:"/test/svelte/#lib-create-static-page"},{text:"compileSvelte",to:"/test/svelte/#lib-compile-svelte"},{text:"Svelte 4 vs 5",to:"/test/svelte/4-vs-5/"}],text:"Svelte",to:"/test/svelte/"},{items:[{text:"package.json Setup",to:"/test/cli/#cli-packagejson"},{text:"Global Install",to:"/test/cli/#cli-global"},{text:"CLI Flags",to:"/test/cli/#cli-flags"},{text:"Sharding Tests",to:"/test/cli/#sharding"},{text:"Exit Codes",to:"/test/cli/#exit-codes"},{text:"Verbose Output",to:"/test/cli/#verbose-output"},{text:"Performance Tips",to:"/test/cli/#performance-tips"},{text:"Common Pitfalls",to:"/test/cli/#common-pitfalls"},{text:"CLI Flags Reference",to:"/test/cli/flags/"},{text:"Sharding Cheat-Sheet",to:"/test/cli/sharding-cheatsheet/"},{text:"Performance Tips",to:"/test/cli/performance-tips/"},{text:"Common Pitfalls",to:"/test/cli/common-pitfalls/"}],text:"CLI & Usage",to:"/test/cli/"},{items:[{text:"__isolate",to:"/test/test-isolation/#isolate"}],text:"Test Isolation",to:"/test/test-isolation/"},{text:"Error Codes",to:"/test/error-codes/"},{text:"Error Codes Quick Look",to:"/test/error-codes-quicklook/"},{text:"Changelog",to:"/test/changelog/"}],nospy:{show:!1},pageClass:{},pages:{"/test/404/":{description:"404 - not found.",title:"404 - not found"}},root:"/test/",theme:"dark",title:"@magic/test",url:"/test/"},url:window.location.pathname,hash:window.location.hash.substr(1)},subscriptions:e=>[[et,ee.pop]],view:e=>{let t=es[e.url]?e.url:"/404/",s=es[t],o=e.pages&&e.pages[t];return o&&Object.keys(o).forEach(t=>{e[t]=o[t]}),e.url=t,(({page:e,state:t},s)=>L({id:"Magic",class:t.pageClass},R({class:{Wrapper:!0}},[((e={},t=[])=>{let{logo:s,menu:o,logotext:r,hash:i,url:a}=e;if(s||o||r)return j({class:"Header"},[X({to:"/",class:"Logo"},[$({viewBox:"0 0 512 444"},[q({d:"M512 444L256 0 0 444z",fill:"#663695"}),S({cx:"256",cy:"294",r:"130",fill:"#fff"}),S({cx:"256",cy:"281",r:"40",fill:"#663695"}),q({d:"M256 350v44m24-44l1 13c1 27 29 27 29-7m-160-72s46-47 106-47c59 0 106 47 106 47s-47 43-106 43c-60 0-106-43-106-43zm65-75a134 134 0 0189 2",class:"stroke"}),q({d:"M256 81v53m184 270l-43-29M72 404l43-29",class:"stroke white"})])]),r&&G(r),o&&((e={})=>{let{collapse:t=!0,menu:s,hash:o}=e,{class:r="",url:i}=e;return r.includes("Menu")||(r=`Menu ${r}`.trim()),o&&!i.endsWith(o)&&(i+=`#${o}`),U({className:r},J(s.map(e=>Y({...e,url:i,collapse:t}))))})({url:a,hash:i,menu:o}),t])})(t),R({class:"Page",id:"page"},e(t)),((e=[])=>_({class:"Footer"},[R({class:"Container"},[R({class:"Credits"},["made with a few bits of ",X({to:"https://magic.github.io/",target:"_blank",rel:"noopener"},"magic")]),e])]))(),s])))({page:s,state:e},[((e={})=>$({class:"LightSwitch icon",onclick:ee.changeTheme,height:25,width:25,viewBox:"0 0 352 460"},[q({d:"M149 48C96 48 48 95 47 143c-1 13 19 17 20 0-1-35 48-75 83-75 15 0 12-22-1-20z"}),q({d:"M176 0C74 0 0 83 0 176c9 91 84 118 100 204h20c-16-92-97-138-100-204C22 70 105 21 176 20zM95 400c2 68 20 48 40 60h82c20-12 38 8 40-60z"}),q({d:"M175 0c102 0 177 83 177 176-9 91-86 118-102 204h-20c16-92 99-138 102-204-2-106-86-155-157-156z"})]))(e),(({nospy:e={},cookies:t=[]})=>{let{show:s,title:o="Privacy Notice",content:r="This app neither saves, collects, nor shares any data about you.",buttonText:i="Awesome!"}=e;return s?R({class:"NoSpy"},[R({class:"Background",onclick:ee.nospy.toggle}),R({class:"Container"},[o&&N(o),r&&G(r),D({onclick:ee.nospy.toggle,value:i,type:"button"})])]):R({class:"NoSpy"},$({class:"icon",onclick:ee.nospy.toggle,width:"25",height:"25",viewBox:"0 0 512 512"},[A([q({d:`
M507,208c-1-7-7-12-14-13c-7-1-13,3-16,9
c-5,11-16,19-29,19c-14,0-26-10-30-23c-2-8-11-13-19-11
C393,191,389,192,384,192c-35-0-64-29-64-64c0-5,1-9,2-14
c2-8-3-16-11-19C297,90,288,78,288,64c-0-13,8-24,19-29
c6-3,10-9,9-16c-1-7-6-12-13-14C288,2,272,0,256,0
C115,0,0,115,0,256c0,141,115,256,256,256c141-0,256-115,256-256
C512,239,510,224,507,209z M414,414C374,455,318,480,256,480s-118-25-158-66
C57,374,32,318,32,256S57,138,98,98C138,57,194,32,256,32c3,0,6,0,9,0
C259,42,256,52,256,64c0,24,13,44,33,55C288,122,288,125,288,128
c0,53,43,96,96,96c3,0,6-0,8-0C403,242,424,256,448,256
c11-0,22-3,32-8c0,3,0,6,0,9C480,318,455,374,414,414z
`}),S({cx:"192",cy:"128",r:"32"}),S({cx:"128",cy:"256",r:"32"}),S({cx:"288",cy:"384",r:"32"}),S({cx:"272",cy:"272",r:"16"}),S({cx:"400",cy:"336",r:"16"}),S({cx:"176",cy:"368",r:"16"})])]))})(e)])},node:document.getElementById("Magic")})};__MAGIC__();