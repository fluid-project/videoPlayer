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

        var videoPlayerTests = new jqUnit.TestCase("Video Player Tests");

        var initVideoPlayer = function (testOptions) {
            var opts = {
                video: {
                    sources: [
                        {
                            src: "TestVideo.mp4",
                            type: "video/mp4"
                        }
                    ]
                },
                model: {},
                templates: {
                    videoPlayer: {
                        // override the default template path
                        // TODO: We need to refactor the VideoPlayer to better support
                        //       overriding the path without needing to know file names
                        href: "../../html/videoPlayer_template.html"
                    }
                }
            };
            $.extend(true, opts, testOptions);
            return fluid.videoPlayer(".videoPlayer", opts);
        };

        videoPlayerTests.asyncTest("Configurable template path (FLUID-4572): valid path", function () {
            jqUnit.expect(1);
            var vidPlayer = initVideoPlayer({
                listeners: {
                    onTemplateReady: function () {
                        jqUnit.assertTrue("The template should load", true);
                        start();
                    },
                    onTemplateLoadError: function (href) {
                        jqUnit.assertTrue("Template Load Error should not fire", false);
                        start();
                    }
                }
            });
        });

        videoPlayerTests.asyncTest("Configurable template path (FLUID-4572): invalid path", function () {
            jqUnit.expect(1);
            var vidPlayer = initVideoPlayer({
                templates: {
                    videoPlayer: {
                        href: "bad/test/path.html"
                    }
                },
                listeners: {
                    onTemplateReady: function () {
                        jqUnit.assertTrue("The template should not load", false);
                        start();
                    },
                    onTemplateLoadError: function (href) {
                        jqUnit.assertTrue("Event 'onTemplateLoadError' should fire", true);
                        start();
                    }
                }
            });
        });

        function setupEnvironment(withHtml5) {
            delete fluid.staticEnvironment.browserHtml5;
            
            if (withHtml5) {
                fluid.staticEnvironment.browserHtml5 = fluid.typeTag("fluid.browser.html5");
            }
        }
        
        videoPlayerTests.asyncTest("HTML5: video player instantiation with customized controller", function () {
            jqUnit.expect(6);
            
            setupEnvironment(true);
            
            initVideoPlayer({
                controls: "custom",
                listeners: {
                    onReady: function (videoPlayer) {
                        jqUnit.assertNotUndefined("The sub-component media has been instantiated", videoPlayer.media);
                        jqUnit.assertNotUndefined("The sub-component controllers has been instantiated", videoPlayer.controllers);
                        jqUnit.assertNotUndefined("The sub-component html5Captionator has been instantiated", videoPlayer.html5Captionator);
                        jqUnit.assertNotUndefined("The sub-component transcript has been instantiated", videoPlayer.transcript);
                        jqUnit.assertUndefined("The sub-component browserCompatibility has NOT been instantiated", videoPlayer.browserCompatibility);
                        jqUnit.assertNotUndefined("The sub-component intervalEventsConductor has been instantiated", videoPlayer.intervalEventsConductor);
                        
                        start();
                    }
                }
            });
        });

        videoPlayerTests.asyncTest("HTML5: video player instantiation with native controller", function () {
            jqUnit.expect(6);
            
            setupEnvironment(true);
            
            initVideoPlayer({
                controls: "native",
                listeners: {
                    onReady: function (videoPlayer) {
                        jqUnit.assertNotUndefined("The sub-component media has been instantiated", videoPlayer.media);
                        jqUnit.assertUndefined("The sub-component controllers has been NOT instantiated", videoPlayer.controllers);
                        jqUnit.assertNotUndefined("The sub-component html5Captionator has been instantiated", videoPlayer.html5Captionator);
                        jqUnit.assertNotUndefined("The sub-component transcript has been instantiated", videoPlayer.transcript);
                        jqUnit.assertUndefined("The sub-component browserCompatibility has NOT been instantiated", videoPlayer.browserCompatibility);
                        jqUnit.assertNotUndefined("The sub-component intervalEventsConductor has been instantiated", videoPlayer.intervalEventsConductor);
                        
                        start();
                    }
                }
            });
        });

        videoPlayerTests.asyncTest("HTML5: Controllers instantiation", function () {
            jqUnit.expect(5);
            
            setupEnvironment(true);
            
            initVideoPlayer({
                controls: "custom",
                listeners: {
                    onControllersReady: function (controllers) {
                        jqUnit.assertNotUndefined("The sub-component scrubber has been instantiated", controllers.scrubber);
                        jqUnit.assertNotUndefined("The sub-component volumeControl has been instantiated", controllers.volumeControl);
                        jqUnit.assertNotUndefined("The sub-component captionControls has been instantiated", controllers.captionControls);
                        jqUnit.assertNotUndefined("The sub-component playButton has been instantiated", controllers.playButton);
                        jqUnit.assertNotUndefined("The sub-component fullScreenButton has been instantiated", controllers.fullScreenButton);
                        
                        start();
                    }
                }
            });
        });

        videoPlayerTests.asyncTest("NON-HTML5: video player instantiation", function () {
            jqUnit.expect(5);
            
            setupEnvironment(false);
            
            initVideoPlayer({
                listeners: {
                    onReady: function (videoPlayer) {
                        jqUnit.assertNotUndefined("The sub-component media has been instantiated", videoPlayer.media);
                        jqUnit.assertUndefined("The sub-component controllers has NOT been instantiated", videoPlayer.controllers);
                        jqUnit.assertUndefined("The sub-component captionner has NOT been instantiated", videoPlayer.captionner);
                        jqUnit.assertUndefined("The sub-component captionLoader has NOT been instantiated", videoPlayer.captionLoader);
                        jqUnit.assertNotUndefined("The sub-component browserCompatibility has been instantiated", videoPlayer.browserCompatibility);
                        
                        start();
                    }
                }
            });
        });

        var testVTTCaption = function (vttArray, index, captionObj) {
            jqUnit.assertEquals("First line is empty", "", vttArray[index]);

            var times = fluid.videoPlayer.secondsToHmsm(captionObj.start_time) + " --> " + fluid.videoPlayer.secondsToHmsm(captionObj.end_time);

            jqUnit.assertEquals("Times are correctly specified", times, vttArray[index + 1]);
            jqUnit.assertEquals("Caption is in the correct position", captionObj.text, vttArray[index + 2]);
        };

        videoPlayerTests.test("secondsToHmsm", function () {
            expect(15);
            jqUnit.assertEquals("0 seconds", "00:00:00.000", fluid.videoPlayer.secondsToHmsm(0));
            jqUnit.assertEquals("1 milli seconds", "00:00:00.100", fluid.videoPlayer.secondsToHmsm(0.1));
            jqUnit.assertEquals("1111 milli seconds", "00:00:00.111", fluid.videoPlayer.secondsToHmsm(0.1111));
            jqUnit.assertEquals("10 seconds", "00:00:10.000", fluid.videoPlayer.secondsToHmsm(10));
            jqUnit.assertEquals("1 minute", "00:01:00.000", fluid.videoPlayer.secondsToHmsm(60));
            jqUnit.assertEquals("59 minutes", "00:59:00.000", fluid.videoPlayer.secondsToHmsm("3540"));
            jqUnit.assertEquals("59 minutes and 59 seconds", "00:59:59.000", fluid.videoPlayer.secondsToHmsm(3599));
            jqUnit.assertEquals("1 hour", "01:00:00.000", fluid.videoPlayer.secondsToHmsm(3600));
            jqUnit.assertEquals("25 hours", "25:00:00.000", fluid.videoPlayer.secondsToHmsm(90000));
            jqUnit.assertEquals("1 hour, 1 min, 1 sec", "01:01:01.000", fluid.videoPlayer.secondsToHmsm(3661));
            jqUnit.assertEquals("7 minutes and 5 seconds", "00:07:05.000", fluid.videoPlayer.secondsToHmsm(425));
            jqUnit.assertEquals("10 hours and 12 minutes", "10:12:00.000", fluid.videoPlayer.secondsToHmsm(36720));
            jqUnit.assertEquals("100 hours", "100:00:00.000", fluid.videoPlayer.secondsToHmsm(360000));
            jqUnit.assertEquals("Negative number - return 0", "00:00:00.000", fluid.videoPlayer.secondsToHmsm(-1));
            jqUnit.assertEquals("letter - return 0", "00:00:00.000", fluid.videoPlayer.secondsToHmsm("x"));
        });

        videoPlayerTests.test("amaraJsonToVTT", function () {
            var testJson = [{
                "subtitle_id": "cseicmgnhp6334683",
                "text": "Eeny, meeny, miny, moe,",
                "start_time": 1.7769230769230799,
                "end_time": 4.0330000000000004,
                "sub_order": 1.0,
                "start_of_paragraph": false
            }, {
                "subtitle_id": "mgnplxysgb6342310",
                "text": "Catch a tiger by the toe",
                "start_time": 4.0330000000000004,
                "end_time": 5.9923076923076897,
                "sub_order": 2.0,
                "start_of_paragraph": false
            }, {
                "subtitle_id": "fdztnjtkic6348025",
                "text": "If he hollers let him go",
                "start_time": 5.9923076923076897,
                "end_time": 8.0560769230769207,
                "sub_order": 3.0,
                "start_of_paragraph": false
            }];

            expect(2 + 3 * testJson.length);

            var result = fluid.videoPlayer.amaraJsonToVTT(testJson);
            var resultArray = result.split("\n");
            jqUnit.assertEquals("Should be 10 lines in the VTT", 10, resultArray.length);
            jqUnit.assertEquals("First line is WEBVTT", "WEBVTT", resultArray[0]);

            for (var i = 0; i < testJson.length; i++) {
                testVTTCaption(resultArray, i * 3 + 1, testJson[i]);
            }
        });

        videoPlayerTests.asyncTest("fetchAmaraJson", function () {
            expect(2);

            fluid.fetchAmaraJsonCallback = function (data) {
                jqUnit.assertTrue("Json was fetched", data.length > 0);
                jqUnit.assertEquals("Checking the first caption text", "Eeny, meeny, miny, moe,", data[0].text);
                start();
            };

            fluid.videoPlayer.fetchAmaraJson("http://www.youtube.com/watch?v=_VxQEPw1x9E&language=en", fluid.fetchAmaraJsonCallback);
        });

        var testVideoLabel = function (vp, expectedLabel) {
            expect(1);
            jqUnit.assertEquals("aria-label should be set properly", vp.options.strings.videoTitlePreface + ": " + expectedLabel, vp.locate("video").attr("aria-label"));
        };

        videoPlayerTests.asyncTest("Video label: default", function () {
            setupEnvironment(true);
            initVideoPlayer({
                listeners: {
                    onReady: function (videoPlayer) {
                        testVideoLabel(videoPlayer, videoPlayer.options.videoTitle);
                        start();
                    }
                }
            });
        });

        videoPlayerTests.asyncTest("Video label: custom", function () {
            setupEnvironment(true);
            var testTitle = "My Test Video Title";
            initVideoPlayer({
                videoTitle: testTitle,
                listeners: {
                    onReady: function (videoPlayer) {
                        testVideoLabel(videoPlayer, testTitle);
                        start();
                    }
                }
            });
        });

    });
})(jQuery);
