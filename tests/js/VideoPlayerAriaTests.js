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

(function ($) {
    $(document).ready(function () {

        fluid.registerNamespace("fluid.tests.videoPlayer");

        var videoPlayerARIATests = new jqUnit.TestCase("Video Player ARIA Tests");

        var baseOpts = {
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
                ],
                captions: [
                    {
                        src: "TestCaptions.en.vtt",
                        type: "text/vtt",
                        srclang: "en",
                        label: "English"
                    },
                    {
                        src: "TestCaptions.fr.vtt",
                        type: "text/vtt",
                        srclang: "fr",
                        label: "French"
                    }
                ],
                transcripts: [
                    {
                        src: "TestTranscripts.en.json",
                        type: "JSONcc",
                        srclang: "en",
                        label: "English"
                    },
                    {
                        src: "TestTranscripts.fr.json",
                        type: "JSONcc",
                        srclang: "fr",
                        label: "French"
                    }
                ]
            },
            templates: {
                videoPlayer: {
                    forceCache: true,
                    href: "../../html/videoPlayer_template.html"
                }
            },
            components: {
                controllers: {
                    options: {
                        templates: {
                            menuButton: {
                                href: "../../html/menuButton_template.html"
                            }
                        }
                    }
                }
            }
        };

        var initVideoPlayer = function () {
            var opts = fluid.copy(baseOpts);
            var container = arguments[0];
            for (var index = 1; index < arguments.length; index++) {
                $.extend(true, opts, arguments[index]);
            }
            return fluid.videoPlayer(container, opts);
        };

        fluid.tests.videoPlayer.checkAriaControlsAttr = function (controlsToTest) {
            fluid.each(controlsToTest, function (spec, index) {
                jqUnit.expect(2);
                jqUnit.assertTrue(spec.controlName + " should have aria-controls attribute", !!$(spec.control).attr("aria-controls"));
                jqUnit.assertEquals(spec.controlName + " should aria-controls " + spec.controlledName,
                                    $(spec.controlled).attr("id"),
                                    $(spec.control).attr("aria-controls"));
            });
        };

        var captionLangMenuSelector = ".flc-videoPlayer-captionControls-container .flc-menuButton-languageMenu";
        var transcriptLangMenuSelector = ".flc-videoPlayer-transcriptControls-container .flc-menuButton-languageMenu";

        fluid.tests.videoPlayer.triggerTranscript = function (that) {
            $(transcriptLangMenuSelector + " li:eq(0)").click();
        };

        fluid.tests.videoPlayer.testAriaControlsAttrs = function (that) {
            var controlsToTest = [{
                controlName: "Transcript menu",
                control: transcriptLangMenuSelector,
                controlledName: "transcript area",
                controlled: ".flc-videoPlayer-transcript-text"
            }];

            var transcriptMenuLanguages = $(transcriptLangMenuSelector + " .flc-videoPlayer-language");
            for (var i = 0; i < transcriptMenuLanguages.length; i++) {
                controlsToTest.push({
                    controlName: "Transcript language " + i,
                    control: transcriptMenuLanguages[i],
                    controlledName: "transcript area",
                    controlled: ".flc-videoPlayer-transcript-text"
                });
            }

            if (fluid.hasFeature("fluid.browser.supportsHtml5")) {
                controlsToTest.push({
                    controlName: "Caption menu",
                    control: captionLangMenuSelector,
                    controlledName: "captions area",
                    controlled: ".flc-videoPlayer-captionArea"
                });
                var captionMenuLanguages = $(captionLangMenuSelector + " .flc-videoPlayer-language");
                for (i = 0; i < captionMenuLanguages.length; i++) {
                    controlsToTest.push({
                        controlName: "Caption language " + i,
                        control: captionMenuLanguages[i],
                        controlledName: "captions area",
                        controlled: ".flc-videoPlayer-captionArea"
                    });
                }
            }

            fluid.tests.videoPlayer.checkAriaControlsAttr(controlsToTest);
            start();
        };

        videoPlayerARIATests.asyncTest("aria-controls on language menus", function () {
            var testOpts = {
                listeners: {
                    onControllersReady: "fluid.tests.videoPlayer.triggerTranscript",
                    onTranscriptsLoaded: "fluid.tests.videoPlayer.testAriaControlsAttrs"
                }
            };
            initVideoPlayer($(".videoPlayer-aria"), testOpts);
        });

    });
})(jQuery);
