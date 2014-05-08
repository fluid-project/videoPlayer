/*
Copyright 2009 University of Toronto
Copyright 2011 Charly Molter
Copyright 2011-2014 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/*global jQuery, fluid_1_5, MediaElement, mejs*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_5 = fluid_1_5 || {};

(function ($, fluid) {

    /*********************************************************************************
     * Video Player Media                                                            *
     *                                                                               *
     * Composes markup for video sources and responds to the video events            *
     *********************************************************************************/

    fluid.defaults("fluid.videoPlayer.media", {
        gradeNames: ["fluid.viewRelayComponent", "autoInit"],
        modelListeners: {
            play: "{media}.play",
            muted: "{media}.mute",
            volume: "{media}.setMediaVolume"
        },
        events: {
            onEventBindingReady: null,
            onTimeUpdate: null, // picked up by intervalEventsConductor.events.onTimeUpdate
            afterInit: null,
            onReady: {
                events: {
                    eventBindingReady: "onEventBindingReady",
                    afterInit: "afterInit"
                }
            },

            // local events to mirror the media element events
            onMediaElementCanPlay: null,
            onMediaElementCanPlayThrough: null,
            onMediaElementLoadedMetadata: null,
            onMediaElementLoadedData: null,
            onMediaElementVolumeChange: null,
            onMediaElementEnded: null,
            onMediaElementTimeUpdate: null,
            onFullScreen: null,
            onExitFullScreen: null,
            
            onLoadedMetadata: null
        },
        listeners: {
            onCreate: {
                listener: "fluid.videoPlayer.media.init",
                args: ["{media}"]
            },
            onMediaElementCanPlay: [
                {
                    listener: "{media}.applier.fireChangeRequest",
                    args: {
                        path: "canPlay",
                        value: true
                    }
                }, 
                "{media}.refresh"
            ],
            onMediaElementLoadedMetadata: [{
                listener: "{media}.applier.fireChangeRequest",
                args: [{path: "totalTime", value: "{media}.model.mediaElementVideo.duration"}]
            }, {
                listener: "{media}.applier.fireChangeRequest",
                args: [{path: "currentTime", value: "{media}.model.mediaElementVideo.currentTime"}]
            }, {
                listener: "fluid.videoPlayer.media.updateStartTime",
                args: ["{media}"]
            }, {
                listener: "{media}.events.onLoadedMetadata.fire"
            }],
            onMediaElementVolumeChange: "fluid.videoPlayer.media.handleMediaVolumeChange",
            onMediaElementEnded: [{
                listener: "{media}.applier.fireChangeRequest",
                args: [{path: "play", value: false}]
            }, {
                listener: "{media}.applier.fireChangeRequest",
                args: [{path: "currentTime", value: 0}]
            }],
            onMediaElementTimeUpdate: "fluid.videoPlayer.media.handleTimeUpdate"
        },
        invokers: {
            renderSources: { funcName: "fluid.videoPlayer.media.renderSources", args: ["{media}"] },
            bindMediaDOMEvents: { funcName: "fluid.videoPlayer.media.bindMediaDOMEvents", args: ["{media}"] },
            updateCurrentTime: {
                funcName: "fluid.videoPlayer.media.updateCurrentTime",
                args: ["{media}", "{arguments}.0", "{arguments}.1"]
            },
            setTime: { funcName: "fluid.videoPlayer.media.setTime", args: ["{media}", "{arguments}.0"] },
            setMediaVolume: { funcName: "fluid.videoPlayer.media.setMediaVolume", args: ["{media}", "{arguments}.0.value", "{arguments}.0.oldValue", "{arguments}"] },
            play: { funcName: "fluid.videoPlayer.media.play", args: ["{media}"] },
            mute: { funcName: "fluid.videoPlayer.media.mute", args: ["{media}"] },
            refresh: { funcName: "fluid.videoPlayer.media.refresh", args: ["{media}"] },
            requestFullScreen: { funcName: "fluid.videoPlayer.media.requestFullScreen", args: ["{media}", "{arguments}.0"] },
            cancelFullScreen: { funcName: "fluid.videoPlayer.media.cancelFullScreen", args: ["{media}"] },
        },
        mediaEventBindings: {
            canplay: "onMediaElementCanPlay",
            canplaythrough: "onMediaElementCanPlayThrough",
            loadeddata: "onMediaElementLoadedData",
            loadedmetadata: "onMediaElementLoadedMetadata",
            volumechange: "onMediaElementVolumeChange",
            ended: "onMediaElementEnded",
            timeupdate: "onMediaElementTimeUpdate"
        },
        sourceRenderers: {
            "video/mp4": "fluid.videoPlayer.media.createSourceMarkup.html5SourceTag",
            "video/webm": "fluid.videoPlayer.media.createSourceMarkup.html5SourceTag",
            "video/ogg": "fluid.videoPlayer.media.createSourceMarkup.html5SourceTag",
            "video/ogv": "fluid.videoPlayer.media.createSourceMarkup.html5SourceTag",
            "video/youtube": "fluid.videoPlayer.media.createSourceMarkup.html5SourceTag"
        },
        sources: [],
        components: {
            mediaEventBinder: {
                type: "fluid.videoPlayer.eventBinder",
                createOnEvent: "onEventBindingReady"
            }
        }
    });

    fluid.videoPlayer.media.createSourceMarkup = {
        html5SourceTag: function (videoPlayer, mediaSource) {
            var sourceTag = $("<source />");
            sourceTag.attr(mediaSource);
            videoPlayer.container.append(sourceTag);
            return sourceTag;
        }
    };
    
    fluid.videoPlayer.media.renderSources = function (that) {
        $.each(that.options.sources, function (idx, source) {
            var renderer = that.options.sourceRenderers[source.type];
            if ($.isFunction(renderer)) {
                renderer.apply(null, [that, source]);
            } else {
                fluid.invokeGlobalFunction(renderer, [that, source]);
            }
        });
    };

    fluid.videoPlayer.media.handleMediaVolumeChange = function (that, evt) {
        var mediaVolume = that.model.mediaElementVideo.volume * 100;
        if (mediaVolume === that.model.volume) {
            return;
        }
        // Don't fire self-generated volume changes on zero when muted, to avoid cycles
        if (!that.model.muted || mediaVolume !== 0) {
            that.applier.change("volume", mediaVolume);
        }
    };
    
    fluid.videoPlayer.media.handleTimeUpdate = function (that, evt) {
        // With youtube videos, "loadedmetadata" event is not triggered at the initial load,
        // so the video duration is not set but the duration does get returned when the video is at play.
        if (that.model.totalTime === 0) {
            that.applier.change("totalTime", that.model.mediaElementVideo.duration);
        }
        
        // in IE8, the mediaElement's currentTime isn't updated, but the event carries a currentTime field
        var currentTime = evt.currentTime || that.model.mediaElementVideo.currentTime || 0;

        // In IE8 (i.e. Flash fallback), the currentTime property doesn't get properly
        // updated after a call to setCurrentTime if the video is paused.
        // This workaround will use the scrubTime instead, in these cases.
        // see also: https://github.com/johndyer/mediaelement/issues/516
        //           https://github.com/johndyer/mediaelement/issues/489
        if (that.model.mediaElementVideo.paused && that.model.scrubTime) {
            if (that.model.scrubTime !== currentTime) {
                // if currentTime hasn't been properly updated, don't use it, use the scrubTime
                currentTime = that.model.scrubTime;
            } else if (currentTime >= that.model.scrubTime) {
                // if currentTime has caught up with scrubTime, we don't need scrubTime anymore.
                // if we don't wait for currentTime to catch up, scrubbing with the keyboard
                // jumps and doesn't progress.
                that.applier.change("scrubTime", null);
            }
        }

        var buffered = that.model.mediaElementVideo.buffered || 0;

        that.events.onTimeUpdate.fire(currentTime, buffered);
    };

    fluid.videoPlayer.media.updateStartTime = function (that) {
        var newStartTime = that.model.mediaElementVideo.startTime || 0;
        that.applier.change("startTime", newStartTime);
    };

    fluid.videoPlayer.media.bindMediaDOMEvents = function (that) {
        MediaElement(that.container[0], {success: function (mediaElementVideo) {
            that.model.mediaElementVideo = mediaElementVideo;

            // IE8 workaround to trigger the video initial loading. Otherwise, a blank is displayed at the video area
            // Html5 browsers tolerate this workaround without initiatively playing the video
            mediaElementVideo.play();

            fluid.each(that.options.mediaEventBindings, function (localEvtName, mediaElEvtName) {
                mediaElementVideo.addEventListener(mediaElEvtName, function (evt) {
                    that.events[localEvtName].fire(that, evt);
                });
            });
            
            // Need to add the fullScreenEvent separately as it can be different depending on the browser
            var fullScreenEventName = fluid.get(mejs, "MediaFeatures.fullScreenEventName");
            if (fullScreenEventName) {
                document.addEventListener(fullScreenEventName, function (evt) {
                    that.events[mejs.MediaFeatures.isFullScreen() ? "onFullScreen" : "onExitFullScreen"].fire(that, evt);
                });
            }

            that.events.onEventBindingReady.fire(that);
        }});

    };

    fluid.videoPlayer.media.updateCurrentTime = function (that, currentTime, buffered) {
        // buffered is a TimeRanges object (http://www.whatwg.org/specs/web-apps/current-work/#time-ranges)
        var bufferEnd = (buffered && buffered.length > 0) ? buffered.end(buffered.length - 1) : 0;

        that.applier.fireChangeRequest({
            path: "currentTime",
            value: currentTime
        });
        that.applier.fireChangeRequest({
            path: "bufferEnd",
            value: bufferEnd
        });
    };

    fluid.videoPlayer.media.setTime = function (that, time) {
        if (!that.model.mediaElementVideo) { return; }

        that.applier.change("scrubTime", time);
        that.model.mediaElementVideo.setCurrentTime(time);
    };

    fluid.videoPlayer.media.setMediaVolume = function (that, newValue, oldValue) {
        if (!that.model.mediaElementVideo) { return; }
        if (newValue !== oldValue) {
            that.model.mediaElementVideo.setVolume(that.model.volume / 100);
        }
    };

    fluid.videoPlayer.media.play = function (that) {
        if (!that.model.mediaElementVideo) { return; }

        if (that.model.play === true) {
            that.model.mediaElementVideo.play();
        } else {
            that.model.mediaElementVideo.pause();
        }
    };

    fluid.videoPlayer.media.mute = function (that) {
        if (!that.model.mediaElementVideo) { return; }

        that.model.mediaElementVideo.setMuted(that.model.muted);
    };

    fluid.videoPlayer.media.refresh = function (that) {
        that.setMediaVolume();
        that.play();
    };

    fluid.videoPlayer.media.requestFullScreen = function (that, elm) {
        mejs.MediaFeatures.requestFullScreen(elm || that.model.mediaElementVideo);
    };

    fluid.videoPlayer.media.cancelFullScreen = function () {
        mejs.MediaFeatures.cancelFullScreen();
    };

    fluid.videoPlayer.media.init = function (that) {
        that.renderSources();
        that.bindMediaDOMEvents();
        that.events.afterInit.fire();
    };

})(jQuery, fluid_1_5);
