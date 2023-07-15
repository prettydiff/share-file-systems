/* lib/terminal/utilities/node - All the Node APIs used in the project stored in a single location. */

import { exec, spawn } from "child_process";
import { createECDH, createHash, createPrivateKey, createPublicKey, Hash, privateEncrypt, publicDecrypt } from "crypto";
import { createReadStream, createWriteStream, lstat, mkdir, open, read, readdir, readFile, readlink, realpath, rename, rm, rmdir, stat, Stats, symlink, unlink, utimes, writeFile } from "fs";
import { createServer as httpServer, get as httpGet, request as httpRequest, STATUS_CODES } from "http";
import { createServer as httpsServer, get as httpsGet, request as httpsRequest } from "https";
import { connect as netConnect, createServer as netCreateServer } from "net";
import { arch, cpus, EOL, freemem, hostname, networkInterfaces, platform, release, totalmem, type } from "os";
import { isAbsolute, resolve, sep } from "path";
import { clearScreenDown, cursorTo } from "readline";
import { Readable } from "stream";
import { StringDecoder } from "string_decoder";
import { connect as tlsConnect, createServer as tlsCreateServer } from "tls";
import { constants, createBrotliCompress, createBrotliDecompress } from "zlib";

// eslint-disable-next-line
const node = {
    child_process: {
        exec: exec,
        spawn: spawn
    },
    crypto: {
        createECDH: createECDH,
        createHash: createHash,
        createPrivateKey: createPrivateKey,
        createPublicKey: createPublicKey,
        privateEncrypt: privateEncrypt,
        publicDecrypt: publicDecrypt,
        Hash: Hash
    },
    fs: {
        createReadStream: createReadStream,
        createWriteStream: createWriteStream,
        lstat: lstat,
        mkdir: mkdir,
        open: open,
        read: read,
        readdir: readdir,
        readFile: readFile,
        readlink: readlink,
        realpath: realpath,
        rename: rename,
        rm: rm,
        rmdir: rmdir,
        stat: stat,
        Stats: Stats,
        symlink: symlink,
        unlink: unlink,
        utimes: utimes,
        writeFile: writeFile
    },
    http: {
        createServer: httpServer,
        get: httpGet,
        request: httpRequest,
        STATUS_CODES: STATUS_CODES
    },
    https: {
        createServer: httpsServer,
        get: httpsGet,
        request: httpsRequest
    },
    net: {
        connect: netConnect,
        createServer: netCreateServer
    },
    os: {
        arch: arch,
        cpus: cpus,
        EOL: EOL,
        freemem: freemem,
        hostname: hostname,
        networkInterfaces: networkInterfaces,
        platform: platform,
        release: release,
        totalmem: totalmem,
        type: type
    },
    path: {
        isAbsolute: isAbsolute,
        resolve: resolve,
        sep: sep
    },
    readline: {
        clearScreenDown: clearScreenDown,
        cursorTo: cursorTo
    },
    stream: {
        Readable: Readable
    },
    stringDecoder: {
        StringDecoder: StringDecoder
    },
    tls: {
        connect: tlsConnect,
        createServer: tlsCreateServer
    },
    zlib: {
        constants: constants,
        createBrotliCompress: createBrotliCompress,
        createBrotliDecompress: createBrotliDecompress
    }
};

export default node;