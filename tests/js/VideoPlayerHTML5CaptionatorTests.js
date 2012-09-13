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
        fluid.setLogging(false);    // disable it not to mess up with FireBug in FF
        
        // containers. A separate one per test
        var container = [".videoPlayer0", ".videoPlayer1", ".videoPlayer2", ".videoPlayer3", ".videoPlayer4", ".videoPlayer5"];
        
        // selector to find if the captionator div is present on the webpage
        var captionatorSelector = ".captionator-cue-canvas";
        
        var videoPlayerCaptionatorTests = new jqUnit.TestCase("Video Player HTML5 Captionator Test Suite");
        
        var testOptionsNoCaptions = {            
            video: {
                sources: [
                    {
                        src: "TestVideo.mp4",
                        type: "video/mp4"
                    }
                ]
            },
            templates: {
                videoPlayer: {
                    href: "../../html/videoPlayer_template.html"
                }
            }
        };
        
        var testOptionsNoCurrentTrack = {};
        fluid.merge(null, testOptionsNoCurrentTrack, testOptionsNoCaptions);
        fluid.merge(null, testOptionsNoCurrentTrack, {
            video: {
                captions: [
                    {
                        src: "TestCaptions.en.vtt",
                        type: "text/vtt",
                        srclang: "en",
                        label: "English Subtitles",
                        kind: "subtitles"
                    },
                    {
                        src: "TestCaptions.fr.vtt",
                        type: "text/vtt",
                        srclang: "fr",
                        label: "French Subtitles",
                        kind: "subtitles"
                    }
                ]
            }
        });
        
        var testOptionsFull = {};
        fluid.merge(null, testOptionsFull, testOptionsNoCurrentTrack);
        fluid.merge(null, testOptionsFull, {
            model: {
                currentTracks: {
                    captions: [0]
                },
                displayCaptions: true
            }
        });
        
        var testTrackShowing = function (html5Captionator, index) {
            var tracks = html5Captionator.locate("video")[0].tracks;
                
            jqUnit.assertEquals(html5Captionator.options.captions[index].label + " are showing", captionator.TextTrack.SHOWING, tracks[index].mode);
        };
        
        var testTrackNotShowing = function (html5Captionator, index) {
            var tracks = html5Captionator.locate("video")[0].tracks;
                
            jqUnit.assertEquals(html5Captionator.options.captions[index].label + " are not showing", captionator.TextTrack.OFF, tracks[index].mode);
        };

        var testVTTCaption = function (vttArray, index, captionObj) {
            jqUnit.assertEquals("First line is empty", "", vttArray[index]);

            var times = fluid.videoPlayer.secondsToHmsm(captionObj.start_time) + " --> " + fluid.videoPlayer.secondsToHmsm(captionObj.end_time);

            jqUnit.assertEquals("Times are correctly specified", times, vttArray[index + 1]);
            jqUnit.assertEquals("Caption is in the correct position", captionObj.text, vttArray[index + 2]);
        };

        // videoPlayer creation
        var initVideoPlayer = function (container, options, callback) {
            options = options || {};
            
            fluid.merge(null, options, {
                listeners: {
                    onReady: function (videoPlayer) {
                        callback(videoPlayer);
                    }
                }
            });
            
            return fluid.videoPlayer(container, options);
        }

        // Function to set or unset HTML5 test environment
        var setupEnvironment = function (withHtml5) {
            if (withHtml5) {
                fluid.staticEnvironment.browserHtml5 = fluid.typeTag("fluid.browser.html5");
            } else {
                fluid.staticEnvironment.browserHtml5 = undefined;
            }
        }
        
        // A template function which checks captionator initalization depending on different provided options and config
        var testInit = function (config) {
            expect(2);
            
            setupEnvironment(config.isHTML5);
            
            config.testComponentFunc = config.hasComponent ? jqUnit.assertNotUndefined : jqUnit.assertUndefined;
            config.componentStr = config.hasComponent ? "html5Captionator has been instantiated"
                                                        : "html5Captionator has NOT been instantiated";
            config.domStr = config.hasDOMElement ? "Captionator DIV is present in the DOM"
                                                        : "Captionator DIV is NOT present in the DOM";
            
            initVideoPlayer(container[config.testIndex], config.options, function (videoPlayer) {
                config.testComponentFunc(config.componentStr, videoPlayer.html5Captionator);
                jqUnit.assertEquals(config.domStr, (config.hasDOMElement)?1:0, $(captionatorSelector).length);
                start();
            });
        }
        
        
        videoPlayerCaptionatorTests.asyncTest("NO HTML5: html5Captionator was not initialized", function () {
            testInit({
                testIndex: 0,
                options: testOptionsFull,
                isHTML5: false,
                hasComponent: false,
                hasDOMElement: false
            });
        });
        
        
        videoPlayerCaptionatorTests.asyncTest("HTML5: html5Captionator was initialized but without tracks", function () {
            testInit({
                testIndex: 1,
                options: testOptionsNoCaptions,
                isHTML5: true,
                hasComponent: true,
                hasDOMElement: false
            });
        });

        
        videoPlayerCaptionatorTests.asyncTest("HTML5: html5Captionator was initialized", function () {
            testInit({
                testIndex: 2,
                options: testOptionsFull,
                isHTML5: true,
                hasComponent: true,
                hasDOMElement: true
            });
        });

                
        videoPlayerCaptionatorTests.asyncTest("html5Captionator changing tracks and more", function () {
            var testIndex = 3;
            
            expect(7);
            
            setupEnvironment(true);
            
            initVideoPlayer(container[testIndex], testOptionsFull, function (videoPlayer) {
                
                var tracks = videoPlayer.html5Captionator.locate("video")[0].tracks;
                var html5Captionator = videoPlayer.html5Captionator;
                
                jqUnit.assertNotUndefined("html5Captionator has been instantiated", html5Captionator);
                
                testTrackShowing(html5Captionator, 0);
                testTrackNotShowing(html5Captionator, 1);
                
                fluid.videoPlayer.html5Captionator.showCurrentTrack([1], tracks, html5Captionator.options.captions);
                
                testTrackNotShowing(html5Captionator, 0);
                testTrackShowing(html5Captionator, 1);
                
                fluid.videoPlayer.html5Captionator.hideAllTracks(tracks);
                
                testTrackNotShowing(html5Captionator, 0);
                testTrackNotShowing(html5Captionator, 1);
                
                start();
            });
        });
        
        
        // TEST FLUID-4618. Writing a test to verify that functions in preInit work properly
        videoPlayerCaptionatorTests.asyncTest("html5Captionator displayCaptions test", function () {
            var testIndex = 4;
            
            expect(1);
            
            setupEnvironment(true);
            
            initVideoPlayer(container[testIndex], testOptionsFull, function (videoPlayer) {
                var html5Captionator = videoPlayer.html5Captionator;
                
                html5Captionator.refreshCaptions();
                
                jqUnit.assertNotUndefined("html5Captionator has been instantiated", html5Captionator);

                start();
            });
        });
        
        
        videoPlayerCaptionatorTests.asyncTest("html5Captionator without currentTrack", function () {
            var testIndex = 5;
            
            expect(5);
            
            setupEnvironment(true);
            
            initVideoPlayer(container[testIndex], testOptionsNoCurrentTrack, function (videoPlayer) {
                
                var html5Captionator = videoPlayer.html5Captionator;
                var currentTracks = html5Captionator.model.currentTracks;
                
                jqUnit.assertUndefined("currentTracks is empty in the model", testOptionsNoCurrentTrack.currentTracks);
                
                jqUnit.assertNotUndefined("html5Captionator has been instantiated", html5Captionator);
                
                jqUnit.assertEquals("Current track is also empty in the html5Captionator model", 
                        0, currentTracks.captions.length);
                // Can't support this "self-modification" of the model of captionator since it may corrupt data belonging
                // to others during startup
                //jqUnit.assertEquals("And this element is the index for the first element in the array of captions", 
                //        0, currentTracks.captions[0]);
                
                testTrackNotShowing(html5Captionator, 0);
                testTrackNotShowing(html5Captionator, 1);
                
                start();
            });
        });

        videoPlayerCaptionatorTests.test("secondsToHmsm", function () {
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

        videoPlayerCaptionatorTests.test("amaraJsonToVTT", function () {
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

        videoPlayerCaptionatorTests.asyncTest("fetchAmaraJson", function () {
            expect(2);

            fluid.fetchAmaraJsonCallback = function (data) {
                jqUnit.assertTrue("Json was fetched", data.length > 0);
                jqUnit.assertEquals("Checking the first caption text", "Eeny, meeny, miny, moe,", data[0].text);
                start();
            }

            fluid.videoPlayer.fetchAmaraJson("http://www.youtube.com/watch?v=_VxQEPw1x9E&language=en", fluid.fetchAmaraJsonCallback);
        });
        
    });
})(jQuery);
