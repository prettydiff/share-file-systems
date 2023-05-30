/* lib/terminal/utilities/writeStream - A utility to pipe from a read stream to a write stream. */

import { createReadStream, createWriteStream, utimes } from "fs";
import { Stream, Writable } from "stream";

const writeStream = function terminal_utilities_writeStream(config:config_writeStream):void {
    const readStream:Stream  = createReadStream(config.source),
        writeStream:Writable = createWriteStream(config.destination, {mode: config.stat.mode});
    let errorFlag:boolean = false;
    readStream.on("error", function terminal_utilities_writeStream_readError(error:Error):void {
        config.callback(error);
        errorFlag = true;
    });
    if (errorFlag === false) {
        writeStream.on("error", function terminal_utilities_writeStream_writeError(error:Error):void {
            config.callback(error);
            errorFlag = true;
        });
        if (errorFlag === false) {
            writeStream.on("open", function terminal_utilities_writeStream_writeOpen():void {
                readStream.pipe(writeStream);
            });
            writeStream.once("finish", function terminal_utilities_writeStream_writeStream():void {
                utimes(
                    config.destination,
                    new Date(config.stat.atimeMs),
                    new Date(config.stat.mtimeMs),
                    function terminal_utilities_writeStream_writeStream_callback():void {
                        config.callback(null);
                    }
                );
            });
        }
    }
};

export default writeStream;