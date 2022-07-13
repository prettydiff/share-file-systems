
// This tool reconfigures the application to build standard ECMA modules instead of commonjs modules, or the opposite.
// usage:
// node module module
// node module commonjs

(function moduleType() {
    const fs = require("fs"),
        flags = {
            "install.js": false,
            "package.json": false,
            "tsconfig.json": false,
            "vars.ts": false
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
                if (lower === "module" || lower === "modules" || (/^es20\d+$/).test(lower) === true) {
                    return "module";
                }
                if (lower === "commonjs") {
                    return "commonjs";
                }
                a = a + 1;
            } while (a < len);
            return "commonjs";
        }()),
        modification = {
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
                console.log(`Application ready to build as ${type} modules.`);
                console.log("");
            }
        },
        files = function moduleType_files(key) {
            const fileName = (key === "vars.ts")
                ? "lib/terminal/utilities/vars.ts"
                : key;
            fs.readFile(fileName, function moduleType_install(readError, fileData) {
                if (readError === null) {
                    const newFile = modification[key](fileData.toString());
                    if (newFile === fileData) {
                        flags[key] = true;
                        complete();
                    } else {
                        fs.writeFile(fileName, newFile, function moduleType_install_write(writeError) {
                            if (writeError === null) {
                                flags[key] = true;
                                complete();
                            } else {
                                console.log(`Error writing file ${key}`);
                                console.log(JSON.stringify(error));
                            }
                        });
                    }
                } else {
                    console.log(`Error reading file ${key}`);
                    console.log(JSON.stringify(error));
                }
            });
        };
    console.log("");
    console.log(`\u001b[36m\u001b[1m\u001b[4mShare File Systems - Preparing for ${moduleName} builds.\u001b[0m`);
    files("install.js");
    files("package.json");
    files("tsconfig.json");
    files("vars.ts");
}());