# lib/terminal/server/transmission Code Files
These files are libraries are service end points behind network transmission.

## Files
<!-- Do not edit below this line.  Contents dynamically populated. -->

* **[ipResolve.ts](ipResolve.ts)**         - Tests connectivity to remote agents from among their known IP addresses.
* **[sender.ts](sender.ts)**               - Abstracts away the communication channel from the message.
* **[tools.ts](tools.ts)**                 - Generic transmission tools shared between HTTP and WS libraries.
* **[transmit_http.ts](transmit_http.ts)** - This library launches the HTTP service and all supporting service utilities.
* **[transmit_ws.ts](transmit_ws.ts)**     - A command utility for creating a websocket server or client.