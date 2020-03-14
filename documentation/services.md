# Services

## File System
The file system service is called from *network.fs* and use **localService** TypeScript interface as their data type, which is defined as follows:

* **action**: string, The service name to execute.
* **agent**: string, The agent (user) where the action must be performed.
* **copyAgent**: string. The agent of the destination for a *paste* action from *copy* or *cut* services.
* **depth**: number, This is only used by File System services to describe the number of recursive steps to walk in a directory tree. A value of **0** means full recursion and a value of **1** means no recursion. This is ignored unless the specified artifact is a directory.
* **id**: The id attribute value of the target modal.  This is only used for non-local operations where content is requested from the network.
* **location**: string[], A list of locations, such as a list of file system paths.
* **name**: string, *fs-rename* uses this data as an artifact's new name. The *fs-move* and *fs-paste* services use this as the destination address.
* **watch**: "no"|"yes"|string,
   - *"no"* - Do not initiate a file system watch for the given request.
   - *"yes"* - Initiate a new file system watch at the path specified in *location*.
   - *string* - Any other string value must be a valid file system path. This allows a change of watch, such that the watch specified at this value is terminated and a new watch is initiated at the path indicated by *location*.

All file system services begin with *fs-* in their name.  Output format of *directorList* is an array of *directoryItem* types. Please note that *FIFO* and *socket* artifact types are not described.

## Example
```json
{
   "fs": {
      "action"   : "fs-search",
      "agent"    : "localhost",
      "copyAgent": "",
      "depth"    : 0,
      "id"       : "fileNavigate-0.276615431234143121",
      "location" : ["e:\\mp3"],
      "name"     : ".m4a",
      "watch"    : "no"
   }
}
```

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

**Please note that backslashes, such as Windows file system paths, must be escaped or else it will break JSON.parse execution.**  This can be as simple as `value.replace(/\\/g, "\\\\");`.

### File System services

#### Notes on dataString[] data type
In the following list the fs-base64, fs-hash, and fs-read services describe their location property as *dataString[]* instead of the regular *string[]*.  The dataString[] data type suggests an array where each index is a string of modal id, colon, and file system path.  This is necessary because the output modal is a different new modal than the one containing the file list and that could mean multiple new modals, one for each requested location, if multiple files are selected for action.  As a result an array is needed and thus the already available *id* property is insufficient.

* **fs-base64**
   - description: Returns a base64 string for a given file or symbolic link.
   - output     : string, base64 data
   - parameters
      * action   : **"fs-base64"**
      * agent    : string
      * copyAgent: ""
      * depth    : 1
      * id       : string
      * location : dataString[]
      * name     : ""
      * watch    : "no"
* **fs-close**
   - description: Lets the local service know to terminate a file system watcher that isn't needed any more.
   - output     : void
   - parameters
      * action   : **"fs-close"**
      * agent    : string
      * copyAgent: ""
      * depth    : 1
      * id       : string
      * location : string[]
      * name     : ""
      * watch    : "no"*
* **fs-copy**
   - description: Replicates existing file system artifacts into a new location in the file system.
   - output     : void
   - parameters
      * action   : **"fs-copy"**
      * agent    : string, agent of origin
      * copyAgent: string, agent of destination
      * depth    : 1
      * id       : string
      * location : string[]
      * name     : string, destination directory
      * watch    : "no"
* **fs-copy-file**
   - description: **An internal service only.  Do not call this from the user interface.**  Generated from the response of *fs-copy-list* to retrieve a single file from a different agent.
   - output     : void
   - parameters
      * action   : **"fs-copy-file"**
      * agent    : string
      * copyAgent: string
      * depth    : 1
      * id       : string
      * location : string[]
      * name     : ""
      * watch    : "no"
* **fs-copy-list**
   - description: **An internal service only.  Do not call this from the user interface.**  Generated from the response of *fs-copy* if the file's agent and destination agent are not the same.
   - output     : void
   - parameters
      * action   : **"fs-copy-list"**
      * agent    : string
      * copyAgent: string
      * depth    : 1
      * id       : string
      * location : string[]
      * name     : ""
      * watch    : "no"
* **fs-copy-request**
   - description: **An internal service only.  Do not call this from the user interface.**  Generated from the request of *fs-copy* so that a remote requests files from localhost.
   - output     : void
   - parameters
      * action   : **"fs-copy-request"**
      * agent    : string
      * copyAgent: string
      * depth    : 1
      * id       : string
      * location : string[]
      * name     : string  - *sort list of files to be requested*
      * watch    : "no"
