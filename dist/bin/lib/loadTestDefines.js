var __rewriteRelativeImportExtension = (this && this.__rewriteRelativeImportExtension) || function (path, preserveJsx) {
    if (typeof path === "string" && /^\.\.?\//.test(path)) {
        return path.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function (m, tsx, d, ext, cm) {
            return tsx ? preserveJsx ? ".jsx" : ".js" : d && (!ext || !cm) ? m : (d + ext + "." + cm.toLowerCase() + "js");
        });
    }
    return path;
};
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import fs from '@magic/fs';
import is from '@magic/types';
const DEFINE_FILE_NAMES = ['.defines.mjs', '.defines.ts', 'defines.mjs', 'defines.ts'].map(f => `test/${f}`);
/**
 * Vite define values may be pre-stringified JSON (e.g. '"my url"') or raw
 * literals (e.g. a bare 'http://localhost:9000'). Parse JSON when possible,
 * otherwise keep the raw string so a non-JSON define does not crash the
 * whole import.
 */
export const parseDefineValue = (value) => {
    try {
        return JSON.parse(value);
    }
    catch {
        return value;
    }
};
export const loadTestDefines = async (rootDir) => {
    for (const relPath of DEFINE_FILE_NAMES) {
        const filePath = path.join(rootDir, relPath);
        if (await fs.exists(filePath)) {
            try {
                const mod = await import(__rewriteRelativeImportExtension(pathToFileURL(filePath).href));
                if (mod.default && is.objectNative(mod.default)) {
                    return mod.default;
                }
                if (mod.define && is.objectNative(mod.define)) {
                    return mod.define;
                }
                return {};
            }
            catch (e) {
                console.warn(`[test-defines] Failed to load ${relPath}:`, e);
                return {};
            }
        }
    }
    return {};
};
//# sourceMappingURL=loadTestDefines.js.map