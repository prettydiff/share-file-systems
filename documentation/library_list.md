# Share File Systems - Code Library List
This is a dynamically compiled list of supporting code files that comprise this application with a brief description of each file.

* **[../lib/browser/audio.ts](../lib/browser/audio.ts)**                                                         - A storage of audio samples encoded in Base64 with respective metadata.
* **[../lib/browser/browser.ts](../lib/browser/browser.ts)**                                                     - A list of declared variables globally available to the browser instance of the application.
* **[../lib/browser/context.ts](../lib/browser/context.ts)**                                                     - A collection of event handlers associated with the right click context menu.
* **[../lib/browser/fs.ts](../lib/browser/fs.ts)**                                                               - A collection of utilities for handling file system related tasks in the browser.
* **[../lib/browser/getNodesByType.ts](../lib/browser/getNodesByType.ts)**                                       - An extension for the DOM to request descendant nodes by node type.
* **[../lib/browser/invite.ts](../lib/browser/invite.ts)**                                                       - A collection of utilities for processing invitation related tasks.
* **[../lib/browser/modal.ts](../lib/browser/modal.ts)**                                                         - A collection of utilities for generating and manipulating modals/windows in the browser.
* **[../lib/browser/network.ts](../lib/browser/network.ts)**                                                     - The methods that execute data requests to the local terminal instance of the application.
* **[../lib/browser/settings.ts](../lib/browser/settings.ts)**                                                   - A collection of utilities and event handlers associated with processing the users application state and system settings.
* **[../lib/browser/share.ts](../lib/browser/share.ts)**                                                         - The utilities that manage and coordinate changes to user share data.
* **[../lib/browser/systems.ts](../lib/browser/systems.ts)**                                                     - The systems messaging utility is managed by these methods.
* **[../lib/browser/util.ts](../lib/browser/util.ts)**                                                           - Miscellaneous tools for the browser environment.
* **[../lib/browser/webSocket.ts](../lib/browser/webSocket.ts)**                                                 - Handles web socket events and associated errors. This where most communications from outside the browser are processed.
* **[../lib/common/commas.ts](../lib/common/commas.ts)**                                                         - Converts numbers into a string of comma separated triplets.
* **[../lib/common/deviceShare.ts](../lib/common/deviceShare.ts)**                                               - Converts the local device list into a flattened object of shares for remote users.
* **[../lib/common/prettyBytes.ts](../lib/common/prettyBytes.ts)**                                               - Rounds data sizes to human readable powers of 1024.
* **[../lib/terminal/commands/base64.ts](../lib/terminal/commands/base64.ts)**                                   - A command driven utility for performing base64 encoding/decoding.
* **[../lib/terminal/commands/build.ts](../lib/terminal/commands/build.ts)**                                     - The library that executes the build and test tasks.
* **[../lib/terminal/commands/commands.ts](../lib/terminal/commands/commands.ts)**                               - A command driven utility to list available commands and their respective documentation.
* **[../lib/terminal/commands/copy.ts](../lib/terminal/commands/copy.ts)**                                       - A command driven utility to perform bit by bit file artifact copy.
* **[../lib/terminal/commands/directory.ts](../lib/terminal/commands/directory.ts)**                             - A command driven utility to walk the file system and return a data structure.
* **[../lib/terminal/commands/get.ts](../lib/terminal/commands/get.ts)**                                         - A command driven utility to fetch resources from across the internet via HTTP method GET.
* **[../lib/terminal/commands/hash.ts](../lib/terminal/commands/hash.ts)**                                       - A command driven utility to generate hash sequences on strings or file system artifacts.
* **[../lib/terminal/commands/help.ts](../lib/terminal/commands/help.ts)**                                       - A minor log sequence to output getting started instructions.
* **[../lib/terminal/commands/lint.ts](../lib/terminal/commands/lint.ts)**                                       - A command driven wrapper for executing external application ESLint.
* **[../lib/terminal/commands/remove.ts](../lib/terminal/commands/remove.ts)**                                   - A command driven utility to recursively remove file system artifacts.
* **[../lib/terminal/commands/server.ts](../lib/terminal/commands/server.ts)**                                   - A command driven HTTP server for running the terminal instance of the application.
* **[../lib/terminal/commands/test.ts](../lib/terminal/commands/test.ts)**                                       - A command driven wrapper for all test utilities.
* **[../lib/terminal/commands/test_service.ts](../lib/terminal/commands/test_service.ts)**                       - A command driven wrapper for the service tests, which test the various services used by the application.
* **[../lib/terminal/commands/test_simulation.ts](../lib/terminal/commands/test_simulation.ts)**                 - A command driven wrapper for running simulation tests of supported terminal commands.
* **[../lib/terminal/commands/version.ts](../lib/terminal/commands/version.ts)**                                 - A command utility for expressing the application's version.
* **[../lib/terminal/server/fileService.ts](../lib/terminal/server/fileService.ts)**                             - This library executes various file system related services and actions.
* **[../lib/terminal/server/forbiddenUser.ts](../lib/terminal/server/forbiddenUser.ts)**                         - A single function for handling rejected HTTP responses associated with disallowed requests.
* **[../lib/terminal/server/heartbeat.ts](../lib/terminal/server/heartbeat.ts)**                                 - The code that manages sending and receiving user online status updates.
* **[../lib/terminal/server/httpClient.ts](../lib/terminal/server/httpClient.ts)**                               - A library for handling all child HTTP requests.
* **[../lib/terminal/server/invite.ts](../lib/terminal/server/invite.ts)**                                       - Manages the order of invitation related processes for traffic across the internet.
* **[../lib/terminal/server/methodGET.ts](../lib/terminal/server/methodGET.ts)**                                 - The library for handling all traffic related to HTTP requests with method GET.
* **[../lib/terminal/server/readOnly.ts](../lib/terminal/server/readOnly.ts)**                                   - A library that stands before fileService.js to determine if the request for a remote resource is read only and then restrict access as a result.
* **[../lib/terminal/server/serverVars.ts](../lib/terminal/server/serverVars.ts)**                               - A library of variables globally available for all server related tasks.
* **[../lib/terminal/server/serverWatch.ts](../lib/terminal/server/serverWatch.ts)**                             - A library that establishes a file system watch respective to the application itself.
* **[../lib/terminal/server/storage.ts](../lib/terminal/server/storage.ts)**                                     - A library for writing data to storage.
* **[../lib/terminal/test/service.ts](../lib/terminal/test/service.ts)**                                         - A list of service related tests.
* **[../lib/terminal/test/simulation.ts](../lib/terminal/test/simulation.ts)**                                   - A list of command related tests for run shell simulations against the supported commands.
* **[../lib/terminal/test/testListRunner.ts](../lib/terminal/test/testListRunner.ts)**                           - A test runner.
* **[../lib/terminal/utilities/commandName.ts](../lib/terminal/utilities/commandName.ts)**                       - A library for visually presenting command documentation to the terminal.
* **[../lib/terminal/utilities/commands_documentation.ts](../lib/terminal/utilities/commands_documentation.ts)** - A data structure defining command documentation with usage examples.
* **[../lib/terminal/utilities/error.ts](../lib/terminal/utilities/error.ts)**                                   - A utility for processing and logging errors from the terminal application.
* **[../lib/terminal/utilities/humanTime.ts](../lib/terminal/utilities/humanTime.ts)**                           - A utility to generate human readable time sequences.
* **[../lib/terminal/utilities/lists.ts](../lib/terminal/utilities/lists.ts)**                                   - A utility for visually presenting lists of data to the terminal's console.
* **[../lib/terminal/utilities/log.ts](../lib/terminal/utilities/log.ts)**                                       - A log utility for displaying multiple lines of text to the terminal.
* **[../lib/terminal/utilities/makeDir.ts](../lib/terminal/utilities/makeDir.ts)**                               - A utility for creating directories in the file system.
* **[../lib/terminal/utilities/readFile.ts](../lib/terminal/utilities/readFile.ts)**                             - A utility to read files as text, if text, or as binary, if binary.
* **[../lib/terminal/utilities/vars.ts](../lib/terminal/utilities/vars.ts)**                                     - Globally available variables for the terminal utility.
* **[../lib/terminal/utilities/wrapIt.ts](../lib/terminal/utilities/wrapIt.ts)**                                 - A tool to perform word wrap when printing text to the shell.