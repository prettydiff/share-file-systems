
/* lib/terminal/utilities/humanTime - A utility to generate human readable time sequences. */
/*eslint no-console: 0*/
import common from "../../common/common.js";

import vars from "./vars.js";

// converting time durations into something people read
const humanTime = function terminal_utilities_humanTime(finished:boolean):string {
    let finalTime:string    = "";
    const numberString = function terminal_utilities_humanTime_numberString(numb:bigint):string {
            const str:string = numb.toString();
            return (str.length < 2)
                ? `0${str}`
                : str;
        },
        plural       = function terminal_utilities_humanTime_plural(x:bigint, y:string):string {
            if (y === " second") {
                if (x === 1n) {
                    if (nanosecond === 0n) {
                        return `01.${nanoString} second `;
                    }
                    return `01.${nanoString} seconds `;
                }
                return `${numberString(x)}.${nanoString} seconds `;
            }
            if (x === 1n) {
                return `${numberString(x) + y} `;
            }
            return `${numberString(x) + y}s `;
        },
        finalMem:string    = common.prettyBytes(process.memoryUsage().rss),
        elapsed:bigint     = process.hrtime.bigint() - vars.startTime,
        factorSec:bigint   = BigInt(1e9),
        factorMin:bigint   = (60n * factorSec),
        factorHour:bigint  = (3600n * factorSec),
        hours:bigint       = (elapsed / factorHour),
        elapsedHour:bigint = (hours * factorHour),
        minutes:bigint     = ((elapsed - elapsedHour) / factorMin),
        elapsedMin:bigint  = (minutes * factorMin),
        seconds:bigint     = ((elapsed - (elapsedHour + elapsedMin)) / factorSec),
        nanosecond:bigint  = (elapsed - (elapsedHour + elapsedMin + (seconds * factorSec))),
        nanoString:string  = (function terminal_utilities_humanTime_nanoString():string {
            let nano:string = nanosecond.toString(),
                a:number = nano.length;
            if (a < 9) {
                do {
                    nano = `0${nano}`;
                    a = a + 1;
                } while (a < 9);
            }
            return nano;
        }()),
        secondString:string = (finished === true)
            ? plural(seconds, " second")
            : `${numberString(seconds)}.${nanoString}`,
        minuteString:string = (finished === true)
            ? plural(minutes, " minute")
            : numberString(minutes),
        hourString:string = (finished === true)
            ? plural(hours, " hour")
            : numberString(hours);

    //last line for additional instructions without bias to the timer
    if (finished === true) {
        // eslint-disable-next-line
        const logger:(input:string) => void = console.log;
        finalTime = hourString + minuteString + secondString;
        logger("");
        logger(`${finalMem} of memory consumed`);
        logger(`${finalTime}total time`);
        logger("");
    }
    return `${vars.text.cyan}[${hourString}:${minuteString}:${secondString}]${vars.text.none} `;
};

export default humanTime;