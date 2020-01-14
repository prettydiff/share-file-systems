
import vars from "../lib/terminal/vars.js";

// tests structure
// * artifact - the address of anything written to disk, so that it can be removed
// * command - the command to execute minus the `node js/services` part
// * file - a file system address to open
// * name - a short label to describe the test
// * qualifier - how to test, see simulationItem in index.d.ts for appropriate values
// * test - the value to compare against

const //sep:string = vars.sep,
    projectPath:string = vars.projectPath,
    //superSep:string = (sep === "\\")
    //    ? "\\\\"
    //    : sep,
    // the tsconfig.json file hash used in multiple tests
    hash:string = "a20d01485bcf8a1fcae9c181aff12b2618d66d52dde8b9e596ad696d363c87dc499ba78edfdd8291a84e59b3c3c15d96be40eee2cc8a21ce87b522b5deaf68b6",
    services:testItem[] = [
        {
            command: {
                "fs": {
                    "action": "fs-hash",
                    "agent": "localhost",
                    "copyAgent": "",
                    "depth":1,
                    "id": "test-ID",
                    "location": [`some-modal-id:${projectPath}tsconfig.json`],
                    "name": "",
                    "watch": "no"
                }
            },
            name: "Hash",
            qualifier: "contains",
            test: [{
                "content": hash,
                "id": "some-modal-id",
                "path": `${projectPath}tsconfig.json`
            }]
        }
    ];

export default services;