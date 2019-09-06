# Fresh App
A general Node.js application primer with helpful utilities.

## Purpose
It can be a headache to start a new Node.js project and application architecture that makes heavy use of command line instructions. This project is a ready to go application that solves this problem.

## Features
* Command driven
* File system utilities for reading directory trees recursively or removing them
* Better error handling and messaging
* Exclusion lists supported
* Verbose output supported with the *verbose* option
* Built-in test automation for commands and utilities
* Only 5 dependencies:
   - ESLint (external dependency, a code error checker)
   - TypeScript (external dependency, a language compiler)
   - @types/node (internal dependency, additional data type definitions for TypeScript)
   - ws (internal dependency, web sockets for Node used with the *server* command)
   - async-limiter (sub-dependency of ws)


## Set Up
```
npm install typescript -g
npm install eslint -g
git clone https://github.com/prettydiff/spaces.git
cd spaces
tsc
npm install
node js/application build
```

This setup installs the two external dependencies: ESLint and TypeScript as well as a local dependency that helps TypeScript compile the project.

## Configuration
Configuration data is stored in the version.json file.

* **command** *string, manual* - The command that executes the application, which is `node ` and the path to your JavaScript application file, by default `js/application`.
* **date** *string, dynamic* - This value is in format *dd MMM yyyy* and it is dynamically generated from the modify date of the package.json file.
* **name** *string, manual* - This is the proper name of the application.
* **number** *string, dynamic* - This value is gathered from the version property of the package.json file.
* **port** *number, manual* - The default port number the application uses when running a service.  The `server` command requires two ports, one for HTTP and a second for Web Sockets, where the second port is always one number greater than the service port.

## Add a new utility
In the applications.ts file simply assign a function to a named property on the apps object, example:
`apps.myCustomTool = function () {};`

## Add a new command
Add the functionality as described in the prior step.  Then simply add documentation for the command name in the *commands* object.  The name added to the *commands* object must match the name of the new method.

## Add a new build step
1. Open the apps.build function in application.ts. Add your new build step name into the *order.build* array.  The order of this array is the order in which the steps will synchronously execute.
1. Add the same name to the *phases* object as a new method.

## Add a new test step
1. Open the apps.build function in application.ts. Add your new build step name into the *order.test* array.  The order of this array is the order in which the steps will synchronously execute.
1. Add the same name to the *phases* object as a new method.

## Add new command line tests
1. Open the *test/simulations.ts* file and add a new test to the array of tests.  Read the documentation at the top of the file for test criteria.

## HTTP Service
The application comes with a *server* command that launches an HTTP service. By default the application only display's the service's local file system from the project root. To instead show HTML web pages simply create an HTML file and reassign the *localPath* variable to a relative path for your HTML file.
