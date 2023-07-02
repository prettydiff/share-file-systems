/* lib/typescript/fileService.d - TypeScript interfaces used by the file services. */

/**
 * Used for routing agent specific data through file system and copy related services.
 * ```typescript
 * interface fileAgent {
 *     device: string;
 *     modalAddress: string;
 *     share: string;
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
 * Provides the template on which file system operations execute
 * ```typescript
 * interface fileSystem {
 *     location: string[];
 * }
 * ``` */
interface fileSystem extends fileSystem_agents {
    location: string[];
}

/**
 * Defines the parties to a file system operation
 * ```typescript
 * interface fileSystem {
 *     agentRequest: fileAgent;
 *     agentSource : fileAgent;
 *     agentWrite  : fileAgent;
 * }
 * ``` */
interface fileSystem_agents {
    agentRequest: fileAgent;
    agentSource : fileAgent;
    agentWrite  : fileAgent;
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
 *     list: directory_list[];
 * }
 * ``` */
interface remoteCopyListData {
    directories: number;
    fileCount: number;
    fileSize: number;
    list: directory_list[];
}