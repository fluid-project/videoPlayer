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

        var baseMenuOpts = {
                languages: [{
                    srclang: "klingon",
                    label: "Klingo√±"
                }, {
                    srclang: "esperanto",
                    label: "Esp√©ranto"
                }, {
                    srclang: "lolspeak",
                    label: "LOLspeak"
                }, {
                    srclang: "elvish",
                    label: "Elv√Æsh"
                }],
             model: {
                activeLanguages: [0],
                showLanguage: false
            }
        };

        fluid.tests.initMenu = function (testOpts) {
            var opts = fluid.copy(baseMenuOpts);
            $.extend(true, opts, testOpts);
            return fluid.videoPlayer.controllers.languageMenu("#basic-menu-test", opts);
        };

        var verifyActivation = function (actionString, that, activatedIndex) {
            expect(5);
            var menuItems = that.locate("menuItem");
            jqUnit.assertEquals(actionString + " updates the active language", activatedIndex, that.readIndirect("currentLanguagePath")[0]);
            jqUnit.assertTrue(actionString + " adds the 'active' style to the item", $(menuItems[activatedIndex]).hasClass(that.options.styles.active));
            jqUnit.assertEquals("Only one item is active at a time", 1, $(that.options.selectors.menuItem + "." + that.options.styles.active).length);
            jqUnit.assertFalse(actionString + " removes 'selected' style from all items", menuItems.hasClass(that.options.styles.selected));
            jqUnit.notVisible(actionString + " hides the menu", that.container);
        };

        var verifySelection = function (actionString, that, selectedIndex, activeIndex) {
            expect(3);
            var langList = that.locate("menuItem");
            jqUnit.assertTrue(actionString + " adds 'selected' style to the language", $(langList[selectedIndex]).hasClass(that.options.styles.selected));
            jqUnit.assertEquals("Only one item is selected at a time", 1, $(that.options.selectors.menuItem + "." + that.options.styles.selected).length);
            jqUnit.assertTrue(actionString + " leaves 'active' style on the active language", $(langList[activeIndex]).hasClass(that.options.styles.active));
        };

        videoPlayerControlsTests.asyncTest("Language Menu: Default configuration", function () {
            var numLangs = baseMenuOpts.languages.length;
            expect(9);
            var testMenu = fluid.tests.initMenu({
                listeners: {
                    onReady: function (that) {
                        var langList = that.locate("language");
                        jqUnit.assertEquals("Menu should have correct number of languages listed", numLangs, langList.length);
                        jqUnit.exists("Menu should have also have the 'show/hide' option", that.locate("showHide"));
                        jqUnit.assertFalse("Initially, nothing should have 'selected' style", langList.hasClass(that.options.styles.selected));
                        jqUnit.assertTrue("Initially, the 'active language' have the 'active' style", $(langList[that.model.activeLanguages[0]]).hasClass(that.options.styles.active));
                        jqUnit.assertEquals("Initially, 'show/hide' option should have the correct text", that.options.strings.showLanguage, that.locate("showHide").text());

                        jqUnit.notVisible("The menu should be hidden by default", that.container);
                        that.show();
                        jqUnit.isVisible("show() shows the menu", that.container);
                        that.hide();
                        jqUnit.notVisible("hide() hides the menu", that.container);

                        that.container.fluid("selectable.select", that.locate("showHide"));
                        verifySelection("Selecting the 'show/hide' option", that, numLangs, 0);

                        that.container.fluid("selectable.select", langList[numLangs - 1]);
                        verifySelection("Selecting a language", that, numLangs - 1, 0);

                        that.applier.modelChanged.addListener("showLanguage", function () {
                            jqUnit.assertEquals("Activating a new language changes the 'show/hide' option text", that.options.strings.hideLanguage, that.locate("showHide").text());
                            that.applier.modelChanged.removeListener("showLanguageChecker");
                        }, "showLanguageChecker");
                        that.activate(1);
                        verifyActivation("Activating a new language", that, 1);

                        that.show();
                        $(that.locate("language")[2]).click();
                        verifyActivation("Clicking a language", that, 2);

                        // double-check notes on interaction between keyboard selection and hover, and add tests
                        start();
                    }
                }
            });
        });

        videoPlayerControlsTests.asyncTest("Language Menu: Custom 'show/hide' option strings", function () {
            var numLangs = baseMenuOpts.languages.length;
            expect(2);
            var testStrings = {
                showLanguage: "No one is talking",
                hideLanguage: "Please stop all the talking!"
            };
            var testMenu = fluid.tests.initMenu({
                strings: testStrings,
                listeners: {
                    onReady: function (that) {
                        var langList = that.locate("language");
                        jqUnit.assertEquals("Initially, 'show/hide' option should have the correct custom text", testStrings.showLanguage, that.locate("showHide").text());
                        that.activate(1);
                        jqUnit.assertEquals("Activating an item changes the 'show/hide' option text to the custom text", testStrings.hideLanguage, that.locate("showHide").text());

                        start();
                    }
                }
            });
        });

        var baseLanguageControlsOpts = {
            languages: [{
                srclang: "klingon",
                label: "Klingoñ"
            }, {
                srclang: "esperanto",
                label: "Espéranto"
            }, {
                srclang: "lolspeak",
                label: "LOLspeak"
            }, {
                srclang: "elvish",
                label: "Elvîsh"
            }],
            model: {
                currentTracks: {
                    captions: [0]
                },
                displayCaptions: false
            },
            currentLanguagePath: "currentTracks.captions",
            showHidePath: "displayCaptions"
        };

        fluid.tests.initLangControls = function (testOpts) {
            var opts = fluid.copy(baseLanguageControlsOpts);
            $.extend(true, opts, testOpts);
            return fluid.videoPlayer.controllers.languageControls("#basic-languageControls-test", opts);
        };

        // TODO: These tests could possibly be refactored to reduce duplication
        videoPlayerControlsTests.asyncTest("Language Controls: default functionality", function () {
            var numLangs = baseLanguageControlsOpts.languages.length;
            var testControls = fluid.tests.initLangControls({
                listeners: {
                    onReady: {
                        listener: function (that) {
                            var langList = that.menu.locate("language");
                            var showHideOption = that.menu.locate("showHide");
                            jqUnit.assertEquals("Menu should have correct number of languages listed", numLangs, langList.length);
                            jqUnit.notVisible("Menu should not be visible initially", that.menu.container);
                            jqUnit.assertFalse("'show language' model flag should be false", fluid.get(that.model, that.options.showHidePath));
                            jqUnit.assertEquals("'show language' text should be correct", that.options.strings.showLanguage, showHideOption.text());
                            jqUnit.assertFalse("Buttons state should be released", that.button.model.pressed);

                            var button = that.locate("button");
                            button[0].click();
                            jqUnit.isVisible("Clicking the button should show menu", that.menu.container);
                            jqUnit.assertTrue("Buttons state should be released", that.button.model.pressed);
                            button[0].click();
                            jqUnit.notVisible("Clicking the button again should hide menu again", that.menu.container);

                            button[0].click();
                            $(langList[1]).click();
                            jqUnit.notVisible("Show the menu, click a language, menu should hide", that.menu.container);
                            jqUnit.assertEquals("'current langauge' should be updated", 1, fluid.get(that.model, that.options.currentLanguagePath)[0]);
                            jqUnit.assertTrue("'show language' model flag should be true", fluid.get(that.model, that.options.showHidePath));
                            jqUnit.assertEquals("'show language' text should be updated", that.options.strings.hideLanguage, showHideOption.text());
                            jqUnit.assertFalse("Button state should be released", fluid.get(that.button.model, baseLanguageControlsOpts.showHidePath));

                            button[0].click();
                            $(showHideOption[0]).click();
                            jqUnit.assertFalse("Show the menu, click the show/hide option, 'show language' model flag should be false", fluid.get(that.model, that.options.showHidePath));
                            jqUnit.assertEquals("'show language' text should be updated", that.options.strings.showLanguage, showHideOption.text());
                            jqUnit.assertFalse("Button state should be released", fluid.get(that.button.model, baseLanguageControlsOpts.showHidePath));
                            jqUnit.assertEquals("'current langauge' should be not be changed", 1, fluid.get(that.model, that.options.currentLanguagePath)[0]);

                            button[0].click();
                            $(showHideOption[0]).click();
                            jqUnit.assertTrue("Click the show/hide option, 'show language' model flag should be true again", fluid.get(that.model, that.options.showHidePath));
                            jqUnit.assertEquals("'show language' text should be updated", that.options.strings.hideLanguage, showHideOption.text());
                            jqUnit.assertFalse("Button state should be released", fluid.get(that.button.model, baseLanguageControlsOpts.showHidePath));

                            start();
                        }
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
            return fluid.videoPlayer.controllers.volumeControls("#basic-volume-controls-test", opts);
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
