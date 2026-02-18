const path = require('path');
const { getDefaultConfig } = require('@expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

// 📍 Define roots
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

// 🔧 Get Expo default config
const config = getDefaultConfig(projectRoot);

/**
 * ============================================================
 * 🧠 MONOREPO SUPPORT (Required for pnpm workspaces)
 * ============================================================
 */

// 1️⃣ Tell Metro to watch the entire workspace
// Without this, Metro will NOT detect changes in ../../packages/*
config.watchFolders = [workspaceRoot];

// 2️⃣ Ensure Metro resolves node_modules from BOTH:
// - apps/mobile/node_modules
// - monorepo root node_modules (pnpm hoisted deps)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3️⃣ Prevent Metro from walking up the directory tree incorrectly
// Very important for pnpm
config.resolver.disableHierarchicalLookup = true;

/**
 * ============================================================
 * 🔍 OPTIONAL DEBUG LOGGING (TEMPORARY)
 * ============================================================
 * Uncomment if you want to inspect the effective config
 */

console.log('--- METRO CONFIG DEBUG ---');
console.log('projectRoot:', projectRoot);
console.log('workspaceRoot:', workspaceRoot);
console.log('watchFolders:', config.watchFolders);
console.log('nodeModulesPaths:', config.resolver.nodeModulesPaths);
console.log('--------------------------');


// Wrap with NativeWind AFTER modifications
module.exports = withNativeWind(config, { input: './global.css' });
