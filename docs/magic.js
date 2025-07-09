function e(e){for(var t=1;t<arguments.length;t++){var s=null!=arguments[t]?arguments[t]:{},i=Object.keys(s);"function"==typeof Object.getOwnPropertySymbols&&(i=i.concat(Object.getOwnPropertySymbols(s).filter(function(e){return Object.getOwnPropertyDescriptor(s,e).enumerable}))),i.forEach(function(t){var i,r;i=e,r=s[t],t in i?Object.defineProperty(i,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):i[t]=r})}return e}function t(e,t){return t=null!=t?t:{},Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):(function(e,t){var s=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);s.push.apply(s,i)}return s})(Object(t)).forEach(function(s){Object.defineProperty(e,s,Object.getOwnPropertyDescriptor(t,s))}),e}function s(e,t){if(null==e)return{};var s,i,r=function(e,t){if(null==e)return{};var s,i,r={},n=Object.keys(e);for(i=0;i<n.length;i++)s=n[i],t.indexOf(s)>=0||(r[s]=e[s]);return r}(e,t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);for(i=0;i<n.length;i++)s=n[i],!(t.indexOf(s)>=0)&&Object.prototype.propertyIsEnumerable.call(e,s)&&(r[s]=e[s])}return r}(()=>{let{h:i,app:r}=(()=>{var e={},t=[],s=t.map,i=Array.isArray,r="undefined"!=typeof requestAnimationFrame?requestAnimationFrame:setTimeout,n=function(e){var t="";if("string"==typeof e)return e;if(i(e)&&e.length>0)for(var s,r=0;r<e.length;r++)""!==(s=n(e[r]))&&(t+=(t&&" ")+s);else for(var r in e)e[r]&&(t+=(t&&" ")+r);return t},o=function(e,t){var s={};for(var i in e)s[i]=e[i];for(var i in t)s[i]=t[i];return s},a=function(e){return e.reduce(function(e,t){return e.concat(t&&!0!==t?"function"==typeof t[0]?[t]:a(t):0)},t)},l=function(e,t){if(e!==t)for(var s in o(e,t)){var r,n;if(e[s]!==t[s]&&(r=e[s],n=t[s],!(i(r)&&i(n))||r[0]!==n[0]||"function"!=typeof r[0]))return!0;t[s]=e[s]}},c=function(e,t,s){for(var i,r,n=0,o=[];n<e.length||n<t.length;n++)i=e[n],o.push((r=t[n])?!i||r[0]!==i[0]||l(r[1],i[1])?[r[0],r[1],r[0](s,r[1]),i&&i[2]()]:i:i&&i[2]());return o},u=function(e,t,s,i,r,a){if("key"===t);else if("style"===t)for(var l in o(s,i))s=null==i||null==i[l]?"":i[l],"-"===l[0]?e[t].setProperty(l,s):e[t][l]=s;else"o"===t[0]&&"n"===t[1]?((e.actions||(e.actions={}))[t=t.slice(2)]=i)?s||e.addEventListener(t,r):e.removeEventListener(t,r):!a&&"list"!==t&&t in e?e[t]=null==i?"":i:null!=i&&!1!==i&&("class"!==t||(i=n(i)))?e.setAttribute(t,i):e.removeAttribute(t)},p=function(e,t,s){var i=e.props,r=3===e.type?document.createTextNode(e.name):(s=s||"svg"===e.name)?document.createElementNS("http://www.w3.org/2000/svg",e.name,{is:i.is}):document.createElement(e.name,{is:i.is});for(var n in i)u(r,n,null,i[n],t,s);for(var o=0,a=e.children.length;o<a;o++)r.appendChild(p(e.children[o]=h(e.children[o]),t,s));return e.node=r},f=function(e){return null==e?null:e.key},d=function(e,t,s,i,r,n){if(s===i);else if(null!=s&&3===s.type&&3===i.type)s.name!==i.name&&(t.nodeValue=i.name);else if(null==s||s.name!==i.name)t=e.insertBefore(p(i=h(i),r,n),t),null!=s&&e.removeChild(s.node);else{var a,l,c,m,g=s.props,b=i.props,y=s.children,x=i.children,w=0,v=0,k=y.length-1,j=x.length-1;for(var C in n=n||"svg"===i.name,o(g,b))("value"===C||"selected"===C||"checked"===C?t[C]:g[C])!==b[C]&&u(t,C,g[C],b[C],r,n);for(;v<=j&&w<=k&&null!=(c=f(y[w]))&&c===f(x[v]);)d(t,y[w].node,y[w],x[v]=h(x[v++],y[w++]),r,n);for(;v<=j&&w<=k&&null!=(c=f(y[k]))&&c===f(x[j]);)d(t,y[k].node,y[k],x[j]=h(x[j--],y[k--]),r,n);if(w>k)for(;v<=j;)t.insertBefore(p(x[v]=h(x[v++]),r,n),(l=y[w])&&l.node);else if(v>j)for(;w<=k;)t.removeChild(y[w++].node);else{for(var C=w,O={},T={};C<=k;C++)null!=(c=y[C].key)&&(O[c]=y[C]);for(;v<=j;){if(c=f(l=y[w]),m=f(x[v]=h(x[v],l)),T[c]||null!=m&&m===f(y[w+1])){null==c&&t.removeChild(l.node),w++;continue}null==m||1===s.type?(null==c&&(d(t,l&&l.node,l,x[v],r,n),v++),w++):(c===m?(d(t,l.node,l,x[v],r,n),T[m]=!0,w++):null!=(a=O[m])?(d(t,t.insertBefore(a.node,l&&l.node),a,x[v],r,n),T[m]=!0):d(t,l&&l.node,null,x[v],r,n),v++)}for(;w<=k;)null==f(l=y[w++])&&t.removeChild(l.node);for(var C in O)null==T[C]&&t.removeChild(O[C].node)}}return i.node=t},m=function(e,t){for(var s in e)if(e[s]!==t[s])return!0;for(var s in t)if(e[s]!==t[s])return!0},g=function(e){return"object"==typeof e?e:y(e)},h=function(e,t){return 2===e.type?((!t||!t.lazy||m(t.lazy,e.lazy))&&((t=g(e.lazy.view(e.lazy))).lazy=e.lazy),t):e},b=function(e,t,s,i,r,n){return{name:e,props:t,children:s,node:i,type:n,key:r}},y=function(s,i){return b(s,e,t,i,void 0,3)},x=function(t){return 3===t.nodeType?y(t.nodeValue,t):b(t.nodeName.toLowerCase(),e,s.call(t.childNodes,x),t,void 0,1)};return{h:function(t,s){for(var r,n=[],o=[],a=arguments.length;a-- >2;)n.push(arguments[a]);for(;n.length>0;)if(i(r=n.pop()))for(var a=r.length;a-- >0;)n.push(r[a]);else!1===r||!0===r||null==r||o.push(g(r));return s=s||e,"function"==typeof t?t(s,o):b(t,s,o,void 0,s.key)},app:function(e){var t={},s=!1,n=e.view,o=e.node,l=o&&x(o),u=e.subscriptions,p=[],f=function(e){b(this.actions[e.type],e)},m=function(e){return t!==e&&(t=e,u&&(p=c(p,a([u(t)]),b)),n&&!s&&r(y,s=!0)),t};let{middleware:h=e=>e}=e,b=h((e,s)=>"function"==typeof e?b(e(t,s)):i(e)?"function"==typeof e[0]||i(e[0])?b(e[0],"function"==typeof e[1]?e[1](s):e[1]):(a(e.slice(1)).map(function(e){e&&e[0](b,e[1])},m(e[0])),t):m(e));var y=function(){s=!1,o=d(o.parentNode,o,l,l=g(n(t)),f)};b(e.init)}}})(),n=e=>(t={},s)=>{let r=(e,...t)=>t.some(t=>t===typeof e);if(r(s,"undefined")){if(t.props)return i(e,{},[t]);r(t,"string","number","function")||Array.isArray(t)?(s=t,t={}):r(t.View,"function")&&(s=t.View,t={})}return i(e,t,s)},o=n("a");n("abbr"),n("address"),n("animate"),n("animateMotion"),n("animateTransform"),n("area"),n("article"),n("aside"),n("audio"),n("b"),n("base"),n("bdi"),n("bdo"),n("blockquote"),n("body"),n("br");let a=n("button");n("canvas"),n("caption");let l=n("circle");n("cite"),n("clipPath");let c=n("code");n("col"),n("colgroup"),n("data"),n("datalist"),n("dd"),n("defs"),n("del"),n("desc"),n("description"),n("details"),n("dfn"),n("dialog"),n("discard");let u=n("div");n("dl"),n("dt"),n("ellipse"),n("em"),n("embed"),n("feBlend"),n("feColorMatrix"),n("feComponentTransfer"),n("feComposite"),n("feConvolveMatrix"),n("feDiffuseLighting"),n("feDisplacementMap"),n("feDistantLight"),n("feDropShadow"),n("feFlood"),n("feFuncA"),n("feFuncB"),n("feFuncG"),n("feFuncR"),n("feGaussianBlur"),n("feImage"),n("feMerge"),n("feMergeNode"),n("feMorphology"),n("feOffset"),n("fePointLight"),n("feSpecularLighting"),n("feSpotLight"),n("feTile"),n("feTurbulence"),n("fieldset"),n("figcaption"),n("figure"),n("filter");let p=n("footer");n("foreignObject"),n("form");let f=n("g"),d=n("h1"),m=n("h2"),g=n("h3"),h=n("h4");n("h5"),n("h6"),n("hatch"),n("hatchpath"),n("head");let b=n("header");n("hgroup"),n("hr"),n("html"),n("i"),n("iframe"),n("image");let y=n("img"),x=n("input");n("ins"),n("kbd"),n("label"),n("legend");let w=n("li");n("line"),n("linearGradient"),n("link");let v=n("main");n("map"),n("mark"),n("marker"),n("mask"),n("mesh"),n("meshgradient"),n("meshpatch"),n("meshrow"),n("meta"),n("metadata"),n("meter"),n("mpath");let k=n("nav");n("noscript"),n("object"),n("ol"),n("optgroup"),n("option"),n("output");let j=n("p");n("param");let C=n("path");n("pattern"),n("picture"),n("polygon"),n("polyline");let O=n("pre");n("progress"),n("q"),n("radialGradient"),n("rb"),n("rect"),n("rp"),n("rt"),n("rtc"),n("ruby"),n("s"),n("samp"),n("script"),n("section"),n("select"),n("set"),n("small"),n("solidcolor"),n("source");let T=n("span");n("stop"),n("strong"),n("style"),n("sub"),n("summary"),n("sup");let A=n("svg");n("symbol"),n("table"),n("tbody"),n("td"),n("template"),n("text"),n("textPath"),n("textarea"),n("tfoot"),n("th"),n("thead"),n("time"),n("title"),n("tr"),n("track"),n("tspan"),n("u");let P=n("ul");n("unknown"),n("url"),n("use"),n("video"),n("view"),n("wbr");let $=()=>u({class:"Credits"},["made with a few bits of ",q({to:"https://magic.github.io/",target:"_blank",rel:"noopener"},"magic")]),M=(e,t=[])=>p({class:"Footer"},[u({class:"Container"},[$(),t])]),S=e=>{if("string"==typeof e)e={project:e};else if(!e.project)return;let{branch:t="master",host:s="github"}=e,{project:i=!1}=e,r="",n=i;i.startsWith("@")?(r="@",i=i.substr(1)):n=i.split("/")[1];let o=[["npm",(e=i)=>e&&{to:`https://www.npmjs.com/package/${n}`,src:`https://img.shields.io/npm/v/${r}${e}?color=blue`}],["node",(e=i)=>e&&{src:`https://img.shields.io/node/v/${r}${e}?color=blue`}],["license",(e=i)=>e&&{src:`https://img.shields.io/npm/l/${r}${e}?color=blue`}],["travis",(e=i)=>e&&{to:`https://travis-ci.com/${e}`,src:`https://img.shields.io/travis/com/${e}/${t}`}],["appveyor",(e=i)=>{if(e){let[s,i]=e.split("/");return{to:`https://ci.appveyor.com/project/${s=s.replace(/-/g,"")}/${i}/branch/${t}`,src:`https://img.shields.io/appveyor/ci/${s}/${i}/${t}.svg`}}}],["coveralls",(e=i)=>({to:`https://coveralls.io/${s}/${e}`,src:`https://img.shields.io/coveralls/${s}/${e}/${t}.svg`})],["snyk",(e=i)=>e&&{to:`https://snyk.io/test/${s}/${e}`,src:`https://img.shields.io/snyk/vulnerabilities/github/${e}.svg`}]].map(([t,s])=>s(e[t]));if(o.length)return P({class:"GitBadges"},o.map(({to:e,src:t})=>{if(!t)return;let s=z({src:t,height:"23"});return e?w(q({to:e},s)):w(s)}))},W=(e={},t=[])=>{let{logo:s,menu:i,logotext:r,hash:n,url:o}=e;if(s||i||r)return b({class:"Header"},[L(),r&&j(r),i&&B({url:o,hash:n,menu:i}),t])},z=e=>{"string"==typeof e&&(e={src:e});let{loading:t="lazy"}=e;if(e.src)return e.hasOwnProperty("alt")||(e.title?e.alt=e.title:e.alt=""),e.loading=t,y(e)},E=(e={})=>A({class:"LightSwitch icon",onclick:V.changeTheme,height:25,width:25,viewBox:"0 0 352 460"},[C({d:"M149 48C96 48 48 95 47 143c-1 13 19 17 20 0-1-35 48-75 83-75 15 0 12-22-1-20z"}),C({d:"M176 0C74 0 0 83 0 176c9 91 84 118 100 204h20c-16-92-97-138-100-204C22 70 105 21 176 20zM95 400c2 68 20 48 40 60h82c20-12 38 8 40-60z"}),C({d:"M175 0c102 0 177 83 177 176-9 91-86 118-102 204h-20c16-92 99-138 102-204-2-106-86-155-157-156z"})]),q=(e,t)=>{var{to:i,action:r=V.go,text:n}=e,a=s(e,["to","action","text"]);let{href:l,nofollow:c,noreferrer:u}=a,p=s(a,["href","nofollow","noreferrer"]);i=i||l||"",p.href=i,n&&t?n=[n,t]:n||(n=t||i);let f="/"===i[0]||"#"===i[0];return f?p.onclick=[r,I.preventDefault]:(p.target="_blank",p.rel="noopener",c&&(p.rel+=" nofollow"),u&&(p.rel+=" noreferrer")),o(p,n)},L=()=>q({to:"/test/",class:"Logo"},[A({viewBox:"0 0 512 444"},[C({d:"M512 444L256 0 0 444z",fill:"#663695"}),l({cx:"256",cy:"294",r:"130",fill:"#fff"}),l({cx:"256",cy:"281",r:"40",fill:"#663695"}),C({d:"M256 350v44m24-44l1 13c1 27 29 27 29-7m-160-72s46-47 106-47c59 0 106 47 106 47s-47 43-106 43c-60 0-106-43-106-43zm65-75a134 134 0 0189 2",class:"stroke"}),C({d:"M256 81v53m184 270l-43-29M72 404l43-29",class:"stroke white"})])]),B=(s={})=>{let{collapse:i=!0,menu:r,hash:n}=s,{class:o="",url:a}=s;return o.includes("Menu")||(o=`Menu ${o}`.trim()),n&&!a.endsWith(n)&&(a+=`#${n}`),k({className:o},P(r.map(s=>N(t(e({},s),{url:a,collapse:i})))))},N=t=>{let{collapse:i,items:r=[],text:n,url:o}=t,a=s(t,["collapse","items","text","url"]),l={class:{}},{to:c}=a;c===o&&(l.class.active=!0);let u=[],p=!i||o.includes(c);return p&&r.length&&(u=P(r.map(t=>N(e({url:o,collapse:i},t))))),w(l,[c?q(a,n):T(a,n),u])},D=({nospy:e={},cookies:t=[]})=>{let{show:s,title:i="Privacy Notice",content:r="This app neither saves, collects, nor shares any data about you.",buttonText:n="Awesome!"}=e;return s?u({class:"NoSpy"},[u({class:"Background",onclick:V.nospy.toggle}),u({class:"Container"},[i&&g(i),r&&j(r),x({onclick:V.nospy.toggle,value:n,type:"button"})])]):u({class:"NoSpy"},A({class:"icon",onclick:V.nospy.toggle,width:"25",height:"25",viewBox:"0 0 512 512"},[f([C({d:`
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
`}),l({cx:"192",cy:"128",r:"32"}),l({cx:"128",cy:"256",r:"32"}),l({cx:"288",cy:"384",r:"32"}),l({cx:"272",cy:"272",r:"16"}),l({cx:"400",cy:"336",r:"16"}),l({cx:"176",cy:"368",r:"16"})])]))},F=({page:e,state:t},s)=>{let i={id:"Magic",class:t.pageClass};return v(i,u({class:{Wrapper:!0}},[W(t),u({class:"Page",id:"page"},e(t)),M(t),s]))},R=(t,s)=>{"string"==typeof t?t={content:t}:s?t=e({content:s},t):Array.isArray(t)&&(t={content:t.join("")});let{content:i,lines:r=!0}=t;return u({class:{Pre:!0,lines:r&&"false"!==r}},[u({class:"menu"},[a({onclick:[V.pre.clip,e=>({e,content:i})]},"copy")]),O(i.trim().split("\n").map(R.Line))])};R.Comment=e=>T({class:"comment"},e),R.Line=e=>c({class:"line"},R.Words(e)),R.Word=e=>{if(!e)return"";let t=e.includes("://"),s=e.startsWith("mailto:")||e.includes("@")&&e.includes(".");if(t||s)return q({to:e,text:e});let i="";return("state"===e?i="state":"actions"===e?i="actions":"effects"===e?i="effects":"subscriptions"===e?i="subscriptions":I.pre.keywords.includes(e)?i="keyword":I.pre.builtins.includes(e)?i="builtin":I.pre.booleans.includes(e)&&(i="boolean"),i)?T({class:i},e):e},R.Words=e=>{let[t,...s]=e.split(I.pre.commentRegex),i=!t.endsWith(":")&&s.length;if(i)return[R.Words(t),R.Comment(s.join("").split(I.pre.wordRegex).map(R.Word))];let r=[],n=e;if(e.replace(I.pre.stringRegex,e=>{if(n){let[t,s]=n.split(e);t&&r.push(t.split(I.pre.wordRegex).map(R.Word).filter(e=>e)),n=s}r.push(T({class:"string"},e))}),n!==e)return n&&r.push(n.split(I.pre.wordRegex).map(R.Word).filter(e=>e)),r;let o=e.split(I.pre.wordRegex).filter(e=>e);return o.map(R.Word)};let I={pre:{booleans:["true","false"],builtins:["Array","Object","String","Number","RegExp","Null","Symbol","Set","WeakSet","Map","WeakMap","setInterval","setTimeout","Promise","JSON","Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Uint16Array","Int32Array","Uint32Array","Float32Array","Float64Array"],commentRegex:/(\/\/)/gim,keywords:["let","this","long","package","float","goto","private","class","if","short","while","protected","with","debugger","case","continue","volatile","interface","instanceof","super","synchronized","throw","extends","final","export","throws","try","import","double","enum","boolean","abstract","function","implements","typeof","transient","break","default","do","static","void","int","new","async","native","switch","else","delete","null","public","var","await","byte","finally","catch","in","return","for","get","const","char","module","exports","require","npm","install","=>"],stringRegex:/("|')(.*?)\1/gim,wordRegex:/( )/gim},preventDefault:e=>(e.preventDefault(),e)},V={changeTheme:s=>t(e({},s),{pageClass:t(e({},s.pageClass),{light:"dark"===s.theme}),theme:"dark"===s.theme?"light":"dark"}),go:(s,i)=>{let r=i.currentTarget.href.replace(window.location.origin,""),[n,o=""]=r.split("#");if(n===s.url&&o===s.hash)return o&&(window.location.hash=o),s;let a=s.pages&&s.pages[n]&&s.pages[n].title;a&&(document.title=s.title=a),n!==s.url?o||window.scrollTo({top:0}):window.location.hash=o;let{scrollY:l}=window;return window.history.pushState({url:n,hash:o,scrollY:l},s.title,r),t(e({},s),{url:n,hash:o,prev:s.url})},nospy:{toggle:t=>(t.nospy.show=!t.nospy.show,e({},t))},pop:(s,i)=>{let{pathname:r,hash:n}=window.location;n=n.substring(1);let o=0;return i.state&&(r=i.state.url,n=i.state.hash,o=i.state.scrollY||0),n?window.location.hash=n:window.scroll({top:o}),t(e({},s),{url:r,hash:n})},pre:{clip:(e,{content:t})=>{if("undefined"!=typeof document&&"function"==typeof document.execCommand){let e=document.createElement("textarea");e.id="copy",e.innerHTML=t,document.body.appendChild(e);let s=document.getElementById("copy");s.select(),document.execCommand("copy"),document.body.removeChild(s)}return e}}},G={listenPopState:(e,t)=>{let s=s=>e(t,s);return addEventListener("popstate",s),()=>removeEventListener("popstate",s)}},U={"/test/":e=>[d({id:"magictest"},"@magic/test"),j(["simple tests with lots of utility."," ecmascript modules only."," runs ecmascript module syntax tests without transpilation."," unbelievably fast."]),S("@magic/test"),m({id:"getting-started"},"getting started"),j("be in a nodejs project."),g({id:"getting-started-install"},"install"),R({lines:"false"},"npm i --save-dev --save-exact @magic/test"),g("Create a test"),R(`
// create test/functionName.js
import yourTest from '../path/to/your/file.js'

export default [
  { fn: () => true, expect: true, info: 'true is true' },
  // note that the yourTest function will be called automagically
  { fn: yourTest, expect: true, info: 'hope this will work ;)'}
]
`),g({id:"getting-started-npm-scripts"},"npm scripts"),j("edit package.json"),R(`
{
  "scripts": {
    "test": "t -p", // quick test, only failing tests log
    "coverage": "t", // get full test output and coverage reports
  }
}
`),j("repeated for easy copy pasting (without comments and trailing commas)"),R(`
  "scripts": {
    "test": "t -p",
    "coverage": "t"
  }
`),g({id:"getting-started-quick-tests"},"quick tests"),j("without coverage"),R(`
  // run the tests:
npm test

// example output:
// (failing tests will print, passing tests are silent)

// ### Testing package: @magic/test
// Ran 2 tests. Passed 2/2 100%
`),g({id:"getting-started-coverage"},"coverage"),j(["@magic/test will automagically generate coverage reports"," if it is not called with the -p flag."]),g({id:"test-suites"},"data/fs driven test suite creation:"),h({id:"expectations-for-optimal-test-messages"},"expectations for optimal test messages:"),P([w("src and test directories have the same directory structure and filenames"),w("tests one src file per test file"),w("tests one function per test suite"),w("tests one feature per test unit")]),h({id:"test-suites-fs"},"Filesystem based naming"),j("the following directory structure:"),R(`./test/
  ./suite1.js
  ./suite2.js`),j("yields the same result as exporting the following from ./test/index.js"),h({id:"test-suites-data"},"Data driven naming"),R(`import suite1 from './suite1'
import suite2 from './suite2'

export default {
  suite1,
  suite2,
}`),g({id:"important---file-mappings"},"Important - File mappings"),j(["if test/index.js exists, no other files will be loaded."," if test/index.js exists, no other files from that directory will be loaded,"," if test/lib/index.js, no other files from that subdirectory will be loaded."," instead the exports of those index.js will be expected to be tests"]),g({id:"tests"},"single test"),j("literal value, function or promise"),R(`
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
`),h({id:"tests-types"},"testing types"),j(["types can be compared using ",q({to:"https://github.com/magic/types",text:"@magic/types"})]),j(["@magic/types is a richly featured and thoroughly tested type library without dependencies."," it is exported from this library for convenience."]),R(`
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
`),h({id:"caveat"},"caveat:"),j(["if you want to test if a function is a function, you need to wrap the function in a function."," this is because functions passed to fn get executed automatically."]),R(`
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
`),R(`
// will not work as expected and instead call fnToTest
export default {
  fn: fnToTest,
  expect: is.function,
  info: 'function is a function',
}
`),g({id:"tests-multiple"},"multiple tests"),j("multiple tests can be created by exporting an array of single test objects."),R(`
export default {
  multipleTests: [
    { fn: () => true, expect: true, info: 'expect true to be true' },
    { fn: () => false, expect: false, info: 'expect false to be false' },
  ]
}`),j("multiple tests can also be created by exporting an array of tests."),R(`
export default [
  { fn: () => true, expect: true, info: 'expect true to be true' },
  { fn: () => false, expect: false, info: 'expect false to be false' },
]
`),g({id:"tests-promises"},"promises"),R(`
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
`),g({id:"tests-cb"},"callback functions"),R(`
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
`),g({id:"tests-hooks"},"hooks"),j("run functions before and/or after individual test"),R(`
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
`),g({id:"tests-suite-hooks"},"suite hooks"),j("run functions before and/or after a suite of tests"),R(`
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
`),g({id:"tests-magic-modules"},"magic modules"),j(["@magic-modules assume all html tags to be globally defined."," to create those globals for your test and check if a @magic-module returns the correct markup,"," just add an html: true flag to the test."]),R(`
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
`),m({id:"lib"},"Utility Belt"),j(["@magic/test exports some utility functions"," that make working with complex test workflows simpler."]),h({id:"lib-curry"},"curry"),j(["Currying can be used to split the arguments of a function into multiple nested functions."," This helps if you have a function with complicated arguments that you just want to quickly shim."]),R(`
import { curry } from '@magic/test'

const compare = (a, b) => a === b
const curried = curry(compare)
const shimmed = curried('shimmed_value')

export default {
  fn: shimmed('shimmed_value'),
  expect: true,
  info: 'expect will be called with a and b and a will equal b',
}
`),h({id:"lib-vals"},"vals"),j(["exports some javascript types. more to come."," will sometime in the future be the base of a fuzzer."]),g({id:"lib-promises"},"promises"),j(["Helper function to wrap nodejs callback functions and promises with ease."," Handle the try/catch steps internally and return a resolved or rejected promise."]),R(`
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
`),g({id:"lib-css"},"css"),j(["exports ",q({to:"https://github.com/magic/css",text:"@magic/css"}),", which allows parsing and stringification of css-in-js objects."]),h({id:"lib-trycatch"},"trycatch"),j("allows to test functions without bubbling the errors up into the runtime"),R(`
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
`),h({id:"lib-version"},"version"),j("The version plugin checks your code according to a spec defined by you. This is designed to warn you on changes to your exports."),j(["Internally, the version function calls ",q({to:"https://github.com/magic/types",text:"@magic/types"})," and all functions exported from it are valid type strings in version specs."]),R(`
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
  `),m({id:"usage"},"usage"),g({id:"usage-js"},"js"),R(`
// test/index.js
import run from '@magic/test'

const tests = {
  lib: [
    { fn: () => true, expect: true, info: 'Expect true to be true' }
  ],
}

run(tests)
`),m({id:"usage-cli"},"cli"),g({id:"packagejson-recommended"},"package.json (recommended)"),j("add the magic/test bin scripts to package.json"),R(`
{
  "scripts": {
    "test": "t -p",
    "coverage": "t",
  },
  "devDependencies": {
    "@magic/test": "github:magic/test"
  }
}`),j("then use the npm run scripts"),R(`
npm test
npm run coverage
`),g({id:"usage-global"},"Globally (not recommended):"),j(["you can install this library globally,"," but the recommendation is to add the dependency and scripts to the package.json file."]),j(["this both explains to everyone that your app has these dependencies"," as well as keeping your bash free of clutter"]),R(`
npm i -g @magic/test

// run tests in production mode
t -p

// run tests and get coverage in verbose mode
t
`),j(["This library tests itself, have a look at ",q({to:"https://github.com/magic/test/tree/master/test",text:"the tests"})," Checkout ",q({to:"https://github.com/magic/types/tree/master/test",text:"@magic/types"})," and the other magic libraries for more test examples."])],"/test/404/":()=>u("404 - not found.")};r({init:t(e({},{description:["simple tests with lots of utility. ecmascript modules only.","runs ecmascript module tests without transpilation.","unbelievably fast."],logotext:"@magic/test",menu:[{items:[{text:"install",to:"/test/#getting-started-install"},{text:"npm scripts",to:"/test/#getting-started-npm-scripts"},{text:"quick tests",to:"/test/#getting-started-quick-tests"},{text:"coverage",to:"/test/#getting-started-coverage"}],text:"getting started",to:"/test/#getting-started"},{items:[{text:"fs based test suites",to:"/test/#test-suites-fs"},{text:"data based test suites",to:"/test/#test-suites-data"}],text:"test suites",to:"/test/#test-suites"},{items:[{text:"testing types",to:"/test/#tests-types"},{text:"multiple tests in one file",to:"/test/#tests-multiple"},{text:"promises",to:"/test/#tests-promises"},{text:"callback functions",to:"/test/#tests-cb"},{text:"run function before / after individual tests",to:"/test/#tests-hooks"},{text:"run function before / after suite of tests",to:"/test/#tests-suite-hooks"},{text:"test @magic-modules",to:"/test/#tests-magic-modules"}],text:"writing tests",to:"/test/#tests"},{items:[{text:"curry",to:"/test/#lib-curry"},{text:"vals",to:"/test/#lib-vals"},{text:"promises",to:"/test/#lib-promises"},{text:"css",to:"/test/#lib-css"},{text:"tryCatch",to:"/test/#lib-trycatch"}],text:"utility functions",to:"/test/#lib"},{items:[{text:"js api",to:"/test/#usage-js"},{text:"cli",to:"/test/#usage-cli"},{text:"npm i -g",to:"/test/#usage-global"}],text:"usage",to:"/test/#usage"}],nospy:{show:!1},pageClass:{},pages:{"/test/404/":{description:"404 - not found.",title:"404 - not found"}},root:"/test/",theme:"dark",title:"@magic/test",url:"/test/"}),{url:window.location.pathname,hash:window.location.hash.substr(1)}),subscriptions:e=>[[G.listenPopState,V.pop]],view:e=>{let t=U[e.url]?e.url:"/404/",s=U[t],i=e.pages&&e.pages[t];return i&&Object.keys(i).forEach(t=>{e[t]=i[t]}),e.url=t,F({page:s,state:e},[E(e),D(e)])},node:document.getElementById("Magic")})})();