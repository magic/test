"use strict";function c(a){return k(a)||d(a)||f()}function d(a){if(Symbol.iterator in Object(a)||"[object Arguments]"===Object.prototype.toString.call(a))return Array.from(a)}function e(a,b){return k(a)||j(a,b)||f()}function f(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}function j(a,b){var c=[],d=!0,e=!1,f=void 0;try{for(var g,h=a[Symbol.iterator]();!(d=(g=h.next()).done)&&(c.push(g.value),!(b&&c.length===b));d=!0);}catch(a){e=!0,f=a}finally{try{d||null==h["return"]||h["return"]()}finally{if(e)throw f}}return c}function k(a){if(Array.isArray(a))return a}function l(a){for(var b=1;b<arguments.length;b++){var c=null==arguments[b]?{}:arguments[b],d=Object.keys(c);"function"==typeof Object.getOwnPropertySymbols&&(d=d.concat(Object.getOwnPropertySymbols(c).filter(function(a){return Object.getOwnPropertyDescriptor(c,a).enumerable}))),d.forEach(function(b){m(a,b,c[b])})}return a}function m(a,b,c){return b in a?Object.defineProperty(a,b,{value:c,enumerable:!0,configurable:!0,writable:!0}):a[b]=c,a}function n(a,b){if(null==a)return{};var c,d,e=o(a,b);if(Object.getOwnPropertySymbols){var f=Object.getOwnPropertySymbols(a);for(d=0;d<f.length;d++)c=f[d],!(0<=b.indexOf(c))&&Object.prototype.propertyIsEnumerable.call(a,c)&&(e[c]=a[c])}return e}function o(a,b){if(null==a)return{};var c,d,e={},f=Object.keys(a);for(d=0;d<f.length;d++)c=f[d],0<=b.indexOf(c)||(e[c]=a[c]);return e}function r(a){return r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&"function"==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a},r(a)}var t=function(){return{h:function(a,b){for(var c=[],d=[],e=arguments.length;2<e--;)c.push(arguments[e]);for(;c.length;){var f=c.pop();if(f&&f.pop)for(e=f.length;e--;)c.push(f[e]);else null!=f&&!0!==f&&!1!==f&&d.push(f)}return"function"==typeof a?a(b||{},d):{nodeName:a,attributes:b||{},children:d,key:b&&b.key}},app:function(a,b,c,d){function e(a){return{nodeName:a.nodeName.toLowerCase(),attributes:{},children:w.call(a.childNodes,function(a){return 3===a.nodeType?a.nodeValue:e(a)})}}function f(a){return"function"==typeof a?f(a(B,C)):null==a?"":a}function g(){v=!v;var a=f(c);for(d&&!v&&(x=u(d,x,y,y=a)),A=!1;z.length;)z.pop()()}function h(){v||(v=!0,setTimeout(g))}function j(a,b){var c={};for(var d in a)c[d]=a[d];for(var d in b)c[d]=b[d];return c}function k(a,b,c){var d={};return a.length?(d[a[0]]=1<a.length?k(a.slice(1),b,c[a[0]]):b,j(c,d)):b}function l(a,b){for(var c=0;c<a.length;)b=b[a[c++]];return b}function m(a,b,c){for(var d in c)"function"==typeof c[d]?function(d,e){c[d]=function(d){var f=e(d);return"function"==typeof f&&(f=f(l(a,B),c)),f&&f!==(b=l(a,B))&&!f.then&&h(B=k(a,j(b,f),B)),f}}(d,c[d]):m(a.concat(d),b[d]=j(b[d]),c[d]=j(c[d]));return c}function n(a){return a?a.key:null}function o(a){return a.currentTarget.events[a.type](a)}function p(a,b,c,d,e){if("key"===b);else if("style"!==b)"o"===b[0]&&"n"===b[1]?(b=b.slice(2),a.events?!d&&(d=a.events[b]):a.events={},a.events[b]=c,c?!d&&a.addEventListener(b,o):a.removeEventListener(b,o)):b in a&&"list"!==b&&"type"!==b&&"draggable"!==b&&"spellcheck"!==b&&"translate"!==b&&!e?a[b]=null==c?"":c:null!=c&&!1!==c&&a.setAttribute(b,c),(null==c||!1===c)&&a.removeAttribute(b);else if("string"==typeof c)a.style.cssText=c;else for(var f in"string"==typeof d&&(d=a.style.cssText=""),j(d,c)){var g=null==c||null==c[f]?"":c[f];"-"===f[0]?a.style.setProperty(f,g):a.style[f]=g}}function q(a,b){var c="string"==typeof a||"number"==typeof a?document.createTextNode(a):(b=b||"svg"===a.nodeName)?document.createElementNS("http://www.w3.org/2000/svg",a.nodeName):document.createElement(a.nodeName),d=a.attributes;if(d){d.oncreate&&z.push(function(){d.oncreate(c)});for(var e=0;e<a.children.length;e++)c.appendChild(q(a.children[e]=f(a.children[e]),b));for(var g in d)p(c,g,d[g],null,b)}return c}function r(a,b,c,d){for(var e in j(b,c))c[e]!==("value"==e||"checked"==e?a[e]:b[e])&&p(a,e,c[e],b[e],d);var f=A?c.oncreate:c.onupdate;f&&z.push(function(){f(a,b)})}function s(a,b){var c=b.attributes;if(c){for(var d=0;d<b.children.length;d++)s(a.childNodes[d],b.children[d]);c.ondestroy&&c.ondestroy(a)}return a}function t(a,b,c){function d(){a.removeChild(s(b,c))}var e=c.attributes&&c.attributes.onremove;e?e(b,d):d()}function u(a,b,c,d,e){if(d===c);else if(null==c||c.nodeName!==d.nodeName){var g=q(d,e);a.insertBefore(g,b),null!=c&&t(a,b,c),b=g}else if(null==c.nodeName)b.nodeValue=d;else{r(b,c.attributes,d.attributes,e=e||"svg"===d.nodeName);for(var h={},j={},l=[],m=c.children,o=d.children,p=0;p<m.length;p++){l[p]=b.childNodes[p];var s=n(m[p]);null!=s&&(h[s]=[l[p],m[p]])}for(var p=0,v=0;v<o.length;){var s=n(m[p]),w=n(o[v]=f(o[v]));if(j[s]){p++;continue}if(null!=w&&w===n(m[p+1])){null==s&&t(b,l[p],m[p]),p++;continue}if(null==w||A)null==s&&(u(b,l[p],m[p],o[v],e),v++),p++;else{var x=h[w]||[];s===w?(u(b,x[0],x[1],o[v],e),p++):x[0]?u(b,b.insertBefore(x[0],l[p]),x[1],o[v],e):u(b,l[p],null,o[v],e),j[w]=o[v],v++}}for(;p<m.length;)null==n(m[p])&&t(b,l[p],m[p]),p++;for(var p in h)j[p]||t(b,h[p][0],h[p][1])}return b}var v,w=[].map,x=d&&d.children[0]||null,y=x&&e(x),z=[],A=!0,B=j(a),C=m([],B,j(b));return h(),C},Lazy:h}}(),v=t.h,h=t.Lazy,w=t.app,x=function(a){return function(){var b=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{},d=!!(1<arguments.length&&void 0!==arguments[1])&&arguments[1],e=function(a){for(var b=arguments.length,c=Array(1<b?b-1:0),d=1;d<b;d++)c[d-1]=arguments[d];return c.some(function(b){return b===r(a)})};return d||(e(b,"string","number","function")||Array.isArray(b)?(d=b,b={}):e(b.View,"function")&&(d=b.View,b={})),v(a,b,d)}},y=x("a"),a=x("abbr"),z=x("address"),A=x("area"),B=x("article"),C=x("aside"),D=x("audio"),E=x("b"),b=x("bdi"),F=x("bdo"),G=x("blockquote"),H=x("br"),I=x("button"),J=x("canvas"),K=x("caption"),L=x("cite"),M=x("code"),N=x("col"),O=x("colgroup"),P=x("data"),Q=x("datalist"),R=x("dd"),S=x("del"),T=x("details"),U=x("dfn"),V=x("dialog"),W=x("div"),X=x("dl"),Y=x("dt"),Z=x("em"),$=x("embed"),_=x("fieldset"),aa=x("figcaption"),ba=x("figure"),ca=x("footer"),da=x("form"),ea=x("h1"),fa=x("h2"),ga=x("h3"),ha=x("h4"),ia=x("h5"),ja=x("h6"),ka=x("header"),la=x("hr"),ma=x("i"),i=x("iframe"),na=x("img"),oa=x("input"),pa=x("ins"),qa=x("kbd"),ra=x("label"),sa=x("legend"),ta=x("li"),ua=x("main"),va=x("map"),wa=x("mark"),xa=x("menu"),ya=x("menuitem"),za=x("meter"),Aa=x("nav"),Ba=x("object"),Ca=x("ol"),Da=x("optgroup"),Ea=x("option"),Fa=x("output"),Ga=x("p"),p=x("param"),Ha=x("picture"),Ia=x("pre"),Ja=x("progress"),Ka=x("q"),q=x("rp"),La=x("rt"),Ma=x("rtc"),Na=x("ruby"),Oa=x("s"),s=x("samp"),Pa=x("section"),Qa=x("select"),Ra=x("small"),Sa=x("source"),Ta=x("span"),Ua=x("strong"),Va=x("sub"),Wa=x("summary"),Xa=x("sup"),Ya=x("table"),Za=x("tbody"),$a=x("td"),_a=x("textarea"),ab=x("tfoot"),bb=x("th"),cb=x("thead"),db=x("time"),eb=x("tr"),fb=x("track"),gb=x("u"),u=x("ul"),hb=x("video"),ib=x("wbr"),jb=x("svg"),kb=x("g"),g=x("circle"),lb=x("ellipse"),mb=x("rect"),nb=x("polygon"),ob=x("path"),pb=x("defs"),qb=x("linearGradient"),rb=x("stop"),sb=x("text"),tb=x("html"),ub=x("head"),vb=x("title"),wb=x("meta"),xb=x("link"),yb=x("body"),zb=x("script"),Ab=x("description"),Bb={url:"/test/",root:"/test/",logotext:"@magic/test",menu:[{to:"/#dependencies",text:"dependencies"},{to:"/#getting-started",text:"getting started",items:[{to:"-install",text:"install"},{to:"-npm-scripts",text:"npm scripts"},{to:"-quick-tests",text:"quick tests"},{to:"-coverage",text:"coverage"}]},{to:"/#test-suites",text:"test suites",items:[{to:"-fs",text:"fs based test suites"},{to:"-data",text:"data based test suites"}]},{to:"/#tests",text:"writing tests",items:[{to:"-types",text:"testing types"},{to:"-multiple",text:"multiple tests in one file"},{to:"-promises",text:"promises"},{to:"-cb",text:"callback functions"},{to:"-hooks",text:"run function before / after individual tests"},{to:"-suite-hooks",text:"run function before / after suite of tests"}]},{to:"/#lib",text:"utility functions",items:[{to:"-curry",text:"curry"},{to:"-vals",text:"vals"},{to:"-trycatch",text:"tryCatch"},{to:"-promises",text:"promises"}]},{to:"/#usage",text:"Cli / Js Api Usage",items:[{to:"-js",text:"js api"},{to:"-cli",text:"cli"},{to:"-global",text:"npm i -g"}]}],pre:{theme:"light"}},Cb={mapClickToGo:function mapClickToGo(a){return function(b){return b.preventDefault(),{to:a,e:b}}},listenPopState:function listenPopState(a,b){var c=function(c){return a(b,c)};return addEventListener("popstate",c),function(){return removeEventListener("popstate",c)}}},Db=function(a){var b=a.items,c=a.hash,d=a.url,e=void 0===d?"":d,f=a.root,g=n(a,["items","hash","url","root"]),h=g["class"],i=void 0===h?"Menu":h,j=g.collapse;if(b.length)return c&&(e+="#".concat(c)),Aa({class:i},u(b.map(function(a){return Db.Item(l({},a,{url:e,root:f,collapse:void 0===j||j}))})))};Db.Item=function(a){var b=a.url,c=a.text,d=a.items,e=void 0===d?[]:d,f=a.parentTo,g=void 0===f?void 0:f,h=a.collapse,j=a.root,k=n(a,["url","text","items","parentTo","collapse","root"]);if(k.to||c){var m={class:"MenuItem"};if(g){var i=k.to.includes("://"),o=k.to.startsWith("/"),p=!g||k.to.startsWith(g);p||o||i||(!g.endsWith("/")&&!k.to.startsWith("-")&&(g="".concat(g,"/")),k.to=g+k.to)}k.to=k.to.startsWith(j)?k.to:"".concat(j).concat(k.to.substr(1));var q=b&&b.startsWith(k.to);b===k.to&&(m["class"]+=" active");var r=[];return(e.length&&q||!h)&&(r=u(e.map(function(a){return Db.Item(l({parentTo:k.to,url:b,root:j,collapse:h},a))}))),ta(m,[k.to?Ib(k,c):Ta(k,c),r])}};var Eb=function(){return ca({class:"Footer"},[W({class:"Container"},["made with a few bits of ",Ib({to:"https://github.com/magic/core",target:"_blank",rel:"noopener"},"magic")])])},Fb=function(a){var b=a.logo,c=a.menu,d=a.tagline,e=a.logotext,f=n(a,["logo","menu","tagline","logotext"]);return(b||c||d)&&ka({class:"Header"},[(b||e)&&Ib({to:"/",class:"LogoWrapper"},[b&&Gb({class:"Logo",src:b}),e&&Ta({class:"LogoText"},e)]),c&&Db(l({},f,{items:c}))])},Gb=function(a){if("string"==typeof a&&(a={src:a}),!!a.src)return a.alt||(a.title?a.alt=a.title:(a.role="presentation",a.alt="")),na(a)},Hb=function(a){var b=a.page,c=a.state;return W({class:"Wrapper"},[Fb(c),W({class:"Page"},b?b(c):"404 - not found"),Eb(c)])},Ib=function(a,b){var c=a.to,d=n(a,["to"]),e=d.href,f=d.text,g=d.nofollow,h=d.noreferrer,i=d.onclick,j=n(d,["href","text","nofollow","noreferrer","onclick"]);return c=c||e||"",j.href=c,c&&c.startsWith("/")&&!c.startsWith("//")?j.onclick=[Nb.go,Cb.mapClickToGo(c)]:(j.target="_blank",j.rel="noopener",g&&(j.rel+=" nofollow"),h&&(j.rel+=" noreferrer")),y(j,[f,b])},Jb=function(){},Kb=function(a){if("string"==typeof a)a={project:a};else if(!a.project)return;var b=a,c=b.project,d=void 0!==c&&c,f=b.branch,g=void 0===f?"master":f,h=b.host,i=void 0===h?"github":h,j=[["npm",function(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:d;return a&&{to:"https://www.npmjs.com/package/@".concat(a),src:"https://img.shields.io/npm/v/@".concat(a,".svg")}}],["travis",function(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:d;return a&&{to:"https://travis-ci.com/".concat(a),src:"https://travis-ci.com/".concat(a,".svg?branch=").concat(g)}}],["appveyor",function(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:d;if(a){var b=a.split("/"),c=e(b,2),f=c[0],h=c[1];return f=f.replace(/-/g,""),{to:"https://ci.appveyor.com/project/".concat(f,"/").concat(h,"/branch/").concat(g),src:"https://img.shields.io/appveyor/ci/".concat(f,"/").concat(h,"/").concat(g,".svg")}}}],["coveralls",function(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:d;return{to:"https://coveralls.io/".concat(i,"/").concat(a),src:"https://img.shields.io/coveralls/".concat(i,"/").concat(a,"/").concat(g,".svg")}}],["greenkeeper",function(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:d;return a&&{to:"https://greenkeeper.io",src:"https://badges.greenkeeper.io/".concat(a,".svg")}}],["snyk",function(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:d;return a&&{to:"https://snyk.io/test/".concat(i,"/").concat(a),src:"https://img.shields.io/snyk/vulnerabilities/github/".concat(a,".svg")}}]].map(function(b){var c=e(b,2),d=c[0],f=c[1];return f(a[d])}).filter(function(b){return b.to&&b.src});return j.length?u({class:"GitBadges"},j.map(function(a){var b=a.to,c=a.src;return ta([Ib({to:b},Gb({src:c}))])})):void 0},Lb=function(a){"string"==typeof a&&(a={content:a,theme:"light"});var b=a,c=b.theme,d=b.content;return W({class:"Pre ".concat(c)},[W({class:"menu"},[I({onclick:[Nb.pre.clip,function(a){return{e:a,content:d}}]},"copy")]),Ia(Mb.Pre.format(d))])},Mb={Pre:function(){var a="\nlet this long package float\ngoto private class if short\nwhile protected with debugger case\ncontinue volatile interface\n\ninstanceof super synchronized throw\nextends final throws\ntry import double enum\n\nboolean abstract function\nimplements typeof transient break\ndefault do static void\n\nint new async native switch\nelse delete null public var\nawait byte finally catch\nin return for get const char\nmodule exports require\n".trim().split(/\b/g).map(function(a){return a.trim()}),b="\nArray Object String Number RegExp Null Symbol\nSet WeakSet Map WeakMap\nsetInterval setTimeout\nPromise\nJSON\nInt8Array Uint8Array Uint8ClampedArray\nInt16Array Uint16Array\nInt32Array Uint32Array\nFloat32Array Float64Array\n".trim().split(/\b/g).map(function(a){return a.trim()}),d=["true","false"],e=function(c){if("string"!=typeof c)return c;var e=c.split(/\b/);return c=e.map(function(c,f){if(""!==c){var g="";return"state"===c?g="state":"actions"===c?g="actions":e[f+1]&&e[f+1].includes(":")?g="colon":a.includes(c)?g="keyword":b.includes(c)?g="builtin":d.includes(c)?g="boolean":"."===e[f-1]?g="property":"."===e[f+1]&&(g="object"),g&&(c=Ta({class:g},c)),c}}),c},f=/([a-zA-Z0-9:+._-]+@[a-zA-Z0-9._-]+)/g,g=function(a){return a.split(f).map(function(a){if(f.test(a)){var b=a.startsWith("mailto:")?a:"mailto:".concat(a),c=a.replace("mailto:","");return Ib({class:"email",to:b},c)}return e(a)})},h=function(a,b){return[l(a.substring(0,b)),l(a.substring(b))]},i=function(a){return a.split(/(?= )/).map(function(a){return a.includes("://")?Ib({to:a},a):l(a)})},j=function(a){return a.includes("://")&&!a.includes("@")?i(a):g(a)},k=function(a){var b=a.replace(/"/g,"'"),d=b.split("'"),f=c(d),g=f[0],h=f[1],i=f.slice(2),k=i;1===k.length?k=l(k[0]):1<k.length&&(k=l(k.join("'")));var m=[];return m="undefined"==typeof h?e(a):[e(g),Ta({class:"string"},["'",j(h),"'"]),k],m},l=function(a){var b=a.indexOf("//"),c=a.trim();if(c.startsWith("//")){for(var d=a.search(/\S|$/),e="",f=0;f<d;f++)e+=" ";return c.startsWith("// ")||(a="".concat(e,"// ").concat(c.substr(2))),Ta({class:"comment"},[e,"// ",l(c.substring(3))])}return-1<b&&":"!==a[b-1]?h(a,b):2<a.indexOf("://")?i(a):a.indexOf("@")&&a.includes(".")&&!a.trim().includes(" ")?g(a):k(a)},m=function(a){return M({class:"line"},l(a))};return{keywords:a,builtins:b,format:function format(a){return a.trim().split("\n").map(m)},wordsByLine:l,wrapWords:e}}()},Nb={pop:function pop(a,b){var c=window.location,d=c.pathname,e=c.hash;return e=e.substring(1),b.state&&(d=b.state.url,e=b.state.hash),e?window.location.hash=e:window.scrollTo(0,0),l({},a,{url:d,hash:e})},go:function go(a,b){var c=b.to;c=c.replace(window.location.origin,"");var d=c.startsWith("/")||c.startsWith("#"),f=c.startsWith(a.root);d&&!f&&(c="".concat(a.root).concat(c).replace(/\/\//g,"/"));var g=c.split("#"),h=e(g,2),i=h[0],j=h[1],k=void 0===j?"":j;if(i===a.url&&k===a.hash)return a;if(window.history.pushState({url:i,hash:k},"",c),k){var m=document.getElementById(k);m&&window.scrollTo(0,m.scrollTop),window.location.hash=k}else window.scrollTo(0,0);return l({},a,{url:i,hash:k,prev:a.url})},pre:{clip:function clip(a,b){var c=b.content;if("undefined"!=typeof document&&"function"==typeof document.execCommand){var d=document.createElement("textarea");d.id="copy",d.innerHTML=c,document.body.appendChild(d);var e=document.getElementById("copy");e.select(),document.execCommand("copy"),document.body.removeChild(e)}return a}}},Ob={"/test/":function test(){return[ea("@magic/test"),Ga("simple tests with lots of utility. ecmascript modules only."),Ga("runs ecmascript module tests without transpilation."),Ga("unbelievably fast."),Kb("magic/test"),fa({id:"getting-started"},"getting started"),Ga("be in a nodejs project."),ga({id:"getting-started-install"},"install"),Lb("npm i --save-dev @magic/test"),Lb("\n// create test/functionName.mjs\nimport yourTest from '../path/to/your/file.mjs'\n\nexport default [\n  { fn: () => true, expect: true, info: 'true is true' },\n  // note that the yourTest function will be called automagically\n  { fn: yourTest, expect: true, info: 'hope this will work ;)'}\n]"),ga({id:"getting-started-npm-scripts"},"npm run scripts"),Ga("edit package.json"),Lb("\n{\n  \"scripts\": {\n    \"test\": \"t -p\", // quick test, only failing tests log\n    \"coverage\": \"t\", // get full test output and coverage reports\n    \"format\": \"f -w\", // format using prettier and write changes to files\n    \"format:check\": \"f\" // check format using prettier\n  }\n}"),Ga("repeated for easy copy pasting (without comments)"),Lb("\n  \"scripts\": {\n    \"test\": \"t -p\",\n    \"coverage\": \"t\",\n    \"format\": \"f -w\",\n    \"format:check\": \"f\"\n  }"),ga({id:"getting-started-quick-tests"},"quick tests (without coverage)"),Lb("\n// run the tests:\nnpm test\n\n// example output:\n// (failing tests will print, passing tests are silent)\n\n// ### Testing package: @magic/test\n// Ran 2 tests. Passed 2/2 100%"),ga({id:"getting-started-coverage"},"coverage"),Ga(["@magic/test will automagically generate coverage reports."," it is so fast creating them that we decided to leave them on by default."," if you have more than 20.000 tests to run contact us, we will add a switch to turn them of."]),ga({id:"test-suites"},"data/fs driven test suite creation:"),ha("expectations for optimal test messages:"),Ga("src and test directories have the same structure and files"),Ga("tests one src file per test file"),Ga("tests one function per suite"),Ga("tests one feature per test"),ha({id:"test-suites-fs"},"Filesystem based naming"),Ga("the following directory structure:"),Lb("\n./test/\n  ./suite1.mjs\n  ./suite2.mjs"),Ga("yields the same result as exporting the following from ./test/index.mjs"),ha({id:"test-suites-data"},"Data driven naming"),Lb("\nimport suite1 from './suite1'\nimport suite2 from './suite2'\n\nexport default {\n  suite1,\n  suite2,\n}"),ga("Important - File mappings"),Ga("if test/index.mjs exists, no other files will be loaded."),Ga("if test/lib/index.mjs exists, no other files from that subdirectory will be loaded."),ga({id:"tests"},"single test, literal value, function or promise"),Lb("\nexport default { fn: true, expect: true, info: 'expect true to be true' }\n\n// expect: true is the default and can be omitted\nexport default { fn: true, info: 'expect true to be true' }\n\n// if fn is a function expect is the returned value of the function\nexport default { fn: () => false, expect: false, info: 'expect true to be true' }\n\n// if expect is a function the return value of the test get passed to it\nexport default { fn: false, expect: t => t === false, info: 'expect true to be true' }\n\n// if fn is a promise the resolved value will be returned\nexport default { fn: new Promise(r => r(true)), expect: true, info: 'expect true to be true' }\n\n// if expects is a promise it will resolve before being compared to the fn return value\nexport default { fn: true, expect: new Promise(r => r(true)), info: 'expect true to be true' }\n\n// callback functions can be tested easily too:\nimport { promise } from '@magic/test'\n\nconst fnWithCallback = (err, arg, cb) => cb(err, arg)\n\nexport default { fn: promise(fnWithCallback(null, 'arg', (e, a) => a)), expect: 'arg' }"),ha({id:"tests-types"},"testing types"),Ga(["types can be compared using ",Ib({to:"https://github.com/magic/types"},"@magic/types")]),Ga(["@magic/types is a richly featured and thoroughly tested type library without dependencies."," it is exported from this library for convenience."]),Lb("\nimport { is } from '@magic/test'\n\nexport default [\n  { fn: () => 'string',\n    expect: is.string,\n    info: 'test if a function returns a string'\n  },\n  {\n    fn: () => 'string',\n    expect: is.length.equal(6),\n    info: 'test length of returned value'\n  },\n  // !!! Testing for deep equality. simple.\n  {\n    fn: () => [1, 2, 3],\n    expect: is.deep.equal([1, 2, 3]),\n    info: 'deep compare arrays/objects for equality',\n  },\n  {\n    fn: () => { key: 1 },\n    expect: is.deep.different({ value: 1 }),\n    info: 'deep compare arrays/objects for difference',\n  },\n]"),ha("caveat:"),Ga(["if you want to test if a function is a function, you need to wrap the function in a function."," this is because functions passed to fn get executed automatically."]),Lb("\nimport { is } from '@magic/test'\n\nconst fnToTest = () => {}\n\n// both the tests will work as expected\nexport default [\n  {\n    fn: () => fnToTest,\n    expect: is.function,\n    info: 'function is a function',\n  },\n  {\n    fn: is.fn(fnToTest), // returns true\n    // we do not set expect: true, since that is the default\n    info: 'function is a function',\n  },\n]"),Lb("\n// will not work as expected and instead call fnToTest\nexport default {\n  fn: fnToTest,\n  expect: is.function,\n  info: 'function is a function',\n}"),ga({id:"tests-multiple"}," multiple tests"),Ga("multiple tests can be created by exporting an array of single test objects."),Lb("\nexport default {\n  multipleTests: [\n    { fn: () => true, expect: true, info: 'expect true to be true' },\n    { fn: () => false, expect: false, info: 'expect false to be false' },\n  ]\n}"),Ga("multiple tests can also be created by exporting an array of tests."),Lb("\n  export default [\n    { fn: () => true, expect: true, info: 'expect true to be true' },\n    { fn: () => false, expect: false, info: 'expect false to be false' },\n  ]"),ga({id:"tests-promises"},"promises"),Lb("\nimport { promise, is } from '@magic/test'\n\nexport default [\n  // kinda clumsy, but works. until you try handling errors.\n  {\n    fn: new Promise(cb => setTimeOut(() => cb(true), 2000)),\n    expect: true,\n    info: 'handle promises',\n  },\n  // better!\n  {\n    fn: promise(cb => setTimeOut(() => cb(null, true), 200)),\n    expect: true,\n    info: 'handle promises in a nicer way',\n  },\n  {\n    fn: promise(cb => setTimeOut(() => cb(new Error('error')), 200)),\n    expect: is.error,\n    info: 'handle promise errors in a nice way',\n  },\n]"),ga({id:"tests-cb"},"callback functions"),Lb("\nimport { promise, is } from '@magic/test'\n\nconst fnWithCallback = (err, arg, cb) => cb(err, arg)\n\nexport default [\n  {\n    fn: promise(cb => fnWithCallback(null, true, cb)),\n    expect: true\n    info: 'handle callback functions as promises',\n  },\n  {\n    fn: promise(cb => fnWithCallback(new Error('oops'), true, cb)),\n    expect: is.error,\n    info: 'handle callback function error as promise',\n  },\n]"),ga({id:"tests-hooks"},"run functions before and/or after individual test"),Lb("\nconst after = () => {\n  global.testing = 'Test has finished, cleanup.'\n}\n\nconst before = () => {\n  global.testing = false\n\n  // if a function gets returned,\n  // this function will be executed once the test finished.\n  return after\n}\n\nexport default [\n  {\n    fn: () => { global.testing = 'changed in test' },\n    // if before returns a function, it will execute after the test.\n    before,\n    after,\n    expect: () => global.testing === 'changed in test',\n  },\n]"),ga({id:"tests-suite-hooks"},"run functions before and/or after a suite of tests"),Lb("\nconst afterAll = () => {\n  // Test has finished, cleanup.'\n  global.testing = undefined\n}\n\nconst beforeAll = () => {\n  global.testing = false\n\n  // if a function gets returned,\n  // this function will be executed once the test suite finished.\n  return afterAll\n}\n\nexport default [\n  {\n    fn: () => { global.testing = 'changed in test' },\n    // if beforeAll returns a function, it will execute after the test suite.\n    beforeAll,\n    // this is optional and can be omitted if beforeall returns a function.\n    // in this example, afterAll will trigger twice.\n    afterAll,\n    expect: () => global.testing === 'changed in test',\n  },\n]"),fa({id:"lib"},"Utility Belt"),Ga("@magic/test exports some utility functions that make working with complex test workflows simpler."),ha({id:"lib-curry"},"curry"),Ga("Currying can be used to split the arguments of a function into multiple nested functions."),Ga(["This helps if you have a function with complicated arguments"," that you just want to quickly shim."]),Lb("\nimport { curry } from '@magic/test'\n\nconst compare = (a, b) => a === b\nconst curried = curry(compare)\nconst shimmed = curried('shimmed_value')\n\nexport default {\n  fn: shimmed('shimmed_value'),\n  expect: true,\n  info: 'expect will be called with a and b and a will equal b',\n}\n"),ha({id:"lib-vals"},"vals"),Ga(["exports some javascript types. more to come."," will sometime in the future be the base of a fuzzer."]),ga({id:"lib-promises"},"promises"),Ga("Helper function to wrap nodejs callback functions and promises with ease."),Ga("Handles the try/catch steps internally and returns a resolved or rejected promise."),Lb("\nimport { promise, is } from '@magic/test'\n\nexport default [\n  {\n    fn: promise(cb => setTimeOut(() => cb(null, true), 200)),\n    expect: true,\n    info: 'handle promises in a nice way',\n  },\n  {\n    fn: promise(cb => setTimeOut(() => cb(new Error('error')), 200)),\n    expect: is.error,\n    info: 'handle promise errors in a nice way',\n  },\n]"),ha({id:"lib-trycatch"},"tryCatch"),Ga("allows to test functions without bubbling the errors up into the runtime"),Lb("\nimport { is, tryCatch } from '@magic/test'\n\nconst throwing = () => throw new Error('oops')\nconst healthy = () => true\n\nexport default [\n  {\n    fn: tryCatch(throwing()),\n    expect: is.error,\n    info: 'function throws an error',\n  },\n  {\n    fn: tryCatch(healthy()),\n    expect: true,\n    info: 'function does not throw'\n  },\n]"),fa({id:"usage"},"Usage"),ga({id:"usage-js"},"mjs api:"),Lb("\n// test/index.mjs\nimport run from '@magic/test'\n\nconst tests = {\n  lib: [\n    { fn: () => true, expect: true, info: 'Expect true to be true' }\n  ],\n}\n\nrun(tests)"),fa({id:"usage-cli"},"cli"),ga("package.json (recommended)"),Ga("Add the magic/test bin scripts to package.json"),Lb("\n{\n  \"scripts\": {\n    \"test\": \"t -p\",\n    \"coverage\": \"t\",\n    \"format\": \"f -w\",\n    \"format:check\": \"f\"\n  },\n  \"devDependencies\": {\n    \"@magic/test\": \"github:magic/test\"\n  }\n}"),Ga("then use the npm run scripts"),Lb("\nnpm test\nnpm run coverage\nnpm run format\nnpm run format:check"),ga({id:"usage-global"},"Globally (not recommended):"),Ga(["you can install this library globally"," but the recommendation is to add the dependency and scripts to the package.json file."]),Ga(["this both explains to everyone that your app has these dependencies"," as well as keeping your bash free of clutter"]),Lb("\nnpm i -g magic/test\n\n// run tests in production mode\nt -p\n\n// run tests and get coverage in verbose mode\nt\n\n// check formatting using prettier but do not write\n// prettier --list-different\nf\n\n// format files using prettier\n// prettier --write\nf -w"),Ga(["This library tests itself, have a look at ",Ib({to:"https://github.com/magic/test/tree/master/test"},"the tests")]),Ga("Checkout [@magic/types](https://github.com/magic/types) and the other magic libraries for more test examples.")]},"/test/404/":function test404(){return W("404 - not found")}};w({init:function init(){return l({},Bb,{url:window.location.pathname})},subscriptions:function subscriptions(){return[[Cb.listenPopState,Nb.pop]]},view:function view(a){var b=Ob[a.url]?a.url:"/404/",c=Ob[b];if(a.pages){var d=a.pages[b];for(var e in d)a[e]=d[e]}return W({id:"Magic"},Hb({page:c,state:a}))},node:document.getElementById("Magic")});