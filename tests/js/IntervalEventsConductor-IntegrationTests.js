/*
Copyright 2012 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
 
 */

// Declare dependencies
/*global fluid, jqUnit, jQuery, start*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    $(document).ready(function () {

        var videoPlayerIntervalEventsConductorIntegrationTests = new jqUnit.TestCase("Video Player Interval Events Conductor Integration Tests");
    
        // Test data used across all the tests
        var testIntervalList = 
            [{
                begin: 1000, 
                end: 2000
            }, {
                begin: 1500, 
                end: 3000
            }, {
                begin: 4000, 
                end: 5000
            }];
        // End of the test data
        
        videoPlayerIntervalEventsConductorIntegrationTests.asyncTest("Integration test: intervalEventsConductor with html5MediaTimer (This test is expected to fail when running in non-html5 browsers)", function () {
            var videoContainer = $(".flc-video");
            var timeToSet = 1;
            var expectedPreviousInterval = null;
            var expectedCurrentInterval = "0";

            var that = fluid.videoPlayer.intervalEventsConductor({
                components: {
                    html5MediaTimer: {
                        type: "fluid.videoPlayer.html5MediaTimer",
                        options: {
                            mediaElement: videoContainer
                        }
                    }
                },
                intervalList: testIntervalList,
                model: {
                    previousIntervalId: expectedPreviousInterval
                },
                listeners: {
                    onTimeChange: function (time) {
                        jqUnit.assertEquals("The event onTimeChange is fired with argument " + time, timeToSet, time);
                    },
                    onIntervalChange: function (currentInterval, previousInterval) {
                        jqUnit.assertEquals("The event onIntervalChange is fired with currentInterval " + expectedCurrentInterval, expectedCurrentInterval, currentInterval);
                        jqUnit.assertEquals("The event onIntervalChange is fired with previousInterval " + expectedPreviousInterval, expectedPreviousInterval, previousInterval);
                        start();
                    }
                }
            });
            
            setTimeout(function () {
                that.html5MediaTimer.options.mediaElement[0].currentTime = timeToSet;
            }, 100);
            
        });

    });
})(jQuery);
