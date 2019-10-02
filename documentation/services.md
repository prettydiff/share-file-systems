# Services

## File System
The file system service is called from *network.fs* and use **localService** TypeScript interface as their data type, which is defined as follows:

* **action**: string, The service name to execute.
* **agent**: string, The agent (user) where the action must be performed.
* **depth**: number, This is only used by File System services to describe the number of recursive steps to walk in a directory tree. A value of **0** means full recursion and a value of **1** means no recursion. This is ignored unless the specified artifact is a directory.
* **id**: The id attribute value of the target modal.  This is only used for non-local operations where content is requested from the network.
* **location**: string[], A list of locations, such as a list of file system paths.
* **name**: string, *fs-rename* uses this data as an artifact's new name. The *fs-move* and *fs-paste* services use this as the destination address.
* **watch**: "no"|"yes"|string,
   - *"no"* - Do not initiate a file system watch for the given request.
   - *"yes"* - Initiate a new file system watch at the path specified in *location*.
   - *string* - Any other string value must be a valid file system path. This allows a change of watch, such that the watch specified at this value is terminated and a new watch is initiated at the path indicated by *location*.

All file system services begin with *fs-* in their name.  Output format of *directorList* is an array of *directoryItem* types. Please note that *FIFO* and *socket* artifact types are not described.

### directoryItem Interface Description
`type directoryItem = [string, "error" | "file" | "directory" | "link", number, number, Stats];`
* **0**: string, absolute path of file system artifact
* **1**: string, artifact type according to the list of:
   - *"error"*   - An error was encountered when examining the artifact.  This could mean the artifact is corrupted, read protected by the operating system, or an error occurred in Node.
   - *"file"*    - any of file, Block Device, Character Device types
   - "directory" - directory
   - "link"      - symbolic link
* **2**: number, index of parent directory amongst the *directoryList* data set
* **3**: number, count of child artifacts in a given directory
* **4**: Stats, a stats object for the given artifact as derived from Node's *fs* library

** Please note that backslashes, such as Windows file system paths, must be escaped or else it will break JSON.parse execution.**  This can be as simple as `value.replace(/\\/g, "\\\\");`.

### File System services
* **fs-base64**
   - description: Returns a base64 string for a given file or symbolic link.
   - output     : string, base64 data
   - parameters
      * action  : **"fs-base64"**
      * agent   : string
      * depth   : 1
      * id      : string
      * location: string[]
      * name    : ""
      * watch   : "no"
* **fs-close**
   - description: Lets the local service know to terminate a file system watcher that isn't needed any more.
   - output     : void
   - parameters
      * action  : **"fs-close"**
      * agent   : string
      * depth   : 1
      * id      : string
      * location: string[]
      * name    : ""
      * watch   : "no"*
**fs-copy**
   - description: Replicates existing file system artifacts into a new location in the file system.
   - output     : void
   - parameters
      * action  : **"fs-copy"**
      * agent   : string
      * depth   : 1
      * id      : string
      * location: string[]
      * name    : ""
      * watch   : "no"
**fs-cut**
   - description: Same as copy, but deletes the original artifacts after writing them to the new location.
   - output     : void
   - parameters
      * action  : **"fs-cut"**
      * agent   : string
      * depth   : 1
      * id      : string
      * location: string[]
      * name    : ""
      * watch   : "no"
* **fs-destroy**
   - description: Remove file system artifacts from the file system.
   - output     : void
   - parameters
      * action  : **"fs-destroy"**
      * agent   : string
      * depth   : 1
      * id      : string
      * location: string[]
      * name    : ""
      * watch   : "no"
* **fs-details**
   - description: Returns a fully recursive summary of a given file system artifact or directory tree.
   - output     : directoryList
   - parameter
      * action  : **"fs-details"**
      * agent   : string
      * depth   : 0
      * id      : string
      * location: string[]
      * name    : ""
      * watch   : "no"
* **fs-hash**:
   - description: Returns a SHA512 hash string for a given file or symbolic link.
   - output     : string, hash value
   - parameters
      * action  : **"fs-hash"**
      * agent   : string
      * depth   : 1
      * id      : string
      * location: string[]
      * name    : ""
      * watch   : "no"
* **fs-new**:
   - description: Creates either a new file or new directory in the file system.
   - output     : void
   - parameters
      * action  : **"fs-new"**
      * agent   : string
      * depth   : 1
      * id      : string
      * location: string[]
      * name    : "file" | "directory"
      * watch   : "no"
* **fs-read**:
   - description: Returns a directory listing with a variable amount of recursion. This is similar to fs-details except: it only provides a single location, variable recursion, and it will initiate either a new or change of file system watch.
   - output     : directoryList
   - parameters
      * action  : **"fs-read"**
      * agent   : string
      * depth   : configuration.depth
      * id      : string
      * location: string[]
      * name    : ""
      * watch   : "yes" | string (path)
* **fs-rename**:
   - description: Renames a file system artifact.
   - output     : void
   - parameters
      * action  : **"fs-rename"**
      * agent   : string
      * depth   : 1
      * id      : string
      * location: string[]
      * name    : string
      * watch   : "no"

## Data Storage

State is saved in the local file system.  This allows for immediate advanced testing cross browser and across different computers.  Data storage services require only a string name and no configuration object.  An object storing user generated settings is parsed from object into a JSON string and sent to Node where it is written to a file of the same name in the *storage* directory.

Currently supported names:

* **messages** - stores data that populates in the logger
* **settings** - stores user interface state