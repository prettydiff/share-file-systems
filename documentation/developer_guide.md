# Share File Systems - Developer Guide

## Code Location
All code for this application is located in 3 places:
* localhost.ts - This is the file that is consumed by the browser and provides user interaction.
* application.ts - This is the Node.js application file.
* lib - This directory contains all supporting code libraries
   - lib/browser - All supporting libraries for the *localhost.ts* file.
   - lib/terminal - All supporting libraries for the *application.ts* file.
   - lib/terminal/server - All supporting libraries for actions via network interface as executed by *lib/terminal/server.ts*.

## Configuration
I am not a fan of configuring software.  I consider software configurations a time wasting punishment from lazy developers.  Well written software requires no configuration because flexibility is built into the application's APIs.  The application's configurations are stored in the `version.json` file.

## Code Organization
For simplicity the application is written in a purely functional manner and is broken down into library files using ES6 modules.  The libraries are organized as follows:
* localhost.ts - The script file that is requested by the HTML file that runs in the browser.
* application.ts - The code that Node.js executes.
* lib/browser - Libraries that are called by `localhost.ts` for execution in the browser.
* lib/terminal - Libraries that are called by `application.ts` for execution in Node.js.
* lib/terminal/server - Libraries that are called by `lib/terminal/server.ts` for execution of services.

## Code Style
### Standards
This code is written as close to the standards of the interpreting applications as possible, which means no frameworks.  This allows for faster code execution and better conformance cross-browser and cross-OS.  It also minimizes complexity and maintenance concerns that can arise due to the [Law of Leaky Abstractions](https://en.wikipedia.org/wiki/Leaky_abstraction).  The way to think about this is that every line of code should have a directly identifiable (not indirect) business concern or end user concern.  End user concerns may be accessibility, presentation, usability, better messaging, faster code execution, reduced resource consumption, reduced network requirements, and so forth.  Never should the code exist purely for the satisfaction of the developer.

The above paragraph states: *Never should the code exist purely for the satisfaction of the developer.*  The only authorized exception to this rule is the creation of new code modules, and the minimal boilerplate that comes with such, to increase separation of concerns and reduce code duplication.

### Functional Code
This application makes heavy use of functions and lexical scope.  OOP conventions, including classes, are not used except where required by an external API.  This is because the concept of *inheritance* increases code complexity by objective measures and a design goal of this code is to achieve simplicity and encourage new feature development through refactoring instead of additional code modules.  Every function is uniquely named so that stack traces are easy to read, possibly helpful, and always meaningful.

## Test Automation
At this time test automation is present only for the libraries in *lib/terminal* excluding *lib/terminal/server.ts*.

* Execute test automation: `node --experimental-modules js/application.js simulation`.
* Execute code validation using ESLint: `node --experimental-modules js/application.js lint`.
* Execute all validation tasks: `node --experimental-modules js/application.js test`.

**Please note that linting requires installation of ESLint:** `npm install -g eslint`.

## Flow Control
Due to the functional nature of the application flow control is always simple, however the asynchronous and event driven nature of the application ensure flow control is not always clear.  The developer tools of modern browsers like Chrome or Firefox generally provide a stack trace when an error occurs.  The error library provided for the Node.js execution also provides a stack trace.  At any time a stack trace can be forced at any point of execution in any environment using `console.log(new Error().stack)`.