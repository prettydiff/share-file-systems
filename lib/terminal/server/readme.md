# lib/terminal/server
These files are libraries that comprise */lib/terminal/server.ts* which in turn comprises *application.ts*.

* fsServer.ts - This library executes various file system tasks as requested by user interaction from the browser.
* inviteHeartbeat.ts - This library executes network related tasks for inviting new users and sending heartbeat status.
* methodGET.ts - The HTTP server's GET request method is handled by this library.
* serverVars.ts - All variables used across the various server libraries are defined here.
* serverWatch.ts - This library contains a handler for a file system watcher of this application.
* settingsMessage.ts - This library writes to the settings.json and messages.json log files stored in the */storage* directory.