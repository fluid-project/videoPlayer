/*
Copyright 2012 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
 
 */

// Declare dependencies
/*global fluid, jqUnit, expect, jQuery, start*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    $(document).ready(function () {

        var videoPlayerIntervalEventsConductorTests = new jqUnit.TestCase("Video Player Interval Events Conductor Tests");
    
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
        
        videoPlayerIntervalEventsConductorTests.asyncTest("HTML5 Media Timer", function () {
            var timeToSet = 10;
            var videoContainer = $(".flc-video");

            var timer = fluid.videoPlayer.html5MediaTimer({
                mediaElement: videoContainer,
                listeners: {
                    onTick: function (time) {
                        jqUnit.assertEquals("The event onTick is fired with argument " + time, timeToSet, time);
                        start();
                    }
                }
            });
          
            setTimeout(function () {
                timer.options.mediaElement[0].currentTime = timeToSet;
            }, 10);
        });

        var testFindCurrentInterval = function (currentTime, previousInterval, expected) {
            expect(1);
            var result = fluid.videoPlayer.intervalEventsConductor.findCurrentInterval(currentTime, testIntervalList, previousInterval);
            
            jqUnit.assertDeepEq("The result from finding interval for the current time " + currentTime + " is expected", expected, result);
        };
        
        videoPlayerIntervalEventsConductorTests.test("findCurrentInterval", function () {
            testFindCurrentInterval(0.1, null, null);
            testFindCurrentInterval(1.1, null, "0");
            testFindCurrentInterval(1.5, "0", "0");
            testFindCurrentInterval(2.1, "0", "1");
            testFindCurrentInterval(3.5, "1", null);
            testFindCurrentInterval(4, null, "2");
        });
        
        videoPlayerIntervalEventsConductorTests.test("Test onTimeChange event", function () {
            expect(1);
            var timeToSet = 20;
            
            var that = fluid.videoPlayer.intervalEventsConductor({
                listeners: {
                    onTimeChange: function (time) {
                        jqUnit.assertEquals("The event onTimeChange is fired with argument " + time, timeToSet, time);
                    }
                }
            });
            that.events.onTick.fire(timeToSet);
        });

        var testIntervalChangeSuccess = function (timeToSet, expectedCurrentInterval, expectedPreviousInterval, desc) {
            videoPlayerIntervalEventsConductorTests.test("Success case of testing onIntervalChange event: " + desc, function () {
                expect(2);
                var that = fluid.videoPlayer.intervalEventsConductor({
                    intervalList: testIntervalList,
                    model: {
                        previousIntervalId: expectedPreviousInterval
                    },
                    listeners: {
                        onIntervalChange: function (currentInterval, previousInterval) {
                            jqUnit.assertEquals("The event onIntervalChange is fired with currentInterval " + currentInterval, expectedCurrentInterval, currentInterval);
                            jqUnit.assertEquals("The event onIntervalChange is fired with previousInterval " + previousInterval, expectedPreviousInterval, previousInterval);
                        }
                    }
                });
                that.events.onTick.fire(timeToSet);
            });
        };
        
        testIntervalChangeSuccess(1.5, "0", null, "Interval is changed from none to one");
        testIntervalChangeSuccess(2.1, "1", "0", "Interval is changed from one to another one");
        testIntervalChangeSuccess(3.5, null, "1", "Interval is changed from one to none");

        var testIntervalChangeError = function (timeToSet, previousInterval, desc) {
            videoPlayerIntervalEventsConductorTests.test("Error case of testing onIntervalChange event: " + desc, function () {
                expect(1);
                
                var onIntervalChangeFired = false;

                var that = fluid.videoPlayer.intervalEventsConductor({
                    intervalList: testIntervalList,
                    model: {
                        previousIntervalId: previousInterval
                    },
                    listeners: {
                        onIntervalChange: function (Id) {
                            onIntervalChangeFired = true;
                        }
                    }
                });
          
                that.events.onTick.fire(timeToSet);
                jqUnit.assertFalse("The event onIntervalChange is not fired", onIntervalChangeFired);
            });
        };
        
        testIntervalChangeError(0.1, null, "Interval is changed from none to none");
        testIntervalChangeError(1.5, "0", "Interval is changed to the same one");

    });
})(jQuery);
