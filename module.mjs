
// This tool reconfigures the application to build standard ECMA modules instead of commonjs modules, or the opposite.
// usage:
// node module.mjs module
// node module.mjs commonjs

import { readFile, writeFile } from "fs";

(function moduleType() {
    const flags = {
            ".swcrc": false,
            "install.js": false,
            "package.json": false,
            "tsconfig.json": false,
            "vars.ts": false
        },
        text = {
            angry    : "\u001b[1m\u001b[31m",
            bold     : "\u001b[1m",
            cyan     : "\u001b[36m",
            green    : "\u001b[32m",
            none     : "\u001b[0m",
            underline: "\u001b[4m"
        },
        moduleName = (function moduleType_moduleName() {
            let a = 0,
                lower = "";
            const len = process.argv.length;
            if (process.argv.indexOf("commonjs") > 0) {
                return "commonjs";
            }
            do {
                lower = process.argv[a].toLowerCase();
                if (lower === "module" || lower === "modules" || lower === "standard" || (/^es20\d+$/).test(lower) === true) {
                    return "module";
                }
                if (lower === "commonjs") {
                    return "commonjs";
                }
                a = a + 1;
            } while (a < len);
            return "none";
        }()),
        modification = {
            ".swcrc": function moduleType_modificationSwc(fileData) {
                return (moduleName === "commonjs")
                    ? fileData.replace(/"type":\s*"((commonjs)|(es6))"/, "\"types\": \"commonjs\"")
                    : fileData.replace(/"type":\s*"((commonjs)|(es6))"/, "\"types\": \"es6\"");
            },
            "install.js": function moduleType_modificationInstall(fileData) {
                return (moduleName === "commonjs")
                    ? fileData.replace(/^\s*(\/\/)?import/, "\n//import").replace(/const (\/\/)?exec/, "const exec").replace(/moduleType = "((commonjs)|(module))",/, "moduleType = \"commonjs\",")
                    : fileData.replace(/^\s*(\/\/)?import/, "\nimport").replace(/const (\/\/)?exec/, "const //exec").replace(/moduleType = "((commonjs)|(module))",/, "moduleType = \"module\",");
            },
            "package.json": function moduleType_modificationPackage(fileData) {
                return (moduleName === "commonjs")
                    ? fileData.replace(/"type":\s*"((commonjs)|(module))",/, "\"type\": \"commonjs\",")
                    : fileData.replace(/"type":\s*"((commonjs)|(module))",/, "\"type\": \"module\",");
            },
            "tsconfig.json": function moduleType_modificationTSconfig(fileData) {
                return (moduleName === "commonjs")
                    ? fileData.replace(/"module":\s*"((commonjs)|(ES2020))",/, "\"module\": \"commonjs\",")
                    : fileData.replace(/"module":\s*"((commonjs)|(ES2020))",/, "\"module\": \"ES2020\",");
            },
            "vars.ts": function moduleType_modificationVars(fileData) {
                return (moduleName === "commonjs")
                    ? fileData.replace(/module_type: "((commonjs)|(module))",/g, "module_type: \"commonjs\",")
                    : fileData.replace(/module_type: "((commonjs)|(module))",/g, "module_type: \"module\",");
            }
        },
        complete = function moduleType_complete() {
            if (flags["install.js"] === true && flags["package.json"] === true && flags["tsconfig.json"] === true && flags["vars.ts"] === true) {
                const type = (moduleName === "module")
                    ? "standard"
                    : "commonjs";
                console.log(`Application ready to build as ${text.cyan + type + text.none} modules.`);
                console.log(`Please execute ${text.green + text.bold}node install no_package${text.none} to rebuild the application.`);
                console.log("");
            }
        },
        files = function moduleType_files(key) {
            const fileName = (key === "vars.ts")
                ? "lib/terminal/utilities/vars.ts"
                : key;
            readFile(fileName, function moduleType_install(readError, fileData) {
                if (readError === null) {
                    if (moduleName === "none") {
                        const moduleType = (fileData.indexOf("commonjs") > 0)
                            ? "commonjs"
                            : "standard";
                        console.log(`Application is currently configured for ${text.cyan + moduleType + text.none} module system.`);
                        console.log("");
                    } else {
                        const newFile = modification[key](fileData.toString());
                        if (newFile === fileData) {
                            flags[key] = true;
                            complete();
                        } else {
                            writeFile(fileName, newFile, function moduleType_install_write(writeError) {
                                if (writeError === null) {
                                    flags[key] = true;
                                    complete();
                                } else {
                                    console.log(`Error writing file ${key}`);
                                    console.log(JSON.stringify(writeError));
                                }
                            });
                        }
                    }
                } else {
                    console.log(`Error reading file ${key}`);
                    console.log(JSON.stringify(readError));
                }
            });
        };
    console.log("");
    if (moduleName === "none") {
        console.log(`${text.cyan + text.underline + text.bold}Share File Systems - Detecting current module system.${text.none}`);
        files("package.json");
    } else {
        console.log(`${text.cyan + text.underline + text.bold}Share File Systems - Preparing for ${moduleName} builds.${text.none}`);
        files(".swcrc");
        files("install.js");
        files("package.json");
        files("tsconfig.json");
        files("vars.ts");
    }
}());