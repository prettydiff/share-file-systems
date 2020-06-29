
/* lib/terminal/utilities/commandList - Groups all supported command functions into an object for single point of reference. */

import agents from "../commands/agents.js";
import base64 from "../commands/base64.js";
import build from "../commands/build.js";
import commands from "../commands/commands.js";
import copy from "../commands/copy.js";
import directory from "../commands/directory.js";
import get from "../commands/get.js";
import hash from "../commands/hash.js";
import help from "../commands/help.js";
import lint from "../commands/lint.js";
import mkdir from "../commands/mkdir.js";
import remove from "../commands/remove.js";
import server from "../commands/server.js";
import test from "../commands/test.js";
import test_agent from "../commands/test_agent.js";
import test_service from "../commands/test_service.js";
import test_simulation from "../commands/test_simulation.js";
import update from "../commands/update.js";
import version from "../commands/version.js";

const commandList = {
    agents: agents,
    base64: base64,
    build: build,
    commands: commands,
    copy: copy,
    directory: directory,
    get: get,
    hash: hash,
    help: help,
    lint: lint,
    mkdir: mkdir,
    remove: remove,
    server: server,
    test: test,
    test_agent: test_agent,
    test_service: test_service,
    test_simulation: test_simulation,
    update: update,
    version: version
};

export default commandList;