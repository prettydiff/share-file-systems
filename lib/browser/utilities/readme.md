# lib/browser/utilities
Tools and assistive functions for the browser environment associated more with automation than content interaction.

## Files
<!-- Do not edit below this line.  Contents dynamically populated. -->

* **[agent_hash.ts](agent_hash.ts)**                   - Generates a local user identity.
* **[agent_status.ts](agent_status.ts)**               - Receive and process agent activity status notifications from the network.
* **[audio.ts](audio.ts)**                             - A storage of audio samples encoded in Base64 with respective metadata.
* **[browser.ts](browser.ts)**                         - A list of declared variables globally available to the browser instance of the application.
* **[dom.ts](dom.ts)**                                 - Extensions to the DOM to provide navigational functionality not present from the standard methods
* **[modal.ts](modal.ts)**                             - A collection of utilities for generating and manipulating modals/windows in the browser.
* **[modal_configuration.ts](modal_configuration.ts)** - A single location for storing all modal content configurations by modal type.
* **[network.ts](network.ts)**                         - The methods that execute data requests to the local terminal instance of the application.
* **[remote.ts](remote.ts)**                           - A collection of instructions to allow event execution from outside the browser, like a remote control.
* **[util.ts](util.ts)**                               - Miscellaneous tools for the browser environment.
* **[webSocket.ts](webSocket.ts)**                     - Handles web socket events and associated errors. This where most communications from outside the browser are processed.