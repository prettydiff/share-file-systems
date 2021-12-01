# lib/terminal/fileService Code Files
These files are libraries that comprise */lib/terminal/fileService/fileService.ts* which are used to perform file system operations as a networked service.

## Files
<!-- Do not edit below this line.  Contents dynamically populated. -->

* **[copyFile.ts](copyFile.ts)**               - Handles the copy-file service to push file data over the network.
* **[copyFileRequest.ts](copyFileRequest.ts)** - Handles the service copy-request-files to request a list of files from a file system tree of a remote agent.
* **[deviceShare.ts](deviceShare.ts)**         - Creates a one time password as a hash to serve as a share identifier for a user's device that is otherwise not exposed.
* **[route.ts](route.ts)**                     - A library to move file system instructions between agents.
* **[routeCopy.ts](routeCopy.ts)**             - A library to handle file system asset movement.
* **[routeFile.ts](routeFile.ts)**             - A library that manages all file system operations except copy/cut operations.
* **[serviceCopy.ts](serviceCopy.ts)**         - A library that stores instructions for copy and cut of file system artifacts.
* **[serviceFile.ts](serviceFile.ts)**         - Manages various file system services.
* **[user.ts](user.ts)**                       - A minor security check for user type requests.