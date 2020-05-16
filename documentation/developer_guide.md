<!-- documentation/developer_guide - A quick overview of the technical aspects for jumping to the project with a goal of extending the code. -->

# Share File Systems - Developer Guide

## Code Location
All code for this application is located in 2 places:
* application.ts - This is the Node.js application file.
* lib - This directory contains all supporting code libraries

## Configuration
I am not a fan of configuring software.  I consider preliminary software configurations necessary to execute an application a time wasting punishment from incompetent developers.  Well written software requires no preliminary configuration because flexibility is built into the application at run time.  The application's default configurations are stored in the `version.json` file.

### version.json Definition

```typescript
interface version {
    command: string;
    date: string;
    device: string;
    identity_domain: string;
    keys: versionKeys;
    name: string;
    number: string;
    port: number;
}
interface versionKeys {
    device: versionKeyPair;
    user: versionKeyPair;
}
interface versionKeyPair {
    private: string;
    public: string;
}
```

* **command** - The command that executes the application.
* **date** - The first build date following a change of application version number.
* **device** - A hash value to uniquely identify the device.  The value is SHA512 from the merging of the OS hostname and any non-local active MAC address.
* **identity_domain** - The web address to contact for user certificate resolution.
* **keys** - An object containing properties *device* and *user* each an object containing the properties *private* and *public*. This property stores generated key pairs as string values.
* **name** - The application's name.
* **number** - The application version number taken directly from the package.json file.
* **port** - The application's default TCP port.  If this port is taken the application will instead use any randomly available port.

## Code Organization
For simplicity the application is written in a purely functional manner and is broken down into library files using ES6 modules.  The libraries are organized as follows:
* localhost.ts - The script file that is requested by the HTML file that runs in the browser.
* application.ts - The code that Node.js executes.
* lib/browser - Libraries that are called by `localhost.ts` for execution in the browser.
* lib/terminal - Libraries that are called by `application.ts` for execution in Node.js.
* lib/terminal/server - Libraries that are called by `lib/terminal/server.ts` for execution of services.

## Code Style
### Standards
This code is written as close to the standards of the interpreting technologies as possible, which means no frameworks.  This allows for faster code execution and better conformance cross-browser and cross-OS.  It also minimizes complexity and maintenance concerns that can arise due to the [Law of Leaky Abstractions](https://en.wikipedia.org/wiki/Leaky_abstraction).  The way to think about this is that every line of code should either consolidate various other statements into a single point abstraction or have a directly identifiable (not indirect) business concern or end user concern.  End user concerns may be accessibility, presentation, usability, better messaging, faster code execution, reduced resource consumption, reduced network requirements, and so forth.  Never should the code exist purely for the satisfaction of the developer.

The above paragraph states: *Never should the code exist purely for the satisfaction of the developer.*  The only authorized exception to this rule is the creation of new code modules, and the minimal boilerplate that comes with such, to increase separation of concerns and reduce code duplication.

### Isolation
Business tasks should be isolated from each other as much as possible and that isolation should be reflected in the organization of the code.  The separation of the code then should be a reflection of the separation of concerns outside the code.  The primary benefit of task isolation is to eliminate close coupling.  If one piece of logic is missing or broken all related technical errors should be confined to that piece of logic.  This implies everything should have an operational default state that continues to execute without interruption even though this form of thinking may not appropriately to business tests.  This speeds maintenance by allowing pieces of logic to be tested together **and** in isolation.

### Duplication
Duplication is forbidden as much as possible.  The very essence of simplicity is ensuring things execute in only one way from only one place.  This requires constant refactoring as new features are written.  Simplicity isn't easy, which means that it requires additional effort and that the result is not always immediately friendly.

Simplicity also requires directness as much as the business requirements allow the code to achieve.  Adding use of frameworks or tools to complete requirements that can be better achieved without them is not simple.  Anything that further separates the business logic from the means of execution is not appreciated.

### Dependencies
The only dependencies that are allowed are those that the developer and the business requirements never want to own or maintain, extend, or modify.  If, for example, deleting files is essential to the application's business requirements and an API is provided for such it is better to simply write directly for the application because the needs around that task will evolve as the application evolves.  An example of something that should be a dependency is the TypeScript *@types/node* library.  This application does not want to ever maintain the TypeScript language or the Node.js application and so as those applications evolve the supporting features should evolve independently from this application.

### Inheritance
This application never makes use of inheritance.  The keyword *this* is never used in the application and the keyword *new* is used only as external libraries require its use.  Inheritance allows forming a core object and evolving it into layers of instances, which is essentially layers of one to many.  That is the opposite of simplicity and so it is not allowed in this code.

### Functional Code
This application makes heavy use of functions and lexical scope.  OOP conventions, including classes, are not used except where required by an external API.  This is because the concept of *inheritance* increases code complexity by objective measures and a design goal of this code is to achieve simplicity and encourage new feature development through refactoring instead of additional code modules.  Every function is uniquely named so that stack traces are easy to read, possibly helpful, and always meaningful.

## Test Automation
At this time test automation is present only for the libraries in *lib/terminal* excluding *lib/terminal/server.ts*.

* Execute command test simulations: `node js/application test_simulation`.
* Execute supported services: `node js/application test_service`.
* Execute code validation using ESLint: `node js/application lint`.
* Execute all validation tasks: `node js/application test`.
* To run the server using the test data, which is helpful for experimenting in the browser: `node js/application server test`.

**Please note that linting requires installation of ESLint:** `npm install -g eslint`.

## Flow Control
Due to the functional nature of the application flow control is always simple, however the asynchronous and event driven nature of the application ensure flow control is not always clear.  The developer tools of modern browsers like Chrome or Firefox generally provide a stack trace when an error occurs.  The error library provided for the Node.js execution also provides a stack trace.  At any time a stack trace can be forced at any point of execution in any environment using `console.log(new Error().stack)`.