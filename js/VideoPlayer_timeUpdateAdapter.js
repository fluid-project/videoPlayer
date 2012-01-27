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

/*global jQuery, fluid*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */


(function ($) {

    /*********************************************************************************
     * fluid.videoPlayer.timeUpdateAdapter                                           *
     *                                                                               *
     * The re-wiring of video timeupdate event that is tranlated into video player   *
     * needed time events                                                            *
     *********************************************************************************/
    
    fluid.defaults("fluid.videoPlayer.timeUpdateAdapter", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        preInitFunction: "fluid.videoPlayer.timeUpdateAdapter.preInit",
        components: {
            html5MediaTimer: {
                type: "fluid.videoPlayer.html5MediaTimer",
                options: {
                    mediaElement: null,
                    events: {
                        onTick: "{timeUpdateAdapter}.events.onTick"
                    }
                }
            }
        },
        events: {
            onTimeChange: null,
            onIntervalChange: null,
            // private events
            onTick: null
        },
        listeners: {
            onTick: "{timeUpdateAdapter}.handleTicks"
        },
        
        // An array of the time intervals with all the begin and end time in millisecond
        // Example: Array[intervalID] = {begin: beginTimeInMilli, end: endTimeInMilli}
        intervalList: null,
        
        // private saves
        previousIntervals: []
    });
    
    fluid.videoPlayer.timeUpdateAdapter.preInit = function (that) {
        /**
         * If the current time falls into any intervals, fire the onIntervalChange event with 2 arguments:
         * 1st: the array of all the active intervals
         * 2nd: the array of the states of the previous intervals
         * @param currentTime - The currentTime that is passed in from the timer onTick event firing
         * @param intervalList - The array of the intervals to check the current time against
         * Example: Array[intervalID] = {begin: beginTimeInMilli, end: endTimeInMilli}
         * All the begin and end times are in millisecond
         * @param previousIntervals - The array of the intervals that are fired last time
         * 
         * @returns An array of 2 elements:
         * 1st element: activeIntervals - The array of all the active intervals
         * 2nd element: previousIntervalStates - The array of the states of the previous intervals
         */
        that.processIntervalChange = function (currentTime, intervalList, previousIntervals) {
            // use an array for the active intervals in case of the overlapping intervals
            var activeIntervals = new Array();
            var previousIntervalStates = new Array();
            
            var currentTimeInMillis = Math.round(currentTime * 1000);

            // Find out the intervals that fit in the current time
            fluid.each(intervalList, function (interval, intervalId) {
                if (interval.begin <= currentTimeInMillis && interval.end >= currentTimeInMillis) {
                    activeIntervals.push(intervalId);
                }
            });
            
            // Set the states of the old interval which was set by the previous event
            for (var i in previousIntervals) {
                if (previousIntervals[i].end < currentTimeInMillis) {
                    previousIntervalStates.push({i: fluid.videoPlayer.expiredState});
                } else {
                    previousIntervalStates.push({i: fluid.videoPlayer.ongoingState});
                }
            }
            
            // Fire the intervalChange event if any active intervals are detected
            if (activeIntervals.length > 0) {
                that.options.previousIntervals = activeIntervals;
                return [activeIntervals, previousIntervalStates];
            }
            return null;
        };

        /**
         * Validate if the input is a numeric value
         */
        that.isNumeric = function (input) {
            return (!isNaN(parseFloat(input)) && isFinite(input));
        };
        
        /**
         * The main process
         */
        that.handleTicks = function (currentTime) {
            if (!that.isNumeric(currentTime)) {
                fluid.fail("Invalid numberic value: " + currentTime + ", in " + that.typeName + ".");
            }
            
            that.events.onTimeChange.fire(currentTime);
            
            if (that.options.intervalList) {
                var processedIntervalList = that.processIntervalChange(currentTime, that.options.intervalList, that.options.previousIntervals);
                if (processedIntervalList) {
                    that.events.onIntervalChange.fire(processedIntervalList[0], processedIntervalList[1]);
                }
            }
        };
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
