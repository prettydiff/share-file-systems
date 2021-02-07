# lib/terminal/test/application Code Files
The test runner utility and supporting libraries.

## Files
<!-- Do not edit below this line.  Contents dynamically populated. -->

* **[browser.ts](browser.ts)**                                 - The functions necessary to run browser test automation.
* **[browser_machines.ts](browser_machines.ts)**               - An object expressing a map of the various remote machines.
* **[browser_mainMenu.ts](browser_mainMenu.ts)**               - A convenience function that opens the main menu while in browser tests.
* **[browser_modalAddress.ts](browser_modalAddress.ts)**       - A convenience function that tests a file navigation modal to go to the project's location for browser tests.
* **[browser_showContextMenu.ts](browser_showContextMenu.ts)** - A convenience function that launches the modal context menu in browser tests.
* **[complete.ts](complete.ts)**                               - Final messaging for a completed test type.
* **[evaluation.ts](evaluation.ts)**                           - Evaluate a given test item and report appropriate failure messaging.
* **[file_path_decode.ts](file_path_decode.ts)**               - Transforms a custom encoded file path into a local operation system specific file path.
* **[file_path_encode.ts](file_path_encode.ts)**               - Creates an encoding around file system addresses so that the test code can ensure the paths are properly formed per operating system.
* **[runner.ts](runner.ts)**                                   - A test runner that loops through test items in serial, executes those test items, and passes the result message to the evaluation library.
* **[service.ts](service.ts)**                                 - A list of service test related utilities.
* **[simulation.ts](simulation.ts)**                           - A list of command related tests for running shell simulations against the supported commands.