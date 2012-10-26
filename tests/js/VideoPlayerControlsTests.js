/*
Copyright 2012 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
 
 */

// Declare dependencies
/*global fluid, jqUnit, jQuery, start*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

fluid.registerNamespace("fluid.tests");

(function ($) {
    $(document).ready(function () {

        // TODO: The various "fluid.tests.initXXX" functions could probably be refactored to reduce duplication

        var videoPlayerControlsTests = new jqUnit.TestCase("Video Player Controls Tests");

        var baseVideoPlayerOpts = {
            video: {
                sources: [
                    {
                        src: "TestVideo.mp4",
                        type: "video/mp4"
                    },
                    {
                        src: "../../demos/videos/ReorganizeFuture/ReorganizeFuture.webm",
                        type: "video/webm"
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
        fluid.tests.initVideoPlayer = function (testOpts) {
            var opts = fluid.copy(baseVideoPlayerOpts);
            $.extend(true, opts, testOpts);
            return fluid.videoPlayer("#videoPlayer", opts);
        };

        videoPlayerControlsTests.asyncTest("Play button", function () {
            var testPlayer = fluid.tests.initVideoPlayer({
                listeners: {
                    onControllersReady: function (that) {
                        var playButton = that.locate("play");
                        fluid.testUtils.verifyBasicButtonFunctions(playButton, "Play", "Play", "Pause", "fl-videoPlayer-playing");

                        start();
                    }
                }
            });
        });

        var baseVolumeOpts = {};

        fluid.tests.initVolumeControls = function (testOpts) {
            var opts = fluid.copy(baseVolumeOpts);
            $.extend(true, opts, testOpts);
            return fluid.videoPlayer.volumeControls("#basic-volume-controls-test", opts);
        };

        videoPlayerControlsTests.asyncTest("Volume controls", function () {
            jqUnit.expect(5);
            var checkSlider = function (ariavaluenow, expectedValue) {
                    jqUnit.assertEquals("The slider button should have valuenow of " + expectedValue, expectedValue, ariavaluenow);
                },
                checkTooltipOnHover = function (element, expectedText) {
                    fluid.testUtils.getTooltipCheckString(element, expectedText);
                    element.mouseleave();
                },
                testVolumeControls = fluid.tests.initVolumeControls({
                    listeners: {
                        onReady: function (that) {
                            var muteButton = that.locate("mute"),
                                volumeSlider = that.locate("volumeControl"),
                                sliderHandle = that.locate("handle");

                            checkTooltipOnHover(volumeSlider, "Volume");
                            checkTooltipOnHover(muteButton, "Mute");
                            muteButton.click();
                            checkSlider(sliderHandle.attr("aria-valuenow"), "0");
                            checkTooltipOnHover(muteButton, "Un-mute");
                            muteButton.click();

                            jqUnit.assertEquals("There should be exactly one volume slider", 1, volumeSlider.length);
                            jqUnit.assertEquals("The slider button should have role of 'slider'", "slider", sliderHandle.attr("role"));
                            checkSlider(sliderHandle.attr("aria-valuenow"), "50");
                            jqUnit.notVisible("The slider should not be visible initially", volumeSlider);

                            start();
                        }
                    }
                });
        });

        videoPlayerControlsTests.asyncTest("Volume controls integration", function () {
            jqUnit.expect(4);
            var testPlayer = fluid.tests.initVideoPlayer({
                listeners: {
                    onControllersReady: function (that) {
                        var video = $("video")[0];
                        var muteButton = that.volumeControl.locate("mute");

                        jqUnit.assertFalse("Initially, video should not be muted", video.muted);
                        muteButton.click();
                        jqUnit.assertTrue("After clicking mute button, video should be muted", video.muted);
                        muteButton.click();
                        jqUnit.assertFalse("After clicking mute button again, video should again not be muted", video.muted);

                        var sliderHandle = that.volumeControl.locate("handle");
                        jqUnit.assertEquals("The slider button should have valuenow of '60'", "60", sliderHandle.attr("aria-valuenow"));

                        start();
                    }
                }
            });
        });

        var testBufferEndTime;
        
        var baseScrubberOpts = {
            model: {
                buffered: {
                    length: 1,
                    end: function (index) {
                        return testBufferEndTime;
                    }
                },
                totalTime: 200
            }
        };

        fluid.tests.initScrubber = function (testOpts) {
            var opts = fluid.copy(baseScrubberOpts);
            $.extend(true, opts, testOpts);
            return fluid.videoPlayer.controllers.scrubber("#scrubber-test", opts);
        };

        videoPlayerControlsTests.test("Buffer progress update", function () {
            jqUnit.expect(3);
            var scrubber = fluid.tests.initScrubber();
            
            fluid.videoPlayer.controllers.scrubber.updateBuffered(scrubber);
            jqUnit.assertEquals("The buffer progress bar should not get updated with undefined buffered value", "0", scrubber.locate("bufferedProgressBar").attr("aria-valuenow"));

            testBufferEndTime = 100;
            fluid.videoPlayer.controllers.scrubber.updateBuffered(scrubber);
            jqUnit.assertEquals("The buffer progress bar should have valuenow of '50'", "50", scrubber.locate("bufferedProgressBar").attr("aria-valuenow"));

            testBufferEndTime = 200;
            fluid.videoPlayer.controllers.scrubber.updateBuffered(scrubber);
            jqUnit.assertEquals("The buffer progress bar should have valuenow of '100'", "100", scrubber.locate("bufferedProgressBar").attr("aria-valuenow"));

        });

        fluid.tests.checkFullScreenButtonStyle = function (options) {
            jqUnit[options.expectedFullScreen ? "assertTrue" : "assertFalse"](options.message, options.modelFullScreen);
            jqUnit.assertEquals("After click, full screen button should have a proper styling", !options.expectedFullScreen, options.fullScreenButton.hasClass(options.fullScreenButtonStyles.init));
            jqUnit.assertEquals("After click, full screen button should have a proper styling", options.expectedFullScreen, options.fullScreenButton.hasClass(options.fullScreenButtonStyles.pressed));
        };

        var envFeatures = {"supportsFullScreen": "fluid.browser.supportsFullScreen"};

        var fullScreenTests = [{
            desc: "Fullscreen button should be present in the browsers which support fullscreen mode",
            async: true,
            testFn: function () {
                jqUnit.expect(2);

                var testPlayer = fluid.tests.initVideoPlayer({
                    listeners: {
                        onControllersReady: function (that) {
                            jqUnit.assertNotEquals("Full screen button component is not an empty one", that.options.components.fullScreenButton.type, "fluid.emptySubcomponent");
                            jqUnit.assertNotEquals("Full screen button should be present", that.locate("fullscreen").css("display"), "none");
                            start();
                        }
                    }
                });
            }
        }, {
            desc: "Fullscreen button",
            async: true,
            testFn: function () {
                jqUnit.expect(9);
                var testPlayer = fluid.tests.initVideoPlayer({
                    listeners: {
                        onControllersReady: function (that) {
                            that.applier.modelChanged.removeListener("fullscreen", that.full);

                            var fullScreenButton = that.locate("fullscreen"),
                                fullScreenButtonStyles = that.options.components.fullScreenButton.options.styles;

                            fluid.testUtils.verifyBasicButtonFunctions(fullScreenButton, "Fullscreen", "Full screen", "Exit full screen mode", "fl-videoPlayer-fullscreen-on");

                            fluid.tests.checkFullScreenButtonStyle({
                                message: "Initally, video should not be in full screen mode",
                                expectedFullScreen: false,
                                modelFullScreen: that.model.fullscreen,
                                fullScreenButtonStyles: fullScreenButtonStyles,
                                fullScreenButton: fullScreenButton
                            });

                            fullScreenButton.click();
                            fluid.tests.checkFullScreenButtonStyle({
                                message: "After click, video should be in full screen mode",
                                expectedFullScreen: true,
                                modelFullScreen: that.model.fullscreen,
                                fullScreenButtonStyles: fullScreenButtonStyles,
                                fullScreenButton: fullScreenButton
                            });

                            fullScreenButton.click();
                            fluid.tests.checkFullScreenButtonStyle({
                                message: "After clicking again, video should not be in full screen mode",
                                expectedFullScreen: false,
                                modelFullScreen: that.model.fullscreen,
                                fullScreenButtonStyles: fullScreenButtonStyles,
                                fullScreenButton: fullScreenButton
                            });
                            start();
                        }
                    }
                });
            }
        }];
        fluid.testUtils.testCaseWithEnv("Video Player Controls Tests: Full-screen", fullScreenTests, envFeatures);

        envFeatures = {"supportsFullScreen": false};

        var nonFullScreenTests = [{
            desc: "Fullscreen button should NOT be present",
            async: true,
            testFn: function () {
                jqUnit.expect(1);

                var testPlayer = fluid.tests.initVideoPlayer({
                    listeners: {
                        onControllersReady: function (that) {
                            jqUnit.assertEquals("Full screen button should NOT be present", that.options.components.fullScreenButton.type, "fluid.emptySubcomponent");
                            start();
                        }
                    }
                });
            }
        }];
        fluid.testUtils.testCaseWithEnv("Video Player Controls Tests: Non-Full-screen", nonFullScreenTests, envFeatures);

    });
})(jQuery);
