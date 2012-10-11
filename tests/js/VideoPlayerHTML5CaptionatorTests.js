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
        
        var supportsHtml5 = {
            typeName: "fluid.browser.supportsHtml5"
        };
        
        var container = ".videoPlayer";
        var firstEnglishCaption = "English caption here";
        var firstFrenchCaption = "French caption here";
            // selector to find if the captionator div is present on the webpage
        var captionatorSelector = ".captionator-cue-canvas";
        var videoPlayerCaptionatorTests = new jqUnit.TestCase("Video Player HTML5 Captionator Test Suite");
        // summary:
        //          Function to test if the videoPlayer tracks have proper mode set to them
        // expectedMode:
        //          Array which consist of two booleans which tell if the mode should be SHOWING or OFF. First boolean is for English and second is for French
        //
        var testTrackMode = function(html5Captionator, expectedMode) {
            expectedMode || (expectedMode = []);
            expect(expectedMode.length);
            var addedMessage,
                tracks = html5Captionator.locate("video")[0].tracks;
            $.each(expectedMode, function(index, showing) {
                addedMessage = (showing) ? " set to SHOWING" : " set to OFF";
                jqUnit.assertEquals(html5Captionator.options.captions[index].label + addedMessage, 
                                    (showing) ? captionator.TextTrack.SHOWING : captionator.TextTrack.OFF, tracks[index].mode);
            });
        };
        var initVideoPlayer = function (options, callback) {
            options = options || {};

            fluid.merge(null, options, {
                listeners: {
                    onReady: function (videoPlayer) {
                        callback(videoPlayer);
                    }
                }
            });

            return fluid.videoPlayer(container, options);
        };
        // IMPORTANT. RUNS FROM A WEB SERVER: Captionator code does not handle reading files from file system.
        var testCaptionPresence = function (html5Captionator, captionText) {
            expect(1);
            var warningMessage = "WARNING, this test will run only from a web server. ";
            jqUnit.assertEquals(warningMessage + "Caption should be " + captionText, captionText, html5Captionator.locate("caption").find(".captionator-cue").text());
        };
        // config:
        //      options - options to pass in a videoPlayer
        //      isHTML5 - boolean flag to set presence of HTML5 in our test environment
        //      hasComponent - boolean for a check if html5Captionator component is present in the videoPlayer
        //      hasDOMElement - boolean for a check if html5Captionator component's markup is present in the DOM
        //
        var testInit = function (config) {
            expect(2);

            config.testComponentFunc = config.hasComponent ? jqUnit.assertNotUndefined : jqUnit.assertUndefined;
            config.componentStr = config.hasComponent ? "html5Captionator has been instantiated"
                                                        : "html5Captionator has NOT been instantiated";
            config.domStr = config.hasDOMElement ? "Captionator DIV is present in the DOM"
                                                        : "Captionator DIV is NOT present in the DOM";

            initVideoPlayer(config.options, function (videoPlayer) {
                config.testComponentFunc(config.componentStr, videoPlayer.html5Captionator);
                jqUnit.assertEquals(config.domStr, (config.hasDOMElement)?1:0, $(captionatorSelector).length);
                start();
            });
        };
        var defaultOptionsNoCaptions = {
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
        var optionsWithoutCurrentTrack = {};
        var optionsFull = {};
        var optionsFullWithDisplayCaptionsOff = {};

        // build optionsWithoutCurrentTrack based on defaultOptionsNoCaptions with some extra options
        fluid.merge(null, optionsWithoutCurrentTrack, defaultOptionsNoCaptions);
        fluid.merge(null, optionsWithoutCurrentTrack, {
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

        // build optionsFull based on optionsWithoutCurrentTrack with some extra options
        fluid.merge(null, optionsFull, optionsWithoutCurrentTrack);
        fluid.merge(null, optionsFull, {
            model: {
                currentTracks: {
                    captions: [0]
                },
                displayCaptions: true
            }
        });
        
        var testTrackShowing = function (trackEl) {
            jqUnit.assertEquals(trackEl.track.label + " are showing", captionator.TextTrack.SHOWING, trackEl.track.mode);
        };
        
        var testTrackNotShowing = function (trackEl) {
            jqUnit.assertEquals(trackEl.track.label + " are not showing", captionator.TextTrack.OFF, trackEl.track.mode);
        };

        // build optionsFullWithDisplayCaptionsOff based on optionsWithoutCurrentTrack but with displayCaptions set to false
        fluid.merge(null, optionsFullWithDisplayCaptionsOff, optionsWithoutCurrentTrack);
        fluid.merge(null, optionsFullWithDisplayCaptionsOff, {
            model: {
                currentTracks: {
                    captions: [0]
                },
                displayCaptions: false
            }
        });

        // Define tests declaratively
        var testScenarios = {
            "NO HTML5: html5Captionator was not initialized": {
                testEnviornment: videoPlayerCaptionatorTests,
                integration: {
                    supportsHtml5: null
                },
                testFunction: function () {
                    testInit({
                        options: optionsFull,
                        hasComponent: false,
                        hasDOMElement: false
                    });
                }
            },
            "HTML5: html5Captionator was initialized but without tracks": {
                testEnviornment: videoPlayerCaptionatorTests,
                integration: {
                    supportsHtml5: supportsHtml5
                },
                testFunction: function () {
                    testInit({
                        options: defaultOptionsNoCaptions,
                        hasComponent: true,
                        hasDOMElement: false
                    });
                }
            },
            "HTML5: html5Captionator was initialized": {
                testEnviornment: videoPlayerCaptionatorTests,
                integration: {
                    supportsHtml5: supportsHtml5
                },
                testFunction: function () {
                    testInit({
                        options: optionsFull,
                        hasComponent: true,
                        hasDOMElement: true
                    });
                }
            },
            "html5Captionator changing tracks and more": {
                testEnviornment: videoPlayerCaptionatorTests,
                integration: {
                    supportsHtml5: supportsHtml5
                },
                testFunction: function () {
                    initVideoPlayer(optionsFull, function (videoPlayer) {
                        // VERY BAD. There is no callback for a captionator to fire when it loaded its captions, so we have to wait 1 second before do the test check
                        setTimeout(function() {
                            var tracks = videoPlayer.html5Captionator.locate("video")[0].tracks,
                                html5Captionator = videoPlayer.html5Captionator;

                            jqUnit.assertNotUndefined("html5Captionator has been instantiated", html5Captionator);
                            testTrackMode(html5Captionator, [true, false]);
                            testCaptionPresence(html5Captionator, firstEnglishCaption);
                            fluid.videoPlayer.html5Captionator.showCurrentTrack([1], tracks, html5Captionator.options.captions);

                            testTrackMode(html5Captionator, [false, true]);
                            // VERY BAD. There is no callback for a captionator to fire when it loaded its captions, so we have to wait 1 second before do the test check
                            setTimeout(function() {
                                testCaptionPresence(html5Captionator, firstFrenchCaption);
                                fluid.videoPlayer.html5Captionator.hideAllTracks(tracks);
                                testTrackMode(html5Captionator, [false, false]);
                                testCaptionPresence(html5Captionator, "");
                                expect(1);
                                start();
                            }, 1000);
                        }, 1000);
                    });
                }
            },
            // TEST FLUID-4618. Writing a test to verify that functions in preInit work properly
            "html5Captionator displayCaptions test": {
                testEnviornment: videoPlayerCaptionatorTests, 
                integration: {
                    supportsHtml5: supportsHtml5
                },
                testFunction: function () {
                    initVideoPlayer(optionsFull, function (videoPlayer) {
                        // VERY BAD. There is no callback for a captionator to fire when it loaded its captions, so we have to wait 1 second before do the test check
                        setTimeout(function() {
                            var html5Captionator = videoPlayer.html5Captionator;
                            html5Captionator.refreshCaptions();
                            jqUnit.assertNotUndefined("html5Captionator has been instantiated", html5Captionator);
                            testCaptionPresence(html5Captionator, firstEnglishCaption);
                            expect(1);
                            start();
                        }, 1000);
                    });
                }
            },
            "html5Captionator without currentTrack": {
                testEnviornment: videoPlayerCaptionatorTests,
                integration: {
                    supportsHtml5: supportsHtml5
                },
                testFunction: function () {
                    initVideoPlayer(optionsWithoutCurrentTrack, function (videoPlayer) {
                        setTimeout(function() {
                            var html5Captionator = videoPlayer.html5Captionator,
                                currentTracks = html5Captionator.model.currentTracks;

                            jqUnit.assertUndefined("currentTracks is empty in the model", optionsWithoutCurrentTrack.currentTracks);

                            jqUnit.assertNotUndefined("html5Captionator has been instantiated", html5Captionator);

                            jqUnit.assertEquals("Current track is also empty in the html5Captionator model",
                                    0, currentTracks.captions.length);
                            // Can't support this "self-modification" of the model of captionator since it may corrupt data belonging
                            // to others during startup
                            //jqUnit.assertEquals("And this element is the index for the first element in the array of captions", 
                            //        0, currentTracks.captions[0]);

                            testTrackMode(html5Captionator, [false, false]);

                            // Check that captions are not present in the DOM
                            testCaptionPresence(html5Captionator, "");
                            expect(3);
                            start();
                        });
                    });
                }
            },
            "displayCaptions is set to false so no captions should be present at all in the DOM": {
                testEnviornment: videoPlayerCaptionatorTests,
                integration: {
                    supportsHtml5: supportsHtml5
                },
                testFunction: function () {
                    initVideoPlayer(optionsFullWithDisplayCaptionsOff, function (videoPlayer) {
                        setTimeout(function() {
                            var html5Captionator = videoPlayer.html5Captionator;
                            testTrackMode(html5Captionator, [false, false]);
                            // Check that captions are not present in the DOM
                            testCaptionPresence(html5Captionator, "");
                            start();
                        });
                    });
                }
            }
        };

        // Running out tests
        fluid.testUtils.runTestScenarios(testScenarios);

    });
})(jQuery);
