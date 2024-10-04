import config from '../../vitest.config';

export default {
  ...config,
  test: {
    ...config.test,
    coverage: {
      ...config.test?.coverage,
      thresholds: {
        lines: 36.98,
        statements: 37.17,
        branches: 49.2,
        functions: 35.71,
        autoUpdate: true,
      },
    },
  },
};
