import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: 'Piwik PRO Tracking Helper',
  },
  modules: ['@wxt-dev/module-react'],
  imports: false,
  zip: {
    sourcesRoot: '../../',
  },
  // https://wxt.dev/api/reference/wxt/interfaces/ExtensionRunnerConfig.html
  webExt: {
    startUrls: ['http://piwik.pro'],
    chromiumArgs: ['--auto-open-devtools-for-tabs'],
    openDevtools: true, //firefox only! - background script devtools
  },
});
