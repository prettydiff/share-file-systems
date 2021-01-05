# lib/terminal/server Code Files
These files are libraries that comprise */lib/terminal/fileService/fileService.ts* which are used to perform file system operations as a networked service.

## Files
<!-- Do not edit below this line.  Contents dynamically populated. -->

* **[copyMessage.ts](copyMessage.ts)**       - Generates status messaging for a copy operation.
* **[copySameAgent.ts](copySameAgent.ts)**   - Copy items from one location to another on the same agent.
* **[copyService.ts](copyService.ts)**       - A library that stores instructions for copy and cut of file system artifacts.
* **[fileCallback.ts](fileCallback.ts)**     - A callback to file system requests that provides directory tree data.
* **[fileService.ts](fileService.ts)**       - Manages various file system services.
* **[fileServices.ts](fileServices.ts)**     - Manages various file system services.
* **[httpRequest.ts](httpRequest.ts)**       - Format a properly packaged http request for file services.
* **[readOnly.ts](readOnly.ts)**             - A library that stands before fileService.js to determine if the request for a remote resource is read only and then restrict access as a result.
* **[remoteCopyList.ts](remoteCopyList.ts)** - Generates a file system list from a remote agent so that the source agent knows what artifacts to request by name.
* **[requestFiles.ts](requestFiles.ts)**     - Pulls files from one agent to another.
* **[watchHandler.ts](watchHandler.ts)**     - An event handler for file system watch events.
* **[watchLocal.ts](watchLocal.ts)**         - Broadcasts local file system changes to the browser.