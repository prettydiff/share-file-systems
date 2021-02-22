# Share File Systems

## Purpose
Virtually bind multiple physical devices into a single virtual computer using a network.  A cross-OS private one-to-many online point-to-point relationship that shares computer availability; such as file system, messaging, and eventually remote command and control of application execution.  Your personal devices should be fully available to you regardless of where you are and of limited availability to other people you choose.

This application seeks to be inherently private.  *Privacy should be thought of as sharing restricted to persons specifically identified prior, opposed to publishing to anonymous users, without any third party access.*

## Video Demo
 * Product Demo - https://prettydiff.com/share-product-demo.mp4

## Features
* Works the same on Windows, Linux, and Mac OSX on modern terminals and modern browsers.
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
   * If this doesn't work make an exception in your local firewall for port 80, 443, or which ever port you specify.

* If the `npm` command is not available in Windows:
   - Install *NVM* (Node Version Manager) for Windows: https://github.com/coreybutler/nvm-windows
   - Or, close the current shell and open a new shell as administrator. Run the command for your shell:
      * cmd - `SET PATH=%AppData%\npm;%PATH%` or
      * Powershell - ``SET PATH=%AppData%\npm`;%PATH%``
* If Windows Powershell returns an error saying: *"execution of scripts is disabled on this system"* then run this command:
   - `Set-ExecutionPolicy RemoteSigned`
   - Choose option **Y**
* Ubuntu Linux does not allow running services on reserved ports (ports less than 1024).  For a work around please see [this documentation](documentation/linuxVM.md#ports)

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

## Status, as of 0.0.23
* Version 0.1 goals:
   - Complete the security model: **incomplete** - The security model is defined, but I still need to complete and test implementation of it for user file copy.
   - User file operations (not copy/cut): **complete** - This portion of the security is stable and the code is implemented.
   - User file copy operations: **incomplete** - This is tied to the security model.  Completing this work proves the security model.
   - End to end test automation from the browser: **complete** - The test utility is stable and fully expressive for conducting testing starting in the browser across multiple simultaneous machines.
   - Text message utility: **incomplete** - This work has started, but it is early and not functional.
* Version 0.2 goal:
   - Remote application execution.