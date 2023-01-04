# lib/terminal/server/services Code Files
These files are libraries that comprise */lib/terminal/server.ts* **which in turn comprises *application.ts*.

## Files
<!-- Do not edit below this line.  Contents dynamically populated. -->

* **[agent_hash.ts](agent_hash.ts)**             - A library for creating a new user/device identification.
* **[agent_management.ts](agent_management.ts)** - Add, delete, and modify agent data.
* **[agent_online.ts](agent_online.ts)**         - Determines if a remote agent is online and if so gathers their IP addresses and listening port numbers.
* **[agent_status.ts](agent_status.ts)**         - Publishes activity status of agents.
* **[browserLog.ts](browserLog.ts)**             - This handy utility writes log output to the terminal from the browser's console.log for more direct log visibility.
* **[deviceMask.ts](deviceMask.ts)**             - A library to mask/unmask masked device identities communicated between different users.
* **[fileCopy.ts](fileCopy.ts)**                 - A library that stores instructions for copy and cut of file system artifacts.
* **[fileExecute.ts](fileExecute.ts)**           - A common file execution library used by both fileCopy and fileSystem.
* **[fileSystem.ts](fileSystem.ts)**             - Manages various file system services.
* **[hashShare.ts](hashShare.ts)**               - Creates a unique identifier for a new share object.
* **[invite.ts](invite.ts)**                     - Manages the order of invitation related processes for traffic across the internet.
* **[message.ts](message.ts)**                   - Process and send text messages.
* **[settings.ts](settings.ts)**                 - A library for writing data to settings.
* **[terminal.ts](terminal.ts)**                 - Processes terminal console messaging for remote devices and display to the user in a browser.