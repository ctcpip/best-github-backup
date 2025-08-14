import ultraMegaConfig from 'eslint-config-ultra-mega';
import globals from 'globals';

export default [
  ...ultraMegaConfig,
  { languageOptions: { globals: { ...globals.node } } },
];
