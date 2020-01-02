"use strict";function b(a){return o(a)||c(a)||m()}function c(a){if(Symbol.iterator in Object(a)||"[object Arguments]"===Object.prototype.toString.call(a))return Array.from(a)}function d(a,b){if(null==a)return{};var c,d,f=e(a,b);if(Object.getOwnPropertySymbols){var g=Object.getOwnPropertySymbols(a);for(d=0;d<g.length;d++)c=g[d],!(0<=b.indexOf(c))&&Object.prototype.propertyIsEnumerable.call(a,c)&&(f[c]=a[c])}return f}function e(a,b){if(null==a)return{};var c,d,e={},f=Object.keys(a);for(d=0;d<f.length;d++)c=f[d],0<=b.indexOf(c)||(e[c]=a[c]);return e}function f(a,b){var c=Object.keys(a);if(Object.getOwnPropertySymbols){var d=Object.getOwnPropertySymbols(a);b&&(d=d.filter(function(b){return Object.getOwnPropertyDescriptor(a,b).enumerable})),c.push.apply(c,d)}return c}function j(a){for(var b,c=1;c<arguments.length;c++)b=null==arguments[c]?{}:arguments[c],c%2?f(Object(b),!0).forEach(function(c){k(a,c,b[c])}):Object.getOwnPropertyDescriptors?Object.defineProperties(a,Object.getOwnPropertyDescriptors(b)):f(Object(b)).forEach(function(c){Object.defineProperty(a,c,Object.getOwnPropertyDescriptor(b,c))});return a}function k(a,b,c){return b in a?Object.defineProperty(a,b,{value:c,enumerable:!0,configurable:!0,writable:!0}):a[b]=c,a}function l(a,b){return o(a)||n(a,b)||m()}function m(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}function n(a,b){if(Symbol.iterator in Object(a)||"[object Arguments]"===Object.prototype.toString.call(a)){var c=[],d=!0,e=!1,f=void 0;try{for(var g,h=a[Symbol.iterator]();!(d=(g=h.next()).done)&&(c.push(g.value),!(b&&c.length===b));d=!0);}catch(a){e=!0,f=a}finally{try{d||null==h["return"]||h["return"]()}finally{if(e)throw f}}return c}}function o(a){if(Array.isArray(a))return a}function q(a){return q="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&"function"==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a},q(a)}var r=function(){var a=2,b=3,c={},d=[],e=d.map,f=Array.isArray,g="undefined"==typeof requestAnimationFrame?setTimeout:requestAnimationFrame,h=function(a){var b="";if("string"==typeof a)return a;if(f(a)&&0<a.length)for(var c,d=0;d<a.length;d++)""!==(c=h(a[d]))&&(b+=(b&&" ")+c);else for(var d in a)a[d]&&(b+=(b&&" ")+d);return b},j=function(c,a){var b={};for(var d in c)b[d]=c[d];for(var d in a)b[d]=a[d];return b},k=function(a){return a.reduce(function(a,b){return a.concat(b&&!0!==b?"function"==typeof b[0]?[b]:k(b):0)},d)},l=function(c,a){return f(c)&&f(a)&&c[0]===a[0]&&"function"==typeof c[0]},m=function(c,a){if(c!==a)for(var b in j(c,a)){if(c[b]!==a[b]&&!l(c[b],a[b]))return!0;a[b]=c[b]}},n=function(a,b,c){for(var d,e,f=0,g=[];f<a.length||f<b.length;f++)d=a[f],e=b[f],g.push(e?!d||e[0]!==d[0]||m(e[1],d[1])?[e[0],e[1],e[0](c,e[1]),d&&d[2]()]:d:d&&d[2]());return g},o=function(a,b,c,d,e,f){if("key"===b);else if("style"===b)for(var g in j(c,d))c=null==d||null==d[g]?"":d[g],"-"===g[0]?a[b].setProperty(g,c):a[b][g]=c;else"o"===b[0]&&"n"===b[1]?((a.actions||(a.actions={}))[b=b.slice(2).toLowerCase()]=d)?!c&&a.addEventListener(b,e):a.removeEventListener(b,e):!f&&"list"!==b&&b in a?a[b]=null==d?"":d:null!=d&&!1!==d&&("class"!==b||(d=h(d)))?a.setAttribute(b,d):a.removeAttribute(b)},p=function(a,c,d){var e=a.props,f=a.type===b?document.createTextNode(a.name):(d=d||"svg"===a.name)?document.createElementNS("http://www.w3.org/2000/svg",a.name,{is:e.is}):document.createElement(a.name,{is:e.is});for(var g in e)o(f,g,null,e[g],c,d);for(var h=0,j=a.children.length;h<j;h++)f.appendChild(p(a.children[h]=v(a.children[h]),c,d));return a.node=f},r=function(a){return null==a?null:a.key},s=function(a,c,d,e,f,g){if(d===e);else if(null!=d&&d.type===b&&e.type===b)d.name!==e.name&&(c.nodeValue=e.name);else if(null==d||d.name!==e.name)c=a.insertBefore(p(e=v(e),f,g),c),null!=d&&a.removeChild(d.node);else{var h,k,l,m,n=d.props,q=e.props,t=d.children,u=e.children,w=0,x=0,y=t.length-1,z=u.length-1;for(var A in g=g||"svg"===e.name,j(n,q))("value"===A||"selected"===A||"checked"===A?c[A]:n[A])!==q[A]&&o(c,A,n[A],q[A],f,g);for(;x<=z&&w<=y&&null!=(l=r(t[w]))&&l===r(u[x]);)s(c,t[w].node,t[w],u[x]=v(u[x++],t[w++]),f,g);for(;x<=z&&w<=y&&null!=(l=r(t[y]))&&l===r(u[z]);)s(c,t[y].node,t[y],u[z]=v(u[z--],t[y--]),f,g);if(w>y)for(;x<=z;)c.insertBefore(p(u[x]=v(u[x++]),f,g),(k=t[w])&&k.node);else if(x>z)for(;w<=y;)c.removeChild(t[w++].node);else{for(var A=w,B={},C={};A<=y;A++)null!=(l=t[A].key)&&(B[l]=t[A]);for(;x<=z;){if(l=r(k=t[w]),m=r(u[x]=v(u[x],k)),C[l]||null!=m&&m===r(t[w+1])){null==l&&c.removeChild(k.node),w++;continue}null==m||1===d.type?(null==l&&(s(c,k&&k.node,k,u[x],f,g),x++),w++):(l===m?(s(c,k.node,k,u[x],f,g),C[m]=!0,w++):null==(h=B[m])?s(c,k&&k.node,null,u[x],f,g):(s(c,c.insertBefore(h.node,k&&k.node),h,u[x],f,g),C[m]=!0),x++)}for(;w<=y;)null==r(k=t[w++])&&c.removeChild(k.node);for(var A in B)null==C[A]&&c.removeChild(B[A].node)}}return e.node=c},t=function(c,a){for(var b in c)if(c[b]!==a[b])return!0;for(var b in a)if(c[b]!==a[b])return!0},u=function(a){return"object"===q(a)?a:x(a)},v=function(b,c){return b.type===a?((!c||c.type!==a||t(c.lazy,b.lazy))&&((c=u(b.lazy.view(b.lazy))).lazy=b.lazy),c):b},w=function(a,b,c,d,e,f){return{name:a,props:b,children:c,node:d,type:f,key:e}},x=function(a,e){return w(a,c,d,e,void 0,b)},y=function(a){return a.nodeType===b?x(a.nodeValue,a):w(a.nodeName.toLowerCase(),c,e.call(a.childNodes,y),a,void 0,1)};return{h:function h(a,b){for(var d,e=[],g=[],h=arguments.length;2<h--;)e.push(arguments[h]);for(;0<e.length;)if(f(d=e.pop()))for(var h=d.length;0<h--;)e.push(d[h]);else if(!1===d||!0===d||null==d);else g.push(u(d));return b=b||c,"function"==typeof a?a(b,g):w(a,b,g,void 0,b.key)},app:function app(a){var b={},c=!1,d=a.view,e=a.node,h=e&&y(e),i=a.subscriptions,j=[],l=function(a){o(this.actions[a.type],a)},m=function(a){return b!==a&&(b=a,i&&(j=n(j,k([i(b)]),o)),d&&!c&&g(p,c=!0)),b},o=(a.middleware||function(a){return a})(function(a,c){return"function"==typeof a?o(a(b,c)):f(a)?"function"==typeof a[0]||f(a[0])?o(a[0],"function"==typeof a[1]?a[1](c):a[1]):(k(a.slice(1)).map(function(a){a&&a[0](o,a[1])},m(a[0])),b):m(a)}),p=function(){c=!1,e=s(e.parentNode,e,h,h=u(d(b)),l)};o(a.init)}}}(),s=r.h,h=r.app,i=function(a){return function(){var b=0<arguments.length&&arguments[0]!==void 0?arguments[0]:{},d=!!(1<arguments.length&&arguments[1]!==void 0)&&arguments[1],e=function(a){for(var b=arguments.length,c=Array(1<b?b-1:0),d=1;d<b;d++)c[d-1]=arguments[d];return c.some(function(b){return b===q(a)})};if(!d)if(e(b,"string","number","function")||Array.isArray(b))d=b,b={};else if(e(b.View,"function"))d=b.View,b={};else if(b.props||b.c)return s(a,{},b);return s(a,b,d)}},t=i("a"),a=i("button"),u=i("circle"),v=i("code"),w=i("div"),x=i("footer"),y=i("g"),g=i("h1"),z=i("h2"),A=i("h3"),B=i("h4"),C=i("h5"),D=i("header"),E=i("img"),F=i("input"),G=i("label"),H=i("li"),I=i("link"),J=i("main"),K=i("meta"),L=i("nav"),M=i("p"),p=i("path"),N=i("pre"),O=i("script"),P=i("span"),Q=i("svg"),R=i("title"),S=i("ul"),T=i("view"),U={description:["simple tests with lots of utility. ecmascript modules only.","runs ecmascript module tests without transpilation.","unbelievably fast."],gdpr:{allowed:[],show:!0},logotext:"@magic/test",menu:[{items:[{text:"install",to:"-install"},{text:"npm scripts",to:"-npm-scripts"},{text:"quick tests",to:"-quick-tests"},{text:"coverage",to:"-coverage"}],text:"getting started",to:"/#getting-started"},{items:[{text:"fs based test suites",to:"-fs"},{text:"data based test suites",to:"-data"}],text:"test suites",to:"/#test-suites"},{items:[{text:"testing types",to:"-types"},{text:"multiple tests in one file",to:"-multiple"},{text:"promises",to:"-promises"},{text:"callback functions",to:"-cb"},{text:"run function before / after individual tests",to:"-hooks"},{text:"run function before / after suite of tests",to:"-suite-hooks"}],text:"writing tests",to:"/#tests"},{items:[{text:"curry",to:"-curry"},{text:"vals",to:"-vals"},{text:"tryCatch",to:"-trycatch"},{text:"promises",to:"-promises"}],text:"utility functions",to:"/#lib"},{items:[{text:"js api",to:"-js"},{text:"cli",to:"-cli"},{text:"npm i -g",to:"-global"}],text:"usage",to:"/#usage"},{text:"changelog",to:"/#changelog"}],pageClass:{},root:"/test/",theme:"dark",title:"@magic/test",url:"/test/"},V={listenPopState:function listenPopState(a,b){var c=function(c){return a(b,c)};return addEventListener("popstate",c),function(){return removeEventListener("popstate",c)}}},W=function(a){var b,c=a.blog,d=a.link,e=a.month,f=a.url,g=a.year,h=Object.entries(c[g][e]),i=[e];return d?b="".concat(d).concat(e,"/"):i.push(" - ",g),[A(b?da({to:b},i):i),h.map(function(c){var d=l(c,2),e=d[0],f=d[1];return f.map(function(c){return X(j({},a,{},c.state,{name:c.name,link:b,day:e}))})})]},X=function(a){return w([B([a.day,"-",a.month,"-",a.year," - ",da({to:a.name},a.title)]),M(a.description)])},Y=function(a){var b,c=a.link,d=a.year,e=a.blog,f=a.url;return c?b="".concat(c).concat(d,"/"):f.endsWith("".concat(d,"/"))&&(b=f),w([z(c?da({to:b},d):d),Object.entries(e[d]).map(function(c){var d=l(c,2),e=d[0],f=d[1];return W(j({},a,{month:e,days:f,link:b}))})])},Z=function(){var a=1<arguments.length&&arguments[1]!==void 0?arguments[1]:[];return x({class:"Footer"},[w({class:"Container"},[a,w({class:"Credits"},["made with a few bits of ",da({to:"https://github.com/magic/core",target:"_blank",rel:"noopener"},"magic")])])])},$=function(a){var b=a.gdpr,c=void 0===b?{}:b,d=a.cookies,e=void 0===d?[]:d,f=c.show,g=c.title,h=void 0===g?"Privacy Information":g,i=c.content,j=void 0===i?"This app neither saves, collects, nor shares any data about you.":i,k=c.noDataText,l=void 0===k?"Awesome.":k,m=c.allowTitle,n=void 0===m?"Allow:":m,o=c.allowAllText,q=void 0===o?"all":o,r=c.allowText,s=void 0===r?"selected":r,t=c.denyText,v=void 0===t?"none":t;if(!f)return w({class:"Gdpr"},Q({class:"ShowHide",onclick:[ka.gdpr.show,{show:!0}],viewBox:"0 0 512 512"},[y([p({d:"\nM507.44,208.64c-1.296-6.88-6.88-12.096-13.824-12.928c-6.96-0.832-13.6,2.928-16.48,9.312\nc-5.072,11.2-16.208,18.992-29.12,18.976c-14.32,0.032-26.416-9.632-30.448-22.896c-2.432-8.096-10.752-12.896-18.976-10.976\nC393.536,191.312,388.752,192,384,192c-35.248-0.064-63.936-28.752-64-64c0-4.752,0.688-9.536,1.872-14.576\nc1.936-8.224-2.88-16.56-10.976-18.992C297.632,90.416,287.968,78.32,288,64c-0.016-12.928,7.776-24.048,18.976-29.12\nc6.384-2.88,10.144-9.536,9.312-16.48c-0.832-6.96-6.048-12.544-12.928-13.84C288.096,1.696,272.288,0,256,0\nC114.784,0.032,0.032,114.784,0,256c0.032,141.216,114.784,255.968,256,256c141.216-0.032,255.968-114.784,256-256\nC512,239.712,510.304,223.904,507.44,208.64z M414.32,414.32C373.696,454.912,317.792,480,256,480s-117.696-25.088-158.32-65.68\nC57.088,373.696,32,317.792,32,256S57.088,138.304,97.68,97.68C138.304,57.088,194.208,32,256,32c2.88,0,5.696,0.304,8.56,0.432\nC259.216,41.744,256.016,52.464,256,64c0.032,23.888,13.28,44.368,32.592,55.296C288.288,122.144,288,124.992,288,128\nc0.032,52.976,43.024,95.968,96,96c3.008,0,5.856-0.288,8.704-0.592C403.632,242.704,424.096,255.968,448,256\nc11.536-0.016,22.256-3.216,31.568-8.56c0.128,2.848,0.432,5.68,0.432,8.56C480,317.792,454.912,373.696,414.32,414.32z\n"}),u({cx:"192",cy:"128",r:"32"}),u({cx:"128",cy:"256",r:"32"}),u({cx:"288",cy:"384",r:"32"}),u({cx:"272",cy:"272",r:"16"}),u({cx:"400",cy:"336",r:"16"}),u({cx:"176",cy:"368",r:"16"})])]));var x=!!e.length;return w({class:"Gdpr"},[F({type:"checkbox",name:"show-hide",id:"show-hide",checked:!f}),w({class:"Container"},[h&&A(h),j&&M(j),x&&[S(e.map(function(a){var b=a.name,d=a.title,e=a.content,f=a.allowed;return H({class:"Cookie"},[F({type:"checkbox",title:"allow ".concat(b," data"),id:b,checked:c.allowed.includes(b),onchange:[ka.gdpr.toggleAllow,{name:b}]}),(d||e)&&G({for:b},[d&&B(d),e&&M(e)])])}))],x?[C(n),G({class:"button allow all",for:"show-hide",onclick:ka.gdpr.allow},q),G({class:"button allow",for:"show-hide",onclick:ka.gdpr.close},s),G({class:"button allow none",for:"show-hide",onclick:ka.gdpr.deny},v)]:G({class:"button",for:"show-hide",onclick:ka.gdpr.close},l)])])},_=function(a){if("string"==typeof a)a={project:a};else if(!a.project)return;var b=a,c=b.project,d=void 0!==c&&c,e=b.branch,f=void 0===e?"master":e,g=b.host,h=void 0===g?"github":g,i=[["npm",function(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:d;return a&&{to:"https://www.npmjs.com/package/@".concat(a),src:"https://img.shields.io/npm/v/@".concat(a,".svg")}}],["travis",function(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:d;return a&&{to:"https://travis-ci.com/".concat(a),src:"https://img.shields.io/travis/com/".concat(a,"/").concat(f)}}],["appveyor",function(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:d;if(a){var b=a.split("/"),c=l(b,2),e=c[0],g=c[1];return e=e.replace(/-/g,""),{to:"https://ci.appveyor.com/project/".concat(e,"/").concat(g,"/branch/").concat(f),src:"https://img.shields.io/appveyor/ci/".concat(e,"/").concat(g,"/").concat(f,".svg")}}}],["coveralls",function(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:d;return{to:"https://coveralls.io/".concat(h,"/").concat(a),src:"https://img.shields.io/coveralls/".concat(h,"/").concat(a,"/").concat(f,".svg")}}],["greenkeeper",function(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:d;return a&&{to:"https://greenkeeper.io",src:"https://badges.greenkeeper.io/".concat(a,".svg")}}],["snyk",function(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:d;return a&&{to:"https://snyk.io/test/".concat(h,"/").concat(a),src:"https://img.shields.io/snyk/vulnerabilities/github/".concat(a,".svg")}}]].map(function(b){var c=l(b,2),d=c[0],e=c[1];return e(a[d])}).filter(function(b){return b.to&&b.src});return i.length?S({class:"GitBadges"},i.map(function(a){var b=a.to,c=a.src;return H([da({to:b},ba({src:c}))])})):void 0},aa=function(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:{},b=1<arguments.length&&arguments[1]!==void 0?arguments[1]:[],c=a.logo,e=a.menu,f=a.logotext,g=d(a,["logo","menu","logotext"]);return c||e||f?D({class:"Header"},[(c||f)&&da({to:g.root,class:"Logo"},[c&&ba(c),f&&P(f)]),e&&ea({state:g,items:e}),b]):void 0},ba=function(a){if("string"==typeof a&&(a={src:a}),!!a.src)return a.alt||(a.title?a.alt=a.title:(a.role="presentation",a.alt="")),E(a)},ca=function(){0<arguments.length&&arguments[0]!==void 0?arguments[0]:{};return a({class:"LightSwitch",onclick:ka.changeTheme})},da=function(a,b){var c=a.to,e=d(a,["to"]),f=e.href,g=e.text,h=e.nofollow,i=e.noreferrer,j=d(e,["href","text","nofollow","noreferrer"]);c=c||f||"",j.href=c;var k="/"===c[0]||"#"===c[0];return k?j.onclick=[ka.go,ja.preventDefault]:(j.target="_blank",j.rel="noopener",h&&(j.rel+=" nofollow"),i&&(j.rel+=" noreferrer")),t(j,[g,b])},ea=function(){var a=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{},b=a["class"],c=void 0===b?"Menu":b,d=a.collapse,e=a.items,f=a.state,g=f.url,h=f.hash,i=f.root;return h&&!g.endsWith(h)&&(g+="#".concat(h)),L({className:c},S(e.map(function(a){return fa(j({},a,{url:g,root:i,collapse:void 0===d||d}))})))},fa=function(a){var b=a.text,c=a.items,e=void 0===c?[]:c,f=a.url,g=a.root,h=a.parentTo,i=void 0===h?void 0:h,k=a.collapse,l=d(a,["text","items","url","root","parentTo","collapse"]),m={class:{}},n=l.to;n.startsWith("/#")&&(n=n.substr(1));var o=l.to[0],p="/"===o||"-"===o||"#"===o;if(i&&p)if("-"===o||"#"===o)n=i+n;else{var t=n.split("/")[1];if(t){var u=i.endsWith("/".concat(t,"/"));!u&&p&&(n=i+n)}}var q=n.startsWith(g);g&&p&&!q&&(n=g+n),l.to=n.replace(/\/\//g,"/"),l.to===f&&(m["class"].active=!0);var r=[],s=f.startsWith(l.to)||!k;return s&&(r=S(e.map(function(a){return fa(j({parentTo:l.to,url:f,root:g,collapse:k},a))}))),H(m,[l.to?da(l,b):P(l,b),r])},ga=function(a,b){var c=a.page,d=a.state;c=c?c(d):"404 - not found";var e={id:"Magic",class:d.pageClass};return J(e,w({class:{Wrapper:!0}},[ia({state:d,page:c}),b]))},ha=function(b,c){"string"==typeof b?b={content:b}:c&&(b=j({content:c},b));var d=b,f=d.content,g=d.lines;return w({class:{Pre:!0,lines:!(void 0!==g)||g}},[w({class:"menu"},[a({onclick:[ka.pre.clip,function(a){return{e:a,content:f}}]},"copy")]),N(ja.pre.format(f))])},ia=function(a){var b=a.page,c=a.state;return[aa(c),w({class:"Page",id:"page"},b),Z(c)]},ja={db:function(){return{set:function set(a,b){var c=b.action,d=b.key,e=b.value,f=ja.db.init(),g=ja.json.stringify(e);return"Error"==typeof g?void a(c,new Error("db:write ".concat(d))):void(f[d]=g,a(c,{key:d,value:e}))},get:function get(a,b){var c=b.action,d=b.key,e=ja.db.init(),f=void 0;return d&&e[d]&&(f=ja.json.parse(e[d]),"Error"==typeof res)?void a(c,new Error("db:read ".concat(d))):void a(c,{key:d,value:f})},del:function del(a,b){var c=b.action,d=b.key,e=ja.db.init();d&&e[d]&&e.removeItem(d),a(c,{key:d,value:void 0})},init:function init(){return"undefined"!=typeof window&&window.localStorage||{}}}}(),json:function(){var a=function(a){return function(){try{return a.apply(void 0,arguments)}catch(a){return a}}},b=a(JSON.parse),c=a(JSON.stringify);return{parse:b,stringify:c}}(),pre:function(){var a="\nlet this long package float\ngoto private class if short\nwhile protected with debugger case\ncontinue volatile interface\n\ninstanceof super synchronized throw\nextends final throws\ntry import double enum\n\nboolean abstract function\nimplements typeof transient break\ndefault do static void\n\nint new async native switch\nelse delete null public var\nawait byte finally catch\nin return for get const char\nmodule exports require\n".trim().split(/\b/g).map(function(a){return a.trim()}),c="\nArray Object String Number RegExp Null Symbol\nSet WeakSet Map WeakMap\nsetInterval setTimeout\nPromise\nJSON\nInt8Array Uint8Array Uint8ClampedArray\nInt16Array Uint16Array\nInt32Array Uint32Array\nFloat32Array Float64Array\n".trim().split(/\b/g).map(function(a){return a.trim()}),d=["true","false"],e=function(b){if("string"!=typeof b)return b;var e=b.split(/\b/);return b=e.map(function(b,f){if(""!==b){var g="";return"state"===b?g="state":"actions"===b?g="actions":e[f+1]&&e[f+1].includes(":")?g="colon":a.includes(b)?g="keyword":c.includes(b)?g="builtin":d.includes(b)?g="boolean":"."===e[f-1]?g="property":"."===e[f+1]&&(g="object"),g&&(b=P({class:g},b)),b}}),b},f=/([a-zA-Z0-9:+._-]+@[a-zA-Z0-9._-]+)/g,g=function(a){return a.split(f).map(function(a){if(f.test(a)){var b=a.startsWith("mailto:")?a:"mailto:".concat(a),c=a.replace("mailto:","");return da({class:"email",to:b},c)}return e(a)})},h=function(a,b){return[m(a.substring(0,b)),m(a.substring(b))]},i=function(a){return a.split(/(?= )/).map(function(a){if(!a.includes("://"))return m(a);var b=a.split("://"),c=l(b,2),d=c[0],e=c[1];return d.match(/[a-z]/g)?a:da({to:a},a)})},j=function(a){return a.includes("://")&&!a.includes("@")?i(a):g(a)},k=function(a){var c=a.replace(/"/g,"'"),d=c.split("'"),f=b(d),g=f[0],h=f[1],i=f.slice(2),k=i;1===k.length?k=m(k[0]):1<k.length&&(k=m(k.join("'")));var l=[];return l="undefined"==typeof h?e(a):[e(g),P({class:"string"},["'",j(h),"'"]),k],l},m=function(a){var b=a.indexOf("//"),c=a.trim();if(c.startsWith("//")){for(var d=a.search(/\S|$/),e="",f=0;f<d;f++)e+=" ";return c.startsWith("// ")||(a="".concat(e,"// ").concat(c.substr(2))),P({class:"comment"},[e,"// ",m(c.substring(3))])}return-1<b&&":"!==a[b-1]?h(a,b):2<a.indexOf("://")?i(a):a.indexOf("@")&&a.includes(".")&&!a.trim().includes(" ")?g(a):k(a)},n=function(a){return v({class:"line"},m(a))};return{format:function format(a){return a.trim().split("\n").map(n)}}}(),preventDefault:function(){return function preventDefault(a){return a.preventDefault(),a}}()},ka={changeTheme:function changeTheme(a){return j({},a,{pageClass:j({},a.pageClass,{light:"dark"===a.theme}),theme:"dark"===a.theme?"light":"dark"})},gdpr:{allow:function allow(a){return[j({},a,{gdpr:j({},a.gdpr,{allowed:a.cookies.map(function(a){return a.name}),show:!1})}),[ja.db.set,{key:"magic-gdpr",value:{allowed:a.cookies.map(function(a){return a.name}),show:!1},action:[ka.gdpr.show,{show:!1}]}]]},close:function close(a){return[j({},a,{gdpr:j({},a.gdpr,{show:!1})}),[ja.db.set,{key:"magic-gdpr",value:{allowed:a.gdpr.allowed,show:!1},action:[ka.gdpr.show,{show:!1}]}]]},deny:function deny(a){return[j({},a,{gdpr:j({},a.gdpr,{allowed:[]})}),[ja.db.set,{key:"magic-gdpr",value:{allowed:[],show:!1},action:[ka.gdpr.show,{show:!1}]}]]},show:function(a,b){var c=b.show;return b.value&&"undefined"!=typeof b.value.show&&(c=b.value.show),"undefined"==typeof c?a:j({},a,{gdpr:j({},a.gdpr,{show:c})})},toggleAllow:function toggleAllow(a,b){var d=b.name,e=a.gdpr,f=e.allowed.includes(d);return f?e.allowed=e.allowed.filter(function(a){return a!==d}):e.allowed.push(d),j({},a,{gdpr:e})}},go:function go(a,b){var c=b.currentTarget.href.replace(window.location.origin,""),d=c.split("#"),e=l(d,2),f=e[0],g=e[1],h=void 0===g?"":g;return f===a.url&&h===a.hash?a:(window.history.pushState({url:f,hash:h},"",c),h?window.location.hash=h:window.scroll(0,0),j({},a,{url:f,hash:h,prev:a.url}))},pop:function pop(a,b){var c=window.location,d=c.pathname,e=c.hash;return e=e.substring(1),b.state&&(d=b.state.url,e=b.state.hash),e?window.location.hash=e:window.scroll(0,0),j({},a,{url:d,hash:e})},pre:{clip:function clip(a,b){var c=b.content;if("undefined"!=typeof document&&"function"==typeof document.execCommand){var d=document.createElement("textarea");d.id="copy",d.innerHTML=c,document.body.appendChild(d);var e=document.getElementById("copy");e.select(),document.execCommand("copy"),document.body.removeChild(e)}return a}}},la={"/test/":function test(a){return[g(a.title),a.description.map(function(a){return M(a)}),_("magic/test"),z({id:"getting-started"},"getting started"),M("be in a nodejs project."),A({id:"getting-started-install"},"install"),ha("npm i --save-dev @magic/test"),ha("\n// create test/functionName.mjs\nimport yourTest from '../path/to/your/file.mjs'\n\nexport default [\n  { fn: () => true, expect: true, info: 'true is true' },\n  // note that the yourTest function will be called automagically\n  { fn: yourTest, expect: true, info: 'hope this will work ;)'}\n]"),A({id:"getting-started-npm-scripts"},"npm run scripts"),M("edit package.json"),ha("\n{\n  \"scripts\": {\n    \"test\": \"t -p\", // quick test, only failing tests log\n    \"coverage\": \"t\", // get full test output and coverage reports\n    \"format\": \"f -w\", // format using prettier and write changes to files\n    \"format:check\": \"f\" // check format using prettier\n  }\n}"),M("repeated for easy copy pasting (without comments)"),ha("\n  \"scripts\": {\n    \"test\": \"t -p\",\n    \"coverage\": \"t\",\n    \"format\": \"f -w\",\n    \"format:check\": \"f\"\n  }"),A({id:"getting-started-quick-tests"},"quick tests (without coverage)"),ha("\n// run the tests:\nnpm test\n\n// example output:\n// (failing tests will print, passing tests are silent)\n\n// ### Testing package: @magic/test\n// Ran 2 tests. Passed 2/2 100%"),A({id:"getting-started-coverage"},"coverage"),M(["@magic/test will automagically generate coverage reports if it is not called with the -p flag."]),A({id:"test-suites"},"data/fs driven test suite creation:"),B("expectations for optimal test messages:"),M("src and test directories have the same structure and files"),M("tests one src file per test file"),M("tests one function per suite"),M("tests one feature per test"),B({id:"test-suites-fs"},"Filesystem based naming"),M("the following directory structure:"),ha("\n./test/\n  ./suite1.mjs\n  ./suite2.mjs"),M("yields the same result as exporting the following from ./test/index.mjs"),B({id:"test-suites-data"},"Data driven naming"),ha("\nimport suite1 from './suite1'\nimport suite2 from './suite2'\n\nexport default {\n  suite1,\n  suite2,\n}"),A("Important - File mappings"),M("if test/index.mjs exists, no other files will be loaded."),M("if test/lib/index.mjs exists, no other files from that subdirectory will be loaded."),A({id:"tests"},"single test, literal value, function or promise"),ha("\nexport default { fn: true, expect: true, info: 'expect true to be true' }\n\n// expect: true is the default and can be omitted\nexport default { fn: true, info: 'expect true to be true' }\n\n// if fn is a function expect is the returned value of the function\nexport default { fn: () => false, expect: false, info: 'expect true to be true' }\n\n// if expect is a function the return value of the test get passed to it\nexport default { fn: false, expect: t => t === false, info: 'expect true to be true' }\n\n// if fn is a promise the resolved value will be returned\nexport default { fn: new Promise(r => r(true)), expect: true, info: 'expect true to be true' }\n\n// if expects is a promise it will resolve before being compared to the fn return value\nexport default { fn: true, expect: new Promise(r => r(true)), info: 'expect true to be true' }\n\n// callback functions can be tested easily too:\nimport { promise } from '@magic/test'\n\nconst fnWithCallback = (err, arg, cb) => cb(err, arg)\n\nexport default { fn: promise(fnWithCallback(null, 'arg', (e, a) => a)), expect: 'arg' }"),B({id:"tests-types"},"testing types"),M(["types can be compared using ",da({to:"https://github.com/magic/types"},"@magic/types")]),M(["@magic/types is a richly featured and thoroughly tested type library without dependencies."," it is exported from this library for convenience."]),ha("\nimport { is } from '@magic/test'\n\nexport default [\n  { fn: () => 'string',\n    expect: is.string,\n    info: 'test if a function returns a string'\n  },\n  {\n    fn: () => 'string',\n    expect: is.length.equal(6),\n    info: 'test length of returned value'\n  },\n  // !!! Testing for deep equality. simple.\n  {\n    fn: () => [1, 2, 3],\n    expect: is.deep.equal([1, 2, 3]),\n    info: 'deep compare arrays/objects for equality',\n  },\n  {\n    fn: () => { key: 1 },\n    expect: is.deep.different({ value: 1 }),\n    info: 'deep compare arrays/objects for difference',\n  },\n]"),B("caveat:"),M(["if you want to test if a function is a function, you need to wrap the function in a function."," this is because functions passed to fn get executed automatically."]),ha("\nimport { is } from '@magic/test'\n\nconst fnToTest = () => {}\n\n// both the tests will work as expected\nexport default [\n  {\n    fn: () => fnToTest,\n    expect: is.function,\n    info: 'function is a function',\n  },\n  {\n    fn: is.fn(fnToTest), // returns true\n    // we do not set expect: true, since that is the default\n    info: 'function is a function',\n  },\n]"),ha("\n// will not work as expected and instead call fnToTest\nexport default {\n  fn: fnToTest,\n  expect: is.function,\n  info: 'function is a function',\n}"),A({id:"tests-multiple"}," multiple tests"),M("multiple tests can be created by exporting an array of single test objects."),ha("\nexport default {\n  multipleTests: [\n    { fn: () => true, expect: true, info: 'expect true to be true' },\n    { fn: () => false, expect: false, info: 'expect false to be false' },\n  ]\n}"),M("multiple tests can also be created by exporting an array of tests."),ha("\n  export default [\n    { fn: () => true, expect: true, info: 'expect true to be true' },\n    { fn: () => false, expect: false, info: 'expect false to be false' },\n  ]"),A({id:"tests-promises"},"promises"),ha("\nimport { promise, is } from '@magic/test'\n\nexport default [\n  // kinda clumsy, but works. until you try handling errors.\n  {\n    fn: new Promise(cb => setTimeOut(() => cb(true), 2000)),\n    expect: true,\n    info: 'handle promises',\n  },\n  // better!\n  {\n    fn: promise(cb => setTimeOut(() => cb(null, true), 200)),\n    expect: true,\n    info: 'handle promises in a nicer way',\n  },\n  {\n    fn: promise(cb => setTimeOut(() => cb(new Error('error')), 200)),\n    expect: is.error,\n    info: 'handle promise errors in a nice way',\n  },\n]"),A({id:"tests-cb"},"callback functions"),ha("\nimport { promise, is } from '@magic/test'\n\nconst fnWithCallback = (err, arg, cb) => cb(err, arg)\n\nexport default [\n  {\n    fn: promise(cb => fnWithCallback(null, true, cb)),\n    expect: true\n    info: 'handle callback functions as promises',\n  },\n  {\n    fn: promise(cb => fnWithCallback(new Error('oops'), true, cb)),\n    expect: is.error,\n    info: 'handle callback function error as promise',\n  },\n]"),A({id:"tests-hooks"},"run functions before and/or after individual test"),ha("\nconst after = () => {\n  global.testing = 'Test has finished, cleanup.'\n}\n\nconst before = () => {\n  global.testing = false\n\n  // if a function gets returned,\n  // this function will be executed once the test finished.\n  return after\n}\n\nexport default [\n  {\n    fn: () => { global.testing = 'changed in test' },\n    // if before returns a function, it will execute after the test.\n    before,\n    after,\n    expect: () => global.testing === 'changed in test',\n  },\n]"),A({id:"tests-suite-hooks"},"run functions before and/or after a suite of tests"),ha("\nconst afterAll = () => {\n  // Test has finished, cleanup.'\n  global.testing = undefined\n}\n\nconst beforeAll = () => {\n  global.testing = false\n\n  // if a function gets returned,\n  // this function will be executed once the test suite finished.\n  return afterAll\n}\n\nexport default [\n  {\n    fn: () => { global.testing = 'changed in test' },\n    // if beforeAll returns a function, it will execute after the test suite.\n    beforeAll,\n    // this is optional and can be omitted if beforeall returns a function.\n    // in this example, afterAll will trigger twice.\n    afterAll,\n    expect: () => global.testing === 'changed in test',\n  },\n]"),z({id:"lib"},"Utility Belt"),M("@magic/test exports some utility functions that make working with complex test workflows simpler."),B({id:"lib-curry"},"curry"),M("Currying can be used to split the arguments of a function into multiple nested functions."),M(["This helps if you have a function with complicated arguments"," that you just want to quickly shim."]),ha("\nimport { curry } from '@magic/test'\n\nconst compare = (a, b) => a === b\nconst curried = curry(compare)\nconst shimmed = curried('shimmed_value')\n\nexport default {\n  fn: shimmed('shimmed_value'),\n  expect: true,\n  info: 'expect will be called with a and b and a will equal b',\n}\n"),B({id:"lib-vals"},"vals"),M(["exports some javascript types. more to come."," will sometime in the future be the base of a fuzzer."]),A({id:"lib-promises"},"promises"),M("Helper function to wrap nodejs callback functions and promises with ease."),M("Handles the try/catch steps internally and returns a resolved or rejected promise."),ha("\nimport { promise, is } from '@magic/test'\n\nexport default [\n  {\n    fn: promise(cb => setTimeOut(() => cb(null, true), 200)),\n    expect: true,\n    info: 'handle promises in a nice way',\n  },\n  {\n    fn: promise(cb => setTimeOut(() => cb(new Error('error')), 200)),\n    expect: is.error,\n    info: 'handle promise errors in a nice way',\n  },\n]"),A({id:"lib-css"},"css"),M(["exports ",da({to:"https://github.com/magic/css"},"@magic/css")," which allows parsing and stringification of css-in-js objects."]),B({id:"lib-trycatch"},"tryCatch"),M("allows to test functions without bubbling the errors up into the runtime"),ha("\nimport { is, tryCatch } from '@magic/test'\n\nconst throwing = () => throw new Error('oops')\nconst healthy = () => true\n\nexport default [\n  {\n    fn: tryCatch(throwing()),\n    expect: is.error,\n    info: 'function throws an error',\n  },\n  {\n    fn: tryCatch(healthy()),\n    expect: true,\n    info: 'function does not throw'\n  },\n]"),z({id:"usage"},"Usage"),A({id:"usage-js"},"mjs api:"),ha("\n// test/index.mjs\nimport run from '@magic/test'\n\nconst tests = {\n  lib: [\n    { fn: () => true, expect: true, info: 'Expect true to be true' }\n  ],\n}\n\nrun(tests)"),z({id:"usage-cli"},"cli"),A("package.json (recommended)"),M("Add the magic/test bin scripts to package.json"),ha("\n{\n  \"scripts\": {\n    \"test\": \"t -p\",\n    \"coverage\": \"t\",\n    \"format\": \"f -w\",\n    \"format:check\": \"f\"\n  },\n  \"devDependencies\": {\n    \"@magic/test\": \"github:magic/test\"\n  }\n}"),M("then use the npm run scripts"),ha("\nnpm test\nnpm run coverage\nnpm run format\nnpm run format:check"),A({id:"usage-global"},"Globally (not recommended):"),M(["you can install this library globally"," but the recommendation is to add the dependency and scripts to the package.json file."]),M(["this both explains to everyone that your app has these dependencies"," as well as keeping your bash free of clutter"]),ha("\nnpm i -g magic/test\n\n// run tests in production mode\nt -p\n\n// run tests and get coverage in verbose mode\nt\n\n// check formatting using prettier but do not write\n// prettier --list-different\nf\n\n// format files using prettier\n// prettier --write\nf -w"),M(["This library tests itself, have a look at ",da({to:"https://github.com/magic/test/tree/master/test"},"the tests")]),M("Checkout [@magic/types](https://github.com/magic/types) and the other magic libraries for more test examples.")]},"/test/404/":function test404(){return w("404 - not found")}};h({init:[j({},U,{url:window.location.pathname,hash:window.location.hash.substr(1)}),[[ja.db.get,{key:"magic-gdpr",action:ka.gdpr.show}]]],subscriptions:function subscriptions(){return[[V.listenPopState,ka.pop]]},view:function(a){var b=la[a.url]?a.url:"/404/",c=la[b],d=a.pages&&a.pages[b];return d&&Object.keys(d).forEach(function(b){a[b]=d[b]}),ga({page:c,state:a},[$(a),ca(a)])},node:document.getElementById("Magic")});