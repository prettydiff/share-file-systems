# lib/terminal/server
These files are libraries that comprise */lib/terminal/server.ts* **which in turn comprises *application.ts*.

* **fileService.ts** - This library executes various file system tasks as requested by user interaction from the browser.
* **forbiddenUser.ts** - Provides a single location for deleting users based upon network response whether local or remote.
* **heartbeat.ts** - This library executes network related tasks for user activity status.
* **httpClient.ts** - A library that spawns an HTTP client to make a request to another computer.
* **invite.ts** - All network tasks related to inviting a user is handled in this file.
* **methodGET.ts** - The HTTP server's GET request method is handled by this library.
* **readOnly.ts** - A security layer to prevent block outgoing and incoming instructions that violate modification to areas designated as read only.
* **serverVars.ts** - All variables used across the various server libraries are defined here.
* **serverWatch.ts** - This library contains a handler for a file system watcher of this application.
* **storage.ts** - This library writes to the various data storage files located in the */storage* **directory.