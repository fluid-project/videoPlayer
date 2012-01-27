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

        var initTimeUpdateAdapterWithoutMediaTimer = function (testOptions) {
            var options = {
                components: {
                    html5MediaTimer: {
                        type: "fluid.emptySubcomponent"
                    }
                }
            };
            
            $.extend(true, options, testOptions);
            return fluid.videoPlayer.timeUpdateAdapter(options);
        };
        
        var testIsNumeric = function (input, expected, desc) {
            var that = initTimeUpdateAdapterWithoutMediaTimer();
            var result = that.isNumeric(input);
            
            jqUnit.assertEquals(input + ": " + desc, expected, result);
        };
        
        videoPlayerTimeUpdateAdapterTests.test("isNumberic", function () {
            // fail cases
            var undefinedTime;
            testIsNumeric(undefinedTime, false, "Undefined value");  // undefined input
            testIsNumeric("", false, "Empty string");
            testIsNumeric(" ", false, "White space string");
            testIsNumeric("abc", false, "Alphabetic character string");
            testIsNumeric("abc123", false, "Alphanumberic character string");
            
            // pass cases
            testIsNumeric("0", true, "Zero string");
            testIsNumeric("123", true, "Postive integer string");
            testIsNumeric("-123", true, "Negative integer string");
            testIsNumeric("123.455", true, "Positive floating string");
            testIsNumeric("-123.455", true, "Negative floating string");

            testIsNumeric(0, true, "Zero number");
            testIsNumeric(123, true, "Postive integer number");
            testIsNumeric(-123, true, "Negative integer number");
            testIsNumeric(123.455, true, "Positive floating number");
            testIsNumeric(-123.455, true, "Negative floating number");
        });
        
        var testIntervalList = [0: {begin: 1000, end: 2000},
                                0: {begin: 1500, end: 3000},
                                0: {begin: 4000, end: 5000}];
            
        var testProcessIntervalChange = function (currentTime, previousIntervalList, expected) {
            var that = initTimeUpdateAdapterWithoutMediaTimer();
            var result = that.processIntervalChange(currentTime, testIntervalList, previousIntervalList);
            
            jqUnit.assertEquals(input + ": " + desc, expected, result);
        };
        
        videoPlayerTimeUpdateAdapterTests.test("processIntervalChange", function () {
            // fail cases
            // undefined input
            var undefinedTime;
            testProcessIntervalChange(undefinedTime, false, "Undefined value");
        });
        
        var videoContainer = $(".flc-video");
        
        videoPlayerTimeUpdateAdapterTests.asyncTest("Test onTimeChange event", function () {
            var timeToSet = 10;
            
            fluid.videoPlayer.timeUpdateAdapter({
                components: {
                    html5MediaTimer: {
                        options: {
                            mediaElement: videoContainer
                        }
                    }
                },
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

        videoPlayerTimeUpdateAdapterTests.asyncTest("Test onIntervalChange event: true scenario", function () {
            fluid.videoPlayer.timeUpdateAdapter({
                components: {
                    html5MediaTimer: {
                        options: {
                            mediaElement: videoContainer
                        }
                    }
                },
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
                components: {
                    html5MediaTimer: {
                        options: {
                            mediaElement: videoContainer
                        }
                    }
                },
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
