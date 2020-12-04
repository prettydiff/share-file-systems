/* lib/terminal/utilities/time - Generates a timestamp in format: "[HH:mm:ss:mil] message". */

import vars from "./vars.js";

const time = function terminal_server_serverWatch_time(message:string, difference:boolean, reference:number):[string, number] {
    const date:Date = new Date(),
        dateValue:number = date.valueOf(),
        dateArray:string[] = [],
        output:string[] = [],
        duration = function terminal_server_serverWatch_time_duration():string {
            let hours:number = 0,
                minutes:number = 0,
                seconds:number = 0,
                span:number = dateValue - reference,
                list:string[] = [];
            if (span > 3600000) {
                hours = Math.floor(span / 3600000);
                span = span - (hours * 3600000);
            }
            list.push(hours.toString());
            if (list[0].length < 2) {
                list[0] = `0${list[0]}`;
            }
            if (span > 60000) {
                minutes = Math.floor(span / 60000);
                span = span - (minutes * 60000);
            }
            list.push(minutes.toString());
            if (list[1].length < 2) {
                list[1] = `0${list[1]}`;
            }
            if (span > 1000) {
                seconds = Math.floor(span / 1000);
                span = span - (seconds * 1000);
            }
            list.push(seconds.toString());
            if (list[2].length < 2) {
                list[2] = `0${list[2]}`;
            }
            list.push(span.toString());
            if (list[3].length < 3) {
                do {
                    list[3] = `0${list[3]}`;
                } while (list[3].length < 3);
            }
            return `[${vars.text.bold + vars.text.purple + list.join(":") + vars.text.none}] ${message}`;
        };
    if (difference === true) {
        return [duration(), dateValue];
    }
    let hours:string = String(date.getHours()),
        minutes:string = String(date.getMinutes()),
        seconds:string = String(date.getSeconds()),
        milliSeconds:string = String(date.getMilliseconds());
    if (hours.length === 1) {
        hours = `0${hours}`;
    }
    if (minutes.length === 1) {
        minutes = `0${minutes}`;
    }
    if (seconds.length === 1) {
        seconds = `0${seconds}`;
    }
    if (milliSeconds.length < 3) {
        do {
            milliSeconds = `0${milliSeconds}`;
        } while (milliSeconds.length < 3);
    }
    dateArray.push(hours);
    dateArray.push(minutes);
    dateArray.push(seconds);
    dateArray.push(milliSeconds);
    return [`[${vars.text.cyan + dateArray.join(":") + vars.text.none}] ${message}`, dateValue];
};

export default time;