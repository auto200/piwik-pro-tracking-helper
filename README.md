# Piwik PRO Tracking Helper <img src="/docs/logo-transparent.png" width="100" align="right" alt="Piwik PRO Tracking Helper">

### Inspect commands sent to the browser tracker and outgoing network events

![alt text](/docs/preview.png)

- supports both `_paq` and `_ppas` queues
- easy to recognize event types
- preview event payload

# Browser support

| Browser name | Browser version | Status |
| :----------- | :-------------- | :----- |
| Chrome       | latest          | ✅     |
| Firefox      | latest          | ✅     |

# Build the browser extension

## Requirements:

- Node 20.x
- pnpm 9.x

```bash
pnpm install

# Build the Firefox extension (saves in apps/debugger-extension/.output/piwik-pro-tracking-helper-{version}-firefox.zip)
cd apps/debugger-extension && pnpm run zip:firefox

# Build the Chrome extension (saves in apps/debugger-extension/.output/piwik-pro-tracking-helper-0.0.13-chrome.zip)
cd apps/debugger-extension &&  pnpm run zip
```

# How to install

Go to [releases](https://github.com/auto200/piwik-pro-tracking-helper/releases) and download latest extension version for firefox or chrome

- chrome - extract zip and [follow instructions](https://webkul.com/blog/how-to-install-the-unpacked-extension-in-chrome/)
- firefox - [follow instructions](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/)

# How to use

- install extension
- open page that has Piwik PRO installed
- open devtools (reopen if opened before) and click on "Piwik PRO Tracking Helper" tab
- refresh the page
- see results in devtools panel

---

### TODO

- publish extension to stores
- payload validation for events and network events
- add text input for filtering by event name
- allow for adding custom tracking endpoints, some integrations (like shopify) do not use JSTC, it would be nice to still be able to inspect network events from the extension
- grouping parameters in network event details
- better display of parameters
- highlight significant params that contributed to event detection https://help.piwik.pro/support/questions/what-are-events-and-how-are-they-detected/#how-event-types-are-detected
- settings & persistence
- pretty icon next to network events like in tracker debugger
- events order toggle - newest/oldest first
- support for viewing direct method calls on tracker object, currently we only have information on \_paq/\_ppas.push()
- formatting and syntax highlighting for functions - pushed to queue and to methods like `setCustomRequestProcessing`
- playwright tests
- setup eslint
