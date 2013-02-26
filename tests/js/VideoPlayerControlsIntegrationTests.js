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

fluid.registerNamespace("fluid.tests");

(function ($) {
    $(document).ready(function () {

        jqUnit.module("Video Player Controls Integration Tests");

        jqUnit.asyncTest("Play button", function () {
            var testPlayer = fluid.testUtils.initVideoPlayer("#videoPlayer", {
                listeners: {
                    onReady: {
                        listener: function (controllers) {
                            var playButton = controllers.locate("play");
                            fluid.testUtils.verifyBasicButtonFunctions(playButton, "Play", "Play", "Pause", "fl-videoPlayer-playing");

                            jqUnit.start();
                        },
                        args: ["{controllers}"]
                    }
                }
            });
        });

        jqUnit.asyncTest("Volume controls integration", function () {
            jqUnit.expect(4);
            var testPlayer = fluid.testUtils.initVideoPlayer("#videoPlayer", {
                listeners: {
                    onReady: {
                        listener: function (that) {
                            var video = that.model.mediaElementVideo;
                            var muteButton = that.controllers.volumeControl.locate("mute");

                            jqUnit.assertFalse("Initially, video should not be muted", video.muted);
                            muteButton.click();
                            jqUnit.assertTrue("After clicking mute button, video should be muted", video.muted);
                            muteButton.click();
                            jqUnit.assertFalse("After clicking mute button again, video should again not be muted", video.muted);

                            var sliderHandle = that.controllers.volumeControl.locate("handle");
                            jqUnit.assertEquals("The slider button should have valuenow of '60'", "60", sliderHandle.attr("aria-valuenow"));

                            jqUnit.start();
                        }
                    }
                }
            });
        });
        
        var baseScrubberOpts = {
            model: {
                totalTime: 200
            }
        };

        fluid.tests.initScrubber = function (testOpts) {
            var opts = fluid.copy(baseScrubberOpts);
            $.extend(true, opts, testOpts);
            return fluid.videoPlayer.controllers.scrubber("#scrubber-test", opts);
        };

        jqUnit.test("Buffer progress update", function () {
            jqUnit.expect(3);
            var scrubber = fluid.tests.initScrubber();
            
            fluid.videoPlayer.controllers.scrubber.updateBuffered(scrubber);
            jqUnit.assertEquals("The buffer progress bar should not get updated when bufferEnd is not set", "0", scrubber.locate("bufferedProgressBar").attr("aria-valuenow"));

            scrubber.applier.requestChange("bufferEnd", 100);
            fluid.videoPlayer.controllers.scrubber.updateBuffered(scrubber);
            jqUnit.assertEquals("The buffer progress bar should have valuenow of '50'", "50", scrubber.locate("bufferedProgressBar").attr("aria-valuenow"));

            scrubber.applier.requestChange("bufferEnd", 200);
            fluid.videoPlayer.controllers.scrubber.updateBuffered(scrubber);
            jqUnit.assertEquals("The buffer progress bar should have valuenow of '100'", "100", scrubber.locate("bufferedProgressBar").attr("aria-valuenow"));

        });

        jqUnit.asyncTest("Show/hide scrubber handle", function () {
            var testPlayer = fluid.testUtils.initVideoPlayer("#videoPlayer", {
                listeners: {
                    onReady: {
                        listener: function (controllers) {
                            // The controllers main container is hidden by default. Show it for the further tests.
                            controllers.container.show();
                            
                            controllers.applier.requestChange("totalTime", 0);
                            jqUnit.notVisible("The scrubber handle is not shown", controllers.scrubber.locate("handle"));
                            controllers.applier.requestChange("totalTime", 100);
                            jqUnit.isVisible("The scrubber handle is shown", controllers.scrubber.locate("handle"));
                            jqUnit.start();
                        },
                        args: ["{controllers}"]
                    }
                }
            });
        });

        fluid.tests.checkFullScreenButtonStyle = function (options) {
            jqUnit[options.expectedFullScreen ? "assertTrue" : "assertFalse"](options.message, options.modelFullScreen);
            jqUnit.assertEquals("After click, full screen button should have a proper styling", !options.expectedFullScreen, options.fullScreenButton.hasClass(options.fullScreenButtonStyles.init));
            jqUnit.assertEquals("After click, full screen button should have a proper styling", options.expectedFullScreen, options.fullScreenButton.hasClass(options.fullScreenButtonStyles.pressed));
        };

        var fullScreenTests = [{
            desc: "Fullscreen button should be present in the browsers which support fullscreen mode",
            async: true,
            testFn: function () {
                jqUnit.expect(2);

                var testPlayer = fluid.testUtils.initVideoPlayer("#videoPlayer", {
                    listeners: {
                        onReady: {
                            listener: function (controllers) {
                                jqUnit.assertNotEquals("Full screen button component is not an empty one", controllers.options.components.fullScreenButton.type, "fluid.emptySubcomponent");
                                jqUnit.assertNotEquals("Full screen button should be present", controllers.locate("fullscreen").css("display"), "none");
                                jqUnit.start();
                            },
                            args: ["{controllers}"]
                        }
                    }
                });
            }
        }, {
            desc: "Fullscreen button",
            async: true,
            testFn: function () {
                jqUnit.expect(9);
                var testPlayer = fluid.testUtils.initVideoPlayer("#videoPlayer", {
                    listeners: {
                        onReady: {
                            listener: function (controllers) {
                                controllers.applier.modelChanged.removeListener("fullscreen", controllers.full);

                                var fullScreenButton = controllers.locate("fullscreen"),
                                    fullScreenButtonStyles = controllers.fullScreenButton.options.styles;

                                fluid.testUtils.verifyBasicButtonFunctions(fullScreenButton, "Fullscreen", "Full screen", "Exit full screen mode", "fl-videoPlayer-fullscreen-on");

                                fluid.tests.checkFullScreenButtonStyle({
                                    message: "Initally, video should not be in full screen mode",
                                    expectedFullScreen: false,
                                    modelFullScreen: controllers.model.fullscreen,
                                    fullScreenButtonStyles: fullScreenButtonStyles,
                                    fullScreenButton: fullScreenButton
                                });

                                fullScreenButton.click();
                                fluid.tests.checkFullScreenButtonStyle({
                                    message: "After click, video should be in full screen mode",
                                    expectedFullScreen: true,
                                    modelFullScreen: controllers.model.fullscreen,
                                    fullScreenButtonStyles: fullScreenButtonStyles,
                                    fullScreenButton: fullScreenButton
                                });

                                fullScreenButton.click();
                                fluid.tests.checkFullScreenButtonStyle({
                                    message: "After clicking again, video should not be in full screen mode",
                                    expectedFullScreen: false,
                                    modelFullScreen: controllers.model.fullscreen,
                                    fullScreenButtonStyles: fullScreenButtonStyles,
                                    fullScreenButton: fullScreenButton
                                });
                                jqUnit.start();
                            },
                            args: ["{controllers}"]
                        }
                    }
                });
            }
        }];
        if (fluid.videoPlayer.controllers.supportFullscreen()) {
            // No longer need the environment but didn't convert back yet, as we will modify this when we upgrade to the new jqUnit from Infusion
            fluid.testUtils.testCaseWithEnv("Video Player Controls Integration Tests: Full-screen", fullScreenTests, ["fluid.browser.supportsFullScreen", "fluid.browser.nativeVideoSupport"]);
        }

        var envFeatures = {"supportsFullScreen": false};

        var nonFullScreenTests = [{
            desc: "Fullscreen button should NOT be present",
            async: true,
            testFn: function () {
                jqUnit.expect(1);

                var testPlayer = fluid.testUtils.initVideoPlayer("#videoPlayer", {
                    listeners: {
                        onReady: {
                            listener: function (controllers) {
                                jqUnit.assertEquals("Full screen button should NOT be present", "fluid.emptyEventedSubcomponent", controllers.options.components.fullScreenButton.type);
                                jqUnit.start();
                            },
                            args: ["{controllers}"]
                        }
                    }
                });
            }
        }];
        fluid.testUtils.testCaseWithEnv("Video Player Controls Integration Tests: Non-Full-screen", nonFullScreenTests, envFeatures);

    });

})(jQuery);
