
/* lib/browser/content/media - A library for executing audio/video calls. */

import common from "../../common/common.js";

import browser from "../utilities/browser.js";
import modal from "../utilities/modal.js";

/**
 * Provides audio/video access from browser APIs and all associated interactions.
 * ```typescript
 * interface module_media {
 *     content: (mediaType:mediaType, height:number, width:number) => Element; // Creates an audio or video HTML element to populate into a media modal.
 *     events: {
 *         selfDrag   : (event:Event) => void; // Allows dragging a thumbnail of local webcam video from one corner of a video modal to another.
 *         videoButton: (event:Event) => void; // Creates a button where a user may initiate a video call with another agent.
 *     };
 *     tools: {
 *         kill : (modal:config_modal) => void;               // Destroys a media stream to the local hardware and closes the corresponding modal.
 *         modal: (mediaConfig:config_mediaModal) => Element; // Creates a media modal populated with content from method *media.element*.
 *     };
 * }
 * type mediaType = "audio" | "video";
 * ``` */
const media:module_media = {

    /* Creates an audio or video element */
    content: function browser_content_media_element(mediaType:mediaType, height:number, width:number):Element {
        if (width / height > 2) {
            width = Math.floor(height * 1.7777777);
        } else if (width / height < 1.25) {
            height = Math.floor(width / 1.77777777);
        }
        let failSelf:Element = null,
            failPrimary:Element = null;
        const container:Element = document.createElement("div"),
            p:Element = document.createElement("p"),
            self:HTMLVideoElement = document.createElement(mediaType) as HTMLVideoElement,
            selfConstraints:MediaStreamConstraints = (mediaType === "video")
                ? {
                    audio: true,
                    video: {
                        height: {
                            ideal: Math.floor(height / 3),
                            max: 360
                        },
                        width: {
                            ideal: Math.floor(width / 3),
                            max: 640
                        }
                    }
                }
                : null,
            apply = function browser_content_media_element_apply(fail:Element, mediaElement:HTMLVideoElement, className:string):void {
                if (fail === null) {
                    // this set of promise and empty functions is necessary to trap an extraneous DOM error
                    // eslint-disable-next-line
                    const play:Promise<void> = mediaElement.play();
                    if (play !== undefined) {
                        play.then(function browser_content_media_element_apply_play():void {
                          return null;
                        })
                        .catch(function browser_content_media_element_apply_error():void {
                          return null;
                        });
                    }
                    mediaElement.setAttribute("class", className);
                    if (className === "video-self") {
                        mediaElement.onmousedown = media.events.selfDrag;
                        mediaElement.ontouchstart = media.events.selfDrag;
                    }
                    container.appendChild(mediaElement);
                } else {
                    failPrimary.setAttribute("class", className);
                    container.appendChild(fail);
                }
            };

        p.innerHTML = "Awaiting response from remote!";
        p.setAttribute("class", "media-primary");

        if (navigator.mediaDevices.getUserMedia !== undefined) {
            if (mediaType === "video") {
                // eslint-disable-next-line
                navigator.mediaDevices.getUserMedia(selfConstraints)
                    .then(function browser_content_media_element_stream(stream:MediaProvider):void {
                        self.srcObject = stream;
                    })
                    .catch(function browser_content_media_element_catch(error:Error):void {
                        failSelf = document.createElement("p");
                        failSelf.innerHTML = `Video stream error: ${error.toString()}`;
                    });
            }
        }
        container.appendChild(p);

        if (mediaType === "video") {
            apply(failSelf, self, "video-self");
        }
        return container;
    },

    events: {

        /* Event handler for dragging the self-video thumbnail around */
        selfDrag: function browser_content_media_selfDrag(event:Event):void {
            const element:HTMLElement = event.target as HTMLElement,
                touch:boolean = (event !== null && event.type === "touchstart"),
                coords = function browser_content_media_selfDrag_coords(eventCoords:Event):[number, number] {
                    const mouseEvent = eventCoords as MouseEvent,
                        touchEvent = eventCoords as TouchEvent,
                        x:number = (touch === true)
                            ? touchEvent.touches[0].clientX
                            : mouseEvent.clientX,
                        y:number = (touch === true)
                            ? touchEvent.touches[0].clientY
                            : mouseEvent.clientY;
                    return [x, y];
                },
                stop = function browser_content_media_selfDrag_stop(stopEvent:Event):void {
                    const end:[number, number] = coords(stopEvent),
                        difference = function browser_content_media_selfDrag_stop_difference(index:number):number {
                            if (start[index] > end[index]) {
                                return start[index] - end[index];
                            }
                            return end[index] - start[index];
                        },
                        distance:[number, number] = [difference(0), difference(1)];
                    event.preventDefault();
                    if (touch === true) {
                        document.ontouchend = null;
                    } else {
                        document.onmouseup = null;
                    }
                    if (distance[0] > distance[1]) {
                        if (start[0] > end[0]) {
                            element.style.removeProperty("right");
                            element.style.left = "0";
                        } else {
                            element.style.removeProperty("left");
                            element.style.right = "0";
                        }
                    } else {
                        if (start[1] > end[1]) {
                            element.style.removeProperty("bottom");
                            element.style.top = "0";
                        } else {
                            element.style.removeProperty("top");
                            element.style.bottom = "0";
                        }
                    }
                    
                },
                start:[number, number] = coords(event);
            event.preventDefault();
            if (touch === true) {
                document.ontouchend = stop;
            } else {
                document.onmouseup = stop;
            }
        },

        /* Launch a media modal from the Video Call button of share modal*/
        videoButton: function browser_message_videoButton(event:Event):void {
            const element:Element = event.target as Element,
                agentContainer:Element = element.getAncestor("tools", "class").parentNode as Element,
                agent:string = agentContainer.getAttribute("data-hash"),
                agentType:agentType = agentContainer.getAttribute("class") as agentType;
            media.tools.modal({
                agent: agent,
                agentType: agentType,
                mediaType: "video"
            });
        }
    },

    tools: {

        /* Kills a media element and its stream */
        kill: function browser_content_media_kill(modal:config_modal):void {
            if (modal !== undefined && modal.type === "media") {
                const body:HTMLElement = document.getElementById(modal.id).getElementsByClassName("body")[0] as HTMLElement,
                    media:HTMLCollectionOf<HTMLVideoElement> = body.getElementsByTagName(modal.status_text) as HTMLCollectionOf<HTMLVideoElement>,
                    mediaLength:number = media.length,
                    stopTracks = function browser_content_media_kill_stopTracks(index:number):void {
                        const stream:MediaStream = media[index].srcObject as MediaStream;
                        if (stream !== null) {
                            stream.getTracks().forEach(function browser_content_media_kill_stopTracks_each(item:MediaStreamTrack) {
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
        },

        /* Start a media engagement and launch a media modal */
        modal: function browser_content_media_modal(mediaConfig:config_mediaModal):Element {
            return modal.content({
                agent: mediaConfig.agent,
                agentIdentity: true,
                agentType: mediaConfig.agentType,
                content: media.content(mediaConfig.mediaType, 400, 565),
                inputs: ["close", "maximize"],
                read_only: true,
                scroll: false,
                status_text: mediaConfig.mediaType,
                title: `${common.capitalize(mediaConfig.mediaType)} Call`,
                type: "media"
            });
        }
    }
};

export default media;