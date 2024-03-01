
/* lib/browser/utilities/media_kill - Closes a media modal and closes all associated streams. */

const media_kill = function browser_utilities_mediaKill(modal:config_modal):void {
    if (modal !== undefined && modal.type === "media") {
        const body:HTMLElement = document.getElementById(modal.id).getElementsByClassName("body")[0] as HTMLElement,
            media:HTMLCollectionOf<HTMLVideoElement> = body.getElementsByTagName(modal.text_value) as HTMLCollectionOf<HTMLVideoElement>,
            mediaLength:number = media.length,
            stopTracks = function browser_utilities_mediaKill_stopTracks(index:number):void {
                const stream:MediaStream = media[index].srcObject as MediaStream;
                if (stream !== null) {
                    stream.getTracks().forEach(function browser_utilities_mediaKill_stopTracks_each(item:MediaStreamTrack) {
                        item.stop();
                    });
                }
            };
        if (mediaLength > 0) {
            stopTracks(0);
            media[0].src = "";
            media[0].pause();
            if (mediaLength > 1) {
                stopTracks(1);
                media[1].src = "";
                media[1].pause();
            }
        }
        body.onclick = null;
        body.removeChild(body.firstChild);
    }
};

export default media_kill;