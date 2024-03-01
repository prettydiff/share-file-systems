# lib/browser/utilities
Tools and assistive functions for the browser environment associated more with automation than content interaction.

## Files
<!-- Do not edit below this line.  Contents dynamically populated. -->

* **[addAgent.ts](addAgent.ts)**                           - Populates agents into the browser UI.
* **[agent_change.ts](agent_change.ts)**                   - Modifies agent related data in share modals.
* **[agent_status.ts](agent_status.ts)**                   - Receive and process agent activity status notifications from the network.
* **[audio.ts](audio.ts)**                                 - A storage of audio samples encoded in Base64 with respective metadata.
* **[browser.ts](browser.ts)**                             - A list of declared variables globally available to the browser instance of the application.
* **[deleteAgents.ts](deleteAgents.ts)**                   - Removes agents.
* **[dom.ts](dom.ts)**                                     - Extensions to the DOM to provide navigational functionality not present from the standard methods
* **[file_address.ts](file_address.ts)**                   - Ensures all functionality is enforced with the address change of a file navigate modal.
* **[file_directory.ts](file_directory.ts)**               - Event handler for navigating directories in a file navigate modal.
* **[file_select.ts](file_select.ts)**                     - Changes a file list item to a selected state.
* **[file_select_addresses.ts](file_select_addresses.ts)** - Gathers all items from a file list in a selected state.
* **[file_select_none.ts](file_select_none.ts)**           - Event handler for the address field of the file navigate modals.
* **[file_select_none.ts](file_select_none.ts)**           - Ensures all items in a file list display and function in an unselected state.
* **[invite_ask.ts](invite_ask.ts)**                       - Modal configuration for invitations from remote agents.
* **[invite_decline.ts](invite_decline.ts)**               - An event handler associated with closing invitation modals which require sending feedback.
* **[invite_remote.ts](invite_remote.ts)**                 - Modal content for invitations from remote agents.
* **[media_kill.ts](media_kill.ts)**                       - Closes a media modal and closes all associated streams.
* **[modal.ts](modal.ts)**                                 - A collection of utilities for generating and manipulating modals/windows in the browser.
* **[modal_close.ts](modal_close.ts)**                     - An event handler associated with closing modals.
* **[modal_configuration.ts](modal_configuration.ts)**     - A single location for storing all modal content configurations by modal type.
* **[modal_fileNavigate.ts](modal_fileNavigate.ts)**       - Modal configuration for file navigate modals.
* **[modal_message.ts](modal_message.ts)**                 - Modal configuration for message modals.
* **[modal_shares.ts](modal_shares.ts)**                   - Modal configuration for share type modals.
* **[modal_terminal.ts](modal_terminal.ts)**               - Modal configuration for terminal modals.
* **[receiver.ts](receiver.ts)**                           - Routes network messages to the respective browser library.
* **[remote.ts](remote.ts)**                               - A collection of instructions to allow event execution from outside the browser, like a remote control.
* **[share_content.ts](share_content.ts)**                 - The content of share modals.
* **[share_update.ts](share_update.ts)**                   - A utility to dynamically update the content of share modals.
* **[util.ts](util.ts)**                                   - Miscellaneous tools for the browser environment.
* **[webSocket.ts](webSocket.ts)**                         - Handles web socket events and associated errors. This where most communications from outside the browser are processed.
* **[zTop.ts](zTop.ts)**                                   - Stacks modals visually to account for overlap.