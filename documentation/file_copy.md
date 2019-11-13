# Share File Systems - File Copy Behavior

The *Share File Systems* application allows one or more files, directories, or directory trees to be copied in these ways:
* From one location to another on the current local computer
* From one location to another on a different computer
* From a different computer to the current local computer
* From the current local computer to a different computer

In order for file copy to work all associated computers must be connected via the Share File Systems application.

## Limitations
At the time of this writing there are two major limitations to file copy:
* Copying files from one remote computer to a second different remote computer is a feature that is not yet tested.
* The Share File Systems application only works by specified IP addresses, which means computers must have public facing IP addresses or be on the same internal network.

There are plans to solve for both of these concerns in the near future.

## Process
In all cases file copy is a result of user interaction from within the browser.  The web browser sends an instruction, `fs-copy` or `fs-cut`, to the terminal application.  All file system instructions are handled in the file `lib/terminal/server/fileService.ts`.

### Same Computer
Copying to and from the same computer, whether local or remote, uses the same code: `lib/terminal/copy.ts`.  The only difference between the local and remote computers is that for remote computers an HTTP client request is initiated with the instruction `fs-copy-self` or `fs-cut-self`.  Files are streamed through a file system byte stream from one location of the given file system to another location and, if necessary, new directory structures are created.

### From Local to a Remote Computer
A function, `remoteCopyList`, is executed to gather details about the requested files.  An HTTP client request is sent to the remote computer with the instruction `fs-copy-request` or `fs-cut-request`.  The remote computer then executes the function `requestFiles`, to request each file according to the behavior described below.  Each file is requested using the instruction `fs-copy-file` or `fs-cut-file`.

### From Remote to the Local Computer
An HTTP client request is issued to the remote computer with instruction `fs-copy-list` or `fs-cut-list`.  The remote computer then executes the function `remoteCopyList` and responds with a list of file system details for the requested files/directories.  Upon receiving the list of file system details the local computer executes the function `requestFiles` which requests each file according the behavior described below.  Each file is requested from the local computer to the remote using the instruction `fs-copy-file` or `fs-cut-file`.

## Behavior
In all cases only 1 file is written at any given time.  Writing multiple files simultaneously from a high level abstraction increases the risks of integrity failures and/or collisions.  To ensure the application executes as quickly as possible, remains asynchronous, and yet still writes only 1 file at any time write operations recursively call the next write operation.

### Same Computer Behavior
In the cases where files are moved from one location to another on the same computer, whether local or remote, there are no integrity checks or memory considerations.  Files are simply piped from a read stream to a write stream without caching file contents into memory.

### Default Behavior
The behavior is different when files cross the network, but the behavior is identical whether the files are moving from local to remote or from remote to local.  Here are the basic details:
* Max simultaneous file (HTTP) requests: **8**
* Max simultaneous files written to disk: **1**

The thinking is that the largest bottleneck in file transfer is the network.  On the responding side, the computer holding the files, the file data is streamed through a hash function and the resulting hash string is written to an HTTP response header.  A second stream reads the file and pipes file contents directly to the HTTP response body.  This needs to be two separate streams, because the hash stream takes longer merely piping the data into the response body and that time difference can cause interference and overwrites between the hash function and the data transmitted.

On the receiving side, the computer writing the files, file content is cached in memory before writing to disk.  This allows multiple files, up to 8, to be requested simultaneously and stored in the computers random access memory (RAM) before the computer is ready to write the file contents to disk since the computer will only write 1 file at a time.  When the computer is ready to write the file to disk it first streams the file contents from memory through a hash function and the hashes, one from the HTTP response header and the second just generated from the file contents in memory, are compared.  If the hashes are identical integrity is verified and the file is written to disk.  If the hashes do not match the file is not written to disk.

### Alternate Behavior
The default behavior is designed to maximize performance, but it won't work with incredibly large files.  Computers only have so much memory available and once that memory is fully exhausted the application will crash.  In the case where the average file size is greater than 4gb, or 4 files are larger than 4gb, or the largest file is greater than 12gb this alternate behavior is applied:
* Max simultaneous file (HTTP) requests: **1**
* Max simultaneous files written to disk: **1**

In this behavior files are recursively requested 1 at a time.  The process is the same on the responding side in that the file is streamed through a hash function and then streamed a second time directly into the HTTP response body.  On the receiving side the file is immediately streamed into a file so that it is written to disk directly without caching file contents in memory.  Once the file is written to disk it is streamed through a hash function and this generated hash is compared to the hash in the file's HTTP response header.  If the hashes do not match the file is removed from the file system.  The next file is then requested.

## File Cut