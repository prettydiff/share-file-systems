# Share File Systems - Running a Linux VM on Windows
It is necessary to run Linux and without additional hardware at the time of this writing I am running it as a VM in Virtual Box on Windows.  There are a couple import steps to enable this capability.

1. Enable virtualization in the BIOS.  This might be specified as VT-x.  When Windows 10 comes up you can verify that hardware virtualization is enabled by opening the Task Manager, clicking the Performance tab, clicking the CPU view and looking at the data below the graph.  There should be an indication like, **Virtualization     Enabled**.
1. In Windows 10 go to Control Panel -> Programs and Features -> Turn Windows features on or off (left side).  Changing some of the following features will require a restart.  Turn off everything related to virtualization:
   1. Hyper-V
   1. Windows Hypervisor
   1. Contains
   1. Windows Sandbox
   1. Others, you might need to search if after all these steps it still doesn't work.
1. Open Powershell as an administrator and run this command: `bcdedit /set hypervisorlaunchtype off` and then close this Powershell instance.  This step does not require a restart and is the gap between enabling hardware virtualization from the bios and allowing Virtual Box access to that hardware feature.

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

## Hostname
On a relatively clean Linux box there are only two places that need updating to change the hostname.

1. `vim /etc/hosts` - modify the existing hostname
2. `sudo hostnamectl set-hostname myNewName` - set the new hostname

## Adapters
In the VM host configure 2 adapters for each guest machine.

1. **NAT** - This should be the default configuration and all default settings are fine. This provides internet access to the guest machine.
2. **Host Based Adapter** - The default settings for this adapter type are fine.  This provides connectivity between the host and guest machine.