* **fs-copy-self**
   - description: **An internal service only.  Do not call this from the user interface.**  Generated from the request of *fs-copy* to copy file system artifacts from one location to another on the same remote device.
   - output     : void
   - parameters
      * action   : **"fs-copy-self"**
      * agent    : string
      * copyAgent: string
      * depth    : 1
      * id       : string
      * location : string[]
      * name     : string  - *file system destination address*
      * watch    : "no"
* **fs-cut**
   - description: Same as copy, but deletes the original artifacts after writing them to the new location.
   - output     : void
   - parameters
      * action   : **"fs-cut"**
      * agent    : string
      * copyAgent: string
      * depth    : 1
      * id       : string
      * location : string[]
      * name     : ""
      * watch    : "no"
* **fs-cut-file**
   - description: **An internal service only.  Do not call this from the user interface.**  Generated from the response of *fs-cut-list* to retrieve a single file from a different agent.
   - output     : void
   - parameters
      * action   : **"fs-cut-file"**
      * agent    : string
      * copyAgent: string
      * depth    : 1
      * id       : string
      * location : string[]
      * name     : ""
      * watch    : "no"
* **fs-cut-list**
   - description: **An internal service only.  Do not call this from the user interface.**  Generated from the response of *fs-cut* if the file's agent and destination agent are not the same.
   - output     : void
   - parameters
      * action   : **"fs-cut-list"**
      * agent    : string
      * copyAgent: string
      * depth    : 1
      * id       : string
      * location : string[]
      * name     : ""
      * watch    : "no"
* **fs-cut-remove**
   - description: **An internal service only.  Do not call this from the user interface.**  Generated from the request of *fs-cut-request* so that files are removed after successfully written onto a different computer.
   - output     : void
   - parameters
      * action   : **"fs-cut-remove"**
      * agent    : string
      * copyAgent: string
      * depth    : 1
      * id       : string
      * location : string[]
      * name     : string - *stringified list of values "file" or "directory" corresponding to data.location*
      * watch    : "no"
* **fs-cut-request**
   - description: **An internal service only.  Do not call this from the user interface.**  Generated from the request of *fs-cut* so that a remote requests files from localhost.
   - output     : void
   - parameters
      * action   : **"fs-cut-request"**
      * agent    : string
      * copyAgent: string
      * depth    : 1
      * id       : string
      * location : string[]
      * name     : string  - *sort list of files to be requested*
      * watch    : "no"
* **fs-cut-self**
   - description: **An internal service only.  Do not call this from the user interface.**  Generated from the request of *fs-cut* to move file system artifacts from one location to another on the same remote device.
   - output     : void
   - parameters
      * action   : **"fs-cut-self"**
      * agent    : string
      * copyAgent: string
      * depth    : 1
      * id       : string
      * location : string[]
      * name     : string  - *file system destination*
      * watch    : "no"
* **fs-destroy**
   - description: Remove file system artifacts from the file system.
   - output     : void
   - parameters
      * action   : **"fs-destroy"**
      * agent    : string
      * copyAgent: ""
      * depth    : 1
      * id       : string
      * location : string[]
      * name     : ""
      * watch    : "no"
* **fs-details**
   - description: Returns a fully recursive summary of a given file system artifact or directory tree.
   - output     : directoryList
   - parameter
      * action   : **"fs-details"**
      * agent    : string
      * copyAgent: ""
      * depth    : 0
      * id       : string
      * location : string[]
      * name     : ""
      * watch    : "no"
* **fs-directory**:
   - description: Returns a directory listing with a variable amount of recursion. This is similar to fs-details except: it only provides a single location, variable recursion, and it will initiate either a new or change of file system watch.
   - output     : directoryList
   - parameters
      * action   : **"fs-directory"**
      * agent    : string
      * copyAgent: ""
      * depth    : configuration.depth
      * id       : string
      * location : string[]
      * name     : ""
      * watch    : "yes" | string (path)
* **fs-hash**:
   - description: Returns a SHA512 hash string for a given file or symbolic link.
   - output     : string, hash value
   - parameters
      * action   : **"fs-hash"**
      * agent    : string
      * copyAgent: ""
      * depth    : 1
      * id       : string
      * location : dataString[]
      * name     : ""
      * watch    : "no"
