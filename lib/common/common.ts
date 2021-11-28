/* lib/common/common - A collection of tools available to any environment. */

const common:module_common = {

    // loops through agent types, agents, and shares and allows a callback at each level
    agents: function common_agents(config:agentsConfiguration):void {
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
                agents = agentTypes[agentsKeys[a] as "device"|"user"];
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
                if (agentTypeLength > 0 && config.countBy !== "agentType") {
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

    // capitalizes a string
    capitalize: function common_capitalize(input:string):string {
        return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
    },

    // takes a number returns a string of that number with commas separating segments of 3 digits
    commas:  function common_commas(input:number):string {
        const str:string = String(input);
        let arr:string[] = [],
            a:number   = str.length;
        if (a < 4) {
            return str;
        }
        arr = String(input).split("");
        a   = arr.length;
        do {
            a      = a - 3;
            arr[a] = "," + arr[a];
        } while (a > 3);
        return arr.join("");
    },

    // takes a number returns something like 1.2MB for file size
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

    // takes a device list and returns an array of share objects
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
    }

};

export default common;