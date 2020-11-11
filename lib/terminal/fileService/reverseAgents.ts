/* lib/terminal/fileService/reverseAgents - Convert data.copyAgent to data.agent and data.agent to data.copyAgent. */

const reverseAgents = function terminal_fileService_reverseAgents(data:fileService):void {
    const agent:string = data.agent,
        type:agentType = data.agentType,
        share:string = data.share;
    data.agent = data.copyAgent;
    data.agentType = data.copyType;
    data.share = data.copyShare;
    data.copyAgent = agent;
    data.copyShare = share;
    data.copyType = type;
};

export default reverseAgents;