<!-- documentation/linuxVM - Notes about configuring Linux virtual machines in support of project development. -->

<!-- cspell:words bcdedit, Bodhi, DHCP, ethernets, hypervisorlaunchtype, Moksha, netcfg, netplan, networkd, sharefs, updatefs, vimrc -->

# Share File Systems - Running a Linux VM on Windows
It is necessary to run Linux and without additional hardware.  At the time of this writing I am running it as a VM in Virtual Box on Windows.  There are a couple import steps to enable this capability.

1. Enable virtualization in the BIOS.  This might be specified as VT-x.  When Windows 10 comes up you can verify that hardware virtualization is enabled by opening the Task Manager, clicking the Performance tab, clicking the CPU view and looking at the data below the graph.  There should be an indication like, **Virtualization     Enabled**.
1. In Windows 10 go to Control Panel -> Programs and Features -> Turn Windows features on or off (left side).  Changing some of the following features will require a restart.  Turn off everything related to virtualization:
   1. Hyper-V
   1. Windows Hypervisor
   1. Contains
   1. Windows Sandbox
   1. Others, you might need to search if after all these steps it still doesn't work.
1. Open Powershell as an administrator and run this command: `bcdedit /set hypervisorlaunchtype off` and then close this Powershell instance.  This step does not require a restart and is the gap between enabling hardware virtualization from the bios and allowing Virtual Box access to that hardware feature.

## Linux Distribution Preference
When all hardware restrictions are removed the greatest performance limitation to running virtual machines with VirtualBox is video processing.  I don't just mean videos like movies.  I mean things as simple os opening windows or moving things around the screen.  Any graphics processing at all.  This limitation is present because the virtual video card provided by VirtualBox is itself limited.

