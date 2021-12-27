# lib/terminal/fileService Code Files
These files are libraries that comprise */lib/terminal/fileService/fileService.ts* which are used to perform file system operations as a networked service.

## Files
<!-- Do not edit below this line.  Contents dynamically populated. -->

* **[copyFile.ts](copyFile.ts)**               - Handles the copy-file service to push file data over the network.
* **[copyFileRequest.ts](copyFileRequest.ts)** - Handles the service copy-request-files to request a list of files from a file system tree of a remote agent.
* **[fileSystemRoute.ts](fileSystemRoute.ts)** - A library that manages the direction of all file system messaging between agents.
* **[serviceCopy.ts](serviceCopy.ts)**         - A library that stores instructions for copy and cut of file system artifacts.
* **[serviceFile.ts](serviceFile.ts)**         - Manages various file system services.
* **[unmask.ts](unmask.ts)**                   - A library to unmask masked device identities communicated between different users.
* **[userPermissions.ts](userPermissions.ts)** - Determines if the request from a different user complies with current share permissions.