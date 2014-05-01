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

        /*
         * Test of controllers component as a whole, outside the context of the VideoPlayer
         */
        var baseControllerOptions = {
            model: {
                currentTracks: {
                    transcripts: [],
                    captions: []
                }
            },
            templates: {
                controllers: {
                    href: "../../html/videoPlayer_controllers_template.html"
                },
                menuButton: {
                    href: "../../html/menuButton_template.html"
                }
            }
        };

        var verifyNonOptionalControls = function () {
            jqUnit.expect(3);
            jqUnit.isVisible("Play button should be present", $(".flc-videoPlayer-play"));
            jqUnit.isVisible("Volume controls should be present", $(".flc-videoPlayer-volumeContainer"));
            jqUnit.assertTrue("Transcript controls should be present", $(".flc-videoPlayer-transcriptControls-container *").length > 0);
        };

        fluid.testUtils.initControllers = function (container, options) {
            var opts = fluid.copy(baseControllerOptions);
            $.extend(true, opts, options);
            return fluid.videoPlayer.controllers(container, opts);
        };

        var defaultTests = [{
            desc: "Default: only transcripts",
            async: true,
            testFn: function () {
                jqUnit.expect(2);

                fluid.testUtils.initControllers("#full-controllers-test", {
                    listeners: {
                        onReady: function (that) {
                            verifyNonOptionalControls();
                            jqUnit.assertEquals("Caption controls should NOT be present", 0, $(".flc-videoPlayer-captionControls-container *").length);
                            jqUnit.notVisible("Full-screen button should NOT be visible", $(".flc-videoPlayer-fullscreen"));
                            jqUnit.start();
                        }
                    }
                });
            }
        }];
        fluid.testUtils.testCaseWithEnv("Video Player Controller: ", defaultTests, []);

        var defaultPlusFullScreen = [{
           desc: "Transcripts with full-screen",
           async: true,
           testFn: function () {
               jqUnit.expect(2);

               fluid.testUtils.initControllers("#full-controllers-test", {
                   listeners: {
                       onReady: function (that) {
                           verifyNonOptionalControls();
                           jqUnit.assertEquals("Caption controls should NOT be present", 0, $(".flc-videoPlayer-captionControls-container *").length);
                           jqUnit.isVisible("Full-screen button should be visible", $(".flc-videoPlayer-fullscreen"));
                           jqUnit.start();
                       }
                   }
               });
            }
        }];
        
        fluid.testUtils.testCaseWithEnv("Video Player Controller: ", defaultPlusFullScreen, ["fluid.browser.supportsFullScreen"]);
        
        var defaultPlusCaptions = [{
           desc: "Transcripts with captions",
           async: true,
           testFn: function () {
               jqUnit.expect(2);

               fluid.testUtils.initControllers("#full-controllers-test", {
                   listeners: {
                       onReady: function (that) {
                           verifyNonOptionalControls();
                           jqUnit.assertTrue("Caption controls should be present", $(".flc-videoPlayer-captionControls-container *").length > 0);
                           jqUnit.notVisible("Full-screen button should NOT be visible", $(".flc-videoPlayer-fullscreen"));
                           jqUnit.start();
                       }
                   }
               });
            }
        }];
        fluid.testUtils.testCaseWithEnv("Video Player Controller: ", defaultPlusCaptions, ["fluid.browser.nativeVideoSupport"]);
        
        var defaultPlusFullScreenAndCaptions = [{
            desc: "Transcripts with full-screen and captions",
            async: true,
            testFn: function () {
               jqUnit.expect(2);

               fluid.testUtils.initControllers("#full-controllers-test", {
                   listeners: {
                       onReady: function (that) {
                           verifyNonOptionalControls();
                           jqUnit.assertTrue("Caption controls should be present", $(".flc-videoPlayer-captionControls-container *").length > 0);
                           jqUnit.isVisible("Full-screen button should be visible", $(".flc-videoPlayer-fullscreen"));
                           jqUnit.start();
                       }
                   }
               });
            }
            }];
        fluid.testUtils.testCaseWithEnv("Video Player Controller: ", defaultPlusFullScreenAndCaptions, ["fluid.browser.supportsFullScreen", "fluid.browser.nativeVideoSupport"]);
               
        jqUnit.module("Video Player Controller");
               
        jqUnit.asyncTest("Volume controls", function () {
            jqUnit.expect(8);
            var checkSlider = function (prefaceString, ariavaluenow, expectedValue) {
                   jqUnit.assertEquals(prefaceString + ", the slider button should have valuenow of " + expectedValue, expectedValue, ariavaluenow);
               },
               checkTooltipOnHover = function (element, expectedText) {
                   fluid.testUtils.getTooltipCheckString(element, expectedText);
                   element.mouseleave();
               },
               testVolumeControls = fluid.videoPlayer.controllers.volumeControls("#basic-volume-controls-test", {
                   listeners: {
                       onReady: function (that) {
                           var muteButton = that.locate("mute"),
                               volumeSlider = that.locate("volumeControl"),
                               sliderHandle = that.locate("handle");

                           jqUnit.notVisible("The slider should not be visible initially", volumeSlider);
                           jqUnit.assertEquals("Mute button should have title", that.options.strings.instructions, muteButton.attr("title"));
                           jqUnit.assertEquals("Volume container should have aria-label", that.options.strings.instructions, that.container.attr("aria-label"));
                           checkTooltipOnHover(volumeSlider, "Volume");
                           checkTooltipOnHover(muteButton, "Mute");
                           muteButton.click();
                           checkSlider("After clicking mute button", sliderHandle.attr("aria-valuenow"), "0");
                           checkTooltipOnHover(muteButton, "Un-mute");
                           muteButton.click();

                           jqUnit.assertEquals("There should be exactly one volume slider", 1, volumeSlider.length);
                           jqUnit.assertEquals("The slider button should have role of 'slider'", "slider", sliderHandle.attr("role"));
                           checkSlider("After clicking mute button again", sliderHandle.attr("aria-valuenow"), "50");
                           jqUnit.notVisible("The slider should not be visible", volumeSlider);

                           jqUnit.start();
                       }
                   }
               });
            });
    });
})(jQuery);
