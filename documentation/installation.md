# Share File Systems - Installation
The application provides several different files and a thorough process for the completion of installation.
This document explains each of these files and the process provided.

## Relevant files
* install.js
* module.js
* js/lib/terminal/utilities/terminal.js

## 2 Module Systems
Node.js, which is the runtime environment that executes the code written for this application, features two module systems.
The **commonjs** system is Node's original module system.
**ECMA modules** is the newer module system expressed as a standard feature of the JavaScript language.
The new ECMA module system is universally available to the JavaScript language where the commonjs system is only available to Node.js and these systems are not compatible.
Most tools, dependencies, and applications written for Node are written using the commonjs system.
This application is written using the ECMA module system.

* ECMA modules should be used when developing, troubleshooting, or extending the application.  The JavaScript code created through this process is an almost identical reflection of the TypeScript code written for the application.
* The commonjs module system is required to execute this application as an Electron application.  Electron is a graphical shell that allows applications written as JavaScript to execute as visual desktop applications.

## module.js
To address compatibility concerns the application includes a *module.js* file which configures the application to use one system or the other.
This application is executed as:

```
node module commonjs
```

In that example the *commonjs* argument tells the script to reconfigure the application to use the older commonjs module system.
Instead if arguments of *module*, *modules*, or *EC2020* are supplied the application will reconfigure to use the standard ECMA module system, example: `node module modules`.

This script must be executed in isolation, because all other code executed through Node.js will be dependent upon the configuration provided by this script.
After this script executes the code must be recompiled using either the *install.js*.

## install.js
The install.js script automates several tasks required to create the necessary code that executes the application.
These steps include downloading or updating internal dependencies, compiling the application code from TypeScript to JavaScript, building the application configuration, and generating a global command for the application.
This goal of this script is to allow users the ability to download the application and be up an running after executing this one script file.

Once the prior mentioned module.js application executes the install.js file must be executed.
This is because the code must be compiled from TypeScript again as the resulting JavaScript code is very different for the two separate module systems, and the application must be rebuilt to properly use the newly created JavaScript code.

## js/lib/terminal/utilities/terminal.js
The terminal.js file is the primary entry point to the application from any kind of command shell, or terminal interface.
This file will not exist until the install.js file is executed as it is output of the compile step.
After execution install.js the file terminal.js is more conveniently available from a global shell command **share**.

To see the various commands available through that file simply execute: `share commands`.
To see more detailed documentation for a support command simply provide the command name: `share commands directory`.
To rebuild the application, which includes a compile step plus all configuration steps, execute: `share build`.

It must be noted though the module system cannot be converted without first running *module.js* and then *install.js* as explained above.
This is necessary because changing to a different module system will break the use of the globally available *share* command.