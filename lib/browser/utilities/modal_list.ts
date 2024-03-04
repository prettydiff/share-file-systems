
/* lib/browser/utilities/modal_configuration - A single location for storing all modal content configurations by modal type. */

import modal_fileEdit from "../modal_config/modal_fileEdit.js";
import modal_agentManagement from "../modal_config/modal_agentManagement.js";
import modal_configuration from "../modal_config/modal_configuration.js";
import modal_document from "../modal_config/modal_document.js";
import modal_export from "../modal_config/modal_export.js";
import modal_fileDetails from "../modal_config/modal_fileDetails.js";
import modal_fileNavigate from "../modal_config/modal_fileNavigate.js";
import modal_inviteAsk from "../modal_config/modal_inviteAsk.js";
import modal_media from "../modal_config/modal_media.js";
import modal_message from "../modal_config/modal_message.js";
import modal_shares from "../modal_config/modal_shares.js";
import modal_socketMap from "../modal_config/modal_socketMap.js";
import modal_terminal from "../modal_config/modal_terminal.js";
import modal_textPad from "../modal_config/modal_textPad.js";

// cspell:words agenttype

/**
 * Provides a central location for the configuration of modals by modal type.
 * ```typescript
 * interface module_modalConfiguration {
 *     modals: {
 *         "agent-management": modal_open;
 *         "configuration": modal_open;
 *         "details": modal_open;
 *         "document": modal_open;
 *         "export": modal_open;
 *         "file-edit": modal_open;
 *         "file-navigate": modal_open;
 *         "invite-ask": modal_open;
 *         "media": modal_open;
 *         "message": modal_open;
 *         "shares": modal_open;
 *         "socket-map": modal_open;
 *         "terminal": modal_open;
 *         "text-pad": modal_open;
 *     };
 *     titles: {
 *         [key:string]: {
 *             icon: string;
 *             menu: boolean;
 *             text: string;
 *         };
 *     };
 * }
 * ``` */
const modal_list:module_modalList = {
    "agent-management": modal_agentManagement,
    "configuration": modal_configuration,
    "details": modal_fileDetails,
    "document": modal_document,
    "export": modal_export,
    "file-edit": modal_fileEdit,
    "file-navigate": modal_fileNavigate,
    "invite-ask": modal_inviteAsk,
    "media": modal_media,
    "message": modal_message,
    "shares": modal_shares,
    "socket-map": modal_socketMap,
    "terminal": modal_terminal,
    "text-pad": modal_textPad
};

export default modal_list;