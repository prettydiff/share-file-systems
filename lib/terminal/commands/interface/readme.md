# lib/terminal/commands/interface Code Files
The interface files that interpret shell arguments for corresponding libraries located at [../library/](../library/).

## Files
<!-- Do not edit below this line.  Contents dynamically populated. -->

* **[agent_data.ts](agent_data.ts)**           - Shell interface for agent_data which forms a report of agent data points.
* **[agent_online.ts](agent_online.ts)**       - Shell interface for agent_online which is a connectivity tester to remote agents.
* **[base64.ts](base64.ts)**                   - Shell interface for base64, which provides base64 encoding/decoding.
* **[build.ts](build.ts)**                     - Shell interface to the build tool.
* **[certificate.ts](certificate.ts)**         - Shell interface for creating certificates.
* **[commands.ts](commands.ts)**               - Shell interface for generating dynamic command documentation.
* **[copy.ts](copy.ts)**                       - Shell interface for the file copy command.
* **[directory.ts](directory.ts)**             - Shell interface to the directory library that walks the file system and returns a data structure.
* **[get.ts](get.ts)**                         - Shell interface for http get command.
* **[hash.ts](hash.ts)**                       - Shell interface to library hash, which generates a hash string.
* **[lint.ts](lint.ts)**                       - Shell interface for executing TypeScript lint as configured by this application.
* **[mkdir.ts](mkdir.ts)**                     - Shell interface to utility mkdir for creating directory structures recursively.
* **[remove.ts](remove.ts)**                   - Shell interface for removing file system artifacts.
* **[service.ts](service.ts)**                 - Shell interface for running the application's network services, the applications default command.
* **[test.ts](test.ts)**                       - Shell interface wrapping all test automation utilities.
* **[test_browser.ts](test_browser.ts)**       - Shell interface for tests to be sent to the browser to impose changes to the DOM and test the result.
* **[test_service.ts](test_service.ts)**       - Shell interface for the service tests, which test the various services used by the application.
* **[test_simulation.ts](test_simulation.ts)** - Shell interface for running simulation tests of supported terminal commands.
* **[typescript.ts](typescript.ts)**           - Interface to execute TypeScript type evaluation.
* **[version.ts](version.ts)**                 - Shell interface for expressing the application's version.
* **[websocket.ts](websocket.ts)**             - Shell interface to start a websocket server from the terminal.