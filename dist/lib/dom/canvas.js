import { createRequire } from 'node:module';
import is from '@magic/types';
let canvasModule = null;
let canvasLoadError = null;
// Load the canvas native module lazily on first use instead of at module
// load. This repo's polyfill used to import the native binding
// unconditionally, so a broken environment (missing system library,
// prebuild/ABI mismatch) took down the whole run at collection time and in
// every worker. Now:
// - projects whose tests never touch canvas never load the native module,
// - a load failure surfaces as a catchable error in the one test that needs
//   canvas, with an actionable message (see .plans/FIX_HANG.md, B5).
const getCanvasModule = () => {
    if (canvasModule) {
        return canvasModule;
    }
    if (canvasLoadError) {
        throw canvasLoadError;
    }
    try {
        const require = createRequire(import.meta.url);
        const mod = require('@napi-rs/canvas/node-canvas.js');
        canvasModule = mod;
        return mod;
    }
    catch (e) {
        canvasLoadError = e instanceof Error ? e : new Error(String(e));
        throw canvasLoadError;
    }
};
let origGetContext = null;
export const createCanvasPolyfill = () => {
    const HTMLCanvasElement = globalThis.HTMLCanvasElement;
    if (origGetContext) {
        return;
    }
    origGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        if (type !== '2d') {
            return origGetContext.call(this, type, ...args);
        }
        // First real canvas use: load the native module here. A broken native
        // module throws a catchable Error that fails this test (and the suite),
        // instead of aborting the whole process at startup.
        const { createCanvas, Image: NativeImage, loadImage, Canvas: NativeCanvas } = getCanvasModule();
        if (!this._nodeCanvas) {
            this._nodeCanvas = createCanvas(this.width || 300, this.height || 150);
        }
        const ctx = this._nodeCanvas.getContext('2d');
        // The runtime napi-rs 2d context speaks the node-canvas API (variable
        // drawImage args, toDataURL on the context) which does not match the DOM
        // lib types for SKRSContext2D, so the polyfill installs its shims through
        // this locally-typed view. The original methods are kept for delegation.
        const shim = ctx;
        const originalDrawImage = shim.drawImage.bind(shim);
        // napi-rs keeps encoding on the canvas object, not the 2d context
        const originalToDataURL = this._nodeCanvas.toDataURL.bind(this._nodeCanvas);
        const drawImageFn = (img, ...drawArgs) => {
            if (!is.object(img)) {
                originalDrawImage(img, ...drawArgs);
                return;
            }
            const imgLike = img;
            if (is.instance(img, NativeImage) || (imgLike && imgLike._nodeCanvasImage)) {
                const nodeImg = is.instance(img, NativeImage) ? img : imgLike._nodeCanvasImage;
                originalDrawImage(nodeImg, ...drawArgs);
                return;
            }
            if (is.instance(img, NativeCanvas)) {
                originalDrawImage(img, ...drawArgs);
                return;
            }
            const imgSrc = imgLike?.src;
            if (is.string(imgSrc) && imgSrc.startsWith('data:image')) {
                loadImage(imgSrc)
                    .then(loadedImg => {
                    originalDrawImage(loadedImg, ...drawArgs);
                })
                    .catch(() => { });
                return;
            }
            originalDrawImage(img, ...drawArgs);
        };
        const toDataURLFn = (mimeType = 'image/png', quality) => originalToDataURL(mimeType, quality) || '';
        shim.drawImage = drawImageFn;
        shim.toDataURL = toDataURLFn;
        return ctx;
    };
};
//# sourceMappingURL=canvas.js.map