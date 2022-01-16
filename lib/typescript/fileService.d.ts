/* lib/typescript/fileService.d - TypeScript interfaces used by the file services. */

/**
 * A configuration object for serviceCopy.status.copy.
 * ```typescript
 * interface config_copyStatus {
 *     agentSource: fileAgent;
 *     agentRequest: fileAgent;
 *     agentWrite: fileAgent;
 *     countFile: number;
 *     cut: boolean;
 *     directory: boolean;
 *     failures: number;
 *     location: string[];
 *     message: string;
 *     totalSize: number;
 *     writtenSize: number;
 * }
 * ``` */
interface config_copyStatus {
    agentSource: fileAgent;
    agentRequest: fileAgent;
    agentWrite: fileAgent;
    countFile: number;
    cut: boolean;
    directory: boolean;
    failures: number;
    location: string[];
    message: string;
    totalSize: number;
    writtenSize: number;
}

/**
 * A configuration object for serviceCopy.actions.rename.
 * ```typescript
 * interface config_rename {
 *     agentRequest: fileAgent;
 *     callback: (filePath:string) => void;
 *     firstName: string;
 *     modalAddress: string;
 *     newName?: string;
 *     path: string;
 *     type: fileType;
 * }
 * ``` */
interface config_rename {
    agentRequest: fileAgent;
    callback: (filePath:string) => void;
    firstName: string;
    modalAddress: string;
    newName?: string;
    path: string;
    type: fileType;
}

/**
 * Used for routing agent specific data through file system and copy related services.
 * ```typescript
 * interface fileAgent {
 *     device: string;
 *     modalAddress: string;
 *     share: string;
 *     type: agentType;
 *     user: string;
 * }
 * ``` */
interface fileAgent {
    device: string;
    modalAddress: string;
    share: string;
    user: string;
}

/**
 * Conveys data from reading one or more files.
 * ```typescript
 * interface fileRead {
 *     content: string;
 *     id: string;
 *     path: string;
 * }
 * ``` */
interface fileRead {
    content: string;
    id: string;
    path: string;
}

/**
 * Defines a list of file system objects to request from a remote agent for file copy.
 * ```typescript
 * interface remoteCopyListData {
 *     directories: number;
 *     fileCount: number;
 *     fileSize: number;
 *     list: copyListItem[];
 * }
 * ``` */
interface remoteCopyListData {
    directories: number;
    fileCount: number;
    fileSize: number;
    list: copyListItem[];
}