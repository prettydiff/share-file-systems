
/* lib/terminal/utilities/commandList - Groups all supported command functions into an object for single point of reference. */

import agent_data from "../commands/interface/agent_data.js";
import base64 from "../commands/interface/base64.js";
import build from "../commands/interface/build.js";
import certificate from "../commands/interface/certificate.js";
import commands from "../commands/interface/commands.js";
import copy from "../commands/interface/copy.js";
import directory from "../commands/interface/directory.js";
import firewall_windows from "../../applications/firewall_windows/index.js";
import hash from "../commands/interface/hash.js";
import lint from "../commands/interface/lint.js";
import mkdir from "../commands/interface/mkdir.js";
import perf from "../commands/interface/perf.js";
import remove_files from "../../applications/remove_files/index.js";
import service from "../commands/interface/service.js";
import test from "../commands/interface/test.js";
import test_browser from "../commands/interface/test_browser.js";
import test_service from "../commands/interface/test_service.js";
import test_simulation from "../commands/interface/test_simulation.js";
import typescript from "../commands/interface/typescript.js";
import update from "../commands/library/update.js";
import version from "../commands/interface/version.js";
import websocket from "../commands/interface/websocket.js";

/**
 * A map of command names to their respective terminal handlers.
 * ```typescript
 * interface module_commandList {
 *     agent_data      : (callback:commandCallback) => void; // Lists stored data on one more agents.
 *     base64          : (callback:commandCallback) => void; // Generates a base64 string output from a file system artifact or string input.
 *     build           : (callback:commandCallback) => void; // Executes the tasks included in the commands/build.ts file which includes documentation automation and compiling from TypeScript.
 *     certificate     : (callback:commandCallback) => void; // Generates an HTTPS certificate.
 *     commands        : (callback:commandCallback) => void; // Displays interactive documentation on the terminal about available commands.
 *     copy            : (callback:commandCallback) => void; // Duplications a file system artifact from one location to another.
 *     directory       : (callback:commandCallback) => void; // Walks the file system to build out a representational data structure.
 *     firewall_windows: (callback:commandCallback) => void; // Allows necessary allowances through the firewall specific to this application.
 *     hash            : (callback:commandCallback) => void; // Generates a hash sequence using OpenSSH for file system artifacts or string input.
 *     lint            : (callback:commandCallback) => void; // Runs ESLint with this application's configuration against any location on the local device.
 *     mkdir           : (callback:commandCallback) => void; // Creates a new directory.
 *     perf            : (callback:commandCallback) => void; // Allows performance testing of the application.
 *     remove          : (callback:commandCallback) => void; // Removes a file system artifact.
 *     service         : (callback:commandCallback) => void; // Primary command to run this application by creating a web server and web socket server.
 *     test            : (callback:commandCallback) => void; // Runs all test tasks as defined in the commands/build.ts file.
 *     test_browser    : (callback:commandCallback) => void; // Executes browser test automation.
 *     test_service    : (callback:commandCallback) => void; // Executes test automation of type *service*.
 *     test_simulation : (callback:commandCallback) => void; // Executes test automation of type *simulation*.
 *     typescript      : (callback:commandCallback) => void; // Performs TypeScript type checks.
 *     update          : () => void;                         // Pulls code updates from git and builds
 *     version         : (callback:commandCallback) => void; // Displays version information for this application.
 *     websocket       : (callback:commandCallback) => void; // Launches a web socket server.
 * }
 * ``` */
const commandList:module_commandList = {
    agent_data: agent_data,
    base64: base64,
    build: build,
    certificate: certificate,
    commands: commands,
    copy: copy,
    directory: directory,
    firewall_windows: firewall_windows.terminal.io,
    hash: hash,
    lint: lint,
    mkdir: mkdir,
    perf: perf,
    remove_files: remove_files.terminal.io,
    service: service,
    test: test,
    test_browser: test_browser,
    test_service: test_service,
    test_simulation: test_simulation,
    typescript: typescript,
    update: update,
    version: version,
    websocket: websocket
};

export default commandList;