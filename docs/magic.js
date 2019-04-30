(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function c(a){return m(a)||e(a)||k()}function e(a){if(Symbol.iterator in Object(a)||Object.prototype.toString.call(a)==="[object Arguments]")return Array.from(a)}function f(a,b){if(a==null)return{};var c=g(a,b);var d,e;if(Object.getOwnPropertySymbols){var f=Object.getOwnPropertySymbols(a);for(e=0;e<f.length;e++)d=f[e],!(b.indexOf(d)>=0)&&Object.prototype.propertyIsEnumerable.call(a,d)&&(c[d]=a[d])}return c}function g(a,b){if(a==null)return{};var c={};var d=Object.keys(a);var e,f;for(f=0;f<d.length;f++)e=d[f],!(b.indexOf(e)>=0)&&(c[e]=a[e]);return c}function j(a,b){return m(a)||l(a,b)||k()}function k(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}function l(a,b){var c=[];var d=!0;var e=!1;var f=undefined;try{for(var g,h=a[Symbol.iterator]();!(d=(g=h.next()).done)&&(c.push(g.value),!(b&&c.length===b));d=!0);}catch(a){e=!0,f=a}finally{try{!d&&h["return"]!=null&&h["return"]()}finally{if(e)throw f}}return c}function m(a){if(Array.isArray(a))return a}function n(a){return n=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function n(a){return typeof a}:function n(a){return a&&typeof Symbol==="function"&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a},n(a)}var o=require("hyperapp"),q=o.app,r=o.h;var h=function(a){return function(){var b=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};var d=!!(arguments.length>1&&arguments[1]!==undefined)&&arguments[1];var e=function is(a){for(var b=arguments.length,c=Array(b>1?b-1:0),d=1;d<b;d++)c[d-1]=arguments[d];return c.some(function(b){return b===n(a)})};return!d&&(e(b,"string","number","function")||Array.isArray(b)?(d=b,b={}):e(b.View,"function")&&(d=b.View,b={})),r(a,b,d)}};var s=h("div");var t=h("button");var u=h("code");var v=h("pre");var w=function Pre(a){var b=!!(arguments.length>1&&arguments[1]!==undefined)&&arguments[1];return function(c,d){return s({"class":"Pre ".concat(b||c.pre.theme)},[s({"class":"menu"},[!b&&t({onclick:d.pre.changeTheme},c.pre.theme==="dark"?"light":"dark"),t({onclick:function onclick(){return d.pre.clip(a)}},"copy")]),v(LIB.PRE.format(a).map(function(a){var b=j(a,2),c=b[0],d=b[1];return u(c,d)}))])}};w.View=function(){return w.apply(void 0,arguments)};var x=h("a");var a=h("text");var y=function Link(a,b){var c=a.to,d=f(a,["to"]);return function(a,g){var h=d.href,i=d.text,j=d.nofollow,k=d.noreferrer,l=d.onclick,m=f(d,["href","text","nofollow","noreferrer","onclick"]);return c=c||h||"",m.href=c,c&&c.startsWith("/")&&!c.startsWith("//")?m.onclick=function(a){l&&l({e:a,to:c}),g.go({e:a,to:c})}:(m.target="_blank",m.rel="noopener",j&&(m.rel+=" nofollow"),k&&(m.rel+=" noreferrer")),x(m,[i,b])}};var z=h("b");var b=h("h1");var A=h("h2");var B=h("h3");var C=h("h4");var D=h("p");var p=h("tr");var E=h("img");var F=function Img(a){return function(){if(typeof a==="string"&&(a={src:a}),!!a.src)return!a.alt&&(a.title?a.alt=a.title:(a.role="presentation",a.alt="")),E(a)}};var G=h("li");var H=h("ul");var I=function GitBadges(a){var b=a.project,c=b!==void 0&&b,d=a.branch,e=d===void 0?"master":d;var f=Object.entries({npm:function npm(){var a=arguments.length>0&&arguments[0]!==undefined?arguments[0]:c;return a&&{to:"https://www.npmjs.com/package/@".concat(a),src:"https://img.shields.io/npm/v/@".concat(a,".svg")}},travis:function travis(){var a=arguments.length>0&&arguments[0]!==undefined?arguments[0]:c;return a&&{to:"https://travis-ci.com/".concat(a),src:"https://travis-ci.com/".concat(a,".svg?branch=").concat(e)}},appveyor:function appveyor(){var a=arguments.length>0&&arguments[0]!==undefined?arguments[0]:c;return a&&{to:"https://ci.appveyor.com/project/".concat(a,"/branch/").concat(e),src:"https://img.shields.io/appveyor/ci/".concat(a,"/").concat(e,".svg")}},coveralls:function coveralls(){var a=arguments.length>0&&arguments[0]!==undefined?arguments[0]:c;return a&&{to:"https://coveralls.io/github/".concat(a),src:"https://coveralls.io/repos/github/".concat(a,"/badge.svg")}},greenkeeper:function greenkeeper(){var a=arguments.length>0&&arguments[0]!==undefined?arguments[0]:c;return a&&{to:"https://greenkeeper.io",src:"https://badges.greenkeeper.io/".concat(a,".svg")}},snyk:function snyk(){var a=arguments.length>0&&arguments[0]!==undefined?arguments[0]:c;return a&&{to:"https://snyk.io/test/github/".concat(a),src:"https://snyk.io/test/github/".concat(a,"/badge.svg")}}}).map(function(b){var c=j(b,2),d=c[0],e=c[1];return e(a[d])}).filter(function(b){return b.to&&b.src});return f.length?H({"class":"GitBadges"},f.map(function(a){var b=a.to,c=a.src;return G([y({to:b},F({src:c}))])})):void 0};var J={View:function View(){return K({"class":"main"},[s({"class":"wrapper"},["made with a few bits of ",y({to:"https://github.com/magic/core",target:"_blank",rel:"noopener"},"magic")])])}};var K=h("footer");var L={View:function View(){var a=arguments.length>0&&arguments[0]!==undefined?arguments[0]:"menu";return function(b){typeof a==="string"&&(a={name:a});var c=a,d=c.name,e=d===void 0?"menu":d,g=c["class"],h=g===void 0?"Menu":g,j=c.items,k=j===void 0?[]:j,l=c.collapse;var n=b.url,o=b[e],p=o===void 0?[]:o;if(k=k.length?k:p,!!k.length){b.hash&&(n+="#".concat(b.hash));var q=function Item(a){var b=a.text,c=a.items,d=c===void 0?[]:c,e=f(a,["text","items"]);if(e.to||b){var g={};e.to===n&&(g["class"]="active");var h;return d&&(n.startsWith(e.to)||!(l===void 0||l))&&(h=H(d.map(function(a){return q(a)}))),G(g,[e.to?y(e,b):N(e,b),h])}};return i({"class":h.includes("Menu")?h:"Menu ".concat(h)},H(k.map(function(a){return q(a)})))}}}};var M=h("i");var i=h("nav");var N=h("span");var O=h("header");var P=function PageHead(a){return(a.logo||a.menu||a.tagline)&&O({"class":"main"},[(a.logo||a.logotext)&&y({to:"/test/","class":"logo-wrapper"},[a.logo&&F({"class":"logo",src:a.logo}),a.logotext&&N({"class":"logo-text"},a.logotext)]),L.View])};var Q=h("object");var R={};(function(){var a="\nlet this long package float\ngoto private class if short\nwhile protected with debugger case\ncontinue volatile interface\n\ninstanceof super synchronized throw\nextends final export throws\ntry import double enum\n\nboolean abstract function\nimplements typeof transient break\ndefault do static void\n\nint new async native switch\nelse delete null public var\nawait byte finally catch\nin return for get const char\nmodule exports require\n".trim().split(/\b/g).map(function(a){return a.trim()});var b="\nArray Object String Number RegExp Null Symbol\nSet WeakSet Map WeakMap\nsetInterval setTimeout\nPromise\nJSON\nInt8Array Uint8Array Uint8ClampedArray\nInt16Array Uint16Array\nInt32Array Uint32Array\nFloat32Array Float64Array\n".trim().split(/\b/g).map(function(a){return a.trim()});var d=["true","false"];var e=function wrapWords(c){if(typeof c!=="string")return c;var e=c.split(/\b/);return c=e.map(function(c,f){if(c!==""){var g="";return c==="state"?g="state":c==="actions"?g="actions":e[f+1]&&e[f+1].includes(":")?g="colon":a.includes(c)?g="keyword":b.includes(c)?g="builtin":d.includes(c)?g="boolean":e[f-1]==="."?g="property":e[f+1]==="."&&(g="object"),g&&(c=N({"class":g},c)),c}}),c};var g=function wordsByLine(a){var b=a.indexOf("//");var d=a.trim();if(d.startsWith("//")){var t=a.search(/\S|$/);var v="";for(var w=0;w<t;w++)v+=" ";return!d.startsWith("// ")&&(a="".concat(v,"// ").concat(d.substr(2))),u({"class":"line comment"},[v,"// ",g(d.substring(3))])}if(b>-1&&a[b-1]!==":"){var x=a.indexOf("//");var z=a.substring(0,x);var A=a.substring(x);return u({"class":"line"},[g(z),N({"class":"comment"},g(A))])}if(a.indexOf("://")>2)return a.split(/(?= )/).map(function(a){return a.includes("://")?y({to:a},a):g(a)});if(a.indexOf("@")&&a.includes(".")&&!a.trim().includes(" ")){a=a.replace("mailto:","");var B=a.split(/\b/g);var C=!1;var D="";var E=/[^A-Za-z0-9.:]/g;if(B.map(function(a,b){var c=!1;a==="mailto"?(c=!0,C=!0,D=a):c||a!=="@"?E.test(a)&&(C=!1):(C=!0,D=B[b-1]+a,B[b-1]=null),C&&!E.test(a)&&(D+=a)}),D){var f=a.split(D),h=j(f,2),i=h[0],k=h[1];var F=D;return D.startsWith("mailto:")?D=D.replace("mailto:",""):F="mailto:".concat(D),[i,y({"class":"email",to:F},D),k]}return a}var l=a.replace(/"/g,"'");var m=l.split("'"),n=c(m),o=n[0],p=n[1],q=n.slice(2);var r=q;r.length===1?r=g(r[0]):r.length>1&&(r=g(r.join("'")));var s=[];return s=typeof p==="undefined"?e(a):[e(o),N({"class":"string"},"'".concat(p,"'")),r],s};var h=function wrapLine(a){return[{"class":"line"},g(a)]};R.PRE={keywords:a,builtins:b,format:function format(a){return a.trim().split("\n").map(h)},wordsByLine:g,wrapWords:e}})(),window.LIB=R;var S={"/test/":function test(){return[b("@magic/test"),D("simple tests with lots of utility."),I({project:"magic/test",appveyor:"jaeh/test"}),A({id:"dependencies"},"dependencies"),D([y({to:"https://github.com/magic/log"},"@magic/log"),": console.log wrapper with loglevels"]),D([y({to:"https://github.com/magic/types"},"@magic/types"),": type checking library"]),D([y({to:"https://github.com/magic/deep"},"@magic/deep"),": deeply compare and manipulate arrays and objects"]),D([y({to:"https://www.npmjs.com/package/nyc"},"nyc"),": code coverage"]),D([y({to:"https://www.npmjs.com/package/prettier"},"prettier"),": code formatting"]),D("@magic/log and @magic/types have no dependencies."),A({id:"getting-started"},"Getting started"),D("be in a nodejs project."),B({id:"getting-started-install"},"install"),w.View("npm i --save-dev @magic/test"),w.View("\n// create test/functionName.js\nconst yourTest = require('../path/to/your/file.js')\n\nmodule.exports = [\n  { fn: () => true, expect: true, info: 'true is true' },\n  // note that the function will be called automagically\n  { fn: yourTest, expect: true, info: 'hope this will work ;)'}\n]"),B({id:"getting-started-npm-scripts"},"npm run scripts"),D("edit package.json"),w.View("\n{\n  \"scripts\": {\n    \"test\": \"t -p\", // quick test, only failing tests log\n    \"coverage\": \"t\", // get full test output and coverage reports\n    \"format\": \"f -w\", // format using prettier and write changes to files\n    \"format:check\": \"f\" // check format using prettier\n  }\n}"),D("repeated for easy copy pasting (without comments)"),w.View("\n  \"scripts\": {\n    \"test\": \"t -p\",\n    \"coverage\": \"t\",\n    \"format\": \"f -w\",\n    \"format:check\": \"f\"\n  }"),B({id:"getting-started-quick-tests"},"quick tests (without coverage)"),w.View("\n// run the tests:\nnpm test\n\n// example output:\n// (failing tests will print, passing tests are silent)\n\n// ### Testing package: @magic/test\n// Ran 2 tests. Passed 2/2 100%"),B({id:"getting-started-coverage"},"coverage"),D("run coverage reports and get full test report including from passing tests"),w.View("npm run coverage"),B({id:"test-suites"},"data/fs driven test suite creation:"),C("expectations for optimal test messages:"),D("src and test directories have the same structure and files"),D("tests one src file per test file"),D("tests one function per suite"),D("tests one feature per test"),C({id:"test-suites-fs"},"Filesystem based naming"),D("the following directory structure:"),w.View("\n./test/\n  ./suite1.js\n  ./suite2.js"),D("yields the same result as exporting the following from ./test/index.js"),C({id:"test-suites-data"},"Data driven naming"),w.View("\nconst suite1 = require('./suite1')\nconst suite2 = require('./suite2')\n\nmodule.exports = {\n  suite1,\n  suite2,\n}"),B("Important - File mappings"),D("if test/index.js exists, no other files will be loaded."),D("if test/lib/index.js exists, no other files from that subdirectory will be loaded."),B({id:"tests"},"single test, literal value, function or promise"),w.View("\nmodule.exports = { fn: true, expect: true, info: 'expect true to be true' }\n\n// expect: true is the default and can be omitted\nmodule.exports = { fn: true, info: 'expect true to be true' }\n\n// if fn is a function expect is the returned value of the function\nmodule.exports = { fn: () => false, expect: false, info: 'expect true to be true' }\n\n// if expect is a function the return value of the test get passed to it\nmodule.exports = { fn: false, expect: t => t === false, info: 'expect true to be true' }\n\n// if fn is a promise the resolved value will be returned\nmodule.exports = { fn: new Promise(r => r(true)), expect: true, info: 'expect true to be true' }\n\n// if expects is a promise it will resolve before being compared to the fn return value\nmodule.exports = { fn: true, expect: new Promise(r => r(true)), info: 'expect true to be true' }\n\n// callback functions can be tested easily too:\nconst { promise } = require('@magic/test')\nconst fnWithCallback = (err, arg, cb) => cb(err, arg)\nmodule.exports = { fn: promise(fnWithCallback(null, 'arg', (e, a) => a)), expect: 'arg' }"),C({id:"tests-types"},"testing types"),D(["types can be compared using ",y({to:"https://github.com/magic/types"},"@magic/types")]),D(["@magic/types is a richly featured and thoroughly tested type library without dependencies."," it is exported from this library for convenience."]),w.View("\nconst { is } = require('@magic/test')\nmodule.exports = [\n  { fn: () => 'string',\n    expect: is.string,\n    info: 'test if a function returns a string'\n  },\n  {\n    fn: () => 'string',\n    expect: is.length.equal(6),\n    info: 'test length of returned value'\n  },\n  // !!! Testing for deep equality. simple.\n  {\n    fn: () => [1, 2, 3],\n    expect: is.deep.equal([1, 2, 3]),\n    info: 'deep compare arrays/objects for equality',\n  },\n  {\n    fn: () => { key: 1 },\n    expect: is.deep.different({ value: 1 }),\n    info: 'deep compare arrays/objects for difference',\n  },\n]"),C("caveat:"),D("if you want to test if a function is a function, you need to wrap the function"),w.View("\nconst { is } = require('@magic/test')\n\nconst fnToTest = () => {}\n// both the tests will work as expected\nmodule.exports = [\n  {\n    fn: () => fnToTest,\n    expect: is.function,\n    info: 'function is a function',\n  },\n  {\n    fn: is.fn(fnToTest), // returns true\n    // we do not set expect: true, since that is the default\n    info: 'function is a function',\n  },\n]"),w.View("\n// will not work as expected and instead call fnToTest\nmodule.exports = {\n  fn: fnToTest,\n  expect: is.function,\n  info: 'function is a function',\n}"),B({id:"tests-multiple"}," multiple tests"),D("multiple tests can be created by exporting an array of single test objects."),w.View("\nmodule.exports = {\n  multipleTests: [\n    { fn: () => true, expect: true, info: 'expect true to be true' },\n    { fn: () => false, expect: false, info: 'expect false to be false' },\n  ]\n}"),B({id:"tests-promises"},"promises"),w.View("\nconst { promise, is } = require('@magic/test')\n\nmodule.exports = [\n  // kinda clumsy, but works. until you try handling errors.\n  {\n    fn: new Promise(cb => setTimeOut(() => cb(true), 2000)),\n    expect: true,\n    info: 'handle promises',\n  },\n  // better!\n  {\n    fn: promise(cb => setTimeOut(() => cb(null, true), 200)),\n    expect: true,\n    info: 'handle promises in a nicer way',\n  },\n  {\n    fn: promise(cb => setTimeOut(() => cb(new Error('error')), 200)),\n    expect: is.error,\n    info: 'handle promise errors in a nice way',\n  },\n]"),B({id:"tests-cb"},"callback functions"),w.View("\nconst { promise, is } = require('@magic/test')\n\nconst fnWithCallback = (err, arg, cb) => cb(err, arg)\n\nmodule.exports = [\n  {\n    fn: promise(cb => fnWithCallback(null, true, cb)),\n    expect: true\n    info: 'handle callback functions as promises',\n  },\n  {\n    fn: promise(cb => fnWithCallback(new Error('oops'), true, cb)),\n    expect: is.error,\n    info: 'handle callback function error as promise',\n  },\n]"),B({id:"tests-hooks"},"run functions before and/or after individual test"),w.View("\nconst after = () => {\n  global.testing = 'Test has finished, cleanup.'\n}\n\nconst before = () => {\n  global.testing = false\n\n  // if a function gets returned,\n  // this function will be executed once the test finished.\n  return after\n}\n\nmodule.exports = [\n  {\n    fn: () => { global.testing = 'changed in test' },\n    // if before returns a function, it will execute after the test.\n    before,\n    after,\n    expect: () => global.testing === 'changed in test',\n  },\n]"),B({id:"tests-suite-hooks"},"run functions before and/or after a suite of tests"),w.View("\nconst afterAll = () => {\n  // Test has finished, cleanup.'\n  global.testing = undefined\n}\n\nconst beforeAll = () => {\n  global.testing = false\n\n  // if a function gets returned,\n  // this function will be executed once the test suite finished.\n  return afterAll\n}\n\nmodule.exports = [\n  {\n    fn: () => { global.testing = 'changed in test' },\n    // if beforeAll returns a function, it will execute after the test suite.\n    beforeAll,\n    // this is optional and can be omitted if beforeall returns a function.\n    // in this example, afterAll will trigger twice.\n    afterAll,\n    expect: () => global.testing === 'changed in test',\n  },\n]"),A({id:"lib"},"Utility Belt"),D("@magic/test exports some utility functions that make working with complex test workflows simpler."),C({id:"lib-curry"},"curry"),D("Currying can be used to split the arguments of a function into multiple nested functions."),D("This helps if you have a function with complicated arguments that you just want to quickly shim."),w.View("\nconst { curry } = require('@magic/test')\nconst compare = (a, b) => a === b\nconst curried = curry(compare)\nconst shimmed = curried('shimmed_value')\n\nmodule.exports = {\n  fn: shimmed('shimmed_value'),\n  expect: true,\n  info: 'expect will be called with a and b and a will equal b',\n}\n"),C({id:"lib-vals"},"vals"),D("exports some javascript types. more to come. will sometime in the future be the base of a fuzzer."),B({id:"lib-promises"},"promises"),D("Helper function to wrap nodejs callback functions and promises with ease."),D("Handles the try/catch steps internally and returns a resolved or rejected promise."),w.View("\nconst { promise, is } = require('@magic/test')\n\nmodule.exports = [\n  {\n    fn: promise(cb => setTimeOut(() => cb(null, true), 200)),\n    expect: true,\n    info: 'handle promises in a nice way',\n  },\n  {\n    fn: promise(cb => setTimeOut(() => cb(new Error('error')), 200)),\n    expect: is.error,\n    info: 'handle promise errors in a nice way',\n  },\n]"),C({id:"lib-trycatch"},"tryCatch"),D("allows to test functions without bubbling the errors up into the runtime"),w.View("\nconst { is, tryCatch } = require('@magic/test')\nconst throwing = () => throw new Error('oops')\nconst healthy = () => true\n\nmodule.exports = [\n  {\n    fn: tryCatch(throwing()),\n    expect: is.error,\n    info: 'function throws an error',\n  },\n  {\n    fn: tryCatch(healthy()),\n    expect: true,\n    info: 'function does not throw'\n  },\n]"),A({id:"usage"},"Usage"),B({id:"usage-js"},"js api:"),w.View("\n// test/index.js\nconst run = require('@magic/test')\n\nconst tests = {\n  lib: [\n    { fn: () => true, expect: true, info: 'Expect true to be true' }\n  ],\n}\n\nrun(tests)"),A({id:"usage-cli"},"cli"),B("package.json (recommended)"),D("Add the magic/test bin scripts to package.json"),w.View("\n{\n  \"scripts\": {\n    \"test\": \"t -p\",\n    \"coverage\": \"t\",\n    \"format\": \"f -w\",\n    \"format:check\": \"f\"\n  },\n  \"devDependencies\": {\n    \"@magic/test\": \"github:magic/test\"\n  }\n}"),D("then use the npm run scripts"),w.View("\nnpm test\nnpm run coverage\nnpm run format\nnpm run format:check"),B({id:"usage-global"},"Globally (not recommended):"),D(["you can install this library globally"," but the recommendation is to add the dependency and scripts to the package.json file."]),D(["this both explains to everyone that your app has this dependencies"," and keeps your bash free of clutter"]),w.View("\nnpm i -g magic/test\n\n// run tests in production mode\nt -p\n\n// run tests and get coverage in verbose mode\nt\n\n// check formatting using prettier but do not write\n// prettier --list-different\nf\n\n// format files using prettier\n// prettier --write\nf -w"),D(["This library tests itself, have a look at ",y({to:"https://github.com/magic/test/tree/master/test"},"the tests")]),D("Checkout [@magic/types](https://github.com/magic/types) and the other magic libraries for more test examples.")]},"/404/":function _(){return s("404 - not found")}};var T={"url":"/test/","root":"/test/","logotext":"@magic/test","menu":[{to:"/test/#dependencies","text":"dependencies"},{to:"/test/#getting-started","text":"getting started","items":[{to:"/test/#getting-started-install","text":"install"},{to:"/test/#getting-started-npm-scripts","text":"npm scripts"},{to:"/test/#getting-started-quick-tests","text":"quick tests"},{to:"/test/#getting-started-coverage","text":"coverage"}]},{to:"/test/#test-suites","text":"test suites","items":[{to:"/test/#test-suites-fs","text":"fs based test suites"},{to:"/test/#test-suites-data","text":"data based test suites"}]},{to:"/test/#tests","text":"writing tests","items":[{to:"/test/#tests-types","text":"testing types"},{to:"/test/#tests-multiple","text":"multiple tests in one file"},{to:"/test/#tests-promises","text":"promises"},{to:"/test/#tests-cb","text":"callback functions"},{to:"/test/#tests-hooks","text":"run function before / after individual tests"},{to:"/test/#tests-suite-hooks","text":"run function before / after suite of tests"}]},{to:"/test/#lib","text":"utility functions","items":[{to:"/test/#lib-curry","text":"curry"},{to:"/test/#lib-vals","text":"vals"},{to:"/test/#lib-trycatch","text":"tryCatch"},{to:"/test/#lib-promises","text":"promises"}]},{to:"/test/#usage","text":"Cli / Js Api Usage","items":[{to:"/test/#usage-js","text":"js api"},{to:"/test/#usage-cli","text":"cli"},{to:"/test/#usage-global","text":"npm i -g"}]}],"pre":{"theme":"light"}};T.url=window.location.pathname,T.root="/test/";var U={"pre":{"changeTheme":function changeTheme(){return function(a){return{theme:a.theme==="dark"?"light":"dark"}}},"clip":function clip(a){if(typeof document!=="undefined"&&typeof document.execCommand==="function"){var b=document.createElement("textarea");b.id="copy",b.innerHTML=a,document.body.appendChild(b);var c=document.getElementById("copy");c.select(),document.execCommand("copy"),document.body.removeChild(c)}}},"go":function go(a){return function(b){if(typeof window==="undefined"||!window.history)return!0;var c=a.to;var d=a.e?a.e:a;d.preventDefault();var e=b.url;var f=e.split("#"),g=j(f,2),h=g[0],i=g[1],k=i===void 0?"":i;if(c){e=c.replace(window.location.origin,"");var l=e.split("#"),m=j(l,2),n=m[0],o=m[1],p=o===void 0?"":o;h=n,k=p;var q=b.hash?"#".concat(b.hash):"";var r=b.url+q;e!==r&&(window.history&&window.history.pushState({uri:h},"",e),!k&&window.scrollTo(0,0))}else h=d.state?d.state.uri:"/";return k&&window.location&&(window.location.hash=k),{url:h,hash:k,prev:b.url}}}};var V=function view(a,b){var c=S[a.url]?a.url:"/404/";var d=S[c];if(a.pages){var e=a.pages[c];for(var f in e)a[f]=e[f]}if(b.pages){var g=b.pages[c];for(var h in g)b[h]=g[h]}return s({"class":"wrapper",oncreate:function oncreate(){typeof window!=="undefined"&&b.go&&window.addEventListener("popstate",b.go)}},[P,d?s({"class":"page"},d(a,b)):s({"class":"page"},"404 - not found"),J.View])};var W=document;var d=W.getElementById("magic");!d&&(d=W.createElement("div"),d.id="magic",W.body.appendChild(d)),q(T,U,V,d);
},{"hyperapp":2}],2:[function(require,module,exports){
!function(e,n){"object"==typeof exports&&"undefined"!=typeof module?n(exports):"function"==typeof define&&define.amd?define(["exports"],n):n(e.hyperapp={})}(this,function(e){"use strict";e.h=function(e,n){for(var t=[],r=[],o=arguments.length;2<o--;)t.push(arguments[o]);for(;t.length;){var l=t.pop();if(l&&l.pop)for(o=l.length;o--;)t.push(l[o]);else null!=l&&!0!==l&&!1!==l&&r.push(l)}return"function"==typeof e?e(n||{},r):{nodeName:e,attributes:n||{},children:r,key:n&&n.key}},e.app=function(e,n,t,r){var o,l=[].map,u=r&&r.children[0]||null,i=u&&function n(e){return{nodeName:e.nodeName.toLowerCase(),attributes:{},children:l.call(e.childNodes,function(e){return 3===e.nodeType?e.nodeValue:n(e)})}}(u),f=[],m=!0,a=v(e),c=function e(r,o,l){for(var n in l)"function"==typeof l[n]?function(e,t){l[e]=function(e){var n=t(e);return"function"==typeof n&&(n=n(h(r,a),l)),n&&n!==(o=h(r,a))&&!n.then&&d(a=p(r,v(o,n),a)),n}}(n,l[n]):e(r.concat(n),o[n]=v(o[n]),l[n]=v(l[n]));return l}([],a,v(n));return d(),c;function g(e){return"function"==typeof e?g(e(a,c)):null!=e?e:""}function s(){o=!o;var e=g(t);for(r&&!o&&(u=function e(n,t,r,o,l){if(o===r);else if(null==r||r.nodeName!==o.nodeName){var u=k(o,l);n.insertBefore(u,t),null!=r&&T(n,t,r),t=u}else if(null==r.nodeName)t.nodeValue=o;else{x(t,r.attributes,o.attributes,l=l||"svg"===o.nodeName);for(var i={},f={},a=[],c=r.children,s=o.children,d=0;d<c.length;d++){a[d]=t.childNodes[d];var v=N(c[d]);null!=v&&(i[v]=[a[d],c[d]])}for(var d=0,p=0;p<s.length;){var v=N(c[d]),h=N(s[p]=g(s[p]));if(f[v])d++;else if(null==h||h!==N(c[d+1]))if(null==h||m)null==v&&(e(t,a[d],c[d],s[p],l),p++),d++;else{var y=i[h]||[];v===h?(e(t,y[0],y[1],s[p],l),d++):y[0]?e(t,t.insertBefore(y[0],a[d]),y[1],s[p],l):e(t,a[d],null,s[p],l),f[h]=s[p],p++}else null==v&&T(t,a[d],c[d]),d++}for(;d<c.length;)null==N(c[d])&&T(t,a[d],c[d]),d++;for(var d in i)f[d]||T(t,i[d][0],i[d][1])}return t}(r,u,i,i=e)),m=!1;f.length;)f.pop()()}function d(){o||(o=!0,setTimeout(s))}function v(e,n){var t={};for(var r in e)t[r]=e[r];for(var r in n)t[r]=n[r];return t}function p(e,n,t){var r={};return e.length?(r[e[0]]=1<e.length?p(e.slice(1),n,t[e[0]]):n,v(t,r)):n}function h(e,n){for(var t=0;t<e.length;)n=n[e[t++]];return n}function N(e){return e?e.key:null}function y(e){return e.currentTarget.events[e.type](e)}function b(e,n,t,r,o){if("key"===n);else if("style"===n)if("string"==typeof t)e.style.cssText=t;else for(var l in"string"==typeof r&&(r=e.style.cssText=""),v(r,t)){var u=null==t||null==t[l]?"":t[l];"-"===l[0]?e.style.setProperty(l,u):e.style[l]=u}else"o"===n[0]&&"n"===n[1]?(n=n.slice(2),e.events?r||(r=e.events[n]):e.events={},(e.events[n]=t)?r||e.addEventListener(n,y):e.removeEventListener(n,y)):n in e&&"list"!==n&&"type"!==n&&"draggable"!==n&&"spellcheck"!==n&&"translate"!==n&&!o?e[n]=null==t?"":t:null!=t&&!1!==t&&e.setAttribute(n,t),null!=t&&!1!==t||e.removeAttribute(n)}function k(e,n){var t="string"==typeof e||"number"==typeof e?document.createTextNode(e):(n=n||"svg"===e.nodeName)?document.createElementNS("http://www.w3.org/2000/svg",e.nodeName):document.createElement(e.nodeName),r=e.attributes;if(r){r.oncreate&&f.push(function(){r.oncreate(t)});for(var o=0;o<e.children.length;o++)t.appendChild(k(e.children[o]=g(e.children[o]),n));for(var l in r)b(t,l,r[l],null,n)}return t}function x(e,n,t,r){for(var o in v(n,t))t[o]!==("value"===o||"checked"===o?e[o]:n[o])&&b(e,o,t[o],n[o],r);var l=m?t.oncreate:t.onupdate;l&&f.push(function(){l(e,n)})}function T(e,n,t){function r(){e.removeChild(function e(n,t){var r=t.attributes;if(r){for(var o=0;o<t.children.length;o++)e(n.childNodes[o],t.children[o]);r.ondestroy&&r.ondestroy(n)}return n}(n,t))}var o=t.attributes&&t.attributes.onremove;o?o(n,r):r()}}});

},{}]},{},[1]);
