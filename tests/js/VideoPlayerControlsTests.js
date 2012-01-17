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
fluid.staticEnvironment.vidPlayerTests = fluid.typeTag("fluid.videoPlayerTests");
fluid.staticEnvironment.vidPlayerTests2 = fluid.typeTag("fluid.videoPlayerTests2");

(function ($) {
    $(document).ready(function () {

        fluid.setLogging(false);

        fluid.tests.toggleButtonDefaults = fluid.defaults("fluid.videoPlayer.controllers.toggleButton");

        fluid.tests.pressEventHandler = function (state) {
            jqUnit.assertTrue("The onPress event should fire", true);
        };

        var baseVideoPlayerOpts = {
            model: {
                video: {
                    sources: [
                        {
                            src: "http://royalgiz.fr/videoplayer/video/Richard.Stallman.mp4",
                            type: "video/mp4"
                        }
                    ]
                }
            },
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

        var videoPlayerControlsTests = new jqUnit.TestCase("Video Player Controls Tests");

        var baseToggleButtonOpts = {
            selectors: {
                button: ".test-toggle-button"
            }
        };
        fluid.tests.initToggleButton = function (testOpts) {
            var opts = fluid.copy(baseToggleButtonOpts);
            $.extend(true, opts, testOpts);
            return fluid.videoPlayer.controllers.toggleButton("#basic-toggle-button-test", opts);
        };

        videoPlayerControlsTests.asyncTest("Toggle button, default functionality", function () {
            expect(24);

            var testComponent = fluid.tests.initToggleButton({
                listeners: {
                    onPress: fluid.tests.pressEventHandler,
                    onReady: function (that) {
                        var toggleButton = $(baseToggleButtonOpts.selectors.button);
                        jqUnit.assertEquals("There should be exactly one toggle button", 1, toggleButton.length);
                        jqUnit.assertEquals("Toggle button should have role of 'button'", "button", toggleButton.attr("role"));
                        jqUnit.assertEquals("Toggle button should have aria-pressed of 'false' initially", "false", toggleButton.attr("aria-pressed"));
                        jqUnit.assertFalse("Toggle button should not have the 'focused' style", toggleButton.hasClass(fluid.tests.toggleButtonDefaults.styles.focused));
                        jqUnit.assertTrue("Toggle button should have the 'not focused' style", toggleButton.hasClass(fluid.tests.toggleButtonDefaults.styles.notFocused));
                        jqUnit.assertFalse("Toggle button should not have the 'pressed' style", toggleButton.hasClass(fluid.tests.toggleButtonDefaults.styles.pressed));
                        jqUnit.assertTrue("Toggle button should have the 'not released' style", toggleButton.hasClass(fluid.tests.toggleButtonDefaults.styles.released));

                        toggleButton.mouseover();
                        var tooltipID = toggleButton.attr("aria-describedby");
                        jqUnit.assertNotEquals("Toggle button should have aria-describedby referencing the 'tooltip'", -1, tooltipID.indexOf("tooltip"));
                        var tooltip = $("#" + tooltipID);
                        jqUnit.assertEquals("Tooltip should contain '" + fluid.tests.toggleButtonDefaults.strings.press + "' initially", fluid.tests.toggleButtonDefaults.strings.press, tooltip.text());
                        jqUnit.assertTrue("After mouseover, button should have the 'focused' style", toggleButton.hasClass(fluid.tests.toggleButtonDefaults.styles.focused));
                        jqUnit.assertFalse("After mouseover, button should not have the 'not focused' style", toggleButton.hasClass(fluid.tests.toggleButtonDefaults.styles.notFocused));
                        jqUnit.assertFalse("After mouseover, button should still not have the 'pressed' style", toggleButton.hasClass(fluid.tests.toggleButtonDefaults.styles.pressed));

                        toggleButton.mouseout();
                        jqUnit.assertFalse("After mouseout, button should not have the 'focused' style", toggleButton.hasClass(fluid.tests.toggleButtonDefaults.styles.focused));
                        jqUnit.assertTrue("After mouseout,Toggle button should have the 'not focused' style", toggleButton.hasClass(fluid.tests.toggleButtonDefaults.styles.notFocused));

                        toggleButton.click();
                        jqUnit.assertEquals("After click, toggle button should have aria-pressed of 'true'", "true", toggleButton.attr("aria-pressed"));
                        toggleButton.blur().focus(); // tooltip not updated until 'requested' again
                        jqUnit.assertEquals("After click, Tooltip should contain '" + fluid.tests.toggleButtonDefaults.strings.release + "'", fluid.tests.toggleButtonDefaults.strings.release, tooltip.text());
                        jqUnit.assertTrue("After click, button should have the 'pressed' style", toggleButton.hasClass(fluid.tests.toggleButtonDefaults.styles.pressed));
                        jqUnit.assertFalse("After click, button should not have the 'not released' style", toggleButton.hasClass(fluid.tests.toggleButtonDefaults.styles.released));

                        toggleButton.click();
                        jqUnit.assertEquals("After another click, toggle button should have aria-pressed of 'false' again", "false", toggleButton.attr("aria-pressed"));
                        toggleButton.blur().focus();
                        jqUnit.assertEquals("Tooltip should contain '" + fluid.tests.toggleButtonDefaults.strings.press + "' again", fluid.tests.toggleButtonDefaults.strings.press, tooltip.text());
                        jqUnit.assertFalse("Button should again not have the 'pressed' style", toggleButton.hasClass(fluid.tests.toggleButtonDefaults.styles.pressed));
                        jqUnit.assertTrue("Button should again have the 'not released' style", toggleButton.hasClass(fluid.tests.toggleButtonDefaults.styles.released));

                        start();
                    }
                }
            });
        });

        videoPlayerControlsTests.asyncTest("Toggle button, prevent the toggle", function () {
            expect(4);
            var testComponent = fluid.tests.initToggleButton({
                listeners: {
                    onPress: function () {
                        // prevent the toggle from happening
                        return false;
                    },
                    onReady: function (that) {
                        var toggleButton = $(baseToggleButtonOpts.selectors.button);
                        jqUnit.assertEquals("Toggle button should have aria-pressed of 'false' initially", "false", toggleButton.attr("aria-pressed"));
                        toggleButton.mouseover();
                        var tooltip = $("#" + toggleButton.attr("aria-describedby"));
                        jqUnit.assertEquals("Tooltip should contain '" + fluid.tests.toggleButtonDefaults.strings.press + "' initially", fluid.tests.toggleButtonDefaults.strings.press, tooltip.text());

                        toggleButton.click();
                        jqUnit.assertEquals("After click, toggle button should still have aria-pressed of 'false'", "false", toggleButton.attr("aria-pressed"));
                        toggleButton.blur().focus(); // tooltip not updated until 'requested' again
                        jqUnit.assertEquals("After click, Tooltip should still contain '" + fluid.tests.toggleButtonDefaults.strings.press + "'", fluid.tests.toggleButtonDefaults.strings.press, tooltip.text());

                        start();
                    }
                }
            });
        });

        videoPlayerControlsTests.asyncTest("Toggle button, overriding strings", function () {
            expect(2);
            var testStrings = {
                press: "press me",
                release: "release me"
            };
            var testComponent = fluid.tests.initToggleButton({
                strings: testStrings,
                listeners: {
                    onReady: function (that) {
                        var toggleButton = $(baseToggleButtonOpts.selectors.button);
                        toggleButton.mouseover();
                        var tooltip = $("#" + toggleButton.attr("aria-describedby"));
                        jqUnit.assertEquals("Tooltip should contain '" + testStrings.press + "' initially", testStrings.press, tooltip.text());

                        toggleButton.click();
                        toggleButton.blur().focus(); // tooltip not updated until 'requested' again
                        jqUnit.assertEquals("After click, Tooltip should contain '" + testStrings.release + "'", testStrings.release, tooltip.text());

                        start();
                    }
                }
            });
        });

        videoPlayerControlsTests.asyncTest("Play button", function () {
            expect(9);
            var testPlayer = fluid.tests.initVideoPlayer({
                listeners: {
                    onControllersReady: function (that) {
                        var playButton = $(".flc-videoPlayer-play");
                        jqUnit.assertEquals("There should be exactly one Play button", 1, playButton.length);
                        jqUnit.assertEquals("Play button should have role of 'button'", "button", playButton.attr("role"));
                        jqUnit.assertEquals("Play button should have aria-pressed of 'false' initially", "false", playButton.attr("aria-pressed"));
                        jqUnit.assertTrue("Play button should have the paused style initially", playButton.hasClass("fl-videoPlayer-paused"));

                        playButton.mouseover();
                        var tooltip = $("#" + playButton.attr("aria-describedby"));
                        jqUnit.assertEquals("Tooltip should contain 'Play' initially", "Play", tooltip.text());

                        playButton.click();
                        jqUnit.assertTrue("After clicking, play button should have the playing style", playButton.hasClass("fl-videoPlayer-playing"));
                        playButton.blur().focus(); // tooltip not updated until 'requested' again
                        jqUnit.assertEquals("After click, Tooltip should contain 'Pause'", "Pause", tooltip.text());

                        playButton.click();
                        jqUnit.assertTrue("After clickign again, play button should have the paused style again", playButton.hasClass("fl-videoPlayer-paused"));
                        playButton.blur().focus();
                        jqUnit.assertEquals("Tooltip should contain 'Play' again", "Play", tooltip.text());

                        start();
                    }
                }
            });
        });

        var baseVolumeOpts = {};

        fluid.tests.initVolumeControls = function (testOpts) {
            var opts = fluid.copy(baseVolumeOpts);
            $.extend(true, opts, testOpts);
            return fluid.videoPlayer.controllers.volumeControls("#basic-volume-controls-test", opts);
        };

        videoPlayerControlsTests.asyncTest("Volume controls", function () {
            expect(19);
            var testVolumeControls = fluid.tests.initVolumeControls({
                listeners: {
                    onReady: function (that) {
                        var container = $("#basic-volume-controls-test");
                        var muteButton = $(".flc-videoPlayer-mute");
                        var volumeSlider = $(".flc-videoPlayer-volumeControl");

                        jqUnit.assertEquals("There should be exactly one Mute button", 1, muteButton.length);
                        jqUnit.assertEquals("Mute button should have role of 'button'", "button", muteButton.attr("role"));
                        jqUnit.assertEquals("Mute button should have aria-pressed of 'false' initially", "false", muteButton.attr("aria-pressed"));
                        jqUnit.assertFalse("Mute button should not have the muted style initially", muteButton.hasClass("fl-videoPlayer-volume-muted"));
                        jqUnit.assertFalse("Mute button should not have the active style initially", muteButton.hasClass("fl-videoPlayer-volume-active"));

                        jqUnit.assertEquals("There should be exactly one volume slider", 1, volumeSlider.length);
                        var sliderHandle = $(".ui-slider-handle", volumeSlider);
                        jqUnit.assertEquals("The slider button should have role of 'slider'", "slider", sliderHandle.attr("role"));
                        jqUnit.assertEquals("The slider button should have valuenow of '50'", "50", sliderHandle.attr("aria-valuenow"));
                        jqUnit.notVisible("The slider should not be visible initially", volumeSlider);

                        container.mouseover();
                        jqUnit.assertTrue("On container mouseover, the Mute button should have the active style", muteButton.hasClass("fl-videoPlayer-volume-active"));
                        jqUnit.isVisible("On container mouseover, the slider should become visible", volumeSlider);

                        container.mouseout();
                        jqUnit.assertFalse("On container mouseout, the Mute button should lose the active style", muteButton.hasClass("fl-videoPlayer-volume-active"));
                        jqUnit.notVisible("On container mouseout, the slider should hide again", volumeSlider);

                        container.focus();
                        jqUnit.assertTrue("On container focus, the Mute button should have the active style", muteButton.hasClass("fl-videoPlayer-volume-active"));
                        jqUnit.isVisible("On container focus, the slider should become visible", volumeSlider);

                        container.blur();
                        jqUnit.assertFalse("On container blur, the Mute button should lose the active style", muteButton.hasClass("fl-videoPlayer-volume-active"));
                        jqUnit.notVisible("On container blur, the slider should hide again", volumeSlider);

                        muteButton.click();
                        jqUnit.assertTrue("On click, the mute button should have the muted stye", muteButton.hasClass("fl-videoPlayer-volume-muted"));
                        muteButton.click();
                        jqUnit.assertFalse("On click again, the mute button should lose the muted stye", muteButton.hasClass("fl-videoPlayer-volume-muted"));

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
                        var muteButton = $(".flc-videoPlayer-mute");

                        jqUnit.assertFalse("Initially, video should not be muted", video.muted);
                        muteButton.click();
                        jqUnit.assertTrue("After clicking mute button, video should be muted", video.muted);
                        muteButton.click();
                        jqUnit.assertFalse("After clicking mute button again, video should again not be muted", video.muted);

                        var volumeSlider = $(".flc-videoPlayer-volumeControl");
                        var sliderHandle = $(".ui-slider-handle", volumeSlider);
                        jqUnit.assertEquals("The slider button should have valuenow of '60'", "60", sliderHandle.attr("aria-valuenow"));

                        start();
                    }
                }
            });
        });

        var baseCaptionOpts = {
            model: {
                captions: {
                    sources: {
                        esperanto: {
                            src: "Test.esp.json",
                            type: "JSONcc"
                        }, 
                        klingon: {
                            src: "Test.kling.json",
                            type: "JSONcc"
                        },
                        lolspeak: {
                            src: "Test.lol.json",
                            type: "JSONcc"
                        }
                    }
                }
            }
        };

        fluid.tests.initCaptionControls = function (testOpts) {
            var opts = fluid.copy(baseCaptionOpts);
            $.extend(true, opts, testOpts);
            return fluid.videoPlayer.controllers.captionControls("#basic-caption-controls-test", opts);
        };

        videoPlayerControlsTests.asyncTest("Caption controls", function () {
            expect(30);
            var numLangs = Object.keys(baseCaptionOpts.model.captions.sources).length + 1;
            var testCaptionControls = fluid.tests.initCaptionControls({
                listeners: {
                    onReady: function (that) {
                        var captionsButton = $(".flc-videoPlayer-captions-button");
                        var languageRadioButtons = $(".flc-videoPlayer-captions-languageButton");
                        var languageLabels = $(".flc-videoPlayer-captions-languageLabel");
                        var languageList = $(".flc-videoPlayer-captions-languageList");

                        jqUnit.assertEquals("There should be one captions button", 1, captionsButton.length);
                        jqUnit.assertEquals("Captions button should have role of 'button'", "button", captionsButton.attr("role"));
                        jqUnit.assertEquals("Captions button should have aria-pressed of 'false' initially", "false", captionsButton.attr("aria-pressed"));
                        jqUnit.assertFalse("Captions button should not have the active style initially", captionsButton.hasClass(that.captionButton.options.styles.pressed));
                        jqUnit.assertEquals("'none' option should say '" + that.options.strings.captionsOff + "' initially", that.options.strings.captionsOff, languageLabels[numLangs-1].textContent);
                        jqUnit.assertTrue("'none' option should have the 'selected' style", $(languageLabels[numLangs-1]).hasClass(that.options.styles.selected));
                        jqUnit.assertEquals("Only one label should have selected style", 1, $("." + that.options.styles.selected).length);

                        captionsButton.mouseover();
                        var tooltip = $("#" + captionsButton.attr("aria-describedby"));
                        jqUnit.assertEquals("Tooltip should contain 'Captions'", "Captions", tooltip.text());

                        jqUnit.assertEquals("There should be " + numLangs + " languages", numLangs, languageRadioButtons.length);
                        jqUnit.notVisible("The list of languages should not be visible initially", languageList);

                        captionsButton.click();
                        jqUnit.isVisible("When caption button clicked, the list of languages should show", languageList);
                        jqUnit.assertEquals("While no caption selected, Captions button should still have aria-pressed of 'false'", "false", captionsButton.attr("aria-pressed"));
                        captionsButton.blur().focus(); // tooltip not updated until 'requested' again
                        jqUnit.assertEquals("After click, Tooltip should still contain 'Captions'", "Captions", tooltip.text());
                        captionsButton.click();
                        jqUnit.notVisible("When caption button clicked again, the list of languages should hide", languageList);
                        jqUnit.assertEquals("While no caption selected, Captions button should still have aria-pressed of 'false'", "false", captionsButton.attr("aria-pressed"));

                        captionsButton.click();
                        jqUnit.assertEquals("Initially, 'none' should be selected", "none", that.model.captions.selection);
                        languageRadioButtons[1].click();
                        jqUnit.assertEquals("After clicking a radio button, another language should be selected", "klingon", that.model.captions.selection);
                        jqUnit.assertTrue("After selecting a language, captions button should have active style", captionsButton.hasClass(that.captionButton.options.styles.pressed));
                        jqUnit.assertEquals("After selecting a language, Captions button should have aria-pressed of 'true'", "true", captionsButton.attr("aria-pressed"));
                        jqUnit.assertEquals("After selecting a language, 'none' option should say '" + that.options.strings.turnCaptionsOff + "'", that.options.strings.turnCaptionsOff, languageLabels[numLangs-1].textContent);
                        jqUnit.assertTrue("Selected option should have the 'selected' style", $(languageLabels[1]).hasClass(that.options.styles.selected));
                        jqUnit.assertEquals("Only one label should have selected style", 1, $("." + that.options.styles.selected).length);

                        languageRadioButtons[1].click();
                        jqUnit.assertTrue("Selected the same option should not change the 'selected' style", $(languageLabels[1]).hasClass(that.options.styles.selected));
                        jqUnit.assertEquals("Only one label should have selected style", 1, $("." + that.options.styles.selected).length);

                        languageRadioButtons[3].click();
                        jqUnit.assertEquals("After clicking last radio button (i.e. captions off), 'none' should be selected", "none", that.model.captions.selection);
                        jqUnit.assertFalse("After turning captions off, captions button should not have active style", captionsButton.hasClass(that.captionButton.options.styles.pressed));
                        jqUnit.assertEquals("After turning captions off, Captions button should have aria-pressed of 'false'", "false", captionsButton.attr("aria-pressed"));
                        jqUnit.assertEquals("After turning captions off, 'none' option should say '" + that.options.strings.captionsOff + "'", that.options.strings.captionsOff, languageLabels[numLangs-1].textContent);
                        jqUnit.assertTrue("After turning captions off, 'none' option should have the 'selected' style", $(languageLabels[numLangs-1]).hasClass(that.options.styles.selected));
                        jqUnit.assertEquals("Only one label should have selected style", 1, $("." + that.options.styles.selected).length);

                        start();
                    }
                }
            });
        });

        videoPlayerControlsTests.asyncTest("Caption controls integration", function () {
            expect(4);
            var captionOpts = fluid.copy(baseCaptionOpts);
            $.extend(true, captionOpts, {
                listeners: {
                    onControllersReady: function (that) {
                        var captionButton = $(".flc-videoPlayer-captions-button");
                        var languageRadioButtons = $(".flc-videoPlayer-captions-languageButton");
                        var languageLabels = $(".flc-videoPlayer-captions-languageLabel");
                        var languageList = $(".flc-videoPlayer-captions-languageList");
                        var captionArea = $(".flc-videoPlayer-captionArea");

                        jqUnit.assertEquals("Initially, captions should not be showing", "none", that.model.captions.selection);
                        jqUnit.notVisible("The list of languages should not be visible initially", languageList);
                        jqUnit.notVisible("The caption area should be hidden initially", captionArea);

                        captionButton.click();
                        jqUnit.isVisible("When caption button clicked, the list of languages should show", languageList);

                        languageRadioButtons[2].click();
                        captionArea = $(".flc-videoPlayer-caption-captionText");
                        jqUnit.assertEquals("After clicking a radio button, a caption should be selected", "klingon", that.model.captions.selection);
                        jqUnit.isVisible("The caption area should show", captionArea);

                        languageRadioButtons[4].click();
                        jqUnit.assertEquals("After clicking the 'none' radio button, no caption should be selected", "none", that.model.captions.selection);
                        jqUnit.notVisible("The caption area should hide", captionArea);

                        start();
                    }
                }
            });
            var testPlayer = fluid.tests.initVideoPlayer(captionOpts);
        });

    });
})(jQuery);
