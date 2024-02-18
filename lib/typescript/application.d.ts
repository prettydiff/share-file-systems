/* lib/typescript/application.d - Defines the interface for installable applications. */

/**
 * Defines an application component that can be installed into this application.
 * ```typescript
 * 
 * interface application {
 *     browser: application_browser;
 *     service: application_service[];
 *     terminal: application_terminal;
 * }
 * ``` */
interface application<Type1, Type2> {
    browser: application_browser;
    service: application_service[];
    terminal: application_terminal<Type1, Type2>;
}

/** Defines the browser environment portion of an installed application.
 * ```typescript
 * interface application_browser {
 *     functions: {
 *         content: {
 *             [key:string]: () => void;
 *         };
 *         events: {
 *             [key:string]: (event:Event) => void;
 *         };
 *         tools: {
 *             [key:string]: () => void;
 *         };
 *     };
 *     menu: boolean;
 *     modal: config_modal;
 *     title: {
 *         icon: string;
 *         text: string;
 *     };
 * }
 * ``` */
interface application_browser {
    functions: {
        content: {
            [key:string]: () => void;
        };
        events: {
            [key:string]: (event:Event) => void;
        };
        tools: {
            [key:string]: () => void;
        };
    };
    menu: boolean;
    modal: config_modal;
    title: {
        icon: string;
        text: string;
    };
}

/** Defines the transmission details of a given installed application.
 * ```typescript
 * interface application_service {
 *     functions: {
 *         [key:string]: () => void;
 *     };
 *     handler: receiver;
 *     name: string;
 * }
 * ``` */
interface application_service {
    functions: {
        [key:string]: () => void;
    };
    handler: receiver;
    name: string;
}

/** Defines the command line interface details for a given installed application.
 * ```typescript
 * interface application_terminal<Type1, Type2> {
 *     documentation: documentation_command_item;
 *     io: commandInterface;
 *     library: (callback:commandCallback, arg1?:Type1, arg2?:Type2) => void;
 * }
 * ``` */
interface application_terminal<Type1, Type2> {
    documentation: documentation_command_item;
    io: commandInterface;
    library: (callback:commandCallback, arg1?:Type1, arg2?:Type2) => void;
}