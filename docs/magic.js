function e(e){for(var t=1;t<arguments.length;t++){var s=null!=arguments[t]?arguments[t]:{},o=Object.keys(s);"function"==typeof Object.getOwnPropertySymbols&&(o=o.concat(Object.getOwnPropertySymbols(s).filter(function(e){return Object.getOwnPropertyDescriptor(s,e).enumerable}))),o.forEach(function(t){var o,n;o=e,n=s[t],t in o?Object.defineProperty(o,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):o[t]=n})}return e}function t(e,t){return t=null!=t?t:{},Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):(function(e,t){var s=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);s.push.apply(s,o)}return s})(Object(t)).forEach(function(s){Object.defineProperty(e,s,Object.getOwnPropertyDescriptor(t,s))}),e}function s(e,t){if(null==e)return{};var s,o,n=function(e,t){if(null==e)return{};var s,o,n={},i=Object.keys(e);for(o=0;o<i.length;o++)s=i[o],t.indexOf(s)>=0||(n[s]=e[s]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(o=0;o<i.length;o++)s=i[o],!(t.indexOf(s)>=0)&&Object.prototype.propertyIsEnumerable.call(e,s)&&(n[s]=e[s])}return n}(()=>{let{h:o,app:n}=(()=>{var e={},t=[],s=t.map,o=Array.isArray,n="undefined"!=typeof requestAnimationFrame?requestAnimationFrame:setTimeout,i=function(e){var t="";if("string"==typeof e)return e;if(o(e)&&e.length>0)for(var s,n=0;n<e.length;n++)""!==(s=i(e[n]))&&(t+=(t&&" ")+s);else for(var n in e)e[n]&&(t+=(t&&" ")+n);return t},r=function(e,t){var s={};for(var o in e)s[o]=e[o];for(var o in t)s[o]=t[o];return s},a=function(e){return e.reduce(function(e,t){return e.concat(t&&!0!==t?"function"==typeof t[0]?[t]:a(t):0)},t)},l=function(e,t){if(e!==t)for(var s in r(e,t)){var n,i;if(e[s]!==t[s]&&(n=e[s],i=t[s],!(o(n)&&o(i))||n[0]!==i[0]||"function"!=typeof n[0]))return!0;t[s]=e[s]}},c=function(e,t,s){for(var o,n,i=0,r=[];i<e.length||i<t.length;i++)o=e[i],r.push((n=t[i])?!o||n[0]!==o[0]||l(n[1],o[1])?[n[0],n[1],n[0](s,n[1]),o&&o[2]()]:o:o&&o[2]());return r},u=function(e,t,s,o,n,a){if("key"===t);else if("style"===t)for(var l in r(s,o))s=null==o||null==o[l]?"":o[l],"-"===l[0]?e[t].setProperty(l,s):e[t][l]=s;else"o"===t[0]&&"n"===t[1]?((e.actions||(e.actions={}))[t=t.slice(2)]=o)?s||e.addEventListener(t,n):e.removeEventListener(t,n):!a&&"list"!==t&&t in e?e[t]=null==o?"":o:null!=o&&!1!==o&&("class"!==t||(o=i(o)))?e.setAttribute(t,o):e.removeAttribute(t)},p=function(e,t,s){var o=e.props,n=3===e.type?document.createTextNode(e.name):(s=s||"svg"===e.name)?document.createElementNS("http://www.w3.org/2000/svg",e.name,{is:o.is}):document.createElement(e.name,{is:o.is});for(var i in o)u(n,i,null,o[i],t,s);for(var r=0,a=e.children.length;r<a;r++)n.appendChild(p(e.children[r]=h(e.children[r]),t,s));return e.node=n},f=function(e){return null==e?null:e.key},d=function(e,t,s,o,n,i){if(s===o);else if(null!=s&&3===s.type&&3===o.type)s.name!==o.name&&(t.nodeValue=o.name);else if(null==s||s.name!==o.name)t=e.insertBefore(p(o=h(o),n,i),t),null!=s&&e.removeChild(s.node);else{var a,l,c,m,g=s.props,b=o.props,y=s.children,x=o.children,v=0,w=0,k=y.length-1,j=x.length-1;for(var C in i=i||"svg"===o.name,r(g,b))("value"===C||"selected"===C||"checked"===C?t[C]:g[C])!==b[C]&&u(t,C,g[C],b[C],n,i);for(;w<=j&&v<=k&&null!=(c=f(y[v]))&&c===f(x[w]);)d(t,y[v].node,y[v],x[w]=h(x[w++],y[v++]),n,i);for(;w<=j&&v<=k&&null!=(c=f(y[k]))&&c===f(x[j]);)d(t,y[k].node,y[k],x[j]=h(x[j--],y[k--]),n,i);if(v>k)for(;w<=j;)t.insertBefore(p(x[w]=h(x[w++]),n,i),(l=y[v])&&l.node);else if(w>j)for(;v<=k;)t.removeChild(y[v++].node);else{for(var C=v,T={},O={};C<=k;C++)null!=(c=y[C].key)&&(T[c]=y[C]);for(;w<=j;){if(c=f(l=y[v]),m=f(x[w]=h(x[w],l)),O[c]||null!=m&&m===f(y[v+1])){null==c&&t.removeChild(l.node),v++;continue}null==m||1===s.type?(null==c&&(d(t,l&&l.node,l,x[w],n,i),w++),v++):(c===m?(d(t,l.node,l,x[w],n,i),O[m]=!0,v++):null!=(a=T[m])?(d(t,t.insertBefore(a.node,l&&l.node),a,x[w],n,i),O[m]=!0):d(t,l&&l.node,null,x[w],n,i),w++)}for(;v<=k;)null==f(l=y[v++])&&t.removeChild(l.node);for(var C in T)null==O[C]&&t.removeChild(T[C].node)}}return o.node=t},m=function(e,t){for(var s in e)if(e[s]!==t[s])return!0;for(var s in t)if(e[s]!==t[s])return!0},g=function(e){return"object"==typeof e?e:y(e)},h=function(e,t){return 2===e.type?((!t||!t.lazy||m(t.lazy,e.lazy))&&((t=g(e.lazy.view(e.lazy))).lazy=e.lazy),t):e},b=function(e,t,s,o,n,i){return{name:e,props:t,children:s,node:o,type:i,key:n}},y=function(s,o){return b(s,e,t,o,void 0,3)},x=function(t){return 3===t.nodeType?y(t.nodeValue,t):b(t.nodeName.toLowerCase(),e,s.call(t.childNodes,x),t,void 0,1)};return{h:function(t,s){for(var n,i=[],r=[],a=arguments.length;a-- >2;)i.push(arguments[a]);for(;i.length>0;)if(o(n=i.pop()))for(var a=n.length;a-- >0;)i.push(n[a]);else!1===n||!0===n||null==n||r.push(g(n));return s=s||e,"function"==typeof t?t(s,r):b(t,s,r,void 0,s.key)},app:function(e){var t={},s=!1,i=e.view,r=e.node,l=r&&x(r),u=e.subscriptions,p=[],f=function(e){b(this.actions[e.type],e)},m=function(e){return t!==e&&(t=e,u&&(p=c(p,a([u(t)]),b)),i&&!s&&n(y,s=!0)),t};let{middleware:h=e=>e}=e,b=h((e,s)=>"function"==typeof e?b(e(t,s)):o(e)?"function"==typeof e[0]||o(e[0])?b(e[0],"function"==typeof e[1]?e[1](s):e[1]):(a(e.slice(1)).map(function(e){e&&e[0](b,e[1])},m(e[0])),t):m(e));var y=function(){s=!1,r=d(r.parentNode,r,l,l=g(i(t)),f)};b(e.init)}}})(),i=e=>(t={},s)=>{let n=(e,...t)=>t.some(t=>t===typeof e);if(n(s,"undefined")){if(t.props)return o(e,{},[t]);n(t,"string","number","function")||Array.isArray(t)?(s=t,t={}):n(t.View,"function")&&(s=t.View,t={})}return o(e,t,s)},r=i("a");i("abbr"),i("address"),i("animate"),i("animateMotion"),i("animateTransform"),i("area"),i("article"),i("aside"),i("audio"),i("b"),i("base"),i("bdi"),i("bdo"),i("blockquote"),i("body"),i("br");let a=i("button");i("canvas"),i("caption");let l=i("circle");i("cite"),i("clipPath");let c=i("code");i("col"),i("colgroup"),i("data"),i("datalist"),i("dd"),i("defs"),i("del"),i("desc"),i("description"),i("details"),i("dfn"),i("dialog"),i("discard");let u=i("div");i("dl"),i("dt"),i("ellipse"),i("em"),i("embed"),i("feBlend"),i("feColorMatrix"),i("feComponentTransfer"),i("feComposite"),i("feConvolveMatrix"),i("feDiffuseLighting"),i("feDisplacementMap"),i("feDistantLight"),i("feDropShadow"),i("feFlood"),i("feFuncA"),i("feFuncB"),i("feFuncG"),i("feFuncR"),i("feGaussianBlur"),i("feImage"),i("feMerge"),i("feMergeNode"),i("feMorphology"),i("feOffset"),i("fePointLight"),i("feSpecularLighting"),i("feSpotLight"),i("feTile"),i("feTurbulence"),i("fieldset"),i("figcaption"),i("figure"),i("filter");let p=i("footer");i("foreignObject"),i("form");let f=i("g"),d=i("h1"),m=i("h2"),g=i("h3"),h=i("h4");i("h5"),i("h6"),i("hatch"),i("hatchpath"),i("head");let b=i("header");i("hgroup"),i("hr"),i("html"),i("i"),i("iframe"),i("image");let y=i("img"),x=i("input");i("ins"),i("kbd"),i("label"),i("legend");let v=i("li");i("line"),i("linearGradient"),i("link");let w=i("main");i("map"),i("mark"),i("marker"),i("mask"),i("mesh"),i("meshgradient"),i("meshpatch"),i("meshrow"),i("meta"),i("metadata"),i("meter"),i("mpath");let k=i("nav");i("noscript"),i("object"),i("ol"),i("optgroup"),i("option"),i("output");let j=i("p");i("param");let C=i("path");i("pattern"),i("picture"),i("polygon"),i("polyline");let T=i("pre");i("progress"),i("q"),i("radialGradient"),i("rb"),i("rect"),i("rp"),i("rt"),i("rtc"),i("ruby"),i("s"),i("samp"),i("script"),i("section"),i("select"),i("set"),i("small"),i("solidcolor"),i("source");let O=i("span");i("stop"),i("strong"),i("style"),i("sub"),i("summary"),i("sup");let P=i("svg");i("symbol"),i("table"),i("tbody"),i("td"),i("template"),i("text"),i("textPath"),i("textarea"),i("tfoot"),i("th"),i("thead"),i("time"),i("title"),i("tr"),i("track"),i("tspan"),i("u");let A=i("ul");i("unknown"),i("url"),i("use"),i("video"),i("view"),i("wbr");let S=()=>u({class:"Credits"},["made with a few bits of ",z({to:"https://magic.github.io/",target:"_blank",rel:"noopener"},"magic")]),E=(e,t=[])=>p({class:"Footer"},[u({class:"Container"},[S(),t])]),M=e=>{if("string"==typeof e)e={project:e};else if(!e.project)return;let{branch:t="master",host:s="github"}=e,{project:o=!1}=e,n="",i=o;o.startsWith("@")?(n="@",o=o.substr(1)):i=o.split("/")[1];let r=[["npm",(e=o)=>e&&{to:`https://www.npmjs.com/package/${i}`,src:`https://img.shields.io/npm/v/${n}${e}?color=blue`}],["node",(e=o)=>e&&{src:`https://img.shields.io/node/v/${n}${e}?color=blue`}],["license",(e=o)=>e&&{src:`https://img.shields.io/npm/l/${n}${e}?color=blue`}],["travis",(e=o)=>e&&{to:`https://travis-ci.com/${e}`,src:`https://img.shields.io/travis/com/${e}/${t}`}],["appveyor",(e=o)=>{if(e){let[s,o]=e.split("/");return{to:`https://ci.appveyor.com/project/${s=s.replace(/-/g,"")}/${o}/branch/${t}`,src:`https://img.shields.io/appveyor/ci/${s}/${o}/${t}.svg`}}}],["coveralls",(e=o)=>({to:`https://coveralls.io/${s}/${e}`,src:`https://img.shields.io/coveralls/${s}/${e}/${t}.svg`})],["snyk",(e=o)=>e&&{to:`https://snyk.io/test/${s}/${e}`,src:`https://img.shields.io/snyk/vulnerabilities/github/${e}.svg`}]].map(([t,s])=>s(e[t]));if(r.length)return A({class:"GitBadges"},r.map(({to:e,src:t})=>{if(!t)return;let s=N({src:t,height:"23"});return e?v(z({to:e},s)):v(s)}))},$=(e={},t=[])=>{let{logo:s,menu:o,logotext:n,hash:i,url:r}=e;if(s||o||n)return b({class:"Header"},[q(),n&&j(n),o&&F({url:r,hash:i,menu:o}),t])},N=e=>{"string"==typeof e&&(e={src:e});let{loading:t="lazy"}=e;if(e.src)return e.hasOwnProperty("alt")||(e.title?e.alt=e.title:e.alt=""),e.loading=t,y(e)},W=(e={})=>P({class:"LightSwitch icon",onclick:I.changeTheme,height:25,width:25,viewBox:"0 0 352 460"},[C({d:"M149 48C96 48 48 95 47 143c-1 13 19 17 20 0-1-35 48-75 83-75 15 0 12-22-1-20z"}),C({d:"M176 0C74 0 0 83 0 176c9 91 84 118 100 204h20c-16-92-97-138-100-204C22 70 105 21 176 20zM95 400c2 68 20 48 40 60h82c20-12 38 8 40-60z"}),C({d:"M175 0c102 0 177 83 177 176-9 91-86 118-102 204h-20c16-92 99-138 102-204-2-106-86-155-157-156z"})]),z=(e,t)=>{var{to:o,action:n=I.go,text:i}=e,a=s(e,["to","action","text"]);let{href:l,nofollow:c,noreferrer:u}=a,p=s(a,["href","nofollow","noreferrer"]);o=o||l||"",p.href=o,i&&t?i=[i,t]:i||(i=t||o);let f="/"===o[0]||"#"===o[0];return f?p.onclick=[n,H.preventDefault]:(p.target="_blank",p.rel="noopener",c&&(p.rel+=" nofollow"),u&&(p.rel+=" noreferrer")),r(p,i)},q=()=>z({to:"/test/",class:"Logo"},[P({viewBox:"0 0 512 444"},[C({d:"M512 444L256 0 0 444z",fill:"#663695"}),l({cx:"256",cy:"294",r:"130",fill:"#fff"}),l({cx:"256",cy:"281",r:"40",fill:"#663695"}),C({d:"M256 350v44m24-44l1 13c1 27 29 27 29-7m-160-72s46-47 106-47c59 0 106 47 106 47s-47 43-106 43c-60 0-106-43-106-43zm65-75a134 134 0 0189 2",class:"stroke"}),C({d:"M256 81v53m184 270l-43-29M72 404l43-29",class:"stroke white"})])]),F=(s={})=>{let{collapse:o=!0,menu:n,hash:i}=s,{class:r="",url:a}=s;return r.includes("Menu")||(r=`Menu ${r}`.trim()),i&&!a.endsWith(i)&&(a+=`#${i}`),k({className:r},A(n.map(s=>L(t(e({},s),{url:a,collapse:o})))))},L=t=>{let{collapse:o,items:n=[],text:i,url:r}=t,a=s(t,["collapse","items","text","url"]),l={class:{}},{to:c}=a;c===r&&(l.class.active=!0);let u=[],p=!o||r.includes(c);return p&&n.length&&(u=A(n.map(t=>L(e({url:r,collapse:o},t))))),v(l,[c?z(a,i):O(a,i),u])},D=({nospy:e={},cookies:t=[]})=>{let{show:s,title:o="Privacy Notice",content:n="This app neither saves, collects, nor shares any data about you.",buttonText:i="Awesome!"}=e;return s?u({class:"NoSpy"},[u({class:"Background",onclick:I.nospy.toggle}),u({class:"Container"},[o&&g(o),n&&j(n),x({onclick:I.nospy.toggle,value:i,type:"button"})])]):u({class:"NoSpy"},P({class:"icon",onclick:I.nospy.toggle,width:"25",height:"25",viewBox:"0 0 512 512"},[f([C({d:`
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
`}),l({cx:"192",cy:"128",r:"32"}),l({cx:"128",cy:"256",r:"32"}),l({cx:"288",cy:"384",r:"32"}),l({cx:"272",cy:"272",r:"16"}),l({cx:"400",cy:"336",r:"16"}),l({cx:"176",cy:"368",r:"16"})])]))},R=({page:e,state:t},s)=>{let o={id:"Magic",class:t.pageClass};return w(o,u({class:{Wrapper:!0}},[$(t),u({class:"Page",id:"page"},e(t)),E(t),s]))},B=(t,s)=>{"string"==typeof t?t={content:t}:s?t=e({content:s},t):Array.isArray(t)&&(t={content:t.join("")});let{content:o,lines:n=!0}=t;return u({class:{Pre:!0,lines:n&&"false"!==n}},[u({class:"menu"},[a({onclick:[I.pre.clip,e=>({e,content:o})]},"copy")]),T(o.trim().split("\n").map(B.Line))])};B.Comment=e=>O({class:"comment"},e),B.Line=e=>c({class:"line"},B.Words(e)),B.Word=e=>{if(!e)return"";let t=e.includes("://"),s=e.startsWith("mailto:")||e.includes("@")&&e.includes(".");if(t||s)return z({to:e,text:e});let o="";return("state"===e?o="state":"actions"===e?o="actions":"effects"===e?o="effects":"subscriptions"===e?o="subscriptions":H.pre.keywords.includes(e)?o="keyword":H.pre.builtins.includes(e)?o="builtin":H.pre.booleans.includes(e)&&(o="boolean"),o)?O({class:o},e):e},B.Words=e=>{let[t,...s]=e.split(H.pre.commentRegex),o=!t.endsWith(":")&&s.length;if(o)return[B.Words(t),B.Comment(s.join("").split(H.pre.wordRegex).map(B.Word))];let n=[],i=e;if(e.replace(H.pre.stringRegex,e=>{if(i){let[t,s]=i.split(e);t&&n.push(t.split(H.pre.wordRegex).map(B.Word).filter(e=>e)),i=s}n.push(O({class:"string"},e))}),i!==e)return i&&n.push(i.split(H.pre.wordRegex).map(B.Word).filter(e=>e)),n;let r=e.split(H.pre.wordRegex).filter(e=>e);return r.map(B.Word)};let H={pre:{booleans:["true","false"],builtins:["Array","Object","String","Number","RegExp","Null","Symbol","Set","WeakSet","Map","WeakMap","setInterval","setTimeout","Promise","JSON","Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Uint16Array","Int32Array","Uint32Array","Float32Array","Float64Array"],commentRegex:/(\/\/)/gim,keywords:["let","this","long","package","float","goto","private","class","if","short","while","protected","with","debugger","case","continue","volatile","interface","instanceof","super","synchronized","throw","extends","final","export","throws","try","import","double","enum","boolean","abstract","function","implements","typeof","transient","break","default","do","static","void","int","new","async","native","switch","else","delete","null","public","var","await","byte","finally","catch","in","return","for","get","const","char","module","exports","require","npm","install","=>"],stringRegex:/("|')(.*?)\1/gim,wordRegex:/( )/gim},preventDefault:e=>(e.preventDefault(),e)},I={changeTheme:s=>t(e({},s),{pageClass:t(e({},s.pageClass),{light:"dark"===s.theme}),theme:"dark"===s.theme?"light":"dark"}),go:(s,o)=>{let n=o.currentTarget.href.replace(window.location.origin,""),[i,r=""]=n.split("#");if(i===s.url&&r===s.hash)return r&&(window.location.hash=r),s;let a=s.pages&&s.pages[i]&&s.pages[i].title;a&&(document.title=s.title=a),i!==s.url?r||window.scrollTo({top:0}):window.location.hash=r;let{scrollY:l}=window;return window.history.pushState({url:i,hash:r,scrollY:l},s.title,n),t(e({},s),{url:i,hash:r,prev:s.url})},nospy:{toggle:t=>(t.nospy.show=!t.nospy.show,e({},t))},pop:(s,o)=>{let{pathname:n,hash:i}=window.location;i=i.substring(1);let r=0;return o.state&&(n=o.state.url,i=o.state.hash,r=o.state.scrollY||0),i?window.location.hash=i:window.scroll({top:r}),t(e({},s),{url:n,hash:i})},pre:{clip:(e,{content:t})=>{if("undefined"!=typeof document&&"function"==typeof document.execCommand){let e=document.createElement("textarea");e.id="copy",e.innerHTML=t,document.body.appendChild(e);let s=document.getElementById("copy");s.select(),document.execCommand("copy"),document.body.removeChild(s)}return e}}},V={listenPopState:(e,t)=>{let s=s=>e(t,s);return addEventListener("popstate",s),()=>removeEventListener("popstate",s)}},U={"/test/":e=>[d({id:"magictest"},"@magic/test"),j(["simple tests with lots of utility."," ecmascript modules only."," runs ecmascript module syntax tests without transpilation."," unbelievably fast."]),M("@magic/test"),m({id:"getting-started"},"getting started"),j("be in a nodejs project."),g({id:"getting-started-install"},"install"),B({lines:"false"},"npm i --save-dev --save-exact @magic/test"),g("Create a test"),B(`
// create test/functionName.js
import yourTest from '../path/to/your/file.js'

export default [
  { fn: () => true, expect: true, info: 'true is true' },
  // note that the yourTest function will be called automagically
  { fn: yourTest, expect: true, info: 'hope this will work ;)'}
]
`),g({id:"getting-started-npm-scripts"},"npm scripts"),j("edit package.json"),B(`
{
  "scripts": {
    "test": "t -p", // quick test, only failing tests log
    "coverage": "t", // get full test output and coverage reports
  }
}
`),j("repeated for easy copy pasting (without comments and trailing commas)"),B(`
  "scripts": {
    "test": "t -p",
    "coverage": "t"
  }
`),g({id:"getting-started-quick-tests"},"quick tests"),j("without coverage"),B(`
  // run the tests:
npm test

// example output:
// (failing tests will print, passing tests are silent)

// ### Testing package: @magic/test
// Ran 2 tests. Passed 2/2 100%
`),g({id:"getting-started-coverage"},"coverage"),j(["@magic/test will automagically generate coverage reports"," if it is not called with the -p flag."]),g({id:"test-suites"},"data/fs driven test suite creation:"),h({id:"expectations-for-optimal-test-messages"},"expectations for optimal test messages:"),A([v("src and test directories have the same directory structure and filenames"),v("tests one src file per test file"),v("tests one function per test suite"),v("tests one feature per test unit")]),h({id:"test-suites-fs"},"Filesystem based naming"),j("the following directory structure:"),B(`./test/
  ./suite1.js
  ./suite2.js`),j("yields the same result as exporting the following from ./test/index.js"),h({id:"test-suites-data"},"Data driven naming"),B(`import suite1 from './suite1'
import suite2 from './suite2'

export default {
  suite1,
  suite2,
}`),g({id:"important---file-mappings"},"Important - File mappings"),j(["if test/index.js exists, no other files will be loaded."," if test/index.js exists, no other files from that directory will be loaded,"," if test/lib/index.js, no other files from that subdirectory will be loaded."," instead the exports of those index.js will be expected to be tests"]),g({id:"tests"},"single test"),j("literal value, function or promise"),B(`
export default { fn: true, expect: true, info: 'expect true to be true' }

// expect: true is the default and can be omitted
export default { fn: true, info: 'expect true to be true' }

// if fn is a function expect is the returned value of the function
export default { fn: () => false, expect: false, info: 'expect true to be true' }

// if expect is a function the return value of the test get passed to it
export default { fn: false, expect: t => t === false, info: 'expect true to be true' }

// if fn is a promise the resolved value will be returned
export default { fn: new Promise(r => r(true)), expect: true, info: 'expect true to be true' }

// if expects is a promise it will resolve before being compared to the fn return value
export default { fn: true, expect: new Promise(r => r(true)), info: 'expect true to be true' }

// callback functions can be tested easily too:
import { promise } from '@magic/test'

const fnWithCallback = (err, arg, cb) => cb(err, arg)

export default { fn: promise(fnWithCallback(null, 'arg', (e, a) => a)), expect: "arg" }
`),h({id:"tests-types"},"testing types"),j(["types can be compared using ",z({to:"https://github.com/magic/types",text:"@magic/types"})]),j(["@magic/types is a richly featured and thoroughly tested type library without dependencies."," it is exported from this library for convenience."]),B(`
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
  // !!! Testing for deep equality. simple.
  {
    fn: () => [1, 2, 3],
    expect: is.deep.equal([1, 2, 3]),
    info: 'deep compare arrays/objects for equality',
  },
  {
    fn: () => { key: 1 },
    expect: is.deep.different({ value: 1 }),
    info: 'deep compare arrays/objects for difference',
  },
]
`),h({id:"caveat"},"caveat:"),j(["if you want to test if a function is a function, you need to wrap the function in a function."," this is because functions passed to fn get executed automatically."]),B(`
import { is } from '@magic/test'

const fnToTest = () => {}

// both the tests will work as expected
export default [
  {
    fn: () => fnToTest,
    expect: is.function,
    info: 'function is a function',
  },
  {
    fn: is.fn(fnToTest), // returns true
    // we do not set expect: true, since that is the default
    // expect: true,
    info: 'function is a function',
  },
]
`),B(`
// will not work as expected and instead call fnToTest
export default {
  fn: fnToTest,
  expect: is.function,
  info: 'function is a function',
}
`),g({id:"tests-multiple"},"multiple tests"),j("multiple tests can be created by exporting an array of single test objects."),B(`
export default {
  multipleTests: [
    { fn: () => true, expect: true, info: 'expect true to be true' },
    { fn: () => false, expect: false, info: 'expect false to be false' },
  ]
}`),j("multiple tests can also be created by exporting an array of tests."),B(`
export default [
  { fn: () => true, expect: true, info: 'expect true to be true' },
  { fn: () => false, expect: false, info: 'expect false to be false' },
]
`),g({id:"tests-promises"},"promises"),B(`
import { promise, is } from '@magic/test'

export default [
  // kinda clumsy, but works. until you try handling errors.
  {
    fn: new Promise(cb => setTimeOut(() => cb(true), 2000)),
    expect: true,
    info: 'handle promises',
  },
  // better!
  {
    fn: promise(cb => setTimeOut(() => cb(null, true), 200)),
    expect: true,
    info: 'handle promises in a nicer way',
  },
  {
    fn: promise(cb => setTimeOut(() => cb(new Error('error')), 200)),
    expect: is.error,
    info: 'handle promise errors in a nice way',
  },
]
`),g({id:"tests-cb"},"callback functions"),B(`
import { promise, is } from '@magic/test'

const fnWithCallback = (err, arg, cb) => cb(err, arg)

export default [
  {
    fn: promise(cb => fnWithCallback(null, true, cb)),
    expect: true
    info: 'handle callback functions as promises',
  },
  {
    fn: promise(cb => fnWithCallback(new Error('oops'), true, cb)),
    expect: is.error,
    info: 'handle callback function error as promise',
  },
]
`),g({id:"tests-hooks"},"hooks"),j("run functions before and/or after individual test"),B(`
const after = () => {
  global.testing = 'Test has finished, cleanup.'
}

const before = () => {
  global.testing = false

  // if a function gets returned,
  // this function will be executed once the test finished.
  return after
}

export default [
  {
    fn: () => { global.testing = 'changed in test' },
    // if before returns a function, it will execute after the test.
    before,
    after,
    expect: () => global.testing === 'changed in test',
  },
]
`),g({id:"tests-suite-hooks"},"suite hooks"),j("run functions before and/or after a suite of tests"),B(`
const afterAll = () => {
  // Test has finished, cleanup.'
  global.testing = undefined
}

const beforeAll = () => {
  global.testing = false

  // if a function gets returned,
  // this function will be executed once the test suite finished.
  return afterAll
}

export default [
  {
    fn: () => { global.testing = 'changed in test' },
    // if beforeAll returns a function, it will execute after the test suite.
    beforeAll,
    // this is optional and can be omitted if beforeall returns a function.
    // in this example, afterAll will trigger twice.
    afterAll,
    expect: () => global.testing === 'changed in test',
  },
]
`),j("File-based Hooks:"),j(["You can also create test/beforeAll.js and test/afterAll.js files"," that run before/after all tests in a suite."]),B(`
// test/beforeAll.js
export default () => {
  global.setup = true
  // optionally return a cleanup function
  return () => {
    global.setup = false
  }
}
`),B(`
// test/afterAll.js
export default () => {
  // cleanup after all tests
}
`),g({id:"tests-magic-modules"},"magic modules"),j(["@magic-modules assume all html tags to be globally defined."," to create those globals for your test and check if a @magic-module returns the correct markup,"," just add an html: true flag to the test."]),B(`
const expect = [
  'i',
  [
    { class: 'testing' },
    'testing',
  ],
]

const props = { class: 'testing' }

export default [
  // note that fn is a wrapped function, we can not call i directly as we could other functions
  {
    fn: () => i(props, 'testing'),
    expect,
    info: 'magic/test can now test html',
  },
]
`),m({id:"lib"},"Utility Belt"),j(["@magic/test exports some utility functions"," that make working with complex test workflows simpler."]),h({id:"lib-curry"},"curry"),j(["Currying can be used to split the arguments of a function into multiple nested functions."," This helps if you have a function with complicated arguments that you just want to quickly shim."]),B(`
import { curry } from '@magic/test'

const compare = (a, b) => a === b
const curried = curry(compare)
const shimmed = curried('shimmed_value')

export default {
  fn: shimmed('shimmed_value'),
  expect: true,
  info: 'expect will be called with a and b and a will equal b',
}
`),h({id:"lib-vals"},"vals"),j(["Exports JavaScript type constants for testing against any value."," Useful for fuzzing and property-based testing."]),B(`
import { vals, is } from '@magic/test'

export default [
  { fn: () => 'test', expect: is.string, info: 'test if value is a string' },
  { fn: () => vals.true, expect: true, info: 'boolean true value' },
  { fn: () => vals.email, expect: is.email, info: 'valid email format' },
  { fn: () => vals.error, expect: is.error, info: 'error instance' },
]
`),j("Available Constants:"),A([v("Primitives: true, false, number, num, float, int, string, str"),v("Empty values: nil, emptystr, emptyobject, emptyarray, undef"),v("Collections: array, object, obj"),v("Time: date, time"),v("Errors: error, err"),v("Colors: rgb, rgba, hex3, hex6, hexa4, hexa8"),v("Other: func, truthy, falsy, email, regexp")]),h({id:"lib-env"},"env"),j("Environment detection utilities for conditional test behavior."),B(`
import { env } from '@magic/test'

export default [
  {
    fn: env.isNodeProd,
    expect: process.env.NODE_ENV === 'production',
    info: 'checks if NODE_ENV is production',
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
]
`),g({id:"lib-http"},"http"),j("HTTP utility for making requests in tests. Supports both HTTP and HTTPS."),B(`
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
`),j("Error Handling:"),B(`
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
`),j("Note: HTTP module automatically handles protocol detection, JSON parsing, and rejectUnauthorized: false"),g({id:"lib-promises"},"promises"),j(["Helper function to wrap nodejs callback functions and promises with ease."," Handle the try/catch steps internally and return a resolved or rejected promise."]),B(`
import { promise, is } from '@magic/test'

export default [
  {
    fn: promise(cb => setTimeOut(() => cb(null, true), 200)),
    expect: true,
    info: 'handle promises in a nice way',
  },
  {
    fn: promise(cb => setTimeOut(() => cb(new Error('error')), 200)),
    expect: is.error,
    info: 'handle promise errors in a nice way',
  },
]
`),g({id:"lib-css"},"css"),j(["exports ",z({to:"https://github.com/magic/css",text:"@magic/css"}),", which allows parsing and stringification of css-in-js objects."]),h({id:"lib-trycatch"},"trycatch"),j("allows to test functions without bubbling the errors up into the runtime"),B(`
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
    info: 'function does not throw'
  },
]
`),h({id:"lib-version"},"version"),j("The version plugin checks your code according to a spec defined by you. This is designed to warn you on changes to your exports."),j(["Internally, the version function calls ",z({to:"https://github.com/magic/types",text:"@magic/types"})," and all functions exported from it are valid type strings in version specs."]),B(`
// test/spec.js
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

  objectNoChildCheck: [
    'obj',
    false,
  ],
}

export default version(lib, spec)
  `),h({id:"lib-svelte"},"svelte"),j(["@magic/test includes built-in support for testing Svelte 5 components."," It compiles Svelte components, mounts them in a DOM environment,"," and provides utilities for interacting with and asserting on component behavior."]),B(`
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
`),j("Exported Functions:"),A([v("mount(filePath, options) - Mounts a Svelte component"),v("html(target) - Returns innerHTML"),v("text(target) - Returns textContent"),v("component(instance) - Returns component instance"),v("props(target) - Returns attribute name/value pairs"),v("click(target, selector) - Clicks an element"),v("trigger(target, eventType, options) - Dispatches custom event"),v("scroll(target, x, y) - Scrolls element to x/y")]),j("Test Properties:"),A([v("component - Path to the .svelte file"),v("props - Props to pass to the component"),v("fn - Test function receiving { target, component, unmount }")]),j("Example: Accessing Component State"),B(`
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
`),j("Example: Testing Error Handling"),B(`
import { mount, tryCatch } from '@magic/test'

const component = './src/lib/svelte/components/MyComponent.svelte'

export default [
  {
    fn: tryCatch(mount, component, { props: null }),
    expect: t => t.message === 'Props must be an object, got object',
    info: 'throws when props is null',
  },
]
`),m({id:"usage"},"usage"),g({id:"usage-js"},"js"),B(`
// test/index.js
import run from '@magic/test'

const tests = {
  lib: [
    { fn: () => true, expect: true, info: 'Expect true to be true' }
  ],
}

run(tests)
`),m({id:"usage-cli"},"cli"),g({id:"packagejson-recommended"},"package.json (recommended)"),j("add the magic/test bin scripts to package.json"),B(`
{
  "scripts": {
    "test": "t -p",
    "coverage": "t",
  },
  "devDependencies": {
    "@magic/test": "github:magic/test"
  }
}`),j("then use the npm run scripts"),B(`
npm test
npm run coverage
`),g({id:"usage-global"},"Globally (not recommended):"),j(["you can install this library globally,"," but the recommendation is to add the dependency and scripts to the package.json file."]),j(["this both explains to everyone that your app has these dependencies"," as well as keeping your bash free of clutter"]),B(`
npm i -g @magic/test

// run tests in production mode
t -p

// run tests and get coverage in verbose mode
t
`),h({id:"cli-flags"},"CLI Flags"),j("Available command-line flags:"),A([v("-p, --production, --prod - Run tests without coverage (faster)"),v("-l, --verbose, --loud - Show detailed output including passing tests"),v("-i, --include - Files to include in coverage"),v("-e, --exclude - Files to exclude from coverage"),v("--help - Show help text")]),j("Common Usage:"),B(`
# Quick test run (no coverage, fails show errors)
npm test        # or: t -p

# Full test with coverage report
npm run coverage  # or: t

# Verbose output (shows passing tests)
t -l

# Test with coverage for specific files
t -i "src/**/*.js"
`),j(["This library tests itself, have a look at ",z({to:"https://github.com/magic/test/tree/master/test",text:"the tests"})," Checkout ",z({to:"https://github.com/magic/types/tree/master/test",text:"@magic/types"})," and the other magic libraries for more test examples."])],"/test/404/":()=>u("404 - not found.")};n({init:t(e({},{description:["simple tests with lots of utility. ecmascript modules only.","runs ecmascript module tests without transpilation.","unbelievably fast."],logotext:"@magic/test",menu:[{items:[{text:"install",to:"/test/#getting-started-install"},{text:"npm scripts",to:"/test/#getting-started-npm-scripts"},{text:"quick tests",to:"/test/#getting-started-quick-tests"},{text:"coverage",to:"/test/#getting-started-coverage"}],text:"getting started",to:"/test/#getting-started"},{items:[{text:"fs based test suites",to:"/test/#test-suites-fs"},{text:"data based test suites",to:"/test/#test-suites-data"}],text:"test suites",to:"/test/#test-suites"},{items:[{text:"testing types",to:"/test/#tests-types"},{text:"multiple tests in one file",to:"/test/#tests-multiple"},{text:"promises",to:"/test/#tests-promises"},{text:"callback functions",to:"/test/#tests-cb"},{text:"run function before / after individual tests",to:"/test/#tests-hooks"},{text:"run function before / after suite of tests",to:"/test/#tests-suite-hooks"},{text:"test @magic-modules",to:"/test/#tests-magic-modules"}],text:"writing tests",to:"/test/#tests"},{items:[{text:"curry",to:"/test/#lib-curry"},{text:"vals",to:"/test/#lib-vals"},{text:"env",to:"/test/#lib-env"},{text:"promises",to:"/test/#lib-promises"},{text:"http",to:"/test/#lib-http"},{text:"css",to:"/test/#lib-css"},{text:"tryCatch",to:"/test/#lib-trycatch"},{text:"svelte",to:"/test/#lib-svelte"}],text:"utility functions",to:"/test/#lib"},{items:[{text:"js api",to:"/test/#usage-js"},{text:"cli",to:"/test/#usage-cli"},{text:"npm i -g",to:"/test/#usage-global"}],text:"usage",to:"/test/#usage"}],nospy:{show:!1},pageClass:{},pages:{"/test/404/":{description:"404 - not found.",title:"404 - not found"}},root:"/test/",theme:"dark",title:"@magic/test",url:"/test/"}),{url:window.location.pathname,hash:window.location.hash.substr(1)}),subscriptions:e=>[[V.listenPopState,I.pop]],view:e=>{let t=U[e.url]?e.url:"/404/",s=U[t],o=e.pages&&e.pages[t];return o&&Object.keys(o).forEach(t=>{e[t]=o[t]}),e.url=t,R({page:s,state:e},[W(e),D(e)])},node:document.getElementById("Magic")})})();