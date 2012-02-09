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
        that.applier.modelChanged.addListener("captions.currentTrack", that.loadCaptions);
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
                args: ["@0"]
            }  
        },
        intervalList: null
    });
    
    /**
     * Convert the time in the format of hh:mm:ss.mmm to milliseconds.
     * The time is normally extracted from the subtitle files in WebVTT or json format.
     * 
     * @param time: in the format hh:mm:ss.mmm
     * @return a number in millisecond
     * TODO: This should be removed once capscribe desktop gives us the time in millis in the captions
     */
    fluid.videoPlayer.captionLoader.convertToMilli = function (time) {
        if (!time || !time.match(/^\d{2}:\d{2}:\d{2}\.\d{1,3}$/)) {
            return null;
        }
        
        var splitTime = time.split(":");
        var splitSec = splitTime[2].split(".");
        var hours = parseFloat(splitTime[0]);
        var mins = parseFloat(splitTime[1]) + (hours * 60);
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
            var caps = that.model.captions.sources[that.model.captions.currentTrack];
            if (caps.type !== "JSONcc") {
                $.ajax({
                    type: "GET",
                    dataType: "text",
                    url: that.model.captions.conversionServiceUrl,
                    data: {
                        cc_result: 0,
                        cc_url: caps.src,
                        cc_target: "JSONcc",
                        cc_name: "__no_name"
                    },
                    success: that.setCaptions
                });
            } else {
                $.ajax({
                    type: "GET",
                    dataType: "text",
                    url: caps.src,
                    success: that.setCaptions
                });
            }
        };
    };
    
    fluid.videoPlayer.captionLoader.finalInit = function (that) {
        bindCaptionLoaderModel(that);
        //if we provided default captions when we created the component we load it
        if (that.model.captions.sources && that.model.captions.currentTrack) {
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
