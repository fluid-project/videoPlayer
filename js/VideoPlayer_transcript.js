/*
Copyright 2012 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/*global jQuery, window, fluid*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */


(function ($) {

    /*****************************************************************************
     *   Transcript                                                              *
     *   This component renders transcript UI, loads and displays transcripts    *
     *****************************************************************************/
    
    fluid.defaults("fluid.videoPlayer.transcript", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        renderOnInit: true,
        rendererOptions: {
            autoBind: true
        },
        finalInitFunction: "fluid.videoPlayer.transcript.finalInit",
        components: {
            transriptInterval: {
                type: "fluid.videoPlayer.intervalEventsConductor",
                createOnEvent: "onReady"
            }
        },
        protoTree: {
            langaugeDropdown: {
                selection: "${transcripts.selection}",
                optionlist: "${transcripts.choices}",
                optionnames: "${transcripts.names}"
            }
        },
        events: {
            onTranscriptAreaShow: null,
            onTranscriptAreaHide: null,
            onTranscriptsLoaded: null,
            onLoadTranscriptError: null,
            onIntervalChange: null,
            onReady: null
        },
        model: {
            transcripts: {
                selection: "none",
                choices: [],
                names: [],
                show: false,
                sources: null,
                track: undefined
            }
        },
        invokers: {
            convertToMilli: {
                funcName: "fluid.videoPlayer.transcript.convertToMilli",
                args: ["{arguments}.0"]
            }  
        },
        selectors: {
            langaugeDropdown: ".flc-videoPlayer-transcripts-language-dropdown",
            closeButton: ".flc-videoPlayer-transcripts-close-button",
            transcriptText: ".flc-videoPlayer-transcript-text"
        },
        selectorsToIgnore: ["closeButton", "transcriptText"]
    });

    /** Functions to show/hide the transcript area **/
    fluid.videoPlayer.transcript.showTranscriptArea = function (that) {
        // Show the transcript area
        that.container.show();
        that.events.onTranscriptAreaShow.fire();
    };
    
    // Hide the transcript area
    fluid.videoPlayer.transcript.hideTranscriptArea = function (that) {
        that.container.hide();
        that.events.onTranscriptAreaHide.fire();
    };

    // Show/Hide the transcript area based on the flag "states.displayTranscripts"
    fluid.videoPlayer.transcript.switchTranscriptArea = function (that) {
        that.model.states.displayTranscripts ? fluid.videoPlayer.transcript.showTranscriptArea(that) : fluid.videoPlayer.transcript.hideTranscriptArea(that);
    };
    
    /** Functions to load and parse the transcript file **/
    /**
     * Convert the time in the format of hh:mm:ss.mmm to milliseconds.
     * The time is normally extracted from the subtitle files in WebVTT compatible format.
     * WebVTT standard for timestamp: http://dev.w3.org/html5/webvtt/#webvtt-cue-timings
     * 
     * @param time: in the format hh:mm:ss.mmm ("hh:" is optional)
     * @return a number in millisecond
     * TODO: This should be removed once capscribe desktop gives us the time in millis in the transcripts
     */
    fluid.videoPlayer.transcript.convertToMilli = function (time) {
        if (!time || !time.match(/^(\d{1,}:)?\d{2}:\d{2}\.\d{1,3}$/)) {
            return null;
        }
        
        var splitTime = time.split(":");
        
        // Handle the optional "hh:" in the input
        if (splitTime.length === 2) {
            // "hh:" part is NOT given
            var hourStr = "0";
            var minStr = splitTime[0];
            var secWithMilliSecStr = splitTime[1];
        } else {
            // "hh:" part is given
            var hourStr = splitTime[0];
            var minStr = splitTime[1];
            var secWithMilliSecStr = splitTime[2];
        }
        
        var splitSec = secWithMilliSecStr.split(".");
        var hours = parseFloat(hourStr);
        var mins = parseFloat(minStr) + (hours * 60);
        var secs = parseFloat(splitSec[0]) + (mins * 60);
        return Math.round(secs * 1000 + parseInt(splitSec[1], 10));
    };

    fluid.videoPlayer.transcript.parseTranscriptFile = function (that, transcripts) {
        transcripts = (typeof (transcripts) === "string") ? JSON.parse(transcripts) : transcripts;
        //we get the actual transcripts and get rid of the rest
        if (transcripts.transcriptCollection) {
            transcripts = transcripts.transcriptCollection;
        }
        
        that.applier.requestChange("transcripts.track", transcripts);

        // Construct intervalList that's used by intervalEventsConductor to fire intervalChange event
        var intervalList = [];
        fluid.each(transcripts, function (value, key) {
            intervalList[key] = {
                begin: that.convertToMilli(value.inTime),
                end: that.convertToMilli(value.outTime)
            };
        });
        
        that.events.onTranscriptsLoaded.fire(intervalList);
    };  
    
    fluid.videoPlayer.transcript.loadTranscript = function (that) {
        // Exit if transcript is turned off or the transcript sources are not provided
        if (that.model.transcripts.selection === "none" || that.model.transcripts.choices.length === 0) {
            return true;
        }
        
        // The main process to load in the transcript file
        var transcriptSource = that.model.transcripts.sources[that.model.transcripts.selection];
        if (transcriptSource) {
            var opts = {
                type: "GET",
                dataType: "text",
                success: function (data) {
                    fluid.videoPlayer.transcript.parseTranscriptFile(that, data);
                },
                error: function () {
                    fluid.log("Error loading transcript: " + transcriptSource.src + ". Are you sure this file exists?");
                    that.events.onLoadTranscriptError.fire();
                }
            };
            if (transcriptSource.type !== "JSONcc") {
                opts.url = that.model.transcripts.conversionServiceUrl;
                opts.data = {
                    cc_result: 0,
                    cc_url: transcriptSource.src,
                    cc_target: "JSONcc",
                    cc_name: "__no_name"
                };
            } else {
                opts.url = transcriptSource.src;
                
            }
            $.ajax(opts);
        }
    };

    fluid.videoPlayer.transcript.displayTranscript = function (that, currentTrackId, previousTrackId) {
        // Display the current transcript
        if (currentTrackId !== null) {
            var nextTranscript = that.model.transcripts.track[currentTrackId];
            if (nextTranscript) {
                that.locate("transcriptText").text(nextTranscript.transcript);
            }
        }
    };
    
    fluid.videoPlayer.transcript.bindTranscriptDOMEvents = function (that) {
        that.locate("closeButton").click(function () {
            that.applier.fireChangeRequest({
                path: "transcripts.selection",
                value: "none"
            });

            fluid.videoPlayer.transcript.hideTranscriptArea(that);
        });
    };

    fluid.videoPlayer.transcript.bindTranscriptModel = function (that) {
        that.applier.modelChanged.addListener("states.displayTranscripts", function () {
            fluid.videoPlayer.transcript.switchTranscriptArea(that);
        });

        that.applier.modelChanged.addListener("transcripts.selection", function () {
            fluid.videoPlayer.transcript.loadTranscript(that);
        });
        
        that.events.onTranscriptsLoaded.addListener(function (intervalList) {
            that.transriptInterval.setIntervalList(intervalList);
        });
        
        that.events.onIntervalChange.addListener(function (currentInterval, previousInterval) {
            fluid.videoPlayer.transcript.displayTranscript(that, currentInterval, previousInterval);
        });
    };

    fluid.videoPlayer.transcript.finalInit = function (that) {
        fluid.videoPlayer.transcript.bindTranscriptDOMEvents(that);
        fluid.videoPlayer.transcript.bindTranscriptModel(that);
        
        fluid.videoPlayer.transcript.loadTranscript(that);
        fluid.videoPlayer.transcript.switchTranscriptArea(that);

        that.events.onReady.fire(that);
    };

})(jQuery);
