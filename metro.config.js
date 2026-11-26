const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.sourceExts.push('mjs');
// expo-sqlite ships a .wasm build for web.
config.resolver.assetExts.push('wasm');

module.exports = config;