* **fs-new**:
   - description: Creates either a new file or new directory in the file system.
   - output     : void
   - parameters
      * action   : **"fs-new"**
      * agent    : string
      * copyAgent: ""
      * depth    : 1
      * id       : string
      * location : string[]
      * name     : "file" | "directory"
      * watch    : "no"
* **fs-read**:
   - description: Reads a file and returns the result string encoded to *utf8*.
   - output     : string
   - parameters
      * action   : **"fs-read"**
      * agent    : string
      * copyAgent: ""
      * depth    : 1
      * id       : string
      * location : dataString[]
      * name     : ""
      * watch    : "no"
* **fs-rename**:
   - description: Renames a file system artifact.
   - output     : void
   - parameters
      * action   : **"fs-rename"**
      * agent    : string
      * copyAgent: ""
      * depth    : 1
      * id       : string
      * location : string[]
      * name     : string - *new artifact name*
      * watch    : "no"
* **fs-search**:
   - description: Searches a file system tree for artifacts containing a specified string fragment.
   - output     : void
   - parameters
      * action   : **"fs-search"**
      * agent    : string
      * copyAgent: ""
      * depth    : 0
      * id       : string
      * location : string[]
      * name     : string - *search string fragment*
      * watch    : "no"
* **fs-write**:
   - description: Writes changes to a file.
   - output     : void
   - parameters
      * action   : **"fs-write"**
      * agent    : string
      * copyAgent: ""
      * depth    : 1
      * id       : string
      * location : string[]
      * name     : string - *name of file to modify*
      * watch    : "no"


--


## Data Storage
State is saved in the local file system.  This allows for persistence of state whose availability extends across browsers and is irrespective of the computer's state.  Provided a transfer of the state files it also allows for a persistance of state across different computers.  Data storage services are executed from the file `lib/terminal/server/storage.ts`.  Updates to the localhost shares will send out an update to all users in the user list.  The storage files are written to the directory `storage` and the service names are identical to the file names but without the file extensions.

Currently supported names: *messages*, *settings*, *users*

### Messages
Stores systems and utility messaging from the browser.  At this time only error messaging is populated.

#### Messaging Example
```json
{
   "messages": {
      "status": [],
      "users" : [],
      "errors": [
         [
               "[17 FEB 2020, 13:59:00.878]","EPERM: operation not permitted, rename 'settings-0.15976829605695686.json' -> 'settings.json'", [
                  "terminal_error_errorOut (file:///share-file-systems/js/lib/terminal/error.js:23:32))",
                  "Object.terminal_error [as error] (file:///share-file-systems/js/lib/terminal/error.js:103:9))",
                  "terminal_server_storage_renameNode (file:///share-file-systems/js/lib/terminal/server/storage.js:13:25))",
                  "FSReqCallback.oncomplete (fs.js:154:23)"
               ]
         ]
      ]
   }
}
```

#### Error Messaging
The error messaging is an error message and a stack trace stored as an array.

### Settings
Stores state of the GUI and content displayed in the browser

#### Settings Example
```json
{
   "settings"  : {
      "audio"     : true,
      "brotli"    : 7,
      "color"     : "default",
      "hash"      : "sha3-512",
      "modals"    : {
         "systems-modal": {
            "agent"    : "localhost",
            "content"  : {},
            "inputs"   : ["close", "maximize", "minimize"],
            "read_only": false,
            "single"   : true,
            "status"   : "hidden",
            "title"    : "<span class=\"icon-systemLog\">⌬</span> System Log",
            "type"     : "systems",
            "width"    : 800,
            "zIndex"   : 1,
            "id"       : "systems-modal",
            "left"     : 200,
            "top"      : 200,
            "height"   : 400
         },
         "settings-modal": {
            "agent"    : "localhost",
            "content"  : {},
            "inputs"   : ["close"],
            "read_only": false,
            "single"   : true,
            "status"   : "hidden",
            "title"    : "<span class=\"icon-settings\">⚙</span> Settings",
            "type"     : "settings",
            "zIndex"   : 2,
            "id"       : "settings-modal",
            "left"     : 210,
            "top"      : 210,
            "width"    : 565,
            "height"   : 400
         },
         "fileNavigate-0.684141281927165231": {
            "agent"           : "localhost",
            "content"         : {},
            "inputs"          : ["close","maximize","minimize","text"],
            "read_only"       : false,
            "selection"       : {},
            "status_bar"      : true,
            "status_text"     : "13 directories, 15 files, 0 links, 0 errors",
            "text_placeholder": "Optionally type a file system address here.",
            "text_value"      : "C:\\Users\\austincheney\\share-file-systems",
            "title"           : "<span class=\"icon-fileNavigator\">⌹</span> File Navigator - localhost",
            "type"            : "fileNavigate",
            "width"           : 819,
            "zIndex"          : 3,
            "id"              : "fileNavigate-0.684141281927165231",
            "left"            : 230,
            "top"             : 230,
            "height"          : 403,
            "status"          : "normal",
            "history"         : ["C:\\Users\\austincheney\\share-file-systems"],
            "search"          : ["",""]
         }
      },
      "modalTypes": ["systems","settings","fileNavigate","invite-request"],
      "name"      : "Austin",
      "zIndex"    : 6
   },
   "send": true
}
```

