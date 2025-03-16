// import { onMessage } from 'webext-bridge/devtools';
import { browser } from 'wxt/browser';

browser.devtools.panels.create('Piwik PRO JSTC Debugger', 'icon/128.png', 'devtools-panel.html');

// onMessage('EVENT', function (ev) {
//   console.log(ev);
// });
