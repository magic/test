// Re-export isolation check functions from analysis module
export {
  testImportsMutableModuleState,
  testUsesFixedPorts,
  testUsesSharedFiles,
} from './analysis/index.js'
