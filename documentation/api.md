<!-- documentation/api - This documentation details the various services offered by the application. -->

# Share File Systems - API Documentation
This documentation is collected from the interfaces defined in *index.d.ts* and their use in *lib/terminal/commands/service.ts*.

## fileListStatus
Provides status update messaging about a file system segment on a remote device.  Used as the *status* property of the [fsUpdateRemote](#fsUpdateRemote) service.

**Not formally described as an interface in index.d.ts.** This service is defined as a string format in *lib/terminal/server/fileService.ts*.

```typescript
`fileListStatus:{"failures":[],"target":"remote-${data.id}","message":"Copy complete. ${commas(countFile)} file${filePlural} written at size ${prettyBytes(writtenSize)} (${commas(writtenSize)} bytes) with 0 failures."}`
```

* **failures** - string array - A list of file system artifacts that could not be accessed due to restrictions from the operating system or any sort of collision.
* **target** - string - An identifier describing the modal in the local browser in which to write status updates.
* **message** - string - The status message to write.

---

## fs
A data structure for describing various actions to perform upon a file system remote or local.  For specific definitions about the supporting actions please see [fileSystem.md](fileSystem.md).

```typescript
interface fileService {
    action      : serviceType;
    agent       : string;
    copyAgent   : string;
    depth       : number;
    id          : string;
    location    : string[];
    name        : string;
    remoteWatch?: string;
    watch       : string;
}
```

* **action** - The action to perform.
* **agent** - On which device the action must occur.
* **copyAgent** - On which device the destination of a *copy* or *cut* action occurs.
* **depth** - The depth of recursion to allow when reading from a file system. Value *0* means full recursion, value *1* means no recursion as in reading at only 1 depth, and greater values specify the depth.
* **id** - The identifier of the browser modal on which changes should be written.
* **location** - A list of file system artifacts on which to apply an action.
* **name** - This property is used for wildly different things depending upon the action.  See the [fileSystem.md](fileSystem.md) document for definitions.
* **remoteWatch** - Whether a file system location on a remote device should be watched.  This property is rarely used and is sometimes overloaded as storage for string values of other actions.
* **watch** - Whether a local file system location should be watched and if so the location to watch.

---

## fsUpdateRemote
This service provides updates about information changes to a concerned file system segment on a remote device, such as for file system watch or file copy status.

```typescript
interface fsUpdateRemote {
    agent: string;
    dirs: directoryList;
    fail: string[];
    location:string;
    status?:string;
}
```

* **agent** - The remote user.
* **dirs** - The directory list data type object.
* **fail** - A list of file system objects that could not be accessed due to operating system conventions or collisions.
* **location** - The file system address from which the directory list object was gathered.
* **status** - The current status of a given job as a data structure: see service [fileListStatus](#fileListStatus)

---

## heartbeat
The heartbeat provides an indication whether a remote user is offline, online, or online but inactive (idle).

```typescript
interface heartbeat {
    agent: string;
    refresh: boolean;
    status: heartbeatStatus;
    user: string;
}
```

* **agent** - The identity of the remote user.
* **refresh** - Whether the heartbeat should trigger a browser page refresh.
* **status** - Whether the local or remote user is offline, online, or idle depending upon whether the heartbeat came from the remote or the local browser.
* **user** - The local user identity, typically populated from the reference `serverVars.name`.

---

## httpClient
A generalized abstraction for making HTTP child requests from a single point with managed responses.

```typescript
interface httpConfiguration {
    callback: Function;
    callbackType: "body" | "object";
    errorMessage: string;
    id: string;
    payload: Buffer|string;
    requestError?: (error:NodeJS.ErrnoException, agent?:string) => void;
    response?: any;
    responseError?: (error:NodeJS.ErrnoException) => void;
}
```

* **callback** - A function to either handle the response body or a function wrapping the response object itself as determined by the property *callbackType*.
* **callbackType** - The value *body* indicates to use the default function and executes a function with the response body as the function's argument.  The value *object* provides a function that wraps the response object and handles the response directly.
* **errorMessage** - A custom message to pass into the default request error handler and the default response error handler.
* **id** - The id refers to a modal id so that in the case of an error the error messaging can be relayed to the user at the proper location in the browser.
* **payload** - The POST message to send in the HTTP request.
* **requestError** - Custom error handling on the request.
* **response** - The response object from the parent HTTP service, which is used in default error handling.
* **responseError** - Custom error handling on the response.

---

## invite
A data service to invite a remote user to share.  Upon acceptance of the invitation the two users establish a peer-to-peer relationship.  For more information on the invitation process please see [invitation.md](invitation.md).

### Security Note
All other services are aggressively blocked between devices unless a sharing relationship is established and retained by both parties.  Invitation requests bypass that security policy as no such relationship exists until the completion of the invitation process.

```typescript
interface invite {
    action: "invite" | "invite-request" | "invite-response" | "invite-complete";
    ip: string;
    message: string;
    modal: string;
    name: string;
    port: number;
    shares: userShares;
    status: "accepted" | "declined" | "invited";
}
```

* **action** - The step in the invitation process.
* **family** - Whether the IP address is IPv4 or IPv6.
* **ip** - The IP address location to send the invitation.
* **message** - A text message to describe the invitation or the inviting user.
* **modal** - The modal ID on which to update as the process progresses.
* **name** - The user name of the inviting user.
* **port** - The port number the remote user is running their application on.  If no port is specified the default port will be attempted.
* **shares** - The share list from the inviting user.  Once the remote user accepts the invitation the inviting user name, and their shares, are automatically added to their local application.
* **status** - The remote user status upon the invitation.

---