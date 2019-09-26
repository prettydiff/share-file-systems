
/*eslint no-console: 0*/
import vars from "./vars.js";

// converting time durations into something people read
const humanTime = function node_apps_humanTime(finished:boolean):string {
    let minuteString:string = "",
        hourString:string   = "",
        secondString:string = "",
        finalTime:string    = "",
        finalMem:string     = "",
        minutes:number      = 0,
        hours:number        = 0,
        memory,
        elapsed:number      = (function node_apps_humanTime_elapsed():number {
            const big:number = 1e9,
                differenceTime:[number, number] = process.hrtime(vars.startTime);
            if (differenceTime[1] === 0) {
                return differenceTime[0];
            }
            return differenceTime[0] + (differenceTime[1] / big);
        }());
    const numberString = function node_apps_humanTime_numberString(numb:number):string {
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
        prettyBytes  = function node_apps_humanTime_prettyBytes(an_integer:number):string {
            //find the string length of input and divide into triplets
            let output:string = "",
                length:number  = an_integer
                    .toString()
                    .length;
            const triples:number = (function node_apps_humanTime_prettyBytes_triples():number {
                    if (length < 22) {
                        return Math.floor((length - 1) / 3);
                    }
                    //it seems the maximum supported length of integer is 22
                    return 8;
                }()),
                //each triplet is worth an exponent of 1024 (2 ^ 10)
                power:number   = (function node_apps_humanTime_prettyBytes_power():number {
                    let a = triples - 1,
                        b = 1024;
                    if (triples === 0) {
                        return 0;
                    }
                    if (triples === 1) {
                        return 1024;
                    }
                    do {
                        b = b * 1024;
                        a = a - 1;
                    } while (a > 0);
                    return b;
                }()),
                //kilobytes, megabytes, and so forth...
                unit    = [
                    "",
                    "KB",
                    "MB",
                    "GB",
                    "TB",
                    "PB",
                    "EB",
                    "ZB",
                    "YB"
                ];

            if (typeof an_integer !== "number" || Number.isNaN(an_integer) === true || an_integer < 0 || an_integer % 1 > 0) {
                //input not a positive integer
                output = "0.00B";
            } else if (triples === 0) {
                //input less than 1000
                output = `${an_integer}B`;
            } else {
                //for input greater than 999
                length = Math.floor((an_integer / power) * 100) / 100;
                output = length.toFixed(2) + unit[triples];
            }
            return output;
        },
        plural       = function node_apps_humanTime_plural(x:number, y:string):string {
            if (x !== 1) {
                return `${numberString(x) + y}s `;
            }
            return `${numberString(x) + y} `;
        },
        minute       = function node_apps_humanTime_minute():void {
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