/*
Copyright 2009 University of Toronto
Copyright 2011 Charly Molter
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, window, fluid, captionator*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */


(function ($) {
    
    /********************************************************************
     * HTML5 Captionator                                                *
     * An Infusion wrapper of captionatorjs (http://captionatorjs.com/) *
     ********************************************************************/

    fluid.defaults("fluid.videoPlayer.html5Captionator", {
        gradeNames: ["fluid.viewComponent", "fluid.videoPlayer.indirectReader", "autoInit"],
        finalInitFunction: "fluid.videoPlayer.html5Captionator.finalInit",
        preInitFunction:   "fluid.videoPlayer.html5Captionator.preInit",
        model: {},
        captions: [],
        events: {
            afterTrackElCreated: null,
            onTracksReady: null,
            onReady: null,
            onLoadCaptionError: null
        },
        elPaths: {
            currentCaptions: "currentTracks.captions",
            displayCaptions: "displayCaptions"
        },
        // TODO: Those selectors should come from the parent component!!
        selectors: {
            video: ".flc-videoPlayer-video",
            caption: ".flc-videoPlayer-captionArea",
            captionError: ".flc-videoPlayer-captionError"
        },
        listeners: {
            afterTrackElCreated: "fluid.videoPlayer.html5Captionator.waitForTracks",
            onTracksReady: "fluid.videoPlayer.html5Captionator.captionify"
        },
        createTrackFns: {
            "text/amarajson": "fluid.videoPlayer.html5Captionator.createAmaraTrack",
            "text/vtt": "fluid.videoPlayer.html5Captionator.createVttTrack"
        },
        components: {
            captionError: {
                type: "fluid.errorPanel",
                options: {
                    strings: {
                        messageTemplate: "Sorry, %0 captions currently unavailable",
                        dismissLabel: "Dismiss error"
                    },
                    templates: {
                        panel: {
                            href: "../html/captionError_template.html"
                        }
                    }
                }
            }
        }
    });
    
    
    var bindCaptionatorModel = function (that) {
        var elPaths = that.options.elPaths;
        that.applier.modelChanged.addListener(elPaths.currentCaptions, that.refreshCaptions);
        that.applier.modelChanged.addListener(elPaths.displayCaptions, that.refreshCaptions);
    };
    
    fluid.videoPlayer.html5Captionator.hideAllTracks = function (tracks) {
        fluid.each(tracks, function (trackEl) {
            trackEl.track.mode = captionator.TextTrack.OFF;
        });
    };
    
    fluid.videoPlayer.html5Captionator.showCurrentTrack = function (currentCaptions, tracks, captionSources) {
        fluid.each(captionSources, function (element, key) {
            var currentState = $.inArray(key, currentCaptions) === -1 ? "OFF" : "SHOWING";
            tracks[key].track.mode = captionator.TextTrack[currentState];
        });
    };

    fluid.videoPlayer.html5Captionator.preInit = function (that) {
        that.createTrackFns = that.options.createTrackFns;

        that.refreshCaptions = function () {
            var tracks = $("track", that.locate("video"));
            var display = that.readIndirect("elPaths.displayCaptions");
            if (display) {
                fluid.videoPlayer.html5Captionator.showCurrentTrack(that.readIndirect("elPaths.currentCaptions"), 
                    tracks, that.options.captions);

                // captionator doesn't fire any events or support a configurable error callback,
                // so we have to wait a bit and check the track's readyState
                setTimeout(function () {
                    fluid.each($("track", that.locate("video")), function (element, key) {
                        if (element.track.readyState === captionator.TextTrack.ERROR) {
                            that.events.onLoadCaptionError.fire(key, that.options.captions[key], true);
                        }
                    });
                }, 3000);
            } else {
                fluid.videoPlayer.html5Captionator.hideAllTracks(tracks);
            }
        };

    };

    fluid.videoPlayer.html5Captionator.finalInit = function (that) {
        var captions = that.options.captions;
        
        // Need to know when all the tracks have been created so we can trigger captionator
        that.tracksToCreate = captions.length;

        // Start adding tracks to the video tag
        fluid.each(captions, function (capOpt, key) {
            fluid.invoke(that.createTrackFns[capOpt.type], [that, key, capOpt], that);
        });
    };

    fluid.videoPlayer.html5Captionator.createTrack = function (that, key, opts) {
        var trackEl = $("<track />");
        var attrs = fluid.filterKeys(fluid.copy(opts), ["kind", "src", "type", "srclang", "label"], false);

        if ($.inArray(key, that.readIndirect("elPaths.currentCaptions")) !== -1 && that.readIndirect("elPaths.displayCaptions")) {
            attrs["default"] = "true";
        }

        trackEl.attr(attrs);
        that.locate("video").append(trackEl);
        return trackEl;
    };

    fluid.videoPlayer.html5Captionator.createAmaraTrack = function (that, key, opts) {
        var trackEl = fluid.videoPlayer.html5Captionator.createTrack(that, key, opts);

        var afterFetch = function (data) {
            if (!data) {
                return;
            }

            var vtt = fluid.videoPlayer.amaraJsonToVTT(data);
            var dataUrl = "data:text/vtt," + encodeURIComponent(vtt);
            trackEl.attr("src", dataUrl);
            that.events.afterTrackElCreated.fire(that);
        };

        var errorHandler = function () {
            that.events.onLoadCaptionError.fire(key, opts, false);
            that.events.afterTrackElCreated.fire(that);
        };

        fluid.videoPlayer.fetchAmaraJson(opts.src, afterFetch, errorHandler);
    };

    fluid.videoPlayer.html5Captionator.createVttTrack = function (that, key, opts) {
        fluid.videoPlayer.html5Captionator.createTrack(that, key, opts);

        that.events.afterTrackElCreated.fire(that);
    };

    fluid.videoPlayer.html5Captionator.waitForTracks = function (that) {
        that.tracksToCreate--;

        if (that.tracksToCreate === 0) {
            that.events.onTracksReady.fire(that);
        }
    };

    fluid.videoPlayer.html5Captionator.captionify = function (that) {
        // Create captionator code which will add a captionator div to the HTML
        captionator.captionify(that.locate("video")[0], null, {
            appendCueCanvasTo: that.locate("caption")[0],
            sizeCuesByTextBoundingBox: true
        });

        bindCaptionatorModel(that);
        that.events.onReady.fire(that, fluid.allocateSimpleId(that.locate("caption")));
    };

    fluid.demands("captionError", "fluid.videoPlayer.html5Captionator", {
        container: "{html5Captionator}.dom.captionError",
        options: {
            listeners: {
                "{html5Captionator}.events.onLoadCaptionError": {
                    listener: "{captionError}.show",
                    args: "{arguments}.1.label"
                },
                "{html5Captionator}.events.onTracksReady": "{captionError}.hide"
            }
        }
    });

})(jQuery);
