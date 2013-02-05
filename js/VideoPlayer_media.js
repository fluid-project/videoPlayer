/*
Copyright 2009 University of Toronto
Copyright 2011 Charly Molter
Copyright 2011-2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/*global jQuery, window, swfobject, fluid, MediaElement*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */


(function ($) {

    /*********************************************************************************
     * Video Player Media                                                            *
     *                                                                               *
     * Composes markup for video sources and responds to the video events            *
     *********************************************************************************/

    fluid.defaults("fluid.videoPlayer.media", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        components: {
            mediaEventBinder: {
                type: "fluid.videoPlayer.eventBinder",
                createOnEvent: "onEventBindingReady"
            }
        },
        finalInitFunction: "fluid.videoPlayer.media.finalInit",
        preInitFunction: "fluid.videoPlayer.media.preInit",
        events: {
            onEventBindingReady: null,
            onTimeUpdate: null, // picked up by intervalEventsConductor.events.onTimeUpdate
            onReady: {
                events: {
                    eventBindingReady: "onEventBindingReady",
                    created: "onCreate"
                }
            },

            // local events to mirror the media element events
            onMediaElementCanPlay: null,
            onMediaElementLoadedMetadata: null,
            onMediaElementVolumeChange: null,
            onMediaElementEnded: null,
            onMediaElementTimeUpdate: null,
            
            onLoadedMetadata: null
        },
        invokers: {
            renderSources: { funcName: "fluid.videoPlayer.media.renderSources", args: ["{media}"] },
            bindMediaModel: { funcName: "fluid.videoPlayer.media.bindMediaModel", args: ["{media}"] },
            bindMediaDOMEvents: { funcName: "fluid.videoPlayer.media.bindMediaDOMEvents", args: ["{media}"] }
        },
        mediaEventBindings: {
            canplay: "onMediaElementCanPlay",
            canplaythrough: "onMediaElementCanPlay",
            loadeddata: "onMediaElementCanPlay",
            loadedmetadata: "onMediaElementLoadedMetadata",
            volumechange: "onMediaElementVolumeChange",
            ended: "onMediaElementEnded",
            timeupdate: "onMediaElementTimeUpdate"
        },
        listeners: {
            onMediaElementCanPlay: "fluid.videoPlayer.media.handleCanPlay",
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
            onMediaElementVolumeChange: "fluid.videoPlayer.media.handleVolumeChange",
            onMediaElementEnded: [{
                listener: "{media}.applier.fireChangeRequest",
                args: [{path: "play", value: false}]
            }, {
                listener: "{media}.applier.fireChangeRequest",
                args: [{path: "currentTime", value: 0}]
            }],
            onMediaElementTimeUpdate: "fluid.videoPlayer.media.handleTimeUpdate"
        },
        sourceRenderers: {
            "video/mp4": "fluid.videoPlayer.media.createSourceMarkup.html5SourceTag",
            "video/webm": "fluid.videoPlayer.media.createSourceMarkup.html5SourceTag",
            "video/ogg": "fluid.videoPlayer.media.createSourceMarkup.html5SourceTag",
            "video/ogv": "fluid.videoPlayer.media.createSourceMarkup.html5SourceTag",
            "video/youtube": "fluid.videoPlayer.media.createSourceMarkup.html5SourceTag"
        },
        sources: []
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

    fluid.videoPlayer.media.bindMediaModel = function (that) {
        that.applier.modelChanged.addListener("play", that.play);
        that.applier.modelChanged.addListener("muted", that.mute);
        fluid.addSourceGuardedListener(that.applier, 
            "volume", "media", that.updateVolume);
    };

    fluid.videoPlayer.media.handleVolumeChange = function (that, evt) {
        var mediaVolume = that.model.mediaElementVideo.volume * 100;
        // Don't fire self-generated volume changes on zero when muted, to avoid cycles
        if (!that.model.muted || mediaVolume !== 0) {
            fluid.fireSourcedChange(that.applier, "volume", mediaVolume, "media");
        }
    };
    
    fluid.videoPlayer.media.handleCanPlay = function (that, evt) {
        var el = that.model.mediaElementVideo;
        that.applier.fireChangeRequest({
            path: "canPlay",
            value: (typeof (el.readyState) === "undefined") || (el.readyState === 4) || (el.readyState === 3) || (el.readyState === 2)
        });
    };
    
    fluid.videoPlayer.media.handleTimeUpdate = function (that, evt) {
        // With youtube videos, "loadedmetadata" event is not triggered at the initial load,
        // so the video duration is not set but the duration does get returned when the video is at play.
        if (that.model.totalTime === 0) {
            that.applier.requestChange("totalTime", that.model.mediaElementVideo.duration);
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
                that.applier.requestChange("scrubTime", null);
            }
        }

        var buffered = that.model.mediaElementVideo.buffered || 0;

        that.events.onTimeUpdate.fire(currentTime, buffered);
    };

    fluid.videoPlayer.media.updateStartTime = function (that) {
        var newStartTime = that.model.mediaElementVideo.startTime || 0;
        that.applier.requestChange("startTime", newStartTime);
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

            that.events.onEventBindingReady.fire(that);
        }});

    };

    fluid.videoPlayer.media.preInit = function (that) {
        that.updateCurrentTime = function (currentTime, buffered) {
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
        
        that.setTime = function (time) {
            if (!that.model.mediaElementVideo) { return; }

            that.applier.requestChange("scrubTime", time);
            that.model.mediaElementVideo.setCurrentTime(time);
        };

        that.updateVolume = function () {
            if (!that.model.mediaElementVideo) { return; }

            that.model.mediaElementVideo.setVolume(that.model.volume / 100);
        };

        that.play = function () {
            if (!that.model.mediaElementVideo) { return; }

            if (that.model.play === true) {
                that.model.mediaElementVideo.play();
            } else {
                that.model.mediaElementVideo.pause();
            }
        };

        that.mute = function () {
            if (!that.model.mediaElementVideo) { return; }

            that.model.mediaElementVideo.setMuted(that.model.muted);
        };

        that.refresh = function () {
            that.updateVolume();
            that.play();
        };
    };

    fluid.videoPlayer.media.finalInit = function (that) {
        that.renderSources();
        that.bindMediaModel();
        that.bindMediaDOMEvents();
    };

})(jQuery);