#### Settings Schema
```json
{
   "settings"  : {
      "audio"     : "boolean, whether audio is executed in the browser GUI",
      "brotli"    : "number, sets the compression level for transferring artifacts over the network.  The default is 7",
      "color"     : "string, the name of an available color scheme",
      "hash"      : "string, the name of a supported hash function.  The fault is sha3-512.  See hash command documentation or the index.d.ts file for the list of supported hash functions.",
      "modals (list of populated modals by modal id)": {
         "systems-modal (id of the modal)": {
            "agent"           : "string, where the modal's content resides",
            "content"         : "object, this data is not stored.  This property is used in the browser GUI to reference a DOM element that stores the modal's generated content",
            "focus"           : "object, this data is not stored.  This property is used in the browser GUI to reference a DOM element that stores the user's focus",
            "height"          : "number, the modal content's height in pixels.  The actual modal will be taller than this value due to heading and other features outside the modal's content body.",
            "history"         : ["string array, contains names of prior addresses"],
            "id"              : "string, the id value of the modal.  This value is the same as this object's name.",
            "inputs"          : ["string array, contains names of buttons and certain other additive interactive parts of the modal"],
            "left"            : "number, the horizontal position of the modal as measured in pixels distance between the left edge of the browser's viewport and the modal's outer most left edge.",
            "move"            : "boolean, whether the user is allowed drag the modal to a different location in the browser GUI.",
            "read_only"       : "boolean, whether this modal's contents are set read only by remote users",
            "resize"          : "boolean, whether the user is allowed to resize the modal to a different horizontal and/or vertical size.",
            "search"          : "[string, string], The first index stores the address location on where the search should begin and the second index stores the search string.",
            "selection"       : "string object, stores the current item selection state of the modal's contents in the case whether the modal's contents are a selectable list.",
            "single"          : "boolean, indicates whether only one modal of this modal 'type' may populate in the browser GUI.",
            "status"          : "string, indicates the modal's visual status whether 'normal', 'maximized', 'minimized', or in some special cases 'hidden'.",
            "status_bar"      : "boolean, whether the modal should feature a status bar below the modal's content.",
            "status_text"     : "string, the text value that is populated into the modal's status bar, if the modal features a status bar.",
            "text_event"      : "function, this is not stored.  A reference to an event handler that executes changes to a text input field.  This text input is populated into the modal if the value 'text' is present in the 'inputs' property array.",
            "text_placeholder": "string, the default place holder text that populates in the modal's text input field if the modal features a text input field.",
            "text_value"      : "string, the text value populated into the modal's text input field if the modal features a text input field.",
            "timer"           : "number, a delay supplied to modals whose content body is a text area.  This delay will automatically write settings changes if the modal remains in focus but is idle for longer than the set delay to ensure user populated text is periodically saved.",
            "title"           : "string, the text title of the modal that is read by the user. Any icon associated with the modal title or modal type is also populated here.",
            "top"             : "number, the vertical position of the modal in the browser GUI.  This is measured in pixel distance between the top of the browser's viewport and the top most edge of the modal.",
            "type"            : "string, the type of modal from a list of supported modal types.",
            "width"           : "number, the width of the modal's content area.  The actual modal will be wider than this value due to the modal's borders and scroll bars.",
            "zIndex"          : "number, the visual stacking order of the modals."
         }
      },
      "modalTypes": ["string array, the types of modals current populated"],
      "name"      : "string, the username of the localhost user",
      "zIndex"    : "number, the z-index value of the top most modal"
   },
   "send": true
}
```

