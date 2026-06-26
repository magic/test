const __MAGIC__=()=>{var e,t,s,o,r,i,n,a,l,c,p,d,u,m,f,g,h,b,v,x;let{h:y,app:w}=(e={},s=(t=[]).map,o=Array.isArray,r="u">typeof requestAnimationFrame?requestAnimationFrame:setTimeout,i=function(e){var t="";if("string"==typeof e)return e;if(o(e)&&e.length>0)for(var s,r=0;r<e.length;r++)""!==(s=i(e[r]))&&(t+=(t&&" ")+s);else for(var r in e)e[r]&&(t+=(t&&" ")+r);return t},n=function(e,t){var s={};for(var o in e)s[o]=e[o];for(var o in t)s[o]=t[o];return s},a=function(e){return e.reduce(function(e,t){return e.concat(t&&!0!==t?"function"==typeof t[0]?[t]:a(t):0)},t)},l=function(e,t){if(e!==t)for(var s in n(e,t)){var r,i;if(e[s]!==t[s]&&(r=e[s],i=t[s],!(o(r)&&o(i))||r[0]!==i[0]||"function"!=typeof r[0]))return!0;t[s]=e[s]}},c=function(e,t,s){for(var o,r,i=0,n=[];i<e.length||i<t.length;i++)o=e[i],n.push((r=t[i])?!o||r[0]!==o[0]||l(r[1],o[1])?[r[0],r[1],r[0](s,r[1]),o&&o[2]()]:o:o&&o[2]());return n},p=function(e,t,s,o,r,a){if("key"===t);else if("style"===t)for(var l in n(s,o))s=null==o||null==o[l]?"":o[l],"-"===l[0]?e[t].setProperty(l,s):e[t][l]=s;else"o"===t[0]&&"n"===t[1]?((e.actions||(e.actions={}))[t=t.slice(2)]=o)?s||e.addEventListener(t,r):e.removeEventListener(t,r):!a&&"list"!==t&&"children"!==t&&t in e?e[t]=null==o?"":o:null!=o&&!1!==o&&("class"!==t||(o=i(o)))?"children"!==t&&e.setAttribute(t,o):e.removeAttribute(t)},d=function(e,t,s){var o=e.props,r=3===e.type?document.createTextNode(e.name):(s=s||"svg"===e.name)?document.createElementNS("http://www.w3.org/2000/svg",e.name,{is:o.is}):document.createElement(e.name,{is:o.is});for(var i in o)p(r,i,null,o[i],t,s);for(var n=0,a=e.children.length;n<a;n++)r.appendChild(d(e.children[n]=h(e.children[n]),t,s));return e.node=r},u=function(e){return null==e?null:e.key},m=function(e,t,s,o,r,i){if(s===o);else if(null!=s&&3===s.type&&3===o.type)s.name!==o.name&&(t.nodeValue=o.name);else if(null==s||s.name!==o.name)t=e.insertBefore(d(o=h(o),r,i),t),null!=s&&e.removeChild(s.node);else{var a,l,c,f,g=s.props,b=o.props,v=s.children,x=o.children,y=0,w=0,k=v.length-1,E=x.length-1;for(var T in i=i||"svg"===o.name,n(g,b))("value"===T||"selected"===T||"checked"===T?t[T]:g[T])!==b[T]&&p(t,T,g[T],b[T],r,i);for(;w<=E&&y<=k&&null!=(c=u(v[y]))&&c===u(x[w]);)m(t,v[y].node,v[y],x[w]=h(x[w++],v[y++]),r,i);for(;w<=E&&y<=k&&null!=(c=u(v[k]))&&c===u(x[E]);)m(t,v[k].node,v[k],x[E]=h(x[E--],v[k--]),r,i);if(y>k)for(;w<=E;)t.insertBefore(d(x[w]=h(x[w++]),r,i),(l=v[y])&&l.node);else if(w>E)for(;y<=k;)t.removeChild(v[y++].node);else{for(var T=y,S={},C={};T<=k;T++)null!=(c=v[T].key)&&(S[c]=v[T]);for(;w<=E;){if(c=u(l=v[y]),f=u(x[w]=h(x[w],l)),C[c]||null!=f&&f===u(v[y+1])){null==c&&t.removeChild(l.node),y++;continue}null==f||1===s.type?(null==c&&(m(t,l&&l.node,l,x[w],r,i),w++),y++):(c===f?(m(t,l.node,l,x[w],r,i),C[f]=!0,y++):null!=(a=S[f])?(m(t,t.insertBefore(a.node,l&&l.node),a,x[w],r,i),C[f]=!0):m(t,l&&l.node,null,x[w],r,i),w++)}for(;y<=k;)null==u(l=v[y++])&&t.removeChild(l.node);for(var T in S)null==C[T]&&t.removeChild(S[T].node)}}return o.node=t},f=function(e,t){for(var s in e)if(e[s]!==t[s])return!0;for(var s in t)if(e[s]!==t[s])return!0},g=function(e){return"object"==typeof e?e:v(e)},h=function(e,t){return 2===e.type?((!t||!t.lazy||f(t.lazy,e.lazy))&&((t=g(e.lazy.view(e.lazy))).lazy=e.lazy),t):e},b=function(e,t,s,o,r,i){return{name:e,props:t,children:s,node:o,type:i,key:r}},v=function(s,o){return b(s,e,t,o,void 0,3)},x=function(t){return 3===t.nodeType?v(t.nodeValue,t):b(t.nodeName.toLowerCase(),e,s.call(t.childNodes,x),t,void 0,1)},{h:function(t,s){for(var r,i=[],n=[],a=arguments.length;a-- >2;)i.push(arguments[a]);for(;i.length>0;)if(o(r=i.pop()))for(var a=r.length;a-- >0;)i.push(r[a]);else!1===r||!0===r||null==r||n.push(g(r));return s=s||e,"function"==typeof t?t(s,n):b(t,s,n,void 0,s.key)},app:function(e){var t={},s=!1,i=e.view,n=e.node,l=n&&x(n),p=e.subscriptions,d=[],u=function(e){b(this.actions[e.type],e)},f=function(e){return t!==e&&(t=e,p&&(d=c(d,a([p(t)]),b)),i&&!s&&r(v,s=!0)),t};let{middleware:h=e=>e}=e,b=h((e,s)=>"function"==typeof e?b(e(t,s)):o(e)?"function"==typeof e[0]||o(e[0])?b(e[0],"function"==typeof e[1]?e[1](s):e[1]):(a(e.slice(1)).map(function(e){e&&e[0](b,e[1])},f(e[0])),t):f(e));var v=function(){s=!1,n=m(n.parentNode,n,l,l=g(i(t)),u)};b(e.init)}}),k=e=>(t={},s)=>{let o=(e,...t)=>t.some(t=>t===typeof e);if(o(s,"undefined")){if(t.props)return y(e,{},[t]);o(t,"string","number","function")||Array.isArray(t)?(s=t,t={}):o(t.View,"function")&&(s=t.View,t={})}return y(e,t,s)},E=k("a"),T=k("button"),S=k("circle"),C=k("code");k("description");let R=k("div"),j=k("footer"),N=k("g"),M=k("h1"),A=k("h2"),_=k("h3"),O=k("h4"),P=k("header"),D=k("img"),I=k("input"),F=k("li");k("link");let L=k("main");k("meta");let q=k("nav"),U=k("p"),W=k("path"),z=k("pre");k("script");let H=k("span"),$=k("svg");k("title");let V=k("ul"),G=({to:e,action:t=Y.go,text:s,...o},r)=>{let{href:i,nofollow:n,noreferrer:a,...l}=o;return l.href=e=e||i||"",s&&r?s=[s,r]:s||(s=r||e),"/"===e[0]||"#"===e[0]?l.onclick=[t,J.preventDefault]:(l.target="_blank",l.rel="noopener",n&&(l.rel+=" nofollow"),a&&(l.rel+=" noreferrer")),E(l,s)},B=e=>{let{collapse:t,items:s=[],text:o,url:r,...i}=e,n={class:{}},{to:a}=i;a===r&&(n.class.active=!0);let l=[];return(!t||r.includes(a))&&s.length&&(l=V(s.map(e=>B({url:r,collapse:t,...e})))),F(n,[a?G(i,o):H(i,o),l])},K=(e,t)=>{"string"==typeof e?e={content:e}:t?e={content:t,...e}:Array.isArray(e)&&(e={content:e.join("")});let{content:s,lines:o=!0}=e;return R({class:{Pre:!0,lines:o&&"false"!==o}},[R({class:"menu"},[T({onclick:[Y.pre.clip,e=>({e,content:s})]},"copy")]),z(s.trim().split("\n").map(K.Line))])};K.Comment=e=>H({class:"comment"},e),K.Line=e=>C({class:"line"},K.Words(e)),K.Word=e=>{if(!e)return"";let t=e.includes("://"),s=e.startsWith("mailto:")||e.includes("@")&&e.includes(".");if(t||s)return G({to:e,text:e});let o="";return("state"===e?o="state":"actions"===e?o="actions":"effects"===e?o="effects":"subscriptions"===e?o="subscriptions":J.pre.keywords.includes(e)?o="keyword":J.pre.builtins.includes(e)?o="builtin":J.pre.booleans.includes(e)&&(o="boolean"),o)?H({class:o},e):e},K.Words=e=>{let[t,...s]=e.split(J.pre.commentRegex);if(!t.endsWith(":")&&s.length)return[K.Words(t),K.Comment(s.join("").split(J.pre.wordRegex).map(K.Word))];let o=[],r=e;return(e.replace(J.pre.stringRegex,e=>{if(r){let[t,s]=r.split(e);t&&o.push(t.split(J.pre.wordRegex).map(K.Word).filter(e=>e)),r=s}o.push(H({class:"string"},e))}),r!==e)?(r&&o.push(r.split(J.pre.wordRegex).map(K.Word).filter(e=>e)),o):e.split(J.pre.wordRegex).filter(e=>e).map(K.Word)};let J={pre:{booleans:["true","false"],builtins:["Array","Object","String","Number","RegExp","Null","Symbol","Set","WeakSet","Map","WeakMap","setInterval","setTimeout","Promise","JSON","Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Uint16Array","Int32Array","Uint32Array","Float32Array","Float64Array"],commentRegex:/(\/\/)/gim,keywords:["let","this","long","package","float","goto","private","class","if","short","while","protected","with","debugger","case","continue","volatile","interface","instanceof","super","synchronized","throw","extends","final","export","throws","try","import","double","enum","boolean","abstract","function","implements","typeof","transient","break","default","do","static","void","int","new","async","native","switch","else","delete","null","public","var","await","byte","finally","catch","in","return","for","get","const","char","module","exports","require","npm","install","=>"],stringRegex:/("|')(.*?)\1/gim,wordRegex:/( )/gim},undefined:{code:"ERR_UNSUPPORTED_DIR_IMPORT",url:"file:///home/j/dev/magic/util/test/node_modules/@magic-libraries"}},Y={changeTheme:e=>({...e,pageClass:{...e.pageClass,light:"dark"===e.theme},theme:"dark"===e.theme?"light":"dark"}),go:(e,t)=>{if(!t||!t.currentTarget)return e;let s=t.currentTarget.href.replace(window.location.origin,""),[o,r=""]=s.split("#");if(o===e.url&&r===e.hash)return r&&(window.location.hash=r),e;let i=e.pages&&e.pages[o]&&e.pages[o].title;i&&(document.title=e.title=i),o!==e.url?r||window.scrollTo({top:0}):window.location.hash=r;let{scrollY:n}=window;return window.history.pushState({url:o,hash:r,scrollY:n},e.title,s),{...e,url:o,hash:r,prev:e.url}},nospy:{toggle:e=>(e.nospy.show=!e.nospy.show,{...e})},pop:(e,t)=>{let{pathname:s,hash:o}=window.location;o=o.substring(1);let r=0;return t.state&&(s=t.state.url,o=t.state.hash,r=t.state.scrollY||0),o?window.location.hash=o:window.scroll({top:r}),{...e,url:s,hash:o}},pre:{clip:(e,{content:t})=>{if("u">typeof document&&"function"==typeof document.execCommand){let e=document.createElement("textarea");e.id="copy",e.innerHTML=t,document.body.appendChild(e);let s=document.getElementById("copy");s.select(),document.execCommand("copy"),document.body.removeChild(s)}return e}}},X=(e,t)=>{let s=s=>e(t,s);return addEventListener("popstate",s),()=>removeEventListener("popstate",s)},Q={"/test/":e=>[M({id:"magictest"},"@magic/test"),U(["Declaratively test your ecmascript module files."," No transpiling of either your codebase nor the tests."," Incredibly fast."]),(e=>{if("string"==typeof e)e={project:e};else if(!e.project)return;let{branch:t="master",host:s="github"}=e,{project:o=!1}=e,r="",i=o;o.startsWith("@")?(r="@",o=o.substr(1)):i=o.split("/")[1];let n=[["npm",(e=o)=>e&&{to:`https://www.npmjs.com/package/${i}`,src:`https://img.shields.io/npm/v/${r}${e}?color=blue`}],["node",(e=o)=>e&&{src:`https://img.shields.io/node/v/${r}${e}?color=blue`}],["license",(e=o)=>e&&{src:`https://img.shields.io/npm/l/${r}${e}?color=blue`}],["travis",(e=o)=>e&&{to:`https://travis-ci.com/${e}`,src:`https://img.shields.io/travis/com/${e}/${t}`}],["appveyor",(e=o)=>{if(e){let[s,o]=e.split("/");return s=s.replace(/-/g,""),{to:`https://ci.appveyor.com/project/${s}/${o}/branch/${t}`,src:`https://img.shields.io/appveyor/ci/${s}/${o}/${t}.svg`}}}],["coveralls",(e=o)=>({to:`https://coveralls.io/${s}/${e}`,src:`https://img.shields.io/coveralls/${s}/${e}/${t}.svg`})],["snyk",(e=o)=>e&&{to:`https://snyk.io/test/${s}/${e}`,src:`https://img.shields.io/snyk/vulnerabilities/github/${e}.svg`}]].map(([t,s])=>s(e[t]));if(n.length)return V({class:"GitBadges"},n.map(({to:e,src:t})=>{if(!t)return;let s=(e=>{"string"==typeof e&&(e={src:e});let{loading:t="lazy"}=e;if(e.src)return e.hasOwnProperty("alt")||(e.title?e.alt=e.title:e.alt=""),e.loading=t,D(e)})({src:t,height:"23"});return e?F(G({to:e},s)):F(s)}))})("@magic/test"),A({id:"getting-started"},"Getting Started"),U("Be in a nodejs project."),_({},"Install"),K({lines:"false"},"npm i --save-dev --save-exact @magic/test"),_({},"Create a test"),K(`
// test/yourFileToTest.js
export default [
  { fn: () => true, expect: true, info: 'true is true' },
]
`),_({},"Add npm scripts"),K(`
{
  "scripts": {
    "test": "t -p",
    "coverage": "t"
  }
}
`),_({},"Run tests"),K(`
npm test
`),U("Example output:"),K(`
### Testing package: @magic/test
Ran 2 tests. Passed 2/2 100%
`),U("Faster output from a bigger project:"),K(`
### Testing package: @artificialmuseum/engine
Ran 90307 tests in 274.5ms. Passed 90307/90307 100%
`),A({id:"features"},"Features"),V([F([G({to:"/writing-tests/"},"Write tests")," in plain JavaScript or TypeScript"]),F([G({to:"/lib/"},"Utility functions")," for deep equality, mocking, HTTP, and more"]),F([G({to:"/svelte/"},"Svelte 5")," component testing built-in"]),F([G({to:"/cli/"},"CLI tools")," with sharding for parallel test execution"]),F([G({to:"/test-isolation/"},"Test isolation")," for preventing state leakage"]),F([G({to:"/error-codes/"},"Error codes")," for programmatic error handling"])]),A({id:"quick-examples"},"Quick Examples"),_({},"Simple test"),K(`
export default [
  { fn: () => 1 + 1, expect: 2 },
  { fn: () => 'hello', expect: 'hello' },
]
`),_({},"Async test"),K(`
import { promise } from '@magic/test'

export default [
  {
    fn: promise(cb => setTimeout(() => cb(null, true), 100)),
    expect: true,
    info: 'handle promises',
  },
]
`),_({},"Deep equality"),K(`
import { is } from '@magic/test'

export default [
  {
    fn: () => ({ a: 1, b: 2 }),
    expect: is.deep.equal({ a: 1, b: 2 }),
    info: 'deep compare objects',
  },
]
`),_({},"Mock function"),K(`
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
`),A({id:"learn-more"},"Learn More"),V([F(G({to:"/writing-tests/"},"Writing Tests")," - hooks, promises, types, multiple tests"),F(G({to:"/lib/"},"Utility Functions")," - deep, fs, curry, log, vals, env, http, mock, has"),F(G({to:"/svelte/"},"Svelte Testing")," - mount components, interact, assert"),F(G({to:"/cli/"},"CLI & Usage")," - flags, sharding, performance tips"),F(G({to:"/test-isolation/"},"Test Isolation")," - prevent state leakage between tests"),F(G({to:"/error-codes/"},"Error Codes")," - programmatic error handling"),F(G({to:"/changelog/"},"Changelog")," - release history")]),U(["This library tests itself. Have a look at ",G({to:"https://github.com/magic/test/tree/master/test",text:"the tests"})," on GitHub."])],"/test/404/":()=>R("404 - not found."),"/test/changelog/":e=>[M({id:"changelog"},"Changelog"),A({},"0.3.22"),U("unreleased"),A({},"0.3.21"),V([F("various build performance improvements, especially for svelte components"),F("add timing traces with MAGIC_TEST_TRACE env var and --trace CLI flag"),F("add promise-based caching via CacheManager"),F("consolidate worker pool into single source"),F("centralize caching in CacheManager at tsLoader level"),F("increase default test timeout to 30s"),F("fixed tsLoader .ts file handling"),F("add more tests for @magic/test itself"),F("implement persistent disk cache in node_modules/.magic-test-cache"),F("parallelize import resolution, barrel exports, and fs.exists checks"),F("cache fs.exists results, processImports results, and resolveViteAlias results"),F("skip writing unchanged files during compilation"),F("consolidate caches into single pendingPromises map"),F("update dependencies")]),A({},"0.3.20"),V([F("prevent double-compilation of svelte components"),F("update dependencies")]),A({},"0.3.19"),V([F("svelte edge cases"),F("custom test defines for globals")]),A({},"0.3.18"),V([F("better resolution for imported dependencies in tests"),F("especially <script> tags in svelte components that export functions/variables"),F("update dependencies")]),A({},"0.3.17"),V([F("update test discovery, had edge cases where tests were not found")]),A({},"0.3.16"),V([F("better kill handling for workers and child_process"),F("README fixes"),F("remove @systemkollektiv devDependencies"),F("update dependencies")]),A({},"0.3.15"),V([F("fix import of .svelte.js/.ts files if js/ts extension is omitted")]),A({},"0.3.14"),V([F("fireEvent function now correctly handles various addEventListener event types")]),A({},"0.3.13"),V([F("update dependencies")]),A({},"0.3.12"),V([F("make svelte optional for consumers"),F("update dependencies")]),A({},"0.3.11"),V([F("performance improvements, better checks if tests need to be isolated"),F("fix timing issues in isolation code"),F("replace regex code checks with ast checks"),F("add `has` functionality for object checks"),F("update dependencies")]),A({},"0.3.10"),V([F("fix more edge cases in svelte compilation steps"),F("add .css import support"),F("update dependencies")]),A({},"0.3.9"),V([F("fix imports of test/index.(mjs|ts|js) files")]),A({},"0.3.8"),V([F("add `--workers` flag to control max parallel workers (default: auto-detect CPU count)"),F("canvas polyfill works properly in happy-dom environment"),F("svelte: resolve svelte-only package exports"),F("svelte: fix import chain handling for components"),F("version: check if Lib is missing exports"),F("worker isolation: beforeAll and afterAll run in workers directly"),F("before fields in tests get awaited if they return a raw promise")]),A({},"0.3.7"),V([F("advanced worker isolation"),F("executing minimum number of needed workers for tests"),F("lots of internal changes to achieve this")]),A({},"0.3.6"),U("broken - tried implementing better isolation"),A({},"0.3.5"),V([F("better tsLoader resolve mechanism")]),A({},"0.3.4"),V([F("also run registerLoader in workers")]),A({},"0.3.3"),V([F("replace all import .ts with .js"),F("some test output fixes")]),A({},"0.3.2"),U("broken: some .ts references for worker.ts and unit.ts"),V([F("publish dist dir with .js files for consumers")]),A({},"0.3.1"),U("broken, dist dir missing"),A({},"0.3.0"),U("broken. node can not strip types in node_modules..."),V([F("added html support (using happy-dom, experimental!)"),F("added svelte support (experimental!)"),F("various improvements to test logic and structure of internal lib"),F("more tests")]),A({},"0.2.30"),V([F("allow tests to be written using typescript, .ts files can be test files now"),F("add some internal tests"),F("update dependencies")]),A({},"0.2.29"),V([F("tryCatch: pass on empty args"),F("update dependencies")]),A({},"0.2.28"),V([F("use node:module register function for loader"),F("allowing use of the --import flag instead of soon deprecated --loader")]),A({},"0.2.27"),V([F("allow resolving .js files as .ts files"),F("this mimics typescript .js file resolver"),F("update @types/node")]),A({},"0.2.26"),V([F("update dependencies")]),A({},"0.2.25"),V([F("update dependencies")]),A({},"0.2.24"),V([F("fix @magic/core tests on windows")]),A({},"0.2.23"),V([F("readd npm run prepublishOnly task"),F("update dependencies")]),A({},"0.2.22"),V([F("add comprehensive typescript types"),F("rework some functionality to be typesafe and typeguarded"),F("update dependencies")]),A({},"0.2.21"),V([F("update dependencies")]),A({},"0.2.20"),V([F("update dependencies")]),A({},"0.2.19"),V([F("update dependencies"),F("add unused http.post"),F("probably should replace http with fetch...")]),A({},"0.2.18"),V([F("add missing fs.statfs, fs.statfsSync and fs.promises.constants to test/spec"),F("update dependencies")]),A({},"0.2.17"),V([F("remove calls and coveralls-next, c8 takes care of coverage"),F("update dependencies")]),A({},"0.2.16"),V([F("update dependencies")]),A({},"0.2.15"),V([F("update dependencies"),F("percentage outputs print nicer numbers"),F("added http export that allows http requests in tests"),F("only supports get requests for now")]),A({},"0.2.14"),V([F("update dependencies")]),A({},"0.2.13"),V([F("update dependencies")]),A({},"0.2.12"),V([F("update dependencies")]),A({},"0.2.11"),V([F("update dependencies")]),A({},"0.2.10"),V([F("@magic/test can now test @magic/core again")]),A({},"0.2.9"),V([F("update dependencies")]),A({},"0.2.8"),V([F("update dependencies")]),A({},"0.2.7"),V([F("update dependencies"),F("replace coveralls with coveralls-next")]),A({},"0.2.6"),V([F("update dependencies")]),A({},"0.2.5"),V([F("update dependencies"),F("@magic/core is a dev dependency now")]),A({},"0.2.4"),V([F("lib/version: spec can have objects defined with ['obj', false]"),F("which will test the parent to be an object, but does not test the key/value pairs"),F("maybeInjectMagic: made magic injection more robust and faster if magic is not being used"),F("t -p now does not show the coverage information")]),A({},"0.2.3"),V([F("update dependencies")]),A({},"0.2.2"),V([F("spec values can be functions"),F("allowing arbitrary equality testing to be executed by @magic/test.version")]),A({},"0.2.1"),V([F("internal restructuring"),F("tests now output their run duration"),F("add @magic/error dependency and export it from index"),F("index.js files have the same functionality as index.js files"),F("update dependencies")]),A({},"0.2.0"),V([F("update dependencies"),F("version now tests spec and lib in a single run")]),A({},"0.1.77"),V([F("update dependencies")]),A({},"0.1.76"),V([F("update dependencies")]),A({},"0.1.75"),V([F("update dependencies")]),A({},"0.1.74"),V([F("update dependencies")]),A({},"0.1.73"),V([F("update dependencies")]),A({},"0.1.72"),V([F("update @magic/types and intermediate deps to avoid circular dependency")]),A({},"0.1.71"),V([F("update dependencies")]),A({},"0.1.70"),V([F("update dependencies")]),A({},"0.1.69"),V([F("import of magic config should work on windows")]),A({},"0.1.68"),V([F("update @magic/core to fix tests if magic.js does not exist")]),A({},"0.1.67"),V([F("silence errors if magic.js does not exist")]),A({},"0.1.66"),V([F("better handling if magic is not in use")]),A({},"0.1.65"),V([F("update dependencies"),F("testing of @magic-modules is now built in"),F('if @magic/core is installed, the tests will "just work" and return html for @magic-modules')]),A({},"0.1.64"),V([F("update dependencies (@magic/fs)")]),A({},"0.1.63"),V([F("update dependencies (c8)")]),A({},"0.1.62"),V([F("add html flag to tests, now @magic-modules can be tested"),F("update dependencies")]),A({},"0.1.61"),V([F("update dependencies")]),A({},"0.1.60"),V([F("bump required node version to 14.15.4"),F("update dependencies")]),A({},"0.1.59"),V([F("update dependencies")]),A({},"0.1.58"),V([F("update dependencies")]),A({},"0.1.57"),V([F("update dependencies")]),A({},"0.1.56"),V([F("update dependencies")]),A({},"0.1.55"),V([F("update dependencies")]),A({},"0.1.54"),V([F("update dependencies")]),A({},"0.1.53"),V([F("update dependencies")]),A({},"0.1.52"),V([F("update dependencies"),F("remove hyperapp from exports")]),A({},"0.1.51"),V([F("update dependencies")]),A({},"0.1.50"),V([F("remove @magic/css export"),F("update c8")]),A({},"0.1.49"),V([F("update @magic/css")]),A({},"0.1.48"),V([F("bump required node version to 14.2.0"),F("update dependencies")]),A({},"0.1.47"),V([F("update c8, yargs-parser")]),A({},"0.1.46"),V([F("update @magic/css")]),A({},"0.1.45"),V([F("security fix: update dependencies, yargs-parser")]),A({},"0.1.44"),V([F("update dependencies")]),A({},"0.1.43"),V([F("update dependencies")]),A({},"0.1.42"),V([F("update dependencies")]),A({},"0.1.41"),V([F("update dependencies")]),A({},"0.1.40"),V([F("update dependencies")]),A({},"0.1.39"),V([F("update coveralls, fix minimist issue above")]),A({},"0.1.38"),V([F("update dependencies, minimist sec issue")]),A({},"0.1.37"),V([F("fix: arguments for both node and c8 tests work"),F("broken in 0.1.36")]),A({},"0.1.36"),V([F("c8: --exclude, --include and --all get applied correctly")]),A({},"0.1.35"),V([F("fix: c8 errored if coverage dir did not exist"),F("update dependencies")]),A({},"0.1.34"),V([F('fix: c8 needs "report" command now')]),A({},"0.1.33"),V([F("update exported dependencies")]),A({},"0.1.32"),V([F("tests now work on windows"),F("uncaught errors will cause tests to fail with process.exit(1)")]),A({},"0.1.31"),V([F("update dependencies")]),A({},"0.1.30"),V([F("export @magic/fs")]),A({},"0.1.29"),V([F("help text can show up when --help is used")]),A({},"0.1.28"),V([F("package: engineStrict: true"),F("update cli: missing @magic/cases dependency")]),A({},"0.1.27"),V([F("remove prettier from deps")]),A({},"0.1.26"),V([F("remove commonjs support"),F("node 13+ required. awesome.")]),A({},"0.1.25"),V([F("currying now throws errors instead of returning them"),F("update @magic/css"),F("update @magic/types which now uses @magic/deep for is.deep.eq and is.deep.diff")]),A({},"0.1.24"),V([F("update @magic/css"),F("update c8")]),A({},"0.1.23"),V([F("update @magic dependencies to use npm packages instead of github")]),A({},"0.1.22"),V([F("update dependencies")]),A({},"0.1.21"),V([F("update @magic/cli to allow default args")]),A({},"0.1.20"),V([F("update broken dependencies")]),A({},"0.1.19"),V([F("update dependencies")]),A({},"0.1.18"),V([F("update dependencies"),F("require node 12.13.0")]),A({},"0.1.17"),V([F("add node 13 json support for coverage reports")]),A({},"0.1.16"),V([F("update @magic/cli for node 13 support")]),A({},"0.1.15"),V([F("update dependencies")]),A({},"0.1.14"),V([F("windows support now supports index.js files that provide test structure")]),A({},"0.1.13"),V([F("windows support is back")]),A({},"0.1.12"),V([F("update dependencies")]),A({},"0.1.11"),V([F("update prettier, coveralls"),F("add and export @magic/css to test css validity")]),A({},"0.1.10"),V([F("node 12.4.0 does not use --experimental-json-modules flag"),F("removed it in 12.4+")]),A({},"0.1.9"),V([F("test/beforeAll.js gets loaded separately if it exists"),F("test/afterAll.js gets loaded separately if it exists"),F("if the function exported from test/beforeAll.js returns another function, it will also be executed after all tests"),F("export hyperapp beta 18")]),A({},"0.1.8"),V([F("update @magic/cli")]),A({},"0.1.7"),V([F("readded calls npm run script"),F("updated c8")]),A({},"0.1.6"),V([F("update this readme and html docs"),F("tests should always process.exit(1) if they errored")]),A({},"0.1.5"),V([F("use ecmascript version of @magic/deep")]),A({},"0.1.4"),V([F("npm run scripts of @magic/test itself can be run on windows")]),A({},"0.1.3"),V([F("cli now works everywhere")]),A({},"0.1.2"),V([F("cli now works on windows again"),U("(actually, this version is broken on all platforms)")]),A({},"0.1.1"),V([F("rework of bin scripts and update dependencies to esmodules")]),A({},"0.1.0"),V([F("use esmodules instead of commonjs")])],"/test/cli/":e=>[M({id:"cli"},"CLI & Usage"),A({id:"cli-packagejson"},"package.json (recommended)"),U("Add the magic/test bin scripts to package.json:"),K(`
{
  "scripts": {
    "test": "t -p",
    "coverage": "t",
  },
  "devDependencies": {
    "@magic/test": "github:magic/test"
  }
}
`),U("Then use the npm run scripts:"),K(`
npm test
npm run coverage
`),A({id:"cli-global"},"Globally (not recommended)"),U(["You can install this library globally,"," but the recommendation is to add the dependency and scripts to the package.json file."]),U(["This both explains to everyone that your app has these dependencies"," as well as keeping your bash free of clutter."]),K(`
npm i -g @magic/test

// run tests in production mode
t -p

// run tests and get coverage in verbose mode
t
`),A({id:"cli-flags"},"CLI Flags"),U("Available command-line flags:"),V([F("-p, --production, --prod - Run tests without coverage (faster)"),F("-l, --verbose, --loud - Show detailed output including passing tests"),F("-i, --include - Files to include in coverage"),F("-e, --exclude - Files to exclude from coverage"),F("--shards N - Total number of shards to split tests across"),F("--shard-id N - Shard ID (0-indexed) to run"),F("-w, --workers N - Max parallel workers (default: auto)"),F("--help - Show help text")]),U(["Note: `--shards` and `--shard-id` must be used together."," `--shard-id` is 0-indexed (0 to N-1)."]),A({id:"sharding"},"Sharding Tests"),U("Run tests in parallel across multiple processes to speed up large test suites:"),K(`
# Run 4 shards, this is shard 0 (of 0-3)
t --shards 4 --shard-id 0

# Run shard 1
t --shards 4 --shard-id 1

# Combine with other flags
t -p --shards 4 --shard-id 2
`),U(["Tests are distributed deterministically using a hash of the test file path,"," ensuring each test always runs in the same shard."]),U("Add to your package.json for CI/CD:"),K(`
{
  "scripts": {
    "test": "t -p",
    "test:shard:0": "t -p --shards 4 --shard-id 0",
    "test:shard:1": "t -p --shards 4 --shard-id 1",
    "test:shard:2": "t -p --shards 4 --shard-id 2",
    "test:shard:3": "t -p --shards 4 --shard-id 3"
  }
}
`),U("Or use a single command to run all shards in parallel:"),K(`
# Run all 4 shards in parallel and wait for all to complete
npm run test:shard:0 & npm run test:shard:1 & npm run test:shard:2 & npm run test:shard:3 & wait
`),A({id:"exit-codes"},"Exit Codes"),U("@magic/test returns specific exit codes to indicate test results:"),U("| Exit Code | Meaning |"),U("| --------- | ------- |"),U("| 0 | All tests passed |"),U("| 1 | One or more tests failed |"),K(`
# Run tests and check exit code
npm test
echo "Exit code: $?"  # 0 = success, 1 = failure
`),A({id:"verbose-output"},"Verbose Output"),U("The -l (or --verbose, --loud) flag enables detailed output:"),K(`
# Shows all tests including passing ones
t -l
`),U("What verbose mode shows:"),V([F("All test results (not just failures)"),F("Individual test execution time"),F("Full test names with suite hierarchy"),F("Detailed error messages with stack traces")]),U("Default mode (without -l):"),V([F("Only shows failing tests"),F("Shows summary only for passing suites"),F("Faster output for large test suites")]),U("Example output without -l:"),K(`
### Testing package: my-lib
/addition.js => Pass: 3/3 100%
/multiplication.js => Pass: 4/4 100%
Ran 7 tests in 12ms. Passed 7/7 100%
`),U("Example output with -l:"),K(`
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
`),A({id:"performance-tips"},"Performance Tips"),U("Follow these tips to get the most out of @magic/test:"),_({},"Use the -p flag for development"),K(`
# Fast mode - no coverage, only shows failures
npm test
# or
t -p
`),_({},"Shard large test suites"),K(`
# Split tests across multiple processes
t --shards 4 --shard-id 0
`),_({},"Minimize async overhead"),K(`
# Slower: unnecessary async
export default {
  fn: async () => {
    return true
  },
  expect: true,
}

# Faster: sync test
export default {
  fn: () => true,
  expect: true,
}
`),_({},"Use local state instead of globals"),K(`
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
`),_({},"Batch related tests"),K(`
# Faster: single suite with multiple tests
export default [
  { fn: () => add(1, 2), expect: 3 },
  { fn: () => add(0, 0), expect: 0 },
  { fn: () => add(-1, 1), expect: 0 },
]
`),A({id:"common-pitfalls"},"Common Pitfalls"),U("Avoid these common mistakes when writing tests:"),_({},"1. Forgetting to return in async tests"),K(`
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
`),_({},"2. Not wrapping callback functions"),K(`
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
`),_({},"3. Mutating shared state between tests"),K(`
# Wrong: counter persists between tests
let counter = 0
export default [
  { fn: () => ++counter, expect: 1 },
  { fn: () => ++counter, expect: 2 }, // fails! counter is now 1
]

# Correct: use local state or reset in beforeEach
let counter = 0
const beforeEach = () => { counter = 0 }
export default {
  beforeEach,
  tests: [
    { fn: () => ++counter, expect: 1 },
    { fn: () => ++counter, expect: 1 }, // passes - reset before each
  ],
}
`),_({},"4. Using the wrong equality check"),K(`
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
`),_({},"5. Not awaiting async operations"),K(`
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
`),_({},"6. Incorrect hook usage"),K(`
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
const beforeAll = () => {}
const afterAll = () => {}
export default {
  beforeAll,
  afterAll,
  tests: [
    { fn: () => true, expect: true },
  ],
}
`)],"/test/error-codes/":e=>[M({id:"error-codes"},"Error Codes"),U(["@magic/test uses error codes to help with debugging and programmatic error handling."," You can import these constants from `@magic/test`:"]),K(`
import { ERRORS, createError } from '@magic/test'
`),A({},"Available Error Codes"),U("| Code | Description |"),U("| ---- | ----------- |"),U("| ERRORS.E_EMPTY_SUITE | Test suite is not exporting any tests |"),U("| ERRORS.E_RUN_SUITE_UNKNOWN | Unknown error occurred while running a suite |"),U("| ERRORS.E_TEST_NO_FN | Test object is missing the `fn` property |"),U("| ERRORS.E_TEST_EXPECT | Test expectation failed |"),U("| ERRORS.E_TEST_BEFORE | Before hook failed |"),U("| ERRORS.E_TEST_AFTER | After hook failed |"),U("| ERRORS.E_TEST_FN | Test function threw an error |"),U("| ERRORS.E_NO_TESTS | No test suites found |"),U("| ERRORS.E_IMPORT | Failed to import a test file |"),U("| ERRORS.E_MAGIC_TEST | General test execution error |"),A({},"createError"),U("Create custom errors with specific codes and messages:"),K(`
import { createError, ERRORS } from '@magic/test'

export default [
  {
    fn: () => createError(ERRORS.E_TEST_NO_FN, 'Missing fn property'),
    expect: e => e.code === 'E_TEST_NO_FN' && e.message === 'Missing fn property',
    info: 'createError creates errors with code and message',
  },
]
`),A({},"Usage Example"),K(`
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
`),A({},"Error Object Properties"),V([F('code - The error code string (e.g., "E_TEST_NO_FN")'),F("message - Human-readable error message"),F("stack - Stack trace for debugging")])],"/test/lib/":e=>[M({id:"lib"},"Utility Belt"),U(["@magic/test exports some utility functions"," that make working with complex test workflows simpler."]),A({id:"lib-deep"},"deep"),U(["Exported from ",G({to:"https://github.com/magic/deep",text:"@magic/deep"}),", deep equality and comparison utilities."]),K(`
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
`),U("Available functions:"),V([F("deep.equal(a, b) - deep equality check"),F("deep.different(a, b) - deep difference check"),F("deep.contains(container, item) - deep inclusion check"),F("deep.changes(a, b) - get differences between objects")]),A({id:"lib-fs"},"fs"),U(["Exported from ",G({to:"https://github.com/magic/fs",text:"@magic/fs"}),", file system utilities."]),K(`
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
`),U("Common methods:"),V([F("fs.readFile(path, encoding) - read file content"),F("fs.writeFile(path, data) - write file content"),F("fs.exists(path) - check if file exists"),F("fs.mkdir(path, options) - create directory"),F("fs.rmdir(path) - remove directory"),F("fs.stat(path) - get file stats"),F("fs.readdir(path) - read directory contents"),F("Plus async versions in fs.promises")]),A({id:"lib-curry"},"curry"),U(["Currying can be used to split the arguments of a function into multiple nested functions."," This helps if you have a function with complicated arguments that you just want to quickly shim."]),K(`
import { curry } from '@magic/test'

const compare = (a, b) => a === b
const curried = curry(compare)
const shimmed = curried('shimmed_value')

export default {
  fn: shimmed('shimmed_value'),
  expect: true,
  info: 'expect will be called with a and b and a will equal b',
}
`),A({id:"lib-log"},"log"),U("Logging utility for test output. Colors supported automatically."),K(`
import { log } from '@magic/test'

log.debug('Debug info')
log.info('Something happened')
log.warn('Heads up')
log.error('Something went wrong')
log.critical('Game over')
`),U("Supports multiple arguments:"),K(`
log.info('Testing', library, 'at version', version)
`),A({id:"lib-vals"},"vals"),U(["Exports JavaScript type constants for testing against any value."," Useful for fuzzing and property-based testing."]),K(`
import { vals, is } from '@magic/test'

export default [
  { fn: () => 'test', expect: is.string, info: 'test if value is a string' },
  { fn: () => vals.true, expect: true, info: 'boolean true value' },
  { fn: () => vals.email, expect: is.email, info: 'valid email format' },
  { fn: () => vals.error, expect: is.error, info: 'error instance' },
]
`),U("Available Constants:"),V([F("Primitives: true, false, number, num, float, int, string, str"),F("Empty values: nil, emptystr, emptyobject, emptyarray, undef"),F("Collections: array, object, obj"),F("Time: date, time"),F("Errors: error, err"),F("Colors: rgb, rgba, hex3, hex6, hexa4, hexa8"),F("Other: func, truthy, falsy, email, regexp")]),A({id:"lib-env"},"env"),U("Environment detection utilities for conditional test behavior."),U("Available utilities:"),V([F("isNodeProd - checks if NODE_ENV is set to production"),F("isNodeDev - checks if NODE_ENV is set to development"),F("isProd - checks if -p flag is passed to the CLI"),F("isVerbose - checks if -l flag is passed to the CLI"),F("getErrorLength - returns error length limit from MAGIC_TEST_ERROR_LENGTH env var (0 = unlimited)")]),K(`
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
`),_({id:"lib-env-constants"},"Environment Constants"),U("These boolean constants reflect the current NODE_ENV:"),K(`
import { isProd, isTest, isDev } from '@magic/test'

export default [
  { fn: isProd, expect: process.env.NODE_ENV === 'production' },
  { fn: isTest, expect: process.env.NODE_ENV === 'test' },
  { fn: isDev, expect: process.env.NODE_ENV === 'development' },
]
`),A({id:"lib-promises"},"promises"),U(["Helper function to wrap nodejs callback functions and promises with ease."," Handles the try/catch steps internally and returns a resolved or rejected promise."]),K(`
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
`),A({id:"lib-http"},"http"),U("HTTP utility for making requests in tests. Supports both HTTP and HTTPS."),K(`
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
`),U("Error Handling:"),K(`
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
`),U("Note: HTTP module automatically handles:"),V([F("Protocol detection (HTTP vs HTTPS)"),F("JSON parsing for responses with Content-Type: application/json"),F("Raw string returns for non-JSON responses"),F("rejectUnauthorized: false for self-signed certificates")]),_({},"HttpOptions"),K(`
import type { HttpOptions } from '@magic/test'
`),U("| Option | Type | Default | Description |"),U("| ------ | ---- | ------- | ----------- |"),U("| timeout | number | 30000 | Request timeout in milliseconds |"),U("| rejectUnauthorized | boolean | true | Reject self-signed certs |"),U("| maxSize | number | - | Maximum response size in bytes |"),U("| requestOptions | RequestOptions | - | Additional request options |"),A({id:"lib-trycatch"},"trycatch"),U("allows to catch and test functions without bubbling the errors up into the runtime"),K(`
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
`),A({id:"lib-error"},"error"),U(["exports ",G({to:"https://github.com/magic/error",text:"@magic/error"})," which returns errors with optional names."]),K(`
import { error } from '@magic/test'

export default [
  {
    fn: tryCatch(error('Message', 'E_NAME')),
    expect: e => e.name === 'E_NAME' && e.message === 'Message',
    info: 'Errors have messages and (optional) names.',
  },
]
`),A({id:"lib-mock"},"mock"),U("Mock and spy utilities for function testing."),K(`
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
`),_({},"mock.fn properties"),V([F("calls - Array of all call arguments"),F("returns - Array of all return values"),F("errors - Array of all thrown errors (null for non-throwing calls)"),F("callCount - Number of times called")]),_({},"mock.fn methods"),V([F("mockReturnValue(value) - Set return value (chainable)"),F("mockThrow(error) - Set error to throw (chainable)"),F("getCalls() - Get all call arguments"),F("getReturns() - Get all return values"),F("getErrors() - Get all thrown errors")]),_({id:"lib-mock-log"},"mock.log"),U("Logging utilities that respect NODE_ENV for conditional output:"),K(`
import { mock } from '@magic/test'

mock.log.log('Debug info')      // Logs if not NODE_ENV=production
mock.log.warn('Heads up')       // Logs if not NODE_ENV=production
mock.log.error('Something went wrong')  // Always logs
mock.log.time('operation')     // Logs timing if not NODE_ENV=production
mock.log.timeEnd('operation')   // Logs timing end if not NODE_ENV=production
`),A({id:"lib-has"},"has"),U(["Functions for asserting object properties without needing explicit type annotations"," or stringifying functions."]),K(`
import { has, is } from '@magic/test'
`),_({},"has.property(key, check)"),U("Check a single property. Accepts either a predicate or a literal value."),K(`
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
`),_({},"has.properties(spec)"),U("Check multiple properties. Mix predicates and literal values."),K(`
{
  fn: () => getUser(),
  expect: has.properties({ name: is.string, age: is.num }),
  info: 'user has required properties',
}
`),_({},"has.any(spec)"),U("Check at least one property matches. Accepts predicates or literals."),K(`
{
  fn: () => parseResult(),
  expect: has.any({ error: is.error, data: is.object }),
  info: 'result has either error or data',
}
`),_({},"has.nested(path, predicate)"),U("Check a nested property path."),K(`
{
  fn: () => getData(),
  expect: has.nested('user.profile.name', is.string),
  info: 'deep nested property exists',
}
`),_({},"has.string(substring)"),U("Check if value is a string containing substring."),K(`
{
  fn: () => error.message,
  expect: has.string('failed to connect'),
  info: 'error message contains helpful context',
}
`),_({},"has.key(keyName)"),U("Check if object has a specific key."),_({},"has.keys(keyNames[])"),U("Check if object has all specified keys."),_({},"has.includes(item)"),U("Check if array or string contains item (uses deep.equal for arrays)."),_({},"has.oneOf(options[])"),U("Check if value equals one of the options (uses deep.equal)."),_({},"has.matches(regex)"),U("Check if string matches regex pattern."),A({id:"lib-version"},"version"),U(["The version plugin checks your code according to a spec defined by you."," This is designed to warn you on changes to your exports."]),U(["Internally, the version function calls ",G({to:"https://github.com/magic/types",text:"@magic/types"})," and all functions exported from it are valid type strings in version specs."]),K(`
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
`),U(["Using `['obj', false]` in a spec will test that the parent is an object"," without checking the key/value pairs inside."]),A({id:"lib-dom"},"DOM Environment"),U(["@magic/test automatically initializes a DOM environment when imported,"," making browser APIs available in Node.js."]),_({},"Available globals"),V([F("Core: document, window, self, navigator, location, history"),F("DOM types: Node, Element, HTMLElement, SVGElement, Document, DocumentFragment"),F("Events: Event, CustomEvent, MouseEvent, KeyboardEvent, InputEvent, TouchEvent, PointerEvent"),F("Forms: FormData, File, FileList, Blob"),F("Networking: URL, URLSearchParams, XMLHttpRequest, fetch, WebSocket"),F("Storage: Storage, sessionStorage, localStorage"),F("Observers: MutationObserver, IntersectionObserver, ResizeObserver"),F("Timers: setTimeout, setInterval, requestAnimationFrame")]),_({},"DOM Utilities"),K(`
import { initDOM, getDocument, getWindow } from '@magic/test'

// Get the document and window instances
const doc = getDocument()
const win = getWindow()

// Manually re-initialize if needed
initDOM()
`),_({},"Canvas/Image Polyfills"),V([F("new Image() - Parses PNG data URLs to extract dimensions"),F('canvas.getContext("2d") - Returns node-canvas context'),F("canvas.toDataURL() - Serializes canvas to data URL")])],"/test/svelte/":e=>[M({id:"svelte"},"Svelte Testing"),U(["@magic/test includes built-in support for testing Svelte 5 components."," It compiles Svelte components, mounts them in a DOM environment,"," and provides utilities for interacting with and asserting on component behavior."]),U(["Internally uses js-dom to create the DOM and HTML elements."]),A({id:"lib-svelte"},"mount"),K(`
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
`),_({},"Exported Functions"),V([F("mount(filePath, options) - Mounts a Svelte component and returns { target, component, unmount }"),F("html(target) - Returns innerHTML of a mounted component's target element"),F("text(target) - Returns textContent of a target element"),F("component(instance) - Returns the component instance for accessing exported values"),F("props(target) - Returns an object of attribute name/value pairs from the target element")]),_({},"Interaction Functions"),V([F("click(target, selector?) - Clicks an element (optionally filtered by CSS selector)"),F("dblClick(target) - Double clicks"),F("contextMenu(target) - Right click"),F("mouseDown(target) - Mouse down"),F("mouseUp(target) - Mouse up"),F("mouseMove(target) - Mouse move"),F("mouseEnter(target) - Mouse enter"),F("mouseLeave(target) - Mouse leave"),F("mouseOver(target) - Mouse over"),F("mouseOut(target) - Mouse out"),F("keyDown(target, key) - Key down"),F("keyPress(target, key) - Key press"),F("keyUp(target, key) - Key up"),F("type(target, text) - Type text into input"),F("input(target, value) - Input value"),F("change(target, value) - Change event"),F("blur(target) - Blur event"),F("focus(target) - Focus event"),F("submit(target) - Submit form"),F("pointerDown(target) - Pointer down"),F("pointerUp(target) - Pointer up"),F("pointerMove(target) - Pointer move"),F("touchStart(target) - Touch start"),F("touchMove(target) - Touch move"),F("touchEnd(target) - Touch end"),F("copy(target) - Copy event"),F("cut(target) - Cut event"),F("paste(target) - Paste event"),F("dragStart(target) - Drag start"),F("drag(target) - Drag"),F("dragEnd(target) - Drag end"),F("dragEnter(target) - Drag enter"),F("dragLeave(target) - Drag leave"),F("dragOver(target) - Drag over"),F("drop(target) - Drop"),F("resize(target, w, h) - Resize"),F("scroll(target, x, y) - Scroll"),F("animationStart(target) - Animation start"),F("animationEnd(target) - Animation end"),F("transitionEnd(target) - Transition end"),F("play(target) - Play media"),F("pause(target) - Pause media"),F("trigger(target, eventType, options?) - Custom event"),F("checked(target) - Checkbox state")]),_({},"Test Properties"),V([F("component - Path to the .svelte file"),F("props - Props to pass to the component"),F("fn - Test function receiving { target, component, unmount }")]),A({id:"svelte-state"},"Accessing Component State"),K(`
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
`),A({id:"svelte-auto-export"},"Automatic Test Exports"),U(["When testing Svelte 5 components, @magic/test automatically exports ","$state and $derived variables, making them accessible in tests"," without requiring manual exports."]),U(["**Note:** This automatic export feature is specific to **Svelte 5** only."," Svelte 4 components do not have this capability."]),K(`
<!-- Component.svelte -->
<script>
  let count = $state(0)
  let doubled = $derived(count * 2)
  <!-- No export needed! -->
</script>

<button class="inc">+</button>
<span>{doubled}</span>
`),U("Test - works automatically!"),K(`
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
`),U("This works automatically for all $state and $derived runes. No configuration needed!"),A({id:"svelte-error"},"Testing Error Handling"),K(`
import { mount, tryCatch } from '@magic/test'

const component = './src/lib/svelte/components/MyComponent.svelte'

export default [
  {
    fn: tryCatch(mount, component, { props: null }),
    expect: t => t.message === 'Props must be an object, got object',
    info: 'throws when props is null',
  },
]
`),A({id:"lib-sveltekit-mocks"},"SvelteKit Mocks"),U("Mocks SvelteKit $app modules:"),K(`
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
`),A({id:"lib-create-static-page"},"createStaticPage"),U("Creates a static page mock for SvelteKit testing:"),K(`
import { createStaticPage } from '@magic/test'

export default [
  {
    fn: createStaticPage,
    expect: t => typeof t.html === 'string' && typeof t.render === 'function',
    info: 'createStaticPage returns html string and render function',
  },
]
`),A({id:"lib-compile-svelte"},"compileSvelte"),U("Compile Svelte component source to a module for testing:"),K(`
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
`),U("Available functions:"),V([F("compileSvelte(source, filename) - Compiles Svelte source to JS/CSS modules"),F("ensureSvelte() - Lazy-loads the Svelte package, throws if not installed")]),A({id:"svelte-ensure"},"ensureSvelte"),U("Lazy-loads the Svelte package. Throws if Svelte is not installed:"),K(`
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
`)],"/test/test-isolation/":e=>[M({id:"test-isolation"},"Test Isolation"),U(["@magic/test supports test isolation to prevent tests from affecting each other."," Tests in the same suite can share state, but you can isolate them:"]),K(`
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
`),A({id:"isolate"},"__isolate"),U("Global Isolation Mode:"),U(["By default, tests in the same file share global state."," To enable strict isolation where each test gets a fresh environment,"," set `export const __isolate = true` at the top of your test file."]),K(`
export const __isolate = true

export default [
  { fn: () => (global.test = 1), expect: 1 },
  { fn: () => global.test === undefined, expect: true, info: 'fresh global state' },
]
`),U(["This ensures each test runs with a fresh global environment,"," preventing state leakage between tests."]),A({},"Programmatic Detection"),U(["You can programmatically check if a suite requires isolation"," using the `suiteNeedsIsolation` utility:"]),K(`
import { suiteNeedsIsolation } from '@magic/test'

const needsIsolation = suiteNeedsIsolation(tests)
`),U("This is useful for custom runners or when building test tooling.")],"/test/writing-tests/":e=>[M({id:"writing-tests"},"Writing Tests"),A({id:"tests"},"Single Test"),U("A test can be a literal value, function, or promise:"),K(`
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
`),A({id:"tests-multiple"},"Multiple Tests"),U("Multiple tests can be created by exporting an array or object of single test objects."),K(`
export default [
  { fn: () => true, expect: true, info: 'expect true to be true' },
  { fn: () => false, expect: false, info: 'expect false to be false' },
]
`),U("Or exporting an object with named test arrays:"),K(`
export default {
  multipleTests: [
    { fn: () => true, expect: true, info: 'expect true to be true' },
    { fn: () => false, expect: false, info: 'expect false to be false' },
  ]
}
`),A({id:"tests-runs"},"Running Tests Multiple Times"),U("Use the `runs` property to run a test multiple times:"),K(`
import { is } from '@magic/test'

export default [
  {
    fn: Math.random(),
    expect: is.number,
    runs: 5,
    info: 'runs the test 5 times and expects all returns to be numbers',
  },
]
`),A({id:"tests-types"},"Testing Types"),U(["Types can be compared using ",G({to:"https://github.com/magic/types",text:"@magic/types"})]),U(["@magic/types is a richly featured and thoroughly tested type library without dependencies."," It is exported from this library for convenience."]),K(`
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
`),_({id:"caveat"},"Caveat"),U(["If you want to test if a function is a function, you need to wrap the function in a function."," This is because functions passed to fn get executed automatically."]),K(`
import { is } from '@magic/test'

const fnToTest = () => {}

export default [
  {
    fn: () => fnToTest,
    expect: is.function,
    info: 'function is a function',
  },
]
`),A({id:"tests-typescript"},"TypeScript Support"),U(["@magic/test supports TypeScript test files."," You can write tests in .ts files and they will be executed directly without transpilation."]),K(`
import type { Test } from '@magic/test'

export default [
  { fn: () => true, expect: true, info: 'TypeScript test works!' }
] satisfies Test[]
`),U("This requires Node.js 22.18.0 or later."),A({id:"tests-promises"},"Promises"),K(`
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
`),A({id:"tests-cb"},"Callback Functions"),K(`
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
`),A({id:"tests-hooks"},"Hooks"),_({},"Individual Test Hooks"),U("Run functions before and/or after individual tests:"),K(`
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
`),_({id:"tests-suite-hooks"},"Suite Hooks"),U("Run functions before and/or after a suite of tests:"),K(`
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
`),U(["Note: Suites that use beforeAll, afterAll, beforeEach or afterEach"," will run in a worker to make sure globals are not polluted for other suites."]),O({},"File-based Hooks"),U(["You can also create test/beforeAll.js and test/afterAll.js files"," that run before/after all tests."]),U("**Note:** These files must be placed at the **root** `test/` directory (not in subdirectories)."),K(`
// test/beforeAll.js
export default () => {
  global.setup = true
  // optionally return a cleanup function
  return () => {
    global.setup = false
  }
}
`),K(`
// test/afterAll.js
export default () => {
  // cleanup after all tests
}
`),_({id:"tests-each-hooks"},"beforeEach and afterEach"),U("Define beforeEach and afterEach hooks that run before/after each individual test:"),K(`
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
`),A({id:"tests-magic-modules"},"Magic Modules"),U(["@magic-modules assume all HTML tags to be globally defined."," To create those globals for your test and check if a @magic-module returns the correct markup,"," just use one of those tags in your tests."]),K(`
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
`),A({id:"test-suites"},"Test Suites"),U("Expectations for optimal test messages:"),V([F("src and test directories have the same structure and files"),F("tests one src file per test file"),F("tests one function per suite"),F("tests one feature per test")]),_({},"Filesystem Based Naming"),U("The following directory structure:"),K(`./test/
  ./suite1.js
  ./suite2.js`),U("yields the same result as exporting the following from ./test/index.js:"),K(`import suite1 from './suite1'
import suite2 from './suite2'

export default {
  suite1,
  suite2,
}
`),_({},"Data Driven Naming"),U("Export test structure directly from index.js:"),K(`
export default {
  suite1: [
    { fn: () => true, expect: true },
  ],
  suite2: [
    { fn: () => false, expect: false },
  ],
}
`),_({id:"tests-file-mappings"},"Important File Mappings"),U(["If test/index.js exists, no other files will be loaded."," If test/lib/index.js exists, no other files from that subdirectory will be loaded."," Instead, the exports of those index.js will be expected to be tests."])]};w({init:{...{description:["Declaratively test your ecmascript module files."," No transpiling required."," Incredibly fast."],logotext:"@magic/test",menu:[{text:"Home",to:"/test/"},{text:"Getting Started",to:"/test/#getting-started"},{items:[{text:"Single Test",to:"/test/writing-tests/#tests"},{text:"Multiple Tests",to:"/test/writing-tests/#tests-multiple"},{text:"Running Multiple Times",to:"/test/writing-tests/#tests-runs"},{text:"Testing Types",to:"/test/writing-tests/#tests-types"},{text:"Promises",to:"/test/writing-tests/#tests-promises"},{text:"Callbacks",to:"/test/writing-tests/#tests-cb"},{text:"Hooks",to:"/test/writing-tests/#tests-hooks"},{text:"Suite Hooks",to:"/test/writing-tests/#tests-suite-hooks"},{text:"beforeEach/afterEach",to:"/test/writing-tests/#tests-each-hooks"},{text:"Magic Modules",to:"/test/writing-tests/#tests-magic-modules"},{text:"Test Suites",to:"/test/writing-tests/#test-suites"}],text:"Writing Tests",to:"/test/writing-tests/"},{items:[{text:"deep",to:"/test/lib/#lib-deep"},{text:"fs",to:"/test/lib/#lib-fs"},{text:"curry",to:"/test/lib/#lib-curry"},{text:"log",to:"/test/lib/#lib-log"},{text:"vals",to:"/test/lib/#lib-vals"},{text:"env",to:"/test/lib/#lib-env"},{text:"promises",to:"/test/lib/#lib-promises"},{text:"http",to:"/test/lib/#lib-http"},{text:"tryCatch",to:"/test/lib/#lib-trycatch"},{text:"error",to:"/test/lib/#lib-error"},{text:"mock",to:"/test/lib/#lib-mock"},{text:"mock.log",to:"/test/lib/#lib-mock-log"},{text:"has",to:"/test/lib/#lib-has"},{text:"version",to:"/test/lib/#lib-version"},{text:"DOM Environment",to:"/test/lib/#lib-dom"}],text:"Utilities",to:"/test/lib/"},{items:[{text:"mount",to:"/test/svelte/#lib-svelte"},{text:"Component State",to:"/test/svelte/#svelte-state"},{text:"Auto Exports",to:"/test/svelte/#svelte-auto-export"},{text:"Error Handling",to:"/test/svelte/#svelte-error"},{text:"SvelteKit Mocks",to:"/test/svelte/#lib-sveltekit-mocks"},{text:"createStaticPage",to:"/test/svelte/#lib-create-static-page"},{text:"compileSvelte",to:"/test/svelte/#lib-compile-svelte"}],text:"Svelte",to:"/test/svelte/"},{items:[{text:"package.json Setup",to:"/test/cli/#cli-packagejson"},{text:"Global Install",to:"/test/cli/#cli-global"},{text:"CLI Flags",to:"/test/cli/#cli-flags"},{text:"Sharding Tests",to:"/test/cli/#sharding"},{text:"Exit Codes",to:"/test/cli/#exit-codes"},{text:"Verbose Output",to:"/test/cli/#verbose-output"},{text:"Performance Tips",to:"/test/cli/#performance-tips"},{text:"Common Pitfalls",to:"/test/cli/#common-pitfalls"}],text:"CLI & Usage",to:"/test/cli/"},{items:[{text:"__isolate",to:"/test/test-isolation/#isolate"}],text:"Test Isolation",to:"/test/test-isolation/"},{text:"Error Codes",to:"/test/error-codes/"},{text:"Changelog",to:"/test/changelog/"}],nospy:{show:!1},pageClass:{},pages:{"/test/404/":{description:"404 - not found.",title:"404 - not found"}},root:"/test/",theme:"dark",title:"@magic/test",url:"/test/"},url:window.location.pathname,hash:window.location.hash.substr(1)},subscriptions:e=>[[X,Y.pop]],view:e=>{let t=Q[e.url]?e.url:"/404/",s=Q[t],o=e.pages&&e.pages[t];return o&&Object.keys(o).forEach(t=>{e[t]=o[t]}),e.url=t,(({page:e,state:t},s)=>L({id:"Magic",class:t.pageClass},R({class:{Wrapper:!0}},[((e={},t=[])=>{let{logo:s,menu:o,logotext:r,hash:i,url:n}=e;if(s||o||r)return P({class:"Header"},[G({to:"/",class:"Logo"},[$({viewBox:"0 0 512 444"},[W({d:"M512 444L256 0 0 444z",fill:"#663695"}),S({cx:"256",cy:"294",r:"130",fill:"#fff"}),S({cx:"256",cy:"281",r:"40",fill:"#663695"}),W({d:"M256 350v44m24-44l1 13c1 27 29 27 29-7m-160-72s46-47 106-47c59 0 106 47 106 47s-47 43-106 43c-60 0-106-43-106-43zm65-75a134 134 0 0189 2",class:"stroke"}),W({d:"M256 81v53m184 270l-43-29M72 404l43-29",class:"stroke white"})])]),r&&U(r),o&&((e={})=>{let{collapse:t=!0,menu:s,hash:o}=e,{class:r="",url:i}=e;return r.includes("Menu")||(r=`Menu ${r}`.trim()),o&&!i.endsWith(o)&&(i+=`#${o}`),q({className:r},V(s.map(e=>B({...e,url:i,collapse:t}))))})({url:n,hash:i,menu:o}),t])})(t),R({class:"Page",id:"page"},e(t)),((e,t=[])=>j({class:"Footer"},[R({class:"Container"},[R({class:"Credits"},["made with a few bits of ",G({to:"https://magic.github.io/",target:"_blank",rel:"noopener"},"magic")]),t])]))(0),s])))({page:s,state:e},[((e={})=>$({class:"LightSwitch icon",onclick:Y.changeTheme,height:25,width:25,viewBox:"0 0 352 460"},[W({d:"M149 48C96 48 48 95 47 143c-1 13 19 17 20 0-1-35 48-75 83-75 15 0 12-22-1-20z"}),W({d:"M176 0C74 0 0 83 0 176c9 91 84 118 100 204h20c-16-92-97-138-100-204C22 70 105 21 176 20zM95 400c2 68 20 48 40 60h82c20-12 38 8 40-60z"}),W({d:"M175 0c102 0 177 83 177 176-9 91-86 118-102 204h-20c16-92 99-138 102-204-2-106-86-155-157-156z"})]))(e),(({nospy:e={},cookies:t=[]})=>{let{show:s,title:o="Privacy Notice",content:r="This app neither saves, collects, nor shares any data about you.",buttonText:i="Awesome!"}=e;return s?R({class:"NoSpy"},[R({class:"Background",onclick:Y.nospy.toggle}),R({class:"Container"},[o&&_(o),r&&U(r),I({onclick:Y.nospy.toggle,value:i,type:"button"})])]):R({class:"NoSpy"},$({class:"icon",onclick:Y.nospy.toggle,width:"25",height:"25",viewBox:"0 0 512 512"},[N([W({d:`
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