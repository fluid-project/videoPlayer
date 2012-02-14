/*
Copyright 2009 University of Toronto
Copyright 2011 Charly Molter
Copyright 2011-2012 OCAD University

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
    /**
     * captionLoader renders loads from an Js object src element a caption file and converts it to JsonCC.
     * 
     * @param {Object} options configuration options for the comoponent
     * Note: when the caption is loaded by Ajax the event onCaptionsLoaded is fired
     */
    var bindCaptionLoaderModel = function (that) {
        that.applier.modelChanged.addListener("captions.currentTrack", that.loadCaptions, "captionLoader");
    };

    fluid.defaults("fluid.videoPlayer.captionLoader", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        finalInitFunction: "fluid.videoPlayer.captionLoader.finalInit",
        preInitFunction: "fluid.videoPlayer.captionLoader.preInit",
        events: {
            onReady: null,
            onCaptionsLoaded: null
        },
        invokers: {
            convertToMilli: {
                funcName: "fluid.videoPlayer.captionLoader.convertToMilli",
                args: ["{arguments}.0"]
            }  
        },
        intervalList: null
    });
    
    /**
     * Convert the time in the format of hh:mm:ss.mmm to milliseconds.
     * The time is normally extracted from the subtitle files in WebVTT compatible format.
     * WebVTT standard for timestamp: http://dev.w3.org/html5/webvtt/#webvtt-cue-timings
     * 
     * @param time: in the format hh:mm:ss.mmm ("hh:" is optional)
     * @return a number in millisecond
     * TODO: This should be removed once capscribe desktop gives us the time in millis in the captions
     */
    fluid.videoPlayer.captionLoader.convertToMilli = function (time) {
        if (!time || !time.match(/^(\d{2}:)?\d{2}:\d{2}\.\d{1,3}$/)) {
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

    fluid.videoPlayer.captionLoader.preInit = function (that) {

        that.setCaptions = function (captions) {
            // Render the caption area if necessary
            captions = (typeof (captions) === "string") ? JSON.parse(captions) : captions;
            //we get the actual captions and get rid of the rest
            if (captions.captionCollection) {
                captions = captions.captionCollection;
            }
            
            that.applier.requestChange("captions.track", captions);
            
            // Construct intervalList that's used by intervalEventsConductor to fire intervalChange event
            that.options.intervalList = [];
            fluid.each(captions, function (value, key) {
                that.options.intervalList[key] = {
                    begin: that.convertToMilli(value.inTime),
                    end: that.convertToMilli(value.outTime)
                };
            });
            
            that.events.onCaptionsLoaded.fire(captions);
            return that;
        };  
        
        //Creates an ajax query and uses or not a convertor for the captions
        that.loadCaptions = function () {
            var caps = that.model.captions.list[that.model.captions.currentTrack];
console.log("loadCaptions gets caps.label of "+caps.label);
            if (caps) {
                var opts = {
                    type: "GET",
                    dataType: "text",
                    success: that.setCaptions
                };
                if (caps.type !== "JSONcc") {
                    opts.url = that.model.captions.conversionServiceUrl;
                    opts.data = {
                        cc_result: 0,
                        cc_url: caps.src,
                        cc_target: "JSONcc",
                        cc_name: "__no_name"
                    };
                } else {
                    opts.url = caps.src;
                    
                }
                $.ajax(opts);
            }
        };
    };
    
    fluid.videoPlayer.captionLoader.finalInit = function (that) {
        bindCaptionLoaderModel(that);

        //if we provided default captions when we created the component we load it
        if (that.model.captions.list && (that.model.captions.currentTrack < that.model.captions.list.length - 1)) {
            that.loadCaptions();
        } else {
            that.applier.fireChangeRequest({
                path: "states.displayCaptions",
                value: false
            });
        }
        that.events.onReady.fire();
        return that;
    };

})(jQuery);
