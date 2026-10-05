const __MAGIC__=()=>{var e,t,s,i,r,o,n,a,l,c,d,u,m,h,f,g,v,x,b,y;let{h:w,app:k}=(e={},s=(t=[]).map,i=Array.isArray,r="u">typeof requestAnimationFrame?requestAnimationFrame:setTimeout,o=function(e){var t="";if("string"==typeof e)return e;if(i(e)&&e.length>0)for(var s,r=0;r<e.length;r++)""!==(s=o(e[r]))&&(t+=(t&&" ")+s);else for(var r in e)e[r]&&(t+=(t&&" ")+r);return t},n=function(e,t){var s={};for(var i in e)s[i]=e[i];for(var i in t)s[i]=t[i];return s},a=function(e){return e.reduce(function(e,t){return e.concat(t&&!0!==t?"function"==typeof t[0]?[t]:a(t):0)},t)},l=function(e,t){if(e!==t)for(var s in n(e,t)){var r,o;if(e[s]!==t[s]&&(r=e[s],o=t[s],!(i(r)&&i(o))||r[0]!==o[0]||"function"!=typeof r[0]))return!0;t[s]=e[s]}},c=function(e,t,s){for(var i,r,o=0,n=[];o<e.length||o<t.length;o++)i=e[o],n.push((r=t[o])?!i||r[0]!==i[0]||l(r[1],i[1])?[r[0],r[1],r[0](s,r[1]),i&&i[2]()]:i:i&&i[2]());return n},d=function(e,t,s,i,r,a){if("key"===t);else if("style"===t)for(var l in n(s,i))s=null==i||null==i[l]?"":i[l],"-"===l[0]?e[t].setProperty(l,s):e[t][l]=s;else"o"===t[0]&&"n"===t[1]?((e.actions||(e.actions={}))[t=t.slice(2)]=i)?s||e.addEventListener(t,r):e.removeEventListener(t,r):!a&&"list"!==t&&"children"!==t&&t in e?e[t]=null==i?"":i:null!=i&&!1!==i&&("class"!==t||(i=o(i)))?"children"!==t&&e.setAttribute(t,i):e.removeAttribute(t)},u=function(e,t,s){var i=e.props,r=3===e.type?document.createTextNode(e.name):(s=s||"svg"===e.name)?document.createElementNS("http://www.w3.org/2000/svg",e.name,{is:i.is}):document.createElement(e.name,{is:i.is});for(var o in i)d(r,o,null,i[o],t,s);for(var n=0,a=e.children.length;n<a;n++)r.appendChild(u(e.children[n]=v(e.children[n]),t,s));return e.node=r},m=function(e){return null==e?null:e.key},h=function(e,t,s,i,r,o){if(s===i);else if(null!=s&&3===s.type&&3===i.type)s.name!==i.name&&(t.nodeValue=i.name);else if(null==s||s.name!==i.name)t=e.insertBefore(u(i=v(i),r,o),t),null!=s&&e.removeChild(s.node);else{var a,l,c,f,g=s.props,x=i.props,b=s.children,y=i.children,w=0,k=0,E=b.length-1,S=y.length-1;for(var T in o=o||"svg"===i.name,n(g,x))("value"===T||"selected"===T||"checked"===T?t[T]:g[T])!==x[T]&&d(t,T,g[T],x[T],r,o);for(;k<=S&&w<=E&&null!=(c=m(b[w]))&&c===m(y[k]);)h(t,b[w].node,b[w],y[k]=v(y[k++],b[w++]),r,o);for(;k<=S&&w<=E&&null!=(c=m(b[E]))&&c===m(y[S]);)h(t,b[E].node,b[E],y[S]=v(y[S--],b[E--]),r,o);if(w>E)for(;k<=S;)t.insertBefore(u(y[k]=v(y[k++]),r,o),(l=b[w])&&l.node);else if(k>S)for(;w<=E;)t.removeChild(b[w++].node);else{for(var T=w,P={},R={};T<=E;T++)null!=(c=b[T].key)&&(P[c]=b[T]);for(;k<=S;){if(c=m(l=b[w]),f=m(y[k]=v(y[k],l)),R[c]||null!=f&&f===m(b[w+1])){null==c&&t.removeChild(l.node),w++;continue}null==f||1===s.type?(null==c&&(h(t,l&&l.node,l,y[k],r,o),k++),w++):(c===f?(h(t,l.node,l,y[k],r,o),R[f]=!0,w++):null!=(a=P[f])?(h(t,t.insertBefore(a.node,l&&l.node),a,y[k],r,o),R[f]=!0):h(t,l&&l.node,null,y[k],r,o),k++)}for(;w<=E;)null==m(l=b[w++])&&t.removeChild(l.node);for(var T in P)null==R[T]&&t.removeChild(P[T].node)}}return i.node=t},f=function(e,t){for(var s in e)if(e[s]!==t[s])return!0;for(var s in t)if(e[s]!==t[s])return!0},g=function(e){return"object"==typeof e?e:b(e)},v=function(e,t){return 2===e.type?((!t||!t.lazy||f(t.lazy,e.lazy))&&((t=g(e.lazy.view(e.lazy))).lazy=e.lazy),t):e},x=function(e,t,s,i,r,o){return{name:e,props:t,children:s,node:i,type:o,key:r}},b=function(s,i){return x(s,e,t,i,void 0,3)},y=function(t){return 3===t.nodeType?b(t.nodeValue,t):x(t.nodeName.toLowerCase(),e,s.call(t.childNodes,y),t,void 0,1)},{h:function(t,s){for(var r,o=[],n=[],a=arguments.length;a-- >2;)o.push(arguments[a]);for(;o.length>0;)if(i(r=o.pop()))for(var a=r.length;a-- >0;)o.push(r[a]);else!1===r||!0===r||null==r||n.push(g(r));return s=s||e,"function"==typeof t?t(s,n):x(t,s,n,void 0,s.key)},app:function(e){var t={},s=!1,o=e.view,n=e.node,l=n&&y(n),d=e.subscriptions,u=[],m=function(e){x(this.actions[e.type],e)},f=function(e){return t!==e&&(t=e,d&&(u=c(u,a([d(t)]),x)),o&&!s&&r(b,s=!0)),t};let{middleware:v=e=>e}=e,x=v((e,s)=>"function"==typeof e?x(e(t,s)):i(e)?"function"==typeof e[0]||i(e[0])?x(e[0],"function"==typeof e[1]?e[1](s):e[1]):(a(e.slice(1)).map(function(e){e&&e[0](x,e[1])},f(e[0])),t):f(e));var b=function(){s=!1,n=h(n.parentNode,n,l,l=g(o(t)),m)};x(e.init)}});Pre.Comment=e=>span({class:"comment"},e),Pre.Line=e=>code({class:"line"},Pre.Words(e)),Pre.Word=e=>{if(!e)return"";let t=e.includes("://"),s=e.startsWith("mailto:")||e.includes("@")&&e.includes(".");if(t||s)return Link({to:e,text:e});let i="";return("state"===e?i="state":"actions"===e?i="actions":"effects"===e?i="effects":"subscriptions"===e?i="subscriptions":E.pre.keywords.includes(e)?i="keyword":E.pre.builtins.includes(e)?i="builtin":E.pre.booleans.includes(e)&&(i="boolean"),i)?span({class:i},e):e},Pre.Words=e=>{let[t,...s]=e.split(E.pre.commentRegex);if(!t.endsWith(":")&&s.length)return[Pre.Words(t),Pre.Comment(s.join("").split(E.pre.wordRegex).map(Pre.Word))];let i=[],r=e;return(e.replace(E.pre.stringRegex,e=>{if(r){let[t,s]=r.split(e);t&&i.push(t.split(E.pre.wordRegex).map(Pre.Word).filter(e=>e)),r=s}i.push(span({class:"string"},e))}),r!==e)?(r&&i.push(r.split(E.pre.wordRegex).map(Pre.Word).filter(e=>e)),i):e.split(E.pre.wordRegex).filter(e=>e).map(Pre.Word)};let E={pre:{booleans:["true","false"],builtins:["Array","Object","String","Number","RegExp","Null","Symbol","Set","WeakSet","Map","WeakMap","setInterval","setTimeout","Promise","JSON","Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Uint16Array","Int32Array","Uint32Array","Float32Array","Float64Array"],commentRegex:/(\/\/)/gim,keywords:["let","this","long","package","float","goto","private","class","if","short","while","protected","with","debugger","case","continue","volatile","interface","instanceof","super","synchronized","throw","extends","final","export","throws","try","import","double","enum","boolean","abstract","function","implements","typeof","transient","break","default","do","static","void","int","new","async","native","switch","else","delete","null","public","var","await","byte","finally","catch","in","return","for","get","const","char","module","exports","require","npm","install","=>"],stringRegex:/("|')(.*?)\1/gim,wordRegex:/( )/gim}},S=(e,t)=>{let{pathname:s,hash:i}=window.location;i=i.substring(1);let r=0;return t.state&&(s=t.state.url,i=t.state.hash,r=t.state.scrollY||0),i?window.location.hash=i:window.scroll({top:r}),{...e,url:s,hash:i}},T=(e,t)=>{let s=s=>e(t,s);return addEventListener("popstate",s),()=>removeEventListener("popstate",s)},P={"/test/":e=>[h1({id:"magictest"},"@magic/test"),p(["Declaratively test your ecmascript module files."," No transpiling of either your codebase nor the tests."," Incredibly fast."]),GitBadges("@magic/test"),h2({id:"getting-started"},"Getting Started"),p(["See the ",Link({to:"/getting-started/"},"Getting Started")," guide for full instructions."]),Pre({lines:"false"},"npm i --save-dev --save-exact @magic/test"),Pre(`
// test/yourFileToTest.js
export default [
  { fn: () => true, expect: true, info: 'true is true' },
]
`),h2({id:"features"},"Features"),ul([li([Link({to:"/writing-tests/"},"Write tests")," in plain JavaScript or TypeScript"]),li([Link({to:"/lib/"},"Utility functions")," for deep equality, mocking, HTTP, and more"]),li([Link({to:"/svelte/"},"Svelte 5")," component testing built-in"]),li([Link({to:"/cli/"},"CLI tools")," with sharding for parallel test execution"]),li([Link({to:"/test-isolation/"},"Test isolation")," for preventing state leakage"]),li([Link({to:"/error-codes/"},"Error codes")," for programmatic error handling"])]),h2({id:"quick-examples"},"Quick Examples"),h3({},"Simple test"),Pre(`
export default [
  { fn: () => 1 + 1, expect: 2 },
  { fn: () => 'hello', expect: 'hello' },
]
`),h3({},"Async test"),Pre(`
import { promise } from '@magic/test'

export default [
  {
    fn: promise(cb => setTimeout(() => cb(null, true), 100)),
    expect: true,
    info: 'handle promises',
  },
]
`),h3({},"Deep equality"),Pre(`
import { is } from '@magic/test'

export default [
  {
    fn: () => ({ a: 1, b: 2 }),
    expect: is.deep.equal({ a: 1, b: 2 }),
    info: 'deep compare objects',
  },
]
`),h3({},"Mock function"),Pre(`
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
`),h2({id:"learn-more"},"Learn More"),ul([li([Link({to:"/getting-started/"},"Getting Started")," - install, setup, first test"]),li([Link({to:"/writing-tests/"},"Writing Tests")," - hooks, promises, types, multiple tests"]),li([Link({to:"/lib/"},"Utility Functions")," - deep, fs, curry, log, vals, env, http, mock, has"]),li([Link({to:"/svelte/"},"Svelte Testing")," - mount components, interact, assert"]),li([Link({to:"/svelte-4-vs-5/"},"Svelte 4 vs 5")," - feature comparison"]),li([Link({to:"/svelte-auto-export-faq/"},"Svelte Auto-Export FAQ")," - $state and $derived exports"]),li([Link({to:"/cli/"},"CLI & Usage")," - flags, sharding, performance tips"]),li([Link({to:"/cli-flags-reference/"},"CLI Flags Reference")," - detailed flag table"]),li([Link({to:"/cli-sharding-cheatsheet/"},"CLI Sharding Cheat-Sheet")," - CI/CD examples"]),li([Link({to:"/performance-tips/"},"Performance Tips")," - optimization techniques"]),li([Link({to:"/common-pitfalls/"},"Common Pitfalls")," - troubleshooting tips"]),li([Link({to:"/test-isolation/"},"Test Isolation")," - prevent state leakage between tests"]),li([Link({to:"/error-codes/"},"Error Codes")," - programmatic error handling"]),li([Link({to:"/error-codes-quicklook/"},"Error Codes Quick Look")," - quick reference table"]),li([Link({to:"/version-history/"},"Version History")," - release overview"]),li(Link({to:"/changelog/"},"Changelog")," - detailed release history")]),p(["This library tests itself. Have a look at ",Link({to:"https://github.com/magic/test/tree/master/test",text:"the tests"})," on GitHub."])],"/test/404/":()=>div("404 - not found."),"/test/changelog/":()=>[h1({id:"changelog"},"Changelog"),h2({},"0.3.25"),ul([li("expect: arrays with predicates — functions call with result, values compare directly, all must pass"),li("value checks in predicate arrays support primitives and objects (deep.equal)"),li("docs: predicates and values section in writing-tests")]),h2({},"0.3.34"),p("new documentation pages added"),h2({},"0.3.24"),p("unreleased"),h2({},"0.3.21"),ul([li("various build performance improvements, especially for svelte components"),li("add timing traces with MAGIC_TEST_TRACE env var and --trace CLI flag"),li("add promise-based caching via CacheManager"),li("consolidate worker pool into single source"),li("centralize caching in CacheManager at tsLoader level"),li("increase default test timeout to 30s"),li("fixed tsLoader .ts file handling"),li("add more tests for @magic/test itself"),li("implement persistent disk cache in node_modules/.magic-test-cache"),li("parallelize import resolution, barrel exports, and fs.exists checks"),li("cache fs.exists results, processImports results, and resolveViteAlias results"),li("skip writing unchanged files during compilation"),li("consolidate caches into single pendingPromises map"),li("update dependencies")]),h2({},"0.3.20"),ul([li("prevent double-compilation of svelte components"),li("update dependencies")]),h2({},"0.3.19"),ul([li("svelte edge cases"),li("custom test defines for globals")]),h2({},"0.3.18"),ul([li("better resolution for imported dependencies in tests"),li("especially <script> tags in svelte components that export functions/variables"),li("update dependencies")]),h2({},"0.3.17"),ul([li("better test discovery, had edge cases where tests were not found")]),h2({},"0.3.16"),ul([li("better kill handling for workers and child_process"),li("README fixes"),li("remove @systemkollektiv devDependencies"),li("update dependencies")]),h2({},"0.3.15"),ul([li("fix import of .svelte.js/.ts files if js/ts extension is omitted")]),h2({},"0.3.14"),ul([li("fireEvent function now correctly handles various addEventListener event types")]),h2({},"0.3.13"),ul([li("update dependencies")]),h2({},"0.3.12"),ul([li("performance improvements, better checks if tests need to be isolated"),li("fix timing issues in isolation code"),li("replace regex code checks with ast checks"),li("add `has` functionality for object checks"),li("update dependencies")]),h2({},"0.3.10"),ul([li("fix more edge cases in svelte compilation steps"),li("add .css import support"),li("update dependencies")]),h2({},"0.3.9"),ul([li("fix imports of test/index.(mjs|ts|js) files")]),h2({},"0.3.8"),ul([li("add --workers flag to control max parallel workers (default: auto-detect CPU count)"),li("canvas polyfill works properly in happy-dom environment"),li("svelte: resolve svelte-only package exports"),li("svelte: fix import chain handling for components"),li("version: check if Lib is missing exports"),li("worker isolation: beforeAll and afterAll run in workers directly"),li("before fields in tests get awaited if they return a raw promise")]),h2({},"0.3.7"),ul([li("advanced worker isolation"),li("executing minimum number of needed workers for tests"),li("lots of internal changes to achieve this")]),h2({},"0.3.6"),p("broken - tried implementing better isolation"),h2({},"0.3.5"),ul([li("better tsLoader resolve mechanism")]),h2({},"0.3.4"),ul([li("also run registerLoader in workers")]),h2({},"0.3.3"),ul([li("replace all import .ts with .js"),li("some test output fixes")]),h2({},"0.3.2"),p("broken: some .ts references for worker.ts and unit.ts"),ul([li("publish dist dir with .js files for consumers")]),h2({},"0.3.1"),p("broken, dist dir missing"),h2({},"0.3.0"),p("broken. node can not strip types in node_modules..."),ul([li("added html support (using happy-dom, experimental!)"),li("added svelte support (experimental!)"),li("various improvements to test logic and structure of internal lib"),li("more tests")]),h2({},"0.2.30"),ul([li("allow tests to be written using typescript, .ts files can be test files now"),li("add some internal tests"),li("update dependencies")]),h2({},"0.2.29"),ul([li("update dependencies")]),h2({},"0.2.28"),ul([li("use node:module register function for loader"),li("allowing use of the --import flag instead of soon deprecated --loader")]),h2({},"0.2.27"),ul([li("allow resolving .js files as .ts files"),li("this mimics typescript .js file resolver"),li("update @types/node")]),h2({},"0.2.26"),ul([li("update dependencies")]),h2({},"0.2.25"),ul([li("update dependencies")]),h2({},"0.2.24"),ul([li("fix @magic/core tests on windows")]),h2({},"0.2.23"),ul([li("readd npm run prepublishOnly task"),li("update dependencies")]),h2({},"0.2.22"),ul([li("add comprehensive typescript types"),li("rework some functionality to be typesafe and typeguarded"),li("update dependencies")]),h2({},"0.2.21"),ul([li("update dependencies")]),h2({},"0.2.20"),ul([li("update dependencies")]),h2({},"0.2.19"),ul([li("update dependencies"),li("add unused http.post"),li("probably should replace http with fetch...")]),h2({},"0.2.18"),ul([li("add missing fs.statfs, fs.statfsSync and fs.promises.constants to test/spec"),li("update dependencies")]),h2({},"0.2.17"),ul([li("remove calls and coveralls-next, c8 takes care of coverage"),li("update dependencies")]),h2({},"0.2.16"),ul([li("update dependencies")]),h2({},"0.2.15"),ul([li("update dependencies"),li("percentage outputs print nicer numbers"),li("added http export that allows http requests in tests"),li("only supports get requests for now")]),h2({},"0.2.14"),ul([li("update dependencies")]),h2({},"0.2.13"),ul([li("update dependencies")]),h2({},"0.2.12"),ul([li("update dependencies")]),h2({},"0.2.11"),ul([li("update dependencies")]),h2({},"0.2.10"),ul([li("@magic/test can now test @magic/core again")]),h2({},"0.2.9"),ul([li("update dependencies")]),h2({},"0.2.8"),ul([li("update dependencies")]),h2({},"0.2.7"),ul([li("update dependencies"),li("replace coveralls with coveralls-next")]),h2({},"0.2.6"),ul([li("update dependencies")]),h2({},"0.2.5"),ul([li("update dependencies")]),h2({},"0.2.54"),ul([li("update dependencies")]),h2({},"0.2.52"),ul([li("update dependencies"),li("remove hyperapp from exports")]),h2({},"0.2.51"),ul([li("update dependencies")]),h2({},"0.2.50"),ul([li("remove @magic/css export"),li("update c8")]),h2({},"0.2.49"),ul([li("update @magic/css")]),h2({},"0.2.48"),ul([li("bump required node version to 14.2.0"),li("update dependencies")]),h2({},"0.2.47"),ul([li("update c8, yargs-parser")]),h2({},"0.2.46"),ul([li("update @magic/css")]),h2({},"0.2.45"),ul([li("security fix: update dependencies, yargs-parser")]),h2({},"0.2.44"),ul([li("update dependencies")]),h2({},"0.2.43"),ul([li("update dependencies")]),h2({},"0.2.42"),ul([li("update dependencies")]),h2({},"0.2.41"),ul([li("update dependencies")]),h2({},"0.2.40"),ul([li("update dependencies")]),h2({},"0.2.39"),ul([li("update coveralls, fix minimist issue above")]),h2({},"0.2.38"),ul([li("update dependencies, minimist sec issue")]),h2({},"0.2.37"),ul([li("fix: arguments for both node and c8 tests work"),li("broken in 0.1.36")]),h2({},"0.2.36"),ul([li("c8: --exclude, --include and --all get applied correctly")]),h2({},"0.2.35"),ul([li("fix: c8 errored if coverage dir did not exist"),li("update dependencies")]),h2({},"0.2.34"),ul([li('fix: c8 needs "report" command now')]),h2({},"0.2.33"),ul([li("update exported dependencies")]),h2({},"0.2.32"),ul([li("tests now work on windows"),li("uncaught errors will cause tests to fail with process.exit(1)")]),h2({},"0.2.31"),ul([li("update dependencies")]),h2({},"0.2.30"),ul([li("export @magic/fs")]),h2({},"0.2.29"),ul([li("help text can show up when --help is used")]),h2({},"0.2.28"),ul([li("package: engineStrict: true"),li("update cli: missing @magic/cases dependency")]),h2({},"0.2.27"),ul([li("remove prettier from deps")]),h2({},"0.2.26"),ul([li("remove commonjs support"),li("node 13+ required. awesome.")]),h2({},"0.2.25"),ul([li("currying now throws errors instead of returning them"),li("update @magic/css"),li("update @magic/types which now uses @magic/deep for is.deep.eq and is.deep.diff")]),h2({},"0.2.24"),ul([li("update @magic/css"),li("update c8")]),h2({},"0.2.23"),ul([li("update @magic dependencies to use npm packages instead of github")]),h2({},"0.2.22"),ul([li("update dependencies")]),h2({},"0.2.21"),ul([li("update @magic/cli to allow default args")]),h2({},"0.2.20"),ul([li("update broken dependencies")]),h2({},"0.2.19"),ul([li("update dependencies")]),h2({},"0.2.18"),ul([li("update dependencies"),li("require node 12.13.0")]),h2({},"0.2.17"),ul([li("add node 13 json support for coverage reports")]),h2({},"0.2.15"),ul([li("update dependencies")]),h2({},"0.2.14"),ul([li("windows support now supports index.js files that provide test structure")]),h2({},"0.2.13"),ul([li("windows support is back")]),h2({},"0.2.12"),ul([li("update dependencies")]),h2({},"0.2.11"),ul([li("update prettier, coveralls"),li("add and export @magic/css to test css validity")]),h2({},"0.2.10"),ul([li("node 12.4.0 does not use --experimental-json-modules flag"),li("removed it in 12.4+")]),h2({},"0.2.9"),ul([li("test/beforeAll.js gets loaded separately if it exists"),li("test/afterAll.js gets loaded separately if it exists"),li("if the function exported from test/beforeAll.js returns another function, it will also be executed after all tests"),li("export hyperapp beta 18")]),h2({},"0.2.8"),ul([li("update @magic/cli")]),h2({},"0.2.7"),ul([li("readded calls npm run script"),li("updated c8")]),h2({},"0.2.6"),ul([li("update this readme and html docs"),li("tests should always process.exit(1) if they errored")]),h2({},"0.2.5"),ul([li("use ecmascript version of @magic/deep")]),h2({},"0.2.4"),ul([li("npm run scripts of @magic/test itself can be run on windows")]),h2({},"0.2.3"),ul([li("cli now works everywhere")]),h2({},"0.2.2"),ul([li("cli now works on windows again"),p("(actually, this version is broken on all platforms)")]),h2({},"0.2.1"),ul([li("rework of bin scripts and update dependencies to esmodules")]),h2({},"0.1.0"),ul([li("use esmodules instead of commonjs")])],"/test/cli-flags-reference/":()=>[h1({id:"cli-flags-reference"},"CLI Flags Reference"),p("Available command-line flags for @magic/test:"),h2({},"Flag Reference Table"),Pre('| Flag | Aliases | Default | Env Var | Description | Example |\n| :--- | :----- | :-----: | :------ | :---------- | :------ |\n| -p, --production, --prod |  |  |  | Run tests without coverage (faster) | t -p |\n| -l, --verbose, --loud |  |  |  | Show detailed output including passing tests | t -l |\n| -i, --include |  |  |  | Files to include in coverage | t -i "src/*.js" |\n| -e, --exclude |  |  |  | Files to exclude from coverage | t -e "src/test.js" |\n| --shards N |  |  |  | Total number of shards to split tests across | t --shards 4 --shard-id 0 |\n| --shard-id N |  |  |  | Shard ID (0-indexed) to run | t --shards 4 --shard-id 2 |\n| -w, --workers N |  | auto |  | Max parallel workers (default: auto-detect CPU count) | t -p --workers 2 |\n| --help |  |  |  | Show help text | t --help |\n| --trace |  |  | MAGIC_TEST_TRACE | Enable timing traces for performance debugging | t --trace |'),h2({},"Flag Notes"),ul([li("--shards and --shard-id must be used together"),li("--shard-id is 0-indexed (0 to N-1)"),li("Use -p flag for faster development runs (no coverage)"),li("--workers controls parallel test execution")]),h2({},"Example Usage"),h3({},"Basic Test Run"),Pre(`
npm test  # runs with coverage

npm test  # runs without coverage (faster)
`),h3({},"Shard Large Test Suite"),Pre(`
# Run 4 shards, this is shard 0 (of 0-3)
t --shards 4 --shard-id 0

# Run shard 1
t --shards 4 --shard-id 1

# Combine with other flags
t -p --shards 4 --shard-id 2 --workers 2
`),h2({},"See Also"),ul([li([Link({to:"/cli/"},"CLI & Usage")," - detailed usage guide"]),li([Link({to:"/performance-tips/"},"Performance Tips")," - optimization techniques"]),li([Link({to:"/cli-sharding-cheatsheet/"},"CLI Sharding Cheat-Sheet")," - CI/CD examples"])])],"/test/cli-sharding-cheatsheet/":()=>[h1({id:"cli-sharding-cheatsheet"},"CLI Sharding Cheat-Sheet"),p("Run tests in parallel across multiple processes to speed up large test suites:"),h2({},"Basic Sharding Commands"),Pre(`
# Run 4 shards, this is shard 0 (of 0-3)
t --shards 4 --shard-id 0

# Run shard 1
t --shards 4 --shard-id 1

# Run shard 2
t --shards 4 --shard-id 2

# Run shard 3
t --shards 4 --shard-id 3
`),p(["Tests are distributed deterministically using a hash of the test file path,"," ensuring each test always runs in the same shard."]),h2({},"Combine with Other Flags"),Pre(`
# Run with production mode (no coverage)
t -p --shards 4 --shard-id 2

# Add verbose output
t -l --shards 4 --shard-id 1

# Custom worker count
t --shards 4 --shard-id 0 --workers 2
`),h2({},"Package.json for CI/CD"),p("Add these scripts to your package.json:"),Pre(`
{
  "scripts": {
    "test": "t -p",
    "test:shard:0": "t -p --shards 4 --shard-id 0",
    "test:shard:1": "t -p --shards 4 --shard-id 1",
    "test:shard:2": "t -p --shards 4 --shard-id 2",
    "test:shard:3": "t -p --shards 4 --shard-id 3"
  }
}
`),h2({},"Run All Shards in Parallel"),p("Use a single command to run all shards in parallel:"),Pre(`
# Run all 4 shards in parallel and wait for all to complete
npm run test:shard:0 & npm run test:shard:1 & npm run test:shard:2 & npm run test:shard:3 & wait
`),p("Or with production mode:"),Pre(`
npm run test:shard:0 & npm run test:shard:1 & npm run test:shard:2 & npm run test:shard:3 & wait
`),h2({},"Deterministic Distribution"),p(["Test distribution is deterministic - the same test file will always run in the same shard."," This ensures consistent behavior across CI runs."]),h2({},"See Also"),ul([li([Link({to:"/cli/"},"CLI & Usage")," - full CLI documentation"]),li([Link({to:"/cli-flags-reference/"},"CLI Flags Reference")," - detailed flag list"]),li([Link({to:"/performance-tips/"},"Performance Tips")," - optimization techniques"])])],"/test/cli/":()=>[h1({id:"cli"},"CLI & Usage"),h2({id:"cli-packagejson"},"package.json (recommended)"),p("Add the magic/test bin scripts to package.json:"),Pre(`
{
  "scripts": {
    "test": "t -p",
    "coverage": "t",
  },
  "devDependencies": {
    "@magic/test": "github:magic/test"
  }
}
`),p("Then use the npm run scripts:"),Pre(`
npm test
npm run coverage
`),h2({id:"cli-global"},"Globally (not recommended)"),p(["You can install this library globally,"," but the recommendation is to add the dependency and scripts to the package.json file."]),p(["This both explains to everyone that your app has these dependencies"," as well as keeping your bash free of clutter."]),Pre(`
npm i -g @magic/test

// run tests in production mode
t -p

// run tests and get coverage in verbose mode
t
`),h2({id:"cli-flags"},"CLI Flags"),p("Available command-line flags:"),ul([li("-p, --production, --prod - Run tests without coverage (faster)"),li("-l, --verbose, --loud - Show detailed output including passing tests"),li("-i, --include - Files to include in coverage"),li("-e, --exclude - Files to exclude from coverage"),li("--shards N - Total number of shards to split tests across"),li("--shard-id N - Shard ID (0-indexed) to run"),li("-w, --workers N - Max parallel workers (default: auto)"),li("--help - Show help text")]),p(["Note: `--shards` and `--shard-id` must be used together."," `--shard-id` is 0-indexed (0 to N-1)."]),h2({id:"sharding"},"Sharding Tests"),p("Run tests in parallel across multiple processes to speed up large test suites:"),Pre(`
# Run 4 shards, this is shard 0 (of 0-3)
t --shards 4 --shard-id 0

# Run shard 1
t --shards 4 --shard-id 1

# Combine with other flags
t -p --shards 4 --shard-id 2
`),p(["Tests are distributed deterministically using a hash of the test file path,"," ensuring each test always runs in the same shard."]),p("Add to your package.json for CI/CD:"),Pre(`
{
  "scripts": {
    "test": "t -p",
    "test:shard:0": "t -p --shards 4 --shard-id 0",
    "test:shard:1": "t -p --shards 4 --shard-id 1",
    "test:shard:2": "t -p --shards 4 --shard-id 2",
    "test:shard:3": "t -p --shards 4 --shard-id 3"
  }
}
`),p("Or use a single command to run all shards in parallel:"),Pre(`
# Run all 4 shards in parallel and wait for all to complete
npm run test:shard:0 & npm run test:shard:1 & npm run test:shard:2 & npm run test:shard:3 & wait
`),h2({id:"exit-codes"},"Exit Codes"),p("@magic/test returns specific exit codes to indicate test results:"),p("| Exit Code | Meaning |"),p("| --------- | ------- |"),p("| 0 | All tests passed |"),p("| 1 | One or more tests failed |"),Pre(`
# Run tests and check exit code
npm test
echo "Exit code: $?"  # 0 = success, 1 = failure
`),h2({id:"verbose-output"},"Verbose Output"),p("The -l (or --verbose, --loud) flag enables detailed output:"),Pre(`
# Shows all tests including passing ones
t -l
`),p("What verbose mode shows:"),ul([li("All test results (not just failures)"),li("Individual test execution time"),li("Full test names with suite hierarchy"),li("Detailed error messages with stack traces")]),p("Default mode (without -l):"),ul([li("Only shows failing tests"),li("Shows summary only for passing suites"),li("Faster output for large test suites")]),p("Example output without -l:"),Pre(`
### Testing package: my-lib
/addition.js => Pass: 3/3 100%
/multiplication.js => Pass: 4/4 100%
Ran 7 tests in 12ms. Passed 7/7 100%
`),p("Example output with -l:"),Pre(`
### Testing package: my-lib
▶ addition
  ✔ adds two positive numbers (1.2ms)
  ✔ handles zero correctly (0.8ms)
  ✔ handles negative numbers (0.9ms)
▶ multiplication
  ✔ multiplies by zero (0.7ms)
  ✔ multiplies by one (0.6ms)
  ✔ multiplies two positives (0.8ms)
  ✔ handles negative numbers (0.9ms)
Ran 7 tests in 12ms. Passed 7/7 100%
`),h2({id:"performance-tips"},"Performance Tips"),p(["For a detailed guide, see the ",Link({to:"/performance-tips/"},"Performance Tips")," page."]),h3({},"Quick Reference"),Pre(`
# Fast mode - no coverage
t -p

# Shard across 4 processes
t --shards 4 --shard-id 0
`),h2({id:"common-pitfalls"},"Common Pitfalls"),p(["For a detailed guide, see the ",Link({to:"/common-pitfalls/"},"Common Pitfalls")," page."]),h3({},"Quick Reference"),p("Avoid these common mistakes:"),ul([li("Forgetting to return in async tests"),li("Not wrapping callback functions"),li("Mutating shared state between tests"),li("Using the wrong equality check"),li("Not awaiting async operations"),li("Incorrect hook usage")])],"/test/common-pitfalls/":()=>[h1({id:"common-pitfalls"},"Common Pitfalls"),p("Avoid these common mistakes when writing tests:"),h2({},"1. Forgetting to Return in Async Tests"),p(["The test finishes before the promise resolves. Always return the promise:"]),Pre(`
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
`),h2({},"2. Not Wrapping Callback Functions"),Pre(`
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
`),h2({},"3. Mutating Shared State Between Tests"),Pre(`
# Wrong: counter persists between tests
let counter = 0
export default [
  { fn: () => ++counter, expect: 1 },
  { fn: () => ++counter, expect: 2 }, // fails! counter is now 1
]

# Correct: use beforeEach to reset state
export default {
  beforeEach: () => { counter = 0 },
  tests: [
    { fn: () => ++counter, expect: 1 },
    { fn: () => ++counter, expect: 1 }, // passes - reset before each
  ],
}
`),h2({},"4. Using the Wrong Equality Check"),Pre(`
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
`),h2({},"5. Not Awaiting Async Operations"),Pre(`
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
`),h2({},"6. Incorrect Hook Usage"),Pre(`
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
`)],"/test/error-codes-quicklook/":()=>[h1({id:"error-codes-quicklook"},"Error Codes Quick Look"),p("Quick reference for @magic/test error codes. Import from `@magic/test`:"),Pre(`
import { ERRORS, createError } from '@magic/test'
`),h2({},"Error Codes Reference Table"),Pre('| Code | Description | Example Usage |\n| :--- | :---------- | :------------ |\n| ERRORS.E_EMPTY_SUITE | Test suite is not exporting any tests | createError(ERRORS.E_EMPTY_SUITE, "Empty test suite") |\n| ERRORS.E_RUN_SUITE_UNKNOWN | Unknown error occurred while running a suite | createError(ERRORS.E_RUN_SUITE_UNKNOWN, "Unexpected execution error") |\n| ERRORS.E_TEST_NO_FN | Test object is missing the `fn` property | createError(ERRORS.E_TEST_NO_FN, "Missing test function") |\n| ERRORS.E_TEST_EXPECT | Test expectation failed | createError(ERRORS.E_TEST_EXPECT, "Expected value does not match") |\n| ERRORS.E_TEST_BEFORE | Before hook failed | createError(ERRORS.E_TEST_BEFORE, "Setup hook threw error") |\n| ERRORS.E_TEST_AFTER | After hook failed | createError(ERRORS.E_TEST_AFTER, "Cleanup hook threw error") |\n| ERRORS.E_TEST_FN | Test function threw an error | createError(ERRORS.E_TEST_FN, "Test function crashed") |\n| ERRORS.E_NO_TESTS | No test suites found | createError(ERRORS.E_NO_TESTS, "No test files discovered") |\n| ERRORS.E_IMPORT | Failed to import a test file | createError(ERRORS.E_IMPORT, "Cannot resolve test file path") |\n| ERRORS.E_MAGIC_TEST | General test execution error | createError(ERRORS.E_MAGIC_TEST, "Internal test runner error") |'),h2({},"Usage Example"),p("Create custom errors with specific codes and messages:"),Pre(`
import { createError, ERRORS } from '@magic/test'

export default [
  {
    fn: () => createError(ERRORS.E_TEST_NO_FN, 'Missing fn property'),
    expect: e => e.code === 'E_TEST_NO_FN' && e.message === 'Missing fn property',
    info: 'createError creates errors with code and message',
  },
]
`),h2({},"Error Object Properties"),ul([li('code - The error code string (e.g., "E_TEST_NO_FN")'),li("message - Human-readable error message"),li("stack - Stack trace for debugging")]),p("See also: "),[Link({to:"/error-codes/"},"Full Error Codes Reference")]],"/test/error-codes/":()=>[h1({id:"error-codes"},"Error Codes"),p(["@magic/test uses error codes to help with debugging and programmatic error handling."," You can import these constants from `@magic/test`:"]),Pre(`
import { ERRORS, createError } from '@magic/test'
`),h2({},"Available Error Codes"),p("| Code | Description |"),p("| ---- | ----------- |"),p("| ERRORS.E_EMPTY_SUITE | Test suite is not exporting any tests |"),p("| ERRORS.E_RUN_SUITE_UNKNOWN | Unknown error occurred while running a suite |"),p("| ERRORS.E_TEST_NO_FN | Test object is missing the `fn` property |"),p("| ERRORS.E_TEST_EXPECT | Test expectation failed |"),p("| ERRORS.E_TEST_BEFORE | Before hook failed |"),p("| ERRORS.E_TEST_AFTER | After hook failed |"),p("| ERRORS.E_TEST_FN | Test function threw an error |"),p("| ERRORS.E_NO_TESTS | No test suites found |"),p("| ERRORS.E_IMPORT | Failed to import a test file |"),p("| ERRORS.E_MAGIC_TEST | General test execution error |"),h2({},"createError"),p("Create custom errors with specific codes and messages:"),Pre(`
import { createError, ERRORS } from '@magic/test'

export default [
  {
    fn: () => createError(ERRORS.E_TEST_NO_FN, 'Missing fn property'),
    expect: e => e.code === 'E_TEST_NO_FN' && e.message === 'Missing fn property',
    info: 'createError creates errors with code and message',
  },
]
`),h2({},"Usage Example"),Pre(`
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
`),h2({},"Error Object Properties"),ul([li('code - The error code string (e.g., "E_TEST_NO_FN")'),li("message - Human-readable error message"),li("stack - Stack trace for debugging")])],"/test/getting-started/":()=>[h1({id:"getting-started"},"Getting Started"),p("Be in a nodejs project."),h2({},"Install"),Pre({lines:"false"},"npm i --save-dev --save-exact @magic/test"),h2({},"Create a Test File"),p(["Create a test file in the ","test/"," directory. The filename is used in test output, and the path should mirror your source structure:"]),Pre(`
// test/yourFileToTest.js
export default [
  { fn: () => true, expect: true, info: 'true is true' },
  { fn: () => 1 + 1, expect: 2, info: 'basic math' },
]
`),p(["Note: the test function is called automatically. ","expect: true ","is optional."]),h2({},"Add npm Scripts"),p("Add test scripts to your package.json:"),Pre(`
{
  "scripts": {
    "test": "t -p",
    "coverage": "t"
  }
}
`),p(["t -p ","runs tests in production mode (no coverage, faster). ","t"," runs with coverage."]),h2({},"Run Tests"),Pre(`
npm test
`),h2({},"Example Output"),Pre(`
### Testing package: @magic/test
Ran 2 tests. Passed 2/2 100%
`),p("Faster output from a bigger project:"),Pre(`
### Testing package: @artificialmuseum/engine
Ran 90307 tests in 274.5ms. Passed 90307/90307 100%
`),h2({id:"next-steps"},"Next Steps"),ul([li([Link({to:"/writing-tests/"},"Writing Tests")," - hooks, promises, types, multiple tests"]),li([Link({to:"/lib/"},"Utility Functions")," - deep, fs, curry, log, vals, env, http, mock, has"]),li([Link({to:"/svelte/"},"Svelte Testing")," - mount components, interact, assert"]),li([Link({to:"/cli/"},"CLI & Usage")," - flags, sharding, performance tips"]),li([Link({to:"/test-isolation/"},"Test Isolation")," - prevent state leakage between tests"]),li([Link({to:"/error-codes/"},"Error Codes")," - programmatic error handling"])])],"/test/lib/":e=>[h1({id:"lib"},"Utility Belt"),p(["@magic/test exports some utility functions"," that make working with complex test workflows simpler."]),h2({id:"lib-deep"},"deep"),p(["Exported from ",Link({to:"https://github.com/magic/deep",text:"@magic/deep"}),", deep equality and comparison utilities."]),Pre(`
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
`),p("Available functions:"),ul([li("deep.equal(a, b) - deep equality check"),li("deep.different(a, b) - deep difference check"),li("deep.contains(container, item) - deep inclusion check"),li("deep.changes(a, b) - get differences between objects")]),h2({id:"lib-fs"},"fs"),p(["Exported from ",Link({to:"https://github.com/magic/fs",text:"@magic/fs"}),", file system utilities."]),Pre(`
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
`),p("Common methods:"),ul([li("fs.readFile(path, encoding) - read file content"),li("fs.writeFile(path, data) - write file content"),li("fs.exists(path) - check if file exists"),li("fs.mkdir(path, options) - create directory"),li("fs.rmdir(path) - remove directory"),li("fs.stat(path) - get file stats"),li("fs.readdir(path) - read directory contents"),li("Plus async versions in fs.promises")]),h2({id:"lib-curry"},"curry"),p(["Currying can be used to split the arguments of a function into multiple nested functions."," This helps if you have a function with complicated arguments that you just want to quickly shim."]),Pre(`
import { curry } from '@magic/test'

const compare = (a, b) => a === b
const curried = curry(compare)
const shimmed = curried('shimmed_value')

export default {
  fn: shimmed('shimmed_value'),
  expect: true,
  info: 'expect will be called with a and b and a will equal b',
}
`),h2({id:"lib-log"},"log"),p("Logging utility for test output. Colors supported automatically."),Pre(`
import { log } from '@magic/test'

log.debug('Debug info')
log.info('Something happened')
log.warn('Heads up')
log.error('Something went wrong')
log.critical('Game over')
`),p("Supports multiple arguments:"),Pre(`
log.info('Testing', library, 'at version', version)
`),h2({id:"lib-vals"},"vals"),p(["Exports JavaScript type constants for testing against any value."," Useful for fuzzing and property-based testing."]),Pre(`
import { vals, is } from '@magic/test'

export default [
  { fn: () => 'test', expect: is.string, info: 'test if value is a string' },
  { fn: () => vals.true, expect: true, info: 'boolean true value' },
  { fn: () => vals.email, expect: is.email, info: 'valid email format' },
  { fn: () => vals.error, expect: is.error, info: 'error instance' },
]
`),p("Available Constants:"),ul([li("Primitives: true, false, number, num, float, int, string, str"),li("Empty values: nil, emptystr, emptyobject, emptyarray, undef"),li("Collections: array, object, obj"),li("Time: date, time"),li("Errors: error, err"),li("Colors: rgb, rgba, hex3, hex6, hexa4, hexa8"),li("Other: func, truthy, falsy, email, regexp")]),h2({id:"lib-env"},"env"),p("Environment detection utilities for conditional test behavior."),p("Available utilities:"),ul([li("isNodeProd - checks if NODE_ENV is set to production"),li("isNodeDev - checks if NODE_ENV is set to development"),li("isProd - checks if -p flag is passed to the CLI"),li("isVerbose - checks if -l flag is passed to the CLI"),li("getErrorLength - returns error length limit from MAGIC_TEST_ERROR_LENGTH env var (0 = unlimited)")]),Pre(`
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
    expect: 70,
    info: 'get error length limit',
  },
]
`),h3({id:"lib-env-constants"},"Environment Constants"),p("These boolean constants reflect the current NODE_ENV:"),Pre(`
import { isProd, isTest, isDev } from '@magic/test'

export default [
  { fn: isProd, expect: process.env.NODE_ENV === 'production' },
  { fn: isTest, expect: process.env.NODE_ENV === 'test' },
  { fn: isDev, expect: process.env.NODE_ENV === 'development' },
]
`),h2({id:"lib-promises"},"promises"),p(["Helper function to wrap nodejs callback functions and promises with ease."," Handles the try/catch steps internally and returns a resolved or rejected promise."]),Pre(`
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
`),h2({id:"lib-http"},"http"),p("HTTP utility for making requests in tests. Supports both HTTP and HTTPS."),Pre(`
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
`),p("Error Handling:"),Pre(`
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
`),p("Note: HTTP module automatically handles:"),ul([li("Protocol detection (HTTP vs HTTPS)"),li("JSON parsing for responses with Content-Type: application/json"),li("Raw string returns for non-JSON responses"),li("rejectUnauthorized: false for self-signed certificates")]),h3({},"HttpOptions"),Pre(`
import type { HttpOptions } from '@magic/test'
`),p("| Option | Type | Default | Description |"),p("| ------ | ---- | ------- | ----------- |"),p("| timeout | number | 30000 | Request timeout in milliseconds |"),p("| rejectUnauthorized | boolean | true | Reject self-signed certs |"),p("| maxSize | number | - | Maximum response size in bytes |"),p("| requestOptions | RequestOptions | - | Additional request options |"),h2({id:"lib-trycatch"},"trycatch"),p("allows to catch and test functions without bubbling the errors up into the runtime"),Pre(`
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
`),h2({id:"lib-error"},"error"),p(["exports ",Link({to:"https://github.com/magic/error",text:"@magic/error"})," which returns errors with optional names."]),Pre(`
import { error } from '@magic/test'

export default [
  {
    fn: tryCatch(error('Message', 'E_NAME')),
    expect: e => e.name === 'E_NAME' && e.message === 'Message',
    info: 'Errors have messages and (optional) names.',
  },
]
`),h2({id:"lib-mock"},"mock"),p("Mock and spy utilities for function testing."),Pre(`
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
`),h3({},"mock.fn properties"),ul([li("calls - Array of all call arguments"),li("returns - Array of all return values"),li("errors - Array of all thrown errors (null for non-throwing calls)"),li("callCount - Number of times called")]),h3({},"mock.fn methods"),ul([li("mockReturnValue(value) - Set return value (chainable)"),li("mockThrow(error) - Set error to throw (chainable)"),li("getCalls() - Get all call arguments"),li("getReturns() - Get all return values"),li("getErrors() - Get all thrown errors")]),h3({id:"lib-mock-log"},"mock.log"),p("Logging utilities that respect NODE_ENV for conditional output:"),Pre(`
import { mock } from '@magic/test'

mock.log.log('Debug info')      // Logs if not NODE_ENV=production
mock.log.warn('Heads up')       // Logs if not NODE_ENV=production
mock.log.error('Something went wrong')  // Always logs
mock.log.time('operation')     // Logs timing if not NODE_ENV=production
mock.log.timeEnd('operation')   // Logs timing end if not NODE_ENV=production
`),h2({id:"lib-has"},"has"),p(["Functions for asserting object properties without needing explicit type annotations"," or stringifying functions."]),Pre(`
import { has, is } from '@magic/test'
`),h3({},"has.property(key, check)"),p("Check a single property. Accepts either a predicate or a literal value."),Pre(`
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
`),h3({},"has.properties(spec)"),p("Check multiple properties. Mix predicates and literal values."),Pre(`
{
  fn: () => getUser(),
  expect: has.properties({ name: is.string, age: is.num }),
  info: 'user has required properties',
}
`),h3({},"has.any(spec)"),p("Check at least one property matches. Accepts predicates or literals."),Pre(`
{
  fn: () => parseResult(),
  expect: has.any({ error: is.error, data: is.object }),
  info: 'result has either error or data',
}
`),h3({},"has.nested(path, predicate)"),p("Check a nested property path."),Pre(`
{
  fn: () => getData(),
  expect: has.nested('user.profile.name', is.string),
  info: 'deep nested property exists',
}
`),h3({},"has.string(substring)"),p("Check if value is a string containing substring."),Pre(`
{
  fn: () => error.message,
  expect: has.string('failed to connect'),
  info: 'error message contains helpful context',
}
`),h3({},"has.key(keyName)"),p("Check if object has a specific key."),h3({},"has.keys(keyNames[])"),p("Check if object has all specified keys."),h3({},"has.includes(item)"),p("Check if array or string contains item (uses deep.equal for arrays)."),h3({},"has.oneOf(options[])"),p("Check if value equals one of the options (uses deep.equal)."),h3({},"has.matches(regex)"),p("Check if string matches regex pattern."),h2({id:"lib-version"},"version"),p(["The version plugin checks your code according to a spec defined by you."," This is designed to warn you on changes to your exports."]),p(["Internally, the version function calls ",Link({to:"https://github.com/magic/types",text:"@magic/types"})," and all functions exported from it are valid type strings in version specs."]),Pre(`
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
`),p(["Using `['obj', false]` in a spec will test that the parent is an object"," without checking the key/value pairs inside."]),h2({id:"lib-dom"},"DOM Environment"),p(["@magic/test automatically initializes a DOM environment when imported,"," making browser APIs available in Node.js."]),h3({},"Available globals"),ul([li("Core: document, window, self, navigator, location, history"),li("DOM types: Node, Element, HTMLElement, SVGElement, Document, DocumentFragment"),li("Events: Event, CustomEvent, MouseEvent, KeyboardEvent, InputEvent, TouchEvent, PointerEvent"),li("Forms: FormData, File, FileList, Blob"),li("Networking: URL, URLSearchParams, XMLHttpRequest, fetch, WebSocket"),li("Storage: Storage, sessionStorage, localStorage"),li("Observers: MutationObserver, IntersectionObserver, ResizeObserver"),li("Timers: setTimeout, setInterval, requestAnimationFrame")]),h3({},"DOM Utilities"),Pre(`
import { initDOM, getDocument, getWindow } from '@magic/test'

// Get the document and window instances
const doc = getDocument()
const win = getWindow()

// Manually re-initialize if needed
initDOM()
`),h3({},"Canvas/Image Polyfills"),ul([li("new Image() - Parses PNG data URLs to extract dimensions"),li('canvas.getContext("2d") - Returns node-canvas context'),li("canvas.toDataURL() - Serializes canvas to data URL")])],"/test/performance-tips/":()=>[h1({id:"performance-tips"},"Performance Tips"),p("Follow these tips to get the most out of @magic/test:"),h2({},"Use the -p Flag"),p(["Run tests in production mode to skip coverage and get faster output:"]),Pre(`
# Fast mode - no coverage, only shows failures
npm test
# or
t -p
`),h2({},"Shard Large Test Suites"),p(["Split tests across multiple processes to speed up large suites:"]),Pre(`
# Split tests across 4 processes
t --shards 4 --shard-id 0
`),p(["Tests are distributed deterministically using a hash of the test file path."]),h2({},"Minimize Async Overhead"),p(["Async tests are slower than sync tests. Use sync where possible:"]),Pre(`
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
`),h2({},"Use Local State Instead of Globals"),p(["Global state requires isolation overhead. Local state is naturally isolated:"]),Pre(`
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
`),h2({},"Batch Related Tests"),p(["Single suite with multiple tests is faster than multiple suites:"]),Pre(`
# Faster: single suite with multiple tests
export default [
  { fn: () => add(1, 2), expect: 3 },
  { fn: () => add(0, 0), expect: 0 },
  { fn: () => add(-1, 1), expect: 0 },
]
`),h2({},"Worker Concurrency"),p(["Control max parallel workers with the"," --workers ","flag. Default is auto-detect CPU count:"]),Pre(`
# Use 2 workers
t -p --workers 2
`),p(["Link: ",Link({to:"/cli/"},"CLI & Usage")," for full flag reference."])],"/test/svelte-4-vs-5/":()=>[h1({id:"svelte-4-vs-5"},"Svelte 4 vs 5"),p(["Testing Svelte components with @magic/test has different"," capabilities depending on the Svelte version."]),h2({},"Feature Comparison"),Pre(`
| Feature | Svelte 4 | Svelte 5 |
| :------ | :------: | :------: |
| Component mounting | ✅ | ✅ |
| Component interaction | ✅ | ✅ |
| Auto-export ($state/$derived) | ❌ | ✅ |
| Runes | ❌ | ✅ |
| compileSvelte | ✅ | ✅ |
| createStaticPage | ✅ | ✅ |
| SvelteKit mocks | ✅ | ✅ |
`),h2({},"What Works in Both"),ul([li("Mounting components with mount()"),li("Component interaction via events (click, input, etc.)"),li("HTML assertions with html() and text()"),li("compileSvelte for source compilation"),li("createStaticPage for SvelteKit testing")]),h2({},"Svelte 5 Only"),ul([li("Auto-export of $state and $derived runes"),li("Rune-based reactivity")]),p(["Svelte 5 automatically exports $state and $derived variables,"," making them accessible in tests without manual exports."]),h2({},"Workarounds for Svelte 4"),p(["Svelte 4 does not support automatic export of reactive state."," To access component state in tests:"]),h3({},"Manual Export in Svelte 4"),Pre(`
<!-- Component.svelte -->
<script>
  export let count = 0;
</script>

<button on:click={() => count++}>
  {count}
</button>
`),Pre(`
import { mount } from '@magic/test'

export default [
  {
    component: './Component.svelte',
    fn: async ({ component }) => component.count,
    expect: 0,
    info: 'access exported count prop',
  },
]
`),h3({},"Svelte 5 Auto-Export"),Pre(`
<!-- Component.svelte (Svelte 5) -->
<script>
  let count = $state(0)
</script>

<button class="inc">+</button>
<span>{count}</span>
`),Pre(`
import { mount } from '@magic/test'

export default [
  {
    component: './Component.svelte',
    fn: async ({ component }) => component.count,  // works automatically!
    expect: 0,
    info: 'access $state without manual export',
  },
]
`),h2({},"See Also"),ul([li([Link({to:"/svelte/"},"Svelte Testing Guide")]),li([Link({to:"/svelte-auto-export-faq/"},"Svelte Auto-Export FAQ")])])],"/test/svelte-auto-export-faq/":()=>[h1({id:"svelte-auto-export-faq"},"Svelte Auto-Export FAQ"),h2({},"What is Auto-Export?"),p(["When testing Svelte 5 components, @magic/test automatically exports ","$state and $derived variables, making them accessible in tests"," without requiring manual exports from the component."]),h2({},"Why is it Svelte 5 Only?"),p(["The auto-export feature relies on Svelte 5 runes ($state, $derived),"," which use a different reactivity model from Svelte 4."," Svelte 5 compiles runes in a way that makes them discoverable"," at runtime, enabling automatic export during testing."]),p(["Svelte 4 uses a traditional prop-driven or script-tag state model"," that does not expose internal state the same way."]),h2({},"How to Manual-Export for Svelte 4"),p(["In Svelte 4, you must explicitly export variables to access them in tests:"]),Pre(`
<!-- Component.svelte -->
<script>
  export let count = 0;
  export function increment() {
    count++
  }
</script>

<button on:click={increment}>
  {count}
</button>
`),Pre(`
import { mount } from '@magic/test'

export default [
  {
    component: './Component.svelte',
    fn: ({ component }) => component.count,
    expect: 0,
    info: 'access exported count prop',
  },
]
`),h2({},"Examples"),h3({},"Svelte 5 - No Export Needed"),Pre(`
<!-- Component.svelte -->
<script>
  let count = $state(0)
  let doubled = $derived(count * 2)
</script>

<button class="inc">+</button>
<span>{doubled}</span>
`),p("Test - works automatically!"),Pre(`
import { mount } from '@magic/test'

export default [
  {
    component: './Component.svelte',
    fn: async ({ component }) => component.count,
    expect: 0,
    info: 'access $state without manual export',
  },
  {
    component: './Component.svelte',
    fn: async ({ component }) => component.doubled,
    expect: 0,
    info: 'access $derived without manual export',
  },
]
`),h2({},"See Also"),ul([li([Link({to:"/svelte/"},"Svelte Testing Guide")]),li([Link({to:"/svelte-4-vs-5/"},"Svelte 4 vs 5 Feature Comparison")])])],"/test/svelte/":()=>[h1({id:"svelte"},"Svelte Testing"),p(["@magic/test includes built-in support for testing Svelte 5 components."," It compiles Svelte components, mounts them in a DOM environment,"," and provides utilities for interacting with and asserting on component behavior."]),p(["Internally uses js-dom to create the DOM and HTML elements."]),h2({id:"lib-svelte"},"mount"),Pre(`
import { mount, html, tryCatch } from '@magic/test'

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
`),h3({},"Exported Functions"),ul([li("mount(filePath, options) - Mounts a Svelte component and returns { target, component, unmount }"),li("html(target) - Returns innerHTML of a mounted component's target element"),li("text(target) - Returns textContent of a target element"),li("component(instance) - Returns the component instance for accessing exported values"),li("props(target) - Returns an object of attribute name/value pairs from the target element")]),h3({},"Interaction Functions"),ul([li("click(target, selector?) - Clicks an element (optionally filtered by CSS selector)"),li("dblClick(target) - Double clicks"),li("contextMenu(target) - Right click"),li("mouseDown(target) - Mouse down"),li("mouseUp(target) - Mouse up"),li("mouseMove(target) - Mouse move"),li("mouseEnter(target) - Mouse enter"),li("mouseLeave(target) - Mouse leave"),li("mouseOver(target) - Mouse over"),li("mouseOut(target) - Mouse out"),li("keyDown(target, key) - Key down"),li("keyPress(target, key) - Key press"),li("keyUp(target, key) - Key up"),li("type(target, text) - Type text into input"),li("input(target, value) - Input value"),li("change(target, value) - Change event"),li("blur(target) - Blur event"),li("focus(target) - Focus event"),li("submit(target) - Submit form"),li("pointerDown(target) - Pointer down"),li("pointerUp(target) - Pointer up"),li("pointerMove(target) - Pointer move"),li("touchStart(target) - Touch start"),li("touchMove(target) - Touch move"),li("touchEnd(target) - Touch end"),li("copy(target) - Copy event"),li("cut(target) - Cut event"),li("paste(target) - Paste event"),li("dragStart(target) - Drag start"),li("drag(target) - Drag"),li("dragEnd(target) - Drag end"),li("dragEnter(target) - Drag enter"),li("dragLeave(target) - Drag leave"),li("dragOver(target) - Drag over"),li("drop(target) - Drop"),li("resize(target, w, h) - Resize"),li("scroll(target, x, y) - Scroll"),li("animationStart(target) - Animation start"),li("animationEnd(target) - Animation end"),li("transitionEnd(target) - Transition end"),li("play(target) - Play media"),li("pause(target) - Pause media"),li("trigger(target, eventType, options?) - Custom event"),li("checked(target) - Checkbox state")]),h3({},"Test Properties"),ul([li("component - Path to the .svelte file"),li("props - Props to pass to the component"),li("fn - Test function receiving { target, component, unmount }")]),h2({id:"svelte-state"},"Accessing Component State"),Pre(`
import { mount, html } from '@magic/test'

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
`),h2({id:"svelte-auto-export"},"Automatic Test Exports"),p(["When testing Svelte 5 components, @magic/test automatically exports ","$state and $derived variables, making them accessible in tests"," without requiring manual exports."]),p(["**Note:** This automatic export feature is specific to **Svelte 5** only."," Svelte 4 components do not have this capability."]),Pre(`
<!-- Component.svelte -->
<script>
  let count = $state(0)
  let doubled = $derived(count * 2)
  <!-- No export needed! -->
</script>

<button class="inc">+</button>
<span>{doubled}</span>
`),p("Test - works automatically!"),Pre(`
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
`),p("This works automatically for all $state and $derived runes. No configuration needed!"),h2({id:"svelte-error"},"Testing Error Handling"),Pre(`
import { mount, tryCatch } from '@magic/test'

const component = './src/lib/svelte/components/MyComponent.svelte'

export default [
  {
    fn: tryCatch(mount, component, { props: null }),
    expect: t => t.message === 'Props must be an object, got object',
    info: 'throws when props is null',
  },
]
`),h2({id:"lib-sveltekit-mocks"},"SvelteKit Mocks"),p("Mocks SvelteKit $app modules:"),Pre(`
import { browser, dev, prod, createStaticPage } from '@magic/test'

export default [
  {
    fn: () => browser, // true if in browser environment
    expect: false,
    info: 'not in browser by default',
  },
  {
    fn: () => dev, // true if in dev mode
    expect: process.env.NODE_ENV === 'development',
    info: 'dev reflects NODE_ENV',
  },
  {
    fn: () => prod, // true if in production mode
    expect: false,
    info: 'not in prod by default',
  },
]
`),h2({id:"lib-create-static-page"},"createStaticPage"),p("Creates a static page mock for SvelteKit testing:"),Pre(`
import { createStaticPage } from '@magic/test'

export default [
  {
    fn: createStaticPage,
    expect: t => typeof t.html === 'string' && typeof t.render === 'function',
    info: 'createStaticPage returns html string and render function',
  },
]
`),h2({id:"lib-compile-svelte"},"compileSvelte"),p("Compile Svelte component source to a module for testing:"),Pre(`
import { compileSvelte } from '@magic/test'

export default [
  {
    fn: async () => {
      const source = \`<button>Click</button>\`
      const { js, css } = compileSvelte(source, 'button.svelte')
      return js.code.includes('button') && css.code === ''
    },
    expect: true,
    info: 'compiles Svelte source to module',
  },
]
`),p("Available functions:"),ul([li("compileSvelte(source, filename) - Compiles Svelte source to JS/CSS modules"),li("ensureSvelte() - Lazy-loads the Svelte package, throws if not installed")]),h2({id:"svelte-ensure"},"ensureSvelte"),p("Lazy-loads the Svelte package. Throws if Svelte is not installed:"),Pre(`
import { ensureSvelte } from '@magic/test'

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
`)],"/test/test-isolation/":()=>[h1({id:"test-isolation"},"Test Isolation"),p(["@magic/test supports test isolation to prevent tests from affecting each other."," Tests in the same suite can share state, but you can isolate them:"]),Pre(`
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
`),h2({id:"isolate"},"__isolate"),p("Global Isolation Mode:"),p(["By default, tests in the same file share global state."," To enable strict isolation where each test gets a fresh environment,"," set `export const __isolate = true` at the top of your test file."]),Pre(`
export const __isolate = true

export default [
  { fn: () => (global.test = 1), expect: 1 },
  { fn: () => global.test === undefined, expect: true, info: 'fresh global state' },
]
`),p(["This ensures each test runs with a fresh global environment,"," preventing state leakage between tests."]),h2({},"Programmatic Detection"),p(["You can programmatically check if a suite requires isolation"," using the `suiteNeedsIsolation` utility:"]),Pre(`
import { suiteNeedsIsolation } from '@magic/test'

const needsIsolation = suiteNeedsIsolation(tests)
`),p("This is useful for custom runners or when building test tooling.")],"/test/version-history/":()=>[h1({id:"version-history"},"Version History"),h2({},"Quick Overview"),p(["Version history is automatically generated from the changelog."," This page provides a concise overview of what changed in each version."]),Pre(`
## @magic/test Versions

**0.3.34** - Current version (not yet released)

**0.3.25** - expect: arrays with predicates
  - functions call with result, values compare directly
  - all must pass
  - value checks support primitives and objects (deep.equal)
  - docs: predicates and values section in writing-tests

**0.3.24** - unreleased

**0.3.21** - various build performance improvements
  - especially for svelte components
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
  - update dependencies

**0.3.20** - prevent double-compilation of svelte components

**0.3.19** - svelte edge cases, custom test defines for globals

**0.3.18** - better resolution for imported dependencies in tests
  - especially <script> tags in svelte components that export functions/variables

**0.3.17** - update test discovery, fix edge cases where tests were not found

**0.3.16** - better kill handling for workers and child_process
  - README fixes
  - remove @systemkollektiv devDependencies

**0.3.15** - fix import of .svelte.js/.ts files if js/ts extension is omitted

**0.3.14** - fireEvent function now correctly handles various addEventListener event types

**0.3.13** - update dependencies

**0.3.12** - make svelte optional for consumers

**0.3.11** - performance improvements, better checks if tests need to be isolated
  - fix timing issues in isolation code
  - replace regex code checks with ast checks
  - add \`has\` functionality for object checks

**0.3.10** - fix more edge cases in svelte compilation steps
  - add .css import support

**0.3.9** - fix imports of test/index.(mjs|ts|js) files

**0.3.8** - add --workers flag, canvas polyfill, svelte fixes
  - advanced worker isolation
  - executing minimum number of needed workers for tests

**0.3.7** - advanced worker isolation
  - lots of internal changes to achieve this

**0.3.6** - broken - tried implementing better isolation

**0.3.5** - better tsLoader resolve mechanism

**0.3.4** - also run registerLoader in workers

**0.3.3** - replace all import .ts with .js, some test output fixes

**0.3.2** - node 12.4.0 - publish dist dir with .js files for consumers

**0.3.1** - broken, dist dir missing

**0.3.0** - broken. node can not strip types in node_modules... Added html support (using happy-dom, experimental!)

**0.2.30** - allow tests to be written using typescript

**0.2.29** - tryCatch: pass on empty args

**0.2.28** - use node:module register function for loader

**0.2.27** - allow resolving .js files as .ts files

**0.2.26** - update dependencies

**0.2.25** - currying now throws errors instead of returning them

**0.2.24** - fix @magic/core tests on windows

**0.2.23** - readd npm run prepublishOnly task

**0.2.22** - add comprehensive typescript types

**0.2.21** - update @magic/cli to allow default args

**0.2.20** - update broken dependencies

**0.2.19** - add unused http.post, probably should replace http with fetch...

**0.2.18** - add missing fs.statfs, fs.statfsSync and fs.promises.constants

**0.2.17** - remove calls and coveralls-next, c8 takes care of coverage

**0.2.16** - update dependencies

**0.2.15** - percentage outputs print nicer numbers
  - added http export that allows http requests in tests

**0.2.14** - update dependencies

**0.2.13** - update dependencies

**0.2.12** - update dependencies

**0.2.11** - update dependencies

**0.2.10** - @magic/test can now test @magic/core again

**0.2.9** - update dependencies

**0.2.8** - update dependencies

**0.2.7** - readded calls npm run script, updated c8

**0.2.6** - update this readme and html docs
  - tests should always process.exit(1) if they errored

**0.2.5** - use ecmascript version of @magic/deep

**0.2.4** - npm run scripts of @magic/test itself can be run on windows

**0.2.3** - update dependencies

**0.2.2** - spec values can be functions

**0.2.1** - internal restructuring

**0.2.0** - update dependencies

**0.1.77** - update dependencies

**0.1.76** - update dependencies

**0.1.75** - update dependencies

**0.1.74** - update dependencies

**0.1.73** - update dependencies

**0.1.72** - update @types/node

**0.1.71** - update dependencies

**0.1.70** - update dependencies

**0.1.69** - import of magic config should work on windows

**0.1.68** - update @magic/core to fix tests if magic.js does not exist

**0.1.67** - silence errors if magic.js does not exist

**0.1.66** - better handling if magic is not in use

**0.1.65** - testing of @magic-modules is now built in

**0.1.64** - update @magic/fs

**0.1.63** - update c8

**0.1.62** - add html flag to tests, now @magic-modules can be tested

**0.1.61** - update dependencies

**0.1.60** - bump required node version to 14.15.4

**0.1.59** - update dependencies

**0.1.58** - update dependencies

**0.1.57** - update dependencies

**0.1.56** - update dependencies

**0.1.55** - update dependencies

**0.1.54** - update dependencies

**0.1.53** - update dependencies

**0.1.52** - remove @magic/css export

**0.1.51** - update dependencies

**0.1.50** - remove @magic/css export

**0.1.49** - update @magic/css

**0.1.48** - bump required node version to 14.2.0

**0.1.47** - update c8, yargs-parser

**0.1.46** - update @magic/css

**0.1.45** - security fix: update dependencies

**0.1.44** - update dependencies

**0.1.43** - update dependencies

**0.1.42** - update dependencies

**0.1.41** - update dependencies

**0.1.40** - update dependencies

**0.1.39** - update coveralls, fix minimist issue above

**0.1.38** - update dependencies, minimist sec issue

**0.1.37** - fix: arguments for both node and c8 tests work

**0.1.36** - c8: --exclude, --include and --all get applied correctly

**0.1.35** - fix: c8 errored if coverage dir did not exist

**0.1.34** - fix: c8 needs "report" command now

**0.1.33** - update exported dependencies

**0.1.32** - tests now work on windows
  - uncaught errors will cause tests to fail with process.exit(1)

**0.1.31** - update dependencies

**0.1.30** - export @magic/fs

**0.1.29** - help text can show up when --help is used

**0.1.28** - package: engineStrict: true

**0.1.27** - remove prettier from deps

**0.1.26** - remove commonjs support, node 13+ required

**0.1.25** - currying now throws errors instead of returning them

**0.1.24** - update @magic/css

**0.1.23** - update @magic dependencies to use npm packages instead of github

**0.1.22** - update dependencies

**0.1.21** - update @magic/cli to allow default args

**0.1.20** - update broken dependencies

**0.1.19** - update dependencies

**0.1.18** - require node 12.13.0

**0.1.17** - add node 13 json support for coverage reports

**0.1.16** - update @magic/cli for node 13 support

**0.1.15** - update dependencies

**0.1.14** - windows support now supports index.js files that provide test structure

**0.1.13** - windows support is back

**0.1.12** - update dependencies

**0.1.11** - update prettier, coveralls, add and export @magic/css

**0.1.10** - node 12.4.0 does not use --experimental-json-modules flag

**0.1.9** - test/beforeAll.js gets loaded separately if it exists

**0.1.8** - update @magic/cli

**0.1.7** - readded calls npm run script, updated c8

**0.1.6** - update this readme and html docs

**0.1.5** - use ecmascript version of @magic/deep

**0.1.4** - npm run scripts of @magic/test itself can be run on windows

**0.1.3** - cli now works everywhere

**0.1.2** - cli now works on windows again

**0.1.1** - rework of bin scripts and update dependencies to esmodules

**0.1.0** - use esmodules instead of commonjs
`),h2({},"Update Changelog"),p(["To update this version history page, update the ",Link({to:"/changelog/"},"Changelog")," page with the latest version."])],"/test/writing-tests/":()=>[h1({id:"writing-tests"},"Writing Tests"),h2({id:"tests"},"Single Test"),p("A test can be a literal value, function, or promise:"),Pre(`
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
`),h2({id:"tests-multiple"},"Multiple Tests"),p("Multiple tests can be created by exporting an array or object of single test objects."),Pre(`
export default [
  { fn: () => true, expect: true, info: 'expect true to be true' },
  { fn: () => false, expect: false, info: 'expect false to be false' },
]
`),p("Or exporting an object with named test arrays:"),Pre(`
export default {
  multipleTests: [
    { fn: () => true, expect: true, info: 'expect true to be true' },
    { fn: () => false, expect: false, info: 'expect false to be false' },
  ]
}
`),h2({id:"tests-runs"},"Running Tests Multiple Times"),p("Use the `runs` property to run a test multiple times:"),Pre(`
import { is } from '@magic/test'

export default [
  {
    fn: Math.random(),
    expect: is.number,
    runs: 5,
    info: 'runs the test 5 times and expects all returns to be numbers',
  },
]
`),h2({id:"tests-types"},"Testing Types"),p(["Types can be compared using ",Link({to:"https://github.com/magic/types",text:"@magic/types"})]),p(["@magic/types is a richly featured and thoroughly tested type library without dependencies."," It is exported from this library for convenience."]),Pre(`
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
`),h3({id:"predicates-and-values"},"Predicates & Values Array"),p(["Combine type checks with value checks in a single expect array."," Each element is checked independently against the test result."," All must pass (AND semantics):"]),Pre(`
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
`),p("Mix as many predicates and values as needed:"),Pre(`
export default {
  fn: () => 42,
  expect: [is.number, v => v > 0, 42],
  info: 'is number, is greater than 0, equals 42',
}
`),p(["Predicate elements are functions — evaluated with the test result."," Non-predicates are compared with strict equality (primitives) or deep equality (objects/arrays)."," Pure value arrays without functions, like `expect: [1, 2, 3]`, still use deep equality as before."]),h3({id:"caveat"},"Caveat"),p(["If you want to test if a function is a function, you need to wrap the function in a function."," This is because functions passed to fn get executed automatically."]),Pre(`
import { is } from '@magic/test'

const fnToTest = () => {}

export default [
  {
    fn: () => fnToTest,
    expect: is.function,
    info: 'function is a function',
  },
]
`),h2({id:"tests-typescript"},"TypeScript Support"),p(["@magic/test supports TypeScript test files."," You can write tests in .ts files and they will be executed directly without transpilation."]),Pre(`
import type { Test } from '@magic/test'

export default [
  { fn: () => true, expect: true, info: 'TypeScript test works!' }
] satisfies Test[]
`),p("This requires Node.js 22.18.0 or later."),h2({id:"tests-promises"},"Promises"),Pre(`
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
`),h2({id:"tests-cb"},"Callback Functions"),Pre(`
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
`),h2({id:"tests-hooks"},"Hooks"),h3({},"Individual Test Hooks"),p("Run functions before and/or after individual tests:"),Pre(`
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
`),h3({id:"tests-suite-hooks"},"Suite Hooks"),p("Run functions before and/or after a suite of tests:"),Pre(`
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
`),p(["Note: Suites that use beforeAll, afterAll, beforeEach or afterEach"," will run in a worker to make sure globals are not polluted for other suites."]),h4({},"File-based Hooks"),p(["You can also create test/beforeAll.js and test/afterAll.js files"," that run before/after all tests."]),p("**Note:** These files must be placed at the **root** `test/` directory (not in subdirectories)."),Pre(`
// test/beforeAll.js
export default () => {
  global.setup = true
  // optionally return a cleanup function
  return () => {
    global.setup = false
  }
}
`),Pre(`
// test/afterAll.js
export default () => {
  // cleanup after all tests
}
`),h3({id:"tests-each-hooks"},"beforeEach and afterEach"),p("Define beforeEach and afterEach hooks that run before/after each individual test:"),Pre(`
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
`),h2({id:"tests-magic-modules"},"Magic Modules"),p(["@magic-modules assume all HTML tags to be globally defined."," To create those globals for your test and check if a @magic-module returns the correct markup,"," just use one of those tags in your tests."]),Pre(`
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
`),h2({id:"test-suites"},"Test Suites"),p("Expectations for optimal test messages:"),ul([li("src and test directories have the same structure and files"),li("tests one src file per test file"),li("tests one function per suite"),li("tests one feature per test")]),h3({},"Filesystem Based Naming"),p("The following directory structure:"),Pre(`./test/
  ./suite1.js
  ./suite2.js`),p("yields the same result as exporting the following from ./test/index.js:"),Pre(`import suite1 from './suite1'
import suite2 from './suite2'

export default {
  suite1,
  suite2,
}
`),h3({},"Data Driven Naming"),p("Export test structure directly from index.js:"),Pre(`
export default {
  suite1: [
    { fn: () => true, expect: true },
  ],
  suite2: [
    { fn: () => false, expect: false },
  ],
}
`),h3({id:"tests-file-mappings"},"Important File Mappings"),p(["If test/index.js exists, no other files will be loaded."," If test/lib/index.js exists, no other files from that subdirectory will be loaded."," Instead, the exports of those index.js will be expected to be tests."])]};k({init:{...{description:["Declaratively test your ecmascript module files."," No transpiling required."," Incredibly fast."],logotext:"@magic/test",menu:[{text:"Home",to:"/test/"},{text:"Getting Started",to:"/test/getting-started/"},{items:[{text:"Single Test",to:"/test/writing-tests/#tests"},{text:"Multiple Tests",to:"/test/writing-tests/#tests-multiple"},{text:"Running Multiple Times",to:"/test/writing-tests/#tests-runs"},{text:"Testing Types",to:"/test/writing-tests/#tests-types"},{text:"Promises",to:"/test/writing-tests/#tests-promises"},{text:"Callbacks",to:"/test/writing-tests/#tests-cb"},{text:"Hooks",to:"/test/writing-tests/#tests-hooks"},{text:"Suite Hooks",to:"/test/writing-tests/#tests-suite-hooks"},{text:"beforeEach/afterEach",to:"/test/writing-tests/#tests-each-hooks"},{text:"Magic Modules",to:"/test/writing-tests/#tests-magic-modules"},{text:"Test Suites",to:"/test/writing-tests/#test-suites"}],text:"Writing Tests",to:"/test/writing-tests/"},{items:[{text:"deep",to:"/test/lib/#lib-deep"},{text:"fs",to:"/test/lib/#lib-fs"},{text:"curry",to:"/test/lib/#lib-curry"},{text:"log",to:"/test/lib/#lib-log"},{text:"vals",to:"/test/lib/#lib-vals"},{text:"env",to:"/test/lib/#lib-env"},{text:"promises",to:"/test/lib/#lib-promises"},{text:"http",to:"/test/lib/#lib-http"},{text:"tryCatch",to:"/test/lib/#lib-trycatch"},{text:"error",to:"/test/lib/#lib-error"},{text:"mock",to:"/test/lib/#lib-mock"},{text:"mock.log",to:"/test/lib/#lib-mock-log"},{text:"has",to:"/test/lib/#lib-has"},{text:"version",to:"/test/lib/#lib-version"},{text:"DOM Environment",to:"/test/lib/#lib-dom"}],text:"Utilities",to:"/test/lib/"},{items:[{text:"mount",to:"/test/svelte/#lib-svelte"},{text:"Component State",to:"/test/svelte/#svelte-state"},{text:"Auto Exports",to:"/test/svelte/#svelte-auto-export"},{text:"Error Handling",to:"/test/svelte/#svelte-error"},{text:"SvelteKit Mocks",to:"/test/svelte/#lib-sveltekit-mocks"},{text:"createStaticPage",to:"/test/svelte/#lib-create-static-page"},{text:"compileSvelte",to:"/test/svelte/#lib-compile-svelte"},{text:"Svelte 4 vs 5",to:"/test/svelte-4-vs-5/"},{text:"Auto-Export FAQ",to:"/test/svelte-auto-export-faq/"}],text:"Svelte",to:"/test/svelte/"},{items:[{text:"package.json Setup",to:"/test/cli/#cli-packagejson"},{text:"Global Install",to:"/test/cli/#cli-global"},{text:"CLI Flags",to:"/test/cli/#cli-flags"},{text:"Sharding Tests",to:"/test/cli/#sharding"},{text:"Exit Codes",to:"/test/cli/#exit-codes"},{text:"Verbose Output",to:"/test/cli/#verbose-output"},{text:"Performance Tips",to:"/test/cli/#performance-tips"},{text:"Common Pitfalls",to:"/test/cli/#common-pitfalls"},{text:"CLI Flags Reference",to:"/test/cli-flags-reference/"},{text:"Sharding Cheat-Sheet",to:"/test/cli-sharding-cheatsheet/"},{text:"Performance Tips",to:"/test/performance-tips/"},{text:"Common Pitfalls",to:"/test/common-pitfalls/"}],text:"CLI & Usage",to:"/test/cli/"},{items:[{text:"__isolate",to:"/test/test-isolation/#isolate"}],text:"Test Isolation",to:"/test/test-isolation/"},{text:"Error Codes",to:"/test/error-codes/"},{text:"Error Codes Quick Look",to:"/test/error-codes-quicklook/"},{text:"Version History",to:"/test/version-history/"},{text:"Changelog",to:"/test/changelog/"}],nospy:{show:!1},pageClass:{},pages:{"/test/404/":{description:"404 - not found.",title:"404 - not found"}},root:"/test/",theme:"dark",title:"@magic/test",url:"/test/"},url:window.location.pathname,hash:window.location.hash.substr(1)},subscriptions:e=>[[T,S]],view:e=>{let t=P[e.url]?e.url:"/404/",s=P[t],i=e.pages&&e.pages[t];return i&&Object.keys(i).forEach(t=>{e[t]=i[t]}),e.url=t,Page({page:s,state:e},[LightSwitch(e),NoSpy(e)])},node:document.getElementById("Magic")})};__MAGIC__();