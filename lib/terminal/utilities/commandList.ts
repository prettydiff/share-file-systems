
/* lib/terminal/utilities/commandList - Groups all supported command functions into an object for single point of reference. */

import agent_data from "../commands/agent_data.js";
import agent_online from "../commands/agent_online.js";
import base64 from "../commands/base64.js";
import build from "../commands/build.js";
import certificate from "../commands/certificate.js";
import commands from "../commands/commands.js";
import copy from "../commands/copy.js";
import directory from "../commands/directory.js";
import get from "../commands/get.js";
import hash from "../commands/hash.js";
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
 * * **agent_data** - Lists stored data on one more agents.
 * * **agent_online** - Allows for testing of connectivity to remote agents.
 * * **base64** - Generates a base64 string output from a file system artifact or string input.
 * * **build** - Executes the tasks included in the commands/build.ts file which includes documentation automation and compiling from TypeScript.
 * * **certificate** - Generates an HTTPS certificate.
 * * **commands** - Displays interactive documentation on the terminal about available commands.
 * * **copy** - Duplications a file system artifact from one location to another.
 * * **directory** - Walks the file system to build out a representational data structure.
 * * **get** - Issues an arbitrary HTTP GET request from the terminal.
 * * **hash** - Generates a hash sequence using OpenSSH for file system artifacts or string input.
 * * **lint** - Runs ESLint with this application's configuration against any location on the local device.
 * * **mkdir** - Creates a new directory.
 * * **remove** - Removes a file system artifact.
 * * **service** - The primary command to run this application by creating a web server and web socket server.
 * * **test** - Runs all test tasks as defined in the commands/build.ts file.
 * * **test_browser** - Executes browser test automation.
 * * **test_service** - Executes test automation of type *service*.
 * * **test_simulation** - Executes test automation of type *simulation*.
 * * **update** - Pulls code updates from git and
 * * **version** - Displays version information for this application.
 * * **websocket** - Launches a web socket server.
 *
 * ```typescript
 * interface module_commandList {
 *     agent_data: () => void;
 *     agent_online: () => void;
 *     base64: (input?:base64Input) => void;
 *     build: (test?:boolean, callback?:() => void) => void;
 *     certificate: (config?:certificate_input) => void;
 *     commands: () => void;
 *     copy: (params?:copyParams) => void;
 *     directory: (parameters?:readDirectory) => void;
 *     get: (address?:string, callback?:(file:Buffer|string) => void) => void;
 *     hash: (input?:hashInput) => void;
 *     lint: (callback?:(complete:string, failCount:number) => void) => void;
 *     mkdir: (dirToMake?:string, callback?:(typeError:Error) => void) => void;
 *     remove: (filePath?:string, callback?:() => void) => void;
 *     service: (serverOptions?:serverOptions, serverCallback?:serverCallback) => void;
 *     test: () => void;
 *     test_browser: () => void;
 *     test_service: () => void;
 *     test_simulation: () => void;
 *     update:() => void;
 *     version: () => void;
 *     websocket: () => void;
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