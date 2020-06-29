/* lib/common/deviceShare - Converts the local device list into a flattened object of shares for remote users. */

const deviceShare = function terminal_common_deviceShare(devices:agents, deleted:agentDeletion):agentShares {
    const deviceList:string[] = Object.keys(devices),
        shareList:agentShares = {};
    let deviceLength = deviceList.length;
    if (deviceLength > 0) {
        let shares:string[] = [],
            shareLength:number;
        do {
            deviceLength = deviceLength - 1;
            if (deleted === null || deleted.device.indexOf(deviceList[deviceLength]) < 0) {
                shares = Object.keys(devices[deviceList[deviceLength]].shares);
                shareLength = shares.length;
                if (shareLength > 0) {
                    do {
                        shareLength = shareLength - 1;
                        shareList[shares[shareLength]] = devices[deviceList[deviceLength]].shares[shares[shareLength]];
                    } while (shareLength > 0);
                }
            }
        } while (deviceLength > 0);
    }
    return shareList;
};

export default deviceShare;