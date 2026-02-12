const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(monorepoRoot, "node_modules")
];

config.resolver.disableHierarchicalLookup = true; // important with pnpm[web:1][web:3]

module.exports = config;
