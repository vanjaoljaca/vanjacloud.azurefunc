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
        outDir: './.wallaby',
        // other TypeScript compiler options
      })
    },

    env: {
      type: 'node'
    }
  };
};
