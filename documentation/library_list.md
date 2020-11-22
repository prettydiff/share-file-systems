<!-- documentation/library_list - Automated list of all code and documentation files with brief descriptions. -->

# Share File Systems - Code Library List
This is a dynamically compiled list of supporting code files that comprise this application with a brief description of each file.

* Directory *[../documentation](../documentation)*
   - **[api.md](api.md)**                                                                                           - This documentation is collected from the interfaces defined in index.d.ts and their use in lib/terminal/server.ts.
   - **[code_style.md](code_style.md)**                                                                             - Describes rules for code conformance.
   - **[commands.md](commands.md)**                                                                                 - This documentation describes the various supported terminal commands and is automatically generated from `lib/terminal/utilities/commands_documentation.ts`.
   - **[credits.md](credits.md)**                                                                                   - A list of external source material not originally created within this project.
   - **[developer_guide.md](developer_guide.md)**                                                                   - A quick overview of the technical aspects for jumping to the project with a goal of extending the code.
   - **[file_copy.md](file_copy.md)**                                                                               - Notes on the flow control of file copy.
   - **[invitation.md](invitation.md)**                                                                             - Notes on the flow control of the invitation process.
   - **[library_list.md](library_list.md)**                                                                         - Automated list of all code and documentation files with brief descriptions.
   - **[linuxVM.md](linuxVM.md)**                                                                                   - Notes about configuring Linux virtual machines in support of project development.
   - **[modal.md](modal.md)**                                                                                       - Notes about modals and the graphic user interface that displays in the browser.
   - **[services.md](services.md)**                                                                                 - Notes and API details of supported services.
   - **[terminal_commands.md](terminal_commands.md)**                                                               - Documentation using application commands from the terminal.
   - **[test_browser.md](test_browser.md)**                                                                         - How this application achieves test automation.
* Directory *[../lib/browser](../lib/browser)*
   - **[../lib/browser/audio.ts](../lib/browser/audio.ts)**                                                         - A storage of audio samples encoded in Base64 with respective metadata.
   - **[../lib/browser/browser.ts](../lib/browser/browser.ts)**                                                     - A list of declared variables globally available to the browser instance of the application.
   - **[../lib/browser/context.ts](../lib/browser/context.ts)**                                                     - A collection of event handlers associated with the right click context menu.
   - **[../lib/browser/dom.ts](../lib/browser/dom.ts)**                                                             - Extensions to the DOM to provide navigational functionality not present from the standard methods
   - **[../lib/browser/fileBrowser.ts](../lib/browser/fileBrowser.ts)**                                             - A collection of utilities for handling file system related tasks in the browser.
   - **[../lib/browser/invite.ts](../lib/browser/invite.ts)**                                                       - A collection of utilities for processing invitation related tasks.
   - **[../lib/browser/localhost.ts](../lib/browser/localhost.ts)**                                                 - The file that is sourced into the index.html file and generates the default browser experience.
   - **[../lib/browser/message.ts](../lib/browser/message.ts)**                                                     - A library for executing the text messaging application.
   - **[../lib/browser/modal.ts](../lib/browser/modal.ts)**                                                         - A collection of utilities for generating and manipulating modals/windows in the browser.
   - **[../lib/browser/network.ts](../lib/browser/network.ts)**                                                     - The methods that execute data requests to the local terminal instance of the application.
   - **[../lib/browser/remote.ts](../lib/browser/remote.ts)**                                                       - A collection of instructions to allow event execution from outside the browser, like a remote control.
   - **[../lib/browser/settings.ts](../lib/browser/settings.ts)**                                                   - A collection of utilities and event handlers associated with processing the application state and system settings.
   - **[../lib/browser/share.ts](../lib/browser/share.ts)**                                                         - The utilities that manage and coordinate changes to user share data.
   - **[../lib/browser/util.ts](../lib/browser/util.ts)**                                                           - Miscellaneous tools for the browser environment.
   - **[../lib/browser/webSocket.ts](../lib/browser/webSocket.ts)**                                                 - Handles web socket events and associated errors. This where most communications from outside the browser are processed.
* Directory *[../lib/common](../lib/common)*
   - **[../lib/common/common.ts](../lib/common/common.ts)**                                                         - A collection of tools available to any environment.
