const __MAGIC__=()=>{var e,t,s,o,r,i,n,a,l,c,p,d,u,f,m,h,g,v,x,y;let{h:b,app:w}=(e={},s=(t=[]).map,o=Array.isArray,r="u">typeof requestAnimationFrame?requestAnimationFrame:setTimeout,i=function(e){var t="";if("string"==typeof e)return e;if(o(e)&&e.length>0)for(var s,r=0;r<e.length;r++)""!==(s=i(e[r]))&&(t+=(t&&" ")+s);else for(var r in e)e[r]&&(t+=(t&&" ")+r);return t},n=function(e,t){var s={};for(var o in e)s[o]=e[o];for(var o in t)s[o]=t[o];return s},a=function(e){return e.reduce(function(e,t){return e.concat(t&&!0!==t?"function"==typeof t[0]?[t]:a(t):0)},t)},l=function(e,t){if(e!==t)for(var s in n(e,t)){var r,i;if(e[s]!==t[s]&&(r=e[s],i=t[s],!(o(r)&&o(i))||r[0]!==i[0]||"function"!=typeof r[0]))return!0;t[s]=e[s]}},c=function(e,t,s){for(var o,r,i=0,n=[];i<e.length||i<t.length;i++)o=e[i],n.push((r=t[i])?!o||r[0]!==o[0]||l(r[1],o[1])?[r[0],r[1],r[0](s,r[1]),o&&o[2]()]:o:o&&o[2]());return n},p=function(e,t,s,o,r,a){if("key"===t);else if("style"===t)for(var l in n(s,o))s=null==o||null==o[l]?"":o[l],"-"===l[0]?e[t].setProperty(l,s):e[t][l]=s;else"o"===t[0]&&"n"===t[1]?((e.actions||(e.actions={}))[t=t.slice(2)]=o)?s||e.addEventListener(t,r):e.removeEventListener(t,r):!a&&"list"!==t&&"children"!==t&&t in e?e[t]=null==o?"":o:null!=o&&!1!==o&&("class"!==t||(o=i(o)))?"children"!==t&&e.setAttribute(t,o):e.removeAttribute(t)},d=function(e,t,s){var o=e.props,r=3===e.type?document.createTextNode(e.name):(s=s||"svg"===e.name)?document.createElementNS("http://www.w3.org/2000/svg",e.name,{is:o.is}):document.createElement(e.name,{is:o.is});for(var i in o)p(r,i,null,o[i],t,s);for(var n=0,a=e.children.length;n<a;n++)r.appendChild(d(e.children[n]=g(e.children[n]),t,s));return e.node=r},u=function(e){return null==e?null:e.key},f=function(e,t,s,o,r,i){if(s===o);else if(null!=s&&3===s.type&&3===o.type)s.name!==o.name&&(t.nodeValue=o.name);else if(null==s||s.name!==o.name)t=e.insertBefore(d(o=g(o),r,i),t),null!=s&&e.removeChild(s.node);else{var a,l,c,m,h=s.props,v=o.props,x=s.children,y=o.children,b=0,w=0,k=x.length-1,E=y.length-1;for(var T in i=i||"svg"===o.name,n(h,v))("value"===T||"selected"===T||"checked"===T?t[T]:h[T])!==v[T]&&p(t,T,h[T],v[T],r,i);for(;w<=E&&b<=k&&null!=(c=u(x[b]))&&c===u(y[w]);)f(t,x[b].node,x[b],y[w]=g(y[w++],x[b++]),r,i);for(;w<=E&&b<=k&&null!=(c=u(x[k]))&&c===u(y[E]);)f(t,x[k].node,x[k],y[E]=g(y[E--],x[k--]),r,i);if(b>k)for(;w<=E;)t.insertBefore(d(y[w]=g(y[w++]),r,i),(l=x[b])&&l.node);else if(w>E)for(;b<=k;)t.removeChild(x[b++].node);else{for(var T=b,S={},C={};T<=k;T++)null!=(c=x[T].key)&&(S[c]=x[T]);for(;w<=E;){if(c=u(l=x[b]),m=u(y[w]=g(y[w],l)),C[c]||null!=m&&m===u(x[b+1])){null==c&&t.removeChild(l.node),b++;continue}null==m||1===s.type?(null==c&&(f(t,l&&l.node,l,y[w],r,i),w++),b++):(c===m?(f(t,l.node,l,y[w],r,i),C[m]=!0,b++):null!=(a=S[m])?(f(t,t.insertBefore(a.node,l&&l.node),a,y[w],r,i),C[m]=!0):f(t,l&&l.node,null,y[w],r,i),w++)}for(;b<=k;)null==u(l=x[b++])&&t.removeChild(l.node);for(var T in S)null==C[T]&&t.removeChild(S[T].node)}}return o.node=t},m=function(e,t){for(var s in e)if(e[s]!==t[s])return!0;for(var s in t)if(e[s]!==t[s])return!0},h=function(e){return"object"==typeof e?e:x(e)},g=function(e,t){return 2===e.type?((!t||!t.lazy||m(t.lazy,e.lazy))&&((t=h(e.lazy.view(e.lazy))).lazy=e.lazy),t):e},v=function(e,t,s,o,r,i){return{name:e,props:t,children:s,node:o,type:i,key:r}},x=function(s,o){return v(s,e,t,o,void 0,3)},y=function(t){return 3===t.nodeType?x(t.nodeValue,t):v(t.nodeName.toLowerCase(),e,s.call(t.childNodes,y),t,void 0,1)},{h:function(t,s){for(var r,i=[],n=[],a=arguments.length;a-- >2;)i.push(arguments[a]);for(;i.length>0;)if(o(r=i.pop()))for(var a=r.length;a-- >0;)i.push(r[a]);else!1===r||!0===r||null==r||n.push(h(r));return s=s||e,"function"==typeof t?t(s,n):v(t,s,n,void 0,s.key)},app:function(e){var t={},s=!1,i=e.view,n=e.node,l=n&&y(n),p=e.subscriptions,d=[],u=function(e){v(this.actions[e.type],e)},m=function(e){return t!==e&&(t=e,p&&(d=c(d,a([p(t)]),v)),i&&!s&&r(x,s=!0)),t};let{middleware:g=e=>e}=e,v=g((e,s)=>"function"==typeof e?v(e(t,s)):o(e)?"function"==typeof e[0]||o(e[0])?v(e[0],"function"==typeof e[1]?e[1](s):e[1]):(a(e.slice(1)).map(function(e){e&&e[0](v,e[1])},m(e[0])),t):m(e));var x=function(){s=!1,n=f(n.parentNode,n,l,l=h(i(t)),u)};v(e.init)}}),k=e=>(t={},s)=>{let o=(e,...t)=>t.some(t=>t===typeof e);if(o(s,"undefined")){if(t.props)return b(e,{},[t]);o(t,"string","number","function")||Array.isArray(t)?(s=t,t={}):o(t.View,"function")&&(s=t.View,t={})}return b(e,t,s)},E=k("a"),T=k("button"),S=k("circle"),C=k("code");k("description");let R=k("div"),N=k("footer"),_=k("g"),A=k("h1"),O=k("h2"),j=k("h3"),M=k("h4"),I=k("header"),P=k("img"),D=k("input"),F=k("li");k("link");let L=k("main");k("meta");let q=k("nav"),U=k("p"),W=k("path"),$=k("pre");k("script");let H=k("span"),z=k("svg"),V=k("table"),G=k("td"),B=k("th");k("title");let K=k("tr"),J=k("ul"),Y=e=>{if("string"==typeof e)e={project:e};else if(!e.project)return;let{branch:t="master",host:s="github"}=e,{project:o=!1}=e,r="",i=o;o.startsWith("@")?(r="@",o=o.substr(1)):i=o.split("/")[1];let n=[["npm",(e=o)=>e&&{to:`https://www.npmjs.com/package/${i}`,src:`https://img.shields.io/npm/v/${r}${e}?color=blue`}],["node",(e=o)=>e&&{src:`https://img.shields.io/node/v/${r}${e}?color=blue`}],["license",(e=o)=>e&&{src:`https://img.shields.io/npm/l/${r}${e}?color=blue`}],["travis",(e=o)=>e&&{to:`https://travis-ci.com/${e}`,src:`https://img.shields.io/travis/com/${e}/${t}`}],["appveyor",(e=o)=>{if(e){let[s,o]=e.split("/");return s=s.replace(/-/g,""),{to:`https://ci.appveyor.com/project/${s}/${o}/branch/${t}`,src:`https://img.shields.io/appveyor/ci/${s}/${o}/${t}.svg`}}}],["coveralls",(e=o)=>({to:`https://coveralls.io/${s}/${e}`,src:`https://img.shields.io/coveralls/${s}/${e}/${t}.svg`})],["snyk",(e=o)=>e&&{to:`https://snyk.io/test/${s}/${e}`,src:`https://img.shields.io/snyk/vulnerabilities/github/${e}.svg`}]].map(([t,s])=>s(e[t]));if(n.length)return J({class:"GitBadges"},n.map(({to:e,src:t})=>{if(!t)return;let s=Q({src:t,height:"23"});return e?F(X({to:e},s)):F(s)}))},Q=e=>{"string"==typeof e&&(e={src:e});let{loading:t="lazy"}=e;if(e.src)return e.hasOwnProperty("alt")||(e.title?e.alt=e.title:e.alt=""),e.loading=t,P(e)},X=({to:e,action:t=es.go,text:s,...o},r)=>{let{href:i,nofollow:n,noreferrer:a,...l}=o;return l.href=e=e||i||"",s&&r?s=[s,r]:s||(s=r||e),"/"===e[0]||"#"===e[0]?l.onclick=[t,et.preventDefault]:(l.target="_blank",l.rel="noopener",n&&(l.rel+=" nofollow"),a&&(l.rel+=" noreferrer")),E(l,s)},Z=e=>{let{collapse:t,items:s=[],text:o,url:r,...i}=e,n={class:{}},{to:a}=i;a===r&&(n.class.active=!0);let l=[];return(!t||r.includes(a))&&s.length&&(l=J(s.map(e=>Z({url:r,collapse:t,...e})))),F(n,[a?X(i,o):H(i,o),l])},ee=(e,t)=>{"string"==typeof e?e={content:e}:t?e={content:t,...e}:Array.isArray(e)&&(e={content:e.join("")});let{content:s,lines:o=!0}=e;return R({class:{Pre:!0,lines:o&&"false"!==o}},[R({class:"menu"},[T({onclick:[es.pre.clip,e=>({e,content:s})]},"copy")]),$(s.trim().split("\n").map(ee.Line))])};ee.Comment=e=>H({class:"comment"},e),ee.Line=e=>C({class:"line"},ee.Words(e)),ee.Word=e=>{if(!e)return"";let t=e.includes("://"),s=e.startsWith("mailto:")||e.includes("@")&&e.includes(".");if(t||s)return X({to:e,text:e});let o="";return("state"===e?o="state":"actions"===e?o="actions":"effects"===e?o="effects":"subscriptions"===e?o="subscriptions":et.pre.keywords.includes(e)?o="keyword":et.pre.builtins.includes(e)?o="builtin":et.pre.booleans.includes(e)&&(o="boolean"),o)?H({class:o},e):e},ee.Words=e=>{let[t,...s]=e.split(et.pre.commentRegex);if(!t.endsWith(":")&&s.length)return[ee.Words(t),ee.Comment(s.join("").split(et.pre.wordRegex).map(ee.Word))];let o=[],r=e;return(e.replace(et.pre.stringRegex,e=>{if(r){let[t,s]=r.split(e);t&&o.push(t.split(et.pre.wordRegex).map(ee.Word).filter(e=>e)),r=s}o.push(H({class:"string"},e))}),r!==e)?(r&&o.push(r.split(et.pre.wordRegex).map(ee.Word).filter(e=>e)),o):e.split(et.pre.wordRegex).filter(e=>e).map(ee.Word)};let et={pre:{booleans:["true","false"],builtins:["Array","Object","String","Number","RegExp","Null","Symbol","Set","WeakSet","Map","WeakMap","setInterval","setTimeout","Promise","JSON","Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Uint16Array","Int32Array","Uint32Array","Float32Array","Float64Array"],commentRegex:/(\/\/)/gim,keywords:["let","this","long","package","float","goto","private","class","if","short","while","protected","with","debugger","case","continue","volatile","interface","instanceof","super","synchronized","throw","extends","final","export","throws","try","import","double","enum","boolean","abstract","function","implements","typeof","transient","break","default","do","static","void","int","new","async","native","switch","else","delete","null","public","var","await","byte","finally","catch","in","return","for","get","const","char","module","exports","require","npm","install","=>"],stringRegex:/("|')(.*?)\1/gim,wordRegex:/( )/gim},preventDefault:e=>(e.preventDefault(),e)},es={changeTheme:e=>({...e,pageClass:{...e.pageClass,light:"dark"===e.theme},theme:"dark"===e.theme?"light":"dark"}),go:(e,t)=>{if(!t||!t.currentTarget)return e;let s=t.currentTarget.href.replace(window.location.origin,""),[o,r=""]=s.split("#");if(o===e.url&&r===e.hash)return r&&(window.location.hash=r),e;let i=e.pages&&e.pages[o]&&e.pages[o].title;i&&(document.title=e.title=i),o!==e.url?r||window.scrollTo({top:0}):window.location.hash=r;let{scrollY:n}=window;return window.history.pushState({url:o,hash:r,scrollY:n},e.title,s),{...e,url:o,hash:r,prev:e.url}},nospy:{toggle:e=>(e.nospy.show=!e.nospy.show,{...e})},pop:(e,t)=>{let{pathname:s,hash:o}=window.location;o=o.substring(1);let r=0;return t.state&&(s=t.state.url,o=t.state.hash,r=t.state.scrollY||0),o?window.location.hash=o:window.scroll({top:r}),{...e,url:s,hash:o}},pre:{clip:(e,{content:t})=>{if("u">typeof document&&"function"==typeof document.execCommand){let e=document.createElement("textarea");e.id="copy",e.innerHTML=t,document.body.appendChild(e);let s=document.getElementById("copy");s.select(),document.execCommand("copy"),document.body.removeChild(s)}return e}}},eo=(e,t)=>{let s=s=>e(t,s);return addEventListener("popstate",s),()=>removeEventListener("popstate",s)},er={"/test/":()=>[A({id:"magictest"},"@magic/test"),U(["Declaratively test your ecmascript module files."," No transpiling of either your codebase nor the tests."," Incredibly fast."]),Y("@magic/test"),O({id:"getting-started"},"Getting Started"),U(["See the ",X({to:"/getting-started/"},"Getting Started")," guide for full instructions."]),ee({lines:"false"},"npm i --save-dev --save-exact @magic/test"),ee(`
// test/yourFileToTest.js
export default [
  { fn: () => true, expect: true, info: 'true is true' },
]
`),O({id:"features"},"Features"),J([F([X({to:"/writing-tests/"},"Write tests")," in plain JavaScript or TypeScript"]),F([X({to:"/lib/"},"Utility functions")," for deep equality, mocking, HTTP, and more"]),F([X({to:"/svelte/"},"Svelte 5")," component testing built-in"]),F([X({to:"/cli/"},"CLI tools")," with sharding for parallel test execution"]),F([X({to:"/test-isolation/"},"Test isolation")," for preventing state leakage"]),F([X({to:"/error-codes/"},"Error codes")," for programmatic error handling"])]),O({id:"quick-examples"},"Quick Examples"),j({},"Simple test"),ee(`
export default [
  { fn: () => 1 + 1, expect: 2 },
  { fn: () => 'hello', expect: 'hello' },
]
`),j({},"Async test"),ee(`
import { promise } from '@magic/test'

export default [
  {
    fn: promise(cb => setTimeout(() => cb(null, true), 100)),
    expect: true,
    info: 'handle promises',
  },
]
`),j({},"Deep equality"),ee(`
import { is } from '@magic/test'

export default [
  {
    fn: () => ({ a: 1, b: 2 }),
    expect: is.deep.equal({ a: 1, b: 2 }),
    info: 'deep compare objects',
  },
]
`),j({},"Mock function"),ee(`
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
`),O({id:"learn-more"},"Learn More"),J([F([X({to:"/getting-started/"},"Getting Started")," - install, setup, first test"]),F([X({to:"/writing-tests/"},"Writing Tests")," - hooks, promises, types, multiple tests"]),F([X({to:"/lib/"},"Utility Functions")," - deep, fs, curry, log, vals, env, http, mock, has"]),F([X({to:"/svelte/"},"Svelte Testing")," - mount components, interact, assert"]),F([X({to:"/svelte/4-vs-5/"},"Svelte 4 vs 5")," - feature comparison"]),F([X({to:"/cli/"},"CLI & Usage")," - flags, sharding, performance tips"]),F([X({to:"/cli/flags/"},"CLI Flags Reference")," - detailed flag table"]),F([X({to:"/cli/sharding-cheatsheet/"},"CLI Sharding Cheat-Sheet")," - CI/CD examples"]),F([X({to:"/cli/performance-tips/"},"Performance Tips")," - optimization techniques"]),F([X({to:"/cli/common-pitfalls/"},"Common Pitfalls")," - troubleshooting tips"]),F([X({to:"/test-isolation/"},"Test Isolation")," - prevent state leakage between tests"]),F([X({to:"/error-codes/"},"Error Codes")," - programmatic error handling"]),F([X({to:"/error-codes-quicklook/"},"Error Codes Quick Look")," - quick reference table"]),F(X({to:"/changelog/"},"Changelog")," - detailed release history")]),U(["This library tests itself. Have a look at ",X({to:"https://github.com/magic/test/tree/master/test",text:"the tests"})," on GitHub."])],"/test/":()=>[A({id:"magictest"},"@magic/test"),U(["Declaratively test your ecmascript module files."," No transpiling of either your codebase nor the tests."," Incredibly fast."]),Y("@magic/test"),O({id:"getting-started"},"Getting Started"),U(["See the ",X({to:"/getting-started/"},"Getting Started")," guide for full instructions."]),ee({lines:"false"},"npm i --save-dev --save-exact @magic/test"),ee(`
// test/yourFileToTest.js
export default [
  { fn: () => true, expect: true, info: 'true is true' },
]
`),O({id:"features"},"Features"),J([F([X({to:"/writing-tests/"},"Write tests")," in plain JavaScript or TypeScript"]),F([X({to:"/lib/"},"Utility functions")," for deep equality, mocking, HTTP, and more"]),F([X({to:"/svelte/"},"Svelte 5")," component testing built-in"]),F([X({to:"/cli/"},"CLI tools")," with sharding for parallel test execution"]),F([X({to:"/test-isolation/"},"Test isolation")," for preventing state leakage"]),F([X({to:"/error-codes/"},"Error codes")," for programmatic error handling"])]),O({id:"quick-examples"},"Quick Examples"),j({},"Simple test"),ee(`
export default [
  { fn: () => 1 + 1, expect: 2 },
  { fn: () => 'hello', expect: 'hello' },
]
`),j({},"Async test"),ee(`
import { promise } from '@magic/test'

export default [
  {
    fn: promise(cb => setTimeout(() => cb(null, true), 100)),
    expect: true,
    info: 'handle promises',
  },
]
`),j({},"Deep equality"),ee(`
import { is } from '@magic/test'

export default [
  {
    fn: () => ({ a: 1, b: 2 }),
    expect: is.deep.equal({ a: 1, b: 2 }),
    info: 'deep compare objects',
  },
]
`),j({},"Mock function"),ee(`
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
`),O({id:"learn-more"},"Learn More"),J([F([X({to:"/getting-started/"},"Getting Started")," - install, setup, first test"]),F([X({to:"/writing-tests/"},"Writing Tests")," - hooks, promises, types, multiple tests"]),F([X({to:"/lib/"},"Utility Functions")," - deep, fs, curry, log, vals, env, http, mock, has"]),F([X({to:"/svelte/"},"Svelte Testing")," - mount components, interact, assert"]),F([X({to:"/svelte/4-vs-5/"},"Svelte 4 vs 5")," - feature comparison"]),F([X({to:"/cli/"},"CLI & Usage")," - flags, sharding, performance tips"]),F([X({to:"/cli/flags/"},"CLI Flags Reference")," - detailed flag table"]),F([X({to:"/cli/sharding-cheatsheet/"},"CLI Sharding Cheat-Sheet")," - CI/CD examples"]),F([X({to:"/cli/performance-tips/"},"Performance Tips")," - optimization techniques"]),F([X({to:"/cli/common-pitfalls/"},"Common Pitfalls")," - troubleshooting tips"]),F([X({to:"/test-isolation/"},"Test Isolation")," - prevent state leakage between tests"]),F([X({to:"/error-codes/"},"Error Codes")," - programmatic error handling"]),F([X({to:"/error-codes-quicklook/"},"Error Codes Quick Look")," - quick reference table"]),F(X({to:"/changelog/"},"Changelog")," - detailed release history")]),U(["This library tests itself. Have a look at ",X({to:"https://github.com/magic/test/tree/master/test",text:"the tests"})," on GitHub."])],"/test/404/":()=>R("404 - not found."),"/test/changelog/":()=>[A({id:"changelog"},"Changelog"),O({},"0.3.41"),J([F("svelte component coverage fully fixed, 0.0.40 was using the wrong paths"),F("move test/.fixtures to src/lib/svelte/testFixtures to make them exposed to c8 coverage")]),O({},"0.3.40"),J([F("fix svelte component coverage by pointing sourcemaps back to .svelte components")]),O({},"0.3.39"),J([F("change c8 to use --all flag"),F("change c8 to not include dist by default")]),O({},"0.3.38"),J([F("fix imports of svelte components, they only have a default export. resolveSvelteExports now handles this correctly."),F("update dependencies")]),O({},"0.3.37"),J([F("svelte mount now correctly resolves # imports map from package.json")]),O({},"0.3.36"),J([F("fix: add null guards for TypeScript strict mode in getSvelteExports tests")]),O({},"0.3.35"),J([F("works with sveltekit ^3.0.0"),F("feat: add package.json imports support and module resolution (feat)"),F("feat: add svelte shims: $app/env added, also resolves as $app/environment"),F("move test fixtures to test/.fixtures"),F("chore: update dependencies")]),O({},"0.3.34"),U("has subfunctions now allow either predicate functions OR literal values to be checked"),O({},"0.3.33"),J([F("update dependencies")]),O({},"0.3.32"),J([F("make svelte optional again")]),O({},"0.3.31"),J([F("feat: add deadlock detection system (ddl)"),F("feat: integrate ddl into cache, compile, and import pipeline"),F("feat: integrate ddl into resolve and package export pipeline"),F("feat: add loader init, warmup, and $app resolution"),F("feat: add addEventListener/removeEventListener to globals"),F("fix(svelte): remove console.error from pathUtils"),F("fix: add null guard and directory fallback in pathUtils"),F("fix: update registerLoader usage"),F("fix: remove REGISTERED message from tsLoader"),F("fix: fix tsc and eslint errors")]),O({},"0.3.30"),J([F("fix(svelte): resolve $app imports to shims instead of @sveltejs/kit runtime (fixes ERR_MODULE_NOT_FOUND in tests)"),F("fix(svelte): skip non-default exports from .svelte files in barrel compilation (TypeScript types erased at runtime)"),F("fix(vite): inject $app alias into vite aliases for resolveAlias fallback"),F("style(svelte): use @magic/fs instead of node:fs for consistency"),F("fix(c8): correctly order argv for c8 runs.")]),O({},"0.3.29"),J([F("feat(svelte): extract pathUtils with shared path resolution helpers (resolveFilePath, EXTENSION_CANDIDATES, FALLBACK_CANDIDATES, isSkipPattern)"),F("feat(svelte): extract fileWriter module for compiled file output with source map support"),F("feat(svelte): add resolveNodeModulesRelativeImportsPreprocessor for fixing '..' imports in node_modules"),F("feat(cache): add dedup function for concurrent promise deduplication"),F("refactor(svelte): extract loadViteConfig to shared module, consolidate getViteDefine and loadViteDefine"),F("refactor(svelte): remove resolveViteAlias, consolidate into resolveAlias"),F("refactor(svelte): use visitor pattern in resolveSvelteOnlyExports (traverseExports + ExportVisitor)"),F("refactor(svelte): use pathUtils in resolvePackageExport, fix .mjs resolution"),F("refactor(svelte): update tsLoader to use resolveAlias with includeShims and extractImportsSync"),F("refactor(svelte): use shared helpers across compile modules (getTempFilePath, fileWriter, processImports)"),F("fix(svelte): add includeShims option to resolveAlias for bare imports"),F("fix(vite): vite defines now correctly set in globalThis, by calling JSON.parse during assign.")]),O({},"0.3.28"),J([F("fix: $lib/types.js -> the .js gets removed before appending the correct extension"),F("regression fix: version spec check now correctly errors with expected type again."),F("update dependencies")]),O({},"0.3.27"),J([F("fix: exclude .d.ts files from test discovery (passed .ts filter, caused import failures)"),F("fix: always exclude .d.ts from c8 coverage (user --exclude can no longer remove it)"),F("refactor: restructure c8 exclude logic in t.ts"),F("chore: move changelog from README.md to CHANGELOG.md (650 lines extracted)")]),O({},"0.3.26"),J([F("add customElements to happy-dom globals")]),O({},"0.3.25"),J([F("fix: use @magic/types for more type comparisons"),F("feat: make expect accept an array of typechecks"),F("test: make more files testable by extracting pure functions"),F("update dependencies")]),O({},"0.3.24"),J([F("feat: show total time including test discovery overhead"),F("feat: add progress tracking for test discovery"),F("feat: add DISCOVERY_TIMEOUT env var to control test discovery timeout (default: 30s)"),F("perf: cache getViteDefine results")]),O({},"0.3.23"),J([F("0.3.22 caused tests to fail because viteconfig was not loaded correctly and lead to recursive imports")]),O({},"0.3.22"),J([F("feat: make restoreProperties method public on Isolation class"),F("fix: move BigInt check before other type checks in makeSafeClone"),F("refactor: use pathToFileURL for ESM config imports"),F("refactor: use wrapTest helper consistently in suite"),F("refactor: simplify suiteHasBeforeAllOrAfterAll condition"),F("refactor: extract hasFixedPort helper in isolationChecks"),F("refactor: extract restoreProperties helper"),F("refactor: deduplicate evaluateWorkerResult by re-exporting evaluateTestResult"),F("refactor: use CACHE_DIR constant for test temp files"),F("refactor: use dynamic imports instead of manual config parsing"),F("refactor(http): extract makeRequest helper to deduplicate get/post"),F("refactor(mount): handle Svelte 5 snippets properly"),F("test: fix test type errors for HTMLElement click function"),F("test: update fixtures for improved test harness"),F("update dependencies")]),O({},"0.3.21"),J([F("various build performance improvements, especially for svelte components"),F("add timing traces with MAGIC_TEST_TRACE env var and --trace CLI flag"),F("add promise-based caching via CacheManager"),F("consolidate worker pool into single source"),F("centralize caching in CacheManager at tsLoader level"),F("increase default test timeout to 30s"),F("fixed tsLoader .ts file handling"),F("add more tests for @magic/test itself"),F("implement persistent disk cache in node_modules/.magic-test-cache"),F("parallelize import resolution, barrel exports, and fs.exists checks"),F("cache fs.exists results, processImports results, and resolveViteAlias results"),F("skip writing unchanged files during compilation"),F("consolidate caches into single pendingPromises map"),F("add more tests for @magic/test itself"),F("update dependencies")]),O({},"0.3.20"),J([F("prevent double-compilation of svelte components"),F("update dependencies")]),O({},"0.3.19"),J([F("svelte edge cases"),F("custom test defines for globals")]),O({},"0.3.18"),J([F("better resolution for imported dependencies in tests"),F("especially <script> tags in svelte components that export functions/variables"),F("update dependencies")]),O({},"0.3.17"),J([F("better test discovery, had edge cases where tests were not found")]),O({},"0.3.16"),J([F("better kill handling for workers and child_process"),F("README fixes"),F("remove @systemkollektiv devDependencies, those packages are private for now"),F("update dependencies")]),O({},"0.3.15"),J([F("fix import of .svelte.js/.ts files if js/ts extension is omitted")]),O({},"0.3.14"),J([F("fireEvent function now correctly handles various addEventListener event types")]),O({},"0.3.13"),J([F("update dependencies")]),O({},"0.3.12"),J([F("make svelte optional for consumers"),F("update dependencies")]),O({},"0.3.11"),J([F("performance improvements, better checks if tests need to be isolated"),F("fix timing issues in isolation code"),F("replace regex code checks with ast checks"),F("add `has` functionality for object checks"),F("update dependencies")]),O({},"0.3.10"),J([F("fix more edge cases in svelte compilation steps"),F("add .css import support"),F("update dependencies")]),O({},"0.3.9"),J([F("fix imports of test/index.(mjs|ts|js) files")]),O({},"0.3.8"),J([F("add --workers flag to control max parallel workers (default: auto-detect CPU count)"),F("canvas polyfill works properly in happy-dom environment"),F("svelte: resolve svelte-only package exports"),F("svelte: fix import chain handling for components"),F("version: check if Lib is missing exports"),F("worker isolation: beforeAll and afterAll run in workers directly"),F("before fields in tests get awaited if they return a raw promise")]),O({},"0.3.7"),J([F("advanced worker isolation, executing minimum number of needed workers for tests. lots of internal changes to achieve this.")]),O({},"0.3.6"),U("broken - tried implementing better isolation"),O({},"0.3.5"),J([F("better tsLoader resolve mechanism")]),O({},"0.3.4"),J([F("also run registerLoader in workers")]),O({},"0.3.3"),J([F("replace all import .ts with .js"),F("some test output fixes")]),O({},"0.3.2"),U("broken: some .ts references for worker.ts and unit.ts"),J([F("publish dist dir with .js files for consumers.")]),O({},"0.3.1"),U("broken, dist dir missing"),O({},"0.3.0"),U("broken. node can not strip types in node_modules..."),J([F("added html support (using happy-dom, experimental!)"),F("added svelte support (experimental!)"),F("various improvements to test logic and structure of internal lib"),F("more tests.")]),O({},"0.2.30"),J([F("allow tests to be written using typescript, .ts files can be test files now."),F("add some internal tests"),F("update dependencies")]),O({},"0.2.29"),J([F("tryCatch: pass on empty args"),F("update dependencies")]),O({},"0.2.28"),J([F("use node:module register function for loader, allowing use of the --import flag instead of soon deprecated --loader.")]),O({},"0.2.27"),J([F("allow resolving .js files as .ts files, this mimics typescript .js file resolver"),F("update @types/node")]),O({},"0.2.26"),J([F("update dependencies")]),O({},"0.2.25"),J([F("update dependencies")]),O({},"0.2.24"),J([F("fix @magic/core tests on windows.")]),O({},"0.2.23"),J([F("readd npm run prepublishOnly task"),F("update dependencies")]),O({},"0.2.22"),J([F("add comprehensive typescript types"),F("rework some functionality to be typesafe and typeguarded"),F("update dependencies")]),O({},"0.2.21"),J([F("update dependencies")]),O({},"0.2.20"),J([F("update dependencies")]),O({},"0.2.19"),J([F("update dependencies"),F("add unused http.post. probably should replace http with fetch...")]),O({},"0.2.18"),J([F("add missing fs.statfs, fs.statfsSync and fs.promises.constants to test/spec"),F("update dependencies")]),O({},"0.2.17"),J([F("remove calls and coveralls-next, c8 takes care of coverage."),F("update dependencies")]),O({},"0.2.16"),J([F("update dependencies")]),O({},"0.2.15"),J([F("update dependencies"),F("percentage outputs print nicer numbers"),F("added http export that allows http requests in tests. only supports get requests for now.")]),O({},"0.2.14"),J([F("update dependencies")]),O({},"0.2.13"),J([F("update dependencies")]),O({},"0.2.12"),J([F("update dependencies")]),O({},"0.2.11"),J([F("update dependencies")]),O({},"0.2.10"),J([F("@magic/test can now test @magic/core again")]),O({},"0.2.9"),J([F("update dependencies")]),O({},"0.2.8"),J([F("update dependencies")]),O({},"0.2.7"),J([F("update dependencies"),F("replace coveralls with coveralls-next")]),O({},"0.2.6"),J([F("update dependencies")]),O({},"0.2.5"),J([F("update dependencies"),F("@magic/core is a dev dependency now.")]),O({},"0.2.4"),J([F("lib/version: spec can have objects defined with ['obj', false], which will test the parent to be an object, but does not test the key/value pairs in the object."),F("maybeInjectMagic: made magic injection more robust and much faster if magic is not being used."),F("t -p now does not show the coverage information")]),O({},"0.2.3"),J([F("update dependencies")]),O({},"0.2.2"),J([F("spec values can be functions, allowing arbitrary equality testing to be executed by @magic/test.version")]),O({},"0.2.1"),J([F("internal restructuring"),F("tests now output their run duration"),F("add @magic/error dependency and export it from index"),F("index.js files have the same functionality as index.js files"),F("update dependencies")]),O({},"0.2.0"),J([F("update dependencies"),F("version now tests spec and lib in a single run.")]),O({},"0.1.77"),J([F("update dependencies")]),O({},"0.1.76"),J([F("update dependencies")]),O({},"0.1.75"),J([F("update dependencies")]),O({},"0.1.74"),J([F("update dependencies")]),O({},"0.1.73"),J([F("update dependencies")]),O({},"0.1.72"),J([F("update @magic/types and intermediate deps to avoid circular dependency")]),O({},"0.1.71"),J([F("update dependencies")]),O({},"0.1.70"),J([F("update dependencies")]),O({},"0.1.69"),J([F("import of magic config should work on windows")]),O({},"0.1.68"),J([F("update @magic/core to fix tests if magic.js does not exist")]),O({},"0.1.67"),J([F("silence errors if magic.js does not exist")]),O({},"0.1.66"),J([F("better handling if magic is not in use")]),O({},"0.1.65"),J([F("update dependencies"),F("testing of @magic-modules is now built in."),F('if @magic/core is installed, the tests will "just work" and return html for @magic-modules')]),O({},"0.1.64"),J([F("update dependencies (@magic/fs)")]),O({},"0.1.63"),J([F("update dependencies (c8)")]),O({},"0.1.62"),J([F("add html flag to tests, now @magic-modules can be tested \\o/"),F("update dependencies")]),O({},"0.1.61"),J([F("update dependencies")]),O({},"0.1.60"),J([F("bump required node version to 14.15.4"),F("update dependencies")]),O({},"0.1.59"),J([F("update dependencies")]),O({},"0.1.58"),J([F("update dependencies")]),O({},"0.1.57"),J([F("update dependencies")]),O({},"0.1.56"),J([F("update dependencies")]),O({},"0.1.55"),J([F("update dependencies")]),O({},"0.1.54"),J([F("update dependencies")]),O({},"0.1.53"),J([F("update dependencies")]),O({},"0.1.52"),J([F("update dependencies"),F("remove hyperapp from exports.")]),O({},"0.1.51"),J([F("update dependencies")]),O({},"0.1.50"),J([F("remove @magic/css export"),F("update c8")]),O({},"0.1.49"),J([F("update @magic/css")]),O({},"0.1.48"),J([F("bump required node version to 14.2.0"),F("update dependencies")]),O({},"0.1.47"),J([F("update c8, yargs-parser")]),O({},"0.1.46"),J([F("update @magic/css")]),O({},"0.1.45"),J([F("security fix: update dependencies, yargs-parser.")]),O({},"0.1.44"),J([F("update dependencies")]),O({},"0.1.43"),J([F("update dependencies")]),O({},"0.1.42"),J([F("update dependencies")]),O({},"0.1.41"),J([F("update dependencies")]),O({},"0.1.40"),J([F("update dependencies")]),O({},"0.1.39"),J([F("update coveralls, fix minimist issue above.")]),O({},"0.1.38"),J([F("update dependencies, minimist sec issue.")]),O({},"0.1.37"),J([F("fix: arguments for both node and c8 tests work. broken in 0.1.36")]),O({},"0.1.36"),J([F("c8: --exclude, --include and --all get applied correctly.")]),O({},"0.1.35"),J([F("fix: c8 errored if coverage dir did not exist"),F("update dependencies")]),O({},"0.1.34"),J([F('fix: c8 needs "report" command now')]),O({},"0.1.33"),J([F("update exported dependencies")]),O({},"0.1.32"),J([F("tests now work on windows \\o/"),F("uncaught errors will cause tests to fail with process.exit(1)")]),O({},"0.1.31"),J([F("update dependencies")]),O({},"0.1.30"),J([F("export @magic/fs")]),O({},"0.1.29"),J([F("help text can show up when --help is used")]),O({},"0.1.28"),J([F("package: engineStrict: true"),F("update cli: missing @magic/cases dependency")]),O({},"0.1.27"),J([F("remove prettier from deps")]),O({},"0.1.26"),J([F("remove commonjs support. node 13+ required. awesome.")]),O({},"0.1.25"),J([F("currying now throws errors instead of returning them."),F("update @magic/css"),F("update @magic/types which now uses @magic/deep for is.deep.eq and is.deep.diff")]),O({},"0.1.24"),J([F("update @magic/css"),F("update c8")]),O({},"0.1.23"),J([F("update @magic dependencies to use npm packages instead of github")]),O({},"0.1.22"),J([F("update dependencies")]),O({},"0.1.21"),J([F("update @magic/cli to allow default args")]),O({},"0.1.20"),J([F("update broken dependencies")]),O({},"0.1.19"),J([F("update dependencies")]),O({},"0.1.18"),J([F("update dependencies"),F("require node 12.13.0")]),O({},"0.1.17"),J([F("add node 13 json support for coverage reports.")]),O({},"0.1.16"),J([F("update @magic/cli for node 13 support.")]),O({},"0.1.15"),J([F("update dependencies")]),O({},"0.1.14"),J([F("windows support now supports index.js files that provide test structure")]),O({},"0.1.13"),J([F("windows support is back")]),O({},"0.1.12"),J([F("update dependencies")]),O({},"0.1.11"),J([F("update prettier, coveralls"),F("add and export @magic/css to test css validity")]),O({},"0.1.10"),J([F("node 12.4.0 does not use --experimental-json-modules flag. removed it in 12.4+.")]),O({},"0.1.9"),J([F("test/beforeAll.js gets loaded separately if it exists and executed before all tests"),F("test/afterAll.js gets loaded separately if it exists and executed after all tests"),F("if the function exported from test/beforeAll.js returns another function, this returned function will also be executed after all tests"),F("export hyperapp beta 18")]),O({},"0.1.8"),J([F("update @magic/cli")]),O({},"0.1.7"),J([F("readded calls npm run script"),F("updated c8")]),O({},"0.1.6"),J([F("update this readme and html docs."),F("tests should always process.exit(1) if they errored.")]),O({},"0.1.5"),J([F("use ecmascript version of @magic/deep")]),O({},"0.1.4"),J([F("npm run scripts of @magic/test itself can be run on windows.")]),O({},"0.1.3"),J([F("cli now works everywhere")]),O({},"0.1.2"),J([F("cli now works on windows again (actually, this version is broken on all platforms.)")]),O({},"0.1.1"),J([F("rework of bin scripts and update dependencies to esmodules")]),O({},"0.1.0"),J([F("use esmodules instead of commonjs.")])],"/test/cli/":()=>[A({id:"cli"},"CLI & Usage"),O({id:"cli-packagejson"},"package.json (recommended)"),U("Add the magic/test bin scripts to package.json:"),ee(`
{
  "scripts": {
    "test": "t -p",
    "coverage": "t",
  },
  "devDependencies": {
    "@magic/test": "github:magic/test"
  }
}
`),U("Then use the npm run scripts:"),ee(`
npm test
npm run coverage
`),O({id:"cli-global"},"Globally (not recommended)"),U(["You can install this library globally,"," but the recommendation is to add the dependency and scripts to the package.json file."]),U(["This both explains to everyone that your app has these dependencies"," as well as keeping your bash free of clutter."]),ee(`
npm i -g @magic/test

// run tests in production mode
t -p

// run tests and get coverage in verbose mode
t
`),O({id:"cli-flags"},"CLI Flags"),U("Available command-line flags:"),J([F("-p, --production, --prod - Run tests without coverage (faster)"),F("-l, --verbose, --loud - Show detailed output including passing tests"),F("-i, --include - Files to include in coverage"),F("-e, --exclude - Files to exclude from coverage"),F("--shards N - Total number of shards to split tests across"),F("--shard-id N - Shard ID (0-indexed) to run"),F("-w, --workers N - Max parallel workers (default: auto)"),F("--help - Show help text")]),U(["Note: `--shards` and `--shard-id` must be used together."," `--shard-id` is 0-indexed (0 to N-1)."]),O({id:"sharding"},"Sharding Tests"),U("Run tests in parallel across multiple processes to speed up large test suites:"),ee(`
# Run 4 shards, this is shard 0 (of 0-3)
t --shards 4 --shard-id 0

# Run shard 1
t --shards 4 --shard-id 1

# Combine with other flags
t -p --shards 4 --shard-id 2
`),U(["Tests are distributed deterministically using a hash of the test file path,"," ensuring each test always runs in the same shard."]),U("Add to your package.json for CI/CD:"),ee(`
{
  "scripts": {
    "test": "t -p",
    "test:shard:0": "t -p --shards 4 --shard-id 0",
    "test:shard:1": "t -p --shards 4 --shard-id 1",
    "test:shard:2": "t -p --shards 4 --shard-id 2",
    "test:shard:3": "t -p --shards 4 --shard-id 3"
  }
}
`),U("Or use a single command to run all shards in parallel:"),ee(`
# Run all 4 shards in parallel and wait for all to complete
npm run test:shard:0 & npm run test:shard:1 & npm run test:shard:2 & npm run test:shard:3 & wait
`),O({id:"exit-codes"},"Exit Codes"),U("@magic/test returns specific exit codes to indicate test results:"),U("| Exit Code | Meaning |"),U("| --------- | ------- |"),U("| 0 | All tests passed |"),U("| 1 | One or more tests failed |"),ee(`
# Run tests and check exit code
npm test
echo "Exit code: $?"  # 0 = success, 1 = failure
`),O({id:"verbose-output"},"Verbose Output"),U("The -l (or --verbose, --loud) flag enables detailed output:"),ee(`
# Shows all tests including passing ones
t -l
`),U("What verbose mode shows:"),J([F("All test results (not just failures)"),F("Individual test execution time"),F("Full test names with suite hierarchy"),F("Detailed error messages with stack traces")]),U("Default mode (without -l):"),J([F("Only shows failing tests"),F("Shows summary only for passing suites"),F("Faster output for large test suites")]),U("Example output without -l:"),ee(`
### Testing package: my-lib
/addition.js => Pass: 3/3 100%
/multiplication.js => Pass: 4/4 100%
Ran 7 tests in 12ms. Passed 7/7 100%
`),U("Example output with -l:"),ee(`
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
`),O({id:"performance-tips"},"Performance Tips"),U(["For a detailed guide, see the ",X({to:"/cli/performance-tips/"},"Performance Tips")," page."]),j({},"Quick Reference"),ee(`
# Fast mode - no coverage
t -p

# Shard across 4 processes
t --shards 4 --shard-id 0
`),O({id:"common-pitfalls"},"Common Pitfalls"),U(["For a detailed guide, see the ",X({to:"/cli/common-pitfalls/"},"Common Pitfalls")," page."]),j({},"Quick Reference"),U("Avoid these common mistakes:"),J([F("Forgetting to return in async tests"),F("Not wrapping callback functions"),F("Mutating shared state between tests"),F("Using the wrong equality check"),F("Not awaiting async operations"),F("Incorrect hook usage")])],"/test/cli/common-pitfalls/":()=>[A({id:"common-pitfalls"},"Common Pitfalls"),U("Avoid these common mistakes when writing tests:"),O({},"1. Forgetting to Return in Async Tests"),U(["The test finishes before the promise resolves. Always return the promise:"]),ee(`
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
`),O({},"2. Not Wrapping Callback Functions"),ee(`
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
`),O({},"3. Mutating Shared State Between Tests"),ee(`
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
`),O({},"4. Using the Wrong Equality Check"),ee(`
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
`),O({},"5. Not Awaiting Async Operations"),ee(`
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
`),O({},"6. Incorrect Hook Usage"),ee(`
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
`)],"/test/cli/flags/":()=>[A({id:"cli-flags-reference"},"CLI Flags Reference"),U("Available command-line flags for @magic/test:"),O({},"Flag Reference Table"),ee('| Flag | Aliases | Default | Env Var | Description | Example |\n| :--- | :----- | :-----: | :------ | :---------- | :------ |\n| -p, --production, --prod |  |  |  | Run tests without coverage (faster) | t -p |\n| -l, --verbose, --loud |  |  |  | Show detailed output including passing tests | t -l |\n| -i, --include |  |  |  | Files to include in coverage | t -i "src/*.js" |\n| -e, --exclude |  |  |  | Files to exclude from coverage | t -e "src/test.js" |\n| --shards N |  |  |  | Total number of shards to split tests across | t --shards 4 --shard-id 0 |\n| --shard-id N |  |  |  | Shard ID (0-indexed) to run | t --shards 4 --shard-id 2 |\n| -w, --workers N |  | auto |  | Max parallel workers (default: auto-detect CPU count) | t -p --workers 2 |\n| --help |  |  |  | Show help text | t --help |\n| --trace |  |  | MAGIC_TEST_TRACE | Enable timing traces for performance debugging | t --trace |'),O({},"Flag Notes"),J([F("--shards and --shard-id must be used together"),F("--shard-id is 0-indexed (0 to N-1)"),F("Use -p flag for faster development runs (no coverage)"),F("--workers controls parallel test execution")]),O({},"Example Usage"),j({},"Basic Test Run"),ee(`
npm test  # runs with coverage

npm test  # runs without coverage (faster)
`),j({},"Shard Large Test Suite"),ee(`
# Run 4 shards, this is shard 0 (of 0-3)
t --shards 4 --shard-id 0

# Run shard 1
t --shards 4 --shard-id 1

# Combine with other flags
t -p --shards 4 --shard-id 2 --workers 2
`),O({},"See Also"),J([F([X({to:"/cli/"},"CLI & Usage")," - detailed usage guide"]),F([X({to:"/cli/performance-tips/"},"Performance Tips")," - optimization techniques"]),F([X({to:"/cli/sharding-cheatsheet/"},"CLI Sharding Cheat-Sheet")," - CI/CD examples"])])],"/test/cli/performance-tips/":()=>[A({id:"performance-tips"},"Performance Tips"),U("Follow these tips to get the most out of @magic/test:"),O({},"Use the -p Flag"),U(["Run tests in production mode to skip coverage and get faster output:"]),ee(`
# Fast mode - no coverage, only shows failures
npm test
# or
t -p
`),O({},"Shard Large Test Suites"),U(["Split tests across multiple processes to speed up large suites:"]),ee(`
# Split tests across 4 processes
t --shards 4 --shard-id 0
`),U(["Tests are distributed deterministically using a hash of the test file path."]),O({},"Minimize Async Overhead"),U(["Async tests are slower than sync tests. Use sync where possible:"]),ee(`
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
`),O({},"Use Local State Instead of Globals"),U(["Global state requires isolation overhead. Local state is naturally isolated:"]),ee(`
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
`),O({},"Batch Related Tests"),U(["Single suite with multiple tests is faster than multiple suites:"]),ee(`
# Faster: single suite with multiple tests
export default [
  { fn: () => add(1, 2), expect: 3 },
  { fn: () => add(0, 0), expect: 0 },
  { fn: () => add(-1, 1), expect: 0 },
]
`),O({},"Worker Concurrency"),U(["Control max parallel workers with the"," --workers ","flag. Default is auto-detect CPU count:"]),ee(`
# Use 2 workers
t -p --workers 2
`),U(["Link: ",X({to:"/cli/"},"CLI & Usage")," for full flag reference."])],"/test/cli/sharding-cheatsheet/":()=>[A({id:"cli/sharding-cheatsheet"},"CLI Sharding Cheat-Sheet"),U("Run tests in parallel across multiple processes to speed up large test suites:"),O({},"Basic Sharding Commands"),ee(`
# Run 4 shards, this is shard 0 (of 0-3)
t --shards 4 --shard-id 0

# Run shard 1
t --shards 4 --shard-id 1

# Run shard 2
t --shards 4 --shard-id 2

# Run shard 3
t --shards 4 --shard-id 3
`),U(["Tests are distributed deterministically using a hash of the test file path,"," ensuring each test always runs in the same shard."]),O({},"Combine with Other Flags"),ee(`
# Run with production mode (no coverage)
t -p --shards 4 --shard-id 2

# Add verbose output
t -l --shards 4 --shard-id 1

# Custom worker count
t --shards 4 --shard-id 0 --workers 2
`),O({},"Package.json for CI/CD"),U("Add these scripts to your package.json:"),ee(`
{
  "scripts": {
    "test": "t -p",
    "test:shard:0": "t -p --shards 4 --shard-id 0",
    "test:shard:1": "t -p --shards 4 --shard-id 1",
    "test:shard:2": "t -p --shards 4 --shard-id 2",
    "test:shard:3": "t -p --shards 4 --shard-id 3"
  }
}
`),O({},"Run All Shards in Parallel"),U("Use a single command to run all shards in parallel:"),ee(`
# Run all 4 shards in parallel and wait for all to complete
npm run test:shard:0 & npm run test:shard:1 & npm run test:shard:2 & npm run test:shard:3 & wait
`),U("Or with production mode:"),ee(`
npm run test:shard:0 & npm run test:shard:1 & npm run test:shard:2 & npm run test:shard:3 & wait
`),O({},"Deterministic Distribution"),U(["Test distribution is deterministic - the same test file will always run in the same shard."," This ensures consistent behavior across CI runs."]),O({},"See Also"),J([F([X({to:"/cli/"},"CLI & Usage")," - full CLI documentation"]),F([X({to:"/cli/flags/"},"CLI Flags Reference")," - detailed flag list"]),F([X({to:"/cli/performance-tips/"},"Performance Tips")," - optimization techniques"])])],"/test/error-codes-quicklook/":()=>[A({id:"error-codes-quicklook"},"Error Codes Quick Look"),U("Quick reference for @magic/test error codes. Import from `@magic/test`:"),ee(`
import { ERRORS, createError } from '@magic/test'
`),O({},"Error Codes Reference Table"),ee('| Code | Description | Example Usage |\n| :--- | :---------- | :------------ |\n| ERRORS.E_EMPTY_SUITE | Test suite is not exporting any tests | createError(ERRORS.E_EMPTY_SUITE, "Empty test suite") |\n| ERRORS.E_RUN_SUITE_UNKNOWN | Unknown error occurred while running a suite | createError(ERRORS.E_RUN_SUITE_UNKNOWN, "Unexpected execution error") |\n| ERRORS.E_TEST_NO_FN | Test object is missing the `fn` property | createError(ERRORS.E_TEST_NO_FN, "Missing test function") |\n| ERRORS.E_TEST_EXPECT | Test expectation failed | createError(ERRORS.E_TEST_EXPECT, "Expected value does not match") |\n| ERRORS.E_TEST_BEFORE | Before hook failed | createError(ERRORS.E_TEST_BEFORE, "Setup hook threw error") |\n| ERRORS.E_TEST_AFTER | After hook failed | createError(ERRORS.E_TEST_AFTER, "Cleanup hook threw error") |\n| ERRORS.E_TEST_FN | Test function threw an error | createError(ERRORS.E_TEST_FN, "Test function crashed") |\n| ERRORS.E_NO_TESTS | No test suites found | createError(ERRORS.E_NO_TESTS, "No test files discovered") |\n| ERRORS.E_IMPORT | Failed to import a test file | createError(ERRORS.E_IMPORT, "Cannot resolve test file path") |\n| ERRORS.E_MAGIC_TEST | General test execution error | createError(ERRORS.E_MAGIC_TEST, "Internal test runner error") |'),O({},"Usage Example"),U("Create custom errors with specific codes and messages:"),ee(`
import { createError, ERRORS } from '@magic/test'

export default [
  {
    fn: () => createError(ERRORS.E_TEST_NO_FN, 'Missing fn property'),
    expect: e => e.code === 'E_TEST_NO_FN' && e.message === 'Missing fn property',
    info: 'createError creates errors with code and message',
  },
]
`),O({},"Error Object Properties"),J([F('code - The error code string (e.g., "E_TEST_NO_FN")'),F("message - Human-readable error message"),F("stack - Stack trace for debugging")]),U("See also: "),[X({to:"/error-codes/"},"Full Error Codes Reference")]],"/test/error-codes/":()=>[A({id:"error-codes"},"Error Codes"),U(["@magic/test uses error codes to help with debugging and programmatic error handling."," You can import these constants from `@magic/test`:"]),ee(`
import { ERRORS, createError } from '@magic/test'
`),O({},"Available Error Codes"),U("| Code | Description |"),U("| ---- | ----------- |"),U("| ERRORS.E_EMPTY_SUITE | Test suite is not exporting any tests |"),U("| ERRORS.E_RUN_SUITE_UNKNOWN | Unknown error occurred while running a suite |"),U("| ERRORS.E_TEST_NO_FN | Test object is missing the `fn` property |"),U("| ERRORS.E_TEST_EXPECT | Test expectation failed |"),U("| ERRORS.E_TEST_BEFORE | Before hook failed |"),U("| ERRORS.E_TEST_AFTER | After hook failed |"),U("| ERRORS.E_TEST_FN | Test function threw an error |"),U("| ERRORS.E_NO_TESTS | No test suites found |"),U("| ERRORS.E_IMPORT | Failed to import a test file |"),U("| ERRORS.E_MAGIC_TEST | General test execution error |"),O({},"createError"),U("Create custom errors with specific codes and messages:"),ee(`
import { createError, ERRORS } from '@magic/test'

export default [
  {
    fn: () => createError(ERRORS.E_TEST_NO_FN, 'Missing fn property'),
    expect: e => e.code === 'E_TEST_NO_FN' && e.message === 'Missing fn property',
    info: 'createError creates errors with code and message',
  },
]
`),O({},"Usage Example"),ee(`
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
`),O({},"Error Object Properties"),J([F('code - The error code string (e.g., "E_TEST_NO_FN")'),F("message - Human-readable error message"),F("stack - Stack trace for debugging")])],"/test/getting-started/":()=>[A({id:"getting-started"},"Getting Started"),U("Be in a nodejs project."),O({},"Install"),ee({lines:"false"},"npm i --save-dev --save-exact @magic/test"),O({},"Create a Test File"),U(["Create a test file in the ","test/"," directory. The filename is used in test output, and the path should mirror your source structure:"]),ee(`
// test/yourFileToTest.js
export default [
  { fn: () => true, expect: true, info: 'true is true' },
  { fn: () => 1 + 1, expect: 2, info: 'basic math' },
]
`),U(["Note: the test function is called automatically. ","expect: true ","is optional."]),O({},"Add npm Scripts"),U("Add test scripts to your package.json:"),ee(`
{
  "scripts": {
    "test": "t -p",
    "coverage": "t"
  }
}
`),U(["t -p ","runs tests in production mode (no coverage, faster). ","t"," runs with coverage."]),O({},"Run Tests"),ee(`
npm test
`),O({},"Example Output"),ee(`
### Testing package: @magic/test
Ran 2 tests. Passed 2/2 100%
`),U("Faster output from a bigger project:"),ee(`
### Testing package: @artificialmuseum/engine
Ran 90307 tests in 274.5ms. Passed 90307/90307 100%
`),O({id:"next-steps"},"Next Steps"),J([F([X({to:"/writing-tests/"},"Writing Tests")," - hooks, promises, types, multiple tests"]),F([X({to:"/lib/"},"Utility Functions")," - deep, fs, curry, log, vals, env, http, mock, has"]),F([X({to:"/svelte/"},"Svelte Testing")," - mount components, interact, assert"]),F([X({to:"/cli/"},"CLI & Usage")," - flags, sharding, performance tips"]),F([X({to:"/test-isolation/"},"Test Isolation")," - prevent state leakage between tests"]),F([X({to:"/error-codes/"},"Error Codes")," - programmatic error handling"])])],"/test/lib/":()=>[A({id:"lib"},"Utility Belt"),U(["@magic/test exports some utility functions"," that make working with complex test workflows simpler."]),O({id:"lib-deep"},"deep"),U(["Exported from ",X({to:"https://github.com/magic/deep",text:"@magic/deep"}),", deep equality and comparison utilities."]),ee(`
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
`),U("Available functions:"),J([F("deep.equal(a, b) - deep equality check"),F("deep.different(a, b) - deep difference check"),F("deep.contains(container, item) - deep inclusion check"),F("deep.changes(a, b) - get differences between objects")]),O({id:"lib-fs"},"fs"),U(["Exported from ",X({to:"https://github.com/magic/fs",text:"@magic/fs"}),", file system utilities."]),ee(`
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
`),U("Common methods:"),J([F("fs.readFile(path, encoding) - read file content"),F("fs.writeFile(path, data) - write file content"),F("fs.exists(path) - check if file exists"),F("fs.mkdir(path, options) - create directory"),F("fs.rmdir(path) - remove directory"),F("fs.stat(path) - get file stats"),F("fs.readdir(path) - read directory contents"),F("Plus async versions in fs.promises")]),O({id:"lib-curry"},"curry"),U(["Currying can be used to split the arguments of a function into multiple nested functions."," This helps if you have a function with complicated arguments that you just want to quickly shim."]),ee(`
import { curry } from '@magic/test'

const compare = (a, b) => a === b
const curried = curry(compare)
const shimmed = curried('shimmed_value')

export default {
  fn: shimmed('shimmed_value'),
  expect: true,
  info: 'expect will be called with a and b and a will equal b',
}
`),O({id:"lib-log"},"log"),U("Logging utility for test output. Colors supported automatically."),ee(`
import { log } from '@magic/test'

log.debug('Debug info')
log.info('Something happened')
log.warn('Heads up')
log.error('Something went wrong')
log.critical('Game over')
`),U("Supports multiple arguments:"),ee(`
log.info('Testing', library, 'at version', version)
`),O({id:"lib-vals"},"vals"),U(["Exports JavaScript type constants for testing against any value."," Useful for fuzzing and property-based testing."]),ee(`
import { vals, is } from '@magic/test'

export default [
  { fn: () => 'test', expect: is.string, info: 'test if value is a string' },
  { fn: () => vals.true, expect: true, info: 'boolean true value' },
  { fn: () => vals.email, expect: is.email, info: 'valid email format' },
  { fn: () => vals.error, expect: is.error, info: 'error instance' },
]
`),U("Available Constants:"),J([F("Primitives: true, false, number, num, float, int, string, str"),F("Empty values: nil, emptystr, emptyobject, emptyarray, undef"),F("Collections: array, object, obj"),F("Time: date, time"),F("Errors: error, err"),F("Colors: rgb, rgba, hex3, hex6, hexa4, hexa8"),F("Other: func, truthy, falsy, email, regexp")]),O({id:"lib-env"},"env"),U("Environment detection utilities for conditional test behavior."),U("Available utilities:"),J([F("isNodeProd - checks if NODE_ENV is set to production"),F("isNodeDev - checks if NODE_ENV is set to development"),F("isProd - checks if -p flag is passed to the CLI"),F("isVerbose - checks if -l flag is passed to the CLI"),F("getErrorLength - returns error length limit from MAGIC_TEST_ERROR_LENGTH env var (0 = unlimited)")]),ee(`
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
`),j({id:"lib-env-constants"},"Environment Constants"),U("These boolean constants reflect the current NODE_ENV:"),ee(`
import { isProd, isTest, isDev } from '@magic/test'

export default [
  { fn: isProd, expect: process.env.NODE_ENV === 'production' },
  { fn: isTest, expect: process.env.NODE_ENV === 'test' },
  { fn: isDev, expect: process.env.NODE_ENV === 'development' },
]
`),O({id:"lib-promises"},"promises"),U(["Helper function to wrap nodejs callback functions and promises with ease."," Handles the try/catch steps internally and returns a resolved or rejected promise."]),ee(`
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
`),O({id:"lib-http"},"http"),U("HTTP utility for making requests in tests. Supports both HTTP and HTTPS."),ee(`
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
`),U("Error Handling:"),ee(`
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
`),U("Note: HTTP module automatically handles:"),J([F("Protocol detection (HTTP vs HTTPS)"),F("JSON parsing for responses with Content-Type: application/json"),F("Raw string returns for non-JSON responses"),F("rejectUnauthorized: false for self-signed certificates")]),j({},"HttpOptions"),ee(`
import type { HttpOptions } from '@magic/test'
`),U("| Option | Type | Default | Description |"),U("| ------ | ---- | ------- | ----------- |"),U("| timeout | number | 30000 | Request timeout in milliseconds |"),U("| rejectUnauthorized | boolean | true | Reject self-signed certs |"),U("| maxSize | number | - | Maximum response size in bytes |"),U("| requestOptions | RequestOptions | - | Additional request options |"),O({id:"lib-trycatch"},"trycatch"),U("allows to catch and test functions without bubbling the errors up into the runtime"),ee(`
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
`),O({id:"lib-error"},"error"),U(["exports ",X({to:"https://github.com/magic/error",text:"@magic/error"})," which returns errors with optional names."]),ee(`
import { error } from '@magic/test'

export default [
  {
    fn: tryCatch(error('Message', 'E_NAME')),
    expect: e => e.name === 'E_NAME' && e.message === 'Message',
    info: 'Errors have messages and (optional) names.',
  },
]
`),O({id:"lib-mock"},"mock"),U("Mock and spy utilities for function testing."),ee(`
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
`),j({},"mock.fn properties"),J([F("calls - Array of all call arguments"),F("returns - Array of all return values"),F("errors - Array of all thrown errors (null for non-throwing calls)"),F("callCount - Number of times called")]),j({},"mock.fn methods"),J([F("mockReturnValue(value) - Set return value (chainable)"),F("mockThrow(error) - Set error to throw (chainable)"),F("getCalls() - Get all call arguments"),F("getReturns() - Get all return values"),F("getErrors() - Get all thrown errors")]),j({id:"lib-mock-log"},"mock.log"),U("Logging utilities that respect NODE_ENV for conditional output:"),ee(`
import { mock } from '@magic/test'

mock.log.log('Debug info')      // Logs if not NODE_ENV=production
mock.log.warn('Heads up')       // Logs if not NODE_ENV=production
mock.log.error('Something went wrong')  // Always logs
mock.log.time('operation')     // Logs timing if not NODE_ENV=production
mock.log.timeEnd('operation')   // Logs timing end if not NODE_ENV=production
`),O({id:"lib-has"},"has"),U(["Functions for asserting object properties without needing explicit type annotations"," or stringifying functions."]),U(["Full documentation for every has.* check, including has.not, lives on the ",X({to:"/lib/has/"},"has page"),"."]),ee(`
import { has, is } from '@magic/test'
`),j({},"has.property(key, check)"),U("Check a single property. Accepts either a predicate or a literal value."),ee(`
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
`),j({},"has.properties(spec)"),U("Check multiple properties. Mix predicates and literal values."),ee(`
{
  fn: () => getUser(),
  expect: has.properties({ name: is.string, age: is.num }),
  info: 'user has required properties',
}
`),j({},"has.any(spec)"),U("Check at least one property matches. Accepts predicates or literals."),ee(`
{
  fn: () => parseResult(),
  expect: has.any({ error: is.error, data: is.object }),
  info: 'result has either error or data',
}
`),j({},"has.nested(path, predicate)"),U("Check a nested property path."),ee(`
{
  fn: () => getData(),
  expect: has.nested('user.profile.name', is.string),
  info: 'deep nested property exists',
}
`),j({},"has.string(substring)"),U("Check if value is a string containing substring."),ee(`
{
  fn: () => error.message,
  expect: has.string('failed to connect'),
  info: 'error message contains helpful context',
}
`),j({},"has.key(keyName)"),U("Check if object has a specific key."),j({},"has.keys(keyNames[])"),U("Check if object has all specified keys."),j({},"has.includes(item)"),U("Check if array or string contains item (uses deep.equal for arrays)."),j({},"has.oneOf(options[])"),U("Check if value equals one of the options (uses deep.equal)."),j({},"has.matches(regex)"),U("Check if string matches regex pattern."),O({id:"lib-version"},"version"),U(["The version plugin checks your code according to a spec defined by you."," This is designed to warn you on changes to your exports."]),U(["Internally, the version function calls ",X({to:"https://github.com/magic/types",text:"@magic/types"})," and all functions exported from it are valid type strings in version specs."]),ee(`
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
`),U(["Using `['obj', false]` in a spec will test that the parent is an object"," without checking the key/value pairs inside."]),O({id:"lib-dom"},"DOM Environment"),U(["@magic/test automatically initializes a DOM environment when imported,"," making browser APIs available in Node.js."]),j({},"Available globals"),J([F("Core: document, window, self, navigator, location, history"),F("DOM types: Node, Element, HTMLElement, SVGElement, Document, DocumentFragment"),F("Events: Event, CustomEvent, MouseEvent, KeyboardEvent, InputEvent, TouchEvent, PointerEvent"),F("Forms: FormData, File, FileList, Blob"),F("Networking: URL, URLSearchParams, XMLHttpRequest, fetch, WebSocket"),F("Storage: Storage, sessionStorage, localStorage"),F("Observers: MutationObserver, IntersectionObserver, ResizeObserver"),F("Timers: setTimeout, setInterval, requestAnimationFrame")]),j({},"DOM Utilities"),ee(`
import { initDOM, getDocument, getWindow } from '@magic/test'

// Get the document and window instances
const doc = getDocument()
const win = getWindow()

// Manually re-initialize if needed
initDOM()
`),j({},"Canvas/Image Polyfills"),J([F("new Image() - Parses PNG data URLs to extract dimensions"),F('canvas.getContext("2d") - Returns node-canvas context'),F("canvas.toDataURL() - Serializes canvas to data URL")])],"/test/lib/has/":()=>[A({id:"has"},"has"),U(["Functions for asserting object properties, array contents, and string"," values without needing explicit type annotations or stringifying"," functions. Every has.* check returns a predicate, so it works directly"," as a test expectation:"]),ee(`
import { has, is } from '@magic/test'

{
  fn: () => getUser(),
  expect: has.property('name', is.string),
  info: 'user name is a string',
}
`),O({id:"has-property"},"has.property(key, check)"),U("Check a single property. Accepts either a predicate or a literal value (uses is.deep.equal)."),ee(`
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
`),O({id:"has-properties"},"has.properties(spec)"),U("Check multiple properties. Mix predicates and literal values."),ee(`
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
`),O({id:"has-any"},"has.any(spec)"),U("Check at least one property matches. Accepts predicates or literals."),ee(`
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
`),O({id:"has-nested"},"has.nested(path, check)"),U("Check a nested property path. Accepts predicates or literal values."),ee(`
{
  fn: () => getData(),
  expect: has.nested('user.profile.name', is.string),
  info: 'deep nested property exists',
}
`),O({id:"has-string"},"has.string(...substring)"),U("Check if value is a string containing every given substring. Substring entries can also be predicates receiving the full string."),ee(`
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
`),O({id:"has-at"},"has.at(index, check)"),U("Check the element at a given index of an array. Accepts a predicate, a literal value, or an array of checks (all must pass)."),ee(`
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
`),O({id:"has-key"},"has.key(keyName)"),U("Check if object has a specific key."),ee(`
{
  fn: () => result,
  expect: has.key('data'),
  info: 'result has data key',
}
`),O({id:"has-keys"},"has.keys(keyNames[])"),U("Check if object has all specified keys."),ee(`
{
  fn: () => user,
  expect: has.keys(['name', 'email']),
  info: 'user has required fields',
}
`),O({id:"has-includes"},"has.includes(...items)"),U("Check if array or string contains item (uses deep.equal for arrays). With multiple items, every item must be present."),ee(`
const roles = ['admin', 'root', 'user']
{
  fn: () => roles,
  expect: has.includes('admin', 'root'),
  info: 'user has admin and root roles',
}
`),O({id:"has-oneof"},"has.oneOf(...options)"),U("Check if value equals one of the options (uses deep.equal)."),ee(`
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
`),O({id:"has-matches"},"has.matches(regex)"),U("Check if string matches regex pattern."),ee(`
{
  fn: () => phoneNumber,
  expect: has.matches(/^d{3}-d{4}$/),
  info: 'phone number is valid format',
}
`),O({id:"has-not"},"has.not"),U(["Negated versions of every has.* check. has.not.X(...) passes exactly"," when the matching has.X(...) would fail (pure logical negation):"]),J([F("has.not.property(key, check)"),F("has.not.properties(spec)"),F("has.not.any(spec)"),F("has.not.nested(path, check)"),F("has.not.string(substring)"),F("has.not.at(index, check)"),F("has.not.key(keyName)"),F("has.not.keys(keyNames[])"),F("has.not.includes(item)"),F("has.not.oneOf(options[])"),F("has.not.matches(regex)")]),ee(`
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
`),U(["Because the negation is logical, values the base check rejects also pass:"," has.not.property(...)(null) is true, since has.property(...) is false"," for null, and has.not.keys([])({...}) is false, since has.keys([])"," always passes for objects."])],"/test/svelte/":()=>[A({id:"svelte"},"Svelte Testing"),U(["@magic/test includes built-in support for testing Svelte 5 components."," It compiles Svelte components, mounts them in a DOM environment,"," and provides utilities for interacting with and asserting on component behavior."]),U(["Internally uses js-dom to create the DOM and HTML elements."]),O({id:"lib-svelte"},"mount"),ee(`
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
`),j({},"Exported Functions"),J([F("mount(filePath, options) - Mounts a Svelte component and returns { target, component, unmount }"),F("html(target) - Returns innerHTML of a mounted component's target element"),F("text(target) - Returns textContent of a target element"),F("component(instance) - Returns the component instance for accessing exported values"),F("props(target) - Returns an object of attribute name/value pairs from the target element")]),j({},"Interaction Functions"),J([F("click(target, selector?) - Clicks an element (optionally filtered by CSS selector)"),F("dblClick(target) - Double clicks"),F("contextMenu(target) - Right click"),F("mouseDown(target) - Mouse down"),F("mouseUp(target) - Mouse up"),F("mouseMove(target) - Mouse move"),F("mouseEnter(target) - Mouse enter"),F("mouseLeave(target) - Mouse leave"),F("mouseOver(target) - Mouse over"),F("mouseOut(target) - Mouse out"),F("keyDown(target, key) - Key down"),F("keyPress(target, key) - Key press"),F("keyUp(target, key) - Key up"),F("type(target, text) - Type text into input"),F("input(target, value) - Input value"),F("change(target, value) - Change event"),F("blur(target) - Blur event"),F("focus(target) - Focus event"),F("submit(target) - Submit form"),F("pointerDown(target) - Pointer down"),F("pointerUp(target) - Pointer up"),F("pointerMove(target) - Pointer move"),F("touchStart(target) - Touch start"),F("touchMove(target) - Touch move"),F("touchEnd(target) - Touch end"),F("copy(target) - Copy event"),F("cut(target) - Cut event"),F("paste(target) - Paste event"),F("dragStart(target) - Drag start"),F("drag(target) - Drag"),F("dragEnd(target) - Drag end"),F("dragEnter(target) - Drag enter"),F("dragLeave(target) - Drag leave"),F("dragOver(target) - Drag over"),F("drop(target) - Drop"),F("resize(target, w, h) - Resize"),F("scroll(target, x, y) - Scroll"),F("animationStart(target) - Animation start"),F("animationEnd(target) - Animation end"),F("transitionEnd(target) - Transition end"),F("play(target) - Play media"),F("pause(target) - Pause media"),F("trigger(target, eventType, options?) - Custom event"),F("checked(target) - Checkbox state")]),j({},"Test Properties"),J([F("component - Path to the .svelte file"),F("props - Props to pass to the component"),F("fn - Test function receiving { target, component, unmount }")]),O({id:"svelte-state"},"Accessing Component State"),ee(`
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
`),O({id:"svelte-auto-export"},"Automatic Test Exports"),U(["When testing Svelte 5 components, @magic/test automatically exports ","$state and $derived variables, making them accessible in tests"," without requiring manual exports."]),U(["**Note:** This automatic export feature is specific to **Svelte 5** only."," Svelte 4 components do not have this capability."]),ee(`
<!-- Component.svelte -->
<script>
  let count = $state(0)
  let doubled = $derived(count * 2)
  <!-- No export needed! -->
</script>

<button class="inc">+</button>
<span>{doubled}</span>
`),U("Test - works automatically!"),ee(`
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
`),U("This works automatically for all $state and $derived runes. No configuration needed!"),O({id:"svelte-error"},"Testing Error Handling"),ee(`
import { mount, tryCatch } from '@magic/test'

const component = './src/lib/svelte/components/MyComponent.svelte'

export default [
  {
    fn: tryCatch(mount, component, { props: null }),
    expect: t => t.message === 'Props must be an object, got object',
    info: 'throws when props is null',
  },
]
`),O({id:"lib-sveltekit-mocks"},"SvelteKit Mocks"),U("Mocks SvelteKit $app modules:"),ee(`
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
`),O({id:"lib-create-static-page"},"createStaticPage"),U("Creates a static page mock for SvelteKit testing:"),ee(`
import { createStaticPage } from '@magic/test'

export default [
  {
    fn: createStaticPage,
    expect: t => typeof t.html === 'string' && typeof t.render === 'function',
    info: 'createStaticPage returns html string and render function',
  },
]
`),O({id:"lib-compile-svelte"},"compileSvelte"),U("Compile Svelte component source to a module for testing:"),ee(`
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
`),U("Available functions:"),J([F("compileSvelte(source, filename) - Compiles Svelte source to JS/CSS modules"),F("ensureSvelte() - Lazy-loads the Svelte package, throws if not installed")]),O({id:"svelte-ensure"},"ensureSvelte"),U("Lazy-loads the Svelte package. Throws if Svelte is not installed:"),ee(`
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
`)],"/test/svelte/4-vs-5/":()=>[A({id:"svelte-4-vs-5"},"Svelte 4 vs 5"),U(["Testing Svelte components with @magic/test has different"," capabilities depending on the Svelte version.","These limitations are inherited from svelte."]),U("The svelte 4 functionality is not tested, we moved all our libraries to svelte 5, there be dragons."),O({},"Feature Comparison"),V([K([B("Feature"),B("Svelte 4"),B("Svelte 5")]),K([G("Component mounting"),G({class:"align-center"},"✅"),G({class:"align-center"},"✅")]),K([G("Component interaction"),G({class:"align-center"},"✅"),G({class:"align-center"},"✅")]),K([G("Auto-export ($state/$derived)"),G("❌"),G({class:"align-center"},"✅")]),K([G("Runes"),G("❌"),G({class:"align-center"},"✅")]),K([G("compileSvelte"),G({class:"align-center"},"✅"),G({class:"align-center"},"✅")]),K([G("createStaticPage"),G({class:"align-center"},"✅"),G({class:"align-center"},"✅")]),K([G("SvelteKit mocks"),G({class:"align-center"},"✅"),G({class:"align-center"},"✅")])]),O({},"What Works in Both"),J([F("Mounting components with mount()"),F("Component interaction via events (click, input, etc.)"),F("HTML assertions with html() and text()"),F("compileSvelte for source compilation"),F("createStaticPage for SvelteKit testing")]),O({},"Svelte 5 Only"),J([F("Auto-export of $state and $derived runes"),F("Rune-based reactivity")]),U(["Svelte 5 automatically exports $state and $derived variables,"," making them accessible in tests without manual exports."]),O({},"Workarounds for Svelte 4"),U(["Svelte 4 does not support automatic export of reactive state."," To access component state in tests:"]),j({},"Manual Export in Svelte 4"),ee(`
<!-- Component.svelte -->
<script>
  export let count = 0;
</script>

<button on:click={() => count++}>
  {count}
</button>
`),ee(`
import { mount } from '@magic/test'

export default [
  {
    component: './Component.svelte',
    fn: async ({ component }) => component.count,
    expect: 0,
    info: 'access exported count prop',
  },
]
`),j({},"Svelte 5 Auto-Export"),ee(`
<!-- Component.svelte (Svelte 5) -->
<script>
  let count = $state(0)
</script>

<button class="inc">+</button>
<span>{count}</span>
`),ee(`
import { mount } from '@magic/test'

export default [
  {
    component: './Component.svelte',
    fn: async ({ component }) => component.count,  // works automatically!
    expect: 0,
    info: 'access $state without manual export',
  },
]
`),O({},"See Also"),X({to:"/svelte/"},"Svelte Testing Guide")],"/test/test-isolation/":()=>[A({id:"test-isolation"},"Test Isolation"),U(["@magic/test supports test isolation to prevent tests from affecting each other."," Tests in the same suite can share state, but you can isolate them:"]),ee(`
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
`),O({id:"isolate"},"__isolate"),U("Global Isolation Mode:"),U(["By default, tests in the same file share global state."," To enable strict isolation where each test gets a fresh environment,"," set `export const __isolate = true` at the top of your test file."]),ee(`
export const __isolate = true

export default [
  { fn: () => (global.test = 1), expect: 1 },
  { fn: () => global.test === undefined, expect: true, info: 'fresh global state' },
]
`),U(["This ensures each test runs with a fresh global environment,"," preventing state leakage between tests."]),O({},"Programmatic Detection"),U(["You can programmatically check if a suite requires isolation"," using the `suiteNeedsIsolation` utility:"]),ee(`
import { suiteNeedsIsolation } from '@magic/test'

const needsIsolation = suiteNeedsIsolation(tests)
`),U("This is useful for custom runners or when building test tooling.")],"/test/writing-tests/":()=>[A({id:"writing-tests"},"Writing Tests"),O({id:"tests"},"Single Test"),U("A test can be a literal value, function, or promise:"),ee(`
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
`),O({id:"tests-multiple"},"Multiple Tests"),U("Multiple tests can be created by exporting an array or object of single test objects."),ee(`
export default [
  { fn: () => true, expect: true, info: 'expect true to be true' },
  { fn: () => false, expect: false, info: 'expect false to be false' },
]
`),U("Or exporting an object with named test arrays:"),ee(`
export default {
  multipleTests: [
    { fn: () => true, expect: true, info: 'expect true to be true' },
    { fn: () => false, expect: false, info: 'expect false to be false' },
  ]
}
`),O({id:"tests-runs"},"Running Tests Multiple Times"),U("Use the `runs` property to run a test multiple times:"),ee(`
import { is } from '@magic/test'

export default [
  {
    fn: Math.random(),
    expect: is.number,
    runs: 5,
    info: 'runs the test 5 times and expects all returns to be numbers',
  },
]
`),O({id:"tests-types"},"Testing Types"),U(["Types can be compared using ",X({to:"https://github.com/magic/types",text:"@magic/types"})]),U(["@magic/types is a richly featured and thoroughly tested type library without dependencies."," It is exported from this library for convenience."]),ee(`
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
`),j({id:"predicates-and-values"},"Predicates & Values Array"),U(["Combine type checks with value checks in a single expect array."," Each element is checked independently against the test result."," All must pass (AND semantics):"]),ee(`
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
`),U("Mix as many predicates and values as needed:"),ee(`
export default {
  fn: () => 42,
  expect: [is.number, v => v > 0, 42],
  info: 'is number, is greater than 0, equals 42',
}
`),U(["Predicate elements are functions — evaluated with the test result."," Non-predicates are compared with strict equality (primitives) or deep equality (objects/arrays)."," Pure value arrays without functions, like `expect: [1, 2, 3]`, still use deep equality as before."]),j({id:"caveat"},"Caveat"),U(["If you want to test if a function is a function, you need to wrap the function in a function."," This is because functions passed to fn get executed automatically."]),ee(`
import { is } from '@magic/test'

const fnToTest = () => {}

export default [
  {
    fn: () => fnToTest,
    expect: is.function,
    info: 'function is a function',
  },
]
`),O({id:"tests-typescript"},"TypeScript Support"),U(["@magic/test supports TypeScript test files."," You can write tests in .ts files and they will be executed directly without transpilation."]),ee(`
import type { Test } from '@magic/test'

export default [
  { fn: () => true, expect: true, info: 'TypeScript test works!' }
] satisfies Test[]
`),U("This requires Node.js 22.18.0 or later."),O({id:"tests-promises"},"Promises"),ee(`
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
`),O({id:"tests-cb"},"Callback Functions"),ee(`
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
`),O({id:"tests-hooks"},"Hooks"),j({},"Individual Test Hooks"),U("Run functions before and/or after individual tests:"),ee(`
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
`),j({id:"tests-suite-hooks"},"Suite Hooks"),U("Run functions before and/or after a suite of tests:"),ee(`
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
`),U(["Note: Suites that use beforeAll, afterAll, beforeEach or afterEach"," will run in a worker to make sure globals are not polluted for other suites."]),M({},"File-based Hooks"),U(["You can also create test/beforeAll.js and test/afterAll.js files"," that run before/after all tests."]),U("**Note:** These files must be placed at the **root** `test/` directory (not in subdirectories)."),ee(`
// test/beforeAll.js
export default () => {
  global.setup = true
  // optionally return a cleanup function
  return () => {
    global.setup = false
  }
}
`),ee(`
// test/afterAll.js
export default () => {
  // cleanup after all tests
}
`),j({id:"tests-each-hooks"},"beforeEach and afterEach"),U("Define beforeEach and afterEach hooks that run before/after each individual test:"),ee(`
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
`),O({id:"tests-magic-modules"},"Magic Modules"),U(["@magic-modules assume all HTML tags to be globally defined."," To create those globals for your test and check if a @magic-module returns the correct markup,"," just use one of those tags in your tests."]),ee(`
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
`),O({id:"test-suites"},"Test Suites"),U("Expectations for optimal test messages:"),J([F("src and test directories have the same structure and files"),F("tests one src file per test file"),F("tests one function per suite"),F("tests one feature per test")]),j({},"Filesystem Based Naming"),U("The following directory structure:"),ee(`./test/
  ./suite1.js
  ./suite2.js`),U("yields the same result as exporting the following from ./test/index.js:"),ee(`import suite1 from './suite1'
import suite2 from './suite2'

export default {
  suite1,
  suite2,
}
`),j({},"Data Driven Naming"),U("Export test structure directly from index.js:"),ee(`
export default {
  suite1: [
    { fn: () => true, expect: true },
  ],
  suite2: [
    { fn: () => false, expect: false },
  ],
}
`),j({id:"tests-file-mappings"},"Important File Mappings"),U(["If test/index.js exists, no other files will be loaded."," If test/lib/index.js exists, no other files from that subdirectory will be loaded."," Instead, the exports of those index.js will be expected to be tests."])]};w({init:{...{description:["Declaratively test your ecmascript module files."," No transpiling required for ecmascript."," Incredibly fast."],logotext:"@magic/test",menu:[{text:"Home",to:"/test/"},{text:"Getting Started",to:"/test/getting-started/"},{items:[{text:"Single Test",to:"/test/writing-tests/#tests"},{text:"Multiple Tests",to:"/test/writing-tests/#tests-multiple"},{text:"Running Multiple Times",to:"/test/writing-tests/#tests-runs"},{text:"Testing Types",to:"/test/writing-tests/#tests-types"},{text:"Promises",to:"/test/writing-tests/#tests-promises"},{text:"Callbacks",to:"/test/writing-tests/#tests-cb"},{text:"Hooks",to:"/test/writing-tests/#tests-hooks"},{text:"Suite Hooks",to:"/test/writing-tests/#tests-suite-hooks"},{text:"beforeEach/afterEach",to:"/test/writing-tests/#tests-each-hooks"},{text:"Magic Modules",to:"/test/writing-tests/#tests-magic-modules"},{text:"Test Suites",to:"/test/writing-tests/#test-suites"}],text:"Writing Tests",to:"/test/writing-tests/"},{items:[{text:"deep",to:"/test/lib/#lib-deep"},{text:"fs",to:"/test/lib/#lib-fs"},{text:"curry",to:"/test/lib/#lib-curry"},{text:"log",to:"/test/lib/#lib-log"},{text:"vals",to:"/test/lib/#lib-vals"},{text:"env",to:"/test/lib/#lib-env"},{text:"promises",to:"/test/lib/#lib-promises"},{text:"http",to:"/test/lib/#lib-http"},{text:"tryCatch",to:"/test/lib/#lib-trycatch"},{text:"error",to:"/test/lib/#lib-error"},{text:"mock",to:"/test/lib/#lib-mock"},{text:"mock.log",to:"/test/lib/#lib-mock-log"},{text:"has",to:"/test/lib/has/"},{text:"version",to:"/test/lib/#lib-version"},{text:"DOM Environment",to:"/test/lib/#lib-dom"}],text:"Utilities",to:"/test/lib/"},{items:[{text:"mount",to:"/test/svelte/#lib-svelte"},{text:"Component State",to:"/test/svelte/#svelte-state"},{text:"Auto Exports",to:"/test/svelte/#svelte-auto-export"},{text:"Error Handling",to:"/test/svelte/#svelte-error"},{text:"SvelteKit Mocks",to:"/test/svelte/#lib-sveltekit-mocks"},{text:"createStaticPage",to:"/test/svelte/#lib-create-static-page"},{text:"compileSvelte",to:"/test/svelte/#lib-compile-svelte"},{text:"Svelte 4 vs 5",to:"/test/svelte/4-vs-5/"}],text:"Svelte",to:"/test/svelte/"},{items:[{text:"package.json Setup",to:"/test/cli/#cli-packagejson"},{text:"Global Install",to:"/test/cli/#cli-global"},{text:"CLI Flags",to:"/test/cli/#cli-flags"},{text:"Sharding Tests",to:"/test/cli/#sharding"},{text:"Exit Codes",to:"/test/cli/#exit-codes"},{text:"Verbose Output",to:"/test/cli/#verbose-output"},{text:"Performance Tips",to:"/test/cli/#performance-tips"},{text:"Common Pitfalls",to:"/test/cli/#common-pitfalls"},{text:"CLI Flags Reference",to:"/test/cli/flags/"},{text:"Sharding Cheat-Sheet",to:"/test/cli/sharding-cheatsheet/"},{text:"Performance Tips",to:"/test/cli/performance-tips/"},{text:"Common Pitfalls",to:"/test/cli/common-pitfalls/"}],text:"CLI & Usage",to:"/test/cli/"},{items:[{text:"__isolate",to:"/test/test-isolation/#isolate"}],text:"Test Isolation",to:"/test/test-isolation/"},{text:"Error Codes",to:"/test/error-codes/"},{text:"Error Codes Quick Look",to:"/test/error-codes-quicklook/"},{text:"Changelog",to:"/test/changelog/"}],nospy:{show:!1},pageClass:{},pages:{"/test/404/":{description:"404 - not found.",title:"404 - not found"}},root:"/test/",theme:"dark",title:"@magic/test",url:"/test/"},url:window.location.pathname,hash:window.location.hash.substr(1)},subscriptions:e=>[[eo,es.pop]],view:e=>{let t=er[e.url]?e.url:"/404/",s=er[t],o=e.pages&&e.pages[t];return o&&Object.keys(o).forEach(t=>{e[t]=o[t]}),e.url=t,(({page:e,state:t},s)=>L({id:"Magic",class:t.pageClass},R({class:{Wrapper:!0}},[((e={},t=[])=>{let{logo:s,menu:o,logotext:r,hash:i,url:n}=e;if(s||o||r)return I({class:"Header"},[X({to:"/",class:"Logo"},[z({viewBox:"0 0 512 444"},[W({d:"M512 444L256 0 0 444z",fill:"#663695"}),S({cx:"256",cy:"294",r:"130",fill:"#fff"}),S({cx:"256",cy:"281",r:"40",fill:"#663695"}),W({d:"M256 350v44m24-44l1 13c1 27 29 27 29-7m-160-72s46-47 106-47c59 0 106 47 106 47s-47 43-106 43c-60 0-106-43-106-43zm65-75a134 134 0 0189 2",class:"stroke"}),W({d:"M256 81v53m184 270l-43-29M72 404l43-29",class:"stroke white"})])]),r&&U(r),o&&((e={})=>{let{collapse:t=!0,menu:s,hash:o}=e,{class:r="",url:i}=e;return r.includes("Menu")||(r=`Menu ${r}`.trim()),o&&!i.endsWith(o)&&(i+=`#${o}`),q({className:r},J(s.map(e=>Z({...e,url:i,collapse:t}))))})({url:n,hash:i,menu:o}),t])})(t),R({class:"Page",id:"page"},e(t)),((e=[])=>N({class:"Footer"},[R({class:"Container"},[R({class:"Credits"},["made with a few bits of ",X({to:"https://magic.github.io/",target:"_blank",rel:"noopener"},"magic")]),e])]))(),s])))({page:s,state:e},[((e={})=>z({class:"LightSwitch icon",onclick:es.changeTheme,height:25,width:25,viewBox:"0 0 352 460"},[W({d:"M149 48C96 48 48 95 47 143c-1 13 19 17 20 0-1-35 48-75 83-75 15 0 12-22-1-20z"}),W({d:"M176 0C74 0 0 83 0 176c9 91 84 118 100 204h20c-16-92-97-138-100-204C22 70 105 21 176 20zM95 400c2 68 20 48 40 60h82c20-12 38 8 40-60z"}),W({d:"M175 0c102 0 177 83 177 176-9 91-86 118-102 204h-20c16-92 99-138 102-204-2-106-86-155-157-156z"})]))(e),(({nospy:e={},cookies:t=[]})=>{let{show:s,title:o="Privacy Notice",content:r="This app neither saves, collects, nor shares any data about you.",buttonText:i="Awesome!"}=e;return s?R({class:"NoSpy"},[R({class:"Background",onclick:es.nospy.toggle}),R({class:"Container"},[o&&j(o),r&&U(r),D({onclick:es.nospy.toggle,value:i,type:"button"})])]):R({class:"NoSpy"},z({class:"icon",onclick:es.nospy.toggle,width:"25",height:"25",viewBox:"0 0 512 512"},[_([W({d:`
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