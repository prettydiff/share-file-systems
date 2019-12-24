# lib/browser Code Files
These library files are imported into *localhost.js* and executed in the browser.

* **[audio.ts](audio.ts)**                   - A data structure containing base64 encoded audio samples and associated licensing information.
* **[browser.ts](browser.ts)**               - Shared variables need across multiple libraries are defined here.
* **[context.ts](context.ts)**               - various functions related to the right-click context menu.
* **[fs.ts](fs.ts)**                         - The fs library contains various functions related to file system requests/population.
* **[getNodesByType.ts](getNodesByType.ts)** - This is a single utility that extends the DOM to treat node types as a searchable metric no differently than tag name, class name, or id.
* **[invite.ts](invite.ts)**                 - The various interactions necessary to process the invitation steps.
* **[modal.ts](modal.ts)**                   - Modal provides various functions related to modals and the respective interaction.
* **[network.ts](network.ts)**               - This handles various requests for information to and from the terminal.  The browser is used for presentation, content, and user interaction.  Everything is processed from the terminal.
* **[settings.ts](settings.ts)**             - The interactions associated with the settings modal.
* **[share.ts](share.ts)**                   - The interactions necessary to share content and dynamically update the *shares* type modals.
* **[systems.ts](systems.ts)**               - The systems modal, which contains various status and error logs, is populated by functions located here.
* **[util.ts](util.ts)**                     - The remaining browser functions and utilities that don't really go anywhere else are located here.
* **[webSocket.ts](webSocket.ts)**           - The browser's webSocket handler is defined here.