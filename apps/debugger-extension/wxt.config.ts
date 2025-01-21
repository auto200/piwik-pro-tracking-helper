import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-react'],
  imports: false,
  zip: {
    zipSources: false,
  },
  // https://wxt.dev/api/reference/wxt/interfaces/ExtensionRunnerConfig.html
  runner: {
    startUrls: ['https://tiki-toki.vercel.app'],
    chromiumArgs: ['--auto-open-devtools-for-tabs'],
    // openDevtools: true, //firefox only! - background script devtools
  },
});
