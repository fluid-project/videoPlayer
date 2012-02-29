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
                
                html5Captionator.displayCaptions();
                
                html5Captionator.changeCaptions();
                
                jqUnit.assertNotUndefined("html5Captionator has been instantiated", html5Captionator);

                start();
            });
        });
        
        
        videoPlayerCaptionatorTests.asyncTest("html5Captionator without currentTrack", function () {
            var testIndex = 5;
            
            expect(6);
            
            setupEnvironment(true);
            
            initVideoPlayer(container[testIndex], testOptionsNoCurrentTrack, function (videoPlayer) {
                
                var html5Captionator = videoPlayer.html5Captionator;
                var currentTracks = html5Captionator.model.currentTracks;
                
                jqUnit.assertUndefined("currentTracks is empty in the model", testOptionsNoCurrentTrack.currentTracks);
                
                jqUnit.assertNotUndefined("html5Captionator has been instantiated", html5Captionator);
                
                jqUnit.assertEquals("Current track is NOT empty in the html5Captionator model it has only one element in it", 
                        1, currentTracks.captions.length);
                        
                jqUnit.assertEquals("And this element is the index for the first element in the array of captions", 
                        0, currentTracks.captions[0]);
                
                testTrackNotShowing(html5Captionator, 0);
                testTrackNotShowing(html5Captionator, 1);
                
                start();
            });
        });


    });
})(jQuery);
