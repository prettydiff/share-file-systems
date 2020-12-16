/* lib/terminal/test/samples/browser_path - Creates an encoding around file system addresses so that the test code can ensure the paths are properly formed per operating system. */

const browserPath = function terminal_test_application_browserPath(input:string, projectPath:boolean):string {
    if (projectPath === true) {
        return `<PATH>**projectPath**${input}</PATH>`;
    }
    return `<PATH>${input}</PATH>`;
};

export default browserPath;