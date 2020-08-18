# lib/terminal/commands Code Files
The terminal libraries that executable as either an included library or as a command from the terminal.

## Files
<!-- Do not edit below this line.  Contents dynamically populated. -->

* **[agent_data.ts](agent_data.ts)**           - Writes agent data to the shell.
* **[agent_online.ts](agent_online.ts)**       - A connectivity tester to shared remote agents.
* **[base64.ts](base64.ts)**                   - A command driven utility for performing base64 encoding/decoding.
* **[build.ts](build.ts)**                     - The library that executes the build and test tasks.
* **[certificate.ts](certificate.ts)**         - A command driven utility for creating an HTTPS certificate.
* **[commands.ts](commands.ts)**               - A command driven utility to list available commands and their respective documentation.
* **[copy.ts](copy.ts)**                       - A command driven utility to perform bit by bit file artifact copy.
* **[directory.ts](directory.ts)**             - A command driven utility to walk the file system and return a data structure.
* **[get.ts](get.ts)**                         - A command driven utility to fetch resources from across the internet via HTTP method GET.
* **[hash.ts](hash.ts)**                       - A command driven utility to generate hash sequences on strings or file system artifacts.
* **[help.ts](help.ts)**                       - A minor log sequence to output getting started instructions.
* **[lint.ts](lint.ts)**                       - A command driven wrapper for executing external application ESLint.
* **[mkdir.ts](mkdir.ts)**                     - A utility for recursively creating directories in the file system.
* **[remove.ts](remove.ts)**                   - A command driven utility to recursively remove file system artifacts.
* **[server.ts](server.ts)**                   - A command driven HTTP server for running the terminal instance of the application.
* **[test.ts](test.ts)**                       - A command driven wrapper for all test utilities.
* **[test_browser.ts](test_browser.ts)**       - A command driven wrapper for tests to be sent to the browser to impose changes to the DOM and test the result.
* **[test_service.ts](test_service.ts)**       - A command driven wrapper for the service tests, which test the various services used by the application.
* **[test_simulation.ts](test_simulation.ts)** - A command driven wrapper for running simulation tests of supported terminal commands.
* **[update.ts](update.ts)**                   - A command to update the application from git and then run the build.
* **[version.ts](version.ts)**                 - A command utility for expressing the application's version.