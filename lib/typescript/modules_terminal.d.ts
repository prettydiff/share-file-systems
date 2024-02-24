/* lib/typescript/modules_terminal.d - TypeScript interfaces that define master library modules used in the terminal. */
// cspell:words brotli

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
 *     agent_data      : commandInterface; // Lists stored data on one more agents.
 *     base64          : commandInterface; // Generates a base64 string output from a file system artifact or string input.
 *     build           : commandInterface; // Executes the tasks included in the commands/build.ts file which includes documentation automation and compiling from TypeScript.
 *     certificate     : commandInterface; // Generates an HTTPS certificate.
 *     commands        : commandInterface; // Displays interactive documentation on the terminal about available commands.
 *     copy            : commandInterface; // Duplications a file system artifact from one location to another.
 *     directory       : commandInterface; // Walks the file system to build out a representational data structure.
 *     firewall_windows: commandInterface; // Allows necessary allowances through the firewall specific to this application.
 *     hash            : commandInterface; // Generates a hash sequence using OpenSSH for file system artifacts or string input.
 *     lint            : commandInterface; // Runs ESLint with this application's configuration against any location on the local device.
 *     mkdir           : commandInterface; // Creates a new directory.
 *     perf            : commandInterface; // Allows performance testing of the application.
 *     remove_files    : commandInterface; // Removes a file system artifact.
 *     service         : commandInterface; // Primary command to run this application by creating a web server and web socket server.
 *     test            : commandInterface; // Runs all test tasks as defined in the commands/build.ts file.
 *     test_browser    : commandInterface; // Executes browser test automation.
 *     test_service    : commandInterface; // Executes test automation of type *service*.
 *     test_simulation : commandInterface; // Executes test automation of type *simulation*.
 *     typescript      : commandInterface; // Performs TypeScript type checks.
 *     update          : () => void;                         // Pulls code updates from git and builds
 *     version         : commandInterface; // Displays version information for this application.
 *     websocket       : commandInterface; // Launches a web socket server.
 * }
 * ``` */
interface module_commandList {
    agent_data: commandInterface;
    base64: commandInterface;
    build: commandInterface;
    certificate: commandInterface;
    commands: commandInterface;
    copy: commandInterface;
    directory: commandInterface;
    firewall_windows: commandInterface;
    hash: commandInterface;
    lint: commandInterface;
    mkdir: commandInterface;
    perf: commandInterface;
    remove_files: commandInterface;
    service: commandInterface;
    test: commandInterface;
    test_browser: commandInterface;
    test_service: commandInterface;
    test_simulation: commandInterface;
    typescript: commandInterface;
    update:() => void;
    version: commandInterface;
    websocket: commandInterface;
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
 *         error      : (error:node_error, agentRequest:fileAgent, agentSource:fileAgent) => void; // packages error messaging for transport
 *         execute    : (data:service_fileSystem) => void; // Tells the operating system to execute the given file system artifact using the default application for the resolved file type.
 *         newArtifact: (data:service_fileSystem) => void; // Creates new empty directories or files.
 *         read       : (data:service_fileSystem) => void; // Opens a file and responds with the file contents as a UTF8 string.
 *         rename     : (data:service_fileSystem) => void; // Service handler to rename a file system artifact.
 *         write      : (data:service_fileSystem) => void; // Writes a string to a file.
 *     };
 *     menu: (data:service_fileSystem) => void; // Resolves actions from *service_fileSystem* to methods in this object's action property.
 *     route: (socketData:socketData) => void;  // Sends the data and destination to network.fileRoute method.
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
        error: (error:node_error, agentRequest:fileAgent, agentSource:fileAgent) => void;
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

interface module_http {
    get: (url:string, socket:websocket_client) => void;
    post: (body:string, socket:websocket_client) => void;
}

/**
 * Methods for processing the various stages of the invitation process.
 * The "invite-complete" step executes as the final step in the terminal at both ends of the transaction.
 * ```typescript
 * interface module_inviteActions {
 *     "invite-start"   : () => void; // Step 1: At local browser send invitation message to local terminal.
 *     "invite-request" : () => void; // Step 2: At local terminal forward invitation message to remote terminal.
 *     "invite-ask"     : () => void; // Step 3: At remote terminal send invitation message to remote browser.
 *     "invite-answer"  : () => void; // Step 4: At remote browser send invitation answer to remote terminal.
 *     "invite-response": () => void; // Step 5: At remote terminal send invitation answer to local terminal.
 *     "invite-complete": () => void; // Step 6: At local terminal send new agent data to local browser.
 *                                    // Step 8: At remote terminal apply new identifiers, send new agent data to remote browser, open necessary sockets.
 *     "invite-identity": () => void; // Step 7: At local terminal send device and identity data by agent type to remote terminal.
 * }
 * ```
 * ``` text
 *               Local               |              Remote
 * ----------------------------------|----------------------------------
 *                 start 1           |    request 2                ask 3
 * x >----------------> xx >>--------|-------->> xx >----------------> x
 * 6 complete            5 response  |            4 answer
 * x <----------------< xx <<--------|--------<< xx <----------------< x
 *                                   |   identity 7           complete 8
 *                      xx >>--------|-------->> xx >----------------> x
 * KEY
 * > - Movement in/out of browser
 * >> - Movement across a network
 * x - Browser instance
 * xx - Shell instance
 * ``` */
interface module_inviteActions {
    "invite-answer": () => void;
    "invite-ask": () => void;
    "invite-complete": () => void;
    "invite-identity": () => void;
    "invite-request": () => void;
    "invite-response": () => void;
    "invite-start": () => void;
}

/**
 * Methods to mask or unmask a device identity between users.
 * ```typescript
 * interface module_mask {
 *     fileAgent: (agent:fileAgent, callback:(key:string) => void) => void;                               // An abstraction layer specific for fileAgent data.
 *     mask: (input:string, identifier:string, callback:(key:string, identifier:string) => void) => void; // Converts a device identity into a new hash of 141 character length.
 *     resolve: (agent:fileAgent) => string;                                                              // Resolves a device identifier from a share for the current local user.
 *     unmaskDevice: (maskItem:string, callback:(device:string) => void) => void;                         // Compares a temporary 141 character device identity against owned devices to determine validity of share permissions.
 *     unmaskToken: (maskItem:string, token:string, callback:(test:boolean) => void) => void;             // Compares a 141 character masked hash against a string hashed from a date and submitted token.
 * }
 * ``` */
interface module_mask {
    fileAgent: (agent:fileAgent, callback:(key:string) => void) => void;
    mask: (input:string, identifier:string, callback:(key:string, identifier:string) => void) => void;
    resolve: (agent:fileAgent) => string;
    unmaskDevice: (maskItem:string, callback:(device:string) => void) => void;
    unmaskToken: (maskItem:string, token:string, callback:(test:boolean) => void) => void;
}

/**
 * Structure of methods for conducting performance tests.
 * ```typescript
 * interface module_perf {
 *     averages: (perfType:string) => void;         // outputs averages for the various test runs
 *     conclude: {                                  // outputs message for a given test index
 *         [key:string]: (data:socketData) => void;
 *     };
 *     frequency: number;                           // the number of action to complete in a given test index
 *     interval: {                                  // the task to execute in a given test index
 *         [key:string]: () => void;
 *     };
 *     preparation: {                               // any start up instructions to execute before measuring given test indexes
 *         [key:string]: () => void;
 *     };
 *     size: number;                                // the payload size of the thing exercised or measured
 *     socket: websocket_client;                    // holds a given socket dedicated for performance testing
 *     start: (config:config_perf_start, callback:(title:string, text:string[], fail:boolean) => void) => void;
 *     startTime: bigInt;                           // stores a high precision time number to measure against
 *     storage: number[][];                         // stores raw data per given test index
 * }
 * ``` */
interface module_perf {
    averages: (perfType:string) => void;
    conclude: {
        [key:string]: (data:socketData) => void;
    };
    frequency: number;
    interval: {
        [key:string]: () => void;
    };
    preparation: {
        [key:string]: () => void;
    };
    size: number;
    socket: websocket_client;
    start: (config:config_perf_start, callback:(title:string, text:string[], fail:boolean) => void) => void;
    startTime: bigint;
    storage: number[][];
}

/**
 * A library to relay terminal logging between devices for presentation to the user in the browser.
 * ```typescript
 * interface module_terminal {
 *     input: (socketData:socketData) => void;
 *     kill: (id:string) => void;
 *     output: (data:service_terminal) => void;
 *     processes: {
 *         [key:string]: ChildProcess;
 *     };
 * }
 * ``` */
interface module_terminal {
    input: (socketData:socketData) => void;
    kill: (id:string) => void;
    output: (data:service_terminal) => void;
    processes: {
        [key:string]: node_childProcess_ChildProcess;
    };
}

/**
 * The global environmental variable available to all tasks, services,  and commands executed from the terminal.
 * ```typescript
 * interface module_terminalVariables {
 *     agents: agentData; // agent storage
 *     environment: {
 *         command     : commands;              // command name currently executing the application
 *         date        : string;                // dynamically populated static value of date of prior version change
 *         dateRaw     : number;                // raw numeric version of date or prior change
 *         domain      : string[];              // supported domains that resolves to a localhost IP
 *         git_hash    : string;                // dynamically populated static value of hash from prior git commit at latest build
 *         log         : string[]               // a storage of console.log items
 *         module_type : "commonjs" | "module"  // the type of module system the application is currently using
 *         name        : string;                // a static name of the application
 *         startTime   : bigint;                // nanosecond precision time the application starts for measuring execution performance
 *         version     : string;                // dynamically populated static value of application version number string
 *     };
 *     identity: identity;
 *     network: {
 *         addresses   : transmit_addresses_IP;          // ip addresses available to this device
 *         count       : terminalVariables_networkCount; // a count of network transmissions by protocol type and send/receive
 *         domain      : string[];                       // supported domains that resolves to a localhost IP
 *         port        : number;                         // the port number running the service
 *         port_default: port_default;                   // desired port to use if a port is not specified.
 *         size        : terminalVariables_networkCount; // a count of data size transmitted by protocol type and send/receive
 *     };
 *     path: {
 *         js      : string; // file system path of the compiled JavaScript (`${vars.projectPath}lib${vars.sep}js`)
 *         node    : string; // path to the node binary running this application
 *         project : string; // absolute file system path of this application
 *         sep     : string; // file system separator character
 *         settings: string; // location where configuration files are read from and written to
 *     };
 *     settings: terminalVariables_settings;
 *     terminal: {
 *         arguments          : string;               // a list of all terminal arguments before this list is modified, only used in error reporting
 *         command_instruction: string;               // terminal command that executes this application from a terminal, such as "node js/lib/terminal/utilities/terminal "
 *         commands           : commandDocumentation; // interactive terminal command documentation
 *         cwd                : string;               // current working directory from the perspective of the TypeScript libraries (`${vars.projectPath}lib`)
 *         exclusions         : string[];             // a file system exclusion list provided by the user from terminal arguments
 *         executionKeyword   : string;               // an OS specific keyword to execute an application by name from the terminal
 *         tempCount          : number;               // counts the number of temp files written by the settings utility before being renamed
 *     };
 *     test: {
 *         browser: service_testBrowser;                        // current test_browser object when running test automation in the browser
 *         flags: {
 *             error: boolean;
 *             write: string;
 *         };                                                   // properties used by service and simulation tests so that error message is identified independent of other test execution
 *         socket : node_http_ServerResponse | node_net_Socket; // holds a socket for service tests
 *         type   : test_listType;                              // type of test automation running in the application
 *     };
 *     text: stringStore;                 // ANSI text formatting for terminal output
 * }
 * type activityStatus = "" | "active" | "deleted" | "idle" | "offline";
 * type brotli = 0|1|2|3|4|5|6|7|8|9|10|11;
 * type commands = "agent_data" | "agent_online" | "base64" | "build" | "certificate" | "commands" | "copy" | "directory" | "get" | "hash" | "lint" | "mkdir" | "remove" | "service" | "test_browser" | "test_service" | "test_simulation" | "test" | "update" | "version | websocket";
 * type hash = "blake2d512" | "blake2s256" | "sha1" | "sha3-224" | "sha3-256" | "sha3-384" | "sha3-512" | "sha384" | "sha512-224" | "sha512-256" | "sha512" | "shake128" | "shake256";
 * type test_listType = "" | "browser_delete" | "browser_device" | "browser_remote" | "browser_self" | "browser_user" | "service" | "simulation";
 * ``` */
interface module_terminalVariables {
    agents: agentData;
    environment: {
        command     : commands;
        date        : string;
        dateRaw     : number;
        git_hash    : string;
        log         : string[];
        module_type : "commonjs" | "module";
        name        : string;
        startTime   : bigint;
        version     : string;
    };
    identity: identity;
    network: {
        addresses   : transmit_addresses_IP;
        count       : terminalVariables_networkCount;
        domain      : string[];
        port        : number;
        port_default: port_default;
        size        : terminalVariables_networkCount;
    };
    path: {
        js         : string;
        node       : string;
        project    : string;
        sep        : string;
        settings   : string;
        testStorage:string;
    };
    settings: terminalVariables_settings;
    terminal: {
        arguments          : string;
        command_instruction: string;
        commands           : documentation_command;
        cwd                : string;
        exclusions         : string[];
        executionKeyword   : string;
        tempCount          : number;
    };
    test: {
        browser: service_testBrowser;
        flags: {
            error: boolean;
            write: string;
        };
        socket : node_http_ServerResponse | node_net_Socket;
        type   : test_listType;
    };
    text: stringStore;
}

/**
 * Methods associated with the browser test automation logic.
 * ```typescript
 * interface module_test_browserApplication {
 *     all_order  : test_browserMode[];         // The order in which test suites should be executed in the case of running all test suites.
 *     args       : config_test_browserExecute; // Default configuration object available to the entire test browser library. Over written by a configuration object of same type passed into the *methods.execute* method.
 *     exitMessage: string;                     // Stores an exit message string for availability to the entirety of the test browser application because this messaging is generated by one method and distributed by another.
 *     exitSummary: () => string[];             // Generates messaging, including browser.exitMessage, summarizing executing data associated with test operations on the given device.
 *     fail       : boolean;                    // Stores the pass/fail status for messaging to the callback.
 *     index      : number;                     // Stores the current test item index number.
 *     ip         : string;                     // Stores the IP address of the target machine for the current test index.
 *     methods: {
 *         close           : (data:service_testBrowser) => void;        // Sends a single that tests are complete and the respective browser window should close on the local device.
 *         delay           : (config:config_test_browserDelay) => void; // Provides a single point of logic to handle delays regardless of the cause, duration, or associated messaging.
 *         execute         : (args:config_test_browserExecute) => void; // Entry point to browser test automation that prepares the environment on the local device and tells the remote machines to reset their environments.
 *         exit            : (data:service_testBrowser) => void;        // Closes out testing on the local device and informs remote machines that testing has concluded with the corresponding messaging and a single to close their respective browser window.
 *         iterate         : (index:number) => void;                    // Validates the next browser test is properly formed and then either sends it to a browser on the local device or to the correct machine.
 *         reset           : () => void;                                // Sends a reset request to remote machines informing them to reset their environment and prepare to listen for incoming test items. Method executed from *methods.execute*.
 *         "reset-complete": (item:service_testBrowser) => void;        // Determines if the test environment is ready both locally and with remote agents.
 *         result          : (item:service_testBrowser) => void;        // Evaluation result provided by a browser and transforms that data into messaging for a human to read.
 *         route           : (socketData:socketData) => void;           // Entry point to the browser test automation library on all remote machines. Tasks are routed to the correct method based upon the action specified.
 *         send            : (testItem:service_testBrowser) => void;    // Encapsulates the transmission logic to send tests to the local browser.
 *         sendAction      : (action:test_browserAction, machine:string, exitMessage?:string) => void; // a convenience method to send arbitrary test actions to/from remotes.
 *     };
 *     name        : string; // indicates identity of the local machine
 *     port        : number; // Stores the port number of the target machine for the current test index.
 *     remote: {
 *         count: number;
 *         total: number;
 *     };                    // Counts the number of remote agents ready to receive tests.
 *     suites: {
 *         [key:string]: test_browserItem[];
 *     };                    // All the test lists.
 * }
 * ``` */
interface module_test_browserApplication {
    all_order: test_browserMode[];
    args: config_test_browserExecute;
    exitMessage: string;
    exitSummary: () => string[];
    fail: boolean;
    index: number;
    ip: string;
    methods: {
        close: (data:service_testBrowser) => void;
        delay: (config:config_test_browserDelay) => void;
        execute: (args:config_test_browserExecute) => void;
        exit: (data:service_testBrowser) => void;
        iterate: (index:number) => void;
        reset: () => void;
        "reset-complete": (item:service_testBrowser) => void;
        result: (item:service_testBrowser) => void;
        route: (socketData:socketData) => void;
        send: (testItem:service_testBrowser) => void;
        sendAction: (action:test_browserAction, machine:string, exitMessage?:string) => void;
    };
    name: string;
    port: number;
    remote: {
        count: number;
        total: number;
    };
    suites: {
        [key:string]: test_browserItem[];
    };
}

/**
 * The *service* test type application described as an object.
 * ```typescript
 * interface module_test_serviceApplication {
 *     addServers: (callback:() => void) => void;     // Starts listeners on random ports simulating various connecting agents.
 *     agents: {
 *         device: {
 *             [key:string]: node_net_Server;
 *         };
 *         user: {
 *             [key:string]: node_net_Server;
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
            [key:string]: node_net_Server;
        };
        user: {
            [key:string]: node_net_Server;
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
 *     get         : (request:node_http_IncomingMessage, serverResponse:httpSocket_response) => void;      // Respond to HTTP GET requests.
 *     receive     : (request:node_http_IncomingMessage, serverResponse:node_http_ServerResponse) => void; // Processes incoming HTTP requests.
 *     request     : (config:config_http_request) => void;                                                 // Send an arbitrary HTTP request.
 *     respond     : (config:config_http_respond, get:boolean, url:string) => void;                        // Formats and sends HTTP response messages.
 *     respondEmpty: (transmit:transmit_type)                                                              // Responds to a request with an empty response payload.
 *     server      : (serverOptions:config_service, serverCallback:service_callback) => void;              // Creates an HTTP server.
 * }
 * ``` */
interface module_transmit_http {
    get: (request:node_http_IncomingMessage, serverResponse:httpSocket_response) => void;
    receive: (request:node_http_IncomingMessage, serverResponse:node_http_ServerResponse) => void;
    request: (config:config_http_request) => void;
    respond: (config:config_http_respond, get:boolean, url:string) => void;
    respondEmpty: (transmit:transmit_type) => void;
    server: (serverOptions:config_service, serverCallback:service_callback) => void;
}

/**
 * A collection of transmission tools for use with either HTTP or WS.
 * ```typescript
 * interface module_transmit_network {
 *     fileRoute: (destination:agentCopy, socketData:socketData, callback:(socketData:socketData) => void) => void; // Automation to redirect data packages to a specific agent examination of a service identifier and agent data.
 *     logger   : (config:config_transmit_logger) => void;                  // logs data about incoming and outgoing messages
 *     receiver : (socketData:socketData, transmit:transmit_type) => void;  // function for handling all traffic related to incoming messages.
 *     responder: (socketData:socketData, transmit:transmit_type) => void;  // function for generating generalized HTTP responses
 *     send     : (data:socketData, agents:transmit_agents|string) => void; // Send a specified data package to a specified agent
 * }
 * ``` */
interface module_transmit_network {
    fileRoute: (config:config_fileRoute) => void;
    logger: (config:config_transmit_logger) => void;
    receiver: (socketData:socketData, transmit:transmit_type) => void;
    responder: (socketData:socketData, transmit:transmit_type) => void;
    send: (data:socketData, agents:transmit_agents|string) => void;
}

/**
 * The websocket library
 * ```typescript
 * interface transmit_ws {
 *     agentClose      : (socket:websocket_client) => void;                                     // A uniform way to notify browsers when a remote agent goes offline
 *     clientReceiver  : websocket_messageHandler;                                              // Processes data from regular agent websocket tunnels into JSON for processing by receiver library.
 *     createSocket    : (config:config_websocket_create) => void;                              // Creates a new socket for use by openAgent and openService methods.
 *     getSocket: (type:string, name:string) => websocket_client;                               // safely returns a socket from the store
 *     getSocketList: (type:string) => websocket_client[];                                      // safely returns a list of sockets from the store by socket type
 *     ipAttempts      : {
 *         device: {
 *             [key:string]: string[];
 *         };
 *         user: {
 *             [key:string]: string[];
 *         };
 *     };                                                                                       // stores connection attempts as a list of ip addresses by agent hash
 *     listener        : (socket:websocket_client) => void;                                     // A handler attached to each socket to listen for incoming messages.
 *     open: {
 *         agent:   (config:config_websocket_openAgent) => void;   // Opens a long-term socket tunnel between known agents.
 *         service: (config:config_websocket_openService) => void; // Opens a service specific tunnel that ends when the service completes.
 *     };                                                                                       // methods to open sockets according to different security contexts
 *     queue           : (body:Buffer|socketData, socket:socketClient, opcode:number) => void;  // Pushes outbound data into a managed queue to ensure data frames are not intermixed.
 *     queueSend       : (socket:websocket_client) => void;                                     // Pushes messages stored from the agent's offline queue into the transmission queue.
 *     server          : (config:config_websocket_server) => node_net_Server;                   // Creates a websocket server.
 *     socketExtensions: (config:config_websocket_extensions) => void;                          // applies application specific extensions to sockets
 *     socketMap       : socketMap;                                                             // Stores open socket status information for all devices.
 *     socketMapUpdate : (socketData:socketData) => void;                                    // Receive socket status list updates from other devices.
 *     socketStore     : {
 *         [key:string]: websocket_list;
 *     };                                                                                       // A store of open sockets by agent type.
 * }
 * ``` */
interface module_transmit_ws {
    agentClose: (socket:websocket_client) => void;
    clientReceiver: websocket_messageHandler;
    createSocket: (config:config_websocket_create) => void;
    getSocket: (type:string, name:string) => websocket_client;
    getSocketList: (type:string) => websocket_client[];
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
    server: (config:config_websocket_server) => node_net_Server;
    socketExtensions: (config:config_websocket_extensions) => void;
    socketMap: socketMap;
    socketMapUpdate: (socketData:socketData) => void;
    socketStore: {
        [key:string]: websocket_list;
    };
}