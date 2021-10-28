# lib/terminal/server Code Files
These files are libraries that comprise */lib/terminal/server.ts* **which in turn comprises *application.ts*.

## Files
<!-- Do not edit below this line.  Contents dynamically populated. -->

* **[forbiddenUser.ts](forbiddenUser.ts)**   - A single function for handling rejected HTTP responses associated with disallowed requests.
* **[hashIdentity.ts](hashIdentity.ts)**     - Compares a security token to a generated hash to bypass typical file service security restrictions
* **[heartbeat.ts](heartbeat.ts)**           - The code that manages sending and receiving user online status updates.
* **[httpAgent.ts](httpAgent.ts)**           - This library launches the HTTP service and all supporting service utilities.
* **[invite.ts](invite.ts)**                 - Manages the order of invitation related processes for traffic across the internet.
* **[ipResolve.ts](ipResolve.ts)**           - Tests connectivity to remote agents from among their known IP addresses.
* **[message.ts](message.ts)**               - Process and send text messages.
* **[methodGET.ts](methodGET.ts)**           - The library for handling all traffic related to HTTP requests with method GET.
* **[osNotification.ts](osNotification.ts)** - This library sends user messaging notifications to the operating system.
* **[receiver.ts](receiver.ts)**             - The library for handling all traffic related to HTTP requests with method POST.
* **[responder.ts](responder.ts)**           - Send network output, whether an http response or websocket.
* **[serverVars.ts](serverVars.ts)**         - A library of variables globally available for all server related tasks.
* **[settings.ts](settings.ts)**             - A library for writing data to settings.
* **[websocket.ts](websocket.ts)**           - A command utility for creating a websocket server or client.