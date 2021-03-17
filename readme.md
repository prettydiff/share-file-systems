# Share File Systems

## Purpose
Virtually bind multiple physical devices into a single virtual desktop using a network.  A cross-OS private one-to-many online point-to-point relationship that shares computer availability; such as file system, messaging, and eventually remote command and control of application execution.  Your personal devices should be fully available to you regardless of where you are and of limited availability to other people you choose.

This application seeks to be inherently private.  *Privacy should be thought of as sharing restricted to persons specifically identified prior, opposed to publishing to anonymous users, without any third party access.*

## Video Demo
 * Product Demo - https://prettydiff.com/share-product-demo.mp4
 * Test Automation - https://prettydiff.com/share-test-automation.mp4

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

## Status, as of 0.0.25
### Release Goals
* Version 0.1 goals:
   - Security model: **complete** - The security model is defined and provable against current test automation.
   - User file operations (not copy/cut): **complete** - Done.
   - User file copy operations: **complete** - This is tied to the security model and the work appears complete, but could use some more cases in the test automation.
   - End to end test automation from the browser: **complete** - The test utility is stable and fully expressive for conducting testing starting in the browser across multiple simultaneous machines.
   - Text message utility: **incomplete** - This work has started, but it is early and not functional.
* Version 0.2 goal:
   - Upgrade communication from HTTP to HTTP/3 streams.
   - Remote application execution.
   - Command terminal in the browser.

### Missing Features
Current this is a stand alone point-to-point application with internal data routing mechanisms.  The conventions in place allow for privacy and security from unauthorized users, but are not yet secure against third parties.  The following list describes necessary service offerings that will be required for security and portability:

* **Certificate Authority** - The application is using HTTP for most of its traffic and not HTTPS.  HTTPS requires a certificate and certificates require a trusted issuing authority.  A service is needed to provide personalized certificates bound to a user hash identity.  This will work a bit different than a certificate authority that issues certificates for web sites.
* **IP Resolution** - For portability a third party service is necessary to ensure users/devices can remain connected by informing each other of changes to their addresses. End points can mostly do this on their own, but that is less reliable.  More reliable is end points updating a central service of their current address and other end points resolving addresses from that service.  This would be like an inversion of DNS.
* **Tunnels** - Point-to-point communications will not work in the cases of devices isolated with in a NAT (network address translation) and/or firewall.  The solution to that problem is to create a tunnel, such as a VPN.  To keep the application trustful and free from third party intervention the tunnel service provider will need to be temporal and portable as the discretion of the end device.  **Please note that the routing scheme currently in place defeats the need to tunnel around NAT if any one of a user's devices has both a public IPv4 or IPv6 address and an address on the same NAT subnet.**
* **Code Resolution** - At this time streaming media execution is not a feature, but it should be.  For the moment you must copy media onto a local device before that media can be executed.  In order for streaming media to properly function the requesting entity must have the proper media codecs installed to understand the remote media content.  A service will be needed to detect the codec required by a given piece of media and download/install that codec onto your device.