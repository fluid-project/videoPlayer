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

fluid.registerNamespace("fluid.tests");

(function ($) {
    $(document).ready(function () {

        // TODO: The various "fluid.tests.initXXX" functions could probably be refactored to reduce duplication

        var videoPlayerControlsTests = new jqUnit.TestCase("Video Player Controls Tests");

        fluid.tests.toggleButtonDefaults = fluid.defaults("fluid.toggleButton");

        fluid.tests.onPressEventHandler = function () {
            expect(1);
            jqUnit.assertTrue("The onPress event should fire", true);
        };

        fluid.tests.getTooltipCheckString = function (jEl, expectedText) {
            expect(1);
            jEl.mouseover();
            var tooltip = $("#" + jEl.attr("aria-describedby"));
            jqUnit.assertEquals("Tooltip should contain " + expectedText + " initially", expectedText, tooltip.text());
            return tooltip;
        };

        var baseVideoPlayerOpts = {
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
        fluid.tests.initVideoPlayer = function (testOpts) {
            var opts = fluid.copy(baseVideoPlayerOpts);
            $.extend(true, opts, testOpts);
            return fluid.videoPlayer("#videoPlayer", opts);
        };

        var baseToggleButtonOpts = {
            selectors: {
                button: ".test-toggle-button"
            }
        };
        fluid.tests.initToggleButton = function (testOpts) {
            var opts = fluid.copy(baseToggleButtonOpts);
            $.extend(true, opts, testOpts);
            return fluid.toggleButton("#basic-toggle-button-test", opts);
        };

        function verifyBasicButtonFunctions(buttonEl, name, tooltipReleased, tooltipPressed, stylePressed) {
            expect(12);
            jqUnit.assertEquals("There should be exactly one " + name + " button", 1, buttonEl.length);
            jqUnit.assertEquals(name + " button should have role of 'button'", "button", buttonEl.attr("role"));
            jqUnit.assertEquals(name + " button should have aria-pressed of 'false' initially", false, buttonEl.prop("aria-pressed"));
            jqUnit.assertFalse(name + " button should not have the 'pressed' style", buttonEl.hasClass(stylePressed));

            var tooltip = fluid.tests.getTooltipCheckString(buttonEl, tooltipReleased);
            var tooltipID = buttonEl.attr("aria-describedby");
            jqUnit.assertNotEquals(name + " button should have aria-describedby referencing the 'tooltip'", -1, tooltipID.indexOf("tooltip"));
            jqUnit.assertFalse("After mouseover, " + name + " button should still not have the 'pressed' style", buttonEl.hasClass(stylePressed));

            buttonEl.click();
            jqUnit.assertEquals("After click, " + name + " button should have aria-pressed of 'true'", true, buttonEl.prop("aria-pressed"));
            jqUnit.assertTrue("While pressed, " + name + " button should have the 'pressed' style", buttonEl.hasClass(stylePressed));
            buttonEl.blur().focus(); // tooltip not updated until 'requested' again
            jqUnit.assertEquals("Tooltip should contain " + tooltipPressed, tooltipPressed, tooltip.text());

            buttonEl.click();
            jqUnit.assertEquals("After another click, " + name + " button should have aria-pressed of 'false' again", false, buttonEl.prop("aria-pressed"));
            jqUnit.assertFalse(name + " button should not have the 'pressed' style", buttonEl.hasClass(stylePressed));
            buttonEl.blur().focus();
            jqUnit.assertEquals("Tooltip should contain " + tooltipReleased + " again", tooltipReleased, tooltip.text());
        }

        videoPlayerControlsTests.asyncTest("Toggle button, default functionality", function () {
            expect(3);
            var testComponent = fluid.tests.initToggleButton({
                listeners: {
                    onPress: fluid.tests.onPressEventHandler,
                    onReady: function (that) {
                        var toggleButton = that.locate("button");

                        verifyBasicButtonFunctions(toggleButton, "toggle",
                            fluid.tests.toggleButtonDefaults.strings.press,
                            fluid.tests.toggleButtonDefaults.strings.release,
                            fluid.tests.toggleButtonDefaults.styles.pressed);

                        jqUnit.assertFalse("By default, button should be enabled", toggleButton.prop("disabled"));
                        that.enabled(false);
                        jqUnit.assertTrue("enabled(false) should disable the button", toggleButton.prop("disabled"));
                        that.enabled(true);
                        jqUnit.assertFalse("enabled(true) should re-enable the button", toggleButton.prop("disabled"));

                        start();
                    }
                }
            });
        });


        videoPlayerControlsTests.asyncTest("Toggle button, overriding strings", function () {
            expect(1);
            var testStrings = {
                press: "press me",
                release: "release me"
            };
            var testComponent = fluid.tests.initToggleButton({
                strings: testStrings,
                listeners: {
                    onReady: function (that) {
                        var toggleButton = that.locate("button");
                        var tooltip = fluid.tests.getTooltipCheckString(toggleButton, testStrings.press);

                        toggleButton.click();
                        toggleButton.blur().focus(); // tooltip not updated until 'requested' again
                        jqUnit.assertEquals("After click, Tooltip should contain '" + testStrings.release + "'", testStrings.release, tooltip.text());

                        start();
                    }
                }
            });
        });

        videoPlayerControlsTests.asyncTest("Play button", function () {
            var testPlayer = fluid.tests.initVideoPlayer({
                listeners: {
                    onControllersReady: function (that) {
                        var playButton = that.locate("play");
                        verifyBasicButtonFunctions(playButton, "Play", "Play", "Pause", "fl-videoPlayer-playing");

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
            expect(4);
            var testVolumeControls = fluid.tests.initVolumeControls({
                listeners: {
                    onReady: function (that) {
                        var muteButton = that.locate("mute");
                        var volumeSlider = that.locate("volumeControl");

                        verifyBasicButtonFunctions(muteButton, "Mute", "Mute", "Un-mute", "fl-videoPlayer-muted");

                        jqUnit.assertEquals("There should be exactly one volume slider", 1, volumeSlider.length);
                        var sliderHandle = that.locate("handle");
                        jqUnit.assertEquals("The slider button should have role of 'slider'", "slider", sliderHandle.attr("role"));
                        jqUnit.assertEquals("The slider button should have valuenow of '50'", "50", sliderHandle.attr("aria-valuenow"));
                        jqUnit.notVisible("The slider should not be visible initially", volumeSlider);

                        start();
                    }
                }
            });
        });

        videoPlayerControlsTests.asyncTest("Volume controls integration", function () {
            expect(4);
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

        videoPlayerControlsTests.asyncTest("Fullscreen button (Some tests fail in Chrome that will be dealt with in FLUID-4673)", function () {
            expect(3);
            var testPlayer = fluid.tests.initVideoPlayer({
                listeners: {
                    onControllersReady: function (that) {
                        that.applier.modelChanged.removeListener("fullscreen", that.full);
                        
                        var fullScreenButton = that.locate("fullscreen");

                        verifyBasicButtonFunctions(fullScreenButton, "Fullscreen", "Full screen", "Exit full screen mode", "fl-videoPlayer-fullscreen-on");

                        jqUnit.assertFalse("Initally, video should not be in full screen mode", that.model.fullscreen);
                        fullScreenButton.click();
                        jqUnit.assertTrue("After click, video should be in full screen mode", that.model.fullscreen);
                        fullScreenButton.click();
                        jqUnit.assertFalse("After clicking again, video should not be in full screen mode", that.model.fullscreen);

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
            expect(3);
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

    });
})(jQuery);
