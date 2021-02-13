/* lib/terminal/test/application/browserUtilities/file_path_encode - Creates an encoding around file system addresses so that the test code can ensure the paths are properly formed per operating system. */

const filePathEncode = function terminal_test_application_filePathEncode(relativity:"absolute"|"relative", input:string, windowsString?:boolean):string {
    const end:string = (windowsString === true)
        ? "</PATH-forced>"
        : "</PATH>";
    if (input.indexOf("./") === 0) {
        input = input.slice(2);
        relativity = "absolute";
    }
    if (relativity === "absolute") {
        return `<PATH>**projectPath**${input.replace(/^\//, "") + end}`;
    }
    return `<PATH>${input + end}`;
};

export default filePathEncode;