My darling of the moment is [Bodhi Linux](https://www.bodhilinux.com/).  It is basically Ubuntu but running a custom GUI called [Moksha Desktop](https://www.bodhilinux.com/moksha-desktop/) which is incredibly fast. 

## Local VM password
**share1234**

## Network
VirtualBox creates a private network on the host machine: 192.168.56.1/24.  The host and all guests need to connect through this network directly.

### Host-Only network
1. Look at the ip address for each guest.  There should be something like 192.168.x.x/24.  Ensure all guests have the same third octet, such as the 56 in 192.168.56.103.
2. On the host go to the Virtual Box application.  From the main menu go to *File -> Network Operations Manager*.  A window for **Host Network Manager** will open.
3. Look at the network list, if any, and see that there is a network present that matches the guest network.  If not then create one.  Any other networks present in the list can be deleted.  I gave my host the IP 192.168.56.1 with a subnet of 255.255.255.0.
4. At this point there should be a viable host only network.  Go to one of the guests and *ping 192.168.56.1*.  The ping should work.  If not investigate if there is a firewall on the guest.

### Firewall
1. If you have a one way ping, such that a host can ping to a guest but that guest cannot ping the host (or the opposite), the connectivity problem is a firewall problem.
2. If the host and guest can talk to each other only through the local network switch or router the connectivity problem is a firewall problem.  This scenario is evident when the host and guest are able to talk to each other so long as the network connection out of the host is online.

### Guest Adapters
1. Enable a first network adapter with defaults, **NAT**.
2. Enable a second network adapter as **Host-only Adapter** with all other settings at default.  Ensure the *Name* matches the name of the virtual network created moments ago.

## Application Checklist
1. Run the software updater
2. Install vim, `sudo apt-get install vim`
3. Install curl, `sudo apt-get install curl`
4. Install git, `sudo apt install git`
5. Install net-tools, `sudo apt-get install net-tools`
6. Install NVM, `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash`
7. Install TypeScript, `npm install -g typescript`
8. Install ESLint, `npm install -g eslint`
9. Install an editor
   * Lite for low memory images `sudo apt install lite-editor`
   * VS Code for large memory images - download 64bit `deb` package from https://code.visualstudio.com/Download
10. Install Chromium - `sudo apt install chromium-browser`

## Microphone
I had the wonderful experience of my Ubuntu guest stealing access of the microphone away from the Windows host.  This was not an Ubuntu problem but rather a Virtual Box and Windows problem.  Here are the steps to solve this problem.
1. Go into the settings for the VM instance and disable all audio hardware support.
1. Go into the Speaker settings in the Windows host.
   1. Open Control Panel and select **Sound**
   1. Under the *Playback* tab find the microphone and press the *Properties* button.
   1. In *Properties* click the *Advanced* tab.
   1. Change the frequency to *24bit, 44100 hertz* and click the *Ok* button.
   1. Go back into properties and change it to *24bit, 48000 hertz* and click *OK* button.
   1. The *Playback* tab is complete. Repeat that process for the microphone under the *Recoding* tab.
   1. Ensure the microphone is enabled in the Windows host recording application.

## Shell Customization
All these tasks will occur in the .bashrc file, so:

`vim ~/.bashrc`

Once edits are complete the code must be compiled before the computer will see any changes:

`source ~/.bashrc`

### Custom Prompt
Modify the prompt into something informative matching the style of this application

1. Search the file for a variable named `PS1`, which is the prompt value.
2. If found change that line to `PS1="[\[\033[01;34m\]\h-\T\[\033[00m\]]\[\033[01;32m\]\w\[\033[00m\]> "`
3. If not found then add the code above to the end of the file.

### Convenient Code Updates
This code automates these tasks:

1. Gather the current git branch name
2. Write the branch name to the terminal as text output for us to read
3. Pull the code from the repository of same branch name
4. Rebuilds the application
5. Puts the application into listening mode for remote tests

```
function updatefs () {
    function branchCall () {
       git rev-parse --abbrev-ref HEAD
    }
    local branch=$(branchCall)
    echo "Git branch: $branch"
    git pull origin $branch
    sharefs build
    sharefs test_browser mode:remote
}
```

**Please note the `sharefs` alias must be declared before this update function.**

## Customize Firefox
1. Prevent restore session tab: `about:config` -> `browser.sessionStore.resume_from_crash` value **false**

## Vim Configuration
1. `rm ~/.vimrc`
2. `vim ~/.vimrc`


Once in the file add this content:
<!-- cspell:disable -->
```
filetype plugin on
scriptencoding utf8
syntax on          "turn on syntax highlighting

set autoindent     "new lines receive same indentation as previous line
set confirm        "display a warning when exiting an unsaved file
set cursorline     "highlight the current line the cursor is on
set encoding=utf8  "set character encoding scheme
set expandtab      "use spaces instead of tabs for indentation
set history=1000   "number of steps in the change history for undo
set hlsearch       "highlight all matches to a given search pattern
set incsearch      "show search pattern match as the pattern is typed in
set list           "clearly distinguish whitespace characters
set listchars=trail:\·,precedes:\«,extends:\»,eol:\¬,tab:\¦\¬ "custom whitespace character definitions
set nobackup       "do not create a backup when overwriting a file
set nowritebackup  "do not create a backup when overwriting a file
set noswapfile     "do not store file contents in a swap file in memory
set number         "line number
set ruler          "always show cursor position in status bar
set smarttab       "use full custom indentation when pressing the tab key
set shiftwidth=4   "number of spaces in a tab stop
set showmatch      "point out closing braces when the cursor is on opening braces
set softtabstop=4  "treat a run of spaces as a single character when using backspace
set tabstop=4      "indentation width
set t_Co=256       "enable 256 colors (the shell must support this value)
set wildmenu       "display command line's tab complete options as a menu
```
<!-- cspell:enable -->

## Clone a VM
### Hostname
On a relatively clean Linux box there are only two places that need updating to change the hostname.

1. `sudo vim /etc/hosts` - modify the existing hostname
2. `sudo hostnamectl set-hostname myNewName` - set the new hostname

### Change Application Device Name
This change is for the Share File Systems application not the OS.

Settings:
1. `vim ./lib/settings/settings.json`
2. Change the `nameDevice` property
3. Optionally the `nameUser` can be changed as well

Device:
1. `vim ./lib/settings/device.json`
2. Change the `name` property to anything else

### IP Address Permanent (next boot)
The IP address shouldn't need to be changed, because the host assigns the address from a DHCP pool to the guest machine via the host-based adapter interface, but should the IP address be the same as another VM here are the steps to change it:
1. First, modify the IP address: `sudo vim /etc/netplan/01-netcfg.yaml`
2. Second, restart the machine

A correct net plan should look something like the following example:
```yaml
  version: 2
  renderer: networkd
  ethernets:
    enp0s3:
      dhcp4: yes
    enp0s8:
      dhcp4: no
      dhcp6: yes
      addresses: [192.168.56.103/24]
      gateway4: 192.168.56.1
```

In the above example:
* Interface enp0s3 is for the host based interface that provides internet access.
* Interface enp0s8 is for the NAT interface for local network connectivity between the host machine and other VMs.
* Virtual Box 7 now supports IPv6 routing on its virtual LANs, but I have not experimented with this yet.

### IP Address Temporary (current boot)
1. Delete the current IP address: `sudo ip address del 192.168.56.102/24 dev enp0s8`
2. Add the desired IP address: `sudo ip address add 192.168.56.103/24 dev enp0s8`

In those instructions supply the correct IP addresses, and the correct CIDR mask (probably 24), and finally the correct interface name.
Example:
```
sudo ip address del 192.168.56.101/24 dev enp0s3
sudo ip link set dev enp0s3 up
```

### Troubleshooting VirtualBox
* If the OS or disk fails to clone verify there is not already a disk registered with that name.  If so it will clone the machine and complete the operation with a new empty disk.
* If Virtual Box complains that an network interface is missing or misconfigured the machine will abort at load.  The fix could be as simple as opening the settings of the given machine looking at the network tab and clicking the "OK" button without making changes.
* If there are connection failures between the host and all VMs the first thing to check is the host firewall.  To test just disable the firewall and try again to see if it works.  Then reenable the firewall and add the proper configurations.
  - Also bear in mind with the firewall that ICMP (ping) might be blocked while TCP is allowed, or the opposite.
* If partial connectivity between systems is achieved in the application run the install script on all systems: `node install`