* Directory *[../lib/terminal/commands](../lib/terminal/commands)*
   - **[../lib/terminal/commands/agent_data.ts](../lib/terminal/commands/agent_data.ts)**                           - Writes agent data to the shell.
   - **[../lib/terminal/commands/agent_online.ts](../lib/terminal/commands/agent_online.ts)**                       - A connectivity tester to shared remote agents.
   - **[../lib/terminal/commands/base64.ts](../lib/terminal/commands/base64.ts)**                                   - A command driven utility for performing base64 encoding/decoding.
   - **[../lib/terminal/commands/build.ts](../lib/terminal/commands/build.ts)**                                     - The library that executes the build and test tasks.
   - **[../lib/terminal/commands/certificate.ts](../lib/terminal/commands/certificate.ts)**                         - A command driven utility for creating an HTTPS certificate.
   - **[../lib/terminal/commands/commands.ts](../lib/terminal/commands/commands.ts)**                               - A command driven utility to list available commands and their respective documentation.
   - **[../lib/terminal/commands/copy.ts](../lib/terminal/commands/copy.ts)**                                       - A command driven utility to perform bit by bit file artifact copy.
   - **[../lib/terminal/commands/directory.ts](../lib/terminal/commands/directory.ts)**                             - A command driven utility to walk the file system and return a data structure.
   - **[../lib/terminal/commands/get.ts](../lib/terminal/commands/get.ts)**                                         - A command driven utility to fetch resources from across the internet via HTTP method GET.
   - **[../lib/terminal/commands/hash.ts](../lib/terminal/commands/hash.ts)**                                       - A command driven utility to generate hash sequences on strings or file system artifacts.
   - **[../lib/terminal/commands/help.ts](../lib/terminal/commands/help.ts)**                                       - A minor log sequence to output getting started instructions.
   - **[../lib/terminal/commands/lint.ts](../lib/terminal/commands/lint.ts)**                                       - A command driven wrapper for executing external application ESLint.
   - **[../lib/terminal/commands/mkdir.ts](../lib/terminal/commands/mkdir.ts)**                                     - A utility for recursively creating directories in the file system.
   - **[../lib/terminal/commands/remove.ts](../lib/terminal/commands/remove.ts)**                                   - A command driven utility to recursively remove file system artifacts.
   - **[../lib/terminal/commands/server.ts](../lib/terminal/commands/server.ts)**                                   - A command driven HTTP server for running the terminal instance of the application.
   - **[../lib/terminal/commands/test.ts](../lib/terminal/commands/test.ts)**                                       - A command driven wrapper for all test utilities.
   - **[../lib/terminal/commands/test_browser.ts](../lib/terminal/commands/test_browser.ts)**                       - A command driven wrapper for tests to be sent to the browser to impose changes to the DOM and test the result.
   - **[../lib/terminal/commands/test_browser_remote.ts](../lib/terminal/commands/test_browser_remote.ts)**         - Launches the server and puts the application on standby awaiting instructions from a remote agent.
   - **[../lib/terminal/commands/test_service.ts](../lib/terminal/commands/test_service.ts)**                       - A command driven wrapper for the service tests, which test the various services used by the application.
   - **[../lib/terminal/commands/test_simulation.ts](../lib/terminal/commands/test_simulation.ts)**                 - A command driven wrapper for running simulation tests of supported terminal commands.
   - **[../lib/terminal/commands/update.ts](../lib/terminal/commands/update.ts)**                                   - A command to update the application from git and then run the build.
   - **[../lib/terminal/commands/version.ts](../lib/terminal/commands/version.ts)**                                 - A command utility for expressing the application's version.
