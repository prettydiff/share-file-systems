# Share Spaces

## Purpose
The end state is to offer a cross-OS private one-to-many online relationship that shares media, messaging, and file system access with end-to-end encryption from the browser.

This application seeks to be inherently private which disallows information broadcasts such as unrestricted Facebook updates or Twitter posts.  *Privacy should be thought of as sharing restricted to persons specifically identified prior, opposed to publishing to anonymous users, without any third party access.*

## Status
This application is currently in early development in an largely experimental state, so use at your own risk.

This application is also not yet licensed.

## Build and execute
### First build
1. Install [Node.js](https://nodejs.org)
1. Clone the application from Github. `git clone https://github.com/prettydiff/shared-spaces.git`
1. Move into directory. `cd shared-spaces`
1. Install TypeScript: `npm install -g typescript`
1. Instead the TypeScript node types. `npm install`
1. Compile to JavaScript. `tsc --pretty`
1. Execute the application: `npm restart`
   * The restart command first builds the application and then enables services.
1. Open your favorite modern browser to http://localhost
   * You may need to make an exception in your local firewall for port 80, or which ever port the user specifies.

### Later builds
1. `npm restart` command contains the build and starts services so this is all you need even if you make code changes.
1. If this browser isn't already open then open to http://localhost

## A quick use guide
1. The first time you open the application it will ask you to create a user name.
1. Notice the "hamburger" menu icon in the top left corner of the application.  Click that to open the primary menu and select *File Navigator*.
1. The File Navigator will allow a user to navigate their file system just like using their underlying operating system.  Select a couple of things you would like to share.  Right click on the select item(s) and choose *Share*.
1. On the right side of the page is the user icons.  Click on the button labeled *All Shares* to see which items are shared.
1. In the user list click on the button labeled *Invite User* to invite a user to access your shares.  At this time users are found across the network by IP address and port so the destination must have this application running and you must be able to access that IP address directly.  The default IP address is currently 80 but the default will change to 443 once the application upgrades to HTTPS.
1. Once the invitation is accepted by the end user they can access your shares and you can access theirs.  To see their shares close the prior opened *All Shares* window and open a new such window by again clicking the button *All Shares*.
1. At this time security restrictions are not in place so any shared file system resource allows access to the entire file system unrestricted.  This is great for testing and experimentation, but be careful because unrestricted means a user can rename, move, or delete your files and directories.
1. At the time of this update I am currently finishing up copy/cut of files to and from different users, but it isn't ready just yet.  It sounds pretty simple to copy/paste by HTTP to write a file via stream across an HTTP response.  Allowing users access to a Windows-like file system explorer means a user can easily select a group or files and/or directories to copy at once which is a bit more complex.

## How this application works
The application is based upon Node.js running a local web server as a client-side utility.  A web browser connects to that webserver as localhost.  The local service is just HTTP and a web socket connection.  Together the browser environment and Node.js application form a single application with limited network connectivity.  Network connections outside of the localhost environment are requested due to specified user interactions in the browser but are executed from the Node application.  This model ensures the application functions in a peer-to-peer model where external communications only exist away from the user experience limited to predefined application tasks.

### Messaging Diagram
This is a gross over-simplification of messaging exchange in the application:

```
Local Computer                                    | Remote Computer
 _________  -----HTTP----->  _________  --HTTP--> |  _________  --Web Socket-->  _________
| browser | <-------------- | Node.js | <-------- | | Node.js |                 | Browser |
 _________                   _________            |  _________                   _________
            <--Web Socket--             <--HTTP-- |             <-----HTTP-----
                                        --------> |             -------------->
```

The shape of communication is roughly similar to email in that a client connects to a local server for routing guidance that then talks to a remote server for delivery to the end client.  The middle layers in this case execute application instructions instead of message routing.  Also unlike email presentation, transport, and message parsing are strictly separated at all layers.

Email's most visible thorn is SPAM, or unsolicited requests.  This application seeks to mitigate SPAM by operating through invitation only such that one user must invite another user before they can message or share.

## Developer Guide
Please see the [developer guide](documentation/developer_guide.md).

## Road map
These are major efforts that need to be performed and are prioritized.

### Phase 1: Complete Peer-to-Peer application
1. Complete and test file system object copy from one computer to another using the GUI.
1. Upgrade all communications from HTTP to HTTPS (default port 80 to 443).
1. Harden the application's security model.
   * Restrict HTTP GET requests to the localhost environment only.  Otherwise return HTTP status 403: Forbidden.
   * Associate file system watches to the watching agent
   * Restrict file system access above the specified share
   * All file system shares, by default, should be read only to remote agents.
   * Provide throttling for invitation messages, which are the only authorized form of external communication.
1. Create a text message client and 'sticky note' utility for communicating with remote users.
1. Key exchange and end-to-end encryption.

### Phase 2: Create Tunneling Service
Currently the application is using IP addresses for user identification and addressing.  This will not work if a given IP isn't routed, such as : 10.0.0.0, 172.12.0.0, 192.168.0.0 and link local IPv6 addresses.  To allow connectivity from any internet connected user a central service must be created offer HTTPS tunnels as a service that act similar to a VPN tunnel.  When two users tunnel to the central service the central service can route messaging and data between the two users.  Since the messaging will be encrypted via key exchange the central service only provides a tunnel without providing content or having access to end user content.

1. Create a user ID system based upon SHA512 hashes: 128 character alpha-numeric character string.  This will allow users some limited amount of anonymity but will ensure
1. Create a tunneling to the server, which can be as simple as a HTTP keep-alive from a central webserver.
1. Routing messaging from one tunnel to the proper remote tunnel.
1. Revert the client application to accept only service issued IDs instead of IP addresses

## This project needs help
* I am especially weak at writing test automation that executes in the browser.  Any help writing test cases for a headless browser would be greatly appreciated.  I need this more than anything else.
* I am also weak at writing network logic.  Currently this application uses HTTP until it is upgraded to HTTPS.  The application might benefit from a custom protocol using TCP sockets.  Any help with this would also be appreciated.

## FAQ
* **I found a defect or wish to make a recommendation.  What should I do?**  Submit an issue on [Github](https://github.com/prettydiff/shared-spaces/issues), or fix the issue and submit a pull request.  This is open software.
* **Encryption in the browser isn't mature yet.  How will this application solve that problem?**  This application exists as both a browser instance and a Node.js instance on a given computer.  Encryption may not be mature in the browser, but it is mature in Node.  Node will perform encryption of outgoing information and decrypt incoming information.  That information will then be transfer to the browser on the local machine.
* **I can't share files with my friend across the world. What gives?**  At this time the application only operates on local networks via IP address.  See Phase 2 of the Road map above.
* **Will I be able to share files from OS X and Linux with Windows?**  Yes.  This application is an abstraction over Node.js and so it works where ever Node is supported. For OS support see all of Node's download options at https://nodejs.org/dist/v13.0.0/ which is the latest version of Node at the time of this writing.
* **Aren't web browsers and JavaScript too slow for anything practical?**  No.  I have a 4k UHD monitor and the GUI performs like a native OS experience.  The application is largely powered by Node really making it an abstraction over OS friendly C++ libraries that work very efficiently.
* **Are there commercial ambitions with this project?**  Yes and no.  This application, the client-side peer-to-peer application will remain free and open source.  See Phase 2 of the Road Map mentioned above.  A high bandwidth service to route traffic across the internet will cost money to operate and will require a commercial venture to fulfill.
* **As a webpage tool how do I save state?**  User experience settings and application state are automatically written to a file: *storage/settings.json*.  Since settings are saved in a file you can easily continue your user experience after restarting your computer, in a different browser on the same computer, or on a completely different computer if you transfer the *storage/settings.json* to the new computer.
* **Won't inherent privacy and end-to-end encryption enable illegal behavior?**  This application seeks to limit access of communications to prior specified parties using open standards.  This application does not intend to otherwise become a vector for any illegal or malicious activity and will not seek to prioritize or preference any user content.  This application has no plans, at this time, to encrypt data at rest on storage devices.  If law enforcement wishes to access private content they should do so by obtaining a warrant and properly seizing a user's computing device no differently than law enforcement access of email.
