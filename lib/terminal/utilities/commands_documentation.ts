
/* lib/terminal/utilities/commands_documentation - A data structure defining command documentation with usage examples. */

// cspell:words setcap
import vars from "./vars.js";

const commands_documentation = function terminal_utility_commandsDocumentation(command:string):documentation_command {
    return {
        agent_data: {
            description: "Lists agent data.",
            example: [
                {
                    code: `${command}agent_data`,
                    defined: "Lists all agent data."
                },
                {
                    code: `${command}agent_data device`,
                    defined: "Lists all device type agent data."
                },
                {
                    code: `${command}agent_data user`,
                    defined: "Lists all user type agent data."
                },
                {
                    code: `${command}agent_data "desktop computer"`,
                    defined: "Lists any agent whose names contain the search string"
                },
                {
                    code: `${command}agent_data "16f07e8ed7225f07912da48e0d51308e8fbf9dafc89d8accaa58abc1da8a2832a046082bfc2534eb4933a00bd673019cb90437c8a94cc0d0adaf9cff40c5083b"`,
                    defined: "Outputs data for the matching hash string, if any.  The hash must be composed of 128 characters only composed of only 0-9 and lower case a-f."
                }
            ]
        },
        agent_online: {
            description: "Allows testing connectivity to remote agents.  Think of this as an alternative to ping where specified port, address, and protocol are tested for the agents specified.",
            example: [
                {
                    code: `${command}agent_online a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e`,
                    defined: "This will test a connection to the specified agent."
                },
                {
                    code: `${command}agent_online list`,
                    defined: "Specifying the parameter 'list' will output a list of all agent hashes, names, and IP addresses by agent type."
                },
                {
                    code: `${command}agent_online device`,
                    defined: "An argument of 'device' will test connectivity on each device agent."
                },
                {
                    code: `${command}agent_online user`,
                    defined: "An argument of 'user' will test connectivity on each user agent."
                },
                {
                    code: `${command}agent_online all`,
                    defined: "An argument of 'all' will run connectivity tests on all stored agents."
                }
            ]
        },
        base64: {
            description: "Convert a file or string into a base64 encoding.",
            example: [
                {
                    code: `${command}base64 encode string:"my string to encode"`,
                    defined: "Converts the provided string into a base64 encoding."
                },
                {
                    code: `${command}base64 encode path/to/file`,
                    defined: "Converts the provided file into a base64 encoding."
                },
                {
                    code: `${command}base64 encode http://file.from.internet.com`,
                    defined: "Reads a file from a URI and outputs a base64 encoding."
                },
                {
                    code: `${command}base64 decode string:"a big base64 string"`,
                    defined: "Decodes base64 strings into decoded output."
                }
            ]
        },
        build: {
            description: "Rebuilds the application.",
            example: [
                {
                    code: `${command}build`,
                    defined: "Compiles from TypeScript into JavaScript and puts libraries together."
                },
                {
                    code: `${command}build force_certificate`,
                    defined: "Creates and installs new certificates even if already installed."
                },
                {
                    code: `${command}build force_port`,
                    defined: "Forces execution of the setcap utility in Linux to allow executing services on reserved ports."
                },
                {
                    code: `${command}build force_port type_validate`,
                    defined: "Forces TypeScript type validation as part of the build process immediately prior to the compile step."
                }
            ]
        },
        certificate: {
            description: "Creates an HTTPS certificate and saves it in the local \"certificate\" directory.",
            example: [
                {
                    code: `${command}certificate location:"/file/path/to/save"`,
                    defined: "By default three certificates and corresponding keys are created: root, intermediate, and server certificates. Provide a file system path of where to save certificates. If no path is provided no certificates will be written."
                },
                {
                    code: `${command}certificate location:"/file/path/to/save" self-sign`,
                    defined: "The \"self-signed\" argument instead creates a self-signed root certificate without creating the intermediate or server certificates."
                },
                {
                    code: `${command}certificate location:"/file/path/to/save" days:365`,
                    defined: "Specify the number of days until the certificate expires. The value must be an integer. The default value is 16384."
                },
                {
                    code: `${command}certificate location:"/file/path/to/save" intermediate-fileName:"certificate"`,
                    defined: "The file name of the intermediate certificate and supporting files. The default value is \"share-file-ca\" if no name is provided. Do not provide a file extension in the file name value. An intermediate certificate can sign other certificates but is not self-signed."
                },
                {
                    code: `${command}certificate location:"/file/path/to/save" intermediate-domain:"my-domain"`,
                    defined: "Specify a certificate domain. This is optional in create mode and defaults to \"share-file-ca\". This argument is required in remove mode on Windows as only certificates with a matching domain will be removed."
                },
                {
                    code: `${command}certificate location:"/file/path/to/save" organization:"my-domain"`,
                    defined: "Specify a certificate org value by providing an argument beginning 'organization:'. This is optional in create mode and defaults to \"share-file\". This argument is required in remove mode on Windows as certificates with a matching org value will be removed."
                },
                {
                    code: `${command}certificate location:"/file/path/to/save" root-fileName:"certificate"`,
                    defined: "The file name of the self signed authority certificate and supporting files. The default value is \"share-file-root\" if no name is provided. Do not provide a file extension in the file name value. This is not used on self signed certificate mode."
                },
                {
                    code: `${command}certificate location:"/file/path/to/save" root-domain:"my-domain"`,
                    defined: "Specify a self-signed root certificate authority domain. This is optional and defaults to \"share-file-root\". This argument is ignored for certificates in self sign mode or if mode is remove."
                },
                {
                    code: `${command}certificate location:"/file/path/to/save" server-fileName:"certificate"`,
                    defined: "The file name of a signed certificate and supporting files that cannot sign other certificates. The default value is \"share-file\" if no name is provided. Do not provide a file extension in the file name value."
                },
                {
                    code: `${command}certificate location:"/file/path/to/save" server-domain:"my-domain"`,
                    defined: "Specify a certificate domain. This is optional in create mode and defaults to \"share-file\". This argument is required in remove mode on Windows as only certificates with a matching domain will be removed."
                }
            ]
        },
        commands: {
            description: "List all supported commands to the console or examples of a specific command.",
            example: [
                {
                    code: `${command}commands`,
                    defined: "Lists all commands and their definitions to the shell."
                },
                {
                    code: `${command}commands directory`,
                    defined: "Details the mentioned command with examples, which in this case is the 'directory' command."
                },
                {
                    code: `${command}commands all`,
                    defined: "Specifying 'all' will output verbose documentation and code examples for all supported commands."
                }
            ]
        },
        copy: {
            description: "Copy files or directories from one location to another on the local file system.",
            example: [
                {
                    code: `${command}copy source/file/or/directory destination/path`,
                    defined: "Copies the file system artifact at the first address to the second address."
                },
                {
                    code: `${command}copy "C:\\Program Files" destination\\path`,
                    defined: "Quote values that contain non-alphanumeric characters."
                },
                {
                    code: `${command}copy source/file/or/directory destination/path replace`,
                    defined: "The \"replace\" argument tells the copy command to overwrite any files of the same name at the destination location. If this argument is absent files are renamed to prevent a collision."
                },
                {
                    code: `${command}copy source destination ignore [build, .git, node_modules]`,
                    defined: "Exclusions are permitted as a comma separated list in square brackets following the ignore keyword."
                },
                {
                    code: `${command}copy source destination ignore[build, .git, node_modules]`,
                    defined: "A space between the 'ignore' keyword and the opening square brace is optional."
                },
                {
                    code: `${command}copy ../sparser ../sparserXX ignore [build, .git, node_modules]`,
                    defined: "Exclusions are relative to the source directory."
                }
            ]
        },
        directory: {
            description: "Traverses a directory in the local file system and generates a list.  If a source is not provided the current working directory is used.",
            example: [
                {
                    code: `${command}directory source:"my/directory/path"`,
                    defined: "Returns an array where each index is an array of [absolute path, type, parent index, file count, stat]. Type can refer to 'file', 'directory', or 'link' for symbolic links.  The parent index identify which index in the array is the objects containing directory and the file count is the number of objects a directory type object contains."
                },
                {
                    code: `${command}directory source:"my/directory/path" depth:9`,
                    defined: "The depth of child directories to traverse. The default value of 0 applies full recursion."
                },
                {
                    code: `${command}directory source:"my/directory/path" symbolic`,
                    defined: "Identifies symbolic links instead of the object the links point to"
                },
                {
                    code: `${command}directory source:"my/directory/path" ignore [.git, node_modules, "program files"]`,
                    defined: "Sets an exclusion list of things to ignore."
                },
                {
                    code: `${command}directory source:"my/path" typeof`,
                    defined: "Returns a string describing the artifact type."
                },
                {
                    code: `${command}directory source:"my/directory/path" mode:"array"`,
                    defined: "Returns an array of strings where each index is an absolute path."
                },
                {
                    code: `${command}directory source:"my/path" mode:"hash"`,
                    defined: "Includes a SHA512 hash in the output for each file system object of type 'file'."
                },
                {
                    code: `${command}directory source:"my/directory/path" mode:"list"`,
                    defined: "Writes a list of file system artifacts, one per line, to the shell."
                },
                {
                    code: `${command}directory source:"my/directory/path" search:"any string"`,
                    defined: "Returns results in the default format, but only containing artifacts containing the search token. If the 'search' argument is not provided the search function will not be applied."
                },
                {
                    code: `${command}directory source:"my/directory/path" relative`,
                    defined: "The relative argument provide relative paths from the source path instead of absolute paths."
                },
                {
                    code: `${command}directory source:"my/directory/path" sort:"file-system-type"`,
                    defined: "Sort the output according to a supported sorting convention. The argument must begin with 'sort:' followed by a support value that may or may not be quoted.  Supported values are: 'alphabetically-ascending', 'alphabetically-descending', 'file-extension', 'file-modified-ascending', 'file-modified-descending', 'file-system-type', 'size-ascending', 'size-descending'"
                }
            ]
        },
        firewall_windows: {
            description: "Opens the firewall for this application.  Currently only supporting Windows Defender Firewall.",
            example: [
                {
                    code: `${command}firewall`,
                    defined: "Adds necessary allowances to the firewall specific for this application."
                }
            ]
        },
        get: {
            description: "Retrieve a resource via an absolute URI.",
            example: [
                {
                    code: `${command}get http://example.com/file.txt`,
                    defined: "Gets a resource from the web and prints the output to the shell."
                },
                {
                    code: `${command}get http://example.com/file.txt path/to/file`,
                    defined: "Get a resource from the web and writes the resource as UTF8 to a file at the specified path."
                }
            ]
        },
        hash: {
            description: "Generate a SHA512 hash of a file or a string.",
            example: [
                {
                    code: `${command}hash path/to/file`,
                    defined: "Prints a SHA512 hash to the shell for the specified file's contents in the local file system."
                },
                {
                    code: `${command}hash verbose path/to/file`,
                    defined: "Prints the hash with file path and version data."
                },
                {
                    code: `${command}hash string:"I love kittens."`,
                    defined: "Hash an arbitrary string directly from shell input."
                },
                {
                    code: `${command}hash https://prettydiff.com/`,
                    defined: "Hash a resource from the web."
                },
                {
                    code: `${command}hash path/to/directory`,
                    defined: "Directory hash recursively gathers all descendant artifacts and hashes the contents of each of those items that are files, hashes the paths of directories, sorts this list, and then hashes the list of hashes."
                },
                {
                    code: `${command}hash path/to/directory list`,
                    defined: "Returns a JSON string of an object where each file, in absolutely path, is a key name and its hash is the key's value."
                },
                {
                    code: `${command}hash file/system/path sha3-512`,
                    defined: "The algorithm argument allows a choice of hashing algorithm. Supported values: 'blake2d512', 'blake2s256', 'sha3-224', 'sha3-256', 'sha3-384', 'sha3-512', 'sha384', 'sha512', 'sha512-224', 'sha512-256', 'shake128', 'shake256'"
                },
                {
                    code: `${command}hash file/system/path base64`,
                    defined: "By default hash values are generated as strings in hexadecimal notation, but some operations may require base64 strings. Supported values: 'base64', 'hex'"
                }
            ]
        },
        lint: {
            description: "Use ESLint against all JavaScript files in a specified directory tree.",
            example: [
                {
                    code: `${command}lint ../tools`,
                    defined: "Lints all the JavaScript files in that location and in its subdirectories."
                },
                {
                    code: `${command}lint`,
                    defined: `Specifying no location defaults to the ${vars.environment.name} application directory.`
                },
                {
                    code: `${command}lint ../tools ignore [node_modules, .git, test, units]`,
                    defined: "An ignore list is also accepted if there is a list wrapped in square braces following the word 'ignore'."
                }
            ]
        },
        mkdir: {
            description: "Recursively creates a directory structure.  For example if 'my/new/path` were to be created but parent 'my' doesn't exist this command will create all three directories, but it will not alter or overwrite any artifacts already present. Relative paths are relative to the terminal's current working directory.",
            example: [{
                code: `${command}mkdir my/path/to/create`,
                defined: "This example would create directories as necessary to ensure the directory structure 'my/path/to/create' is available from the location relative to the terminal's current working directory."
            }]
        },
        perf: {
            description: "Measure performance aspects of the application.",
            example: [
                {
                    code: `${command}perf`,
                    defined: "Starts the performance tool against the default scenario, socket, which measures socket message speed."
                },
                {
                    code: `${command}perf 300000`,
                    defined: "A numeric argument specifies the quantity of events to execute."
                },
                {
                    code: `${command}perf insecure`,
                    defined: "By default the perf command assumes secure protocols (HTTPS and WSS) but supplying the 'insecure' argument will allow use of insecure protocols (HTTP and WS)."
                },
                {
                    code: `${command}perf socket`,
                    defined: "Other argument values are interpreted as the type of performance test to run.  Currently the only supported performance test type is 'socket'."
                }
            ]
        },
        remove_files: {
            description: "Remove a file or directory tree from the local file system.",
            example: [
                {
                    code: `${command}remove path/to/resource`,
                    defined: "Removes the specified resource."
                },
                {
                    code: `${command}remove "C:\\Program Files"`,
                    defined: "Quote the path if it contains non-alphanumeric characters."
                }
            ]
        },
        service: {
            description: "Launches a localhost HTTP service and web sockets so that the web tool is automatically refreshed once code changes in the local file system.",
            example: [
                {
                    code: `${command}service`,
                    defined: `Launches the service on default port. Default secure port is ${vars.network.port_default.secure}. Default unsecure port is ${vars.network.port_default.unsecure}.`
                },
                {
                    code: `${command}service 8080`,
                    defined: "If a numeric argument is supplied the web service starts on the port specified and web sockets on the following port."
                },
                {
                    code: `${command}service 0`,
                    defined: "To receive a random available port specify port number 0."
                },
                {
                    code: `${command}service browser`,
                    defined: "The 'browser' argument launches the default location in the user's default web browser."
                },
                {
                    code: `${command}service test`,
                    defined: "The 'test' argument tells the service to use data from a separate settings location for running tests instead of the user's actual data."
                },
                {
                    code: `${command}service test browser 9000`,
                    defined: "An example with multiple supported arguments.  The supported arguments may occur in any order."
                },
                {
                    code: `${command}service ip:192.168.1.125`,
                    defined: "An argument that begins with 'ip:' forces use of the specified IP address.  Any string passed as an address will be attempted as a service hostname, but will error if not a locally available IP address."
                },
                {
                    code: `${command}service insecure`,
                    defined: "The 'insecure' argument forces the service to use insecure protocols: HTTP and WS, as opposed secure alternatives: HTTPS and WSS.  Insecure mode is available for local testing but will not allow communication to remote agents."
                },
                {
                    code: `${command}service firewall`,
                    defined: "The firewall argument updates the firewall settings specific to this application.  Currently the firewall utility only supports Windows Defender Firewall."
                }
            ]
        },
        test: {
            description: "Builds the application and then runs all the test commands",
            example: [
                {
                    code: `${command}test`,
                    defined: "Runs all the tests in the test suite."
                }
            ]
        },
        test_browser: {
            description: "Launches the 'service' command as a child process, launches the default browser to execute DOM instructions as intervals of test automation, and then closes the browser upon completion.",
            example: [
                {
                    code: `${command}test_browser`,
                    defined: "Runs the browser interaction tests. If not test suite is specified by name all test lists will be executed. Every test list, aside from 'self' requires 4 other computers executing in mode 'remote'."
                },
                {
                    code: `${command}test_browser no_close`,
                    defined: "Disables the 'window.close()' command at the end of test instructions so that the browser remains open for manual inspection."
                },
                {
                    code: `${command}test_browser demo`,
                    defined: "Same as the 'no_close' argument but also imposes a half second delay between actions so that a person can watch the interactions."
                },
                {
                    code: `${command}test_browser self`,
                    defined: "The argument 'self' executes tests from the ./lib/terminal/test/samples/browser_self.ts test list. These tests only execute on this local device and do not make use of other computers.",
                },
                {
                    code: `${command}test_browser delete`,
                    defined: "The argument 'delete' executes tests from the ./lib/terminal/test/samples/browser_delete.ts test list. This mode requires 4 other computers executing in mode 'remote'.",
                },
                {
                    code: `${command}test_browser device`,
                    defined: "The argument 'device' executes tests from the ./lib/terminal/test/samples/browser_device.ts test list. This mode requires 4 other computers executing in mode 'remote'."
                },
                {
                    code: `${command}test_browser user`,
                    defined: "The argument 'user' executes tests from the ./lib/terminal/test/samples/browser_user.ts test list. This mode requires 4 other computers executing in mode 'remote'."
                },
                {
                    code: `${command}test_browser remote`,
                    defined: "The argument 'remote' puts a computer into listening mode awaiting instructions from a computer executing agent type tests. Computers in this mode will not exit the service automatically."
                },
                {
                    code: `${command}test_browser "C:\\Program Files\\Mozilla Firefox\\firefox.exe" no_close`,
                    defined: "By default tests only execute against the default browser.  To test against other locally installed browsers simply provide the absolute path to the browser binary."
                }
            ]
        },
        test_service: {
            description: "Launches the 'service' command as a child process to issue HTTP requests against it and test the results",
            example: [
                {
                    code: `${command}test_service`,
                    defined: "Runs tests service utility."
                },
                {
                    code: `${command}test_service fs-copy`,
                    defined: "Filter the tests to run by supplying a text fragment to filter against test names.  For example if there are 6 service tests whose names contain that string then only those 6 tests will be evaluated."
                },
                {
                    code: `${command}test_service "Copy from Remote Device to different Remote Device"`,
                    defined: "Using quotes the filter argument may contain spaces and other non-alpha characters."
                }
            ]
        },
        test_simulation: {
            description: "Launches a test runner to execute the various commands of the services file.",
            example: [
                {
                    code: `${command}test_simulation`,
                    defined: "Runs tests against the commands offered by the services file."
                },
                {
                    code: `${command}test_simulation help`,
                    defined: "Filter the tests to run by supplying a text fragment to filter against test names.  For example if there are 6 service tests whose names contain that string then only those 6 tests will be evaluated."
                },
                {
                    code: `${command}test_simulation "hash ~/share-file-systems list ignore ['node_modules'"`,
                    defined: "Using quotes the filter argument may contain spaces and other non-alpha characters."
                }
            ]
        },
        typescript: {
            description: "Performs TypeScript type checks without writing compiled output.",
            example: [
                {
                    code: `${command}type`,
                    defined: "Executes TypeScript type evaluation.  Equivalent to `npx tsc --pretty`."
                }
            ]
        },
        update: {
            description: "Pulls code from the git repository of the current git remote and branch, rebuilds the application, then executes a command. The child command will always execute from the project's absolute directory.",
            example: [
                {
                    code: `${command}update`,
                    defined: `If no additional arguments are provided the child command to execute will be: ${command}service`
                },
                {
                    code: `${command}update test_browser`,
                    defined: `The child command will be: ${command}test_browser`
                },
                {
                    code: `${command}update lint ../tools ignore [node_modules, .git, test, units]`,
                    defined: `All arguments are passed into the child command equivalent to: ${command}lint ../tools ignore [node_modules, .git, test, units]`
                }
            ]
        },
        version: {
            description: "Prints the current version number and date of prior modification to the console.",
            example: [{
                code: `${command}version`,
                defined: "Prints the current version number and date to the shell."
            }]
        },
        websocket: {
            description: "Launches a localhost web socket server.",
            example: [
                {
                    code: `${command}websocket`,
                    defined: "Launches a websocket server on a random port."
                },
                {
                    code: `${command}websocket 8080`,
                    defined: "If a numeric argument is supplied the server starts on the port specified."
                },
                {
                    code: `${command}websocket 0`,
                    defined: "To force a random available port specify port number 0."
                },
                {
                    code: `${command}websocket ip:192.168.1.125`,
                    defined: "An argument that begins with 'ip:' forces use of the specified IP address.  Any string passed as an address will be attempted as a service hostname, but will error if not a locally available IP address."
                },
                {
                    code: `${command}websocket secure`,
                    defined: "The 'secure' argument forces the server to use secure protocol WSS.  If both 'secure' and 'insecure' arguments are supplied 'secure' takes precedence.  A secure server requires that a certificate in PEM format with file extension 'crt' be saved in 'lib/certificate' directory under this project along with its corresponding key file."
                },
                {
                    code: `${command}websocket insecure`,
                    defined: "The 'insecure' argument forces the server to use insecure protocol WS.  If both 'secure' and 'insecure' arguments are supplied 'secure' takes precedence."
                }
            ]
        }
    };
};

export default commands_documentation;