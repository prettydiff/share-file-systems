# lib/terminal/server/services Code Files
These files are libraries that comprise */lib/terminal/server.ts* **which in turn comprises *application.ts*.

## Files
<!-- Do not edit below this line.  Contents dynamically populated. -->

* **[agentOnline.ts](agentOnline.ts)**                   - Determines if a remote agent is online and if so gathers their IP addresses and listening port numbers.
* **[browserLog.ts](browserLog.ts)**                     - This handy utility writes log output to the terminal from the browser's console.log for more direct log visibility.
* **[fileListStatusDevice.ts](fileListStatusDevice.ts)** - Receives status updates from remote users for distribution to your devices.
* **[fileListStatusUser.ts](fileListStatusUser.ts)**     - A library to transmit share updates to remote users for distribution to their devices.
* **[hashDevice.ts](hashDevice.ts)**                     - A library for creating a new user/device identification.
* **[hashShare.ts](hashShare.ts)**                       - Creates a unique identifier for a new share object.
* **[heartbeat.ts](heartbeat.ts)**                       - The code that manages sending and receiving user online status updates.
* **[invite.ts](invite.ts)**                             - Manages the order of invitation related processes for traffic across the internet.
* **[message.ts](message.ts)**                           - Process and send text messages.
* **[settings.ts](settings.ts)**                         - A library for writing data to settings.