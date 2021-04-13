# Share File Systems

## Purpose
Virtually bind multiple physical devices into a single virtual desktop using a network.  A cross-OS private one-to-many online point-to-point relationship that shares computer availability; such as file system, messaging, and eventually remote command and control of application execution.  Your personal devices should be fully available to you regardless of where you are and of limited availability to other people you choose.

This application seeks to be inherently private.  *Privacy should be thought of as sharing restricted to persons specifically identified prior, opposed to publishing to anonymous users, without any third party access.*

## Media
### Videos
 * Product Demo - https://prettydiff.com/share-product-demo.mp4
 * Test Automation - https://prettydiff.com/share-test-automation.mp4

[Screenshots](documentation/screenshots.md)

## Features
* Works the same on Windows, Linux, and Mac OSX on modern terminals and modern browsers.
* Real time communications for all status, changes, and interactions.
* A Windows/OSX like graphic user interface in just a few functions that are easy to extend and customize.
* File interactions of multiple files via shortcut key combinations, drag and drop, and copy/paste using a context menu.
* Application saves state on each user interaction, which allows application to resume without disruption.
* Application state available between different browsers on the same computer.
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
1. Locally install the developer dependencies.
   * `npm install`
1. Compile to JavaScript.
   * `tsc --pretty`
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

## Status, as of 0.1.0
### Release Goals
* Version 0.1 goals:
   - Security model: **complete** - The security model is defined and provable against current test automation.
   - User file operations (not copy/cut): **complete** - Done.
   - User file copy operations: **complete** - This is tied to the security model and the work appears complete, but could use some more cases in the test automation.
   - End to end test automation from the browser: **complete** - The test utility is stable and fully expressive for conducting testing starting in the browser across multiple simultaneous machines.
   - Text message utility: **complete** - This work has started, but it is early and not functional.
* Version 0.2 goal:
   - Upgrade communication from HTTP to HTTP/3 streams.
   - Remote application execution.
   - Command terminal in the browser.
   - Documentation / EBook modal in the browser.

## Business Case
Currently the application is fully functional and has achieved its initial design goals.  The application is a point-to-point media streaming and text messaging application that is inherently private without any exposure or connection to any third party for any reason.  There are some fundamental limitations with the solution provided by this application in its current form.  First a brief overview of current limitations:

### Limitations
1. **Private Network** - Currently this application is only guaranteed to work on a local switched network.  This limitation is due to the limitations of IPv4 network address translation, firewalls, and various other considerations.  This problem is solvable with a tunnel through a public relay, which is similar but not the same as current VPN solutions.  A VPN provides an encrypted tunnel through the internet by a trusted provider.  A relay simply provides a public address for external connectivity.  A relay does not provide the security or trust benefits of a VPN because its goals are only connectivity, which allows flexibility and autonomy that aren't available with a VPN.  For example any user could easily host their own relay provided a public IP address, which allows for anonymity and portability.
2. **Encryption** - Currently the application is using HTTP and WS protocols that lack encryption instead of the more secure HTTPS and WSS protocols.  HTTPS requires a digitally signed certification.  There are a variety of means for solving this problem including a *self-signed certificate* that can be generated by this application.  The actual real world security value of a certificate is a badge of trust.  In the case of a point-to-point application each end point requires their own certificate to validate identity and those certificates must be mutually trusted.  That real world solution to this problem is a web certificate authority serving as a client identity trust similar to a digital signature authority, which is similar but not the same as other current web certificate authorities.  The application is already point-to-point so end-to-end encryption is easily attainable in a private and distributed manner by generating keys from the remote user's certificate which ensures uniqueness and confidentiality.
3. **Mobility** - A mobility solution must account for continuity of transmission through a shifting of geography and addressing.  In a client-server model this problem is easily solved by existing infrastructure accounting for client identity moving across various points of a network, such as a digital cellular network while driving.  In that case the problem is easily solved because only the client is mobile.  In the case of this application there is no server and all end points are potentially mobile.  In the case of a point-to-point application mobility is solved through an inverted DNS scheme that stores addresses relative to identities and resolves location to identity.

Those limitations are solvable, but it requires a business investment in new infrastructure.

### Potentials for disruption
Most online services are inherently reliant upon a client-server model, because investment in new infrastructure is expensive.  Client-server models also unfairly advantage the server side of the information exchange allowing server owners to become data brokers without client benefit.  Worse is that server providers frequently opaquely alter the tone and substance of a conversation to artificially position traffic for their business advantage, which creates online perceptions out of alignment with real world sentiments. A true point-to-point model is essentially a client-client model where are all parties are equal and server owners are removed from the information exchange.

My initial motivation to create this technology was to allow access to my own connected personal devices and data even when separated by great distance.  When I leave home to travel around the world on a military deployment I should be able to access my personal computer through the internet with security and privacy.  Currently I cannot reliably do that.  I should be able to communicate with my wife without funneling our private messages through some central service.  End-to-end encryption provides some level of reassurance but is not a complete solution, because it still requires a degree of trust vested in that service provider.  You can achieve end-to-end encryption without any central service.

A true point-to-point solution with end-to-end encryption, mutually trusted certificates, and tunneling through the internet ensures users can talk freely without pressure from oppressive governments or artificial social influence.  It also ensures that information exchange isn't limited by the interests, terms, or availability of service providers.