
/* lib/terminal/utilities/commands_documentation - A data structure defining command documentation with usage examples. */
import vars from "./vars.js";

const commands_documentation = {
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
                defined: "Details the mentioned command with examples."
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
                defined: "Returns a JSON string listing all scanned file system objects and each respective hash."
            },
            {
                code: `${vars.version.command} hash algorithm:sha3-512`,
                defined: "Allows a choice of hashing algorithm. Supported values: 'blake2d512', 'blake2s256', 'sha3-224', 'sha3-256', 'sha3-384', 'sha3-512', 'sha384', 'sha512', 'sha512-224', 'sha512-256', 'shake128', 'shake256'"
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
            }
        ]
    },
    test: {
        description: "Builds the application and then runs all the test commands",
        example: [{
            code: `${vars.version.command} test`,
            defined: "Runs all the tests in the test suite."
        }]
    },
    test_service: {
        description: "Launches the 'server' command as a child process to issue HTTP requests against it and test the results",
        example: [{
            code: `${vars.version.command} test_service`,
            defined: "Runs tests server utility."
        }]
    },
    test_simulation: {
        description: "Launches a test runner to execute the various commands of the services file.",
        example: [{
            code: `${vars.version.command} test_simulation`,
            defined: "Runs tests against the commands offered by the services file."
        }]
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