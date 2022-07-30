# Share File Systems

## Purpose
**A fully decentralized social application built from the file system first.**  This application makes no use of blockchain or other crypto-coin technologies.

Imagine your mom copy and paste a file from your computer to hers a hundren miles away using her web browser.  Openly share your hard drives with yourself and people you trust in as little or as much as you wish.  The application uses a familiar Windows/OSX like GUI experience in your web browser.  No cloud, no servers, no third party, or intermediary of any kind.

This application seeks to be inherently private.  Everything is directly point to point to users and devices you invite and therefore end-to-end encrypted.

## Media
### Videos
 * Product Demo - https://prettydiff.com/share-product-demo.mp4
 * Test Automation - https://prettydiff.com/share-test-automation.mp4

[Screenshots](documentation/screenshots.md)

## Features
* Point-to-point communications, no servers and no third party.
* Share anything you want and communicate between your personal devices or allow discretionary sharing with friends and family.
* Works the same on Windows, Linux, and Mac OSX on modern terminals and modern browsers.
* Real time communications for all status, changes, and interactions.
* App loads in the browser at about 0.175 seconds with full state restoration.
* A Windows/OSX like graphic user interface in just a few functions that are easy to extend and customize.
* File interactions of multiple files via shortcut key combinations, drag and drop, and copy/paste using a context menu.
* Application saves state on each user interaction, which allows application to resume without disruption.
* Application state available between different browsers on the same computer and exportable to different computers.
* A robust security model.
* File integrity checks via SHA3-512 hash.
* A variety of tools optionally available via terminal commands.
* For use with [Electron](https://www.electronjs.org/) or [Tauri](https://tauri.app/) see the [documenation](./documentation/electron_tauri.md). 
<!-- cspell:disable-next-line -->
* Seeks to solve the same problem as [Upspin](https://upspin.googlesource.com/upspin/) but with privacy first, performance, and a GUI

## License
[AGPLv3](https://www.gnu.org/licenses/agpl-3.0.en.html)

## Version
0.2.13

## Build and execute on desktop
### First build
1. Install latest version of [Node.js](https://nodejs.org). I recommend using a version manager:
   1. [Windows NVM](https://github.com/coreybutler/nvm-windows)
   1. [Linux, OSX](https://github.com/nvm-sh/nvm)
1. Install [git](https://git-scm.com/downloads)
1. Nerdy terminal commands
   1. Clone the application from Github into a directory named *share*.
      * `git clone https://github.com/prettydiff/share-file-systems.git share`
   1. Install the application
      * `node share/install`
   1. Execute the application.
      * `share`
1. Open your favorite modern browser to https://localhost
   * If this doesn't work make an exception in your local firewall for port 80, 443, or which ever port you specify.

**Please note the install script requires use of `sudo` on Linux to install certificates and allow access to restricted ports.**

### Later builds
* `share` will execute the application services from any file system location.
* `share build` will rebuild the application from any file system location.
* `share update` will pull updates from Github, rebuild the application, and run services.
* `share commands` will display all supported terminal commands
* `share commands copy` providing a command name as an argument for the *commands* command provide documentation of supported conventions with examples

### Execute test automation demo (opens your default browser)
1. `share test_browser`

<!--
## Install on IPhone
1. Download iSH from the app store.  It is a Linux shell.  Open it.
</!-- cspell:disable --/>
1. In iSH execute command to install a package manager: `wget -qO- http://dl-cdn.alpinelinux.org/alpine/v3.12/main/x86/apk-tools-static-2.10.5-r1.apk | tar -xz sbin/apk.static && ./sbin/apk.static add apk-tools && rm sbin/apk.static`
   * For a list of available packages see: https://github.com/ish-app/ish/wiki/What-works%3F
</!-- cspell:enable --/>
1. Then install wget: `apk update && apk add --no-cache wget`
1. Download Node using wget: `wget https://nodejs.org/dist/v15.14.0/node-v15.14.0-linux-x64.tar.xz && tar -xf node-v15.14.0-linux-x64.tar.xz`
-->
