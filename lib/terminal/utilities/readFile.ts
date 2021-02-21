
/* lib/terminal/utilities/readFile - A utility to read files as text, if text, or as binary, if binary. */
import vars from "./vars.js";

// similar to node's fs.readFile, but determines if the file is binary or text so that it can create either a buffer or text dump
const readFile = function terminal_utilities_readFile(args:readFile):void {
    // arguments
    // * callback - function - What to do next. Args
    // *    args - the arguments passed in
    // *    dump - the file data
    // * id - string, optional - Required for reads directly requested by the user
    // * index - number - if the file is opened as a part of a directory operation then the index represents the index out of the entire directory list
    // * path - string - the file to open
    // * stat - Stats - the Stats object for the given file
    vars
        .node
        .fs
        .open(args.path, "r", function terminal_utilities_readFile_open(ero:Error, fd:number):void {
            const messageSize = (args.stat.size < 100)
                    ? args.stat.size
                    : 100;
            let buff  = Buffer.alloc(Number(messageSize));
            if (ero === null) {
                vars
                    .node
                    .fs
                    .read(
                        fd,
                        buff,
                        0,
                        messageSize,
                        1,
                        function terminal_utilities_readFile_open_read(errA:Error, bytesA:number, bufferA:Buffer):number {
                            let bufferString:string = "";
                            if (errA === null) {
                                bufferString = bufferA.toString("utf8", 0, bufferA.length);
                                bufferString = bufferString.slice(2, bufferString.length - 2);
                                if (vars.binary_check.test(bufferString) === true) {
                                    buff = Buffer.alloc(Number(args.stat.size));
                                    vars
                                        .node
                                        .fs
                                        .read(
                                            fd,
                                            buff,
                                            0,
                                            args.stat.size,
                                            0,
                                            function terminal_utilities_readFile_open_read_readBinary(errB:Error, bytesB:number, bufferB:Buffer):void {
                                                if (errB === null) {
                                                    if (bytesB > 0) {
                                                        vars.node.fs.close(fd, function terminal_utilities_readFile_open_read_readBinary_close():void {
                                                            args.callback(args, bufferB);
                                                        });
                                                    }
                                                }
                                            }
                                        );
                                } else {
                                    vars
                                        .node
                                        .fs
                                        .readFile(args.path, {
                                            encoding: "utf8"
                                        }, function terminal_utilities_readFile_open_read_readFile(errC:Error, dump:string):void {
                                            if (errC === null) {
                                                vars.node.fs.close(fd, function terminal_utilities_readFile_open_read_readFile_close() {
                                                    args.callback(args, dump);
                                                });
                                            }
                                        });
                                }
                                return bytesA;
                            }
                        }
                    );
            }
        });
};

export default readFile;