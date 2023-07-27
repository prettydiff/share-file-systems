/* lib/terminal/utilities/writeStream - A utility to pipe from a read stream to a write stream. */

import node from "./node.js";

const writeStream = function terminal_utilities_writeStream(config:config_writeStream):void {
    const readStream:node_fs_ReadStream  = node.fs.createReadStream(config.source),
        writeStream:node_fs_WriteStream = node.fs.createWriteStream(config.destination, {mode: config.stat.mode});
    let errorFlag:boolean = false;
    readStream.on("error", function terminal_utilities_writeStream_readError(error:node_error):void {
        config.callback(error);
        errorFlag = true;
    });
    if (errorFlag === false) {
        writeStream.on("error", function terminal_utilities_writeStream_writeError(error:node_error):void {
            config.callback(error);
            errorFlag = true;
        });
        if (errorFlag === false) {
            writeStream.on("open", function terminal_utilities_writeStream_writeOpen():void {
                readStream.pipe(writeStream);
            });
            writeStream.once("finish", function terminal_utilities_writeStream_writeStream():void {
                node.fs.utimes(
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