* Directory *[../lib/terminal/fileService](../lib/terminal/fileService)*
   - **[../lib/terminal/fileService/copyMessage.ts](../lib/terminal/fileService/copyMessage.ts)**                   - Generates status messaging for a copy operation.
   - **[../lib/terminal/fileService/copySameAgent.ts](../lib/terminal/fileService/copySameAgent.ts)**               - Copy items from one location to another on the same agent.
   - **[../lib/terminal/fileService/fileCallback.ts](../lib/terminal/fileService/fileCallback.ts)**                 - A callback to file system requests that provides directory tree data.
   - **[../lib/terminal/fileService/fileService.ts](../lib/terminal/fileService/fileService.ts)**                   - Manages various file system services.
   - **[../lib/terminal/fileService/httpRequest.ts](../lib/terminal/fileService/httpRequest.ts)**                   - Format a properly packaged http request for file services.
   - **[../lib/terminal/fileService/readOnly.ts](../lib/terminal/fileService/readOnly.ts)**                         - A library that stands before fileService.js to determine if the request for a remote resource is read only and then restrict access as a result.
   - **[../lib/terminal/fileService/remoteCopyList.ts](../lib/terminal/fileService/remoteCopyList.ts)**             - Generates a file system list from a remote agent so that the source agent knows what artifacts to request by name.
   - **[../lib/terminal/fileService/requestFiles.ts](../lib/terminal/fileService/requestFiles.ts)**                 - Pulls files from one agent to another.
   - **[../lib/terminal/fileService/reverseAgents.ts](../lib/terminal/fileService/reverseAgents.ts)**               - Convert data.copyAgent to data.agent and data.agent to data.copyAgent.
   - **[../lib/terminal/fileService/watchHandler.ts](../lib/terminal/fileService/watchHandler.ts)**                 - An event handler for file system watch events.
   - **[../lib/terminal/fileService/watchLocal.ts](../lib/terminal/fileService/watchLocal.ts)**                     - Broadcasts local file system changes to the browser.
* Directory *[../lib/terminal/server](../lib/terminal/server)*
   - **[../lib/terminal/server/createServer.ts](../lib/terminal/server/createServer.ts)**                           - This library launches the HTTP server and all supporting service utilities.
   - **[../lib/terminal/server/forbiddenUser.ts](../lib/terminal/server/forbiddenUser.ts)**                         - A single function for handling rejected HTTP responses associated with disallowed requests.
   - **[../lib/terminal/server/hashIdentity.ts](../lib/terminal/server/hashIdentity.ts)**                           - Compares a security token to a generated hash to bypass typical file service security restrictions
   - **[../lib/terminal/server/heartbeat.ts](../lib/terminal/server/heartbeat.ts)**                                 - The code that manages sending and receiving user online status updates.
   - **[../lib/terminal/server/httpClient.ts](../lib/terminal/server/httpClient.ts)**                               - A library for handling all child HTTP requests.
   - **[../lib/terminal/server/invite.ts](../lib/terminal/server/invite.ts)**                                       - Manages the order of invitation related processes for traffic across the internet.
   - **[../lib/terminal/server/message.ts](../lib/terminal/server/message.ts)**                                     - Process and send text messages.
   - **[../lib/terminal/server/methodGET.ts](../lib/terminal/server/methodGET.ts)**                                 - The library for handling all traffic related to HTTP requests with method GET.
   - **[../lib/terminal/server/methodPOST.ts](../lib/terminal/server/methodPOST.ts)**                               - The library for handling all traffic related to HTTP requests with method POST.
   - **[../lib/terminal/server/response.ts](../lib/terminal/server/response.ts)**                                   - A uniform means of handling HTTP responses.
   - **[../lib/terminal/server/serverVars.ts](../lib/terminal/server/serverVars.ts)**                               - A library of variables globally available for all server related tasks.
   - **[../lib/terminal/server/serverWatch.ts](../lib/terminal/server/serverWatch.ts)**                             - A library that establishes a file system watch respective to the application itself.
   - **[../lib/terminal/server/storage.ts](../lib/terminal/server/storage.ts)**                                     - A library for writing data to storage.
* Directory *[../lib/terminal/test/application](../lib/terminal/test/application)*
   - **[../lib/terminal/test/application/browser.ts](../lib/terminal/test/application/browser.ts)**                 - The functions necessary to run browser test automation.
   - **[../lib/terminal/test/application/complete.ts](../lib/terminal/test/application/complete.ts)**               - Final messaging for a completed test type.
   - **[../lib/terminal/test/application/evaluation.ts](../lib/terminal/test/application/evaluation.ts)**           - Evaluate a given test item and report appropriate failure messaging.
   - **[../lib/terminal/test/application/runner.ts](../lib/terminal/test/application/runner.ts)**                   - A test runner that loops through test items in serial, executes those test items, and passes the result message to the evaluation library.
   - **[../lib/terminal/test/application/service.ts](../lib/terminal/test/application/service.ts)**                 - A list of service test related utilities.
