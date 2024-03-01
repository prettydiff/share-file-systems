
/* lib/browser/utilities/modal_shares - Modal configuration for share type modals. */

import share_content from "./share_content.js";
import modal from "./modal.js";

const modal_shares = function browser_utilities_modalConfiguration_modal(event:Event, config?:config_modal):modal {
    if (config === null || config === undefined) {
        const element:HTMLElement = event.target as HTMLElement,
            classy:string = element.getAttribute("class"),
            agent:string = (classy === null || classy === "device-all-shares" || classy === "user-all-shares")
                ? ""
                : element.getAttribute("id"),
            agentType:agentType|"" = (classy === null)
                ? ""
                : (classy === "device-all-shares")
                    ? "device"
                    : (classy === "user-all-shares")
                        ? "user"
                        : element.dataset.agenttype as agentType;
        config = {
            agent: agent,
            agentIdentity: true,
            agentType: agentType as agentType,
            content: share_content(agent, agentType),
            inputs: ["close", "maximize", "minimize"],
            read_only: false,
            type: "shares",
            width: 800
        };
    } else {
        config.content = (config.agentType === "user" && config.agent === "")
            ? share_content("", "user")
            : share_content(config.agent, config.agentType);
        config.type = "shares";
        config.inputs = ["close", "maximize", "minimize"];
    }
    return modal.content(config);
};

export default modal_shares;