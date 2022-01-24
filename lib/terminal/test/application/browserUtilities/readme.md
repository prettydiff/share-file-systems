# lib/terminal/test/application/browserUtilities Code Files
The convenience functions for generating various browser tests.

## Files
<!-- Do not edit below this line.  Contents dynamically populated. -->

* **[file_path_decode.ts](file_path_decode.ts)** - Transforms a custom encoded file path into a local operation system specific file path.
* **[file_path_encode.ts](file_path_encode.ts)** - Creates an encoding around file system addresses so that the test code can ensure the paths are properly formed per operating system.
* **[inviteAccept.ts](inviteAccept.ts)**         - A test generator for accepting an invitation.
* **[inviteConfirm.ts](inviteConfirm.ts)**       - A test generator for accepting an invitation.
* **[inviteModal.ts](inviteModal.ts)**           - A test generator for spawning the invitation modal.
* **[inviteSend.ts](inviteSend.ts)**             - A test generator for sending an invitation.
* **[login.ts](login.ts)**                       - A test generator to login a fresh device.
* **[machines.ts](machines.ts)**                 - An object expressing a map of the various remote machines.
* **[mainMenu.ts](mainMenu.ts)**                 - A convenience function that opens the main menu while in browser tests.
* **[modalAddress.ts](modalAddress.ts)**         - A convenience function that tests a file navigation modal to go to the project's location for browser tests.
* **[moveToSandbox.ts](moveToSandbox.ts)**       - Generates a browser test to move a file navigate modal to the project's internal test location.
* **[newDirectory.ts](newDirectory.ts)**         - Generates a browser test to create new directories in the file system.
* **[showContextMenu.ts](showContextMenu.ts)**   - A convenience function that launches the modal context menu in browser tests.
* **[storage_removal.ts](storage_removal.ts)**   - Removes artifacts written from the service test automation.