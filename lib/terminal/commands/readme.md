# lib/terminal/commands Code Files
The terminal libraries that executable as either an included library or as a command from the terminal.

## Files
<!-- Do not edit below this line.  Contents dynamically populated. -->

* **[build.ts](build.ts)**                     - The library that executes the build and test tasks.
* **[remove.ts](remove.ts)**                   - A command driven utility to recursively remove file system artifacts.
* **[service.ts](service.ts)**                 - A command driven HTTP service for running the terminal instance of the application.
* **[test.ts](test.ts)**                       - A command driven wrapper for all test utilities.
* **[test_browser.ts](test_browser.ts)**       - A command driven wrapper for tests to be sent to the browser to impose changes to the DOM and test the result.
* **[test_service.ts](test_service.ts)**       - A command driven wrapper for the service tests, which test the various services used by the application.
* **[test_simulation.ts](test_simulation.ts)** - A command driven wrapper for running simulation tests of supported terminal commands.
* **[update.ts](update.ts)**                   - A command to update the application from git and then run the build.
* **[websocket.ts](websocket.ts)**             - A utility to start a websocket server from the terminal.