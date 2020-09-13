
/* lib/terminal/commands/test_service - A command driven wrapper for the service tests, which test the various services used by the application. */

import log from "../utilities/log.js";
import service from "../test/application/service.js";
import testListRunner from "../test/application/runner.js";
import vars from "../utilities/vars.js";

// run the test suite using the build application
const test_service = function terminal_testService():void {
    const completeCallback =  function terminal_testService_callback(message:string, failCount:number):void {
        vars.verbose = true;
        log([message], true);
        if (failCount > 0) {
            process.exit(1);
        } else {
            process.exit(0);
        }
    };
    if (vars.testLogFlag !== "") {
        vars.testLogFlag = "service";
    }
    if (typeof process.argv[0] === "string") {
        const addCallback = function terminal_testService_addCallback():void {
                let a:number = 0,
                    filterLength:number = 0,
                    fail:number = 0;
                const filter:number[] = [],
                    length:number = service.tests.length;
                do {
                    if (service.tests[a].name.indexOf(process.argv[0]) > -1) {
                        filter.push(a);
                    }
                    a = a + 1;
                } while (a < length);
                filterLength = filter.length;
                if (filterLength < 1) {
                    log([`Service test names containing ${vars.text.angry + process.argv[0] + vars.text.none} are not found.`]);
                    service.killServers({
                        callback: completeCallback,
                        fail: fail,
                        testType: "selected",
                        total: filterLength
                    });
                } else {
                    log.title("Run Selected Tests", true);
                    service.execute({
                        complete: completeCallback,
                        fail: 0,
                        index: 0,
                        list: filter
                    })
                }
            };
        service.addServers(addCallback);
    } else {
        log.title("Run All Service Tests", true);
        testListRunner("service", completeCallback);
    }
};

export default test_service;