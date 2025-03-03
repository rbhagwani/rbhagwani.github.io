// filepath: /c:/Users/User/OneDrive/Documents/GitHub/clientkind-cookbook/next.config.js
module.exports = {
    webpack: (config, { isServer }) => {
      // Fixes npm packages that depend on `process` module
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          process: require.resolve("process/browser"),
        };
      }
  
      return config;
    },
  };