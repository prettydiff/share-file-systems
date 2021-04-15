
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
import help from "../commands/help.js";
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

const commandList:commandList = {
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
    help: help,
    lint: lint,
    mkdir: mkdir,
    remove: remove,
    service: service,
    test: test,
    test_browser: test_browser,
    test_service: test_service,
    test_simulation: test_simulation,
    update: update,
    version: version
};

export default commandList;