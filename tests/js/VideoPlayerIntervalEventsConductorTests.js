/*
Copyright 2012 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
 
 */

// Declare dependencies
/*global fluid, jqUnit, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    $(document).ready(function () {

        jqUnit.module("Video Player Interval Events Conductor Tests");
    
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
        
        var testFindCurrentInterval = function (currentTime, previousInterval, expected) {
            jqUnit.expect(1);
            var result = fluid.videoPlayer.intervalEventsConductor.findCurrentInterval(currentTime, testIntervalList, previousInterval);
            
            jqUnit.assertDeepEq("The result from finding interval for the current time " + currentTime + " is expected", expected, result);
        };
        
        jqUnit.test("findCurrentInterval", function () {
            testFindCurrentInterval(0.1, null, null);
            testFindCurrentInterval(1.1, null, 0);
            testFindCurrentInterval(1.5, 0, 0);
            testFindCurrentInterval(2.1, 0, 1);
            testFindCurrentInterval(3.5, 1, null);
            testFindCurrentInterval(4, null, 2);
        });
        
        var testIntervalChangeFired = function (timeToSet, expectedCurrentInterval, expectedPreviousInterval, desc) {
            jqUnit.test("onIntervalChange event gets fired: " + desc, function () {
                jqUnit.expect(2);
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
                that.events.onTimeUpdate.fire(timeToSet);
            });
        };
        
        testIntervalChangeFired(1.5, "0", null, "Interval is changed from none to one");
        testIntervalChangeFired(2.1, "1", "0", "Interval is changed from one to another one");
        testIntervalChangeFired(3.5, null, "1", "Interval is changed from one to none");

        var testIntervalChangeNotFired = function (timeToSet, previousInterval, desc) {
            jqUnit.test("onIntervalChange event does NOT get fired: " + desc, function () {
                jqUnit.expect(1);
                
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
          
                that.events.onTimeUpdate.fire(timeToSet);
                jqUnit.assertFalse("The event onIntervalChange is not fired", onIntervalChangeFired);
            });
        };
        
        testIntervalChangeNotFired(0.1, null, "Interval is changed from none to none");
        testIntervalChangeNotFired(1.5, "0", "Interval is changed to the same one");

        /*********************************************************************************
         * Test case with a synthetic, test-driven timer component                       *
         *********************************************************************************/

        fluid.defaults("fluid.videoPlayer.testTimer", {
            gradeNames: ["fluid.eventedComponent", "autoInit"],
            finalInitFunction: "fluid.videoPlayer.testTimer.finalInit",
            timeToTick: null,
            events: {
                onTimeUpdate: null
            }
        });

        fluid.videoPlayer.testTimer.finalInit = function (that) {
            setTimeout(function () {
                that.events.onTimeUpdate.fire(that.options.timeToTick);
            }, 1);
        };

        jqUnit.asyncTest("intervalEventsConductor with a synthetic timer", function () {
            jqUnit.expect(3);
            
            var timeToSet = 1;
            var previousInterval = null;
            var expectedCurrentInterval = "0";

            var that = fluid.videoPlayer.intervalEventsConductor({
                components: {
                    testTimer: {
                        type: "fluid.videoPlayer.testTimer",
                        options: {
                            timeToTick: timeToSet,
                            events: {
                                onTimeUpdate: "{intervalEventsConductor}.events.onTimeUpdate"
                            }
                        }
                    }
                },
                intervalList: testIntervalList,
                model: {
                    previousIntervalId: previousInterval
                },
                listeners: {
                    onTimeUpdate: function (time) {
                        jqUnit.assertEquals("The event onTimeUpdate is fired with argument " + time, timeToSet, time);
                    },
                    onIntervalChange: function (currentInterval, previousInterval) {
                        jqUnit.assertEquals("The event onIntervalChange is fired with currentInterval " + expectedCurrentInterval, "0", currentInterval);
                        jqUnit.assertEquals("The event onIntervalChange is fired with previousInterval " + previousInterval, previousInterval, previousInterval);
                        jqUnit.start();
                    }
                }
            });
        });

    });
})(jQuery);
