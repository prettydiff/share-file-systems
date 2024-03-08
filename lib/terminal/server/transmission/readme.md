# lib/terminal/server/transmission Code Files
These files are libraries are service end points behind network transmission.

## Files
<!-- Do not edit below this line.  Contents dynamically populated. -->

* **[http.ts](http.ts)**                   - Parses incoming messages from the network.
* **[http_get.ts](http_get.ts)**           - A library to process HTTP GET responses.
* **[network.ts](network.ts)**             - Generic transmission tools shared between HTTP and WS libraries.
* **[receiver.ts](receiver.ts)**           - Routes incoming messages from the network to the respective libraries.
* **[transmit_http.ts](transmit_http.ts)** - This library launches the HTTP service and all supporting service utilities.
* **[transmit_ws.ts](transmit_ws.ts)**     - A command utility for creating a websocket server or client.