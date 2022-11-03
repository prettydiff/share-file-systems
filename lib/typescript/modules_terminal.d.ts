/* lib/typescript/modules_terminal.d - TypeScript interfaces that define master library modules used in the terminal. */

import { IncomingMessage, ServerResponse } from "http";
import { Server, Socket } from "net";

// cspell:words brotli

declare global {

    /**
     * A list of methods used for build tasks and tasks associated with the *test* command.
     * ```typescript
     * interface module_buildPhaseList {
     *     browserSelf:() => void;         // Launches test automation type *browser_self* against the local device.
     *     bundleCSS:() => void;           // Bundle CSS files into a single file.
     *     bundleJS:() => void;            // Bundle browser-side JS libraries into a single file.
     *     certificate:() => void;         // Tests for certificates and creates them if not present.
     *     clearStorage:() => void;        // Removes files created from prior test automation runs.
     *     commands:() => void;            // Builds the documentation/commands.md file.
     *     configurations:() => void;      // Writes application specific configuration files from lib/configurations.json.
     *     libReadme:() => void;           // Extracts comments from the top of each file to build out automated documentation.
     *     lint:() => void;                // Executes ESLint as a test task.
     *     os_specific: () => void;        // Execute any Operating System specific tasks here.
     *     service:() => void;             // Executes the test automation of type *service*.
     *     shellGlobal:() => void;         // Writes and updates a file to provide this application with global availability against a keyword on the terminal.
     *     simulation:() => void;          // Executes the test automation of type *simulation*.
     *     typescript_compile:() => void;  // Runs the TypeScript compiler.
     *     typescript_validate:() => void; // Compiles the TypeScript code to JavaScript with SWC
     *     version:() => void;             // Updates version data as taken from the package.json and prior git commit for display and availability elsewhere in the application.
     * }
     * ``` */
    interface module_buildPhaseList {
        browserSelf:() => void;
        bundleCSS:() => void;
        bundleJS:() => void;
        certificate:() => void;
        clearStorage:() => void;
        commands:() => void;
        configurations:() => void;
        libReadme:() => void;
        lint:() => void;
        os_specific: () => void;
        service:() => void;
        shellGlobal:() => void;
        simulation:() => void;
        typescript_compile:() => void;
        typescript_validate:() => void;
        version:() => void;
    }

    /**
     * A map of command names to their respective terminal handlers.
     * ```typescript
     * interface module_commandList {
     *     agent_data     : (callback:commandCallback) => void; // Lists stored data on one more agents.
     *     agent_online   : (callback:commandCallback) => void; // Allows for testing of connectivity to remote agents.
     *     base64         : (callback:commandCallback) => void; // Generates a base64 string output from a file system artifact or string input.
     *     build          : (callback:commandCallback) => void; // Executes the tasks included in the commands/build.ts file which includes documentation automation and compiling from TypeScript.
     *     certificate    : (callback:commandCallback) => void; // Generates an HTTPS certificate.
     *     commands       : (callback:commandCallback) => void; // Displays interactive documentation on the terminal about available commands.
     *     copy           : (callback:commandCallback) => void; // Duplications a file system artifact from one location to another.
     *     directory      : (callback:commandCallback) => void; // Walks the file system to build out a representational data structure.
     *     firewall       : (callback:commandCallback) => void; // Allows necessary allowances through the firewall specific to this application.
     *     get            : (callback:commandCallback) => void; // Issues an arbitrary HTTP GET request from the terminal.
     *     hash           : (callback:commandCallback) => void; // Generates a hash sequence using OpenSSH for file system artifacts or string input.
     *     lint           : (callback:commandCallback) => void; // Runs ESLint with this application's configuration against any location on the local device.
     *     mkdir          : (callback:commandCallback) => void; // Creates a new directory.
     *     perf           : (callback:commandCallback) => void; // Allows performance testing of the application.
     *     remove         : (callback:commandCallback) => void; // Removes a file system artifact.
     *     service        : (callback:commandCallback) => void; // Primary command to run this application by creating a web server and web socket server.
     *     test           : (callback:commandCallback) => void; // Runs all test tasks as defined in the commands/build.ts file.
     *     test_browser   : (callback:commandCallback) => void; // Executes browser test automation.
     *     test_service   : (callback:commandCallback) => void; // Executes test automation of type *service*.
     *     test_simulation: (callback:commandCallback) => void; // Executes test automation of type *simulation*.
     *     typescript     : (callback:commandCallback) => void; // Performs TypeScript type checks.
     *     update         : () => void;                         // Pulls code updates from git and builds
     *     version        : (callback:commandCallback) => void; // Displays version information for this application.
     *     websocket      : (callback:commandCallback) => void; // Launches a web socket server.
     * }
     * ``` */
    interface module_commandList {
        agent_data: (callback:commandCallback) => void;
        agent_online: (callback:commandCallback) => void;
        base64: (callback:commandCallback) => void;
        build: (callback:commandCallback) => void;
        certificate: (callback:commandCallback) => void;
        commands: (callback:commandCallback) => void;
        copy: (callback:commandCallback) => void;
        directory: (callback:commandCallback) => void;
        firewall: (callback:commandCallback) => void;
        get: (callback:commandCallback) => void;
        hash: (callback:commandCallback) => void;
        lint: (callback:commandCallback) => void;
        mkdir: (callback:commandCallback) => void;
        perf: (callback:commandCallback) => void;
        remove: (callback:commandCallback) => void;
        service: (callback:commandCallback) => void;
        test: (callback:commandCallback) => void;
        test_browser: (callback:commandCallback) => void;
        test_service: (callback:commandCallback) => void;
        test_simulation: (callback:commandCallback) => void;
        typescript: (callback:commandCallback) => void;
        update:() => void;
        version: (callback:commandCallback) => void;
        websocket: (callback:commandCallback) => void;
    }

    /**
     * Methods to mask or unmask a device identity between users.
     * ```typescript
     * interface module_deviceMask {
     *     mask: (agent:fileAgent, callback:(hashMask:string) => void) => void; // Converts a device identity into a new hash of 141 character length.
     *     resolve: (agent:fileAgent) => string;                                // Resolves a device identifier from a share for the current local user.
     *     token: (date:string, device:string) => string;                       // Provides a uniform sample to hash for creating or comparing device masks.
     *     unmask: (mask:string, callback:(device:string) => void) => void;     // Compares a temporary 141 character device identity against owned devices to determine validity of share permissions.
     * }
     * ``` */
    interface module_deviceMask {

        mask: (agent:fileAgent, callback:(key:string) => void) => void;
        resolve: (agent:fileAgent) => string;
        token: (date:string, device:string) => string;
        unmask: (mask:string, callback:(device:string) => void) => void;
    }

    /**
     * Stores file copy services.
     * ```typescript
     * interface module_fileCopy {
     *     actions: {
     *         copyList   : (data:service_copy) => void         // If agentSource and agentWrite are the same device executes file copy as a local stream
     *         copySelf   : (data:service_copy) => void;        // Prepares a list of artifacts to send from agentSource to agentWrite
     *         cut        : (data:service_cut) => void;         // Performs file deletion at the source agent according to a list of a successfully written artifacts at the write agent
     *         fileRespond: receive;                            // A server-side listener for the file copy socket
     *         write      : (data:service_copy_write) => void;  // Receives a list file system artifacts to be received from an remote agent's sendList operation, creates the directory structure, and then requests files by name
     *     };
     *     route : (socketData:socketData) => void;             // Directs data to the proper agent by service name.
     *     security: (config:config_copy_security) => void;     // validates if external users have permissions to access the requested actions
     *     status: (config:config_copy_status) => void;         // Sends status messages for copy operations.
     * }
     * ``` */
    interface module_fileCopy {
        actions: {
            copyList: (data:service_copy) => void;
            copySelf: (data:service_copy) => void;
            cut: (data:service_cut) => void;
            fileRespond: receiver;
            write: (data:service_copy_write) => void;
        };
        route: (socketData:socketData) => void;
        security: (config:config_copy_security) => void;
        status: (config:config_copy_status) => void;
    }

    /**
     * Methods for managing file system actions other than copy/cut across a network and the security model.
     * ```typescript
     * interface module_fileSystem {
     *     actions: {
     *         destroy    : (data:service_fileSystem) => void; // Service handler to remove a file system artifact.
     *         directory  : (data:service_fileSystem) => void; // A service handler to read directory information, such as navigating a file system in the browser.
     *         error      : (error:NodeJS.ErrnoException, agentRequest:fileAgent, agentSource:fileAgent) => void; // packages error messaging for transport
     *         execute    : (data:service_fileSystem) => void; // Tells the operating system to execute the given file system artifact using the default application for the resolved file type.
     *         newArtifact: (data:service_fileSystem) => void; // Creates new empty directories or files.
     *         read       : (data:service_fileSystem) => void; // Opens a file and responds with the file contents as a UTF8 string.
     *         rename     : (data:service_fileSystem) => void; // Service handler to rename a file system artifact.
     *         write      : (data:service_fileSystem) => void; // Writes a string to a file.
     *     };
     *     menu: (data:service_fileSystem) => void; // Resolves actions from *service_fileSystem* to methods in this object's action property.
     *     route: (socketData:socketData) => void;  // Sends the data and destination to sender.route method.
     *     status: {
     *         generate : (data:service_fileSystem, dirs:directory_response) => void;              // Formulates a status message to display in the modal status bar of a File Navigate type modal for distribution using the *statusBroadcast* method.
     *         specified: (message:string, agentRequest:fileAgent, agentSource:fileAgent) => void; // Specifies an exact string to send to the File Navigate modal status bar.
     *     };
     * }
     * ``` */
    interface module_fileSystem {
        actions: {
            destroy: (data:service_fileSystem) => void;
            directory: (data:service_fileSystem) => void;
            error: (error:NodeJS.ErrnoException, agentRequest:fileAgent, agentSource:fileAgent) => void;
            execute: (data:service_fileSystem) => void;
            newArtifact: (data:service_fileSystem) => void;
            read: (data:service_fileSystem) => void;
            rename: (data:service_fileSystem) => void;
            write: (data:service_fileSystem) => void;
        };
        menu: (data:service_fileSystem) => void;
        route: (socketData:socketData) => void;
        status: {
            generate: (data:service_fileSystem, dirs:directory_response) => void;
            specified: (message:string, agentRequest:fileAgent, agentSource:fileAgent) => void;
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
     *     agentQueue: (type:socketType, agent:string, payload:socketData) => void;  // If the agent is offline the message will be queued.
     *     broadcast : (payload:socketData, listType:agentType | "browser") => void; // Send a specified ata package to all agents of a given agent type.
     *     route     : (destination:copyAgent, socketData:socketData, callback:(socketData:socketData) => void) => void; // Automation to redirect data packages to a specific agent examination of a service identifier and agent data.
     *     send      : (data:socketData, agents:transmit_agents) => void;            // Send a specified data package to a specified agent
     * }
     * ``` */
    interface module_sender {
        agentQueue: (type:socketType, agent:string, payload:socketData) => void;
        broadcast: (payload:socketData, listType:agentType | "browser") => void;
        route: (destination:copyAgent, socketData:socketData, callback:(socketData:socketData) => void) => void;
        send: (data:socketData, agents:transmit_agents) => void;
    }

    /**
     * The global environmental variable available to all tasks, services,  and commands executed from the terminal.
     * ```typescript
     * interface module_terminalVariables {
     *     environment: {
     *         command     : commands;              // command name currently executing the application
     *         date        : string;                // dynamically populated static value of date of prior version change
     *         domain      : string[];              // supported domains that resolves to a localhost IP
     *         git_hash    : string;                // dynamically populated static value of hash from prior git commit at latest build
     *         module_type : "commonjs" | "module"  // the type of module system the application is currently using
     *         name        : string;                // a static name of the application
     *         startTime   : bigint;                // nanosecond precision time the application starts for measuring execution performance
     *         version     : string;                // dynamically populated static value of application version number string
     *     };
     *     network: {
     *         addresses   : transmit_addresses_IP;          // ip addresses available to this device
     *         count       : terminalVariables_networkCount; // a count of network transmissions by protocol type and send/receive
     *         domain      : string[];                       // supported domains that resolves to a localhost IP
     *         port_default: number;                         // default port number for the http service
     *         ports       : ports;                          // a list of service port numbers
     *         size        : terminalVariables_networkCount; // a count of data size transmitted by protocol type and send/receive
     *     };
     *     path: {
     *         js      : string; // file system path of the compiled JavaScript (`${vars.projectPath}lib${vars.sep}js`)
     *         node    : string; // path to the node binary running this application
     *         project : string; // absolute file system path of this application
     *         sep     : string; // file system separator character
     *         settings: string; // location where configuration files are read from and written to
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
     *         storage   : string;          // location for temporary file writes when requesting to execute a file not on this immediate device
     *         user      : agents;          // stores a list of user type agents
     *         verbose   : boolean;         // whether verbose message should be applied to the terminal
     *     };
     *     terminal: {
     *         arguments          : string;               // a list of all terminal arguments before this list is modified, only used in error reporting
     *         command_instruction: string;               // terminal command that executes this application from a terminal, such as "node js/lib/terminal/utilities/terminal "
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
     *         type   : test_listType;        // type of test automation running in the application
     *     };
     *     text: stringStore;                 // ANSI text formatting for terminal output
     * }
     * type activityStatus = "" | "active" | "deleted" | "idle" | "offline";
     * type brotli = 0|1|2|3|4|5|6|7|8|9|10|11;
     * type commands = "agent_data" | "agent_online" | "base64" | "build" | "certificate" | "commands" | "copy" | "directory" | "get" | "hash" | "lint" | "mkdir" | "remove" | "service" | "test_browser" | "test_service" | "test_simulation" | "test" | "update" | "version | websocket";
     * type hash = "blake2d512" | "blake2s256" | "sha1" | "sha3-224" | "sha3-256" | "sha3-384" | "sha3-512" | "sha384" | "sha512-224" | "sha512-256" | "sha512" | "shake128" | "shake256";
     * type testListType = "" | "browser_device" | "browser_remote" | "browser_self" | "browser_user" | "service" | "simulation";
     * ``` */
    interface module_terminalVariables {
        environment: {
            command    : commands;
            date       : string;
            git_hash   : string;
            module_type: "commonjs" | "module";
            name       : string;
            startTime  : bigint;
            version    : string;
        };
        network: {
            addresses   : transmit_addresses_IP;
            count       : terminalVariables_networkCount;
            domain      : string[];
            port_default: number;
            ports       : ports;
            size        : terminalVariables_networkCount;
        };
        path: {
            js      : string;
            node    : string;
            project : string;
            sep     : string;
            settings: string;
        };
        settings: terminalVariables_settings;
        terminal: {
            arguments          : string;
            command_instruction: string;
            commands           : documentation_command;
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
            socket : ServerResponse | Socket;
            type   : test_listType;
        };
        text: stringStore;
    }

    /**
     * Methods associated with the browser test automation logic.
     * ```typescript
     * interface module_test_browserApplication {
     *     args       : config_test_browserExecute; // Default configuration object available to the entire test browser library. Over written by a configuration object of same type passed into the *methods.execute* method.
     *     exitMessage: string;                     // Stores an exit message string for availability to the entirety of the test browser application because this messaging is generated by one method and distributed by another.
     *     fail       : boolean;                    // Stores the pass/fail status for messaging to the callback.
     *     index      : number;                     // Stores the current test item index number.
     *     ip         : string;                     // Stores the IP address of the target machine for the current test index.
     *     methods: {
     *         close           : (data:service_testBrowser) => void;        // Sends a single that tests are complete and the respective browser window should close on the local device.
     *         delay           : (config:config_test_browserDelay) => void; // Provides a single point of logic to handle delays regardless of the cause, duration, or associated messaging.
     *         execute         : (args:config_test_browserExecute) => void; // Entry point to browser test automation that prepares the environment on the local device and tells the remote machines to reset their environments.
     *         exit            : (index:number) => void;                    // Closes out testing on the local device and informs remote machines that testing has concluded with the corresponding messaging and a single to close their respective browser window.
     *         iterate         : (index:number) => void;                    // Validates the next browser test is properly formed and then either sends it to a browser on the local device or to the correct machine.
     *         reset           : () => void;                                // Sends a reset request to remote machines informing them to reset their environment and prepare to listen for incoming test items. Method executed from *methods.execute*.
     *         "reset-complete": (item:service_testBrowser) => void;        // Determines if the test environment is ready both locally and with remote agents.
     *         result          : (item:service_testBrowser) => void;        // Evaluation result provided by a browser and transforms that data into messaging for a human to read.
     *         route           : (socketData:socketData) => void;           // Entry point to the browser test automation library on all remote machines. Tasks are routed to the correct method based upon the action specified.
     *         send            : (testItem:service_testBrowser) => void;    // Encapsulates the transmission logic to send tests to the local browser.
     *     };
     *     name        : string; // indicates identity of the local machine
     *     port        : number; // Stores the port number of the target machine for the current test index.
     *     remote: {
     *         count: number;
     *         total: number;
     *     };                    // Counts the number of remote agents ready to receive tests.
     *     sockets: {
     *         [key:string]: websocket_client;
     *     };                    // Stores sockets to remote agents.
     * }
     * ``` */
    interface module_test_browserApplication {
        args: config_test_browserExecute;
        exitMessage: string;
        fail: boolean;
        index: number;
        ip: string;
        methods: {
            close: (data:service_testBrowser) => void;
            delay: (config:config_test_browserDelay) => void;
            execute: (args:config_test_browserExecute) => void;
            exit: (index:number) => void;
            iterate: (index:number) => void;
            reset: () => void;
            "reset-complete": (item:service_testBrowser) => void;
            result: (item:service_testBrowser) => void;
            route: (socketData:socketData) => void;
            send: (testItem:service_testBrowser) => void;
        };
        name: string;
        port: number;
        remote: {
            count: number;
            total: number;
        };
        sockets: {
            [key:string]: websocket_client;
        };
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
     *     complete: commandCallback;                     // Stores an action to perform once all test cases are executed.
     *     evaluation: (input:socketData) => void;        // Modifies service message out to ease comparisons and then send the output for comparison.
     *     execute: (config:config_test_execute) => void; // Executes each test case.
     *     fail: number;                                  // Counts the number of test failures.
     *     index: number;                                 // Stores the current test index number.
     *     killServers: (complete:test_complete) => void; // Removes the listeners at the conclusion of testing.
     *     list: number[];                                // Stores the list of tests to execute. This could be a filtered list or all tests.
     *     tests: test_service[];                         // Stores the various test cases.
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
        complete: commandCallback;
        evaluation: (input:socketData) => void;
        execute: (config:config_test_execute) => void;
        fail: number;
        index: number;
        killServers: (complete:test_complete) => void;
        list: number[];
        tests: test_service[];
    }

    /**
     * Defines the *simulation* type test application as an object.
     * ```typescript
     * interface module_test_simulationApplication {
     *     execute: (config:config_test_execute) => void; // Executes each test case.
     *     tests  : test_item[];                          // Stores test cases.
     * }
     * ``` */
    interface module_test_simulationApplication {
        execute: (config:config_test_execute) => void;
        tests: test_item[];
    }

    /**
     * The HTTP library.
     * ```typescript
     * interface transmit_http {
     *     receive     : (request:IncomingMessage, serverResponse:ServerResponse) => void;           // Processes incoming HTTP requests.
     *     request     : (config:config_http_request) => void;                                       // Send an arbitrary HTTP request.
     *     respond     : (config:config_http_respond, get:boolean, url:string) => void;              // Formats and sends HTTP response messages.
     *     respondEmpty: (transmit:transmit_type)                                                    // Responds to a request with an empty payload.
     *     server      : (serverOptions:config_http_server, serverCallback:server_callback) => void; // Creates an HTTP server.
     * }
     * ``` */
    interface module_transmit_http {
        receive: (request:IncomingMessage, serverResponse:ServerResponse) => void;
        request: (config:config_http_request) => void;
        respond: (config:config_http_respond, get:boolean, url:string) => void;
        respondEmpty: (transmit:transmit_type) => void;
        server: (serverOptions:config_http_server, serverCallback:server_callback) => void;
    }

    /**
     * The websocket library
     * ```typescript
     * interface transmit_ws {
     *     agentClose      : (socket:websocket_client) => void;                                    // A uniform way to notify browsers when a remote agent goes offline
     *     agentUpdate     : (update:config_websocket_agentUpdate) => void;                        // Processes agent data received on socket establishment
     *     clientList: {
     *         browser   : socketList;
     *         device    : socketList;
     *         testRemote: websocket_client;
     *         user      : socketList;
     *     };                                                                                      // A store of open sockets by agent type.
     *     clientReceiver  : websocket_messageHandler;                                             // Processes data from regular agent websocket tunnels into JSON for processing by receiver library.
     *     createSocket    : (config:config_websocket_create) => void;                             // Creates a new socket for use by openAgent and openService methods.
     *     ipAttempts: {
     *         device: {
     *             [key:string]: string[];
     *         };
     *         user: {
     *             [key:string]: string[];
     *         };
     *     };                                                                                      // stores connection attempts as a list of ip addresses by agent hash
     *     listener        : (socket:websocket_client) => void;                                    // A handler attached to each socket to listen for incoming messages.
     *     open: {
     *         agent:   (config:config_websocket_openAgent) => void;   // Opens a long-term socket tunnel between known agents.
     *         service: (config:config_websocket_openService) => void; // Opens a service specific tunnel that ends when the service completes.
     *     };                                                                                      // methods to open sockets according to different security contexts
     *     queue           : (body:Buffer|socketData, socket:socketClient, opcode:number) => void; // Pushes outbound data into a managed queue to ensure data frames are not intermixed.
     *     queueSend       : (socket:websocket_client) => void;                                    // Pushes messages stored from the agent's offline queue into the transmission queue.
     *     server          : (config:config_websocket_server) => Server;                           // Creates a websocket server.
     *     socketExtensions: (config:config_websocket_extensions) => void;                         // applies application specific extensions to sockets
     *     status          : () => websocket_status;                                               // Gather the status of agent web sockets.
     * }
     * ``` */
    interface module_transmit_ws {
        agentClose: (socket:websocket_client) => void;
        agentUpdate: (update:config_websocket_agentUpdate) => void;
        clientList: {
            browser: websocket_list;
            device: websocket_list;
            testRemote: websocket_client;
            user: websocket_list;
        };
        clientReceiver: websocket_messageHandler;
        createSocket: (config:config_websocket_create) => void;
        ipAttempts: {
            device: {
                [key:string]: string[];
            };
            user: {
                [key:string]: string[];
            };
        };
        listener: (socket:websocket_client) => void;
        open: {
            agent: (config:config_websocket_openAgent) => void;
            service: (config:config_websocket_openService) => void;
        };
        queue: (body:Buffer|socketData, socket:websocket_client, opcode:number) => void;
        queueSend: (socket:websocket_client) => void;
        server: (config:config_websocket_server) => Server;
        socketExtensions: (config:config_websocket_extensions) => void;
        status: () => websocket_status;
    }
}