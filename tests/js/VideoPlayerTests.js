/*
Copyright 2012-2013 OCAD University

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
        jqUnit.module("Video Player Tests");

        jqUnit.asyncTest("Configurable template path (FLUID-4572): valid path", function () {
            jqUnit.expect(1);
            var vidPlayer = fluid.testUtils.initVideoPlayer(".videoPlayer", {
                listeners: {
                    onTemplateReady: function () {
                        jqUnit.assertTrue("The template should load", true);
                        jqUnit.start();
                    },
                    onTemplateLoadError: function (href) {
                        jqUnit.assertTrue("Template Load Error should not fire", false);
                        jqUnit.start();
                    }
                }
            });
        });

        jqUnit.asyncTest("Configurable template path (FLUID-4572): invalid path", function () {
            jqUnit.expect(1);
            var vidPlayer = fluid.testUtils.initVideoPlayer(".videoPlayer", {
                templates: {
                    videoPlayer: {
                        href: "bad/test/path.html"
                    }
                },
                listeners: {
                    onTemplateReady: function () {
                        jqUnit.assertTrue("The template should not load", false);
                        jqUnit.start();
                    },
                    onTemplateLoadError: function (href) {
                        jqUnit.assertTrue("Event 'onTemplateLoadError' should fire", true);
                        jqUnit.start();
                    }
                }
            });
        });
        
        var testVTTCaption = function (vttArray, index, captionObj) {
            jqUnit.assertEquals("First line is empty", "", vttArray[index]);

            jqUnit.assertEquals("Times are correctly specified", captionObj.expected_vttTime, vttArray[index + 1]);
            jqUnit.assertEquals("Caption is in the correct position", captionObj.text, vttArray[index + 2]);
        };

        jqUnit.test("millisToHmsm", function () {
            jqUnit.expect(15);
            jqUnit.assertEquals("0 seconds", "00:00:00.000", fluid.videoPlayer.millisToHmsm(0));
            jqUnit.assertEquals("1 milli seconds", "00:00:00.100", fluid.videoPlayer.millisToHmsm(100));
            jqUnit.assertEquals("1111 milli seconds", "00:00:00.111", fluid.videoPlayer.millisToHmsm(111.1));
            jqUnit.assertEquals("10 seconds", "00:00:10.000", fluid.videoPlayer.millisToHmsm(10000));
            jqUnit.assertEquals("1 minute", "00:01:00.000", fluid.videoPlayer.millisToHmsm(60000));
            jqUnit.assertEquals("59 minutes", "00:59:00.000", fluid.videoPlayer.millisToHmsm("3540000"));
            jqUnit.assertEquals("59 minutes and 59 seconds", "00:59:59.000", fluid.videoPlayer.millisToHmsm(3599000));
            jqUnit.assertEquals("1 hour", "01:00:00.000", fluid.videoPlayer.millisToHmsm(3600000));
            jqUnit.assertEquals("25 hours", "25:00:00.000", fluid.videoPlayer.millisToHmsm(90000000));
            jqUnit.assertEquals("1 hour, 1 min, 1 sec", "01:01:01.000", fluid.videoPlayer.millisToHmsm(3661000));
            jqUnit.assertEquals("7 minutes and 5 seconds", "00:07:05.000", fluid.videoPlayer.millisToHmsm(425000));
            jqUnit.assertEquals("10 hours and 12 minutes", "10:12:00.000", fluid.videoPlayer.millisToHmsm(36720000));
            jqUnit.assertEquals("100 hours", "100:00:00.000", fluid.videoPlayer.millisToHmsm(360000000));
            jqUnit.assertEquals("Negative number - return 0", "00:00:00.000", fluid.videoPlayer.millisToHmsm(-1));
            jqUnit.assertEquals("letter - return 0", "00:00:00.000", fluid.videoPlayer.millisToHmsm("x"));
        });

        jqUnit.test("amaraJsonToVTT", function () {
            var testJson = [{
                "subtitle_id": "cseicmgnhp6334683",
                "text": "Eeny, meeny, miny, moe,",
                "start": 1.7769230769230799,
                "end": 4.0330000000000004,
                "expected_vttTime": "04:00:00.002 --> 00:00:00.004",
                "sub_order": 1.0,
                "start_of_paragraph": false
            }, {
                "subtitle_id": "mgnplxysgb6342310",
                "text": "Catch a tiger by the toe",
                "start": 4.0330000000000004,
                "end": 5.9923076923076897,
                "expected_vttTime": "00:00:00.004 --> 00:00:00.006",
                "sub_order": 2.0,
                "start_of_paragraph": false
            }, {
                "subtitle_id": "fdztnjtkic6348025",
                "text": "If he hollers let him go",
                "start": 5.9923076923076897,
                "end": 8.0560769230769207,
                "expected_vttTime": "00:00:00.006 --> 00:00:00.008",
                "sub_order": 3.0,
                "start_of_paragraph": false
            }];

            jqUnit.expect(2 + 3 * testJson.length);

            var result = fluid.videoPlayer.amaraJsonToVTT(testJson);
            var resultArray = result.split("\n");
            jqUnit.assertEquals("Should be 10 lines in the VTT", 10, resultArray.length);
            jqUnit.assertEquals("First line is WEBVTT", "WEBVTT", resultArray[0]);

            for (var i = 0; i < testJson.length; i++) {
                testVTTCaption(resultArray, i * 3 + 1, testJson[i]);
            }
        });

        jqUnit.asyncTest("fetchAmaraJson", function () {
            jqUnit.expect(2);

            fluid.fetchAmaraJsonCallback = function (data) {
                jqUnit.assertTrue("Json was fetched", data.subtitles.length > 0);
                jqUnit.assertEquals("Checking the first caption text", "Eeny, meeny, miny, moe,", data.subtitles[0].text);
                jqUnit.start();
            };

            fluid.videoPlayer.fetchAmaraJson("http://www.youtube.com/watch?v=_VxQEPw1x9E&language=en", "en", fluid.fetchAmaraJsonCallback);
        });

        var testVideoLabel = function (vp, expectedLabel) {
            jqUnit.expect(1);
            jqUnit.assertEquals("aria-label should be set properly", vp.options.strings.videoTitlePreface + expectedLabel, vp.locate("videoContainer").attr("aria-label"));
        };

        jqUnit.asyncTest("Video label: default", function () {
            var vidPlayer = fluid.testUtils.initVideoPlayer(".videoPlayer", {
                listeners: {
                    onReady: function (videoPlayer) {
                        testVideoLabel(videoPlayer, videoPlayer.options.videoTitle);
                        jqUnit.start();
                    }
                }
            });
        });

        jqUnit.asyncTest("Video label: custom", function () {
            var testTitle = "My Test Video Title";
            var vidPlayer = fluid.testUtils.initVideoPlayer(".videoPlayer", {
                videoTitle: testTitle,
                listeners: {
                    onReady: function (videoPlayer) {
                        testVideoLabel(videoPlayer, testTitle);
                        jqUnit.start();
                    }
                }
            });
        });


        var envFeatures = {"supportsHtml5": "fluid.browser.supportsHtml5", "supportsNativeVideo": "fluid.browser.nativeVideoSupport"};

        var HTML5Tests = [{
            desc: "video player instantiation with customized controller",
            async: true,
            testFn: function () {
                jqUnit.expect(3);

                var vidPlayer = fluid.testUtils.initVideoPlayer(".videoPlayer", {
                    controls: "custom",
                    listeners: {
                        onReady: function (videoPlayer) {
                            jqUnit.assertNotUndefined("The sub-component media has been instantiated", videoPlayer.media);
                            jqUnit.assertNotUndefined("The sub-component controllers has been instantiated", videoPlayer.controllers);
                            jqUnit.assertNotUndefined("The sub-component html5Captionator has been instantiated", videoPlayer.html5Captionator);

                            jqUnit.start();
                        }
                    }
                });
            }
        }, {
            desc: "Controllers instantiation",
            async: true,
            testFn: function () {
                jqUnit.expect(5);

                var vidPlayer = fluid.testUtils.initVideoPlayer(".videoPlayer", {
                    controls: "custom",
                    listeners: {
                        onControllersReady: function (controllers) {
                            jqUnit.assertNotUndefined("The sub-component scrubber has been instantiated", controllers.scrubber);
                            jqUnit.assertNotUndefined("The sub-component volumeControl has been instantiated", controllers.volumeControl);
                            jqUnit.assertNotUndefined("The sub-component captionControls has been instantiated", controllers.captionControls);
                            jqUnit.assertNotUndefined("The sub-component playButton has been instantiated", controllers.playButton);
                            jqUnit.assertNotUndefined("The sub-component fullScreenButton has been instantiated", controllers.fullScreenButton);

                            jqUnit.start();
                        }
                    }
                });
            }
        }];
        fluid.testUtils.testCaseWithEnv("Video Player Tests: HTML5-specific", HTML5Tests, envFeatures);

        envFeatures = {"supportsHtml5": false};

        var nonHTML5Tests = [{
            desc: "video player instantiation",
            async: true,
            testFn: function () {
                jqUnit.expect(3);

                var vidPlayer = fluid.testUtils.initVideoPlayer(".videoPlayer", {
                    listeners: {
                        onReady: function (videoPlayer) {
                            jqUnit.assertNotUndefined("The sub-component media has been instantiated", videoPlayer.media);
                            jqUnit.assertNotUndefined("The sub-component controllers has been instantiated", videoPlayer.controllers);
                            jqUnit.assertUndefined("The sub-component html5Captionator has NOT been instantiated", videoPlayer.captionner);

                            jqUnit.start();
                        }
                    }
                });
            }
        }];
        fluid.testUtils.testCaseWithEnv("Video Player Tests: NON-HTML5-specific", nonHTML5Tests, envFeatures);

    });
})(jQuery);
