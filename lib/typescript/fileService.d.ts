/* lib/typescript/fileService.d - TypeScript interfaces used by the file services. */

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