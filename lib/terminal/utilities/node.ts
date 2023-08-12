/* lib/terminal/utilities/node - All the Node APIs used in the project stored in a single location. */

import { exec, spawn } from "node:child_process";
import { constants as constantsCrypto, createHash, createPrivateKey, createPublicKey, generateKeyPair, Hash, privateDecrypt, publicEncrypt } from "node:crypto";
import { createReadStream, createWriteStream, lstat, mkdir, open, read, readdir, readFile, readlink, realpath, rename, rm, rmdir, stat, Stats, symlink, unlink, utimes, writeFile } from "node:fs";
import { createServer as httpServer, get as httpGet, request as httpRequest, STATUS_CODES } from "node:http";
import { createServer as httpsServer, get as httpsGet, request as httpsRequest } from "node:https";
import { connect as netConnect, createServer as netCreateServer } from "node:net";
import { arch, cpus, EOL, freemem, hostname, networkInterfaces, platform, release, totalmem, type } from "node:os";
import { isAbsolute, resolve, sep } from "node:path";
import { clearScreenDown, cursorTo } from "node:readline";
import { Readable } from "node:stream";
import { StringDecoder } from "node:string_decoder";
import { connect as tlsConnect, createServer as tlsCreateServer } from "node:tls";
import { constants as constantsZlib, createBrotliCompress, createBrotliDecompress } from "node:zlib";

// eslint-disable-next-line
const node = {
    child_process: {
        exec: exec,
        spawn: spawn
    },
    crypto: {
        constants: constantsCrypto,
        createHash: createHash,
        createPrivateKey: createPrivateKey,
        createPublicKey: createPublicKey,
        generateKeyPair: generateKeyPair,
        privateDecrypt: privateDecrypt,
        publicEncrypt: publicEncrypt,
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
        constants: constantsZlib,
        createBrotliCompress: createBrotliCompress,
        createBrotliDecompress: createBrotliDecompress
    }
};

export default node;