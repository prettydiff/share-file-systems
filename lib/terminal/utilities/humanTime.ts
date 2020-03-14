
/* lib/terminal/utilities/humanTime - A utility to generate human readable time sequences. */
/*eslint no-console: 0*/
import prettyBytes from "../../common/prettyBytes.js";

import vars from "./vars.js";

// converting time durations into something people read
const humanTime = function terminal_humanTime(finished:boolean):string {
    let minuteString:string = "",
        hourString:string   = "",
        secondString:string = "",
        finalTime:string    = "",
        finalMem:string     = "",
        minutes:number      = 0,
        hours:number        = 0,
        memory,
        elapsed:number      = (function terminal_humanTime_elapsed():number {
            const big:number = 1e9,
                differenceTime:[number, number] = process.hrtime(vars.startTime);
            if (differenceTime[1] === 0) {
                return differenceTime[0];
            }
            return differenceTime[0] + (differenceTime[1] / big);
        }());
    const numberString = function terminal_humanTime_numberString(numb:number):string {
            const strSplit:string[] = String(numb).split(".");
            if (strSplit.length > 1) {
                if (strSplit[1].length < 9) {
                    do {
                        strSplit[1]  = strSplit[1] + 0;
                    } while (strSplit[1].length < 9);
                    return `${strSplit[0]}.${strSplit[1]}`;
                }
                if (strSplit[1].length > 9) {
                    return `${strSplit[0]}.${strSplit[1].slice(0, 9)}`;
                }
                return `${strSplit[0]}.${strSplit[1]}`;
            }
            return `${strSplit[0]}`;
        },
        plural       = function terminal_humanTime_plural(x:number, y:string):string {
            if (x !== 1) {
                return `${numberString(x) + y}s `;
            }
            return `${numberString(x) + y} `;
        },
        minute       = function terminal_humanTime_minute():void {
            minutes      = parseInt((elapsed / 60).toString(), 10);
            minuteString = (finished === true)
                ? plural(minutes, " minute")
                : (minutes < 10)
                    ? `0${minutes}`
                    : String(minutes);
            minutes      = elapsed - (minutes * 60);
            secondString = (finished === true)
                ? (minutes === 1)
                    ? " 1 second "
                    : `${numberString(minutes)} seconds `
                : numberString(minutes);
        };
    memory       = process.memoryUsage();
    finalMem     = prettyBytes(memory.rss);

    //last line for additional instructions without bias to the timer
    secondString = numberString(elapsed);
    if (elapsed >= 60 && elapsed < 3600) {
        minute();
    } else if (elapsed >= 3600) {
        hours      = parseInt((elapsed / 3600).toString(), 10);
        elapsed    = elapsed - (hours * 3600);
        hourString = (finished === true)
            ? plural(hours, " hour")
            : (hours < 10)
                ? `0${hours}`
                : String(hours);
        minute();
    } else {
        secondString = (finished === true)
            ? plural(elapsed, " second")
            : secondString;
    }
    if (finished === true) {
        finalTime = hourString + minuteString + secondString;
        console.log("");
        console.log(`${finalMem} of memory consumed`);
        console.log(`${finalTime}total time`);
        console.log("");
    } else {
        if (hourString === "") {
            hourString = "00";
        }
        if (minuteString === "") {
            minuteString = "00";
        }
        // pad single digit seconds with a 0
        if ((/^([0-9]\.)/).test(secondString) === true) {
            secondString = `0${secondString}`;
        }
    }
    return `${vars.text.cyan}[${hourString}:${minuteString}:${secondString}]${vars.text.none} `;
};

export default humanTime;