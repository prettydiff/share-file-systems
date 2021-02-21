# Share File Systems

## Purpose
Virtually bind multiple physical devices into a single virtual computer using a network.  A cross-OS private one-to-many online point-to-point relationship that shares computer availability, such as execution contexts and file system.  Your personal devices should be fully available to you regardless of where you are and of limited availability to other people you choose.

This application seeks to be inherently private which disallows information broadcasts such as unrestricted Facebook updates or Twitter posts.  *Privacy should be thought of as sharing restricted to persons specifically identified prior, opposed to publishing to anonymous users, without any third party access.*

## Features
* Works the same on Windows, Linux, and Mac OSX.
* A Windows/OSX like graphic user interface in just a few functions that are easy to extend and customize.
* Application saves state on each user interaction, which allows application to resume without disruption.
* A robust security model.
* File integrity checks via SHA3-512 hash.
* A variety of tools optionally available via terminal commands.

## License
[AGPLv3](https://www.gnu.org/licenses/agpl-3.0.en.html)

## Build and execute
### First build
1. Install [Node.js](https://nodejs.org), at least version **14.1.0**, using default options.
1. Clone the application from Github.
   * `git clone https://github.com/prettydiff/share-file-systems.git`
1. Move into the directory.
   * `cd share-file-systems`
1. Globally install TypeScript.
   * `npm install -g typescript`
1. Locally install the TypeScript node type definitions.
   * `npm install`
1. Compile to JavaScript.
   * `tsc --pretty` **
1. Build the application.
   * `node js/application build`
1. Execute the application.
   * `node js/application service`
   <!-- cspell:disable-->
   * If in Linux you receive issue starting with *EACCESS* follow these steps:
      - `sudo apt-get install libcap2-bin`
      - ```sudo setcap cap_net_bind_service=+ep `readlink -f \`which node\`` ```
   <!-- cspell:enable-->
1. Open your favorite modern browser to http://localhost
   * If this doesn't work make an exception in your local firewall for port 443, or which ever port you specify.

* If the `npm` command is not available in Windows:
   - Install *NVM* (Node Version Manager) for Windows: https://github.com/coreybutler/nvm-windows
   - Or, close the current shell and open a new shell as administrator. Run the command for your shell:
      * cmd - `SET PATH=%AppData%\npm;%PATH%` or
      * Powershell - ``SET PATH=%AppData%\npm`;%PATH%``
* If Windows Powershell returns an error saying: *"execution of scripts is disabled on this system"* then run this command:
   - `Set-ExecutionPolicy RemoteSigned`
   - Choose option **Y**

### Execute automated demo (opens your default browser)
1. `node js/application test_browser demo`

### Later builds
1. `npm restart` is a convenience command that contains the build and starts services so this is all you need even if you make code changes.
1. If a browser isn't already open to the application then open it to http://localhost

## A quick user introduction
1. The first time you open the application it will ask you to create a user name and device name.
1. Notice the *hamburger* menu icon in the top left corner of the application.  Click that to open the primary menu and select *File Navigator*.
1. The File Navigator will allow a person to navigate their file system just like using their underlying operating system.  Select a couple of things you would like to share.  Right click on the select item(s) and choose *Share*.
1. On the right side of the page are the device and user icons.  Click on the button labeled *All Shares* to see which items are shared.  Nothing is shared by default.
1. In the user list click on the button labeled *Add Device or Invite User* to add a personal device to access your shares.  At this time users and devices are found across the network by IP address and port so the destination must have this application running and you must be able to access that IP address directly.  The default port is 443.
1. Once a personal device is added you have complete unrestricted access to the device no differently using the application on your current computer.  Access control restrictions apply to users and not devices as a user represents one or more personal devices.  See the [security model](#security-model) for more information.
1. At the time of this update I am currently finishing up copy/cut of files to and from different users, but it isn't ready just yet.  It sounds pretty simple to copy/paste by HTTP to write a file via stream across an HTTP response.  Allowing users access to a Windows-like file system explorer means a user can easily select a group or files and/or directories to copy at once which is a bit more complex.

## Status, as of 0.0.18
This application is currently in early development but is maturing rapidly.  The following list provides the current feature state:

### Status Codes
* **mature** - is production ready
* **stable** - appears to work in most cases, but demands further testing
* **experimental** - works in some cases, but is either defective or incomplete
* **development** - is not proven to work and is in early stages of development
* **absent** - a planned feature but not under development yet

### Status List
* Graphic User Interface - **mature**
* File system display/interaction - **mature**
* Terminal utilities - **mature**
* Agent invitation and sharing real time updates - **mature**
* Heartbeat and status notifications updates in real time - **mature**
* Security model - **stable**
* File system access via personal devices - **stable**
* File system access via remote user - **development**
* Remote execution - **absent**
* Messaging/texting - **absent**
* Device application list - **absent**
* Test automation
   - terminal/commands - **mature**
   - services - **mature**
   - browser/GUI - **mature**
   - end-to-end tests - **development**

### Status Notes
1. HTTP is used for all services at this time.  This has proven sufficient enough for heartbeat and invite services, but is proving to not be enough for file copy through the security model.  I will be investigating use of WebRTC.
1. I will be begin work using WebWorkers paid with a listener to execute browser tests via DOM manipulation from a remote instruction list.
1. If I can make browser test automation work as I hope I will need to extend it to support end-to-end tests.  Currently I am performing manual tests with a VM, which has a very high overhead.  I may investigate using a headless Linux VM running both Node and a browser if such a thing exists.

## Security Model
### Terminology
* agent - Generically describes any user or device.
* device - An application instance running on a computer.
* share - A limited area of access to a device exposed to other users.  A share will either be read only (default) or full control.
* user - A group of one or more devices.

### Security Description
1. All devices, shares, and users have identity denoted by a SHA3-512 hash.  Collisions in this hash algorithm are unlikely, but to further ensure uniqueness device hashes are partially based upon the user hash, and share hashes are partially based upon the given device's hash.
1. A user has full unrestricted access to all devices associated with that user identity.
1. A user cannot see the device identities of another user's devices.  A user only sees another user's user hash and shares.
1. A user can only see and access areas of devices designated as a share.
1. If a share is set to read only other users may read from all and copy any areas within that segment of the file system tree, but may not create directories or write files.

### Security Model Notes
1. Since shares are associated with devices and devices are not identified to other users there must be some degree of application service routing to ensure access to a share on the proper device from which that share is formed.
   1. In most cases access to a share from a remote user is a simple matter of running through the list of devices and associating share specified on the request to a same in the device data structure.
   1. If a user wishes to copy files from another user into a location of a device that is not shared the security model must be circumvented without exposing device identities to external users.

## Developer Guide
Please see the [developer guide](documentation/developer_guide.md).

## This project needs help
* I am especially weak at writing test automation that executes in the browser.  Any help writing test cases for a headless browser would be greatly appreciated.  I need this more than anything else.
* I am also weak at writing network logic.  Currently this application uses HTTP until it is upgraded to HTTPS.  The application might benefit from a custom protocol using TCP sockets.  Any help with this would also be appreciated.

## FAQ
* **I found a defect or wish to make a recommendation.  What should I do?**  Submit an issue on [Github](https://github.com/prettydiff/share-file-systems/issues), or fix the issue and submit a pull request.  This is open software.
* **Encryption in the browser isn't mature yet.  How will this application solve that problem?**  This application exists as both a browser instance and a Node.js instance on a given computer.  Encryption may not be mature in the browser, but it is mature in Node.  Node will perform encryption of outgoing information and decrypt incoming information.  That information will then be transfer to the browser on the local machine.
* **I can't share files with my friend across the world. What gives?**  At this time the application only operates on local networks via IP address.  See Phase 2 of the Road map above.
* **Will I be able to share files from OS X and Linux with Windows?**  Yes.  This application is an abstraction over Node.js and so it works where ever Node is supported. For OS support see all of Node's download options at https://nodejs.org/dist/v13.0.0/ which is the latest version of Node at the time of this writing.
* **Aren't web browsers and JavaScript too slow for anything practical?**  No.  I have a 4k UHD monitor and the GUI performs like a native OS experience.  The application is largely powered by Node really making it an abstraction over OS friendly C++ libraries that work very efficiently.
* **Are there commercial ambitions with this project?**  Yes and no.  This application, the client-side peer-to-peer application will remain free and open source.  See Phase 2 of the Road Map mentioned above.  A high bandwidth service to route traffic across the internet will cost money to operate and will require a commercial venture to fulfill.
* **As a webpage tool how do I save state?**  User experience settings and application state are automatically written to a file: *storage/settings.json*.  Since settings are saved in a file you can easily continue your user experience after restarting your computer, in a different browser on the same computer, or on a completely different computer if you transfer the *storage/settings.json* to the new computer.
* **Won't inherent privacy and end-to-end encryption enable illegal behavior?**  This application seeks to limit access of communications to prior specified parties using open standards.  This application does not intend to otherwise become a vector for any illegal or malicious activity and will not seek to prioritize or preference any user content.  This application has no plans, at this time, to encrypt data at rest on storage devices.  If law enforcement wishes to access private content they should do so by obtaining a warrant and properly seizing a user's computing device no differently than law enforcement access of email.
