/* lib/common/disallowed - Reassignments from default conventions that either dated or most frequently misused. */

const disallowed = function common_disallowed(browser:boolean):void {
    const forbidden = function common_disallowed_forbidden():void {
            // eslint-disable-next-line
            new Error(`Disallowed feature used on: ${this}\n The feature is not supported in this application.`);
            return undefined;
        },
        forbiddenList = function common_disallowed_forbiddenList():NodeListOf<HTMLElement> {
            // eslint-disable-next-line
            const list:any = [];
            // eslint-disable-next-line
            new Error(`Disallowed feature used on: ${this}\n The feature is not supported in this application.`);
            return list;
        };

    if (browser === true) {
        // Disabling popular but slow conventions. Enhancements to the project must consider performance and scale
        Element.prototype.addEventListener = forbidden;
        Element.prototype.querySelector    = forbidden;
        Element.prototype.querySelectorAll = forbiddenList;
        Element.prototype.closest          = forbidden;
        document.write                     = forbidden;
        document.querySelector             = forbidden;
        document.querySelectorAll          = forbiddenList;
        window.history.back                = forbidden;
        window.history.forward             = forbidden;
        window.history.go                  = forbidden;
        window.history.pushState           = forbidden;
        window.history.replaceState        = forbidden;

        // Prevent third party authors from overriding these performance measures
        Object.freeze(document.write);
        Object.freeze(document.querySelector);
        Object.freeze(document.querySelectorAll);
        Object.freeze(Element.prototype);
        Object.freeze(Document);
    }

    // Disabling commonly used but completely unnecessary methods that harm performance and complicate code
    Object.create = forbidden;
    Object.freeze(Function.prototype);
    Object.freeze(Object);

    // Prevent third party authors from overriding these performance measures
};

export default disallowed;