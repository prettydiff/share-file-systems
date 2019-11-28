# Share File Systems - Running a Linux VM on Windows
It is necessary to run Linux and without additional hardware at the time of this writing I am running it as a VM in Virtual Box on Windows.  There are a couple import steps to enable this capability.

1. Enable virtualization in the BIOS.  This might be specified as VT-x.  When Windows 10 comes up you can verify that hardware virtualization is enabled by opening the Task Manager, clicking the Performance tab, clicking the CPU view and looking at the data below the graph.  There should be an indication like, **Virtualization     Enabled**.
2. In Windows 10 go to Control Panel -> Programs and Features -> Turn Windows features on or off (left side).  Changing some of the following features will require a restart.  Turn off everything related to virtualization:
   1. Hyper-V
   1. Windows Hypervisor
   1. Contains
   1. Windows Sandbox
   1. Others, you might need to search if after all these steps it still doesn't work.
3. Open Powershell as an administrator and run this command: `bcdedit /set hypervisorlaunchtype off` and then close this Powershell instance.  This step does not require a restart and is the gap between enabling hardware virtualization from the bios and allowing Virtual Box access to that hardware feature.