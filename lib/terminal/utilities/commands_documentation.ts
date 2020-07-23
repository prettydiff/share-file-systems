
/* lib/terminal/utilities/commands_documentation - A data structure defining command documentation with usage examples. */
import vars from "./vars.js";

const commands_documentation = {
    agent_data: {
        description: "Lists agent data.",
        example: [
            {
                code: `${vars.version.command} agent_data`,
                defined: "Lists all agent data."
            },
            {
                code: `${vars.version.command} agent_data device`,
                defined: "Lists all device type agent data."
            },
            {
                code: `${vars.version.command} agent_data user`,
                defined: "Lists all user type agent data."
            },
            {
                code: `${vars.version.command} agent_data "desktop computer"`,
                defined: "Lists any agent whose names contain the search string"
            },
            {
                code: `${vars.version.command} agent_data "16f07e8ed7225f07912da48e0d51308e8fbf9dafc89d8accaa58abc1da8a2832a046082bfc2534eb4933a00bd673019cb90437c8a94cc0d0adaf9cff40c5083b"`,
                defined: "Outputs data for the matching hash string, if any.  The hash must be composed of 128 characters only composed of only 0-9 and lower case a-f."
            }
        ]
    },
    agent_online: {
        description: "Allows testing connectivity to remote agents.  Think of this as an alternative to ping where specified port, address, and protocol are tested for the agents specified.",
        example: [
            {
                code: `${vars.version.command} agent_online a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e`,
                defined: "This will test a connection to the specified agent."
            },
            {
                code: `${vars.version.command} agent_online list`,
                defined: "Specifying the parameter 'list' will output a list of all agent hashes, names, and IP addresses by agent type."
            },
            {
                code: `${vars.version.command} agent_online device`,
                defined: "An argument of 'device' will test connectivity on each device agent."
            },
            {
                code: `${vars.version.command} agent_online user`,
                defined: "An argument of 'user' will test connectivity on each user agent."
            },
            {
                code: `${vars.version.command} agent_online all`,
                defined: "An argument of 'all' will run connectivity tests on all stored agents."
            }
        ]
    },
    base64: {
        description: "Convert a file or string into a base64 encoding.",
        example: [
            {
                code: `${vars.version.command} base64 encode string:"my string to encode"`,
                defined: "Converts the provided string into a base64 encoding."
            },
            {
                code: `${vars.version.command} base64 encode path/to/file`,
                defined: "Converts the provided file into a base64 encoding."
            },
            {
                code: `${vars.version.command} base64 encode http://file.from.internet.com`,
                defined: "Reads a file from a URI and outputs a base64 encoding."
            },
            {
                code: `${vars.version.command} base64 decode string:"a big base64 string"`,
                defined: "Decodes base64 strings into decoded output."
            }
        ]
    },
    build: {
        description: "Rebuilds the application.",
        example: [
            {
                code: `${vars.version.command} build`,
                defined: "Compiles from TypeScript into JavaScript and puts libraries together."
            },
            {
                code: `${vars.version.command} build incremental`,
                defined: "Use the TypeScript incremental build, which takes about half the time."
            },
            {
                code: `${vars.version.command} build local`,
                defined: "The default behavior assumes TypeScript is installed globally. Use the 'local' argument if TypeScript is locally installed in node_modules."
            }
        ]
    },
    commands: {
        description: "List all supported commands to the console or examples of a specific command.",
        example: [
            {
                code: `${vars.version.command} commands`,
                defined: "Lists all commands and their definitions to the shell."
            },
            {
                code: `${vars.version.command} commands directory`,
                defined: "Details the mentioned command with examples, which in this case is the 'directory' command."
            },
            {
                code: `${vars.version.command} commands all`,
                defined: "Specifying 'all' will output verbose documentation and code examples for all supported commands."
            }
        ]
    },
    copy: {
        description: "Copy files or directories from one location to another on the local file system.",
        example: [
            {
                code: `${vars.version.command} copy source/file/or/directory destination/path`,
                defined: "Copies the file system artifact at the first address to the second address."
            },
            {
                code: `${vars.version.command} copy "C:\\Program Files" destination\\path`,
                defined: "Quote values that contain non-alphanumeric characters."
            },
            {
                code: `${vars.version.command} copy source destination ignore [build, .git, node_modules]`,
                defined: "Exclusions are permitted as a comma separated list in square brackets following the ignore keyword."
            },
            {
                code: `${vars.version.command} copy source destination ignore[build, .git, node_modules]`,
                defined: "A space between the 'ignore' keyword and the opening square brace is optional."
            },
            {
                code: `${vars.version.command} copy ../sparser ../sparserXX ignore [build, .git, node_modules]`,
                defined: "Exclusions are relative to the source directory."
            }
        ]
    },
    directory: {
        description: "Traverses a directory in the local file system and generates a list.",
        example: [
            {
                code: `${vars.version.command} directory source:"my/directory/path"`,
                defined: "Returns an array where each index is an array of [absolute path, type, parent index, file count, stat]. Type can refer to 'file', 'directory', or 'link' for symbolic links.  The parent index identify which index in the array is the objects containing directory and the file count is the number of objects a directory type object contains."
            },
            {
                code: `${vars.version.command} directory source:"my/directory/path" shallow`,
                defined: "Does not traverse child directories."
            },
            {
                code: `${vars.version.command} directory source:"my/directory/path" depth:9`,
                defined: "The depth of child directories to traverse. The default value of 0 applies full recursion."
            },
            {
                code: `${vars.version.command} directory source:"my/directory/path" symbolic`,
                defined: "Identifies symbolic links instead of the object the links point to"
            },
            {
                code: `${vars.version.command} directory source:"my/directory/path" ignore [.git, node_modules, "program files"]`,
                defined: "Sets an exclusion list of things to ignore."
            },
            {
                code: `${vars.version.command} directory source:"my/path" typeof`,
                defined: "Returns a string describing the artifact type."
            },
            {
                code: `${vars.version.command} directory source:"my/path" mode:"hash"`,
                defined: "Includes a SHA512 hash in the output for each file system object of type 'file'."
            },
            {
                code: `${vars.version.command} directory source:"my/directory/path" mode:"list"`,
                defined: "Returns an array of strings where each index is an absolute path."
            },
            {
                code: `${vars.version.command} directory source:"my/directory/path" search:"any string"`,
                defined: "Returns results in the default format, but only containing artifacts containing the search token. If the 'search' argument is not provided the search function will not be applied."
            }
        ]
    },
    get: {
        description: "Retrieve a resource via an absolute URI.",
        example: [
            {
                code: `${vars.version.command} get http://example.com/file.txt`,
                defined: "Gets a resource from the web and prints the output to the shell."
            },
            {
                code: `${vars.version.command} get http://example.com/file.txt path/to/file`,
                defined: "Get a resource from the web and writes the resource as UTF8 to a file at the specified path."
            }
        ]
    },
    hash: {
        description: "Generate a SHA512 hash of a file or a string.",
        example: [
            {
                code: `${vars.version.command} hash path/to/file`,
                defined: "Prints a SHA512 hash to the shell for the specified file's contents in the local file system."
            },
            {
                code: `${vars.version.command} hash verbose path/to/file`,
                defined: "Prints the hash with file path and version data."
            },
            {
                code: `${vars.version.command} hash string "I love kittens."`,
                defined: "Hash an arbitrary string directly from shell input."
            },
            {
                code: `${vars.version.command} hash https://prettydiff.com/`,
                defined: "Hash a resource from the web."
            },
            {
                code: `${vars.version.command} hash path/to/directory`,
                defined: "Directory hash recursively gathers all descendant artifacts and hashes the contents of each of those items that are files, hashes the paths of directories, sorts this list, and then hashes the list of hashes."
            },
            {
                code: `${vars.version.command} hash path/to/directory list`,
                defined: "Returns a JSON string of an object where each file, in absolutely path, is a key name and its hash is the key's value."
            },
            {
                code: `${vars.version.command} hash file/system/path algorithm:sha3-512`,
                defined: "The algorithm argument allows a choice of hashing algorithm. Supported values: 'blake2d512', 'blake2s256', 'sha3-224', 'sha3-256', 'sha3-384', 'sha3-512', 'sha384', 'sha512', 'sha512-224', 'sha512-256', 'shake128', 'shake256'"
            }
        ]
    },
    help: {
        description: `Introductory information to ${vars.version.name} on the command line.`,
        example: [{
            code: `${vars.version.command} help`,
            defined: "Writes help text to shell."
        }]
    },
    lint: {
        description: "Use ESLint against all JavaScript files in a specified directory tree.",
        example: [
            {
                code: `${vars.version.command} lint ../tools`,
                defined: "Lints all the JavaScript files in that location and in its subdirectories."
            },
            {
                code: `${vars.version.command} lint`,
                defined: `Specifying no location defaults to the ${vars.version.name} application directory.`
            },
            {
                code: `${vars.version.command} lint ../tools ignore [node_modules, .git, test, units]`,
                defined: "An ignore list is also accepted if there is a list wrapped in square braces following the word 'ignore'."
            }
        ]
    },
    mkdir: {
        description: "Recursively creates a directory structure.  For example if 'my/new/path` were to be created but parent 'my' doesn't exist this command will create all three directories, but it will not alter or overwrite any artifacts already present. Relative paths are relative to the terminal's current working directory.",
        example: [{
            code: `${vars.version.command} mkdir my/path/to/create`,
            defined: "This example would create directories as necessary to ensure the directory structure 'my/path/to/create' is available from the location relative to the terminal's current working directory."
        }]
    },
    remove: {
        description: "Remove a file or directory tree from the local file system.",
        example: [
            {
                code: `${vars.version.command} remove path/to/resource`,
                defined: "Removes the specified resource."
            },
            {
                code: `${vars.version.command} remove "C:\\Program Files"`,
                defined: "Quote the path if it contains non-alphanumeric characters."
            }
        ]
    },
    server: {
        description: "Launches a HTTP service and web sockets so that the web tool is automatically refreshed once code changes in the local file system.",
        example: [
            {
                code: `${vars.version.command} server`,
                defined: `Launches the server on default port ${vars.version.port} and web sockets on port ${vars.version.port + 1}.`
            },
            {
                code: `${vars.version.command} server 8080`,
                defined: "If a numeric argument is supplied the web server starts on the port specified and web sockets on the following port."
            },
            {
                code: `${vars.version.command} server 0`,
                defined: "To receive a random available port specify port number 0."
            },
            {
                code: `${vars.version.command} server browser`,
                defined: "The 'browser' argument launches the default location in the user's default web browser."
            },
            {
                code: `${vars.version.command} server test`,
                defined: "The 'test' argument tells the server to use data from a separate storage location for running tests instead of the user's actual data."
            },
            {
                code: `${vars.version.command} server test browser 9000`,
                defined: "An example with all supported arguments.  The three supported arguments may occur in any order, but the third argument (after 'browser' and 'test') must be a number."
            }
        ]
    },
    test: {
        description: "Builds the application and then runs all the test commands",
        example: [
            {
                code: `${vars.version.command} test`,
                defined: "Runs all the tests in the test suite."
            },
            {
                code: `${vars.version.command} test log`,
                defined: "The log argument turns on verbose logging output with annotations."
            }
        ]
    },
    test_browser: {
        description: "Launches the 'server' command as a child process, launches the default browser to execute DOM instructions as intervals of test automation, and then closes the browser upon completion.",
        example: [
            {
                code: `${vars.version.command} test_browser`,
                defined: "Runs the browser interaction tests."
            },
            {
                code: `${vars.version.command} test_browser no_close`,
                defined: "Disables the 'window.close()' command at the end of test instructions so that the browser remains open for manual inspection."
            }
        ]
    },
    test_service: {
        description: "Launches the 'server' command as a child process to issue HTTP requests against it and test the results",
        example: [
            {
                code: `${vars.version.command} test_service`,
                defined: "Runs tests server utility."
            },
            {
                code: `${vars.version.command} test_service fs:fs-copy`,
                defined: "Filter the tests to run by supplying a text fragment to filter against test names.  For example if there are 6 service tests whose names contain that string then only those 6 tests will be evaluated."
            },
            {
                code: `${vars.version.command} test_service log`,
                defined: "The log argument turns on verbose logging output with annotations."
            },
            {
                code: `${vars.version.command} test_service log log`,
                defined: "If you wish to enable verbose logging and filter tests by the word 'log' then simply include it twice."
            },
            {
                code: `${vars.version.command} test_service log "Copy from Remote Device to different Remote Device"`,
                defined: "Using quotes the filter argument may contain spaces and other non-alpha characters."
            }
        ]
    },
    test_simulation: {
        description: "Launches a test runner to execute the various commands of the services file.",
        example: [
            {
                code: `${vars.version.command} test_simulation`,
                defined: "Runs tests against the commands offered by the services file."
            },
            {
                code: `${vars.version.command} test_simulation help`,
                defined: "Filter the tests to run by supplying a text fragment to filter against test names.  For example if there are 6 service tests whose names contain that string then only those 6 tests will be evaluated."
            },
            {
                code: `${vars.version.command} test_simulation log`,
                defined: "The log argument turns on verbose logging output with annotations."
            },
            {
                code: `${vars.version.command} test_simulation log log`,
                defined: "If you wish to enable verbose logging and filter tests by the word 'log' then simply include it twice."
            },
            {
                code: `${vars.version.command} test_simulation log "hash ~/share-file-systems list ignore ['node_modules'"`,
                defined: "Using quotes the filter argument may contain spaces and other non-alpha characters."
            }
        ]
    },
    update: {
        description: "Pulls code from the git repository and then rebuilds the application.",
        example: [
            {
                code: `${vars.version.command} update`,
                defined: "Without specifying a branch name the application assumes a branch name of 'master'."
            },
            {
                code: `${vars.version.command} update devices`,
                defined: "The command with a branch name provided."
            }
        ]
    },
    version: {
        description: "Prints the current version number and date of prior modification to the console.",
        example: [{
            code: `${vars.version.command} version`,
            defined: "Prints the current version number and date to the shell."
        }]
    }
};

export default commands_documentation;