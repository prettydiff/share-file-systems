# lib/browser Code Files
These library files are imported into *localhost.js* and executed in the browser.

* **audio.ts** - A data structure containing base64 encoded audio samples and associated licensing information.
* **browser.ts** - Shared variables need across multiple libraries are defined here.
* **context.ts** - various functions related to the right-click context menu.
* **fs.ts** - The fs library contains various functions related to file system requests/population.
* **getNodesByType.ts** - This is a single utility that extends the DOM to treat node types as a searchable metric no differently than tag name, class name, or id.
* **modal.ts** - Modal provides various functions related to modals and the respective interaction.
* **network.ts** - This handles various requests for information to and from the terminal.  The browser is used for presentation, content, and user interaction.  Everything is processed from the terminal.
* **systems.ts** - The systems modal, which contains various status and error logs, is populated by functions located here.
* **util.ts** - The remaining browser functions and utilities that don't really go anywhere else are located here.
* **webSocket.ts** - The browser's webSocket handler is defined here.