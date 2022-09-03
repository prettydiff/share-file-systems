/* lib/common/common - A collection of tools available to any environment. */

/**
 * Provides globally available utilities, such as string formatting tools.
 * * **agents** - Provides a means to loop through agent types, agents, and shares against a supplied function.
 * * **capitalize** - Converts the first character of a string to a capital letter if that first character is a lowercase letter.
 * * **commas** - Converts a number into a string with commas separating character triplets from the right.
 * * **dateFormat** - Converts a date object into US Army date format.
 * * **prettyBytes** - Converts a number into an abbreviated exponent of 2 describing storage size, example: 2134321 => 2.0MB.
 * * **selfShares** - Converts the list of shares from all devices into a single package for distribution to external users.
 * * **time** - Produce a formatted time string from a date object.
 * ```typescript
 * interface module_common {
 *     agents: (config:agentsConfiguration) => void;
 *     capitalize: (input:string) => string;
 *     commas: (input:number) => string;
 *     dateFormat: (date:Date) => string;
 *     prettyBytes: (input:number) => string;
 *     selfShares: (devices:agents) => agentShares;
 *     time: (date:Date) => string;
 * }
 * ``` */
const common:module_common = {

    /* loops through agent types, agents, and shares and allows a callback at each level */
    agents: function common_agents(config:config_agentIdentity):void {
        const agentTypes:agentList = {
                device: Object.keys(config.source.device),
                user: Object.keys(config.source.user)
            },
            agentsKeys:string[] = ["device", "user"],
            agentsKeysLength:number = agentsKeys.length,
            counts:agentCounts = {
                count: 0,
                total: 0
            };
        let a:number = 0,
            b:number = 0,
            c:number = 0,
            agent:string,
            agents:string[],
            share:string,
            shares:string[],
            shareLength:number = 0,
            agentTypeKey:agentType,
            agentTypeLength:number;
    
        if (agentsKeysLength > 0) {
            // loop through each agent type
            do {
                agentTypeKey = agentsKeys[a] as agentType;
                agents = agentTypes[agentTypeKey];
                agentTypeLength = agents.length;
                if (config.countBy === "agentType") {
                    counts.total = counts.total + 1;
                }
    
                if (config.perAgentType !== undefined && agentTypes[agentTypeKey].length > 0) {
                    config.perAgentType({
                        agentType: agentTypeKey
                    }, counts);
                }
    
                // loop through each agent of the given agent type
                if (agentTypeLength > 0 && (config.countBy === "agent" || config.countBy === "share")) {
                    b = 0;
                    do {
                        agent = agents[b];
                        if (config.countBy === "agent") {
                            counts.total = counts.total + 1;
                        }
    
                        if (config.perAgent !== undefined) {
                            config.perAgent({
                                agent: agent,
                                agentType: agentTypeKey
                            }, counts);
                        }
    
                        shares = Object.keys(config.source[agentTypeKey][agent].shares);
                        shareLength = shares.length;
    
                        // loop through each share of each agent for each agent type
                        if (shareLength > 0 && config.countBy === "share") {
                            c = 0;
                            do {
                                share = shares[c];
                                if (config.countBy === "share") {
                                    counts.total = counts.total + 1;
                                }
    
                                if (config.perShare !== undefined) {
                                    config.perShare({
                                        agent: agent,
                                        agentType: agentTypeKey,
                                        share: share
                                    }, counts);
                                }
                                c = c + 1;
                            } while (c < shareLength);
                        }
                        // end share loop
    
                        b = b + 1;
                    } while (b < agentTypeLength);
                }
                // end agent loop
    
                a = a + 1;
            } while (a < agentsKeysLength);
            if (counts.total < 1 && config.complete !== undefined) {
                config.complete(counts);
            }
        } else if (config.complete !== undefined) {
            config.complete(counts);
        }
    },

    /* capitalizes a string */
    capitalize: function common_capitalize(input:string):string {
        return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
    },

    /* takes a number returns a string of that number with commas separating segments of 3 digits */
    commas:  function common_commas(input:number):string {
        const str:string = String(input);
        let arr:string[] = [],
            period:number = str.indexOf("."),
            a:number   = (period > -1)
                ? period
                : str.length;
        if (a < 4) {
            return str;
        }
        arr = String(input).split("");
        do {
            a      = a - 3;
            arr[a] = "," + arr[a];
        } while (a > 3);
        return arr.join("");
    },

    /* Converts a date object into US Army date format. */
    dateFormat: function browser_util_dateFormat(date:Date):string {
        const dateData:string[] = [
                date.getFullYear().toString(),
                date.getMonth().toString(),
                date.getDate().toString(),
                date.getHours().toString(),
                date.getMinutes().toString(),
                date.getSeconds().toString(),
                date.getMilliseconds().toString()
            ],
            output:string[] = [];
        let month:string;
        if (dateData[2].length === 1) {
            dateData[2] = `0${dateData[2]}`;
        }
        if (dateData[3].length === 1) {
            dateData[3] = `0${dateData[3]}`;
        }
        if (dateData[4].length === 1) {
            dateData[4] = `0${dateData[4]}`;
        }
        if (dateData[5].length === 1) {
            dateData[5] = `0${dateData[5]}`;
        }
        if (dateData[6].length === 1) {
            dateData[6] = `00${dateData[6]}`;
        } else if (dateData[6].length === 2) {
            dateData[6] = `0${dateData[6]}`;
        }
        if (dateData[1] === "0") {
            month = "JAN";
        } else if (dateData[1] === "1") {
            month = "FEB";
        } else if (dateData[1] === "2") {
            month = "MAR";
        } else if (dateData[1] === "3") {
            month = "APR";
        } else if (dateData[1] === "4") {
            month = "MAY";
        } else if (dateData[1] === "5") {
            month = "JUN";
        } else if (dateData[1] === "6") {
            month = "JUL";
        } else if (dateData[1] === "7") {
            month = "AUG";
        } else if (dateData[1] === "8") {
            month = "SEP";
        } else if (dateData[1] === "9") {
            month = "OCT";
        } else if (dateData[1] === "10") {
            month = "NOV";
        } else if (dateData[1] === "11") {
            month = "DEC";
        }
        output.push(dateData[2]);
        output.push(month);
        output.push(`${dateData[0]},`);
        output.push(`${dateData[3]}:${dateData[4]}:${dateData[5]}.${dateData[6]}`);
        return output.join(" ");
    },

    /* takes a number returns something like 1.2MB for file size */
    prettyBytes: function common_prettyBytes(input:number):string {
        //find the string length of input and divide into triplets
        let output:string = "",
            length:number  = input
                .toString()
                .length;
        const triples:number = (function terminal_common_prettyBytes_triples():number {
                if (length < 22) {
                    return Math.floor((length - 1) / 3);
                }
                //it seems the maximum supported length of integer is 22
                return 8;
            }()),
            //each triplet is worth an exponent of 1024 (2 ^ 10)
            power:number   = (function terminal_common_prettyBytes_power():number {
                let a:number = triples - 1,
                    b:number = 1024;
                if (triples === 0) {
                    return 0;
                }
                if (triples === 1) {
                    return 1024;
                }
                do {
                    b = b * 1024;
                    a = a - 1;
                } while (a > 0);
                return b;
            }()),
            //kilobytes, megabytes, and so forth...
            unit    = [
                "",
                "KB",
                "MB",
                "GB",
                "TB",
                "PB",
                "EB",
                "ZB",
                "YB"
            ];
    
        if (typeof input !== "number" || Number.isNaN(input) === true || input < 0 || input % 1 > 0) {
            //input not a positive integer
            output = "0B";
        } else if (triples === 0) {
            //input less than 1000
            output = `${input}B`;
        } else {
            //for input greater than 999
            length = Math.floor((input / power) * 100) / 100;
            output = length.toFixed(1) + unit[triples];
        }
        return output;
    },

    /* takes a device list and returns an array of share objects */
    selfShares: function common_selfShares(devices:agents):agentShares {
        const deviceList:string[] = Object.keys(devices),
            shareList:agentShares = {};
        let deviceLength:number = deviceList.length;
        if (deviceLength > 0) {
            let shares:string[] = [],
                shareLength:number;
            do {
                deviceLength = deviceLength - 1;
                shares = Object.keys(devices[deviceList[deviceLength]].shares);
                shareLength = shares.length;
                if (shareLength > 0) {
                    do {
                        shareLength = shareLength - 1;
                        shareList[shares[shareLength]] = devices[deviceList[deviceLength]].shares[shares[shareLength]];
                    } while (shareLength > 0);
                }
            } while (deviceLength > 0);
        }
        return shareList;
    },

    /* sorts directory_list objects by user preference */
    sortFileList: function common_sortFileList(dirs:directory_list, location:string, sortName:fileSort):directory_list {
        const slash:"\\"|"/" = (location.indexOf("\\") > -1 && location.indexOf("/") > -1)
                ? (location.indexOf("\\") > location.indexOf("/"))
                    ? "/"
                    : "\\"
                : (location.indexOf("\\") > -1)
                    ? "\\"
                    : "/",
            sorts:common_fileSorts = {
                "alphabetically-ascending": function common_sortFileList_sortAlphabeticallyAscending(a:directory_item, b:directory_item):-1|1 {
                    if (a[0].toLowerCase() === b[0].toLowerCase()) {
                        if (a[1] === "directory") {
                            return -1;
                        }
                        if (a[1] === "link" && b[1] === "file") {
                            return -1;
                        }
                        return 1;
                    }
                    if (a[0].toLowerCase() < b[0].toLowerCase()) {
                        return -1;
                    }
                    return 1;
                },
                "alphabetically-descending": function common_sortFileList_sortAlphabeticallyDescending(a:directory_item, b:directory_item):-1|1 {
                    if (a[0].toLowerCase() === b[0].toLowerCase()) {
                        if (a[1] === "directory") {
                            return -1;
                        }
                        if (a[1] === "link" && b[1] === "file") {
                            return -1;
                        }
                        return 1;
                    }
                    if (a[0].toLowerCase() < b[0].toLowerCase()) {
                        return 1;
                    }
                    return -1;
                },
                "file-extension": function common_sortFileList_sortFileExtension(a:directory_item, b:directory_item):-1|1 {
                    if (a[1] === "file" && a[1] === b[1]) {

                        // no extensions on both
                        if (a[0].indexOf(".") < 0 && b[0].indexOf(".") < 0) {
                            if (a[0].toLowerCase() < b[0].toLowerCase()) {
                                return -1;
                            }
                            return 1;
                        }
                        if (a[0].indexOf(".") < 0) {
                            return -1;
                        }
                        if (b[0].indexOf(".") < 0) {
                            return 1;
                        }

                        // dot file
                        if (a[0].charAt(a[0].lastIndexOf(slash) + 1) === "." && b[0].charAt(b[0].lastIndexOf(slash) + 1) === ".") {
                            if (a[0].toLowerCase() < b[0].toLowerCase()) {
                                return -1;
                            }
                            return 1;
                        }
                        if (a[0].charAt(a[0].lastIndexOf(slash) + 1) === ".") {
                            return -1;
                        }
                        if (b[0].charAt(b[0].lastIndexOf(slash) + 1) === ".") {
                            return 1;
                        }

                        // sort by extension case insensitive
                        if (a[0].slice(a[0].lastIndexOf(".")).toLowerCase() < b[0].slice(b[0].lastIndexOf(".")).toLowerCase()) {
                            return -1;
                        }
                        if (a[0].slice(a[0].lastIndexOf(".")).toLowerCase() > b[0].slice(b[0].lastIndexOf(".")).toLowerCase()) {
                            return 1;
                        }

                        // otherwise sort by file name case insensitive
                        if (a[0].toLowerCase() < b[0].toLowerCase()) {
                            return -1;
                        }
                        return 1;
                    }
                    if (a[1] === "directory") {
                        return -1;
                    }
                    if (a[1] === "link" && b[1] === "file") {
                        return -1;
                    }
                    return 1;
                },
                "file-modified-ascending": function common_sortFileList_sortFileModifiedAscending(a:directory_item, b:directory_item):-1|1 {
                    if (a[5].mtimeMs === b[5].mtimeMs) {
                        if (a[1] === "directory") {
                            return -1;
                        }
                        if (a[1] === "link" && b[1] === "file") {
                            return -1;
                        }
                    }
                    if (a[5].mtimeMs < b[5].mtimeMs) {
                        return -1;
                    }
                    return 1;
                },
                "file-modified-descending": function common_sortFileList_sortFileModifiedDescending(a:directory_item, b:directory_item):-1|1 {
                    if (a[5].mtimeMs === b[5].mtimeMs) {
                        if (a[1] === "directory") {
                            return 1;
                        }
                        if (a[1] === "link" && b[1] === "file") {
                            return 1;
                        }
                    }
                    if (a[5].mtimeMs < b[5].mtimeMs) {
                        return 1;
                    }
                    return -1;
                },
                "file-system-type": function common_sortFileList_sortFileSystemType(a:directory_item, b:directory_item):-1|1 {
                    if (a[1] === b[1]) {
                        if (a[0].toLowerCase() < b[0].toLowerCase()) {
                            return -1;
                        }
                        return 1;
                    }

                    // when types are different
                    if (a[1] === "directory") {
                        return -1;
                    }
                    if (a[1] === "link" && b[1] === "file") {
                        return -1;
                    }
                    return 1;
                },
                "size-ascending": function common_sortFileList_sortSizeAscending(a:directory_item, b:directory_item):-1|1 {
                    if (a[1] === b[1]) {
                        if (a[1] === "directory" && a[4] < b[4]) {
                            return -1;
                        }
                        if (a[1] === "file" && a[5].size < b[5].size) {
                            return -1;
                        }
                        return 1;
                    }

                    // when types are different
                    if (a[1] === "directory") {
                        return -1;
                    }
                    if (a[1] === "link" && b[1] === "file") {
                        return -1;
                    }
                    return 1;
                },
                "size-descending": function common_sortFileList_sortFileDescending(a:directory_item, b:directory_item):-1|1 {
                    if (a[1] === b[1]) {
                        if (a[1] === "directory" && a[4] < b[4]) {
                            return 1;
                        }
                        if (a[1] === "file" && a[5].size < b[5].size) {
                            return 1;
                        }
                        return -1;
                    }

                    // when types are different
                    if (a[1] === "directory") {
                        return 1;
                    }
                    if (a[1] === "link" && b[1] === "file") {
                        return 1;
                    }
                    return -1;
                }
            };
        if (sortName === null || Array.isArray(dirs) === false || Array.isArray(dirs[0]) === false) {
            return dirs;
        }
        return dirs.sort(sorts[sortName]);
    },

    /* produce a time string from a date object */
    time: function browser_util_time(date:Date):string {
        const hours:string = date.getHours().toString(),
            minutes:string = date.getMinutes().toString(),
            seconds:string = date.getSeconds().toString(),
            pad = function browser_util_time_pad(input:string):string {
                if (input.length === 1) {
                    return `0${input}`;
                }
                return input;
            };
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

};

export default common;