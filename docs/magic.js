function e(e){for(var t=1;t<arguments.length;t++){var s=null!=arguments[t]?arguments[t]:{},o=Object.keys(s);"function"==typeof Object.getOwnPropertySymbols&&(o=o.concat(Object.getOwnPropertySymbols(s).filter(function(e){return Object.getOwnPropertyDescriptor(s,e).enumerable}))),o.forEach(function(t){var o,r;o=e,r=s[t],t in o?Object.defineProperty(o,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):o[t]=r})}return e}function t(e,t){return t=null!=t?t:{},Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):(function(e,t){var s=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);s.push.apply(s,o)}return s})(Object(t)).forEach(function(s){Object.defineProperty(e,s,Object.getOwnPropertyDescriptor(t,s))}),e}function s(e,t){if(null==e)return{};var s,o,r=function(e,t){if(null==e)return{};var s,o,r={},n=Object.keys(e);for(o=0;o<n.length;o++)s=n[o],t.indexOf(s)>=0||(r[s]=e[s]);return r}(e,t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);for(o=0;o<n.length;o++)s=n[o],!(t.indexOf(s)>=0)&&Object.prototype.propertyIsEnumerable.call(e,s)&&(r[s]=e[s])}return r}(()=>{let{h:o,app:r}=(()=>{var e={},t=[],s=t.map,o=Array.isArray,r="undefined"!=typeof requestAnimationFrame?requestAnimationFrame:setTimeout,n=function(e){var t="";if("string"==typeof e)return e;if(o(e)&&e.length>0)for(var s,r=0;r<e.length;r++)""!==(s=n(e[r]))&&(t+=(t&&" ")+s);else for(var r in e)e[r]&&(t+=(t&&" ")+r);return t},i=function(e,t){var s={};for(var o in e)s[o]=e[o];for(var o in t)s[o]=t[o];return s},a=function(e){return e.reduce(function(e,t){return e.concat(t&&!0!==t?"function"==typeof t[0]?[t]:a(t):0)},t)},l=function(e,t){if(e!==t)for(var s in i(e,t)){var r,n;if(e[s]!==t[s]&&(r=e[s],n=t[s],!(o(r)&&o(n))||r[0]!==n[0]||"function"!=typeof r[0]))return!0;t[s]=e[s]}},c=function(e,t,s){for(var o,r,n=0,i=[];n<e.length||n<t.length;n++)o=e[n],i.push((r=t[n])?!o||r[0]!==o[0]||l(r[1],o[1])?[r[0],r[1],r[0](s,r[1]),o&&o[2]()]:o:o&&o[2]());return i},u=function(e,t,s,o,r,a){if("key"===t);else if("style"===t)for(var l in i(s,o))s=null==o||null==o[l]?"":o[l],"-"===l[0]?e[t].setProperty(l,s):e[t][l]=s;else"o"===t[0]&&"n"===t[1]?((e.actions||(e.actions={}))[t=t.slice(2)]=o)?s||e.addEventListener(t,r):e.removeEventListener(t,r):!a&&"list"!==t&&t in e?e[t]=null==o?"":o:null!=o&&!1!==o&&("class"!==t||(o=n(o)))?e.setAttribute(t,o):e.removeAttribute(t)},p=function(e,t,s){var o=e.props,r=3===e.type?document.createTextNode(e.name):(s=s||"svg"===e.name)?document.createElementNS("http://www.w3.org/2000/svg",e.name,{is:o.is}):document.createElement(e.name,{is:o.is});for(var n in o)u(r,n,null,o[n],t,s);for(var i=0,a=e.children.length;i<a;i++)r.appendChild(p(e.children[i]=g(e.children[i]),t,s));return e.node=r},d=function(e){return null==e?null:e.key},f=function(e,t,s,o,r,n){if(s===o);else if(null!=s&&3===s.type&&3===o.type)s.name!==o.name&&(t.nodeValue=o.name);else if(null==s||s.name!==o.name)t=e.insertBefore(p(o=g(o),r,n),t),null!=s&&e.removeChild(s.node);else{var a,l,c,m,h=s.props,b=o.props,y=s.children,x=o.children,v=0,w=0,k=y.length-1,E=x.length-1;for(var T in n=n||"svg"===o.name,i(h,b))("value"===T||"selected"===T||"checked"===T?t[T]:h[T])!==b[T]&&u(t,T,h[T],b[T],r,n);for(;w<=E&&v<=k&&null!=(c=d(y[v]))&&c===d(x[w]);)f(t,y[v].node,y[v],x[w]=g(x[w++],y[v++]),r,n);for(;w<=E&&v<=k&&null!=(c=d(y[k]))&&c===d(x[E]);)f(t,y[k].node,y[k],x[E]=g(x[E--],y[k--]),r,n);if(v>k)for(;w<=E;)t.insertBefore(p(x[w]=g(x[w++]),r,n),(l=y[v])&&l.node);else if(w>E)for(;v<=k;)t.removeChild(y[v++].node);else{for(var T=v,C={},j={};T<=k;T++)null!=(c=y[T].key)&&(C[c]=y[T]);for(;w<=E;){if(c=d(l=y[v]),m=d(x[w]=g(x[w],l)),j[c]||null!=m&&m===d(y[v+1])){null==c&&t.removeChild(l.node),v++;continue}null==m||1===s.type?(null==c&&(f(t,l&&l.node,l,x[w],r,n),w++),v++):(c===m?(f(t,l.node,l,x[w],r,n),j[m]=!0,v++):null!=(a=C[m])?(f(t,t.insertBefore(a.node,l&&l.node),a,x[w],r,n),j[m]=!0):f(t,l&&l.node,null,x[w],r,n),w++)}for(;v<=k;)null==d(l=y[v++])&&t.removeChild(l.node);for(var T in C)null==j[T]&&t.removeChild(C[T].node)}}return o.node=t},m=function(e,t){for(var s in e)if(e[s]!==t[s])return!0;for(var s in t)if(e[s]!==t[s])return!0},h=function(e){return"object"==typeof e?e:y(e)},g=function(e,t){return 2===e.type?((!t||!t.lazy||m(t.lazy,e.lazy))&&((t=h(e.lazy.view(e.lazy))).lazy=e.lazy),t):e},b=function(e,t,s,o,r,n){return{name:e,props:t,children:s,node:o,type:n,key:r}},y=function(s,o){return b(s,e,t,o,void 0,3)},x=function(t){return 3===t.nodeType?y(t.nodeValue,t):b(t.nodeName.toLowerCase(),e,s.call(t.childNodes,x),t,void 0,1)};return{h:function(t,s){for(var r,n=[],i=[],a=arguments.length;a-- >2;)n.push(arguments[a]);for(;n.length>0;)if(o(r=n.pop()))for(var a=r.length;a-- >0;)n.push(r[a]);else!1===r||!0===r||null==r||i.push(h(r));return s=s||e,"function"==typeof t?t(s,i):b(t,s,i,void 0,s.key)},app:function(e){var t={},s=!1,n=e.view,i=e.node,l=i&&x(i),u=e.subscriptions,p=[],d=function(e){b(this.actions[e.type],e)},m=function(e){return t!==e&&(t=e,u&&(p=c(p,a([u(t)]),b)),n&&!s&&r(y,s=!0)),t};let{middleware:g=e=>e}=e,b=g((e,s)=>"function"==typeof e?b(e(t,s)):o(e)?"function"==typeof e[0]||o(e[0])?b(e[0],"function"==typeof e[1]?e[1](s):e[1]):(a(e.slice(1)).map(function(e){e&&e[0](b,e[1])},m(e[0])),t):m(e));var y=function(){s=!1,i=f(i.parentNode,i,l,l=h(n(t)),d)};b(e.init)}}})(),n=e=>(t={},s)=>{let r=(e,...t)=>t.some(t=>t===typeof e);if(r(s,"undefined")){if(t.props)return o(e,{},[t]);r(t,"string","number","function")||Array.isArray(t)?(s=t,t={}):r(t.View,"function")&&(s=t.View,t={})}return o(e,t,s)},i=n("a");n("abbr"),n("address"),n("animate"),n("animateMotion"),n("animateTransform"),n("area"),n("article"),n("aside"),n("audio"),n("b"),n("base"),n("bdi"),n("bdo"),n("blockquote"),n("body"),n("br");let a=n("button");n("canvas"),n("caption");let l=n("circle");n("cite"),n("clipPath");let c=n("code");n("col"),n("colgroup"),n("data"),n("datalist"),n("dd"),n("defs"),n("del"),n("desc"),n("description"),n("details"),n("dfn"),n("dialog"),n("discard");let u=n("div");n("dl"),n("dt"),n("ellipse"),n("em"),n("embed"),n("feBlend"),n("feColorMatrix"),n("feComponentTransfer"),n("feComposite"),n("feConvolveMatrix"),n("feDiffuseLighting"),n("feDisplacementMap"),n("feDistantLight"),n("feDropShadow"),n("feFlood"),n("feFuncA"),n("feFuncB"),n("feFuncG"),n("feFuncR"),n("feGaussianBlur"),n("feImage"),n("feMerge"),n("feMergeNode"),n("feMorphology"),n("feOffset"),n("fePointLight"),n("feSpecularLighting"),n("feSpotLight"),n("feTile"),n("feTurbulence"),n("fieldset"),n("figcaption"),n("figure"),n("filter");let p=n("footer");n("foreignObject"),n("form");let d=n("g"),f=n("h1"),m=n("h2"),h=n("h3"),g=n("h4");n("h5"),n("h6"),n("hatch"),n("hatchpath"),n("head");let b=n("header");n("hgroup"),n("hr"),n("html"),n("i"),n("iframe"),n("image");let y=n("img"),x=n("input");n("ins"),n("kbd"),n("label"),n("legend");let v=n("li");n("line"),n("linearGradient"),n("link");let w=n("main");n("map"),n("mark"),n("marker"),n("mask"),n("mesh"),n("meshgradient"),n("meshpatch"),n("meshrow"),n("meta"),n("metadata"),n("meter"),n("mpath");let k=n("nav");n("noscript"),n("object"),n("ol"),n("optgroup"),n("option"),n("output");let E=n("p");n("param");let T=n("path");n("pattern"),n("picture"),n("polygon"),n("polyline");let C=n("pre");n("progress"),n("q"),n("radialGradient"),n("rb"),n("rect"),n("rp"),n("rt"),n("rtc"),n("ruby"),n("s"),n("samp"),n("script"),n("section"),n("select"),n("set"),n("small"),n("solidcolor"),n("source");let j=n("span");n("stop"),n("strong"),n("style"),n("sub"),n("summary"),n("sup");let S=n("svg");n("symbol"),n("table"),n("tbody"),n("td"),n("template"),n("text"),n("textPath"),n("textarea"),n("tfoot"),n("th"),n("thead"),n("time"),n("title"),n("tr"),n("track"),n("tspan"),n("u");let R=n("ul");n("unknown"),n("url"),n("use"),n("video"),n("view"),n("wbr");let O=()=>u({class:"Credits"},["made with a few bits of ",F({to:"https://magic.github.io/",target:"_blank",rel:"noopener"},"magic")]),N=(e,t=[])=>p({class:"Footer"},[u({class:"Container"},[O(),t])]),P=e=>{if("string"==typeof e)e={project:e};else if(!e.project)return;let{branch:t="master",host:s="github"}=e,{project:o=!1}=e,r="",n=o;o.startsWith("@")?(r="@",o=o.substr(1)):n=o.split("/")[1];let i=[["npm",(e=o)=>e&&{to:`https://www.npmjs.com/package/${n}`,src:`https://img.shields.io/npm/v/${r}${e}?color=blue`}],["node",(e=o)=>e&&{src:`https://img.shields.io/node/v/${r}${e}?color=blue`}],["license",(e=o)=>e&&{src:`https://img.shields.io/npm/l/${r}${e}?color=blue`}],["travis",(e=o)=>e&&{to:`https://travis-ci.com/${e}`,src:`https://img.shields.io/travis/com/${e}/${t}`}],["appveyor",(e=o)=>{if(e){let[s,o]=e.split("/");return{to:`https://ci.appveyor.com/project/${s=s.replace(/-/g,"")}/${o}/branch/${t}`,src:`https://img.shields.io/appveyor/ci/${s}/${o}/${t}.svg`}}}],["coveralls",(e=o)=>({to:`https://coveralls.io/${s}/${e}`,src:`https://img.shields.io/coveralls/${s}/${e}/${t}.svg`})],["snyk",(e=o)=>e&&{to:`https://snyk.io/test/${s}/${e}`,src:`https://img.shields.io/snyk/vulnerabilities/github/${e}.svg`}]].map(([t,s])=>s(e[t]));if(i.length)return R({class:"GitBadges"},i.map(({to:e,src:t})=>{if(!t)return;let s=M({src:t,height:"23"});return e?v(F({to:e},s)):v(s)}))},A=(e={},t=[])=>{let{logo:s,menu:o,logotext:r,hash:n,url:i}=e;if(s||o||r)return b({class:"Header"},[_(),r&&E(r),o&&I({url:i,hash:n,menu:o}),t])},M=e=>{"string"==typeof e&&(e={src:e});let{loading:t="lazy"}=e;if(e.src)return e.hasOwnProperty("alt")||(e.title?e.alt=e.title:e.alt=""),e.loading=t,y(e)},D=(e={})=>S({class:"LightSwitch icon",onclick:U.changeTheme,height:25,width:25,viewBox:"0 0 352 460"},[T({d:"M149 48C96 48 48 95 47 143c-1 13 19 17 20 0-1-35 48-75 83-75 15 0 12-22-1-20z"}),T({d:"M176 0C74 0 0 83 0 176c9 91 84 118 100 204h20c-16-92-97-138-100-204C22 70 105 21 176 20zM95 400c2 68 20 48 40 60h82c20-12 38 8 40-60z"}),T({d:"M175 0c102 0 177 83 177 176-9 91-86 118-102 204h-20c16-92 99-138 102-204-2-106-86-155-157-156z"})]),F=(e,t)=>{var{to:o,action:r=U.go,text:n}=e,a=s(e,["to","action","text"]);let{href:l,nofollow:c,noreferrer:u}=a,p=s(a,["href","nofollow","noreferrer"]);o=o||l||"",p.href=o,n&&t?n=[n,t]:n||(n=t||o);let d="/"===o[0]||"#"===o[0];return d?p.onclick=[r,z.preventDefault]:(p.target="_blank",p.rel="noopener",c&&(p.rel+=" nofollow"),u&&(p.rel+=" noreferrer")),i(p,n)},_=()=>F({to:"/test/",class:"Logo"},[S({viewBox:"0 0 512 444"},[T({d:"M512 444L256 0 0 444z",fill:"#663695"}),l({cx:"256",cy:"294",r:"130",fill:"#fff"}),l({cx:"256",cy:"281",r:"40",fill:"#663695"}),T({d:"M256 350v44m24-44l1 13c1 27 29 27 29-7m-160-72s46-47 106-47c59 0 106 47 106 47s-47 43-106 43c-60 0-106-43-106-43zm65-75a134 134 0 0189 2",class:"stroke"}),T({d:"M256 81v53m184 270l-43-29M72 404l43-29",class:"stroke white"})])]),I=(s={})=>{let{collapse:o=!0,menu:r,hash:n}=s,{class:i="",url:a}=s;return i.includes("Menu")||(i=`Menu ${i}`.trim()),n&&!a.endsWith(n)&&(a+=`#${n}`),k({className:i},R(r.map(s=>L(t(e({},s),{url:a,collapse:o})))))},L=t=>{let{collapse:o,items:r=[],text:n,url:i}=t,a=s(t,["collapse","items","text","url"]),l={class:{}},{to:c}=a;c===i&&(l.class.active=!0);let u=[],p=!o||i.includes(c);return p&&r.length&&(u=R(r.map(t=>L(e({url:i,collapse:o},t))))),v(l,[c?F(a,n):j(a,n),u])},$=({nospy:e={},cookies:t=[]})=>{let{show:s,title:o="Privacy Notice",content:r="This app neither saves, collects, nor shares any data about you.",buttonText:n="Awesome!"}=e;return s?u({class:"NoSpy"},[u({class:"Background",onclick:U.nospy.toggle}),u({class:"Container"},[o&&h(o),r&&E(r),x({onclick:U.nospy.toggle,value:n,type:"button"})])]):u({class:"NoSpy"},S({class:"icon",onclick:U.nospy.toggle,width:"25",height:"25",viewBox:"0 0 512 512"},[d([T({d:`
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
`}),l({cx:"192",cy:"128",r:"32"}),l({cx:"128",cy:"256",r:"32"}),l({cx:"288",cy:"384",r:"32"}),l({cx:"272",cy:"272",r:"16"}),l({cx:"400",cy:"336",r:"16"}),l({cx:"176",cy:"368",r:"16"})])]))},W=({page:e,state:t},s)=>{let o={id:"Magic",class:t.pageClass};return w(o,u({class:{Wrapper:!0}},[A(t),u({class:"Page",id:"page"},e(t)),N(t),s]))},q=(t,s)=>{"string"==typeof t?t={content:t}:s?t=e({content:s},t):Array.isArray(t)&&(t={content:t.join("")});let{content:o,lines:r=!0}=t;return u({class:{Pre:!0,lines:r&&"false"!==r}},[u({class:"menu"},[a({onclick:[U.pre.clip,e=>({e,content:o})]},"copy")]),C(o.trim().split("\n").map(q.Line))])};q.Comment=e=>j({class:"comment"},e),q.Line=e=>c({class:"line"},q.Words(e)),q.Word=e=>{if(!e)return"";let t=e.includes("://"),s=e.startsWith("mailto:")||e.includes("@")&&e.includes(".");if(t||s)return F({to:e,text:e});let o="";return("state"===e?o="state":"actions"===e?o="actions":"effects"===e?o="effects":"subscriptions"===e?o="subscriptions":z.pre.keywords.includes(e)?o="keyword":z.pre.builtins.includes(e)?o="builtin":z.pre.booleans.includes(e)&&(o="boolean"),o)?j({class:o},e):e},q.Words=e=>{let[t,...s]=e.split(z.pre.commentRegex),o=!t.endsWith(":")&&s.length;if(o)return[q.Words(t),q.Comment(s.join("").split(z.pre.wordRegex).map(q.Word))];let r=[],n=e;if(e.replace(z.pre.stringRegex,e=>{if(n){let[t,s]=n.split(e);t&&r.push(t.split(z.pre.wordRegex).map(q.Word).filter(e=>e)),n=s}r.push(j({class:"string"},e))}),n!==e)return n&&r.push(n.split(z.pre.wordRegex).map(q.Word).filter(e=>e)),r;let i=e.split(z.pre.wordRegex).filter(e=>e);return i.map(q.Word)};let z={pre:{booleans:["true","false"],builtins:["Array","Object","String","Number","RegExp","Null","Symbol","Set","WeakSet","Map","WeakMap","setInterval","setTimeout","Promise","JSON","Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Uint16Array","Int32Array","Uint32Array","Float32Array","Float64Array"],commentRegex:/(\/\/)/gim,keywords:["let","this","long","package","float","goto","private","class","if","short","while","protected","with","debugger","case","continue","volatile","interface","instanceof","super","synchronized","throw","extends","final","export","throws","try","import","double","enum","boolean","abstract","function","implements","typeof","transient","break","default","do","static","void","int","new","async","native","switch","else","delete","null","public","var","await","byte","finally","catch","in","return","for","get","const","char","module","exports","require","npm","install","=>"],stringRegex:/("|')(.*?)\1/gim,wordRegex:/( )/gim},preventDefault:e=>(e.preventDefault(),e)},U={changeTheme:s=>t(e({},s),{pageClass:t(e({},s.pageClass),{light:"dark"===s.theme}),theme:"dark"===s.theme?"light":"dark"}),go:(s,o)=>{let r=o.currentTarget.href.replace(window.location.origin,""),[n,i=""]=r.split("#");if(n===s.url&&i===s.hash)return i&&(window.location.hash=i),s;let a=s.pages&&s.pages[n]&&s.pages[n].title;a&&(document.title=s.title=a),n!==s.url?i||window.scrollTo({top:0}):window.location.hash=i;let{scrollY:l}=window;return window.history.pushState({url:n,hash:i,scrollY:l},s.title,r),t(e({},s),{url:n,hash:i,prev:s.url})},nospy:{toggle:t=>(t.nospy.show=!t.nospy.show,e({},t))},pop:(s,o)=>{let{pathname:r,hash:n}=window.location;n=n.substring(1);let i=0;return o.state&&(r=o.state.url,n=o.state.hash,i=o.state.scrollY||0),n?window.location.hash=n:window.scroll({top:i}),t(e({},s),{url:r,hash:n})},pre:{clip:(e,{content:t})=>{if("undefined"!=typeof document&&"function"==typeof document.execCommand){let e=document.createElement("textarea");e.id="copy",e.innerHTML=t,document.body.appendChild(e);let s=document.getElementById("copy");s.select(),document.execCommand("copy"),document.body.removeChild(s)}return e}}},V={listenPopState:(e,t)=>{let s=s=>e(t,s);return addEventListener("popstate",s),()=>removeEventListener("popstate",s)}},B={"/test/":e=>[f({id:"magictest"},"@magic/test"),E(["simple tests with lots of utility."," ecmascript modules only."," runs ecmascript module syntax tests without transpilation."," unbelievably fast."]),P("@magic/test"),m({id:"getting-started"},"getting started"),E("be in a nodejs project."),h({id:"getting-started-install"},"install"),q({lines:"false"},"npm i --save-dev --save-exact @magic/test"),h("Create a test"),q(`
// create test/functionName.js
import yourTest from '../path/to/your/file.js'

export default [
  { fn: () => true, expect: true, info: 'true is true' },
  // note that the yourTest function will be called automagically
  { fn: yourTest, expect: true, info: 'hope this will work ;)'}
]
`),h({id:"getting-started-npm-scripts"},"npm scripts"),E("edit package.json"),q(`
{
  "scripts": {
    "test": "t -p", // quick test, only failing tests log
    "coverage": "t", // get full test output and coverage reports
  }
}
`),E("repeated for easy copy pasting (without comments and trailing commas)"),q(`
  "scripts": {
    "test": "t -p",
    "coverage": "t"
  }
`),E("repeated for easy copy pasting (without comments and trailing commas)"),q(`
  "scripts": {
    "test": "t -p",
    "coverage": "t"
  }
`),h({id:"getting-started-quick-tests"},"quick tests"),E("without coverage"),q(`
  // run the tests:
npm test

// example output:
// (failing tests will print, passing tests are silent)

// ### Testing package: @magic/test
// Ran 2 tests. Passed 2/2 100%
`),h({id:"getting-started-coverage"},"coverage"),E(["@magic/test will automagically generate coverage reports"," if it is not called with the -p flag."]),E("Example output:"),q(`
### Testing package: @magic/test
Passed 2/2 100%
`),E("Faster output from a bigger project:"),q(`
### Testing package: @artificialmuseum/engine
Ran 90307 tests in 274.5ms. Passed 90307/90307 100%
Ran 90307 tests in 265.5ms. Passed 90307/90307 100%
Ran 90307 tests in 268.1ms. Passed 90307/90307 100%
`),h({id:"test-suites"},"data/fs driven test suite creation:"),E("Expectations for optimal test messages:"),R([v("src and test directories have the same structure and files"),v("tests one src file per test file"),v("tests one function per suite"),v("tests one feature per test")]),g({id:"expectations-for-optimal-test-messages"},"expectations for optimal test messages:"),R([v("src and test directories have the same directory structure and filenames"),v("tests one src file per test file"),v("tests one function per test suite"),v("tests one feature per test unit")]),g({id:"test-suites-fs"},"Filesystem based naming"),E("the following directory structure:"),q(`./test/
  ./suite1.js
  ./suite2.js`),E("yields the same result as exporting the following from ./test/index.js"),g({id:"tests-suites-data"},"Data driven naming"),q(`import suite1 from './suite1'
import suite2 from './suite2'

export default {
  suite1,
  suite2,
}`),h({id:"tests-file-mappings"},"Important - File mappings"),E(["if test/index.js exists, no other files will be loaded."," if test/index.js exists, no other files from that directory will be loaded,"," if test/lib/index.js, no other files from that subdirectory will be loaded."," instead the exports of those index.js will be expected to be tests"]),h({id:"tests"},"single test"),E("literal value, function or promise"),q(`
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
`),g({id:"tests-types"},"testing types"),E(["types can be compared using ",F({to:"https://github.com/magic/types",text:"@magic/types"})]),E(["@magic/types is a richly featured and thoroughly tested type library without dependencies."," it is exported from this library for convenience."]),q(`
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
`),g({id:"caveat"},"caveat:"),E(["if you want to test if a function is a function, you need to wrap the function in a function."," this is because functions passed to fn get executed automatically."]),q(`
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
`),q(`
// will not work as expected and instead call fnToTest
export default {
  fn: fnToTest,
  expect: is.function,
  info: 'function is a function',
}
`),g({id:"tests-typescript"},"TypeScript support"),E(["@magic/test supports TypeScript test files."," You can write tests in .ts files and they will be executed directly without transpilation."]),q(`
// test/mytest.ts
export default { fn: () => true, expect: true, info: 'TypeScript test works!' }
`),E("This requires Node.js 22.18.0 or later."),h({id:"tests-multiple"},"multiple tests"),E("multiple tests can be created by exporting an array or object of single test objects."),q(`
export default [
  { fn: () => true, expect: true, info: 'expect true to be true' },
  { fn: () => false, expect: false, info: 'expect false to be false' },
]`),E("or exporting an object with named test arrays"),q(`
export default {
  multipleTests: [
    { fn: () => true, expect: true, info: 'expect true to be true' },
    { fn: () => false, expect: false, info: 'expect false to be false' },
  ]
}`),h({id:"tests-promises"},"promises"),q(`
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
`),h({id:"tests-cb"},"callback functions"),q(`
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
`),h({id:"tests-runs"},"running tests multiple times"),E("Use the runs property to run a test multiple times:"),q(`
let counter = 0
const increment = () => counter++

export default [
  {
    fn: increment,
    expect: 1,
    runs: 5,
    info: 'runs the test 5 times and expects final value to be 5',
  },
]
`),h({id:"tests-hooks"},"hooks"),E("run functions before and/or after individual test"),q(`
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
`),h({id:"tests-suite-hooks"},"suite hooks"),E("run functions before and/or after a suite of tests"),q(`
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
`),E("File-based Hooks:"),E(["You can also create test/beforeAll.js and test/afterAll.js files"," that run before/after all tests in a suite."]),E("**Note:** These files must be placed at the **root** `test/` directory (not in subdirectories)."),q(`
// test/beforeAll.js
export default () => {
  global.setup = true
  // optionally return a cleanup function
  return () => {
    global.setup = false
  }
}
`),q(`
// test/afterAll.js
export default () => {
  // cleanup after all tests
}
`),h({id:"tests-each-hooks"},"beforeEach and afterEach hooks"),E("Define beforeEach and afterEach hooks in your test objects that run before/after each individual test:"),q(`
const beforeEach = () => {
  // Runs before each test in this suite
  global.testState = { initialized: true }
}

const afterEach = (testResult) => {
  // Runs after each test, receives the test result
  console.log('Test completed:', testResult?.pass)
}

export default {
  beforeEach,
  afterEach,
  tests: [
    { fn: () => global.testState.initialized, expect: true },
    { fn: () => true, expect: true },
  ],
}
`),h({id:"tests-magic-modules"},"magic modules"),E(["@magic-modules assume all html tags to be globally defined."," to create those globals for your test and check if a @magic-module returns the correct markup,"," just use one of those tags in your tests."]),q(`
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
`),m({id:"lib"},"Utility Belt"),E(["@magic/test exports some utility functions"," that make working with complex test workflows simpler."]),g({id:"lib-deep"},"deep"),E(["Exported from ",F({to:"https://github.com/magic/deep",text:"@magic/deep"}),", deep equality and comparison utilities."]),q(`
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
`),E("Available functions:"),R([v("deep.equal(a, b) - deep equality check"),v("deep.different(a, b) - deep difference check"),v("deep.contains(container, item) - deep inclusion check"),v("deep.changes(a, b) - get differences between objects")]),g({id:"lib-fs"},"fs"),E(["Exported from ",F({to:"https://github.com/magic/fs",text:"@magic/fs"}),", file system utilities."]),q(`
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
`),E("Common methods:"),R([v("fs.readFile(path, encoding) - read file content"),v("fs.writeFile(path, data) - write file content"),v("fs.exists(path) - check if file exists"),v("fs.mkdir(path, options) - create directory"),v("fs.rmdir(path) - remove directory"),v("fs.stat(path) - get file stats"),v("fs.readdir(path) - read directory contents"),v("Plus async versions in fs.promises")]),g({id:"lib-curry"},"curry"),E(["Currying can be used to split the arguments of a function into multiple nested functions."," This helps if you have a function with complicated arguments that you just want to quickly shim."]),q(`
import { curry } from '@magic/test'

const compare = (a, b) => a === b
const curried = curry(compare)
const shimmed = curried('shimmed_value')

export default {
  fn: shimmed('shimmed_value'),
  expect: true,
  info: 'expect will be called with a and b and a will equal b',
}
`),g({id:"lib-log"},"log"),E("Logging utility for test output. Colors supported automatically."),q(`
import { log } from '@magic/test'

log.debug('Debug info')
log.info('Something happened')
log.warn('Heads up')
log.error('Something went wrong')
log.critical('Game over')
`),E("Supports template strings and arrays:"),q(`
log.info('Testing', library, 'at version', version)
`),g({id:"lib-vals"},"vals"),E(["Exports JavaScript type constants for testing against any value."," Useful for fuzzing and property-based testing."]),q(`
import { vals, is } from '@magic/test'

export default [
  { fn: () => 'test', expect: is.string, info: 'test if value is a string' },
  { fn: () => vals.true, expect: true, info: 'boolean true value' },
  { fn: () => vals.email, expect: is.email, info: 'valid email format' },
  { fn: () => vals.error, expect: is.error, info: 'error instance' },
]
`),E("Available Constants:"),R([v("Primitives: true, false, number, num, float, int, string, str"),v("Empty values: nil, emptystr, emptyobject, emptyarray, undef"),v("Collections: array, object, obj"),v("Time: date, time"),v("Errors: error, err"),v("Colors: rgb, rgba, hex3, hex6, hexa4, hexa8"),v("Other: func, truthy, falsy, email, regexp")]),g({id:"lib-env"},"env"),E("Environment detection utilities for conditional test behavior."),E("Available utilities:"),R([v("isNodeProd - checks if NODE_ENV is set to production"),v("isNodeDev - checks if NODE_ENV is set to development"),v("isProd - checks if -p flag is passed to the CLI"),v("isVerbose - checks if -l flag is passed to the CLI"),v("getErrorLength - returns error length limit from MAGIC_TEST_ERROR_LENGTH env var (0 = unlimited)")]),q(`
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
`),g({id:"lib-env-constants"},"Environment Constants"),E("These boolean constants reflect the current NODE_ENV:"),q(`
import { isProd, isTest, isDev } from '@magic/test'

export default [
  { fn: isProd, expect: process.env.NODE_ENV === 'production' },
  { fn: isTest, expect: process.env.NODE_ENV === 'test' },
  { fn: isDev, expect: process.env.NODE_ENV === 'development' },
]
`),h({id:"lib-promises"},"promises"),E(["Helper function to wrap nodejs callback functions and promises with ease."," Handle the try/catch steps internally and return a resolved or rejected promise."]),q(`
import { promise, is } from '@magic/test'

export default [
  {
    fn: promise(cb => setTimeOut(() => cb(null, true), 200)),
    expect: true,
    info: 'handle promises in a nice way',
  },
  {
    fn: promise(cb => setTimeOut(() => cb(new Error('error'), 200)),
    expect: is.error,
    info: 'handle promise errors in a nice way',
  },
]
`),g({id:"lib-http"},"http"),E("HTTP utility for making requests in tests. Supports both HTTP and HTTPS."),q(`
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
`),E("Error Handling:"),q(`
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
`),E("Note: HTTP module automatically handles protocol detection, JSON parsing, and rejectUnauthorized: false"),g({id:"lib-trycatch"},"trycatch"),E("allows to test functions without bubbling the errors up into the runtime"),q(`
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
  ]
`),g({id:"lib-error"},"error"),E(["exports ",F({to:"https://github.com/magic/error",text:"@magic/error"})," which returns errors with optional names."]),q(`
import { error } from '@magic/test'

export default [
  {
    fn: tryCatch(error('Message', 'E_NAME')),
    expect: e => e.name === 'E_NAME' && e.message === 'Message',
    info: 'Errors have messages and (optional) names.',
  },
]
`),g({id:"lib-mock"},"mock"),E("Mock and spy utilities for function testing."),q(`
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
`),E("mock.fn properties:"),R([v("calls - Array of all call arguments"),v("returns - Array of all return values"),v("errors - Array of all thrown errors (null for non-throwing calls)"),v("callCount - Number of times called")]),E("mock.fn methods:"),R([v("mockReturnValue(value) - Set return value (chainable)"),v("mockThrow(error) - Set error to throw (chainable)"),v("getCalls() - Get all call arguments"),v("getReturns() - Get all return values"),v("getErrors() - Get all thrown errors")]),g({id:"lib-version"},"version"),E("The version plugin checks your code according to a spec defined by you. This is designed to warn you on changes to your exports."),E(["Internally, the version function calls ",F({to:"https://github.com/magic/types",text:"@magic/types"})," and all functions exported from it are valid type strings in version specs."]),q(`
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
  `),E("The spec supports testing parent objects without checking their child properties by using `false` as the second element:"),g({id:"lib-dom"},"DOM Environment"),E("@magic/test automatically initializes a DOM environment when imported, making browser APIs available in Node.js."),E("Available globals:"),R([v("Core: document, window, self, navigator, location, history"),v("DOM types: Node, Element, HTMLElement, SVGElement, Document, DocumentFragment"),v("Events: Event, CustomEvent, MouseEvent, KeyboardEvent, InputEvent, TouchEvent, PointerEvent"),v("Forms: FormData, File, FileList, Blob"),v("Networking: URL, URLSearchParams, XMLHttpRequest, fetch, WebSocket"),v("Storage: Storage, sessionStorage, localStorage"),v("Observers: MutationObserver, IntersectionObserver, ResizeObserver"),v("Timers: setTimeout, setInterval, requestAnimationFrame")]),E("DOM Utilities:"),q(`
import { initDOM, getDocument, getWindow } from '@magic/test'

// Get the document and window instances
const doc = getDocument()
const win = getWindow()

// Manually re-initialize if needed
initDOM()
`),E("Canvas/Image Polyfills:"),R([v("new Image() - Parses PNG data URLs to extract dimensions"),v('canvas.getContext("2d") - Returns node-canvas context'),v("canvas.toDataURL() - Serializes canvas to data URL")]),g({id:"lib-svelte"},"svelte"),E(["@magic/test includes built-in support for testing Svelte 5 components."," It compiles Svelte components, mounts them in a DOM environment,"," and provides utilities for interacting with and asserting on component behavior."]),q(`
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
`),E("Exported Functions:"),R([v("mount(filePath, options) - Mounts a Svelte component"),v("html(target) - Returns innerHTML"),v("text(target) - Returns textContent"),v("component(instance) - Returns component instance"),v("props(target) - Returns attribute name/value pairs"),v("click(target, selector?) - Clicks an element"),v("dblClick(target) - Double clicks"),v("contextMenu(target) - Right click"),v("mouseDown(target) - Mouse down"),v("mouseUp(target) - Mouse up"),v("mouseMove(target) - Mouse move"),v("mouseEnter/Leave/Over/Out - Mouse events"),v("keyDown/Press/Up - Keyboard events"),v("type(target, text) - Type text into input"),v("input(target, value) - Input value"),v("change(target, value) - Change event"),v("blur/focus - Focus events"),v("submit(target) - Submit form"),v("pointer/touch events - Pointer and touch"),v("copy/cut/paste - Clipboard"),v("drag events - Drag and drop"),v("resize(target, w, h) - Resize"),v("scroll(target, x, y) - Scroll"),v("animation/transition events - CSS events"),v("play/pause - Media"),v("trigger(target, eventType, options) - Custom event"),v("checked(target) - Checkbox state")]),E("Test Properties:"),R([v("component - Path to the .svelte file"),v("props - Props to pass to the component"),v("fn - Test function receiving { target, component, unmount }")]),E("Example: Accessing Component State"),q(`
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
`),E("Automatic Test Exports"),E(["When testing Svelte 5 components, @magic/test automatically exports ","$state and $derived variables, making them accessible in tests without requiring manual exports."]),E("**Note:** This automatic export feature is specific to **Svelte 5** only. Svelte 4 components do not have this capability."),q(`
<!-- Component.svelte -->
<script>
  let count = $state(0)
  let doubled = $derived(count * 2)
  <!-- No export needed! -->
</script>

<button class="inc">+</button>
<span>{doubled}</span>
`),E("Test - works automatically!"),q(`
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
`),E("This works automatically for all $state and $derived runes. No configuration needed!"),E("Example: Testing Error Handling"),q(`
import { mount, tryCatch } from '@magic/test'

const component = './src/lib/svelte/components/MyComponent.svelte'

export default [
  {
    fn: tryCatch(mount, component, { props: null }),
    expect: t => t.message === 'Props must be an object, got object',
    info: 'throws when props is null',
  },
]
`),E("SvelteKit Mocks:"),E("Mocks SvelteKit $app modules:"),q(`
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
`),g({id:"lib-compile-svelte"},"compileSvelte"),E("Compile Svelte component source to a module for testing:"),q(`
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
`),m({id:"native-runner"},"Native Node.js Test Runner"),E(["@magic/test includes a native Node.js test runner that uses the built-in --test flag."," This provides better integration with Node.js ecosystem tools and IDEs."]),h({id:"native-runner-usage"},"Usage"),q(`
# Run tests using Node.js native test runner
npm run test:native
`),E("Add to your package.json:"),q(`
{
  "scripts": {
    "test": "t -p",
    "test:native": "node --test src/bin/node-test-runner.js"
  }
}
`),h({id:"native-runner-external"},"Using in External Libraries"),E("To use the native test runner in your own library that depends on @magic/test:"),E("1. Copy the runner file to your project:"),q(`
# Copy node-test-runner.js to your project
cp node_modules/@magic/test/src/bin/node-test-runner.js src/
`),E("2. Update the paths in the runner if needed (it uses relative paths to find the test directory)"),E("3. Add the script to your package.json:"),q(`
{
  "scripts": {
    "test": "t -p",
    "test:native": "node --test src/bin/node-test-runner.js"
  }
}
`),h({id:"native-runner-features"},"Features"),E("The native runner supports all the same features as the custom runner:"),R([v("Test file discovery (.js, .mjs, .ts)"),v("File-based hooks (beforeAll.js, afterAll.js)"),v("Svelte component testing"),v("All assertion types"),v("Global magic modules")]),h({id:"native-runner-differences"},"Differences from Custom Runner"),E("| Feature | Custom Runner | Native Runner |"),E("|---------|--------------|---------------|"),E("| Test discovery | Custom glob patterns | Node.js --test patterns |"),E("| Output format | Colored CLI output | Node.js test format |"),E("| Hooks | Full support | Full support |"),E("| Coverage | Via c8 | Not available |"),h({id:"test-isolation"},"Test Isolation"),E(["@magic/test supports test isolation to prevent tests from affecting each other."," Tests in the same suite can share state, but you can isolate them:"]),q(`
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
`),E("Global Isolation Mode:"),E("By default, tests in the same file share global state. To enable strict isolation where each test gets a fresh environment:"),q(`
// This runs each test in isolation with fresh globals
export const __isolate = true

export default [
  { fn: () => global.test = 1, expect: 1 },
  { fn: () => global.test === undefined, expect: true, info: 'fresh global state' },
]
   `),E("Programmatic Detection:"),E("You can programmatically check if a suite requires isolation using the `suiteNeedsIsolation` utility:"),q(`
import { suiteNeedsIsolation } from '@magic/test'

const needsIsolation = suiteNeedsIsolation(tests)
`),E("This is useful for custom runners or when building test tooling."),m({id:"usage"},"usage"),h({id:"usage-js"},"js"),q(`
// test/index.js
import { run } from '@magic/test'

const tests = {
  lib: [
    { fn: () => true, expect: true, info: 'Expect true to be true' }
  ],
}

run(tests)
`),m({id:"usage-cli"},"cli"),h({id:"packagejson-recommended"},"package.json (recommended)"),E("add the magic/test bin scripts to package.json"),q(`
{
  "scripts": {
    "test": "t -p",
    "coverage": "t",
  },
  "devDependencies": {
    "@magic/test": "github:magic/test"
  }
}`),E("then use the npm run scripts"),q(`
npm test
npm run coverage
`),h({id:"usage-global"},"Globally (not recommended):"),E(["you can install this library globally,"," but the recommendation is to add the dependency and scripts to the package.json file."]),E(["this both explains to everyone that your app has these dependencies"," as well as keeping your bash free of clutter"]),q(`
npm i -g @magic/test

// run tests in production mode
t -p

// run tests and get coverage in verbose mode
t
`),g({id:"cli-flags"},"CLI Flags"),E("Available command-line flags:"),R([v("-p, --production, --prod - Run tests without coverage (faster)"),v("-l, --verbose, --loud - Show detailed output including passing tests"),v("-i, --include - Files to include in coverage"),v("-e, --exclude - Files to exclude from coverage"),v("--shards, --shard-count - Total number of shards to split tests across"),v("--shard-id - Shard ID (0-indexed) to run"),v("--help - Show help text")]),E("Note: `--shards` and `--shard-id` must be used together. `--shard-id` is 0-indexed (0 to N-1)."),E("Common Usage:"),q(`
# Quick test run (no coverage, fails show errors)
npm test        # or: t -p

# Full test with coverage report
npm run coverage  # or: t

# Verbose output (shows passing tests)
t -l

# Test with coverage for specific files
t -i "src/**/*.js"

# Use glob patterns for include/exclude
t -i "src/**/*.js" -e "**/*.spec.js"

# Run tests with sharding (for parallel CI)
t --shards 4 --shard-id 0
    `),h({id:"sharding"},"Sharding Tests"),E(["Run tests in parallel across multiple processes to speed up large test suites."]),q(`
# Run 4 shards, this is shard 0 (of 0-3)
t --shards 4 --shard-id 0

# Run shard 1
t --shards 4 --shard-id 1

# Combine with other flags
t -p --shards 4 --shard-id 2
`),E(["Tests are distributed deterministically using a hash of the test file path,"," ensuring each test always runs in the same shard."]),E("Add to your package.json for CI/CD:"),q(`
{
  "scripts": {
    "test": "t -p",
    "test:shard:0": "t -p --shards 4 --shard-id 0",
    "test:shard:1": "t -p --shards 4 --shard-id 1",
    "test:shard:2": "t -p --shards 4 --shard-id 2",
    "test:shard:3": "t -p --shards 4 --shard-id 3"
  }
}
`),E("Or use a single command to run all shards in parallel:"),q(`
# Run all 4 shards in parallel and wait for all to complete
npm run test:shard:0 & npm run test:shard:1 & npm run test:shard:2 & npm run test:shard:3 & wait
`),E(["This library tests itself, have a look at ",F({to:"https://github.com/magic/test/tree/master/test",text:"the tests"})," Checkout ",F({to:"https://github.com/magic/types/tree/master/test",text:"@magic/types"})," and the other magic libraries for more test examples."]),h({id:"usage-exit-codes"},"Exit Codes"),E("@magic/test returns specific exit codes to indicate test results:"),E("| Exit Code | Meaning |"),E("| --------- | ------- |"),E("| 0 | All tests passed |"),E("| 1 | One or more tests failed |"),q(`
# Run tests and check exit code
npm test
echo "Exit code: $?"  # 0 = success, 1 = failure
`),h({id:"usage-performance-tips"},"Performance Tips"),E("Follow these tips to get the most out of @magic/test:"),E("Use the -p flag for development:"),q(`
# Fast mode - no coverage, only shows failures
npm test
# or
t -p
`),E("Shard large test suites:"),q(`
# Split tests across multiple processes
t --shards 4 --shard-id 0
`),E("Run tests in parallel with native runner:"),q(`
# Native runner uses Node.js built-in test runner
npm run test:native
`),E("Minimize async overhead:"),q(`
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
`),E("Use local state instead of globals:"),q(`
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
`),E("Batch related tests:"),q(`
# Faster: single suite with multiple tests
export default [
  { fn: () => add(1, 2), expect: 3 },
  { fn: () => add(0, 0), expect: 0 },
  { fn: () => add(-1, 1), expect: 0 },
]
`),h({id:"usage-verbose-output"},"Verbose Output"),E("The -l (or --verbose, --loud) flag enables detailed output:"),q(`
# Shows all tests including passing ones
t -l
`),E("What verbose mode shows:"),R([v("All test results (not just failures)"),v("Individual test execution time"),v("Full test names with suite hierarchy"),v("Detailed error messages with stack traces")]),E("Default mode (without -l):"),R([v("Only shows failing tests"),v("Shows summary only for passing suites"),v("Faster output for large test suites")]),E("Example output without -l:"),q(`
### Testing package: my-lib
/addition.js => Pass: 3/3 100%
/multiplication.js => Pass: 4/4 100%
Ran 7 tests in 12ms. Passed 7/7 100%
`),E("Example output with -l:"),q(`
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
`),h({id:"usage-common-pitfalls"},"Common Pitfalls"),E("Avoid these common mistakes when writing tests:"),E("1. Forgetting to return in async tests:"),q(`
# Wrong: promise resolves before test checks result
export default {
  fn: async () => {
    const result = await someAsyncFunction()
    # missing return!
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
`),E("2. Not wrapping callback functions:"),q(`
# Wrong: function gets called immediately
export default {
  fn: doSomething(),  # executes immediately!
  expect: true,
}

# Correct: wrap in function to defer execution
export default {
  fn: () => doSomething(),
  expect: true,
}
`),E("3. Mutating shared state between tests:"),q(`
# Wrong: counter persists between tests
let counter = 0
export default [
  { fn: () => ++counter, expect: 1 },
  { fn: () => ++counter, expect: 2 }, # fails! counter is now 1
]

# Correct: use local state or reset in beforeEach
let counter = 0
const beforeEach = () => { counter = 0 }
export default {
  beforeEach,
  tests: [
    { fn: () => ++counter, expect: 1 },
    { fn: () => ++counter, expect: 1 }, # passes - reset before each
  ],
}
`),E("4. Using the wrong equality check:"),q(`
# Wrong: checks reference equality
export default {
  fn: () => [1, 2, 3],
  expect: [1, 2, 3], # fails! different arrays
}

# Correct: use @magic/types for deep comparison
import { is } from '@magic/test'
export default {
  fn: () => [1, 2, 3],
  expect: is.deep.equal([1, 2, 3]),
}
`),E("5. Not awaiting async operations:"),q(`
# Wrong: test finishes before promise resolves
export default {
  fn: () => {
    setTimeout(() => {
      # This never gets checked!
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
`),E("6. Incorrect hook usage:"),q(`
# Wrong: before/after hooks on individual tests, not suites
export default [
  {
    fn: () => true,
    beforeAll: () => {}, # wrong! beforeAll is for suites
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
   `),h({id:"error-codes"},"Error Codes"),E(["@magic/test uses error codes to help with debugging and programmatic error handling."," You can import these constants from `@magic/test`:"]),q(`
import { ERRORS, errorify } from '@magic/test'
`),E("Available error codes:"),R([v("ERRORS.E_EMPTY_SUITE - Test suite is not exporting any tests"),v("ERRORS.E_RUN_SUITE_UNKNOWN - Unknown error occurred while running a suite"),v("ERRORS.E_TEST_NO_FN - Test object is missing the fn property"),v("ERRORS.E_TEST_EXPECT - Test expectation failed"),v("ERRORS.E_TEST_BEFORE - Before hook failed"),v("ERRORS.E_TEST_AFTER - After hook failed"),v("ERRORS.E_TEST_FN - Test function threw an error"),v("ERRORS.E_NO_TESTS - No test suites found"),v("ERRORS.E_IMPORT - Failed to import a test file"),v("ERRORS.E_MAGIC_TEST - General test execution error")]),E("Example usage:"),q(`
try {
  // run tests
} catch (e) {
  if (e.code === ERRORS.E_TEST_NO_FN) {
    console.error('Test is missing fn property:', e.message)
  }
}
`)],"/test/404/":()=>u("404 - not found.")};r({init:t(e({},{description:["simple tests with lots of utility. ecmascript modules only.","runs ecmascript module tests without transpilation.","unbelievably fast."],logotext:"@magic/test",menu:[{items:[{text:"install",to:"/test/#getting-started-install"},{text:"npm scripts",to:"/test/#getting-started-npm-scripts"}],text:"getting started",to:"/test/#getting-started"},{text:"testing types",to:"/test/#tests-types"},{text:"caveat",to:"/test/#caveat"},{items:[{text:"testing types",to:"/test/#tests-types"},{text:"typescript",to:"/test/#tests-typescript"},{text:"multiple tests in one file",to:"/test/#tests-multiple"},{text:"running tests multiple times",to:"/test/#tests-runs"},{text:"promises",to:"/test/#tests-promises"},{text:"callback functions",to:"/test/#tests-cb"},{text:"run function before / after individual tests",to:"/test/#tests-hooks"},{text:"data based test suites",to:"/test/#tests-suites-data"},{text:"important file mappings",to:"/test/#tests-file-mappings"},{text:"beforeEach and afterEach",to:"/test/#tests-each-hooks"},{text:"test @magic-modules",to:"/test/#tests-magic-modules"}],text:"writing tests",to:"/test/#tests"},{items:[{text:"deep",to:"/test/#lib-deep"},{text:"fs",to:"/test/#lib-fs"},{text:"curry",to:"/test/#lib-curry"},{text:"log",to:"/test/#lib-log"},{text:"vals",to:"/test/#lib-vals"},{text:"env",to:"/test/#lib-env"},{text:"Environment Constants",to:"/test/#lib-env-constants"},{text:"promises",to:"/test/#lib-promises"},{text:"http",to:"/test/#lib-http"},{text:"tryCatch",to:"/test/#lib-trycatch"},{text:"error",to:"/test/#lib-error"},{text:"version",to:"/test/#lib-version"},{text:"mock",to:"/test/#lib-mock"},{text:"DOM Environment",to:"/test/#lib-dom"},{text:"svelte",to:"/test/#lib-svelte"},{text:"compileSvelte",to:"/test/#lib-compile-svelte"}],text:"utility functions",to:"/test/#lib"},{items:[{text:"Usage",to:"/test/#native-runner-usage"},{text:"Using in External Libraries",to:"/test/#native-runner-external"},{text:"Features",to:"/test/#native-runner-features"},{text:"Differences from Custom Runner",to:"/test/#native-runner-differences"}],text:"Native Node.js Test Runner",to:"/test/#native-runner"},{text:"Test Isolation",to:"/test/#test-isolation"},{items:[{text:"js api",to:"/test/#usage-js"},{text:"cli",to:"/test/#usage-cli"},{text:"npm i -g",to:"/test/#usage-global"},{text:"Exit Codes",to:"/test/#usage-exit-codes"},{text:"Performance Tips",to:"/test/#usage-performance-tips"},{text:"Verbose Output",to:"/test/#usage-verbose-output"},{text:"Common Pitfalls",to:"/test/#usage-common-pitfalls"}],text:"usage",to:"/test/#usage"}],nospy:{show:!1},pageClass:{},pages:{"/test/404/":{description:"404 - not found.",title:"404 - not found"}},root:"/test/",theme:"dark",title:"@magic/test",url:"/test/"}),{url:window.location.pathname,hash:window.location.hash.substr(1)}),subscriptions:e=>[[V.listenPopState,U.pop]],view:e=>{let t=B[e.url]?e.url:"/404/",s=B[t],o=e.pages&&e.pages[t];return o&&Object.keys(o).forEach(t=>{e[t]=o[t]}),e.url=t,W({page:s,state:e},[D(e),$(e)])},node:document.getElementById("Magic")})})();