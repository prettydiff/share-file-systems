# Shared Spaces - Developer Guide

## Code Location
All code for this application is located in 3 places:
* localhost.ts - This is the file that is consumed by the browser and provides user interaction.
* application.ts - This is the Node.js application file.
* lib - This directory contains all supporting code libraries
   - lib/browser - All supporting libraries for the *localhost.ts* file.
   - lib/terminal - All supporting libraries for the *application.ts* file.
   - lib/terminal/server - All supporting libraries for actions via network interface as executed by *lib/terminal/server.ts*.

## Code Organization
For simplicity the application is written in a purely functional manner and is broken down into library files using ES6 modules.

## Test Automation
At this time test automation is present only for the libraries in *lib/terminal* excluding *lib/terminal/server.ts*.

* Execute test automation: `node --experimental-modules js/application.js simulation`.
* Execute code validation using ESLint: `node --experimental-modules js/application.js lint`.
* Execute all validation tasks: `node --experimental-modules js/application.js test`.

**Please note that linting requires installation of ESLint:** `npm install -g eslint`.

## Flow Control
Due to the functional nature of the application flow control is always simple, however the asynchronous and event driven nature of the application ensure flow control is not always clear.  The developer tools of modern browsers like Chrome or Firefox generally provide a stack trace when an error occurs.  The error library provided for the Node.js execution also provides a stack trace.  At any time a stack trace can be forced at any point of execution in any environment using `console.log(new Error().stack)`.