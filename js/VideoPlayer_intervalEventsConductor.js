/*
Copyright 2012 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, fluid*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */


(function ($) {

    /*************************************************************************************
     * The wiring up of the onTick event btw timer component and intervalEventsConductor *
     *************************************************************************************/
    fluid.demands("fluid.videoPlayer.html5MediaTimer", ["fluid.videoPlayer.intervalEventsConductor"], {
        options: {
            events: {
                onTick: "{intervalEventsConductor}.events.onTick"
            }
        }
    });

    /*********************************************************************************
     * fluid.videoPlayer.intervalEventsConductor                                     *
     *                                                                               *
     * The re-wiring of video timeupdate event that is tranlated into video player   *
     * needed time events                                                            *
     *********************************************************************************/
    
    fluid.defaults("fluid.videoPlayer.intervalEventsConductor", {
        gradeNames: ["fluid.eventedComponent", "fluid.modelComponent", "autoInit"],
        events: {
            onTimeChange: null,
            onIntervalChange: null,
            onTick: null
        },
        listeners: {
            onTick: {
                listener: "fluid.videoPlayer.intervalEventsConductor.handleTicks",
                args: ["{fluid.videoPlayer.intervalEventsConductor}", "{arguments}.0", "{arguments}.1"]
            }
        },
        invokers: {
            setIntervalList: {
                funcName: "fluid.videoPlayer.intervalEventsConductor.setIntervalList",
                args: ["{fluid.videoPlayer.intervalEventsConductor}", "{arguments}.0"]
            }  
        },
        
        // An array of the time intervals with all the begin and end time in millisecond
        // Example: Array[intervalID] = {begin: beginTimeInMilli, end: endTimeInMilli}
        intervalList: [],
        
        model: {
            // The saved interval that was fired at the previous intervalChange event
            previousIntervalId: null
        }
    });
    
    fluid.videoPlayer.intervalEventsConductor.setIntervalList = function (that, intervalList) {
        that.options.intervalList = intervalList;
    };
    
    fluid.videoPlayer.intervalEventsConductor.inInterval = function (currentTimeInMillis, interval) {
        return interval.begin <= currentTimeInMillis && interval.end >= currentTimeInMillis;
    };
    
    /**
     * Find the interval that the current time falls in. Return null if none of the intervals matches.
     * 
     * @param currentTime - The currentTime that is passed in from the timer onTick event firing
     * @param intervalList - The array of the intervals to check the current time against
     * Example: Array[intervalID] = {begin: beginTimeInMilli, end: endTimeInMilli}
     * All the begin and end times are in millisecond
     * @param previousInterval - The interval that was fired last time
     * 
     * @returns The interval that the current time falls in. Return null if none of the intervals matches.
     */
    fluid.videoPlayer.intervalEventsConductor.findCurrentInterval = function (currentTime, intervalList, previousInterval) {
        var currentTimeInMillis = Math.round(currentTime * 1000);

        // Find out if the current time is still within the range of the previousInterval 
        // to avoid the immediate looping-thru of the entire interval list
        if (previousInterval && fluid.videoPlayer.intervalEventsConductor.inInterval(currentTimeInMillis, intervalList[previousInterval])) {
            return previousInterval;
        }
        
        // Find out the interval that the current time fits in. If none was found, return null
        return fluid.find(intervalList, function (interval, intervalId) {
            return fluid.videoPlayer.intervalEventsConductor.inInterval(currentTimeInMillis, interval) ? intervalId : undefined;
        }, null);
    };

    /**
     * The main process to re-wire the events
     */
    fluid.videoPlayer.intervalEventsConductor.handleTicks = function (that, currentTime, buffered) {
        that.events.onTimeChange.fire(currentTime, buffered);
        
        if (that.options.intervalList) {
            var previousInterval = that.options.model.previousIntervalId;
            var currentInterval = fluid.videoPlayer.intervalEventsConductor.findCurrentInterval(currentTime, that.options.intervalList, previousInterval);
            
            if (currentInterval !== previousInterval) {
                that.applier.requestChange("previousIntervalId", currentInterval);
                that.events.onIntervalChange.fire(currentInterval, previousInterval);
            }
        }
    };

    /*********************************************************************************
     * Timer component for HTML5 media element                                       *
     *                                                                               *
     * The timer component fires the onTick event with the argument of "currentTime" *
     * when the time change occurs.                                                  *
     *********************************************************************************/

    fluid.defaults("fluid.videoPlayer.html5MediaTimer", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        finalInitFunction: "fluid.videoPlayer.html5MediaTimer.finalInit",
        mediaElement: null,
        events: {
            onTick: null
        }
    });

    fluid.videoPlayer.html5MediaTimer.finalInit = function (that) {
        var media = that.options.mediaElement;

        if (!media) {
            fluid.fail("Undefined mediaElement option in " + that.typeName + ".");
        }
        media.bind("timeupdate", function (ev) {
            var currentTime = ev.currentTarget.currentTime;

            that.events.onTick.fire(currentTime);
        });
    };

})(jQuery);
