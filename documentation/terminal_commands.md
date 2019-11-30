# Share File Systems - Terminal Commands
ON the terminal this application is a collection of independent utilities designed for portability and insertion into other applications.  These utilities are executed as commands.  Here is an example:
```
node js/application version
```

A well writing utility is both an independent component of a larger application and a stand-alone application that can receive input and produce output according to some standard API.  In the case of this application the various input arguments are well documented using the **command** command.  For example try this command to see various support features for the *server* command:
```
node js/application command server
```

## Build a new utility/command
1. First create your utility in a new file.  This utility should be an ES6 module with a default export.
   * The new module must have default values for all supported options, including any callback functions.  A well written utility should never fail because a user chose not to supply some option value.
   * A well written utility should also have good error messaging.  If the user does something wrong or fails to supply some required value the utility should be clear and precise on the error in a non-technical language that helps the user move forward towards resolution.
1. Write the necessary documentation into the `lib/terminal/commands_documentation.ts` file.
   * Simply conform to the data structure already provided and document each and every option and alternative execution in the list of examples.
   * Describe the difference and uniqueness of each listed example.
1. Import the new utility into the `application.ts` file.  Also include the new utility in that files *library* object.
1. Include tests in the `test/simulations.ts` file using the data structure provided.  If the current data structure is insufficient to test the new module then open a Github issue.
   * Tests should cover each optional feature, collisions of competing features, various permutations of similar features, and any previously resolved defects or regressions.