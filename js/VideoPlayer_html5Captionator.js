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
            onReady: null
        },
        elPaths: {
            currentCaptions: "currentTracks.captions",
            displayCaptions: "displayCaptions"
        },
        // TODO: Those selectors should come from the parent component!!
        selectors: {
            video: ".flc-videoPlayer-video",
            caption: ".flc-videoPlayer-captionArea"
        },
        listeners: {
            afterTrackElCreated: "fluid.videoPlayer.html5Captionator.waitForTracks",
            onTracksReady: "fluid.videoPlayer.html5Captionator.captionify"
        }
    });
    
    
    var bindCaptionatorModel = function (that) {
        var elPaths = that.options.elPaths;
        that.applier.modelChanged.addListener(elPaths.currentCaptions, that.refreshCaptions);
        that.applier.modelChanged.addListener(elPaths.displayCaptions, that.refreshCaptions);
    };
    
    // Hide all tracks
    fluid.videoPlayer.html5Captionator.hideAllTracks = function (tracks) {
        fluid.each(tracks, function (element) {
            element.mode = captionator.TextTrack.OFF;
        });
    };
    
    // show captions depending on which one is on in the model
    fluid.videoPlayer.html5Captionator.showCurrentTrack = function (currentCaptions, tracks, captionSources) {
        fluid.each(captionSources, function (element, key) {
            tracks[key].mode = captionator.TextTrack[$.inArray(key, currentCaptions) === -1 ? "OFF" : "SHOWING"];
        });
    };

    // hide all captions
    fluid.videoPlayer.html5Captionator.preInit = function (that) {
  
        // listener for hiding/showing all captions
        that.refreshCaptions = function () {
            var tracks = that.locate("video")[0].tracks;
            var display = that.readIndirect("elPaths.displayCaptions");
            if (display) {
                fluid.videoPlayer.html5Captionator.showCurrentTrack(that.readIndirect("elPaths.currentCaptions"), 
                    tracks, that.options.captions);
            } else {
                fluid.videoPlayer.html5Captionator.hideAllTracks(tracks);
            }
        };

    };

    var tracksToCreate = 0;

    fluid.videoPlayer.html5Captionator.finalInit = function (that) {
        var captions = that.options.captions;
        
        if (!captions || captions.length === 0) return;  // Exit if captions are not provided
        
        tracksToCreate = captions.length;

        // Start adding tracks to the video tag
        fluid.each(captions, function (capOpt, key) {
            var trackTag = $("<track />");
            var attributes = fluid.filterKeys(fluid.copy(capOpt), ["kind", "src", "srclang", "label"], false);
            
            if ($.inArray(key, that.readIndirect("elPaths.currentCaptions")) !== -1 && that.readIndirect("elPaths.displayCaption")) {
                attributes["default"] = "true";
            }
            trackTag.attr(attributes);

            if (capOpt.type === "text/amarajson") {
                var callback = function (data) {
                    if (!data) {
                        return;
                    }

                    var vtt = fluid.videoPlayer.amaraJsonToVTT(data);
                    var dataUrl = "data:text/plain," + encodeURIComponent(vtt);
                    trackTag.attr("src", dataUrl);
                    that.events.afterTrackElCreated.fire(that);
                };

                // Is this an issue? I'm fetching all the captions every time, whether or not anyone wants them. 
                fluid.videoPlayer.fetchAmaraJson(capOpt.src, callback);
            } else {
                that.events.afterTrackElCreated.fire(that);
            }

            that.locate("video").append(trackTag);
        });
    };

    fluid.videoPlayer.html5Captionator.waitForTracks = function (that) {
        tracksToCreate--;

        if (tracksToCreate === 0) {
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
        that.events.onReady.fire(that);
    };

    /*******************************************************************
     * Converts seconds into a WebVTT Timestamp:  HH:MM:SS.mmm
     * @seconds:  time in seconds expressed as a floating point number
     *******************************************************************/
    fluid.videoPlayer.secondsToHmsm = function (seconds) {
        seconds = parseFloat(seconds);
        seconds = seconds < 0 || isNaN(seconds) ? 0 : seconds;

        var hours = parseInt(seconds / 3600);
        var minutes = parseInt(seconds / 60) % 60;
        var seconds = (seconds % 60).toFixed(3);

        // Return result of type HH:MM:SS.mmm
        return "" + (hours < 10 ? "0" + hours : hours) + ":"
            + (minutes < 10 ? "0" + minutes : minutes) + ":"
            + (seconds  < 10 ? "0" + seconds : seconds);
    };

    /******************************************************************************************************
     * Converts JSON from Amara (http://www.universalsubtitles.org/api/1.0/subtitles/) into WebVTT format.
     * Each caption in WebVTT looks like:
     *  empty line
     *  HH:MM:SS.mmm --> HH:MM:SS.mmm
     *  Caption text
     *
     *****************************************************************************************************/
    fluid.videoPlayer.amaraJsonToVTT = function (json) {
        var vtt = "WEBVTT";

        for (var i = 0; i < json.length; i++) {
            var startTime = fluid.videoPlayer.secondsToHmsm(json[i].start_time);
            var endTime = fluid.videoPlayer.secondsToHmsm(json[i].end_time);
            vtt = vtt.concat("\n\n", startTime, " --> ", endTime, "\n", json[i].text);
        }

        return vtt;
    };

    fluid.videoPlayer.fetchAmaraJson = function (videoUrl, callback) {
        // No point continuing because we can't get a useful JSONP response without the url and a callback 
        if (!videoUrl || !callback) {
            return;
        }
        
        // Hard coded URL to amara here 
        // IS THIS CRAZY? I'm thinking that we don't want to let this URL be configurable because then we open ourselves to cross site scripting
        // But the trade off is that if the amara url changes, we need to change this code
        var url = "http://www.universalsubtitles.org/api/1.0/subtitles/?video_url=" + videoUrl + "&callback=?";        
        
        $.getJSON(url, callback);
    };

})(jQuery);
