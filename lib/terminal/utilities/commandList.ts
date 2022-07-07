
/* lib/terminal/utilities/commandList - Groups all supported command functions into an object for single point of reference. */

import agent_data from "../commands/interface/agent_data.js";
import agent_online from "../commands/interface/agent_online.js";
import base64 from "../commands/interface/base64.js";
import build from "../commands/build.js";
import certificate from "../commands/certificate.js";
import commands from "../commands/commands.js";
import copy from "../commands/copy.js";
import directory from "../commands/directory.js";
import get from "../commands/get.js";
import hash from "../commands/library/hash.js";
import lint from "../commands/lint.js";
import mkdir from "../commands/mkdir.js";
import remove from "../commands/remove.js";
import service from "../commands/service.js";
import test from "../commands/test.js";
import test_browser from "../commands/test_browser.js";
import test_service from "../commands/test_service.js";
import test_simulation from "../commands/test_simulation.js";
import update from "../commands/update.js";
import version from "../commands/version.js";
import websocket from "../commands/websocket.js";

/**
 * A map of command names to their respective terminal handlers.
 * ```typescript
 * interface module_commandList {
 *     agent_data     : () => void; // Lists stored data on one more agents.
 *     agent_online   : () => void; // Allows for testing of connectivity to remote agents.
 *     base64         : (input?:config_command_base64) => void;                                       // Generates a base64 string output from a file system artifact or string input.
 *     build          : (test?:boolean, callback?:() => void) => void;                                // Executes the tasks included in the commands/build.ts file which includes documentation automation and compiling from TypeScript.
 *     certificate    : (config?:config_command_certificate) => void;                                 // Generates an HTTPS certificate.
 *     commands       : () => void;                                                                   // Displays interactive documentation on the terminal about available commands.
 *     copy           : (params?:config_command_copy) => void;                                        // Duplications a file system artifact from one location to another.
 *     directory      : (parameters?:config_command_directory) => void;                               // Walks the file system to build out a representational data structure.
 *     get            : (address?:string, callback?:(file:Buffer|string) => void) => void;            // Issues an arbitrary HTTP GET request from the terminal.
 *     hash           : (input?:config_command_hash) => void;                                         // Generates a hash sequence using OpenSSH for file system artifacts or string input.
 *     lint           : (callback?:(complete:string, failCount:number) => void) => void;              // Runs ESLint with this application's configuration against any location on the local device.
 *     mkdir          : (dirToMake?:string, callback?:(typeError:Error) => void) => void;             // Creates a new directory.
 *     remove         : (filePath?:string, exclusions?:string[], callback?:() => void) => void;       // Removes a file system artifact.
 *     service        : (serverOptions?:config_http_server, serverCallback?:server_callback) => void; // Primary command to run this application by creating a web server and web socket server.
 *     test           : () => void; // Runs all test tasks as defined in the commands/build.ts file.
 *     test_browser   : () => void; // Executes browser test automation.
 *     test_service   : () => void; // Executes test automation of type *service*.
 *     test_simulation: () => void; // Executes test automation of type *simulation*.
 *     update         : () => void; // Pulls code updates from git and builds
 *     version        : () => void; // Displays version information for this application.
 *     websocket      : () => void; // Launches a web socket server.
 * }
 * ``` */
const commandList:module_commandList = {
    agent_data: agent_data,
    agent_online: agent_online,
    base64: base64,
    build: build,
    certificate: certificate,
    commands: commands,
    copy: copy,
    directory: directory,
    get: get,
    hash: hash,
    lint: lint,
    mkdir: mkdir,
    remove: remove,
    service: service,
    test: test,
    test_browser: test_browser,
    test_service: test_service,
    test_simulation: test_simulation,
    update: update,
    version: version,
    websocket: websocket
};

export default commandList;