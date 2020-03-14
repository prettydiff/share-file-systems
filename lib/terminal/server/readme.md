# lib/terminal/server Code Files
These files are libraries that comprise */lib/terminal/server.ts* **which in turn comprises *application.ts*.

## Files
Do not edit below this line.  Contents dynamically populated.

* **[fileService.ts](fileService.ts)**     - This library executes various file system related services and actions.
* **[forbiddenUser.ts](forbiddenUser.ts)** - A single function for handling rejected HTTP responses associated with disallowed requests.
* **[heartbeat.ts](heartbeat.ts)**         - The code that manages sending and receiving user online status updates.
* **[httpClient.ts](httpClient.ts)**       - A library for handling all child HTTP requests.
* **[invite.ts](invite.ts)**               - Manages the order of invitation related processes for traffic across the internet.
* **[methodGET.ts](methodGET.ts)**         - The library for handling all traffic related to HTTP requests with method GET.
* **[readOnly.ts](readOnly.ts)**           - A library that stands before fileService.js to determine if the request for a remote resource is read only and then restrict access as a result.
* **[serverVars.ts](serverVars.ts)**       - A library of variables globally available for all server related tasks.
* **[serverWatch.ts](serverWatch.ts)**     - A library that establishes a file system watch respective to the application itself.
* **[storage.ts](storage.ts)**             - A library for writing data to storage.