* Directory *[../lib/terminal/test/samples](../lib/terminal/test/samples)*
   - **[../lib/terminal/test/samples/browser.ts](../lib/terminal/test/samples/browser.ts)**                         - A list of tests that execute in the web browser.
   - **[../lib/terminal/test/samples/service.ts](../lib/terminal/test/samples/service.ts)**                         - A list of service tests.
   - **[../lib/terminal/test/samples/simulation.ts](../lib/terminal/test/samples/simulation.ts)**                   - A list of command related tests for running shell simulations against the supported commands.
   - **[../lib/terminal/test/samples/simulation.ts](../lib/terminal/test/samples/simulation.ts)**                   - A list of command related tests for running shell simulations against the supported commands.
* Directory *[../lib/terminal/utilities](../lib/terminal/utilities)*
   - **[../lib/terminal/utilities/commandList.ts](../lib/terminal/utilities/commandList.ts)**                       - Groups all supported command functions into an object for single point of reference.
   - **[../lib/terminal/utilities/commandName.ts](../lib/terminal/utilities/commandName.ts)**                       - A library for visually presenting command documentation to the terminal.
   - **[../lib/terminal/utilities/commands_documentation.ts](../lib/terminal/utilities/commands_documentation.ts)** - A data structure defining command documentation with usage examples.
   - **[../lib/terminal/utilities/error.ts](../lib/terminal/utilities/error.ts)**                                   - A utility for processing and logging errors from the terminal application.
   - **[../lib/terminal/utilities/humanTime.ts](../lib/terminal/utilities/humanTime.ts)**                           - A utility to generate human readable time sequences.
   - **[../lib/terminal/utilities/lists.ts](../lib/terminal/utilities/lists.ts)**                                   - A utility for visually presenting lists of data to the terminal's console.
   - **[../lib/terminal/utilities/log.ts](../lib/terminal/utilities/log.ts)**                                       - A log utility for displaying multiple lines of text to the terminal.
   - **[../lib/terminal/utilities/readFile.ts](../lib/terminal/utilities/readFile.ts)**                             - A utility to read files as text, if text, or as binary, if binary.
   - **[../lib/terminal/utilities/readStorage.ts](../lib/terminal/utilities/readStorage.ts)**                       - Reads all the storage files and returns a data structure to a callback
   - **[../lib/terminal/utilities/vars.ts](../lib/terminal/utilities/vars.ts)**                                     - Globally available variables for the terminal utility.
   - **[../lib/terminal/utilities/wrapIt.ts](../lib/terminal/utilities/wrapIt.ts)**                                 - A tool to perform word wrap when printing text to the shell.
* Directory *[../lib/typescript](../lib/typescript)*
   - **[../lib/typescript/browser.d.ts](../lib/typescript/browser.d.ts)**                                           - TypeScript interfaces used by browser specific libraries.
   - **[../lib/typescript/browser_modules.d.ts](../lib/typescript/browser_modules.d.ts)**                           - TypeScript interfaces that define master library modules used in the browser.
   - **[../lib/typescript/environment.d.ts](../lib/typescript/environment.d.ts)**                                   - TypeScript interfaces that define environmental objects.
   - **[../lib/typescript/fileService.d.ts](../lib/typescript/fileService.d.ts)**                                   - TypeScript interfaces used by the file services.
   - **[../lib/typescript/global.d.ts](../lib/typescript/global.d.ts)**                                             - TypeScript interfaces used in many unrelated areas of the application.
   - **[../lib/typescript/terminal.d.ts](../lib/typescript/terminal.d.ts)**                                         - TypeScript interfaces used by terminal specific libraries.
   - **[../lib/typescript/test.d.ts](../lib/typescript/test.d.ts)**                                                 - TypeScript interfaces used test automation.
   - **[../lib/typescript/types.d.ts](../lib/typescript/types.d.ts)**                                               - TypeScript static types.