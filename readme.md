# Share File Systems

<!-- cspell:words Tauri, Upspin -->

## Purpose
**A fully decentralized social application built from the file system first.**  This application makes no use of blockchain or other crypto-coin technologies.

Imagine your mom copy and paste a file from your computer to hers a hundred miles away using her web browser.  Openly share your hard drives with yourself and people you trust in as little or as much as you wish.  The application uses a familiar Windows/OSX like GUI experience in your web browser.  No cloud, no servers, no third party, or intermediary of any kind.

This application seeks to be inherently private.  Everything is directly point to point to users and devices you invite and therefore end-to-end encrypted and always private.

*Please note* - Certificate installation is not yet tested on OSX.

## Media
### Videos
 * Product Demo - https://prettydiff.com/share-product-demo.mp4 (22 FEB 2021)
 * Test Automation - https://prettydiff.com/share-test-automation.mp4 (25 FEB 2021)

[Screenshots](documentation/screenshots.md)

## Features
* Point-to-point communications, no servers and no third party.
* Fully load graphic user interface as fast as 80ms on old hardware in the browser with full state restoration (65ms without custom fonts). [See the white paper.](https://github.com/prettydiff/wisdom/blob/master/performance_frontend.md)
* End-to-end encryption.
* Share anything you want and communicate between your personal devices or allow discretionary sharing with friends and family.
* Works the same on Windows, Linux, and Mac OSX on modern terminals and modern browsers.
* Real time communications for all status, changes, and interactions.
* A Windows/OSX like graphic user interface in just a few functions that are easy to extend and customize.
* File interactions of multiple files via shortcut key combinations, drag and drop, and copy/paste using a context menu.
* Application saves state on each user interaction, which allows application to resume without disruption.
* Application state available between different browsers on the same computer and exportable to different computers.
* A robust security model.
* File integrity checks via SHA3-512 hash.
* A variety of tools optionally available via terminal commands.
* For use with [Electron](https://www.electronjs.org/) or [Tauri](https://tauri.app/) see the [documentation](./documentation/electron_tauri.md).

## License
[AGPLv3](https://www.gnu.org/licenses/agpl-3.0.en.html)

## Version
0.2.27

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

## Troubleshooting
### Firewall
In almost every case the reason why connections fail is because one of more computers have a firewall blocking traffic.
   1. To verify whether or not firewalls are the problem temporarily disable the firewalls at both ends and try to connect again.
   1. Ensure the firewall contains both an *inbound* and *outbound* rule for the exact version of Node.js.
   1. These firewall rules must permit TCP traffic for private and public connections for at least the ports used by the application, by default that is 443 and 444.
   1. It is also helpful to enable firewall rules for ICMPv6 to test if a remote agent is reachable over the network with a ping test.
   1. Windows users who use Windows Defender Firewall can solve for firewall concerns with this command: `share firewall`

### Connecting over the internet
#### IPv6
If you are attempting to connect to a remote agent outside your local network router/switch you must use an IPv6 address.
   * IPv6 addresses contain colon characters separating up to 8 blocks of 1-4 alpha-numeric characters.
   * Example: **2600:1700:30e1:15b8:f791:a135:376f:2317**

#### IPv4
IPv4 addresses are fine only so long as both computers share the same local router, which is because routers impose [Network Address Translation (NAT)](https://en.wikipedia.org/wiki/Network_address_translation).
   * IPv4 addresses contain periods and 4 sets of numbers.
   * Example: **127.0.0.1**
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
