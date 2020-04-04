/* lib/common/deviceShare - Converts the local device list into a flattened object of shares for remote users. */

const deviceShare = function local_invite_deviceShare(devices:devices):deviceShares {
    const deviceList:string[] = Object.keys(devices),
        shareList:deviceShares = {};
        let deviceLength = deviceList.length;
    if (deviceLength > 0) {
        let shares:string[] = [],
            shareLength:number;
        do {
            deviceLength = deviceLength - 1;
            shares = Object.keys(devices[deviceList[deviceLength]]);
            shareLength = shares.length;
            if (shareLength > 0) {
                shareLength = shareLength - 1;
                shareList[shares[shareLength]] = devices[deviceList[deviceLength]].shares[shares[shareLength]];
            } while (shareLength > 0);
        } while (deviceLength > 0);
    }
    return shareList;
};

export default deviceShare;