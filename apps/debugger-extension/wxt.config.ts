import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: 'Piwik PRO Tracking Helper',
  },
  extensionApi: 'webextension-polyfill',
  modules: ['@wxt-dev/module-react'],
  imports: false,
  zip: {
    zipSources: false,
  },
  // https://wxt.dev/api/reference/wxt/interfaces/ExtensionRunnerConfig.html
  runner: {
    startUrls: ['http://piwik.pro'],
    chromiumArgs: ['--auto-open-devtools-for-tabs'],
    openDevtools: true, //firefox only! - background script devtools
  },
});
