# lib/browser
The code libraries that execute in the web browser.

## Files
<!-- Do not edit below this line.  Contents dynamically populated. -->

* **[agent_management.ts](agent_management.ts)** - Receive and process agent data modification from across the network.
* **[agent_status.ts](agent_status.ts)**   - Receive and process agent activity status notifications from the network.
* **[audio.ts](audio.ts)**                 - A storage of audio samples encoded in Base64 with respective metadata.
* **[browser.ts](browser.ts)**             - A list of declared variables globally available to the browser instance of the application.
* **[configuration.ts](configuration.ts)** - A collection of utilities and event handlers associated with processing the application state and system configuration.
* **[context.ts](context.ts)**             - A collection of event handlers associated with the right click context menu.
* **[dom.ts](dom.ts)**                     - Extensions to the DOM to provide navigational functionality not present from the standard methods
* **[fileBrowser.ts](fileBrowser.ts)**     - A collection of utilities for handling file system related tasks in the browser.
* **[invite.ts](invite.ts)**               - A collection of utilities for processing invitation related tasks.
* **[localhost.ts](localhost.ts)**         - The file that is sourced into the index.html file and generates the default browser experience.
* **[media.ts](media.ts)**                 - A library for executing audio/video calls.
* **[message.ts](message.ts)**             - A library for executing the text messaging application.
* **[modal.ts](modal.ts)**                 - A collection of utilities for generating and manipulating modals/windows in the browser.
* **[network.ts](network.ts)**             - The methods that execute data requests to the local terminal instance of the application.
* **[remote.ts](remote.ts)**               - A collection of instructions to allow event execution from outside the browser, like a remote control.
* **[share.ts](share.ts)**                 - The utilities that manage and coordinate changes to user share data.
* **[tutorial.ts](tutorial.ts)**           - An interactive tutorial explaining the application.
* **[util.ts](util.ts)**                   - Miscellaneous tools for the browser environment.
* **[webSocket.ts](webSocket.ts)**         - Handles web socket events and associated errors. This where most communications from outside the browser are processed.