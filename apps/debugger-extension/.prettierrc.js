import baseConfig from '../../.prettierrc.js';

/** @type {import('prettier').Options} */
export default {
  ...baseConfig,
  plugins: ['prettier-plugin-tailwindcss'],
};
