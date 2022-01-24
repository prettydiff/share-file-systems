/* lib/typescript/modules_terminal.d - TypeScript interfaces that define master library modules used in the terminal. */

import { ServerResponse, IncomingMessage } from "http";
import { Server } from "net";

declare global {

    /**
     * A list of methods used for build tasks and tasks associated with the *test* command.
     * * **browserSelf** - Launches test automation type *browser_self* against the local device.
     * * **clearStorage** - Removes files created from prior test automation runs.
     * * **commands** - Builds the documentation/commands.md file.
     * * **configuration** - Writes application specific configuration files from lib/configurations.json.
     * * **libReadme** - Extracts comments from the top of each file to build out automated documentation.
     * * **lint** - Executes ESLint as a test task.
     * * **service** - Executes the test automation of type *service*.
     * * **shellGlobal** - Writes and updates a file to provide this application with global availability against a keyword on the terminal.
     * * **simulation** - Executes the test automation of type *simulation*.
     * * **typescript** - Runs the TypeScript compiler.
     * * **version** - Updates version data as taken from the package.json and prior git commit for display and availability elsewhere in the application.
     *
     * ```typescript
     * interface module_buildPhaseList {
     *     browserSelf:() => void;
     *     clearStorage:() => void;
     *     commands:() => void;
     *     configurations:() => void;
     *     libReadme:() => void;
     *     lint:() => void;
     *     service:() => void;
     *     shellGlobal:() => void;
     *     simulation:() => void;
     *     typescript:() => void;
     *     version:() => void;
     * }
     * ``` */
    interface module_buildPhaseList {
        browserSelf:() => void;
        clearStorage:() => void;
        commands:() => void;
        configurations:() => void;
        libReadme:() => void;
        lint:() => void;
        service:() => void;
        shellGlobal:() => void;
        simulation:() => void;
        typescript:() => void;
        version:() => void;
    }

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
     *     base64: (input?:config_command_base64) => void;
     *     build: (test?:boolean, callback?:() => void) => void;
     *     certificate: (config?:config_command_certificate) => void;
     *     commands: () => void;
     *     copy: (params?:config_command_copy) => void;
     *     directory: (parameters?:config_command_directory) => void;
     *     get: (address?:string, callback?:(file:Buffer|string) => void) => void;
     *     hash: (input?:config_command_hash) => void;
     *     lint: (callback?:(complete:string, failCount:number) => void) => void;
     *     mkdir: (dirToMake?:string, callback?:(typeError:Error) => void) => void;
     *     remove: (filePath?:string, callback?:() => void) => void;
     *     service: (serverOptions?:config_http_server, serverCallback?:serverCallback) => void;
     *     test: () => void;
     *     test_browser: () => void;
     *     test_service: () => void;
     *     test_simulation: () => void;
     *     update:() => void;
     *     version: () => void;
     *     websocket: () => void;
     * }
     * ``` */
    interface module_commandList {
        agent_data: () => void;
        agent_online: () => void;
        base64: (input?:config_command_base64) => void;
        build: (test?:boolean, callback?:() => void) => void;
        certificate: (config?:config_command_certificate) => void;
        commands: () => void;
        copy: (params?:config_command_copy) => void;
        directory: (parameters?:config_command_directory) => void;
        get: (address?:string, callback?:(file:Buffer|string) => void) => void;
        hash: (input?:config_command_hash) => void;
        lint: (callback?:(complete:string, failCount:number) => void) => void;
        mkdir: (dirToMake?:string, callback?:(typeError:Error) => void) => void;
        remove: (filePath?:string, callback?:() => void) => void;
        service: (serverOptions?:config_http_server, serverCallback?:serverCallback) => void;
        test: () => void;
        test_browser: () => void;
        test_service: () => void;
        test_simulation: () => void;
        update:() => void;
        version: () => void;
        websocket: () => void;
    }

    /**
     * Stores file copy services
     * 
     * 
     * ```typescript
     * 
     * ``` */
    interface module_copy {
        actions: {
            receiveList: (data:service_copy_list) => void;
            rename: (config:config_copy_rename) => void;
            sameAgent: (data:service_copy) => void;
            sendList: (data:service_copy) => void;
        };
        route: {
            "copy": (socketData:socketData) => void;
            "copy-list": (socketData:socketData) => void;
        };
        status: {
            copy: (config:config_copy_status) => void;
            cut: (data:service_copy, fileList:remoteCopyListData) => void;
        };
    }

    /**
     * Methods to mask or unmask a device identity between users.
     * * **mask** - Converts a device identity into a new hash of 141 character length.
     * * **resolve** - Resolves a device identifier from a share for the current local user.
     * * **unmask** - Compares a temporary 141 character device identity against owned devices to determine validity of share permissions.
     * 
     * ```typescript
     * interface module_deviceMask {
     *     mask: (agent:fileAgent, key:string, callback:(key:string) => void) => void;
     *     resolve: (agent:fileAgent) => string;
     *     unmask: (mask:string, callback:(device:string) => void) => void;
     * }
     * ``` */
    interface module_deviceMask {
        mask: (agent:fileAgent, key:string, callback:(key:string) => void) => void;
        resolve: (agent:fileAgent) => string;
        unmask: (mask:string, callback:(device:string) => void) => void;
    }

    /**
     * Methods for managing file system actions other than copy/cut across a network and the security model.
     * * **actions.destroy** - Service handler to remove a file system artifact.
     * * **actions.directory** - A service handler to read directory information, such as navigating a file system in the browser.
     * * **actions.execute** - Tells the operating system to execute the given file system artifact using the default application for the resolved file type.
     * * **actions.newArtifact** - Creates new empty directories or files.
     * * **actions.read** - Opens a file and responds with the file contents as a UTF8 string.
     * * **actions.rename** - The service handler to rename a file system artifact.
     * * **actions.write** - Writes a string to a file.
     * * **menu** - Resolves actions from *service_fileSystem* to methods in this object's action property.
     * * **route.browser** - Packages status and error messaging for sender.route.
     * * **route.error** - Packages an error for transport via sender.route.
     * * **route.menu** - Provides a callback for file system actions via sender.route.
     * * **statusMessage** - Formulates a status message to display in the modal status bar of a File Navigate type modal for distribution using the *statusBroadcast* method.
     *
     * ```typescript
     * interface module_fileSystem {
     *     actions: {
     *         destroy: (data:service_fileSystem) => void;
     *         directory: (data:service_fileSystem) => void;
     *         execute: (data:service_fileSystem) => void;
     *         newArtifact: (data:service_fileSystem) => void;
     *         read: (data:service_fileSystem) => void;
     *         rename: (data:service_fileSystem) => void;
     *         write: (data:service_fileSystem) => void;
     *     };
     *     menu: (data:service_fileSystem) => void;
     *     route: {
     *         browser: (socketData:socketData) => void;
    *          error: (error:NodeJS.ErrnoException, agent:fileAgent, agentTarget:fileAgent) => void;
     *         menu: (socketData:socketData) => void;
     *     };
     *     statusMessage: (data:service_fileSystem, dirs:directoryResponse) => void;
     * }
     * ``` */
    interface module_fileSystem {
        actions: {
            destroy: (data:service_fileSystem) => void;
            directory: (data:service_fileSystem) => void;
            execute: (data:service_fileSystem) => void;
            newArtifact: (data:service_fileSystem) => void;
            read: (data:service_fileSystem) => void;
            rename: (data:service_fileSystem) => void;
            write: (data:service_fileSystem) => void;
        };
        menu: (data:service_fileSystem) => void;
        route: {
            browser: (socketData:socketData) => void;
            error: (error:NodeJS.ErrnoException, agent:fileAgent, agentTarget?:fileAgent) => void;
            menu: (socketData:socketData) => void;
        };
        statusMessage: (data:service_fileSystem, dirs:directoryResponse) => void;
    }

    /**
     * Methods for processing the various stages of the invitation process.
     * * **invite-complete** - Step 4: Receipt of the response at the originating device terminal for transmission to the browser.
     * * **invite-request** - Step 2: Receipt of the invitation request at the remote machine's terminal for processing to its browser.
     * * **invite-response** - Step 3: Receipt of the remote user's response at the remote machine's terminal for transmission to the originating machine.
     * * **invite-start** - Step 1: Receipt of an invite request from the local browser.
     *
     * ```typescript
     * interface module_inviteActions {
     *     "invite-complete": () => void;
     *     "invite-request": () => void;
     *     "invite-response": () => void;
     *     "invite-start": () => void;
     * }
     * ``` */
    interface module_inviteActions {
        "invite-complete": () => void;
        "invite-request": () => void;
        "invite-response": () => void;
        "invite-start": () => void;
    }

    /**
     * An abstraction to manage traffic output abstracted away from specific network protocols.
     * * **send** - Send a specified data package to a specified agent
     * * **broadcast** - Send a specified ata package to all agents of a given agent type.
     * * **route** - Automation to redirect data packages to a specific agent examination of a service identifier and agent data.
     *
     * ```typescript
     * interface module_sender {
     *     send: (data:socketData, device:string, user:string) => void;
     *     broadcast: (payload:socketData, listType:websocketClientType) => void;
     *     route: (payload:socketData, agent:fileAgent, action:(payload:socketData, device:string, thirdDevice:string) => void) => void;
     * }
     * ``` */
    interface module_sender {
        send: (data:socketData, device:string, user:string) => void;
        broadcast: (payload:socketData, listType:websocketClientType) => void;
        route: (payload:socketData, agent:fileAgent, action:(payload:socketData, device:string, thirdDevice:string) => void) => void;
    }

    /**
     * Methods associated with the browser test automation logic.
     * * **args** - Default configuration object available to the entire test browser library.  Over written by a configuration object of same type passed into the *methods.execute* method.
     * * **exitMessage** - Stores an exit message string for availability to the entirety of the test browser application because this messaging is generated by one method and distributed by another.
     * * **exitType** - Stores 0 or 1 depending upon whether to indicate a clean exit or exit with error.
     * * **index** - Stores the current test item index number.
     * * **ip** - Stores the IP address of the target machine for the current test index.
     * * **methods.close** - Sends a single that tests are complete and the respective browser window should close on the local device.
     * * **methods.delay** - Provides a single point of logic to handle delays regardless of the cause, duration, or associated messaging.
     * * **methods.execute** - The entry point to browser test automation that prepares the environment on the local device and tells the remote machines to reset their environments.
     * * **methods.exit** - Closes out testing on the local device and informs remote machines that testing has concluded with the corresponding messaging and a single to close their respective browser window.
     * * **methods.iterate** - Validates the next browser test is properly formed and then either sends it to a browser on the local device or to the correct machine.
     * * **methods.request** - Receives a test item on a remote machine for distribution to its browser for execution.  The result is sent back using *methods.respond*.
     * * **methods.reset-browser** - Sends a reset request to the browser of any given machine to prepare to execute tests.
     * * **methods.reset-complete** - Instructions the given machine to remove artifacts from a prior test cycle.  The local machine will then issue *reset-request* to remote machines.
     * * **methods.reset-request** - Sends a reset request to remote machines informing them to reset their environment and prepare to listen for incoming test items.  Method executed from *methods.execute*.
     * * **methods.respond** - On a remote machine receives test execution messaging from its local browser for transfer back to the originating machine.
     * * **methods.result** - The the evaluation result provided by a browser and transforms that data into messaging for a human to read.
     * * **methods.route** - The entry point to the browser test automation library on all remote machines.  Tasks are routed to the correct method based upon the action specified.
     * * **methods.sendBrowser** - Encapsulates the transmission logic to send tests to the local browser.
     * * **port** - Stores the port number of the target machine for the current test index.
     * * **remoteAgents** - Counts the remote agents that are reporting a ready status before executing the first test.
     *
     * ```typescript
     * interface module_test_browserApplication {
     *     args: config_test_browserExecute;
     *     exitMessage: string;
     *     exitType: 0 | 1;
     *     index: number;
     *     ip: string;
     *     methods: {
     *         close: (data:service_testBrowser) => void;
     *         delay: (config:config_test_browserDelay) => void;
     *         execute: (args:config_test_browserExecute) => void;
     *         exit: (index:number) => void;
     *         iterate: (index:number) => void;
     *         request: (item:service_testBrowser) => void;
     *         ["reset-browser"]: (data:service_testBrowser) => void;
     *         ["reset-complete"]: () => void;
     *         ["reset-request"]: (data:service_testBrowser) => void;
     *         respond: (item:service_testBrowser) => void;
     *         result: (item:service_testBrowser) => void;
     *         route: (socketData:socketData) => void;
     *         sendBrowser: (item:service_testBrowser) => void;
     *     };
     *     port: number;
     *     remoteAgents: number;
     * }
     * ``` */
    interface module_test_browserApplication {
        args: config_test_browserExecute;
        exitMessage: string;
        exitType: 0 | 1;
        index: number;
        ip: string;
        methods: {
            close: (data:service_testBrowser) => void;
            delay: (config:config_test_browserDelay) => void;
            execute: (args:config_test_browserExecute) => void;
            exit: (index:number) => void;
            iterate: (index:number) => void;
            request: (item:service_testBrowser) => void;
            ["reset-browser"]: (data:service_testBrowser) => void;
            ["reset-complete"]: () => void;
            ["reset-request"]: (data:service_testBrowser) => void;
            respond: (item:service_testBrowser) => void;
            result: (item:service_testBrowser) => void;
            route: (socketData:socketData) => void;
            sendBrowser: (item:service_testBrowser) => void;
        };
        port: number;
        remoteAgents: number;
    }

    /**
     * The *service* test type application described as an object.
     * * **addServers** - Starts listeners on random ports simulating various connecting agents.
     * * **agents** - Stores simulated agent identities.
     * * **complete** - Stores an action to perform once all test cases are executed.
     * * **evaluation** - Modifies service message out to ease comparisons and then send the output for comparison.
     * * **execute** - Executes each test case.
     * * **fail** - Counts the number for test failures.
     * * **index** - Stores the current test index number.
     * * **killServers** - Removes the listeners at the conclusion of testing.
     * * **list** - Stores the list of tests to execute.  This could be a filtered list or all tests.
     * * **tests** - Stores the various test cases.
     * 
     * ```typescript
     * interface module_test_serviceApplication {
     *     addServers: (callback:() => void) => void;
     *     agents: {
     *         device: {
     *             [key:string]: Server;
     *         };
     *         user: {
     *             [key:string]: Server;
     *         };
     *     };
     *     evaluation: (input:socketData) => void;
     *     execute: (config:config_test_execute) => void;
     *     complete: testCallback;
     *     fail: number;
     *     index: number;
     *     killServers: (complete:testComplete) => void;
     *     list: number[];
     *     tests: testService[];
     * }
     * ``` */
    interface module_test_serviceApplication {
        addServers: (callback:() => void) => void;
        agents: {
            device: {
                [key:string]: Server;
            };
            user: {
                [key:string]: Server;
            };
        };
        complete: testCallback;
        evaluation: (input:socketData) => void;
        execute: (config:config_test_execute) => void;
        fail: number;
        index: number;
        killServers: (complete:testComplete) => void;
        list: number[];
        tests: testService[];
    }

    /**
     * Defines the *simulation* type test application as an object.
     * **execute** - Executes each test case.
     * **tests** - Stores test cases.
     * 
     * ```typescript
     * interface module_test_simulationApplication {
     *     execute: (config:config_test_execute) => void;
     *     tests: testItem[];
     * }
     * ``` */
    interface module_test_simulationApplication {
        execute: (config:config_test_execute) => void;
        tests: testItem[];
    }

    /**
     * The HTTP library.
     * * **receive** - Processes incoming HTTP requests.
     * * **request** - Creates an arbitrary client request to a remote HTTP server.
     * * **requestCopy** - A specific client request orchestrated to meet the needs of file copy.
     * * **respond** - Formats and sends HTTP response messages.
     * * **server** - Creates an HTTP server.
     *
     * ```typescript
     * interface transmit_http {
     *     receive: (request:IncomingMessage, serverResponse:ServerResponse) => void;
     *     request: (config:config_http_request) => void;
     *     requestCopy: (config:config_http_request) => void;
     *     respond: (config:config_http_respond) => void;
     *     server: (serverOptions:config_http_server, serverCallback:serverCallback) => void;
     * }
     * ``` */
    interface module_transmit_http {
        receive: (request:IncomingMessage, serverResponse:ServerResponse) => void;
        request: (config:config_http_request) => void;
        respond: (config:config_http_respond) => void;
        respondEmpty: (transmit:transmit) => void;
        server: (serverOptions:config_http_server, serverCallback:serverCallback) => void;
    }

    /**
     * The websocket library
     * * **clientList** - A store of open sockets by agent type.
     * * **listener** - A handler attached to each socket to listen for incoming messages.
     * * **open** - Opens a socket client to a remote socket server.
     * * **send** - Processes a message with appropriate frame headers and writes to the socket.
     * * **server** - Creates a websocket server.
     * * **status** - Gather the status of agent web sockets.
     *
     * ```typescript
     * interface transmit_ws {
     *     clientList: {
     *         browser: socketList;
     *         device: socketList;
     *         user: socketList;
     *     };
     *     listener: (socket:socketClient) => void;
     *     open: (config:config_websocket_open) => void;
     *     send: (payload:Buffer|socketData, socket:socketClient) => void;
     *     server: (config:config_websocket_server) => Server;
     *     status: () => websocketStatus;
     * }
     * ``` */
    interface module_transmit_ws {
        clientList: {
            browser: socketList;
            device: socketList;
            user: socketList;
        };
        listener: (socket:socketClient) => void;
        open: (config:config_websocket_open) => void;
        send: (payload:Buffer|socketData, socket:socketClient, opcode?:1|2|8|9) => void;
        server: (config:config_websocket_server) => Server;
        status: () => websocketStatus;
    }
}