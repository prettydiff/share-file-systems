/* lib/terminal/fileService/copyMessage - Generates status messaging for a copy operation. */

import common from "../../common/common.js";
import vars from "../utilities/vars.js";

const copyMessage = function terminal_fileService_copyMessage(numbers:completeStatus):string {
    const filePlural:string = (numbers.countFile === 1)
            ? ""
            : "s",
        failPlural:string = (numbers.failures === 1)
            ? ""
            : "s",
        verb:string = (numbers.percent === 100)
            ? "Copy"
            : `Copying ${numbers.percent.toFixed(2)}%`;
    vars.testLogger("fileService", "copyMessage", "Status information about multiple file copy.");
    return `${verb} complete. ${common.commas(numbers.countFile)} file${filePlural} written at size ${common.prettyBytes(numbers.writtenSize)} (${common.commas(numbers.writtenSize)} bytes) with ${numbers.failures} integrity failure${failPlural}.`
};

export default copyMessage;