### Users
The users storage saves user profile data which comprises color scheme in the browser GUI and each users' share data.

#### Users Example
```json
{
   "users": {
      "localhost" : {
         "color" : ["fff", "000"],
         "shares": [
            {
               "execute" : false,
               "name"    : "C:\\MP3\\_new",
               "readOnly": true,
               "type"    : "directory"
            }
         ]
      },
      "remoteUser": {
         "color" : ["fff", "ddd"],
         "shares": [
            {
               "execute" : false,
               "name"    : "D:\\movies",
               "readOnly": true,
               "type"    : "directory"
            }
         ]
      }
   }
}
```

#### Users Schema
```json
{
   "users": {
      "user name": {
         "color" : ["string, primary color in RGB hex", "string, secondary color in RGB hex"],
         "shares": [
            {
               "execute" : "boolean, is this something that this executed like an application?",
               "name"    : "string, address of the shared artifact",
               "readOnly": "boolean, if true this artifact cannot be altered or removed by remote users",
               "type"    : "string, what type of artifact is it? (file, directory, symbolic link)"
            }
         ]
      }
```

---


## Heartbeat
The heartbeat is a beacon send out to other users about whether a user is active, idle, or offline.  The heartbeat executes every 15 seconds.  An *active* status means the user is actively using the application.  An *idle* status the user's application is online but the user is not actively using the application.  The application can still receive and respond to requests for data even when idle.  The *offline* status means the user's application if offline.

The heartbeat makes use of two services:
* **heartbeat** - The heartbeat is the regular interval status update as an HTTP request.
* **heartbeat-update** - The heartbeat update is the HTTP response to a heartbeat request.  This allows the application to know if a user has gone offline or if they have changed status from offline to anything else.

### Heartbeat Process
1. Heartbeat is initiated by the following factors:
   * a timed interval from the browser
   * if the current user status is *idle* and changes to *active*
   * a change to localhost shares
   * when the terminal application is running with the *server* command
1. The *agent* property of the data is `localhost-browser` if it starts from the browser or `localhost-terminal` if it executes from the terminal application coming online
1. The `serverVars.status` is updated to reflect the user's activity status in the browser.
1. The *user* property is assigned the value of the username of the localhost as it would appear to remote users.
1. If the share data reported by the browser does not match the shared data for localhost then the share data is updated in storage.
1. Current users are looped through so that gets the heartbeat data and during each loop iteration the *agent* data property is provided the remote user name as the data property.
1. Once each remote has responded an HTTP response will be sent to the browser if the heartbeat originated from the browser.
1. If the heartbeat has a user name that is not `localhost-browser` or `localhost-terminal` it is converted to a *heartbeat-response* and this data is sent to the browser via web sockets.
1. The status property of the data is assigned the value of `serverVars.status` and is sent back to the originating terminal application as an HTTP response.
1. If the shares data is different than the provided shares data for the given user as indicated by the *user* data property then the shares data is updated.
1. The originating terminal application will forward that data to the originating browser via web sockets once the response is fully received.

### Heartbeat Example
```json
{
   "heartbeat": {
      "agent"  : "remoteUser",
      "shares" : [
         {
            "execute" : false,
            "name"    : "C:\\mp3",
            "readOnly": true,
            "type"    : "file"
         }
      ],
      "status" : "active",
      "user"   : "localhost"
   }
}
```

### Heartbeat Schema
```json
{
   "heartbeat": {
      "agent" : "string, Name of local user at it appears to the remote users.",
      "shares": "empty string or share object, This property is only populated for shares of the originating localhost when the heartbeat originates in the browser, and so if this is not an empty string the status property must have an 'active' value.",
      "status": "string: active, idle, offline",
      "user"  : "empty string"
   }
}
```


---


## Invitation
The invitation process is how the application processes a request to add another user and how to respond to requests from other users.  For the process diagram please see the documentation: [invitation.md](invitation.md).

