/* lib/typescript/modules_terminal.d - TypeScript interfaces that define master library modules used in the terminal. */

import { IncomingHttpHeaders } from "http2";
import { Server, Socket } from "net";

declare global {

    /**
     * A list of methods used for build tasks and tasks associated with the *test* command.
     * ```typescript
     * interface module_buildPhaseList {
     *     browserSelf:() => void;    // Launches test automation type *browser_self* against the local device.
     *     certificate:() => void;    // Tests for certificates and creates them if not present.
     *     clearStorage:() => void;   // Removes files created from prior test automation runs.
     *     commands:() => void;       // Builds the documentation/commands.md file.
     *     configurations:() => void; // Writes application specific configuration files from lib/configurations.json.
     *     libReadme:() => void;      // Extracts comments from the top of each file to build out automated documentation.
     *     lint:() => void;           // Executes ESLint as a test task.
     *     service:() => void;        // Executes the test automation of type *service*.
     *     shellGlobal:() => void;    // Writes and updates a file to provide this application with global availability against a keyword on the terminal.
     *     simulation:() => void;     // Executes the test automation of type *simulation*.
     *     typescript:() => void;     // Runs the TypeScript compiler.
     *     version:() => void;        // Updates version data as taken from the package.json and prior git commit for display and availability elsewhere in the application.
     * }
     * ``` */
    interface module_buildPhaseList {
        browserSelf:() => void;
        certificate:() => void;
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
     * ```typescript
     * interface module_commandList {
     *     agent_data     : () => void; // Lists stored data on one more agents.
     *     agent_online   : () => void; // Allows for testing of connectivity to remote agents.
     *     base64         : (input?:config_command_base64) => void;                                      // Generates a base64 string output from a file system artifact or string input.
     *     build          : (test?:boolean, callback?:() => void) => void;                               // Executes the tasks included in the commands/build.ts file which includes documentation automation and compiling from TypeScript.
     *     certificate    : (config?:config_command_certificate) => void;                                // Generates an HTTPS certificate.
     *     commands       : () => void;                                                                  // Displays interactive documentation on the terminal about available commands.
     *     copy           : (params?:config_command_copy) => void;                                       // Duplications a file system artifact from one location to another.
     *     directory      : (parameters?:config_command_directory) => void;                              // Walks the file system to build out a representational data structure.
     *     get            : (address?:string, callback?:(file:Buffer|string) => void) => void;           // Issues an arbitrary HTTP GET request from the terminal.
     *     hash           : (input?:config_command_hash) => void;                                        // Generates a hash sequence using OpenSSH for file system artifacts or string input.
     *     lint           : (callback?:(complete:string, failCount:number) => void) => void;             // Runs ESLint with this application's configuration against any location on the local device.
     *     mkdir          : (dirToMake?:string, callback?:(typeError:Error) => void) => void;            // Creates a new directory.
     *     remove         : (filePath?:string, callback?:() => void) => void;                            // Removes a file system artifact.
     *     service        : (serverOptions?:config_http_server, serverCallback?:serverCallback) => void; // Primary command to run this application by creating a web server and web socket server.
     *     test           : () => void; // Runs all test tasks as defined in the commands/build.ts file.
     *     test_browser   : () => void; // Executes browser test automation.
     *     test_service   : () => void; // Executes test automation of type *service*.
     *     test_simulation: () => void; // Executes test automation of type *simulation*.
     *     update         : () => void; // Pulls code updates from git and builds
     *     version        : () => void; // Displays version information for this application.
     *     websocket      : () => void; // Launches a web socket server.
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
     * Stores file copy services.
     * ```typescript
     * interface module_copy {
     *     actions: {
     *         receiveList: (data:service_copy_list) => void; // Receives a list file system artifacts to be received from an remote agent's sendList operation, creates the directory structure, and then requests files by name
     *         sameAgent  : (data:service_copy) => void;      // An abstraction over commands/copy to move file system artifacts from one location to another on the same device
     *         sendList   : (data:service_copy) => void;      // Sends a list of file system artifacts to be copied on a remote agent.
     *     };
     *     route: {
     *         "copy"     : (socketData:socketData) => void; // Defines a callback for copy operations routed between agents.
     *         "copy-list": (socketData:socketData) => void; // Defines a callback for copy-list operations routed between agents.
     *     };
     *     status: {
     *         copy: (config:config_copy_status) => void;                      // Sends status messages for copy operations.
     *         cut : (data:service_copy, fileList:remoteCopyListData) => void; // Sends status messages for cut operations.
     *     };
     * }
     * ``` */
    interface module_copy {
        actions: {
            receiveList: (data:service_copy_list) => void;
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
     * ```typescript
     * interface module_deviceMask {
     *     mask: (agent:fileAgent, key:string, callback:(key:string) => void) => void; // Converts a device identity into a new hash of 141 character length.
     *     resolve: (agent:fileAgent) => string;                                       // Resolves a device identifier from a share for the current local user.
     *     unmask: (mask:string, callback:(device:string) => void) => void;            // Compares a temporary 141 character device identity against owned devices to determine validity of share permissions.
     * }
     * ``` */
    interface module_deviceMask {
        mask: (agent:fileAgent, key:string, callback:(key:string) => void) => void;
        resolve: (agent:fileAgent) => string;
        unmask: (mask:string, callback:(device:string) => void) => void;
    }

    /**
     * Methods for managing file system actions other than copy/cut across a network and the security model.
     * ```typescript
     * interface module_fileSystem {
     *     actions: {
     *         destroy    : (data:service_fileSystem) => void; // Service handler to remove a file system artifact.
     *         directory  : (data:service_fileSystem) => void; // A service handler to read directory information, such as navigating a file system in the browser.
     *         execute    : (data:service_fileSystem) => void; // Tells the operating system to execute the given file system artifact using the default application for the resolved file type.
     *         newArtifact: (data:service_fileSystem) => void; // Creates new empty directories or files.
     *         read       : (data:service_fileSystem) => void; // Opens a file and responds with the file contents as a UTF8 string.
     *         rename     : (data:service_fileSystem) => void; // Service handler to rename a file system artifact.
     *         write      : (data:service_fileSystem) => void; // Writes a string to a file.
     *     };
     *     menu: (data:service_fileSystem) => void; // Resolves actions from *service_fileSystem* to methods in this object's action property.
     *     route: {
     *         browser: (socketData:socketData) => void;                                               // Packages status and error messaging for sender.route.
    *          error  : (error:NodeJS.ErrnoException, agent:fileAgent, agentTarget:fileAgent) => void; // Packages an error for transport via sender.route.
     *         menu   : (socketData:socketData) => void;                                               // Provides a callback for file system actions via sender.route.
     *     };
     *     status: {
     *         generate : (data:service_fileSystem, dirs:directoryResponse) => void;               // Formulates a status message to display in the modal status bar of a File Navigate type modal for distribution using the *statusBroadcast* method.
     *         specified: (message:string, agentRequest:fileAgent, agentTarget:fileAgent) => void; // Specifies an exact string to send to the File Navigate modal status bar.
     *     };
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
        status: {
            generate: (data:service_fileSystem, dirs:directoryResponse) => void;
            specified: (message:string, agentRequest:fileAgent, agentTarget:fileAgent) => void;
        };
    }

    /**
     * Methods for processing the various stages of the invitation process.
     * ```typescript
     * interface module_inviteActions {
     *     "invite-complete": () => void; // Step 4: Receipt of the response at the originating device terminal for transmission to the browser.
     *     "invite-request" : () => void; // Step 2: Receipt of the invitation request at the remote machine's terminal for processing to its browser.
     *     "invite-response": () => void; // Step 3: Receipt of the remote user's response at the remote machine's terminal for transmission to the originating machine.
     *     "invite-start"   : () => void; // Step 1: Receipt of an invite request from the local browser.
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
     * ```typescript
     * interface module_sender {
     *     send     : (data:socketData, device:string, user:string) => void;      // Send a specified data package to a specified agent
     *     broadcast: (payload:socketData, listType:websocketClientType) => void; // Send a specified ata package to all agents of a given agent type.
     *     route    : (payload:socketData, agent:fileAgent, action:(payload:socketData, device:string, thirdDevice:string) => void) => void; // Automation to redirect data packages to a specific agent examination of a service identifier and agent data.
     * }
     * ``` */
    interface module_sender {
        send: (data:socketData, device:string, user:string) => void;
        broadcast: (payload:socketData, listType:websocketClientType) => void;
        route: (payload:socketData, agent:fileAgent, action:(payload:socketData, device:string, thirdDevice:string) => void) => void;
    }

    /**
     * The global environmental variable available to all tasks, services,  and commands executed from the terminal.
     * ```typescript
     * interface module_terminalVariables {
     *     environment: {
     *         addresses   : networkAddresses; // ip addresses available to this device
     *         command     : commands;         // command name currently executing the application
     *         date        : string;           // dynamically populated static value of date of prior version change
     *         git_hash    : string;           // dynamically populated static value of hash from prior git commit at latest build
     *         name        : string;           // a static name of the application
     *         port_default: number            // default port number for the http service
     *         ports       : ports;            // a list of service port numbers
     *         startTime   : bigint;           // nanosecond precision time the application starts for measuring execution performance
     *         version     : string;           // dynamically populated static value of application version number string
     *     };
     *     path: {
     *         js      : string; // file system path of the compiled JavaScript (`${vars.projectPath}lib${vars.sep}js`)
     *         project : string; // absolute file system path of this application
     *         sep     : string; // file system separator character
     *         settings: string; // location where configuration files are read from and written to
     *         storage : string; // location for temporary file writes when requesting to execute a file not on this immediate device
     *     };
     *     settings: {
     *         brotli    : brotli;          // stores the brotli compress level
     *         device    : agents;          // stores the device type agents
     *         hashDevice: string;          // hash identifier for this device
     *         hashType  : hash;            // current selected hash algorithm, default: sha3-512
     *         hashUser  : string;          // hash identifier for the user of this device
     *         message   : service_message; // a store of message objects
     *         nameDevice: string;          // user friendly name of this device
     *         nameUser  : string;          // user friendly name of this device's user
     *         status    : activityStatus;  // device activity status
     *         user      : agents;          // stores a list of user type agents
     *         verbose   : boolean;         // whether verbose message should be applied to the terminal
     *     };
     *     terminal: {
     *         arguments          : string;               // a list of all terminal arguments before this list is modified, only used in error reporting
     *         command_instruction: string;               // terminal command that executes this application from a terminal, such as "node js/application "
     *         commands           : commandDocumentation; // interactive terminal command documentation
     *         cwd                : string;               // current working directory from the perspective of the TypeScript libraries (`${vars.projectPath}lib`)
     *         exclusions         : string[];             // a file system exclusion list provided by the user from terminal arguments
     *         executionKeyword   : string;               // an OS specific keyword to execute an application by name from the terminal
     *     };
     *     test: {
     *         flags: {
     *             error: boolean;
     *             write: string;
     *         };                             // properties used by service and simulation tests so that error message is identified independent of other test execution
     *         browser: service_testBrowser;  // current test_browser object when running test automation in the browser
     *         socket : agentStream | Socket; // holds a socket for service tests
     *         type   : testListType;         // type of test automation running in the application
     *     };
     *     text: stringStore;                - ANSI text formatting for terminal output
     * }
     * type activityStatus = "" | "active" | "deleted" | "idle" | "offline";
     * type brotli = 0|1|2|3|4|5|6|7|8|9|10|11;
     * type commands = "agent_data" | "agent_online" | "base64" | "build" | "certificate" | "commands" | "copy" | "directory" | "get" | "hash" | "lint" | "mkdir" | "remove" | "service" | "test_browser" | "test_service" | "test_simulation" | "test" | "update" | "version";
     * type hash = "blake2d512" | "blake2s256" | "sha1" | "sha3-224" | "sha3-256" | "sha3-384" | "sha3-512" | "sha384" | "sha512-224" | "sha512-256" | "sha512" | "shake128" | "shake256";
     * type testListType = "" | "browser_device" | "browser_remote" | "browser_self" | "browser_user" | "service" | "simulation";
     * ``` */
    interface module_terminalVariables {
        environment: {
            addresses   : networkAddresses;
            command     : commands;
            date        : string;
            git_hash    : string;
            name        : string;
            port_default: number;
            ports       : ports;
            startTime   : bigint;
            version     : string;
        };
        path: {
            js      : string;
            project : string;
            sep     : string;
            settings: string;
            storage : string;
        };
        settings: terminalVariables_settings;
        terminal: {
            arguments          : string;
            command_instruction: string;
            commands           : commandDocumentation;
            cwd                : string;
            exclusions         : string[];
            executionKeyword   : string;
        };
        test: {
            flags: {
                error: boolean;
                write: string;
            };
            browser: service_testBrowser;
            socket : agentStream | Socket;
            type   : testListType;
        };
        text: stringStore;
    }

    /**
     * Methods associated with the browser test automation logic.
     * ```typescript
     * interface module_test_browserApplication {
     *     args       : config_test_browserExecute; // Default configuration object available to the entire test browser library. Over written by a configuration object of same type passed into the *methods.execute* method.
     *     exitMessage: string;                     // Stores an exit message string for availability to the entirety of the test browser application because this messaging is generated by one method and distributed by another.
     *     exitType   : 0 | 1;                      // Stores 0 or 1 depending upon whether to indicate a clean exit or exit with error.
     *     index      : number;                     // Stores the current test item index number.
     *     ip         : string;                     // Stores the IP address of the target machine for the current test index.
     *     methods: {
     *         close             : (data:service_testBrowser) => void;        // Sends a single that tests are complete and the respective browser window should close on the local device.
     *         delay             : (config:config_test_browserDelay) => void; // Provides a single point of logic to handle delays regardless of the cause, duration, or associated messaging.
     *         execute           : (args:config_test_browserExecute) => void; // Entry point to browser test automation that prepares the environment on the local device and tells the remote machines to reset their environments.
     *         exit              : (index:number) => void;                    // Closes out testing on the local device and informs remote machines that testing has concluded with the corresponding messaging and a single to close their respective browser window.
     *         iterate           : (index:number) => void;                    // Validates the next browser test is properly formed and then either sends it to a browser on the local device or to the correct machine.
     *         request           : (item:service_testBrowser) => void;        // Receives a test item on a remote machine for distribution to its browser for execution.  The result is sent back using *methods.respond*.
     *         ["reset-browser"] : (data:service_testBrowser) => void;        // Sends a reset request to the browser of any given machine to prepare to execute tests.
     *         ["reset-complete"]: () => void;                                // Instructions the given machine to remove artifacts from a prior test cycle. The local machine will then issue *reset-request* to remote machines.
     *         ["reset-request"] : (data:service_testBrowser) => void;        // Sends a reset request to remote machines informing them to reset their environment and prepare to listen for incoming test items. Method executed from *methods.execute*.
     *         respond           : (item:service_testBrowser) => void;        // On a remote machine receives test execution messaging from its local browser for transfer back to the originating machine.
     *         result            : (item:service_testBrowser) => void;        // Evaluation result provided by a browser and transforms that data into messaging for a human to read.
     *         route             : (socketData:socketData) => void;           // Entry point to the browser test automation library on all remote machines. Tasks are routed to the correct method based upon the action specified.
     *         sendBrowser       : (item:service_testBrowser) => void;        // Encapsulates the transmission logic to send tests to the local browser.
     *     };
     *     port        : number; // Stores the port number of the target machine for the current test index.
     *     remoteAgents: number; // Counts the remote agents that are reporting a ready status before executing the first test.
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
     * ```typescript
     * interface module_test_serviceApplication {
     *     addServers: (callback:() => void) => void;     // Starts listeners on random ports simulating various connecting agents.
     *     agents: {
     *         device: {
     *             [key:string]: Server;
     *         };
     *         user: {
     *             [key:string]: Server;
     *         };
     *     };                                             // Stores simulated agent identities.
     *     complete: testCallback;                        // Stores an action to perform once all test cases are executed.
     *     evaluation: (input:socketData) => void;        // Modifies service message out to ease comparisons and then send the output for comparison.
     *     execute: (config:config_test_execute) => void; // Executes each test case.
     *     fail: number;                                  // Counts the number for test failures.
     *     index: number;                                 // Stores the current test index number.
     *     killServers: (complete:testComplete) => void;  // Removes the listeners at the conclusion of testing.
     *     list: number[];                                // Stores the list of tests to execute. This could be a filtered list or all tests.
     *     tests: testService[];                          // Stores the various test cases.
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
     * ```typescript
     * interface module_test_simulationApplication {
     *     execute: (config:config_test_execute) => void; // Executes each test case.
     *     tests  : testItem[];                           // Stores test cases.
     * }
     * ``` */
    interface module_test_simulationApplication {
        execute: (config:config_test_execute) => void;
        tests: testItem[];
    }

    /**
     * The HTTP library.
     * ```typescript
     * interface transmit_http {
     *     receive    : (stream:agentStream, headers:IncomingHttpHeaders) => void;                 // Processes incoming HTTP requests.
     *     requestCopy: (config:config_http_request) => void;                                      // Creates an arbitrary client request to a remote HTTP server.
     *     respond    : (config:config_http_respond) => void;                                      // Formats and sends HTTP response messages.
     *     server     : (serverOptions:config_http_server, serverCallback:serverCallback) => void; // Creates an HTTP server.
     * }
     * ``` */
    interface module_transmit_http {
        receive: (stream:agentStream, headers:IncomingHttpHeaders) => void;
        respond: (config:config_http_respond) => void;
        respondEmpty: (transmit:transmit) => void;
        server: (serverOptions:config_http_server, serverCallback:serverCallback) => void;
    }

    /**
     * The websocket library
     * ```typescript
     * interface transmit_ws {
     *     clientList: {
     *         browser: socketList;
     *         device : socketList;
     *         user   : socketList;
     *     };                                                    // A store of open sockets by agent type.
     *     listener: (socket:socketClient) => void;              // A handler attached to each socket to listen for incoming messages.
     *     open    : (config:config_websocket_open) => void;     // Opens a socket client to a remote socket server.
     *     send    : (payload:Buffer|socketData, socket:socketClient, type:agentType|"browser") => void; // Processes a message with appropriate frame headers and writes to the socket.
     *     server  : (config:config_websocket_server) => Server; // Creates a websocket server.
     *     status  : () => websocketStatus;                      // Gather the status of agent web sockets.
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
        send: (payload:Buffer|socketData, socket:socketClient, type:agentType|"browser") => void;
        server: (config:config_websocket_server) => Server;
        status: () => websocketStatus;
    }
}