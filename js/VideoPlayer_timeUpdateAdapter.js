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
        finalInitFunction: "fluid.videoPlayer.timeUpdateAdapter.finalInit",
        events: {
            onTimeChange: null,
            onIntervalChange: null
        },
        video: null,
        
        // An array of the time intervals with all the begin and end time in millisecond
        // Example: Array[intervalID] = {begin: beginTimeInMilli, end: endTimeInMilli}
        intervalList: null
    });
    
    fluid.videoPlayer.timeUpdateAdapter.finalInit = function (that) {
        that.options.video.bind("timeupdate", function (ev) {
            var currentTime = ev.currentTarget.currentTime;
            
            that.events.onTimeChange.fire(currentTime);
            
            if (that.options.intervalList) {
                var currentTimeInMillis = Math.round(currentTime * 1000);

                fluid.each(that.options.intervalList, function (interval, intervalId) {
                    if (interval.begin <= currentTimeInMillis && interval.end >= currentTimeInMillis) {
                        that.events.onIntervalChange.fire(intervalId);
                    }
                });
            }
        });
    };

})(jQuery);