### Invitation Example
```json
{
   "invite": {
      "action"    : "invite",
      "deviceKey" : "",
      "deviceName": "",
      "ip"        : "192.168.0.45",
      "message"   : "Hello",
      "modal"     : "invite-request-0.929743434347059471",
      "name"      : "Austin",
      "port"      : 80,
      "shares"    : [
         {
            "execute" : false,
            "name"    : "C:\\MP3\\_new",
            "readOnly": true,
            "type"    : "directory"
         }
      ],
      "status"    : "invited",
      "type"      : "user",
      "userHash"  : "",
      "userName"  : ""
   }
}
```

### Invitation Service Types
The invitation is made up of 4 services:
* **invite** - The initial invitation sent from the browser to the terminal application.
* **invite-request** - The initial *invite* service is converted to an *invite-request* where it is routed to the terminal application of a remote user.  The terminal application receiving the request will send it to the remote user's browser via web socket.
* **invite-response** - The remote user's browser will display a modal alerting the remote user that an invitation is available.  The remote user can ignore the invitation or accept the invitation.  If the invitation is ignored no further action is taken.  If the invitation is accepted the *invite-response* service is generated at the remote user's browser and sent to the remote user's terminal application.  At this point the remote user adds the originating user to their user list.
* **invite-complete** - The remote user's terminal application converts the *invite-response* to an *invite-complete* application and routes it back to the originating user's terminal application.  The originating user's terminal application forwards the accepted invitation to the browser where the invitation acceptance is processed.

### Invitation Schema
```json
{
   "invite": {
      "action"    : "invite",
      "deviceKey" : "string, a hash uniquely identifying the current device",
      "deviceName": "string, the name of the current device",
      "ip"        : "string, ip address to send the invitation",
      "message"   : "string, text message from the invitation request.",
      "modal"     : "string, id of the invitation request modal",
      "name"      : "string, user name",
      "port"      : "number, port number associated with the ip address",
      "shares"    : ["array of share objects", "see Storage/Users for definitions"],
      "status"    : "string, status of invitation: accepted, declined, invited",
      "type"      : "string, the type of invitation whether its for a different device associated with the same user or a different user",
      "userHash"  : "not yet used",
      "userName"  : "not yet used"
   }
}
```

### Invitation Action
The action property determines which set of instructions to execute the current stage in the process.

* **invite** - The invitation is initiated by the browser.
* **invite-request** - The invitation is received by the local node instance, is renamed from *invite* to *invite-request* and forwarded to the remote device.  The remote device then forwards the invitation to the browser for the user to handle.
* **invite-response** - The user of the remote device has completed their decision and the invitation is routed back to the remote node instance.
* **invite-complete** - The *invite-response* is renamed to *invite-complete* and sent to the originating node instance when then forwards it to the browser for the user's notification.

### Invitation Status
The invitation *status* property will feature one of these values:

* **accepted** - The invitation is accepted by the remote user.
* **declined** - The invitation is declined by the remote user.
* **invited** - The invitation is not yet answered by the remote user.


---


## Updates
* **fs-update-remote** - If a watcher is present on a file system location and the file system changes at that location then an updated file system data object, identical to calling the fs-directory service, is sent to all users.  This service exists in case a modal is open in the browser to a remote user's file system and the file system contents should be automatically updated as changes to the remote file system occur.  File system watches are not always reliable even on the local computer, so this service is especially not reliable.
* **share-update** - When a user changes their share details this service is broadcast to each of their users.  The *users* storage file is automatically updated upon receipt of this service.  For security reasons changes to shares are immediate regardless of when, or if, a remote user receives this service.

### fs-update-remote Example
```json
{
   "fs-update-remote": {
      "agent"   : "remoteUser",
      "dirs"    : [
         ["storage.txt", "file", "", 0, 0, "stat"]
      ],
      "location": "storage",
      "status"  : "test payload"
   }
}
```

### fs-update-remote Schema
```json
{
   "fs-update-remote": {
      "agent"   : "string, who to send the update to",
      "dirs"    : ["array of directory item data structure starting from the address in the location property"],
      "location": "string, the file system address that is modified",
      "status"  : "string, status text for a modal's status bar"
   }
}
```

### share-update Example
```json
{
   "share-update": {
      "user"  : "remoteUser@[::1]:XXXX",
      "shares": [
         {
            "execute" : false,
            "name"    : "C:\\MP3\\_new",
            "readOnly": true,
            "type"    : "directory"
         }
      ]
   }
}
```

### share-update Schema
```json
{
   "share-update": {
      "user"  : "the remote user whom is reporting an update to their shares",
      "shares": ["array of share objects"]
   }
}
```