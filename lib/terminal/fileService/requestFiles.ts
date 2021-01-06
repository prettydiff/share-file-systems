/* lib/terminal/fileService/requestFiles - Pulls files from one agent to another. */

import { Hash } from "crypto";
import { ReadStream, WriteStream } from "fs";
import { IncomingMessage } from "http";
import { Stream, Writable } from "stream";
import { BrotliDecompress } from "zlib";

import common from "../../common/common.js";
import directory from "../commands/directory.js";
import error from "../utilities/error.js";
import httpClient from "../server/httpClient.js";
import mkdir from "../commands/mkdir.js";
import response from "../server/response.js";
import serverVars from "../server/serverVars.js";
import vars from "../utilities/vars.js";

import copyMessage from "./copyMessage.js";
import httpRequest from "./httpRequest.js";

const requestFiles = function terminal_fileService_requestFiles(config:fileServiceRequestFiles):void {
    let writeActive:boolean = false,
        writtenSize:number = 0,
        writtenFiles:number = 0,
        a:number = 0,
        activeRequests:number = 0,
        countDir:number = 0,
        countFile:number = 0;
    const fileQueue:[string, number, string, Buffer][] = [],
        hashFail:string[] = [],
        listLength = config.fileData.list.length,
        cutList:[string, string][] = [],
        // prepares the HTTP response message if all requested files are written
        respond = function terminal_fileService_requestFiles_respond():void {
            const cut = function terminal_fileService_requestFiles_respond_cut():void {
                if (config.data.cut === true) {
                    const types:string[] = [];
                    cutList.sort(function terminal_fileService_requestFiles_respond_cut_cutSort(itemA:[string, string], itemB:[string, string]):number {
                        if (itemA[1] === "directory" && itemB[1] !== "directory") {
                            return 1;
                        }
                        return -1;
                    });
                    config.data.location = [];
                    cutList.forEach(function terminal_fileService_requestFiles_respond_cut_cutList(value:[string, string]):void {
                        config.data.location.push(value[0]);
                        types.push(value[1]);
                    });
                    config.data.action = "fs-cut-remove";
                    config.data.name = JSON.stringify(types);
                    config.data.watch = config.fileData.list[0][0].slice(0, config.fileData.list[0][0].lastIndexOf(config.fileData.list[0][2])).replace(/(\/|\\)+$/, "");
                    httpRequest({
                        callback: function terminal_fileService_requestFiles_respond_cut_cutCall(message:Buffer|string):void {
                            if (message.toString().indexOf(",\"status\":") > 0) {
                                vars.broadcast("fs-update-remote", message.toString());
                            } else {
                                vars.broadcast("file-list-status", message.toString());
                            }
                        },
                        data: config.data,
                        errorMessage: "Error requesting file removal for fs-cut.",
                        serverResponse: config.serverResponse,
                        stream: httpClient.stream
                    });
                }
            };
            vars.testLogger("fileService", "requestFiles respond", "When all requested artifacts are written write the HTTP response to the browser.");
            directory({
                callback: function terminal_fileService_requestFiles_respond_cut_finalDir(dirItems:directoryList):void {
                    const status:completeStatus = {
                            countFile: countFile,
                            failures: hashFail.length,
                            percent: 100,
                            writtenSize: writtenSize
                        },
                        output:copyStatus = {
                            failures: hashFail,
                            fileList: dirItems,
                            id: `local-${config.data.name.replace(/\\/g, "\\\\")}`,
                            message: copyMessage(status),
                        };
                    vars.broadcast("file-list-status", JSON.stringify(output));
                    output.id = `remote-${config.data.id}`;
                    response({
                        message: JSON.stringify(output),
                        mimeType: "application/json",
                        responseType: "file-list-status",
                        serverResponse: config.serverResponse
                    });
                },
                depth: 2,
                exclusions: [],
                logRecursion: config.logRecursion,
                mode: "read",
                path: config.data.name,
                symbolic: true
            });
            cut();
        },
        // handler to write files if files are written in a single shot, otherwise files are streamed with writeStream
        writeFile = function terminal_fileService_requestFiles_writeFile(index:number):void {
            const fileName:string = fileQueue[index][0];
            vars.testLogger("fileService", "writeFile", "Writing files in a single shot is more efficient, due to concurrency, than piping into a file from an HTTP stream but less good for integrity.");
            vars.node.fs.writeFile(config.data.name + vars.sep + fileName, fileQueue[index][3], function terminal_fileServices_requestFiles_writeFile_write(wr:nodeError):void {
                const hashFailLength:number = hashFail.length;
                if (wr !== null) {
                    error([`Error writing file ${fileName} from remote agent ${config.data.agent}`, wr.toString()]);
                    hashFail.push(fileName);
                } else {
                    const status:completeStatus = {
                            countFile: countFile,
                            failures: hashFailLength,
                            percent: ((writtenSize / config.fileData.fileSize) * 100),
                            writtenSize: writtenSize
                        },
                        output:copyStatus = {
                            failures: [],
                            id: `local-${config.data.name.replace(/\\/g, "\\\\")}`,
                            message: copyMessage(status)
                        };
                    cutList.push([fileQueue[index][2], "file"]);
                    countFile = countFile + 1;
                    writtenFiles = writtenFiles + 1;
                    writtenSize = writtenSize + fileQueue[index][1];
                    status.countFile = countFile;
                    status.percent = ((writtenSize / config.fileData.fileSize) * 100);
                    status.writtenSize = writtenSize;
                    output.message = copyMessage(status);
                    vars.broadcast("file-list-status", JSON.stringify(output));
                }
                if (index < fileQueue.length - 1) {
                    terminal_fileService_requestFiles_writeFile(index + 1);
                } else {
                    if (countFile + countDir + hashFailLength === listLength) {
                        respond();
                    } else {
                        writeActive = false;
                    }
                }
            });
        },
        // stream handler if files are streamed, otherwise files are written in a single shot using writeFile
        writeStream = function terminal_fileService_requestFiles_writeStream(fileResponse:IncomingMessage):void {
            const fileName:string = <string>fileResponse.headers.file_name,
                filePath:string = config.data.name + vars.sep + fileName,
                decompress:BrotliDecompress = (fileResponse.headers.compression === "true")
                    ? vars.node.zlib.createBrotliDecompress()
                    : null,
                writeStream:WriteStream = vars.node.fs.createWriteStream(filePath),
                hash:Hash = vars.node.crypto.createHash("sha3-512"),
                fileError = function terminal_fileService_requestFiles_writeStream_fileError(message:string, fileAddress:string):void {
                    hashFail.push(fileAddress);
                    error([message]);
                    vars.node.fs.unlink(filePath, function terminal_fileService_requestFiles_writeStream_fileError_unlink(unlinkErr:nodeError):void {
                        if (unlinkErr !== null) {
                            error([unlinkErr.toString()]);
                        }
                    });
                };
            vars.testLogger("fileService", "requestFiles writeStream", "Writing files to disk as a byte stream ensures the file's integrity so that it can be verified by hash comparison.");
            if (fileResponse.headers.compression === "true") {
                fileResponse.pipe(decompress).pipe(writeStream);
            } else {
                fileResponse.pipe(writeStream);
            }
            fileResponse.on("data", function terminal_fileService_requestFiles_writeStream_data():void {
                const written:number = writeStream.bytesWritten + writtenSize,
                    status:completeStatus = {
                        countFile: countFile,
                        failures: hashFail.length,
                        percent: (config.fileData.fileSize === 0 || config.fileData.fileSize === undefined || serverVars.testType === "service")
                            ? 100
                            : ((written / config.fileData.fileSize) * 100),
                        writtenSize: written
                    },
                    output:copyStatus = {
                        failures: [],
                        id: `local-${config.data.name.replace(/\\/g, "\\\\")}`,
                        message: copyMessage(status)
                    };
                vars.broadcast("file-list-status", JSON.stringify(output));
            });
            fileResponse.on("end", function terminal_fileService_requestFiles_writeStream_end():void {
                const hashStream:ReadStream = vars.node.fs.ReadStream(filePath);
                decompress.end();
                hashStream.pipe(hash);
                hashStream.on("close", function terminal_fileServices_requestFiles_writeStream_end_hash():void {
                    const hashString:string = hash.digest("hex");
                    if (hashString === fileResponse.headers.hash) {
                        cutList.push([<string>fileResponse.headers.cut_path, "file"]);
                        countFile = countFile + 1;
                        writtenFiles = writtenFiles + 1;
                        writtenSize = writtenSize + config.fileData.list[a][3];
                    } else {
                        fileError(`Hashes do not match for file ${fileName} from ${config.data.agentType} ${serverVars[config.data.agentType][config.data.agent].name}`, filePath);
                    }
                    a = a + 1;
                    if (a < listLength) {
                        requestFile();
                    } else {
                        respond();
                    }
                });
            });
            fileResponse.on("error", function terminal_fileService_requestFiles_writeStream_error(error:nodeError):void {
                fileError(error.toString(), filePath);
            });
        },
        // the callback for each file request
        fileRequestCallback = function terminal_fileService_requestFiles_fileRequestCallback(fileResponse:IncomingMessage):void {
            const fileChunks:Buffer[] = [],
                fileName:string = <string>fileResponse.headers.file_name,
                writeable:Writable = new Stream.Writable(),
                responseEnd = function terminal_fileService_requestFiles_fileRequestCallback_responseEnd(file:Buffer):void {
                    const hash:Hash = vars.node.crypto.createHash("sha3-512").update(file),
                        hashString:string = hash.digest("hex");
                    vars.testLogger("fileService", "requestFiles fileRequestCallback responseEnd", "Handler for completely received HTTP response of requested artifact.");
                    if (hashString === fileResponse.headers.hash) {
                        fileQueue.push([fileName, Number(fileResponse.headers.file_size), <string>fileResponse.headers.cut_path, file]);
                        if (writeActive === false) {
                            writeActive = true;
                            writeFile(fileQueue.length - 1);
                        }
                    } else {
                        hashFail.push(fileName);
                        error([`Hashes do not match for file ${fileName} ${config.data.agentType} ${serverVars[config.data.agentType][config.data.agent].name}`]);
                        if (countFile + countDir + hashFail.length === listLength) {
                            respond();
                        }
                    }
                    activeRequests = activeRequests - 1;
                    if (a < listLength) {
                        requestFile();
                    }
                };
            vars.testLogger("fileService", "requestFiles fileRequestCallback", "Callback for the HTTP artifact request if the requests are not streams but the files are written as streams.");
            writeable.write = function (writeableChunk:Buffer):boolean {
                fileChunks.push(writeableChunk);
                return false;
            };
            fileResponse.on("data", function terminal_fileServices_requestFiles_fileRequestCallback_data(fileChunk:Buffer):void {
                fileChunks.push(fileChunk);
            });
            fileResponse.on("end", function terminal_fileServices_requestFiles_fileRequestCallback_end():void {
                if (fileResponse.headers.compression === "true") {
                    vars.node.zlib.brotliDecompress(Buffer.concat(fileChunks), function terminal_fileServices_requestFiles_fileRequestCallback_data_decompress(errDecompress:nodeError, file:Buffer):void {
                        if (errDecompress !== null) {
                            error([
                                `Decompression error on file ${vars.text.angry + fileName + vars.text.none}.`,
                                errDecompress.toString()
                            ]);
                            return;
                        }
                        responseEnd(file);
                    });
                } else {
                    responseEnd(Buffer.concat(fileChunks));
                }
            });
            fileResponse.on("error", function terminal_fileServices_requestFiles_fileRequestCallback_error(fileError:nodeError):void {
                error([fileError.toString()]);
            });
        },
        // after directories are created, if necessary, request the each file from the file list
        requestFile = function terminal_fileService_requestFiles_requestFile():void {
            const writeCallback:(message:IncomingMessage) => void = (config.fileData.stream === true)
                ? writeStream
                : fileRequestCallback;
            vars.testLogger("fileService", "requestFiles requestFile", "Issue the HTTP request for the given artifact and recursively request the next artifact if not streamed.");
            config.data.depth = config.fileData.list[a][3];
            if (config.data.copyAgent !== serverVars.hashDevice) {
                const status:completeStatus = {
                    countFile: countFile,
                    failures: hashFail.length,
                    percent: (config.fileData.fileSize === 0 || config.fileData.fileSize === undefined || serverVars.testType === "service")
                        ? 100
                        : ((writtenSize / config.fileData.fileSize) * 100),
                    writtenSize: writtenSize
                };
                vars.testLogger("fileService", "requestFiles requestFile", "If copyAgent is not the local device then update the status data.");
                config.data.id = `local-${config.data.name.replace(/\\/g, "\\\\")}|${copyMessage(status)}`;
            }
            config.data.location = [config.fileData.list[a][0]];
            config.data.remoteWatch = config.fileData.list[a][2];
            httpRequest({
                callback: null,
                data: config.data,
                errorMessage: `Error on requesting file ${config.fileData.list[a][2]} from ${serverVars[config.data.agentType][config.data.agent].name}`,
                serverResponse: config.serverResponse,
                stream: writeCallback
            });
            if (config.fileData.stream === false) {
                a = a + 1;
                if (a < listLength) {
                    activeRequests = activeRequests + 1;
                    if (activeRequests < 8) {
                        terminal_fileService_requestFiles_requestFile();
                    }
                }
            }
        },
        // callback to mkdir
        dirCallback = function terminal_fileService_requestFiles_dirCallback():void {
            a = a + 1;
            countDir = countDir + 1;
            if (a < listLength) {
                if (config.fileData.list[a][1] === "directory") {
                    newDir();
                } else {
                    config.data.action = <serviceFS>config.data.action.replace(/((list)|(request))/, "file");
                    requestFile();
                }
            }
            if (countFile + countDir === listLength) {
                vars.testLogger("fileService", "requestFiles dirCallback", "All artifacts accounted for, so write response.");
                respond();
            }
        },
        // recursively create new directories as necessary
        newDir = function terminal_fileService_requestFiles_makeLists():void {
            mkdir(config.data.name + vars.sep + config.fileData.list[a][2], dirCallback, false);
            cutList.push([config.fileData.list[a][0], "directory"]);
        };
    if (config.fileData.stream === true) {
        const filePlural:string = (config.fileData.fileCount === 1)
                ? ""
                : "s",
            output:copyStatus = {
                failures: [],
                id: `local-${config.data.name.replace(/\\/g, "\\\\")}`,
                message: `Copy started for ${config.fileData.fileCount} file${filePlural} at ${common.prettyBytes(config.fileData.fileSize)} (${common.commas(config.fileData.fileSize)} bytes).`
            };
        vars.broadcast("file-list-status", JSON.stringify(output));
    }
    vars.testLogger("fileService", "requestFiles", "A giant function to request one or more files from a remote/user device.  Before files are requested the directory structure is locally created.");
    if (config.fileData.list[0][1] === "directory") {
        newDir();
    } else {
        config.data.action = <serviceFS>config.data.action.replace(/((list)|(request))/, "file");
        requestFile();
    }
};

export default requestFiles;