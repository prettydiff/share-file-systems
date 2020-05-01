/* lib/terminal/test/application/message - Formatting and presentation of pass and fail messaging as determined by the evaluation library. */

import humanTime from "../../utilities/humanTime.js";
import log from "../../utilities/log.js";
import vars from "../../utilities/vars.js";

const testMessage = function test_testMessage(input:testMessage):number {
    if (input.messages[0] === "") {
        log([`${humanTime(false) + vars.text.green}Passed ${input.testType} ${input.index + 1}: ${vars.text.none + input.name}`]);
    } else if (input.messages[0].indexOf("fail - ") === 0) {
        input.fail = input.fail + 1;
        log([`${humanTime(false) + vars.text.angry}Fail ${input.testType} ${input.index + 1}: ${vars.text.none + input.name} ${vars.text.angry + input.messages[0].replace("fail - ", "") + vars.text.none}`]);
        if (input.messages[1] !== "") {
            const test:string = (typeof input.test.test === "string")
                ? <string>input.test.test
                : JSON.stringify(input.test.test);
            log([
                `${vars.text.green}Expected output:${vars.text.none}`,
                test,
                "",
                `${vars.text.angry}Actual output:${vars.text.none}`,
                input.messages[1],
                "",
                ""
            ]);
        }
    } else {
        log([`${humanTime(false) + vars.text.underline}Test ${input.index + 1} ignored (${vars.text.angry + input.messages[0] + vars.text.none + vars.text.underline}):${vars.text.none} ${input.name}`]);
    }
    return input.fail;
};

export default testMessage;