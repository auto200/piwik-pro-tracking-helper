# Piwik PRO JSTC Helper

### Inspect commands sent to the JSTC and outgoing network events

![alt text](/docs/preview.png)

- supports both `_paq` and `_ppas` queues
- easy to recognize event types
- preview event payload

# Browser support

| Browser name | Browser version | Status                 |
| :----------- | :-------------- | :--------------------- |
| Chrome       | latest          | 🚧 works on my machine |
| Firefox      | latest          | 🚧 works on my machine |

# How to install

Go to [releases](https://github.com/auto200/piwik-pro-jstc-debugger/releases) and download latest extension version for firefox or chrome

- chrome - extract zip and [follow instructions](https://webkul.com/blog/how-to-install-the-unpacked-extension-in-chrome/)
- firefox - [follow instructions](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/)

# How to use

- install extension
- open page that has Piwik PRO installed
- open devtools and click on "Piwk PRO JSTC Debugger" tab
- refresh the page
- see results in devtools panel

---

### TODO

- detection if JSTC is on the page - currently we display nothing
- scope events to specific page - if you have multiple pages open, all events from every page will be shown in the debugger
- filters
- payload validation for events and network events
- grouping parameters in network event details
- better display of parameters
- highlight significant params that contributed to event detection https://help.piwik.pro/support/questions/what-are-events-and-how-are-they-detected/#how-event-types-are-detected
- settings & persistence
- show total number of events and network events
- autoscrolling event list upon new event
- pretty icon next to network events like in tracker debugger
- events order toggle - newest/oldest first
- support for viewing direct method calls on tracker object, currently we only have information on \_paq/\_ppas.push()
- formatting and syntax highlighting for functions - pushed to queue and to methods like `setCustomRequestProcessing`
- playwright tests
- refactor components
- setup eslint
