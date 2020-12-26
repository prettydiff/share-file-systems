/* lib/typescript/types.d - TypeScript static types. */

import { Stats } from "fs";
declare global {
    type agency = [string, boolean, agentType];
    type agentTextList = [agentType, string][];
    type agentType = "device" | "user";
    type brotli = 0|1|2|3|4|5|6|7|8|9|10|11;
    type browserDOM = [domMethod, string, number];
    type certKey = "crt" | "key";
    type color = [string, string];
    type colorScheme = "dark" | "default";
    type contextType = "" | "Base64" | "copy" | "cut" | "directory" | "Edit" | "file" | "Hash";
    type directoryItem = [string, "error" | "file" | "directory" | "link", string, number, number, Stats];
    type directoryMode = "array" | "hash" | "list" | "read" | "search";
    type domMethod = "activeElement" | "childNodes" | "documentElement" | "firstChild" | "getAncestor" | "getElementById" | "getElementsByAttribute" | "getElementsByClassName" | "getElementsByName" | "getElementsByTagName" | "getElementsByText" | "getModalsByModalType" | "getNodesByType" | "lastChild" | "nextSibling" | "parentNode" | "previousSibling";
    type dragFlag = "" | "control" | "shift";
    type eventCallback = (event:Event, callback:Function) => void;
    type eventName = "blur" | "click" | "contextmenu" | "dblclick" | "focus" | "keydown" | "keyup" | "move" | "mousedown" | "mouseenter" | "mouseleave" | "mousemove" | "mouseover" | "mouseout" | "mouseup" | "refresh" | "refresh-interaction" | "select" | "setValue" | "touchend" | "touchend" | "touchstart" | "wait";
    type hash = "blake2d512" | "blake2s256" | "sha3-224" | "sha3-256" | "sha3-384" | "sha3-512" | "sha384" | "sha512" | "sha512-224" | "sha512-256" | "shake128" | "shake256";
    type heartbeatStatus = "" | "active" | "deleted" | "idle" | "offline";
    type inviteAction = "invite" | "invite-request" | "invite-response" | "invite-complete";
    type inviteStatus = "accepted" | "declined" | "invited";
    type mimeType = "application/javascript" | "application/json" | "application/octet-stream" | "application/x-www-form-urlencoded" | "application/xhtml+xml" | "image/jpeg" | "image/png" | "image/svg+xml" | "text/css" | "text/html" | "text/plain";
    type modalStatus = "hidden" | "maximized" | "minimized" | "normal";
    type modalType = "details" | "export" | "fileEdit" | "fileNavigate" | "invite-accept" | "invite-request" | "message" | "shares" | "share_delete" | "settings" | "textPad";
    type primitive = boolean | null | number | string | undefined;
    type qualifier = "begins" | "contains" | "ends" | "greater" | "is" | "lesser" | "not" | "not contains";
    type qualifierFile = "file begins" | "file contains" | "file ends" | "file is" | "file not" | "file not contains" | "filesystem contains" | "filesystem not contains";

    type requestType = "delete-agents" | "device" | "error" | "file-list-status" | "forbidden" | "fs" | "fs-update-local" | "fs-update-remote" | "GET" | "hash-device" | "hash-share" | "hash-user" | "heartbeat-complete" | "heartbeat-delete-agents" | "heartbeat-status" | "heartbeat-update" | "message" | "invite" | "invite-complete" | "invite-error" | "invite-request" | "invite-response" | "message" | "reload" | "settings" | "test-browser" | "user";
    
    type selector = "class" | "id" | "tag";
    type serviceFS = "fs-base64" | "fs-close" | "fs-copy" | "fs-copy-file" | "fs-copy-list" | "fs-copy-list-remote" | "fs-copy-request" | "fs-copy-self" | "fs-cut" | "fs-cut-file" | "fs-cut-list" | "fs-cut-list-remote" | "fs-cut-remove" | "fs-cut-request" | "fs-cut-self" | "fs-destroy" | "fs-details" | "fs-directory" | "fs-hash" | "fs-new" | "fs-read" | "fs-rename" | "fs-search" | "fs-write";
    type serviceType = serviceFS | "invite-status" | "settings";
    type shareType = "directory" | "file" | "link";
    type storageType = "device" | "message" | "settings" | "user";
    type testBrowserAction = "close" | "nothing" | "request" | "reset-browser" | "reset-complete" | "reset-request" | "reset-response" | "respond" | "result";
    type testBrowserMode = "agents" | "full" | "remote" | "self";
    type testListType = "browser" | "service" | "simulation";
    type testLogFlag = "" | testListType;
    type ui_input = "cancel" | "close" | "confirm" | "maximize" | "minimize" | "save" | "text";
}