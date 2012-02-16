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

        fluid.tests.toggleButtonDefaults = fluid.defaults("fluid.videoPlayer.controllers.toggleButton");

        fluid.tests.onPressEventHandler = function () {
            expect(1);
            jqUnit.assertTrue("The onPress event should fire", true);
        };
        fluid.tests.afterPressedEventHandler = function () {
            expect(1);
            jqUnit.assertTrue("The afterPressed event should fire", true);
        };
        fluid.tests.afterReleasedEventHandler = function () {
            expect(1);
            jqUnit.assertTrue("The afterReleased event should fire", true);
        };

        fluid.tests.getTooltipCheckString = function (jEl, expectedText) {
            expect(1);
            jEl.mouseover();
            var tooltip = $("#" + jEl.attr("aria-describedby"));
            jqUnit.assertEquals("Tooltip should contain " + expectedText + " initially", expectedText, tooltip.text());
            return tooltip;
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

        function verifyBasicButtonFunctions(buttonEl, name, clickToggles, tooltipReleased, tooltipPressed, stylePressed) {
            expect(6);
            jqUnit.assertEquals("There should be exactly one " + name + " button", 1, buttonEl.length);
            jqUnit.assertEquals(name + " button should have role of 'button'", "button", buttonEl.attr("role"));
            jqUnit.assertEquals(name + " button should have aria-pressed of 'false' initially", "false", buttonEl.attr("aria-pressed"));
            jqUnit.assertFalse(name + " button should not have the 'pressed' style", buttonEl.hasClass(stylePressed));

            var tooltip = fluid.tests.getTooltipCheckString(buttonEl, tooltipReleased);
            var tooltipID = buttonEl.attr("aria-describedby");
            jqUnit.assertNotEquals(name + " button should have aria-describedby referencing the 'tooltip'", -1, tooltipID.indexOf("tooltip"));
            jqUnit.assertFalse("After mouseover, " + name + " button should still not have the 'pressed' style", buttonEl.hasClass(stylePressed));

            // TODO: When captions controls are refactored (FLUID-4589), this 'if' might go away
            //       (since toggle button might always toggle)
            if (clickToggles) {
                expect(6);
                buttonEl.click();
                jqUnit.assertEquals("After click, " + name + " button should have aria-pressed of 'true'", "true", buttonEl.attr("aria-pressed"));
                jqUnit.assertTrue("While pressed, " + name + " button should have the 'pressed' style", buttonEl.hasClass(stylePressed));
                buttonEl.blur().focus(); // tooltip not updated until 'requested' again
                jqUnit.assertEquals("Tooltip should contain " + tooltipPressed, tooltipPressed, tooltip.text());
    
                buttonEl.click();
                jqUnit.assertEquals("After another click, " + name + " button should have aria-pressed of 'false' again", "false", buttonEl.attr("aria-pressed"));
                jqUnit.assertFalse(name + " button should not have the 'pressed' style", buttonEl.hasClass(stylePressed));
                buttonEl.blur().focus();
                jqUnit.assertEquals("Tooltip should contain " + tooltipReleased + " again", tooltipReleased, tooltip.text());
            }
        }

        videoPlayerControlsTests.asyncTest("Toggle button, default functionality", function () {
            expect(3);
            var testComponent = fluid.tests.initToggleButton({
                listeners: {
                    onPress: fluid.tests.onPressEventHandler,
                    afterPressed: fluid.tests.afterPressedEventHandler,
                    afterReleased: fluid.tests.afterReleasedEventHandler,
                    onReady: function (that) {
                        var toggleButton = that.locate("button");

                        verifyBasicButtonFunctions(toggleButton, "toggle", true,
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

        videoPlayerControlsTests.asyncTest("Toggle button, press and release functions", function () {
            expect(8);

            var testComponent = fluid.tests.initToggleButton({
                listeners: {
                    onReady: function (that) {
                        var toggleButton = that.locate("button");
                        that.requestRelease();
                        jqUnit.assertEquals("Releasing when already released, button should still have aria-pressed of 'false'", "false", toggleButton.attr("aria-pressed"));
                        jqUnit.assertFalse("Toggle button should not get the 'pressed' style", toggleButton.hasClass(fluid.tests.toggleButtonDefaults.styles.pressed));
                        that.requestPress();
                        jqUnit.assertEquals("After press(), button should have aria-pressed of 'true'", "true", toggleButton.attr("aria-pressed"));
                        jqUnit.assertTrue("Button should have the 'pressed' style", toggleButton.hasClass(fluid.tests.toggleButtonDefaults.styles.pressed));
                        that.requestPress();
                        jqUnit.assertEquals("Pressing when already pressed, button should still have aria-pressed of 'true'", "true", toggleButton.attr("aria-pressed"));
                        jqUnit.assertTrue("AButton should still have the 'pressed' style", toggleButton.hasClass(fluid.tests.toggleButtonDefaults.styles.pressed));
                        that.requestRelease();
                        jqUnit.assertEquals("After release, button should have aria-pressed of 'false'", "false", toggleButton.attr("aria-pressed"));
                        jqUnit.assertFalse("Button should not have the 'pressed' style", toggleButton.hasClass(fluid.tests.toggleButtonDefaults.styles.pressed));

                        start();
                    }
                }
            });
        });

        videoPlayerControlsTests.asyncTest("Toggle button, prevent the toggle", function () {
            expect(3);
            var testComponent = fluid.tests.initToggleButton({
                listeners: {
                    onPress: function () {
                        // prevent the toggle from happening
                        return false;
                    },
                    onReady: function (that) {
                        var toggleButton = that.locate("button");
                        jqUnit.assertEquals("Toggle button should have aria-pressed of 'false' initially", "false", toggleButton.attr("aria-pressed"));
                        var tooltip = fluid.tests.getTooltipCheckString(toggleButton, fluid.tests.toggleButtonDefaults.strings.press);

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

        videoPlayerControlsTests.asyncTest("Language Menu: Default configuration", function () {
            var numLangs = baseMenuOpts.model.captions.list.length;
            expect(32);
            var testMenu = fluid.tests.initMenu({
                listeners: {
                    onReady: function (that) {
                        var langList = that.locate("language");
                        jqUnit.assertEquals("Menu should have correct number of languages listed", numLangs, langList.length);
                        jqUnit.exists("Menu should have also have the 'none option'", that.locate("none"));
                        jqUnit.assertFalse("Initially, nothing should have 'selected' style", langList.hasClass(that.options.styles.selected));
                        jqUnit.assertEquals("Initially, nothing should be the 'currentTrack'", -1, that.model.captions.currentTrack);
                        jqUnit.assertTrue("Initially, 'none' option should have the 'active' style", that.locate("none").hasClass(that.options.styles.active));
                        jqUnit.assertEquals("Initially, 'none' option should have the correct text", that.options.strings.languageIsOff, that.locate("none").text());

                        jqUnit.notVisible("The menu should be hidden initially", that.container);
                        that.show();
                        jqUnit.isVisible("show() shows the menu", that.container);
                        that.hide();
                        jqUnit.notVisible("hide() hides the menu", that.container);

                        that.container.fluid("selectable.select", that.locate("none"));
                        verifySelection("Selecting the 'none' options", that, numLangs, -1);

                        that.container.fluid("selectable.select", langList[numLangs - 1]);
                        verifySelection("Selecting a language", that, numLangs - 1, -1);

                        that.activate(0);
                        verifyActivation("Activating a language", that, 0);
                        jqUnit.assertEquals("Activating a language changes the 'none' option text", that.options.strings.turnLanguageOff, that.locate("none").text());

                        that.activate(-1);
                        verifyActivation("Activating the 'none' option", that, -1);
                        jqUnit.assertEquals("Activating the 'none' option updates its text", that.options.strings.languageIsOff, that.locate("none").text());

                        that.show();
                        $(that.locate("language")[1]).click();
                        verifyActivation("Clicking a language", that, 1);

                        // double-check notes on interaction between keyboard selection and hover, and add tests
                        start();
                    }
                }
            });
        });

        videoPlayerControlsTests.asyncTest("Language Menu: Custom 'none' option strings", function () {
            var numLangs = baseMenuOpts.model.captions.list.length;
            expect(2);
            var testStrings = {
                languageIsOff: "No one is talking",
                turnLanguageOff: "Please stop all the talking!"
            };
            var testMenu = fluid.tests.initMenu({
                strings: testStrings,
                listeners: {
                    onReady: function (that) {
                        var langList = that.locate("language");
                        jqUnit.assertEquals("Initially, 'none' option should have the correct custom text", testStrings.languageIsOff, that.locate("none").text());
                        that.activate(0);
                        jqUnit.assertEquals("Activating an item changes the 'none' option text to the custom text", testStrings.turnLanguageOff, that.locate("none").text());

                        start();
                    }
                }
            });
        });

        videoPlayerControlsTests.asyncTest("Language Menu: Active language on init", function () {
            var numLangs = baseMenuOpts.model.captions.list.length;
            expect(2);
            var testMenu = fluid.tests.initMenu({
                model: {
                    captions: {
                        currentTrack: 2
                    }
                },
                listeners: {
                    onReady: function (that) {
                        var langList = that.locate("language");
                        jqUnit.assertEquals("When initialized with a choice, that choice should be the active value", 2, that.model.captions.currentTrack);
                        jqUnit.assertTrue("The active item should have the 'active' style", $(langList[2]).hasClass(that.options.styles.active));

                        start();
                    }
                }
            });
        });

        fluid.tests.initLanguageControls = function (testOpts) {
            var opts = fluid.copy(baseMenuOpts);  // does this need its own options?
            $.extend(true, opts, testOpts);
            return fluid.videoPlayer.controllers.languageControls("#basic-languageControls-test", opts);
        };

        videoPlayerControlsTests.asyncTest("Language Controls: Default functionality", function () {
            expect(6);
            var testMenu = fluid.tests.initLanguageControls({
                listeners: {
                    onReady: function (that) {
                        jqUnit.assertEquals("There should be one button", 1, that.locate("button").length);
                        jqUnit.assertEquals("There should be one menu", 1, that.locate("menu").length);

                        jqUnit.notVisible("Initially, the menu should not be visible", that.locate("menu"));
                        that.locate("button").click();
                        // TODO: This test fails - not sure how to set it up to deal with events
                        jqUnit.isVisible("After clicking the button, the menu should be visible", that.locate("menu"));
                        that.locate("button").click();
                        jqUnit.notVisible("After clicking the button again, the menu should be hidden again", that.locate("menu"));
                        
                        that.locate("button").click();
                        that.menu.activate(0);
                        jqUnit.notVisible("After activating a menu item, the menu should be hidden again", that.locate("menu"));

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
                        verifyBasicButtonFunctions(playButton, "Play", true, "Play", "Pause", "fl-videoPlayer-playing");

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

                        verifyBasicButtonFunctions(muteButton, "Mute", true, "Mute", "Un-mute", "fl-videoPlayer-muted");

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

        videoPlayerControlsTests.asyncTest("Fullscreen button", function () {
            expect(3);
            var testPlayer = fluid.tests.initVideoPlayer({
                listeners: {
                    onControllersReady: function (that) {
                        var fullScreenButton = that.locate("fullscreen");

                        verifyBasicButtonFunctions(fullScreenButton, "Fullscreen", true, "Full screen", "Exit full screen mode", "fl-videoPlayer-fullscreen-on");

                        jqUnit.assertFalse("Initally, video should not be in full screen mode", that.model.fullscreen);
                        fullScreenButton.click();
                        jqUnit.assertTrue("After click, video should be in full screen mode", that.model.states.fullscreen);
                        fullScreenButton.click();
                        jqUnit.assertFalse("After clicking again, video should not be in full screen mode", that.model.fullscreen);

                        start();
                    }
                }
            });
        });

        var baseMenuOpts = {
            model: {
                captions: {
                    list: [{
                        language: "klingon",
                        label: "Klingoñ",
                        type: "JSONcc",
                        src: "klingon.json"
                    }, {
                        language: "esperanto",
                        label: "Espéranto",
                        type: "JSONcc",
                        src: "esperanto.json"
                    }, {
                        language: "lolspeak",
                        label: "LOLspeak",
                        type: "JSONcc",
                        src: "lolspeak.json"
                    }, {
                        language: "elvish",
                        label: "Elvîsh",
                        type: "JSONcc",
                        src: "elvish.json"
                    }]
                }
            },
            modelPath: "captions"
        };

        fluid.tests.initMenu = function (testOpts) {
            var opts = fluid.copy(baseMenuOpts);
            $.extend(true, opts, testOpts);
            return fluid.videoPlayer.controllers.languageMenu("#basic-menu-test", opts);
        };

        var verifyActivation = function (actionString, that, activatedIndex) {
            // expect(5)
            var menuItems = that.locate("menuItem");
            jqUnit.assertEquals(actionString + " updates the active value", activatedIndex, that.model.captions.currentTrack);
            if (activatedIndex == -1) {
                jqUnit.assertTrue(actionString + " adds the 'active' style to the item", that.locate("none").hasClass(that.options.styles.active));
            } else {
                jqUnit.assertTrue(actionString + " adds the 'active' style to the item", $(menuItems[activatedIndex]).hasClass(that.options.styles.active));
            }
            jqUnit.assertEquals("Only one item is active at a time", 1, $(that.options.selectors.menuItem + "." + that.options.styles.active).length);
            jqUnit.assertFalse(actionString + " removes 'selected' style from all items", menuItems.hasClass(that.options.styles.selected));
            jqUnit.notVisible(actionString + " hides the menu", that.container);
        };

        var verifySelection = function (actionString, that, selectedIndex, activeIndex) {
            // expect(3)
            var langList = that.locate("menuItem");
            jqUnit.isVisible(actionString + " shows menu", that.container);
            jqUnit.assertTrue(actionString + " adds 'selected' style to the language", $(langList[selectedIndex]).hasClass(that.options.styles.selected));
            jqUnit.assertEquals(actionString + " does not update active value", activeIndex, that.model.captions.currentTrack);
        };


    });
})(jQuery);
