/*
Copyright 2012 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
 
 */

// Declare dependencies
/*global fluid, jqUnit, expect, jQuery, start, stop*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    $(document).ready(function () {

        var videoPlayerTimeUpdateAdapterTests = new jqUnit.TestCase("Video Player Time Update Adapter Tests");

        var videoContainer = $(".flc-video");
        videoPlayerTimeUpdateAdapterTests.asyncTest("Test onTimeChange event", function () {
            var timeToSet = 10;
            
            fluid.videoPlayer.timeUpdateAdapter({
                video: videoContainer,
                listeners: {
                    onTimeChange: function (time) {
                        jqUnit.assertEquals("The event onTimeChange is fired with argument " + time, timeToSet, time);
                        start();
                    }
                }
            });
            
            setTimeout(function () {
                videoContainer[0].currentTime = timeToSet;
            }, 200);
            
            stop();
        });

        var intervalId = 0;
        
        var testIntervalList = [];
        testIntervalList[intervalId] = {
            begin: 1000,
            end: 2000
        };
            
        videoPlayerTimeUpdateAdapterTests.asyncTest("Test onIntervalChange event: true scenario", function () {
            fluid.videoPlayer.timeUpdateAdapter({
                video: videoContainer,
                intervalList: testIntervalList,
                listeners: {
                    onIntervalChange: function (Id) {
                        jqUnit.assertEquals("The event onIntervalChange is fired with argument " + Id, intervalId, Id);
                        start();
                    }
                }
            });
            
            setTimeout(function () {
                videoContainer[0].currentTime = 1.5;
            }, 200);
            
            stop();
        });

        videoPlayerTimeUpdateAdapterTests.asyncTest("Test onIntervalChange event: false scenario", function () {
            fluid.videoPlayer.timeUpdateAdapter({
                video: videoContainer,
                intervalList: testIntervalList,
                listeners: {
                    onTimeChange: function (time) {
                        jqUnit.assertTrue("The event onIntervalChange is NOT fired", true);
                        start();
                    },
                    onIntervalChange: function (Id) {
                        jqUnit.assertTrue("The event onIntervalChange IS fired with argument and should not", false);
                        start();
                    }
                }
            });
            
            setTimeout(function () {
                videoContainer[0].currentTime = 0.1;
            }, 200);
            
            stop();
        });

    });
})(jQuery);
