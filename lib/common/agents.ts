
/* lib/common/agents - Traverses the list of agents, devices and users, and performs an action on each as dictated by a callback */
const agents = function terminal_common_agents(config:agentsConfiguration):void {
    const agentTypes:agentList = {
            device: Object.keys(config.source.device),
            user: Object.keys(config.source.user)
        },
        agentsKeys = Object.keys(agentTypes),
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
            agentTypeKey = <agentType>agentsKeys[a];
            agents = agentTypes[agentsKeys[a]];
            agentTypeLength = agents.length;
            if (config.countBy === "agentType") {
                counts.total = counts.total + 1;
            }

            if (config.perAgentType !== undefined) {
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
};

// count async ops per agent when doing nothing with per share
// form total




export default agents;