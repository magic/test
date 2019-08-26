"use strict";function b(a){return n(a)||c(a)||l()}function c(a){if(Symbol.iterator in Object(a)||"[object Arguments]"===Object.prototype.toString.call(a))return Array.from(a)}function d(a,b){var c=Object.keys(a);if(Object.getOwnPropertySymbols){var d=Object.getOwnPropertySymbols(a);b&&(d=d.filter(function(b){return Object.getOwnPropertyDescriptor(a,b).enumerable})),c.push.apply(c,d)}return c}function f(a){for(var b,c=1;c<arguments.length;c++)b=null==arguments[c]?{}:arguments[c],c%2?d(b,!0).forEach(function(c){g(a,c,b[c])}):Object.getOwnPropertyDescriptors?Object.defineProperties(a,Object.getOwnPropertyDescriptors(b)):d(b).forEach(function(c){Object.defineProperty(a,c,Object.getOwnPropertyDescriptor(b,c))});return a}function g(a,b,c){return b in a?Object.defineProperty(a,b,{value:c,enumerable:!0,configurable:!0,writable:!0}):a[b]=c,a}function i(a,b){if(null==a)return{};var c,d,e=j(a,b);if(Object.getOwnPropertySymbols){var f=Object.getOwnPropertySymbols(a);for(d=0;d<f.length;d++)c=f[d],!(0<=b.indexOf(c))&&Object.prototype.propertyIsEnumerable.call(a,c)&&(e[c]=a[c])}return e}function j(a,b){if(null==a)return{};var c,d,e={},f=Object.keys(a);for(d=0;d<f.length;d++)c=f[d],0<=b.indexOf(c)||(e[c]=a[c]);return e}function k(a,b){return n(a)||m(a,b)||l()}function l(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}function m(a,b){var c=[],d=!0,e=!1,f=void 0;try{for(var g,h=a[Symbol.iterator]();!(d=(g=h.next()).done)&&(c.push(g.value),!(b&&c.length===b));d=!0);}catch(a){e=!0,f=a}finally{try{d||null==h["return"]||h["return"]()}finally{if(e)throw f}}return c}function n(a){if(Array.isArray(a))return a}function o(a){return o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&"function"==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a},o(a)}var q=function(){var a=2,b=3,c={},d=[],e=d.map,f=Array.isArray,g="undefined"==typeof requestAnimationFrame?setTimeout:requestAnimationFrame,i=function(a){var b="";if("string"==typeof a)return a;if(f(a)&&0<a.length)for(var c,d=0;d<a.length;d++)""!==(c=i(a[d]))&&(b+=(b&&" ")+c);else for(var d in a)a[d]&&(b+=(b&&" ")+d);return b},j=function(c,a){var b={};for(var d in c)b[d]=c[d];for(var d in a)b[d]=a[d];return b},k=function(a){return a.reduce(function(a,b){return a.concat(b&&!0!==b?"function"==typeof b[0]?[b]:k(b):0)},d)},l=function(c,a){return f(c)&&f(a)&&c[0]===a[0]&&"function"==typeof c[0]},m=function(c,a){if(c!==a)for(var b in j(c,a)){if(c[b]!==a[b]&&!l(c[b],a[b]))return!0;a[b]=c[b]}},n=function(a,b,c){for(var d,e,f=0,g=[];f<a.length||f<b.length;f++)d=a[f],e=b[f],g.push(e?!d||e[0]!==d[0]||m(e[1],d[1])?[e[0],e[1],e[0](c,e[1]),d&&d[2]()]:d:d&&d[2]());return g},p=function(a,b,c,d,e,f){if("key"===b);else if("style"===b)for(var g in j(c,d))c=null==d||null==d[g]?"":d[g],"-"===g[0]?a[b].setProperty(g,c):a[b][g]=c;else"o"===b[0]&&"n"===b[1]?((a.actions||(a.actions={}))[b=b.slice(2).toLowerCase()]=d)?!c&&a.addEventListener(b,e):a.removeEventListener(b,e):!f&&"list"!==b&&b in a?a[b]=null==d?"":d:null!=d&&!1!==d&&("class"!==b||(d=i(d)))?a.setAttribute(b,d):a.removeAttribute(b)},q=function(a,c,d){var e=a.props,f=a.type===b?document.createTextNode(a.name):(d=d||"svg"===a.name)?document.createElementNS("http://www.w3.org/2000/svg",a.name,{is:e.is}):document.createElement(a.name,{is:e.is});for(var g in e)p(f,g,null,e[g],c,d);for(var h=0,j=a.children.length;h<j;h++)f.appendChild(q(a.children[h]=u(a.children[h]),c,d));return a.node=f},r=function(a){return null==a?null:a.key},s=function(a,c,d,e,f,g){if(d===e);else if(null!=d&&d.type===b&&e.type===b)d.name!==e.name&&(c.nodeValue=e.name);else if(null==d||d.name!==e.name)c=a.insertBefore(q(e=u(e),f,g),c),null!=d&&a.removeChild(d.node);else{var h,k,l,m,n=d.props,o=e.props,t=d.children,v=e.children,w=0,x=0,y=t.length-1,z=v.length-1;for(var A in g=g||"svg"===e.name,j(n,o))("value"===A||"selected"===A||"checked"===A?c[A]:n[A])!==o[A]&&p(c,A,n[A],o[A],f,g);for(;x<=z&&w<=y&&null!=(l=r(t[w]))&&l===r(v[x]);)s(c,t[w].node,t[w],v[x]=u(v[x++],t[w++]),f,g);for(;x<=z&&w<=y&&null!=(l=r(t[y]))&&l===r(v[z]);)s(c,t[y].node,t[y],v[z]=u(v[z--],t[y--]),f,g);if(w>y)for(;x<=z;)c.insertBefore(q(v[x]=u(v[x++]),f,g),(k=t[w])&&k.node);else if(x>z)for(;w<=y;)c.removeChild(t[w++].node);else{for(var A=w,B={},C={};A<=y;A++)null!=(l=t[A].key)&&(B[l]=t[A]);for(;x<=z;){if(l=r(k=t[w]),m=r(v[x]=u(v[x],k)),C[l]||null!=m&&m===r(t[w+1])){null==l&&c.removeChild(k.node),w++;continue}null==m||1===d.type?(null==l&&(s(c,k&&k.node,k,v[x],f,g),x++),w++):(l===m?(s(c,k.node,k,v[x],f,g),C[m]=!0,w++):null==(h=B[m])?s(c,k&&k.node,null,v[x],f,g):(s(c,c.insertBefore(h.node,k&&k.node),h,v[x],f,g),C[m]=!0),x++)}for(;w<=y;)null==r(k=t[w++])&&c.removeChild(k.node);for(var A in B)null==C[A]&&c.removeChild(B[A].node)}}return e.node=c},t=function(c,a){for(var b in c)if(c[b]!==a[b])return!0;for(var b in a)if(c[b]!==a[b])return!0},u=function(b,c){return b.type===a?((!c||t(c.lazy,b.lazy))&&((c=b.lazy.view(b.lazy)).lazy=b.lazy),c):b},v=function(a,b,c,d,e,f){return{name:a,props:b,children:c,node:d,type:f,key:e}},w=function(a,e){return v(a,c,d,e,void 0,b)},x=function(a){return a.nodeType===b?w(a.nodeValue,a):v(a.nodeName.toLowerCase(),c,e.call(a.childNodes,x),a,void 0,1)},y=function(a,b){for(var d,e=[],g=[],h=arguments.length;2<h--;)e.push(arguments[h]);for(;0<e.length;)if(f(d=e.pop()))for(var h=d.length;0<h--;)e.push(d[h]);else if(!1===d||!0===d||null==d);else g.push("object"===o(d)?d:w(d));return b=b||c,"function"==typeof a?a(b,g):v(a,b,g,void 0,b.key)};return{h:y,app:function app(a){var b={},c=!1,d=a.view,e=a.node,h=e&&x(e),i=a.subscriptions,j=[],l=function(a){o(this.actions[a.type],a)},m=function(a){return b!==a&&(b=a,i&&(j=n(j,k([i(b)]),o)),d&&!c&&g(p,c=!0)),b},o=(a.middleware||function(a){return a})(function(a,c){return"function"==typeof a?o(a(b,c)):f(a)?"function"==typeof a[0]?o(a[0],"function"==typeof a[1]?a[1](c):a[1]):(k(a.slice(1)).map(function(a){a&&a[0](o,a[1])},m(a[0])),b):m(a)}),p=function(){c=!1,e=s(e.parentNode,e,h,h="string"==typeof(h=d(b))?w(h):h,l)};o(a.init)}}}(),r=q.h,e=q.app,h=function(a){return function(){var b=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{},d=!!(1<arguments.length&&void 0!==arguments[1])&&arguments[1],e=function(a){for(var b=arguments.length,c=Array(1<b?b-1:0),d=1;d<b;d++)c[d-1]=arguments[d];return c.some(function(b){return b===o(a)})};return d||(e(b,"string","number","function")||Array.isArray(b)?(d=b,b={}):e(b.View,"function")&&(d=b.View,b={})),r(a,b,d)}},s=h("a"),a=h("button"),t=h("code"),u=h("div"),v=h("footer"),w=h("h1"),x=h("h2"),y=h("h3"),z=h("h4"),A=h("header"),B=h("img"),C=h("input"),D=h("label"),E=h("li"),F=h("link"),G=h("main"),H=h("meta"),I=h("nav"),J=h("p"),p=h("pre"),K=h("script"),L=h("span"),M=h("title"),N=h("ul"),O={cookies:{},description:["simple tests with lots of utility. ecmascript modules only.","runs ecmascript module tests without transpilation.","unbelievably fast."],gdpr:{allowAllCookiesButtonText:"Allow all",allowCookieButtonText:"Allow selected",cookieButtonText:"Awesome.",cookieText:"We are using the following cookies on this page",denyCookieButtonText:"Deny all",noCookieButtonText:"Awesome.",noCookieText:"This page does neither save, collect, nor share any personal data about you.",show:!0,title:"Magic Privacy Information"},logotext:"@magic/test",menu:[{items:[{text:"install",to:"-install"},{text:"npm scripts",to:"-npm-scripts"},{text:"quick tests",to:"-quick-tests"},{text:"coverage",to:"-coverage"}],text:"getting started",to:"/#getting-started"},{items:[{text:"fs based test suites",to:"-fs"},{text:"data based test suites",to:"-data"}],text:"test suites",to:"/#test-suites"},{items:[{text:"testing types",to:"-types"},{text:"multiple tests in one file",to:"-multiple"},{text:"promises",to:"-promises"},{text:"callback functions",to:"-cb"},{text:"run function before / after individual tests",to:"-hooks"},{text:"run function before / after suite of tests",to:"-suite-hooks"}],text:"writing tests",to:"/#tests"},{items:[{text:"curry",to:"-curry"},{text:"vals",to:"-vals"},{text:"tryCatch",to:"-trycatch"},{text:"promises",to:"-promises"}],text:"utility functions",to:"/#lib"},{items:[{text:"js api",to:"-js"},{text:"cli",to:"-cli"},{text:"npm i -g",to:"-global"}],text:"usage",to:"/#usage"},{text:"changelog",to:"/#changelog"}],pageClass:{},root:"/test/",theme:"dark",title:"@magic/test",url:"/test/"},P={listenPopState:function listenPopState(a,b){var c=function(c){return a(b,c)};return addEventListener("popstate",c),function(){return removeEventListener("popstate",c)}},mapClickToGo:function mapClickToGo(a){return a.preventDefault(),a}},Q=function(a){var b=1<arguments.length&&arguments[1]!==void 0?arguments[1]:[];return v({class:"Footer"},[u({class:"Container"},[b,u({class:"Credits"},["made with a few bits of ",W({to:"https://github.com/magic/core",target:"_blank",rel:"noopener"},"magic")])]),R(a)])},R=function(a){var b=a.gdpr,c=a.cookies;if(b.show)return c=Object.entries(c),u({class:{Gdpr:!0,show:b.show}},[C({type:"checkbox",name:"show-hide",id:"show-hide",checked:!b.show}),u({class:"Container"},[b.title&&y(b.title),b.content&&J(b.content),c.length?[b.cookieText&&J(b.cookieText),N(c.sort(function(a){var b=k(a,2),c=b[0],d=b[1].required;return d?0:1}).map(function(a){var b=k(a,2),c=b[0],d=b[1],e=d.info,f=d.allowed;return E([C({type:"checkbox",title:"allow",checked:void 0!==f&&f,onchange:[ba.gdpr.allow,{name:c}]}),D([c,e&&[" - ",e]])])}))]:J(b.noCookieText),c.length?[D({class:"button",for:"show-hide",onclick:[ba.gdpr.close,{allowed:!0}]},b.allowAllCookiesButtonText),D({class:"button",for:"show-hide",onclick:ba.gdpr.close},b.allowCookieButtonText),D({class:"button",for:"show-hide",onclick:[ba.gdpr.close,{allowed:!1}]},b.denyCookieButtonText)]:D({class:"button",for:"show-hide",onclick:ba.gdpr.close},b.noCookieButtonText)])])},S=function(a){if("string"==typeof a)a={project:a};else if(!a.project)return;var b=a,c=b.project,d=void 0!==c&&c,e=b.branch,f=void 0===e?"master":e,g=b.host,h=void 0===g?"github":g,i=[["npm",function(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:d;return a&&{to:"https://www.npmjs.com/package/@".concat(a),src:"https://img.shields.io/npm/v/@".concat(a,".svg")}}],["travis",function(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:d;return a&&{to:"https://travis-ci.com/".concat(a),src:"https://travis-ci.com/".concat(a,".svg?branch=").concat(f)}}],["appveyor",function(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:d;if(a){var b=a.split("/"),c=k(b,2),e=c[0],g=c[1];return e=e.replace(/-/g,""),{to:"https://ci.appveyor.com/project/".concat(e,"/").concat(g,"/branch/").concat(f),src:"https://img.shields.io/appveyor/ci/".concat(e,"/").concat(g,"/").concat(f,".svg")}}}],["coveralls",function(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:d;return{to:"https://coveralls.io/".concat(h,"/").concat(a),src:"https://img.shields.io/coveralls/".concat(h,"/").concat(a,"/").concat(f,".svg")}}],["greenkeeper",function(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:d;return a&&{to:"https://greenkeeper.io",src:"https://badges.greenkeeper.io/".concat(a,".svg")}}],["snyk",function(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:d;return a&&{to:"https://snyk.io/test/".concat(h,"/").concat(a),src:"https://img.shields.io/snyk/vulnerabilities/github/".concat(a,".svg")}}]].map(function(b){var c=k(b,2),d=c[0],e=c[1];return e(a[d])}).filter(function(b){return b.to&&b.src});return i.length?N({class:"GitBadges"},i.map(function(a){var b=a.to,c=a.src;return E([W({to:b},U({src:c}))])})):void 0},T=function(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:{},b=1<arguments.length&&arguments[1]!==void 0?arguments[1]:[],c=a.logo,d=a.menu,e=a.logotext,f=i(a,["logo","menu","logotext"]);return c||d||e?A({class:"Header"},[(c||e)&&W({to:f.root,class:"Logo"},[c&&U(c),e&&L(e)]),d&&X({state:f,items:d}),b]):void 0},U=function(a){if("string"==typeof a&&(a={src:a}),!!a.src)return a.alt||(a.title?a.alt=a.title:(a.role="presentation",a.alt="")),B(a)},V=function(){0<arguments.length&&arguments[0]!==void 0?arguments[0]:{};return a({class:"LightSwitch",onclick:ba.changeTheme})},W=function(a,b){var c=a.to,d=i(a,["to"]),e=d.href,f=d.text,g=d.nofollow,h=d.noreferrer,j=i(d,["href","text","nofollow","noreferrer"]);c=c||e||"",j.href=c;var k=c.startsWith("/");return k?j.onclick=[ba.go,P.mapClickToGo]:(j.target="_blank",j.rel="noopener",g&&(j.rel+=" nofollow"),h&&(j.rel+=" noreferrer")),s(j,[f,b])},X=function(){var a=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{},b=a.items,c=a["class"],d=void 0===c?"Menu":c,e=a.collapse,g=a.state;if(b.length){var h=g.url||"";return g.hash&&!h.endsWith(g.hash)&&(h+="#".concat(g.hash)),I({className:d},N(b.map(function(a){return Y(f({},a,{url:h,state:g,collapse:void 0===e||e}))})))}},Y=function(a){var b=a.text,c=a.items,d=void 0===c?[]:c,e=a.url,g=a.state,h=a.parentTo,j=void 0===h?void 0:h,k=a.collapse,l=i(a,["text","items","url","state","parentTo","collapse"]),m=g.root;if(l.to||b){var n={class:{}},o=l.to;o.startsWith("/#")&&(o=o.substr(1));var p=l.to[0],q="/"===p||"-"===p||"#"===p;if(j&&q)if("-"===p||"#"===p)o=j+o;else{var u=o.split("/")[1];if(u){var v=j.endsWith("/".concat(u,"/"));!v&&q&&(o=j+o)}}("/"!==l.to&&e.endsWith(l.to)||l.to===e)&&(n["class"].active=!0);var r=o.startsWith(m);m&&q&&!r&&(o=m+o),l.to=o.replace(/\/\//g,"/");var s=[],t=e&&e.includes(l.to);return(d.length&&t||!k)&&(s=N(d.map(function(a){return Y(f({parentTo:l.to,url:e,state:g,collapse:k},a))}))),E(n,[l.to?W(l,b):L(l,b),s])}},Z=function(a){var b=a.page,c=a.state;b=b?b(c):"404 - not found";var d={id:"Magic",class:c.pageClass};return G(d,u({class:{Wrapper:!0}},_({state:c,page:b})))},$=function(b){"string"==typeof b&&(b={content:b});var c=b,d=c.content;return u({class:"Pre"},[u({class:"menu"},[a({onclick:[ba.pre.clip,function(a){return{e:a,content:d}}]},"copy")]),p(aa.pre.format(d))])},_=function(a){var b=a.page,c=a.state;return[T(c),u({class:"Page"},b),Q(c)]},aa={pre:function(){var a="\nlet this long package float\ngoto private class if short\nwhile protected with debugger case\ncontinue volatile interface\n\ninstanceof super synchronized throw\nextends final throws\ntry import double enum\n\nboolean abstract function\nimplements typeof transient break\ndefault do static void\n\nint new async native switch\nelse delete null public var\nawait byte finally catch\nin return for get const char\nmodule exports require\n".trim().split(/\b/g).map(function(a){return a.trim()}),c="\nArray Object String Number RegExp Null Symbol\nSet WeakSet Map WeakMap\nsetInterval setTimeout\nPromise\nJSON\nInt8Array Uint8Array Uint8ClampedArray\nInt16Array Uint16Array\nInt32Array Uint32Array\nFloat32Array Float64Array\n".trim().split(/\b/g).map(function(a){return a.trim()}),d=["true","false"],e=function(b){if("string"!=typeof b)return b;var e=b.split(/\b/);return b=e.map(function(b,f){if(""!==b){var g="";return"state"===b?g="state":"actions"===b?g="actions":e[f+1]&&e[f+1].includes(":")?g="colon":a.includes(b)?g="keyword":c.includes(b)?g="builtin":d.includes(b)?g="boolean":"."===e[f-1]?g="property":"."===e[f+1]&&(g="object"),g&&(b=L({class:g},b)),b}}),b},f=/([a-zA-Z0-9:+._-]+@[a-zA-Z0-9._-]+)/g,g=function(a){return a.split(f).map(function(a){if(f.test(a)){var b=a.startsWith("mailto:")?a:"mailto:".concat(a),c=a.replace("mailto:","");return W({class:"email",to:b},c)}return e(a)})},h=function(a,b){return[l(a.substring(0,b)),l(a.substring(b))]},i=function(a){return a.split(/(?= )/).map(function(a){return a.includes("://")?W({to:a},a):l(a)})},j=function(a){return a.includes("://")&&!a.includes("@")?i(a):g(a)},k=function(a){var c=a.replace(/"/g,"'"),d=c.split("'"),f=b(d),g=f[0],h=f[1],i=f.slice(2),k=i;1===k.length?k=l(k[0]):1<k.length&&(k=l(k.join("'")));var m=[];return m="undefined"==typeof h?e(a):[e(g),L({class:"string"},["'",j(h),"'"]),k],m},l=function(a){var b=a.indexOf("//"),c=a.trim();if(c.startsWith("//")){for(var d=a.search(/\S|$/),e="",f=0;f<d;f++)e+=" ";return c.startsWith("// ")||(a="".concat(e,"// ").concat(c.substr(2))),L({class:"comment"},[e,"// ",l(c.substring(3))])}return-1<b&&":"!==a[b-1]?h(a,b):2<a.indexOf("://")?i(a):a.indexOf("@")&&a.includes(".")&&!a.trim().includes(" ")?g(a):k(a)},m=function(a){return t({class:"line"},l(a))};return{format:function format(a){return a.trim().split("\n").map(m)}}}()},ba={changeTheme:function changeTheme(a){return f({},a,{pageClass:f({},a.pageClass,{light:"dark"===a.theme}),theme:"dark"===a.theme?"light":"dark"})},gdpr:{allow:function allow(a,b){return a.cookies[b.name].allowed=!0,f({},a)},close:function close(a,b){var c=b.allowed,d=a.cookies;return"boolean"==typeof c&&Object.entries(a.cookies).forEach(function(a){var b=k(a,2),e=b[0],g=b[1];d[e]=f({},g,{allowed:c})}),[f({},a,{gdpr:f({},a.gdpr,{show:!1}),cookies:d}),[ca.gdpr.writeLocalStorage,{key:"magic-gdpr",value:{cookies:a.cookies||[],show:!1}}]]},load:function load(a){return[a,[ca.gdpr.readLocalStorage,{key:"magic-gdpr",action:ba.gdpr.show}]]},show:function show(a,b){return f({},a,{gdpr:f({},a.gdpr,{},b.value)})}},go:function go(a,b){var c=b.currentTarget.href.replace(window.location.origin,""),d=c.split("#"),e=k(d,2),g=e[0],h=e[1],i=void 0===h?"":h;return g===a.url&&i===a.hash?a:(window.history.pushState({url:g,hash:i},"",c),i?window.location.hash=i:window.scroll(0,0),f({},a,{url:g,hash:i,prev:a.url}))},pop:function pop(a,b){var c=window.location,d=c.pathname,e=c.hash;return e=e.substring(1),b.state&&(d=b.state.url,e=b.state.hash),e?window.location.hash=e:window.scroll(0,0),f({},a,{url:d,hash:e})},pre:{clip:function clip(a,b){var c=b.content;if("undefined"!=typeof document&&"function"==typeof document.execCommand){var d=document.createElement("textarea");d.id="copy",d.innerHTML=c,document.body.appendChild(d);var e=document.getElementById("copy");e.select(),document.execCommand("copy"),document.body.removeChild(e)}return a}}},ca={gdpr:{readLocalStorage:function readLocalStorage(a,b){var c=b.key,d=b.action,e=window.localStorage||{},f=e[c];"undefined"!=typeof f&&(f=JSON.parse(f)),a(d,{key:c,value:f})},writeLocalStorage:function writeLocalStorage(a,b){var c=b.key,d=b.value,e=window.localStorage||{};e[c]=JSON.stringify(d)}}},da={"/test/":function test(a){return[w(a.title),a.description.map(function(a){return J(a)}),S("magic/test"),x({id:"getting-started"},"getting started"),J("be in a nodejs project."),y({id:"getting-started-install"},"install"),$("npm i --save-dev @magic/test"),$("\n// create test/functionName.mjs\nimport yourTest from '../path/to/your/file.mjs'\n\nexport default [\n  { fn: () => true, expect: true, info: 'true is true' },\n  // note that the yourTest function will be called automagically\n  { fn: yourTest, expect: true, info: 'hope this will work ;)'}\n]"),y({id:"getting-started-npm-scripts"},"npm run scripts"),J("edit package.json"),$("\n{\n  \"scripts\": {\n    \"test\": \"t -p\", // quick test, only failing tests log\n    \"coverage\": \"t\", // get full test output and coverage reports\n    \"format\": \"f -w\", // format using prettier and write changes to files\n    \"format:check\": \"f\" // check format using prettier\n  }\n}"),J("repeated for easy copy pasting (without comments)"),$("\n  \"scripts\": {\n    \"test\": \"t -p\",\n    \"coverage\": \"t\",\n    \"format\": \"f -w\",\n    \"format:check\": \"f\"\n  }"),y({id:"getting-started-quick-tests"},"quick tests (without coverage)"),$("\n// run the tests:\nnpm test\n\n// example output:\n// (failing tests will print, passing tests are silent)\n\n// ### Testing package: @magic/test\n// Ran 2 tests. Passed 2/2 100%"),y({id:"getting-started-coverage"},"coverage"),J(["@magic/test will automagically generate coverage reports if it is not called with the -p flag."]),y({id:"test-suites"},"data/fs driven test suite creation:"),z("expectations for optimal test messages:"),J("src and test directories have the same structure and files"),J("tests one src file per test file"),J("tests one function per suite"),J("tests one feature per test"),z({id:"test-suites-fs"},"Filesystem based naming"),J("the following directory structure:"),$("\n./test/\n  ./suite1.mjs\n  ./suite2.mjs"),J("yields the same result as exporting the following from ./test/index.mjs"),z({id:"test-suites-data"},"Data driven naming"),$("\nimport suite1 from './suite1'\nimport suite2 from './suite2'\n\nexport default {\n  suite1,\n  suite2,\n}"),y("Important - File mappings"),J("if test/index.mjs exists, no other files will be loaded."),J("if test/lib/index.mjs exists, no other files from that subdirectory will be loaded."),y({id:"tests"},"single test, literal value, function or promise"),$("\nexport default { fn: true, expect: true, info: 'expect true to be true' }\n\n// expect: true is the default and can be omitted\nexport default { fn: true, info: 'expect true to be true' }\n\n// if fn is a function expect is the returned value of the function\nexport default { fn: () => false, expect: false, info: 'expect true to be true' }\n\n// if expect is a function the return value of the test get passed to it\nexport default { fn: false, expect: t => t === false, info: 'expect true to be true' }\n\n// if fn is a promise the resolved value will be returned\nexport default { fn: new Promise(r => r(true)), expect: true, info: 'expect true to be true' }\n\n// if expects is a promise it will resolve before being compared to the fn return value\nexport default { fn: true, expect: new Promise(r => r(true)), info: 'expect true to be true' }\n\n// callback functions can be tested easily too:\nimport { promise } from '@magic/test'\n\nconst fnWithCallback = (err, arg, cb) => cb(err, arg)\n\nexport default { fn: promise(fnWithCallback(null, 'arg', (e, a) => a)), expect: 'arg' }"),z({id:"tests-types"},"testing types"),J(["types can be compared using ",W({to:"https://github.com/magic/types"},"@magic/types")]),J(["@magic/types is a richly featured and thoroughly tested type library without dependencies."," it is exported from this library for convenience."]),$("\nimport { is } from '@magic/test'\n\nexport default [\n  { fn: () => 'string',\n    expect: is.string,\n    info: 'test if a function returns a string'\n  },\n  {\n    fn: () => 'string',\n    expect: is.length.equal(6),\n    info: 'test length of returned value'\n  },\n  // !!! Testing for deep equality. simple.\n  {\n    fn: () => [1, 2, 3],\n    expect: is.deep.equal([1, 2, 3]),\n    info: 'deep compare arrays/objects for equality',\n  },\n  {\n    fn: () => { key: 1 },\n    expect: is.deep.different({ value: 1 }),\n    info: 'deep compare arrays/objects for difference',\n  },\n]"),z("caveat:"),J(["if you want to test if a function is a function, you need to wrap the function in a function."," this is because functions passed to fn get executed automatically."]),$("\nimport { is } from '@magic/test'\n\nconst fnToTest = () => {}\n\n// both the tests will work as expected\nexport default [\n  {\n    fn: () => fnToTest,\n    expect: is.function,\n    info: 'function is a function',\n  },\n  {\n    fn: is.fn(fnToTest), // returns true\n    // we do not set expect: true, since that is the default\n    info: 'function is a function',\n  },\n]"),$("\n// will not work as expected and instead call fnToTest\nexport default {\n  fn: fnToTest,\n  expect: is.function,\n  info: 'function is a function',\n}"),y({id:"tests-multiple"}," multiple tests"),J("multiple tests can be created by exporting an array of single test objects."),$("\nexport default {\n  multipleTests: [\n    { fn: () => true, expect: true, info: 'expect true to be true' },\n    { fn: () => false, expect: false, info: 'expect false to be false' },\n  ]\n}"),J("multiple tests can also be created by exporting an array of tests."),$("\n  export default [\n    { fn: () => true, expect: true, info: 'expect true to be true' },\n    { fn: () => false, expect: false, info: 'expect false to be false' },\n  ]"),y({id:"tests-promises"},"promises"),$("\nimport { promise, is } from '@magic/test'\n\nexport default [\n  // kinda clumsy, but works. until you try handling errors.\n  {\n    fn: new Promise(cb => setTimeOut(() => cb(true), 2000)),\n    expect: true,\n    info: 'handle promises',\n  },\n  // better!\n  {\n    fn: promise(cb => setTimeOut(() => cb(null, true), 200)),\n    expect: true,\n    info: 'handle promises in a nicer way',\n  },\n  {\n    fn: promise(cb => setTimeOut(() => cb(new Error('error')), 200)),\n    expect: is.error,\n    info: 'handle promise errors in a nice way',\n  },\n]"),y({id:"tests-cb"},"callback functions"),$("\nimport { promise, is } from '@magic/test'\n\nconst fnWithCallback = (err, arg, cb) => cb(err, arg)\n\nexport default [\n  {\n    fn: promise(cb => fnWithCallback(null, true, cb)),\n    expect: true\n    info: 'handle callback functions as promises',\n  },\n  {\n    fn: promise(cb => fnWithCallback(new Error('oops'), true, cb)),\n    expect: is.error,\n    info: 'handle callback function error as promise',\n  },\n]"),y({id:"tests-hooks"},"run functions before and/or after individual test"),$("\nconst after = () => {\n  global.testing = 'Test has finished, cleanup.'\n}\n\nconst before = () => {\n  global.testing = false\n\n  // if a function gets returned,\n  // this function will be executed once the test finished.\n  return after\n}\n\nexport default [\n  {\n    fn: () => { global.testing = 'changed in test' },\n    // if before returns a function, it will execute after the test.\n    before,\n    after,\n    expect: () => global.testing === 'changed in test',\n  },\n]"),y({id:"tests-suite-hooks"},"run functions before and/or after a suite of tests"),$("\nconst afterAll = () => {\n  // Test has finished, cleanup.'\n  global.testing = undefined\n}\n\nconst beforeAll = () => {\n  global.testing = false\n\n  // if a function gets returned,\n  // this function will be executed once the test suite finished.\n  return afterAll\n}\n\nexport default [\n  {\n    fn: () => { global.testing = 'changed in test' },\n    // if beforeAll returns a function, it will execute after the test suite.\n    beforeAll,\n    // this is optional and can be omitted if beforeall returns a function.\n    // in this example, afterAll will trigger twice.\n    afterAll,\n    expect: () => global.testing === 'changed in test',\n  },\n]"),x({id:"lib"},"Utility Belt"),J("@magic/test exports some utility functions that make working with complex test workflows simpler."),z({id:"lib-curry"},"curry"),J("Currying can be used to split the arguments of a function into multiple nested functions."),J(["This helps if you have a function with complicated arguments"," that you just want to quickly shim."]),$("\nimport { curry } from '@magic/test'\n\nconst compare = (a, b) => a === b\nconst curried = curry(compare)\nconst shimmed = curried('shimmed_value')\n\nexport default {\n  fn: shimmed('shimmed_value'),\n  expect: true,\n  info: 'expect will be called with a and b and a will equal b',\n}\n"),z({id:"lib-vals"},"vals"),J(["exports some javascript types. more to come."," will sometime in the future be the base of a fuzzer."]),y({id:"lib-promises"},"promises"),J("Helper function to wrap nodejs callback functions and promises with ease."),J("Handles the try/catch steps internally and returns a resolved or rejected promise."),$("\nimport { promise, is } from '@magic/test'\n\nexport default [\n  {\n    fn: promise(cb => setTimeOut(() => cb(null, true), 200)),\n    expect: true,\n    info: 'handle promises in a nice way',\n  },\n  {\n    fn: promise(cb => setTimeOut(() => cb(new Error('error')), 200)),\n    expect: is.error,\n    info: 'handle promise errors in a nice way',\n  },\n]"),y({id:"lib-css"},"css"),J(["exports ",W({to:"https://github.com/magic/css"},"@magic/css")," which allows parsing and stringification of css-in-js objects."]),z({id:"lib-trycatch"},"tryCatch"),J("allows to test functions without bubbling the errors up into the runtime"),$("\nimport { is, tryCatch } from '@magic/test'\n\nconst throwing = () => throw new Error('oops')\nconst healthy = () => true\n\nexport default [\n  {\n    fn: tryCatch(throwing()),\n    expect: is.error,\n    info: 'function throws an error',\n  },\n  {\n    fn: tryCatch(healthy()),\n    expect: true,\n    info: 'function does not throw'\n  },\n]"),x({id:"usage"},"Usage"),y({id:"usage-js"},"mjs api:"),$("\n// test/index.mjs\nimport run from '@magic/test'\n\nconst tests = {\n  lib: [\n    { fn: () => true, expect: true, info: 'Expect true to be true' }\n  ],\n}\n\nrun(tests)"),x({id:"usage-cli"},"cli"),y("package.json (recommended)"),J("Add the magic/test bin scripts to package.json"),$("\n{\n  \"scripts\": {\n    \"test\": \"t -p\",\n    \"coverage\": \"t\",\n    \"format\": \"f -w\",\n    \"format:check\": \"f\"\n  },\n  \"devDependencies\": {\n    \"@magic/test\": \"github:magic/test\"\n  }\n}"),J("then use the npm run scripts"),$("\nnpm test\nnpm run coverage\nnpm run format\nnpm run format:check"),y({id:"usage-global"},"Globally (not recommended):"),J(["you can install this library globally"," but the recommendation is to add the dependency and scripts to the package.json file."]),J(["this both explains to everyone that your app has these dependencies"," as well as keeping your bash free of clutter"]),$("\nnpm i -g magic/test\n\n// run tests in production mode\nt -p\n\n// run tests and get coverage in verbose mode\nt\n\n// check formatting using prettier but do not write\n// prettier --list-different\nf\n\n// format files using prettier\n// prettier --write\nf -w"),J(["This library tests itself, have a look at ",W({to:"https://github.com/magic/test/tree/master/test"},"the tests")]),J("Checkout [@magic/types](https://github.com/magic/types) and the other magic libraries for more test examples."),x({id:"changelog"},"changelog"),y("0.1.0"),J("use esmodules instead of commonjs."),y("0.1.1"),J("rework of bin scripts and update dependencies to esmodules"),y("0.1.2"),J("cli now works on windows again (actually, this version is broken on all platforms.)"),y("0.1.3"),J("cli now works everywhere"),y("0.1.4"),J("npm run scripts of @magic/test itself can be run on windows."),y("0.1.5"),J("use ecmascript version of @magic/deep"),y("0.1.6"),J("update this readme and html docs."),J("tests should always process.exit(1) if they errored."),y("0.1.7"),J("readded calls npm run script"),J("updated c8"),y("0.1.8"),J("update @magic/cli"),y("0.1.9"),J("test/beforeAll.mjs gets loaded separately if it exists and executed before all tests"),J("test/afterAll.mjs gets loaded separately if it exists and executed after all tests"),J(["if the function exported from test/beforeAll.mjs returns another function,"," this function will be executed after all tests,"," additionally to any functions exported from test/afterAll.mjs."]),J("export hyperapp beta.18"),y("0.1.10"),J("node 12.4.0 does not use --experimental-json-modules flag. removed it in 12.4+."),y("0.1.11"),J("update prettier, coveralls"),J("add @magic/css and export it for css testing"),y("0.1.12"),J("update dependencies"),y("0.1.13"),J("tests now work on windows (again)"),V(a)]},"/test/404/":function test404(){return u("404 - not found")}};e({init:function init(){return ba.gdpr.load(f({},O,{url:window.location.pathname}))},subscriptions:function subscriptions(){return[[P.listenPopState,ba.pop]]},view:function view(a){var b=da[a.url]?a.url:"/404/",c=da[b];return a.pages&&a.pages[b]&&Object.keys(a.pages[b]).forEach(function(c){a[c]=a.pages[b][c]}),Z({page:c,state:a})},node:document.getElementById("Magic")});