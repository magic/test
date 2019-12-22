"use strict";function b(a){return m(a)||c(a)||k()}function c(a){if(Symbol.iterator in Object(a)||"[object Arguments]"===Object.prototype.toString.call(a))return Array.from(a)}function d(a,b){if(null==a)return{};var c,d,f=e(a,b);if(Object.getOwnPropertySymbols){var g=Object.getOwnPropertySymbols(a);for(d=0;d<g.length;d++)c=g[d],!(0<=b.indexOf(c))&&Object.prototype.propertyIsEnumerable.call(a,c)&&(f[c]=a[c])}return f}function e(a,b){if(null==a)return{};var c,d,e={},f=Object.keys(a);for(d=0;d<f.length;d++)c=f[d],0<=b.indexOf(c)||(e[c]=a[c]);return e}function f(a,b){var c=Object.keys(a);if(Object.getOwnPropertySymbols){var d=Object.getOwnPropertySymbols(a);b&&(d=d.filter(function(b){return Object.getOwnPropertyDescriptor(a,b).enumerable})),c.push.apply(c,d)}return c}function g(a){for(var b,c=1;c<arguments.length;c++)b=null==arguments[c]?{}:arguments[c],c%2?f(Object(b),!0).forEach(function(c){i(a,c,b[c])}):Object.getOwnPropertyDescriptors?Object.defineProperties(a,Object.getOwnPropertyDescriptors(b)):f(Object(b)).forEach(function(c){Object.defineProperty(a,c,Object.getOwnPropertyDescriptor(b,c))});return a}function i(a,b,c){return b in a?Object.defineProperty(a,b,{value:c,enumerable:!0,configurable:!0,writable:!0}):a[b]=c,a}function j(a,b){return m(a)||l(a,b)||k()}function k(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}function l(a,b){if(Symbol.iterator in Object(a)||"[object Arguments]"===Object.prototype.toString.call(a)){var c=[],d=!0,e=!1,f=void 0;try{for(var g,h=a[Symbol.iterator]();!(d=(g=h.next()).done)&&(c.push(g.value),!(b&&c.length===b));d=!0);}catch(a){e=!0,f=a}finally{try{d||null==h["return"]||h["return"]()}finally{if(e)throw f}}return c}}function m(a){if(Array.isArray(a))return a}function n(a){return n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&"function"==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a},n(a)}var o=function(){var a=2,b=3,c={},d=[],e=d.map,f=Array.isArray,g="undefined"==typeof requestAnimationFrame?setTimeout:requestAnimationFrame,h=function(a){var b="";if("string"==typeof a)return a;if(f(a)&&0<a.length)for(var c,d=0;d<a.length;d++)""!==(c=h(a[d]))&&(b+=(b&&" ")+c);else for(var d in a)a[d]&&(b+=(b&&" ")+d);return b},j=function(c,a){var b={};for(var d in c)b[d]=c[d];for(var d in a)b[d]=a[d];return b},k=function(a){return a.reduce(function(a,b){return a.concat(b&&!0!==b?"function"==typeof b[0]?[b]:k(b):0)},d)},l=function(c,a){return f(c)&&f(a)&&c[0]===a[0]&&"function"==typeof c[0]},m=function(c,a){if(c!==a)for(var b in j(c,a)){if(c[b]!==a[b]&&!l(c[b],a[b]))return!0;a[b]=c[b]}},o=function(a,b,c){for(var d,e,f=0,g=[];f<a.length||f<b.length;f++)d=a[f],e=b[f],g.push(e?!d||e[0]!==d[0]||m(e[1],d[1])?[e[0],e[1],e[0](c,e[1]),d&&d[2]()]:d:d&&d[2]());return g},p=function(a,b,c,d,e,f){if("key"===b);else if("style"===b)for(var g in j(c,d))c=null==d||null==d[g]?"":d[g],"-"===g[0]?a[b].setProperty(g,c):a[b][g]=c;else"o"===b[0]&&"n"===b[1]?((a.actions||(a.actions={}))[b=b.slice(2).toLowerCase()]=d)?!c&&a.addEventListener(b,e):a.removeEventListener(b,e):!f&&"list"!==b&&b in a?a[b]=null==d?"":d:null!=d&&!1!==d&&("class"!==b||(d=h(d)))?a.setAttribute(b,d):a.removeAttribute(b)},q=function(a,c,d){var e=a.props,f=a.type===b?document.createTextNode(a.name):(d=d||"svg"===a.name)?document.createElementNS("http://www.w3.org/2000/svg",a.name,{is:e.is}):document.createElement(a.name,{is:e.is});for(var g in e)p(f,g,null,e[g],c,d);for(var h=0,j=a.children.length;h<j;h++)f.appendChild(q(a.children[h]=v(a.children[h]),c,d));return a.node=f},r=function(a){return null==a?null:a.key},s=function(a,c,d,e,f,g){if(d===e);else if(null!=d&&d.type===b&&e.type===b)d.name!==e.name&&(c.nodeValue=e.name);else if(null==d||d.name!==e.name)c=a.insertBefore(q(e=v(e),f,g),c),null!=d&&a.removeChild(d.node);else{var h,k,l,m,n=d.props,o=e.props,t=d.children,u=e.children,w=0,x=0,y=t.length-1,z=u.length-1;for(var A in g=g||"svg"===e.name,j(n,o))("value"===A||"selected"===A||"checked"===A?c[A]:n[A])!==o[A]&&p(c,A,n[A],o[A],f,g);for(;x<=z&&w<=y&&null!=(l=r(t[w]))&&l===r(u[x]);)s(c,t[w].node,t[w],u[x]=v(u[x++],t[w++]),f,g);for(;x<=z&&w<=y&&null!=(l=r(t[y]))&&l===r(u[z]);)s(c,t[y].node,t[y],u[z]=v(u[z--],t[y--]),f,g);if(w>y)for(;x<=z;)c.insertBefore(q(u[x]=v(u[x++]),f,g),(k=t[w])&&k.node);else if(x>z)for(;w<=y;)c.removeChild(t[w++].node);else{for(var A=w,B={},C={};A<=y;A++)null!=(l=t[A].key)&&(B[l]=t[A]);for(;x<=z;){if(l=r(k=t[w]),m=r(u[x]=v(u[x],k)),C[l]||null!=m&&m===r(t[w+1])){null==l&&c.removeChild(k.node),w++;continue}null==m||1===d.type?(null==l&&(s(c,k&&k.node,k,u[x],f,g),x++),w++):(l===m?(s(c,k.node,k,u[x],f,g),C[m]=!0,w++):null==(h=B[m])?s(c,k&&k.node,null,u[x],f,g):(s(c,c.insertBefore(h.node,k&&k.node),h,u[x],f,g),C[m]=!0),x++)}for(;w<=y;)null==r(k=t[w++])&&c.removeChild(k.node);for(var A in B)null==C[A]&&c.removeChild(B[A].node)}}return e.node=c},t=function(c,a){for(var b in c)if(c[b]!==a[b])return!0;for(var b in a)if(c[b]!==a[b])return!0},u=function(a){return"object"===n(a)?a:x(a)},v=function(b,c){return b.type===a?((!c||c.type!==a||t(c.lazy,b.lazy))&&((c=u(b.lazy.view(b.lazy))).lazy=b.lazy),c):b},w=function(a,b,c,d,e,f){return{name:a,props:b,children:c,node:d,type:f,key:e}},x=function(a,e){return w(a,c,d,e,void 0,b)},y=function(a){return a.nodeType===b?x(a.nodeValue,a):w(a.nodeName.toLowerCase(),c,e.call(a.childNodes,y),a,void 0,1)};return{h:function h(a,b){for(var d,e=[],g=[],h=arguments.length;2<h--;)e.push(arguments[h]);for(;0<e.length;)if(f(d=e.pop()))for(var h=d.length;0<h--;)e.push(d[h]);else if(!1===d||!0===d||null==d);else g.push(u(d));return b=b||c,"function"==typeof a?a(b,g):w(a,b,g,void 0,b.key)},app:function app(a){var b={},c=!1,d=a.view,e=a.node,h=e&&y(e),i=a.subscriptions,j=[],l=function(a){n(this.actions[a.type],a)},m=function(a){return b!==a&&(b=a,i&&(j=o(j,k([i(b)]),n)),d&&!c&&g(p,c=!0)),b},n=(a.middleware||function(a){return a})(function(a,c){return"function"==typeof a?n(a(b,c)):f(a)?"function"==typeof a[0]||f(a[0])?n(a[0],"function"==typeof a[1]?a[1](c):a[1]):(k(a.slice(1)).map(function(a){a&&a[0](n,a[1])},m(a[0])),b):m(a)}),p=function(){c=!1,e=s(e.parentNode,e,h,h=u(d(b)),l)};n(a.init)}}}(),q=o.h,h=o.app,r=function(a){return function(){var b=0<arguments.length&&arguments[0]!==void 0?arguments[0]:{},d=!!(1<arguments.length&&arguments[1]!==void 0)&&arguments[1],e=function(a){for(var b=arguments.length,c=Array(1<b?b-1:0),d=1;d<b;d++)c[d-1]=arguments[d];return c.some(function(b){return b===n(a)})};if(!d)if(e(b,"string","number","function")||Array.isArray(b))d=b,b={};else if(e(b.View,"function"))d=b.View,b={};else if(b.props||b.c)return q(a,{},b);return q(a,b,d)}},s=r("a"),a=r("button"),t=r("code"),u=r("div"),v=r("footer"),w=r("h1"),x=r("h2"),y=r("h3"),z=r("h4"),A=r("header"),B=r("img"),C=r("input"),D=r("label"),E=r("li"),F=r("link"),G=r("main"),H=r("meta"),I=r("nav"),J=r("p"),p=r("pre"),K=r("script"),L=r("span"),M=r("title"),N=r("ul"),O={description:["simple tests with lots of utility. ecmascript modules only.","runs ecmascript module tests without transpilation.","unbelievably fast."],gdpr:{allowed:[],show:!0},logotext:"@magic/test",menu:[{items:[{text:"install",to:"-install"},{text:"npm scripts",to:"-npm-scripts"},{text:"quick tests",to:"-quick-tests"},{text:"coverage",to:"-coverage"}],text:"getting started",to:"/#getting-started"},{items:[{text:"fs based test suites",to:"-fs"},{text:"data based test suites",to:"-data"}],text:"test suites",to:"/#test-suites"},{items:[{text:"testing types",to:"-types"},{text:"multiple tests in one file",to:"-multiple"},{text:"promises",to:"-promises"},{text:"callback functions",to:"-cb"},{text:"run function before / after individual tests",to:"-hooks"},{text:"run function before / after suite of tests",to:"-suite-hooks"}],text:"writing tests",to:"/#tests"},{items:[{text:"curry",to:"-curry"},{text:"vals",to:"-vals"},{text:"tryCatch",to:"-trycatch"},{text:"promises",to:"-promises"}],text:"utility functions",to:"/#lib"},{items:[{text:"js api",to:"-js"},{text:"cli",to:"-cli"},{text:"npm i -g",to:"-global"}],text:"usage",to:"/#usage"},{text:"changelog",to:"/#changelog"}],pageClass:{},root:"/test/",theme:"dark",title:"@magic/test",url:"/test/"},P={listenPopState:function listenPopState(a,b){var c=function(c){return a(b,c)};return addEventListener("popstate",c),function(){return removeEventListener("popstate",c)}},mapClickToGo:function mapClickToGo(a){return a.preventDefault(),a}},Q=function(a){var b=a.blog,c=a.month,d=a.year,e=Object.entries(b[d][c]);return[y([c," - ",d]),e.map(function(b){var c=j(b,2),d=c[0],e=c[1];return e.map(function(b){return R(g({},a,{day:d},b))})})]},R=function(a){return u([z(Z({to:a.name},[a.day,"-",a.month,"-",a.year," - ",a.state.title])),J(a.state.description)])},S=function(a){return u([x(a.year),Object.entries(a.blog[a.year]).map(function(b){var c=j(b,2),d=c[0],e=c[1];return Q(g({},a,{month:d,days:e}))})])},T=function(a){var b=1<arguments.length&&arguments[1]!==void 0?arguments[1]:[];return v({class:"Footer"},[u({class:"Container"},[b,u({class:"Credits"},["made with a few bits of ",Z({to:"https://github.com/magic/core",target:"_blank",rel:"noopener"},"magic")])]),"function"==typeof U&&U(a),"function"==typeof Messages&&Messages(a)])},U=function(a){var b=a.gdpr,c=void 0===b?{}:b,d=a.cookies,e=void 0===d?[]:d,f=c.show,g=c.title,h=void 0===g?"Magic Privacy Information":g,i=c.content,j=void 0===i?"This app neither saves, collects, nor shares any data about you.":i,k=c.noCookieButtonText,l=void 0===k?"Awesome.":k,m=c.allowAllCookiesButtonText,n=void 0===m?"Allow all":m,o=c.allowCookieButtonText,p=void 0===o?"Allow selected":o,q=c.denyCookieButtonText,r=void 0===q?"Deny all personal data":q;if(f){var s=!!e.length;return u({class:"Gdpr"},[C({type:"checkbox",name:"show-hide",id:"show-hide",checked:!f}),u({class:"Container"},[h&&y(h),j&&J(j),s&&[N(e.map(function(a){var b=a.name,d=a.title,e=a.content,f=a.allowed;return E({class:"Cookie"},[C({type:"checkbox",title:"allow ".concat(b," data"),id:b,checked:c.allowed.includes(b),onchange:[ea.gdpr.toggleAllow,{name:b}]}),(d||e)&&D({for:b},[d&&z(d),e&&J(e)])])}))],s?[D({class:"button allow all",for:"show-hide",onclick:ea.gdpr.allow},n),D({class:"button allow",for:"show-hide",onclick:ea.gdpr.close},p),D({class:"button allow none",for:"show-hide",onclick:ea.gdpr.deny},r)]:D({class:"button",for:"show-hide",onclick:ea.gdpr.close},l)])])}},V=function(a){if("string"==typeof a)a={project:a};else if(!a.project)return;var b=a,c=b.project,d=void 0!==c&&c,e=b.branch,f=void 0===e?"master":e,g=b.host,h=void 0===g?"github":g,i=[["npm",function(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:d;return a&&{to:"https://www.npmjs.com/package/@".concat(a),src:"https://img.shields.io/npm/v/@".concat(a,".svg")}}],["travis",function(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:d;return a&&{to:"https://travis-ci.com/".concat(a),src:"https://img.shields.io/travis/com/".concat(a,"/").concat(f)}}],["appveyor",function(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:d;if(a){var b=a.split("/"),c=j(b,2),e=c[0],g=c[1];return e=e.replace(/-/g,""),{to:"https://ci.appveyor.com/project/".concat(e,"/").concat(g,"/branch/").concat(f),src:"https://img.shields.io/appveyor/ci/".concat(e,"/").concat(g,"/").concat(f,".svg")}}}],["coveralls",function(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:d;return{to:"https://coveralls.io/".concat(h,"/").concat(a),src:"https://img.shields.io/coveralls/".concat(h,"/").concat(a,"/").concat(f,".svg")}}],["greenkeeper",function(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:d;return a&&{to:"https://greenkeeper.io",src:"https://badges.greenkeeper.io/".concat(a,".svg")}}],["snyk",function(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:d;return a&&{to:"https://snyk.io/test/".concat(h,"/").concat(a),src:"https://img.shields.io/snyk/vulnerabilities/github/".concat(a,".svg")}}]].map(function(b){var c=j(b,2),d=c[0],e=c[1];return e(a[d])}).filter(function(b){return b.to&&b.src});return i.length?N({class:"GitBadges"},i.map(function(a){var b=a.to,c=a.src;return E([Z({to:b},X({src:c}))])})):void 0},W=function(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:{},b=1<arguments.length&&arguments[1]!==void 0?arguments[1]:[],c=a.logo,e=a.menu,f=a.logotext,g=d(a,["logo","menu","logotext"]);return c||e||f?A({class:"Header"},[(c||f)&&Z({to:g.root,class:"Logo"},[c&&X(c),f&&L(f)]),e&&$({state:g,items:e}),b]):void 0},X=function(a){if("string"==typeof a&&(a={src:a}),!!a.src)return a.alt||(a.title?a.alt=a.title:(a.role="presentation",a.alt="")),B(a)},Y=function(){0<arguments.length&&arguments[0]!==void 0?arguments[0]:{};return a({class:"LightSwitch",onclick:ea.changeTheme})},Z=function(a,b){var c=a.to,e=d(a,["to"]),f=e.href,g=e.text,h=e.nofollow,i=e.noreferrer,j=d(e,["href","text","nofollow","noreferrer"]);c=c||f||"",j.href=c;var k="/"===c[0]||"#"===c[0];return k?j.onclick=[ea.go,P.mapClickToGo]:(j.target="_blank",j.rel="noopener",h&&(j.rel+=" nofollow"),i&&(j.rel+=" noreferrer")),s(j,[g,b])},$=function(){var a=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{},b=a.items,c=a["class"],d=void 0===c?"Menu":c,e=a.collapse,f=a.state;if(b.length){var h=f.url||"";return f.hash&&!h.endsWith(f.hash)&&(h+="#".concat(f.hash)),I({className:d},N(b.map(function(a){return _(g({},a,{url:h,state:f,collapse:void 0===e||e}))})))}},_=function(a){var b=a.text,c=a.items,e=void 0===c?[]:c,f=a.url,h=a.state,i=a.parentTo,j=void 0===i?void 0:i,k=a.collapse,l=d(a,["text","items","url","state","parentTo","collapse"]),m=h.root;if(l.to||b){var n={class:{}},o=l.to;o.startsWith("/#")&&(o=o.substr(1));var p=l.to[0],q="/"===p||"-"===p||"#"===p;if(j&&q)if("-"===p||"#"===p)o=j+o;else{var u=o.split("/")[1];if(u){var v=j.endsWith("/".concat(u,"/"));!v&&q&&(o=j+o)}}("/"!==l.to&&f.endsWith(l.to)||l.to===f)&&(n["class"].active=!0);var r=o.startsWith(m);m&&q&&!r&&(o=m+o),l.to=o.replace(/\/\//g,"/");var s=[],t=f&&f.includes(l.to);return(e.length&&t||!k)&&(s=N(e.map(function(a){return _(g({parentTo:l.to,url:f,state:h,collapse:k},a))}))),E(n,[l.to?Z(l,b):L(l,b),s])}},aa=function(a){var b=a.page,c=a.state;b=b?b(c):"404 - not found";var d={id:"Magic",class:c.pageClass};return G(d,u({class:{Wrapper:!0}},ca({state:c,page:b})))},ba=function(b,c){"string"==typeof b?b={content:b}:c&&(b=g({content:c},b));var d=b,f=d.content,h=d.lines;return u({class:{Pre:!0,lines:!(void 0!==h)||h}},[u({class:"menu"},[a({onclick:[ea.pre.clip,function(a){return{e:a,content:f}}]},"copy")]),p(da.pre.format(f))])},ca=function(a){var b=a.page,c=a.state;return[W(c),u({class:"Page"},b),T(c)]},da={db:function(){return{set:function set(a,b){var c=b.action,d=b.key,e=b.value,f=da.db.init(),g=da.json.stringify(e);return"Error"==typeof g?void a(c,new Error("db:write ".concat(d," ").concat(val))):void(f[d]=g,a(c,{key:d,value:e}))},get:function get(a,b){var c=b.action,d=b.key,e=da.db.init(),f=void 0;return e[d]&&(f=da.json.parse(e[d]),"Error"==typeof res)?void a(c,new Error("db:read ".concat(d))):void a(c,{key:d,value:f})},del:function del(a,b){var c=b.action,d=b.key,e=da.db.init();e[d]&&e.removeItem(d),a(c,{key:d,value:void 0})},init:function init(){return"undefined"!=typeof window&&window.localStorage||{}}}}(),json:function(){var a=function(a){return function(){try{return a.apply(void 0,arguments)}catch(a){return a}}},b=a(JSON.parse),c=a(JSON.stringify);return{parse:b,stringify:c}}(),pre:function(){var a="\nlet this long package float\ngoto private class if short\nwhile protected with debugger case\ncontinue volatile interface\n\ninstanceof super synchronized throw\nextends final throws\ntry import double enum\n\nboolean abstract function\nimplements typeof transient break\ndefault do static void\n\nint new async native switch\nelse delete null public var\nawait byte finally catch\nin return for get const char\nmodule exports require\n".trim().split(/\b/g).map(function(a){return a.trim()}),c="\nArray Object String Number RegExp Null Symbol\nSet WeakSet Map WeakMap\nsetInterval setTimeout\nPromise\nJSON\nInt8Array Uint8Array Uint8ClampedArray\nInt16Array Uint16Array\nInt32Array Uint32Array\nFloat32Array Float64Array\n".trim().split(/\b/g).map(function(a){return a.trim()}),d=["true","false"],e=function(b){if("string"!=typeof b)return b;var e=b.split(/\b/);return b=e.map(function(b,f){if(""!==b){var g="";return"state"===b?g="state":"actions"===b?g="actions":e[f+1]&&e[f+1].includes(":")?g="colon":a.includes(b)?g="keyword":c.includes(b)?g="builtin":d.includes(b)?g="boolean":"."===e[f-1]?g="property":"."===e[f+1]&&(g="object"),g&&(b=L({class:g},b)),b}}),b},f=/([a-zA-Z0-9:+._-]+@[a-zA-Z0-9._-]+)/g,g=function(a){return a.split(f).map(function(a){if(f.test(a)){var b=a.startsWith("mailto:")?a:"mailto:".concat(a),c=a.replace("mailto:","");return Z({class:"email",to:b},c)}return e(a)})},h=function(a,b){return[m(a.substring(0,b)),m(a.substring(b))]},i=function(a){return a.split(/(?= )/).map(function(a){if(!a.includes("://"))return m(a);var b=a.split("://"),c=j(b,2),d=c[0],e=c[1];return d.match(/[a-z]/g)?a:Z({to:a},a)})},k=function(a){return a.includes("://")&&!a.includes("@")?i(a):g(a)},l=function(a){var c=a.replace(/"/g,"'"),d=c.split("'"),f=b(d),g=f[0],h=f[1],i=f.slice(2),j=i;1===j.length?j=m(j[0]):1<j.length&&(j=m(j.join("'")));var l=[];return l="undefined"==typeof h?e(a):[e(g),L({class:"string"},["'",k(h),"'"]),j],l},m=function(a){var b=a.indexOf("//"),c=a.trim();if(c.startsWith("//")){for(var d=a.search(/\S|$/),e="",f=0;f<d;f++)e+=" ";return c.startsWith("// ")||(a="".concat(e,"// ").concat(c.substr(2))),L({class:"comment"},[e,"// ",m(c.substring(3))])}return-1<b&&":"!==a[b-1]?h(a,b):2<a.indexOf("://")?i(a):a.indexOf("@")&&a.includes(".")&&!a.trim().includes(" ")?g(a):l(a)},n=function(a){return t({class:"line"},m(a))};return{format:function format(a){return a.trim().split("\n").map(n)}}}()},ea={changeTheme:function changeTheme(a){return g({},a,{pageClass:g({},a.pageClass,{light:"dark"===a.theme}),theme:"dark"===a.theme?"light":"dark"})},gdpr:{allow:function allow(a){return[g({},a,{gdpr:g({},a.gdpr,{show:!1})}),[da.db.set,{key:"magic-gdpr",value:{allowed:a.cookies.map(function(a){return a.name}),show:!1},action:[ea.gdpr.show,{show:!1}]}]]},close:function close(a){return[g({},a,{gdpr:g({},a.gdpr,{show:!1})}),[da.db.set,{key:"magic-gdpr",value:{allowed:a.gdpr.allowed,show:!1},action:[ea.gdpr.show,{show:!1}]}]]},deny:function deny(a){return[a,[da.db.set,{key:"magic-gdpr",value:{allowed:[],show:!1},action:[ea.gdpr.show,{show:!1}]}]]},load:function load(a){return[a,[da.db.get,{key:"magic-gdpr",action:ea.gdpr.show}]]},show:function(a,b){var c=b.show;return b.value&&"undefined"!=typeof b.value.show&&(c=b.value.show),"undefined"==typeof c?a:g({},a,{gdpr:g({},a.gdpr,{show:c})})},toggleAllow:function toggleAllow(a,b){var d=b.name,e=a.gdpr,f=e.allowed.includes(d);return f?e.allowed=e.allowed.filter(function(a){return a!==d}):e.allowed.push(d),g({},a,{gdpr:e})}},go:function go(a,b){var c=b.currentTarget.href.replace(window.location.origin,""),d=c.split("#"),e=j(d,2),f=e[0],h=e[1],i=void 0===h?"":h;return f===a.url&&i===a.hash?a:(window.history.pushState({url:f,hash:i},"",c),i?window.location.hash=i:window.scroll(0,0),g({},a,{url:f,hash:i,prev:a.url}))},pop:function pop(a,b){var c=window.location,d=c.pathname,e=c.hash;return e=e.substring(1),b.state&&(d=b.state.url,e=b.state.hash),e?window.location.hash=e:window.scroll(0,0),g({},a,{url:d,hash:e})},pre:{clip:function clip(a,b){var c=b.content;if("undefined"!=typeof document&&"function"==typeof document.execCommand){var d=document.createElement("textarea");d.id="copy",d.innerHTML=c,document.body.appendChild(d);var e=document.getElementById("copy");e.select(),document.execCommand("copy"),document.body.removeChild(e)}return a}}},fa={"/test/":function test(a){return[w(a.title),a.description.map(function(a){return J(a)}),V("magic/test"),x({id:"getting-started"},"getting started"),J("be in a nodejs project."),y({id:"getting-started-install"},"install"),ba("npm i --save-dev @magic/test"),ba("\n// create test/functionName.mjs\nimport yourTest from '../path/to/your/file.mjs'\n\nexport default [\n  { fn: () => true, expect: true, info: 'true is true' },\n  // note that the yourTest function will be called automagically\n  { fn: yourTest, expect: true, info: 'hope this will work ;)'}\n]"),y({id:"getting-started-npm-scripts"},"npm run scripts"),J("edit package.json"),ba("\n{\n  \"scripts\": {\n    \"test\": \"t -p\", // quick test, only failing tests log\n    \"coverage\": \"t\", // get full test output and coverage reports\n    \"format\": \"f -w\", // format using prettier and write changes to files\n    \"format:check\": \"f\" // check format using prettier\n  }\n}"),J("repeated for easy copy pasting (without comments)"),ba("\n  \"scripts\": {\n    \"test\": \"t -p\",\n    \"coverage\": \"t\",\n    \"format\": \"f -w\",\n    \"format:check\": \"f\"\n  }"),y({id:"getting-started-quick-tests"},"quick tests (without coverage)"),ba("\n// run the tests:\nnpm test\n\n// example output:\n// (failing tests will print, passing tests are silent)\n\n// ### Testing package: @magic/test\n// Ran 2 tests. Passed 2/2 100%"),y({id:"getting-started-coverage"},"coverage"),J(["@magic/test will automagically generate coverage reports if it is not called with the -p flag."]),y({id:"test-suites"},"data/fs driven test suite creation:"),z("expectations for optimal test messages:"),J("src and test directories have the same structure and files"),J("tests one src file per test file"),J("tests one function per suite"),J("tests one feature per test"),z({id:"test-suites-fs"},"Filesystem based naming"),J("the following directory structure:"),ba("\n./test/\n  ./suite1.mjs\n  ./suite2.mjs"),J("yields the same result as exporting the following from ./test/index.mjs"),z({id:"test-suites-data"},"Data driven naming"),ba("\nimport suite1 from './suite1'\nimport suite2 from './suite2'\n\nexport default {\n  suite1,\n  suite2,\n}"),y("Important - File mappings"),J("if test/index.mjs exists, no other files will be loaded."),J("if test/lib/index.mjs exists, no other files from that subdirectory will be loaded."),y({id:"tests"},"single test, literal value, function or promise"),ba("\nexport default { fn: true, expect: true, info: 'expect true to be true' }\n\n// expect: true is the default and can be omitted\nexport default { fn: true, info: 'expect true to be true' }\n\n// if fn is a function expect is the returned value of the function\nexport default { fn: () => false, expect: false, info: 'expect true to be true' }\n\n// if expect is a function the return value of the test get passed to it\nexport default { fn: false, expect: t => t === false, info: 'expect true to be true' }\n\n// if fn is a promise the resolved value will be returned\nexport default { fn: new Promise(r => r(true)), expect: true, info: 'expect true to be true' }\n\n// if expects is a promise it will resolve before being compared to the fn return value\nexport default { fn: true, expect: new Promise(r => r(true)), info: 'expect true to be true' }\n\n// callback functions can be tested easily too:\nimport { promise } from '@magic/test'\n\nconst fnWithCallback = (err, arg, cb) => cb(err, arg)\n\nexport default { fn: promise(fnWithCallback(null, 'arg', (e, a) => a)), expect: 'arg' }"),z({id:"tests-types"},"testing types"),J(["types can be compared using ",Z({to:"https://github.com/magic/types"},"@magic/types")]),J(["@magic/types is a richly featured and thoroughly tested type library without dependencies."," it is exported from this library for convenience."]),ba("\nimport { is } from '@magic/test'\n\nexport default [\n  { fn: () => 'string',\n    expect: is.string,\n    info: 'test if a function returns a string'\n  },\n  {\n    fn: () => 'string',\n    expect: is.length.equal(6),\n    info: 'test length of returned value'\n  },\n  // !!! Testing for deep equality. simple.\n  {\n    fn: () => [1, 2, 3],\n    expect: is.deep.equal([1, 2, 3]),\n    info: 'deep compare arrays/objects for equality',\n  },\n  {\n    fn: () => { key: 1 },\n    expect: is.deep.different({ value: 1 }),\n    info: 'deep compare arrays/objects for difference',\n  },\n]"),z("caveat:"),J(["if you want to test if a function is a function, you need to wrap the function in a function."," this is because functions passed to fn get executed automatically."]),ba("\nimport { is } from '@magic/test'\n\nconst fnToTest = () => {}\n\n// both the tests will work as expected\nexport default [\n  {\n    fn: () => fnToTest,\n    expect: is.function,\n    info: 'function is a function',\n  },\n  {\n    fn: is.fn(fnToTest), // returns true\n    // we do not set expect: true, since that is the default\n    info: 'function is a function',\n  },\n]"),ba("\n// will not work as expected and instead call fnToTest\nexport default {\n  fn: fnToTest,\n  expect: is.function,\n  info: 'function is a function',\n}"),y({id:"tests-multiple"}," multiple tests"),J("multiple tests can be created by exporting an array of single test objects."),ba("\nexport default {\n  multipleTests: [\n    { fn: () => true, expect: true, info: 'expect true to be true' },\n    { fn: () => false, expect: false, info: 'expect false to be false' },\n  ]\n}"),J("multiple tests can also be created by exporting an array of tests."),ba("\n  export default [\n    { fn: () => true, expect: true, info: 'expect true to be true' },\n    { fn: () => false, expect: false, info: 'expect false to be false' },\n  ]"),y({id:"tests-promises"},"promises"),ba("\nimport { promise, is } from '@magic/test'\n\nexport default [\n  // kinda clumsy, but works. until you try handling errors.\n  {\n    fn: new Promise(cb => setTimeOut(() => cb(true), 2000)),\n    expect: true,\n    info: 'handle promises',\n  },\n  // better!\n  {\n    fn: promise(cb => setTimeOut(() => cb(null, true), 200)),\n    expect: true,\n    info: 'handle promises in a nicer way',\n  },\n  {\n    fn: promise(cb => setTimeOut(() => cb(new Error('error')), 200)),\n    expect: is.error,\n    info: 'handle promise errors in a nice way',\n  },\n]"),y({id:"tests-cb"},"callback functions"),ba("\nimport { promise, is } from '@magic/test'\n\nconst fnWithCallback = (err, arg, cb) => cb(err, arg)\n\nexport default [\n  {\n    fn: promise(cb => fnWithCallback(null, true, cb)),\n    expect: true\n    info: 'handle callback functions as promises',\n  },\n  {\n    fn: promise(cb => fnWithCallback(new Error('oops'), true, cb)),\n    expect: is.error,\n    info: 'handle callback function error as promise',\n  },\n]"),y({id:"tests-hooks"},"run functions before and/or after individual test"),ba("\nconst after = () => {\n  global.testing = 'Test has finished, cleanup.'\n}\n\nconst before = () => {\n  global.testing = false\n\n  // if a function gets returned,\n  // this function will be executed once the test finished.\n  return after\n}\n\nexport default [\n  {\n    fn: () => { global.testing = 'changed in test' },\n    // if before returns a function, it will execute after the test.\n    before,\n    after,\n    expect: () => global.testing === 'changed in test',\n  },\n]"),y({id:"tests-suite-hooks"},"run functions before and/or after a suite of tests"),ba("\nconst afterAll = () => {\n  // Test has finished, cleanup.'\n  global.testing = undefined\n}\n\nconst beforeAll = () => {\n  global.testing = false\n\n  // if a function gets returned,\n  // this function will be executed once the test suite finished.\n  return afterAll\n}\n\nexport default [\n  {\n    fn: () => { global.testing = 'changed in test' },\n    // if beforeAll returns a function, it will execute after the test suite.\n    beforeAll,\n    // this is optional and can be omitted if beforeall returns a function.\n    // in this example, afterAll will trigger twice.\n    afterAll,\n    expect: () => global.testing === 'changed in test',\n  },\n]"),x({id:"lib"},"Utility Belt"),J("@magic/test exports some utility functions that make working with complex test workflows simpler."),z({id:"lib-curry"},"curry"),J("Currying can be used to split the arguments of a function into multiple nested functions."),J(["This helps if you have a function with complicated arguments"," that you just want to quickly shim."]),ba("\nimport { curry } from '@magic/test'\n\nconst compare = (a, b) => a === b\nconst curried = curry(compare)\nconst shimmed = curried('shimmed_value')\n\nexport default {\n  fn: shimmed('shimmed_value'),\n  expect: true,\n  info: 'expect will be called with a and b and a will equal b',\n}\n"),z({id:"lib-vals"},"vals"),J(["exports some javascript types. more to come."," will sometime in the future be the base of a fuzzer."]),y({id:"lib-promises"},"promises"),J("Helper function to wrap nodejs callback functions and promises with ease."),J("Handles the try/catch steps internally and returns a resolved or rejected promise."),ba("\nimport { promise, is } from '@magic/test'\n\nexport default [\n  {\n    fn: promise(cb => setTimeOut(() => cb(null, true), 200)),\n    expect: true,\n    info: 'handle promises in a nice way',\n  },\n  {\n    fn: promise(cb => setTimeOut(() => cb(new Error('error')), 200)),\n    expect: is.error,\n    info: 'handle promise errors in a nice way',\n  },\n]"),y({id:"lib-css"},"css"),J(["exports ",Z({to:"https://github.com/magic/css"},"@magic/css")," which allows parsing and stringification of css-in-js objects."]),z({id:"lib-trycatch"},"tryCatch"),J("allows to test functions without bubbling the errors up into the runtime"),ba("\nimport { is, tryCatch } from '@magic/test'\n\nconst throwing = () => throw new Error('oops')\nconst healthy = () => true\n\nexport default [\n  {\n    fn: tryCatch(throwing()),\n    expect: is.error,\n    info: 'function throws an error',\n  },\n  {\n    fn: tryCatch(healthy()),\n    expect: true,\n    info: 'function does not throw'\n  },\n]"),x({id:"usage"},"Usage"),y({id:"usage-js"},"mjs api:"),ba("\n// test/index.mjs\nimport run from '@magic/test'\n\nconst tests = {\n  lib: [\n    { fn: () => true, expect: true, info: 'Expect true to be true' }\n  ],\n}\n\nrun(tests)"),x({id:"usage-cli"},"cli"),y("package.json (recommended)"),J("Add the magic/test bin scripts to package.json"),ba("\n{\n  \"scripts\": {\n    \"test\": \"t -p\",\n    \"coverage\": \"t\",\n    \"format\": \"f -w\",\n    \"format:check\": \"f\"\n  },\n  \"devDependencies\": {\n    \"@magic/test\": \"github:magic/test\"\n  }\n}"),J("then use the npm run scripts"),ba("\nnpm test\nnpm run coverage\nnpm run format\nnpm run format:check"),y({id:"usage-global"},"Globally (not recommended):"),J(["you can install this library globally"," but the recommendation is to add the dependency and scripts to the package.json file."]),J(["this both explains to everyone that your app has these dependencies"," as well as keeping your bash free of clutter"]),ba("\nnpm i -g magic/test\n\n// run tests in production mode\nt -p\n\n// run tests and get coverage in verbose mode\nt\n\n// check formatting using prettier but do not write\n// prettier --list-different\nf\n\n// format files using prettier\n// prettier --write\nf -w"),J(["This library tests itself, have a look at ",Z({to:"https://github.com/magic/test/tree/master/test"},"the tests")]),J("Checkout [@magic/types](https://github.com/magic/types) and the other magic libraries for more test examples."),x({id:"changelog"},"changelog"),y("0.1.0"),J("use esmodules instead of commonjs."),y("0.1.1"),J("rework of bin scripts and update dependencies to esmodules"),y("0.1.2"),J("cli now works on windows again (actually, this version is broken on all platforms.)"),y("0.1.3"),J("cli now works everywhere"),y("0.1.4"),J("npm run scripts of @magic/test itself can be run on windows."),y("0.1.5"),J("use ecmascript version of @magic/deep"),y("0.1.6"),J("update this readme and html docs."),J("tests should always process.exit(1) if they errored."),y("0.1.7"),J("readded calls npm run script"),J("updated c8"),y("0.1.8"),J("update @magic/cli"),y("0.1.9"),J("test/beforeAll.mjs gets loaded separately if it exists and executed before all tests"),J("test/afterAll.mjs gets loaded separately if it exists and executed after all tests"),J(["if the function exported from test/beforeAll.mjs returns another function,"," this function will be executed after all tests,"," additionally to any functions exported from test/afterAll.mjs."]),J("export hyperapp beta.18"),y("0.1.10"),J("node 12.4.0 does not use --experimental-json-modules flag. removed it in 12.4+."),y("0.1.11"),J("update prettier, coveralls"),J("add @magic/css and export it for css testing"),y("0.1.12"),J("update dependencies"),y("0.1.13"),J("tests now work on windows (again)"),y("0.1.14"),J("tests on windows now support index.mjs files"),y("0.1.15"),J("update dependencies"),y("0.1.16"),J("update @magic/cli for node 13 support."),y("0.1.17"),J("make coverage work in node 13"),y("0.1.18"),J("update dependencies"),J("bump required node version to 12.13.0"),y("0.1.19"),J("update dependencies"),y("0.1.20"),J("update broken depdencies"),y("0.1.21"),J("update @magic/cli to allow default args"),y("0.1.22"),J("update dependencies"),y("0.1.23"),J("use @magic npm packages instead of github"),y("0.1.24 - unreleased"),J("update @magic/css"),Y(a)]},"/test/404/":function test404(){return u("404 - not found")}};h({init:function init(){return ea.gdpr.load(g({},O,{url:window.location.pathname}))},subscriptions:function subscriptions(){return[[P.listenPopState,ea.pop]]},view:function view(a){var b=fa[a.url]?a.url:"/404/",c=fa[b];return a.pages&&a.pages[b]&&Object.keys(a.pages[b]).forEach(function(c){a[c]=a.pages[b][c]}),aa({page:c,state:a})},node:document.getElementById("Magic")});