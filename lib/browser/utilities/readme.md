# lib/browser/utilities
Tools and assistive functions for the browser environment associated more with automation than content interaction.

## Files
<!-- Do not edit below this line.  Contents dynamically populated. -->

* **[agent_add.ts](agent_add.ts)**                             - Adds agents to the UI.
* **[agent_change.ts](agent_change.ts)**                       - Modifies agent related data in share modals.
* **[agent_delete.ts](agent_delete.ts)**                       - Removes an agent from the UI.
* **[agent_status.ts](agent_status.ts)**                       - Receive and process agent activity status notifications from the network.
* **[audio.ts](audio.ts)**                                     - A storage of audio samples encoded in Base64 with respective metadata.
* **[browser.ts](browser.ts)**                                 - A list of declared variables globally available to the browser instance of the application.
* **[configuration_radio.ts](configuration_radio.ts)**         - A tool to dynamically organize a list of input elements into a collection of radio buttons.
* **[configuration_styleText.ts](configuration_styleText.ts)** - Modifies a dynamically populated stylesheet with user specified colors.
* **[context_copy.ts](context_copy.ts)**                       - File system copy function from the context menu.
* **[context_destroy.ts](context_destroy.ts)**                 - File system destroy function from the context menu.
* **[context_paste.ts](context_paste.ts)**                     - File system paste function from the context menu.
* **[context_rename.ts](context_rename.ts)**                   - File system rename function from the context menu.
* **[context_share.ts](context_share.ts)**                     - File system share function from the context menu.
* **[deleteAgents.ts](deleteAgents.ts)**                       - Removes agents.
* **[dom.ts](dom.ts)**                                         - Extensions to the DOM to provide navigational functionality not present from the standard methods
* **[file_address.ts](file_address.ts)**                       - Ensures all functionality is enforced with the address change of a file navigate modal.
* **[file_directory.ts](file_directory.ts)**                   - Event handler for navigating directories in a file navigate modal.
* **[file_select.ts](file_select.ts)**                         - Changes a file list item to a selected state.
* **[file_select_addresses.ts](file_select_addresses.ts)**     - Gathers all items from a file list in a selected state.
* **[file_select_none.ts](file_select_none.ts)**               - Ensures all items in a file list display and function in an unselected state.
* **[file_select_none.ts](file_select_none.ts)**               - Event handler for the address field of the file navigate modals.
* **[file_status.ts](file_status.ts)**                         - File navigate modal type contents.
* **[invite_decline.ts](invite_decline.ts)**                   - An event handler associated with closing invitation modals which require sending feedback.
* **[invite_remote.ts](invite_remote.ts)**                     - Modal content for invitations from remote agents.
* **[media_kill.ts](media_kill.ts)**                           - Closes a media modal and closes all associated streams.
* **[message_post.ts](message_post.ts)**                       - A utility to process and text messages for transport and display in the UI.
* **[modal.ts](modal.ts)**                                     - A collection of utilities for generating and manipulating modals/windows in the browser.
* **[modal_close.ts](modal_close.ts)**                         - An event handler associated with closing modals.
* **[modal_configuration.ts](modal_configuration.ts)**         - A single location for storing all modal content configurations by modal type.
* **[modal_footerResize.ts](modal_footerResize.ts)**           - An event handler associated with resizing the footer areas of certain modals.
* **[modal_shareUpdate.ts](modal_shareUpdate.ts)**             - Updates existing modals with new share content.
* **[modal_textSave.ts](modal_textSave.ts)**                   - Saves changes of user authored text as a state artifact.
* **[modal_textTimer.ts](modal_textTimer.ts)**                 - A imposes an idle timer on user text areas after which the text is saved as a state artifact.
* **[remote.ts](remote.ts)**                                   - A collection of instructions to allow event execution from outside the browser, like a remote control.
* **[share_content.ts](share_content.ts)**                     - The content of share modals.
* **[share_update.ts](share_update.ts)**                       - A utility to dynamically update the content of share modals.
* **[terminal_send.ts](terminal_send.ts)**                     - Transmit terminal IO on a custom socket.
* **[util.ts](util.ts)**                                       - Miscellaneous tools for the browser environment.
* **[websocket_open.ts](websocket_open.ts)**                   - Opens websocket connections using standard web APIs in the browser.
* **[websocket_primary.ts](websocket_primary.ts)**             - Handles web socket events and associated errors. This where most communications from outside the browser are processed.
* **[zTop.ts](zTop.ts)**                                       - Stacks modals visually to account for overlap.