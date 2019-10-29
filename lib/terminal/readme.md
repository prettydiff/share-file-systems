# lib/browser Code Files
The various tools that comprise the terminal (Node.js) application.

* **bae64.ts**                  - Transforms a string or file contents into a base64 encoded string.
* **build.ts**                  - Contains the build and test utilities.
* **commandName.ts**            - Determines if a command submitted from the command line is supported or is a close approximate to something supported.
* **commands_documentation.ts** - The documentation of supported commands, with examples of all supported features, as an object literal.
* **commands.ts**               - Handles the *commands* command.
* **commas.ts**                 - A utility to convert a large number into a string of comma separated triplets, such as: 1,000,000.
* **copy.ts**                   - Contains the copy command handler and performs a bit-by-bit stream copy of files.
* **directory.ts**              - Handles the directory command which provides a cursive read of file system structures and returns a data structure representative of that tree.
* **error.ts**                  - An error handling utility.
* **get.ts**                    - Handles the get command and retrieves files using HTTP/HTTPS.
* **hash.ts**                   - Handles the hash function and performs a SHA512 hash of strings, files, and provides a hash of a directory structure comprising both file contents and file system artifact names.
* **help.ts**                   - A tiny string output to the terminal to help users get started with the terminal utilities.
* **humanTime.ts**              - Processes time durations and outputs a format that is friendly to human reading.
* **lint.ts**                   - Handles the lint command and simply executes ESLint upon a designated location.
* **list.ts**                   - An internally used list formatting utility to make lists pretty for terminal output.
* **log.ts**                    - A higher order abstraction over console.log.
* **makeDir.ts**                - Makes directories in the file system.
* **readFile.ts**               - Reads files by default as UTF8, or if the file contains control characters common to binary files then will read files as a buffer.
* **remove.ts**                 - Handles the remove command which recursively removes files and file system structures.
* **server.ts**                 - Handles the server command which launches an HTTP server, Web Socket client, and a TCP socket server.
* **simulation.ts**             - Handles the simulation types of tests.  The simulation tests run the supported commands in various ways, according to *test/simulations.ts* for terminal test automation.
* **test.ts**                   - Handles the test command.  This is really just a bundler for the *lint* and *simulation* utilities and then executes the test side of the *build* utility.
* **vars.ts**                   - Globally shared variables across the terminal application are defined here.
* **version.ts**                - Simply outputs the applications version data.
* **wrapIt.ts**                 - Performs word wrapping for easier to read terminal output.