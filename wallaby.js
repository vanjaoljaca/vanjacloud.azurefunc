module.exports = function (wallaby) {
  return {
    files: [
      '**/*.ts'
    ],

    tests: [
      '**/*.test.ts'
    ],

    compilers: {
      '**/*.ts?(x)': wallaby.compilers.typeScript({
        outDir: './dist',
        // other TypeScript compiler options
      })
    },

    env: {
      type: 'node'
    }
  };
};
