<!-- documentation/linuxVM - Notes about configuring Linux virtual machines in support of project development. -->

# Share File Systems - Running a Linux VM on Windows
It is necessary to run Linux and without additional hardware at the time of this writing I am running it as a VM in Virtual Box on Windows.  There are a couple import steps to enable this capability.

1. Enable virtualization in the BIOS.  This might be specified as VT-x.  When Windows 10 comes up you can verify that hardware virtualization is enabled by opening the Task Manager, clicking the Performance tab, clicking the CPU view and looking at the data below the graph.  There should be an indication like, **Virtualization     Enabled**.
1. In Windows 10 go to Control Panel -> Programs and Features -> Turn Windows features on or off (left side).  Changing some of the following features will require a restart.  Turn off everything related to virtualization:
   1. Hyper-V
   1. Windows Hypervisor
   1. Contains
   1. Windows Sandbox
   1. Others, you might need to search if after all these steps it still doesn't work.
1. Open Powershell as an administrator and run this command: <!-- cspell:disable -->`bcdedit /set hypervisorlaunchtype off`<!-- cspell:enable --> and then close this Powershell instance.  This step does not require a restart and is the gap between enabling hardware virtualization from the bios and allowing Virtual Box access to that hardware feature.

## Local VM password
**share1234**

## Clone a VM
### Hostname
On a relatively clean Linux box there are only two places that need updating to change the hostname.

<!-- cspell:disable -->
1. `sudo vim /etc/hosts` - modify the existing hostname
2. `sudo hostnamectl set-hostname myNewName` - set the new hostname
<!-- cspell:enable -->

### Change Application Device Name
This change is for the Share File Systems application not the OS.

Settings:
1. `vim ./storage/settings.json`
2. Change the `nameDevice` property
3. Optionally the `nameUser` can be changed as well

Device:
1. `vim ./storage/device.json`
2. Change the `name` property to anything else

### IP Address
The IP address shouldn't need to be changed, because the host assigns the address from a <!-- cspell:disable -->DHCP<!-- cspell:enable --> pool to the guest machine via the host-based adapter interface, but should the IP address be the same as another VM here are the steps:
1. <!-- cspell:disable --> `ifconfig` <!-- cspell:enable --> - This command will display the current interfaces as well as their addresses.  Take note of the interface name of the interface we want to change. This is probably the interface with an address beginning 192.168
2. <!-- cspell:disable --> `sudo ifconfig enp0s3 192.168.0.111 network 255.255.255.0` <!-- cspell:enable --> where `enp0s3` is the interface name and `192.168.0.111` is an example address.  Which ever address you chose should be an address that is not currently in use by another device on the host created network and within that network as defined by the <!-- cspell:disable -->netmask<!-- cspell:enable -->.

## Start up script
### rc.local
`sudo vim /etc/rc.local`

```
~/startup.sh || exit 1
exit 0
```

### startup.sh
```
cd share-file-systems
git checkout master
git pull origin master
git checkout browser
git pull origin browser

node js/application build
```

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

## Adapters
In the VM host configure 2 adapters for each guest machine.

1. **NAT** - This should be the default configuration and all default settings are fine. This provides internet access to the guest machine.
2. **Host Based Adapter** - The default settings for this adapter type are fine.  This provides connectivity between the host and guest machine.

## Ports
Linux will not allow use of reserved ports (anything below 1024) for applications run by regular users, so we have to fix that.

Run these commands from the terminal

<!-- cspell:disable -->
1. `sudo apt-get update && sudo apt-get install authbind`
2. `sudo touch /etc/authbind/byport/80`
3. `sudo chown yourUserName /etc/authbind/byport/80`
4. `sudo chmod 500 /etc/authbind/byport/80`
5. `sudo touch /etc/authbind/byport/81`
6. `sudo chown yourUserName /etc/authbind/byport/81`
7. `sudo chmod 500 /etc/authbind/byport/81`
8. `sudo touch /etc/authbind/byport/443`
9. `sudo chown yourUserName /etc/authbind/byport/443`
10. `sudo chmod 500 /etc/authbind/byport/443`
11. `sudo touch /etc/authbind/byport/444`
12. `sudo chown yourUserName /etc/authbind/byport/444`
13. `sudo chmod 500 /etc/authbind/byport/444`
<!--cspell:enable -->

Provide an alias to your *.bashrc* file

<!-- cspell:disable -->
1. `vim ~/.bashrc`
2. `alias sharefs="authbind node ~/share-file-systems/js/application"`
<!-- cspell:enable -->

Then just execute the application as: <!-- cspell:disable -->`sharefs server`<!-- cspell:enable -->

## Custom Prompt
Modify the prompt into something informative matching the style of this application

`vim ~/.bashrc`

1. Search the file for a variable named `PS1`, which is the prompt value.
2. If found change that line to `PS1="[\[\033[01;34m\]\h-\T\[\033[00m\]]\[\033[01;32m\]\w\[\033[00m\]> "`
3. If not found then add the code above to the end of the file.

## Vim Configuration
<!-- cspell:disable -->
1. `rm ~/.vimrc`
2. `vim ~/.vimrc`
<!-- cspell:enable -->

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