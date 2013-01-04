/*
Copyright 2012-2013 OCAD University

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
                            start();
                        }
                    }
                });
            }
        }];
        fluid.testUtils.testCaseWithEnv("Video Player Controller: ", defaultTests, {});

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
                            start();
                        }
                    }
                });
            }
        }];
        fluid.testUtils.testCaseWithEnv("Video Player Controller: ", defaultPlusFullScreen, {
            "supportsFullScreen": "fluid.browser.supportsFullScreen"
        });

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
                            start();
                        }
                    }
                });
            }
        }];
        fluid.testUtils.testCaseWithEnv("Video Player Controller: ", defaultPlusCaptions, {
            "supportsHtml5": "fluid.browser.supportsHtml5"
        });

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
                            start();
                        }
                    }
                });
            }
        }];
        fluid.testUtils.testCaseWithEnv("Video Player Controller: ", defaultPlusFullScreenAndCaptions, {
            "supportsFullScreen": "fluid.browser.supportsFullScreen",
            "supportsHtml5": "fluid.browser.supportsHtml5"
        });
    });
})(jQuery);
