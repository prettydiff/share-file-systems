# lib/terminal/utilities Code Files
The various utility libraries for the terminal instance of the application.

## Files
<!-- Do not edit below this line.  Contents dynamically populated. -->

* **[commandList.ts](commandList.ts)**                       - Groups all supported command functions into an object for single point of reference.
* **[commandName.ts](commandName.ts)**                       - A library for visually presenting command documentation to the terminal.
* **[commands_documentation.ts](commands_documentation.ts)** - A data structure defining command documentation with usage examples.
* **[entry.ts](entry.ts)**                                   - The entry point to the application.
* **[error.ts](error.ts)**                                   - A utility for processing and logging errors from the terminal application.
* **[getAddress.ts](getAddress.ts)**                         - Extracts IP addresses from a provided socket.
* **[humanTime.ts](humanTime.ts)**                           - A utility to generate human readable time sequences.
* **[ipList.ts](ipList.ts)**                                 - Returns a list of ip addresses for a specified agent.
* **[lists.ts](lists.ts)**                                   - A utility for visually presenting lists of data to the terminal's console.
* **[log.ts](log.ts)**                                       - A log utility for displaying multiple lines of text to the terminal.
* **[node.ts](node.ts)**                                     - All the Node APIs used in the project stored in a single location.
* **[readStorage.ts](readStorage.ts)**                       - Reads all the settings files and returns a data structure to a callback
* **[rename.ts](rename.ts)**                                 - Before creating new file system artifacts this library determines if the artifact is already present and if so changes the name of the new artifacts to prevent overwrite.
* **[resetState.ts](resetState.ts)**                         - A convenience tool to baseline environmental settings
* **[terminal.ts](terminal.ts)**                             - Execute the application entry point from the terminal.
* **[time.ts](time.ts)**                                     - Generates a timestamp in format: "[HH:mm:ss:mil] message".
* **[vars.ts](vars.ts)**                                     - Globally available variables for the terminal utility.
* **[wrapIt.ts](wrapIt.ts)**                                 - A tool to perform word wrap when printing text to the shell.
* **[writeStream.ts](writeStream.ts)**                       - A utility to pipe from a read stream to a write stream.