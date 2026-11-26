module.exports = function (api) {
  api.cache(true);
  return {
    // The Signal SDK uses `import.meta`, which Metro needs transformed.
    presets: [['babel-preset-expo', { unstable_transformImportMeta: true }]],
  };
};
