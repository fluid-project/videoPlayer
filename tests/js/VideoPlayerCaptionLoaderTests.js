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

        var videoPlayerCaptionLoaderTests = new jqUnit.TestCase("Video Player Caption Loader Tests");

        var initCaptionLoader = function (testOptions) {
            var options = {
                model: {
                    captions: {
                        list: [{
                            label: "English",
                            src: "TestCaption.en.json",
                            type: "JSONcc"
                        }],
                        currentTrack: 0,
                        conversionServiceUrl: "/videoPlayer/conversion_service/index.php",
                        maxNumber: 3,
                        track: undefined
                    }
                }
            };
            
            $.extend(true, options, testOptions);
            return fluid.videoPlayer.captionLoader(".flc-captionLoader", options);
        };
        
        var testConvertToMilli = function (input, expected) {
            var convertedValue = fluid.videoPlayer.captionLoader.convertToMilli(input);
            
            jqUnit.assertEquals(input + " has been converted to " + convertedValue, expected, convertedValue);
        };
        
        videoPlayerCaptionLoaderTests.test("convertToMilli", function () {
            // undefined input
            var undefinedTime;
            testConvertToMilli(undefinedTime, null);
             
            // invalid input format
            testConvertToMilli("abc", null);
            
            testConvertToMilli("00:00:00.1", 1);
            testConvertToMilli("00:00:00.02", 2);
            testConvertToMilli("00:00:00.003", 3);
            testConvertToMilli("00:00:01.000", 1000);
            testConvertToMilli("00:01:00.000", 60000);
            testConvertToMilli("01:00:00.000", 3600000);
            testConvertToMilli("01:01:01.001", 3661001);

            // "hh" is optional and not provided
            testConvertToMilli("00:00.1", 1);
            testConvertToMilli("00:00.02", 2);
            testConvertToMilli("00:00.003", 3);
            testConvertToMilli("00:01.000", 1000);
            testConvertToMilli("01:00.000", 60000);
        });
        
        videoPlayerCaptionLoaderTests.asyncTest("loadCaption", function () {
            
            var expectedCaptions = [
                    {
                        "inTime": "00:00:01.77",
                        "outTime": "00:00:04.03",
                        "caption": "Eeny, meeny, miny, moe,"
                    },
                    {
                        "inTime": "00:00:04.03",
                        "outTime": "00:00:05.99",
                        "caption": "Catch a tiger by the toe"
                    }
                ];
            var expectedIntervalList = [
                    {
                        "begin": 1077,
                        "end": 4003
                    },
                    {
                        "begin": 4003,
                        "end": 5099
                    }
                ];
            var that = initCaptionLoader();
            that.loadCaptions();
            
            setTimeout(function () {
                jqUnit.assertDeepEq("Captions has been loaded and set into model", expectedCaptions, that.model.captions.track);
                jqUnit.assertDeepEq("The intervalList has been calculated correctly", expectedIntervalList, that.options.intervalList);
                start();
            }, 100);
        });

    });
})(jQuery);
