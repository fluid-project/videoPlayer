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

(function ($) {
    $(document).ready(function () {

        fluid.registerNamespace("fluid.tests");

        var testsCompleted;
        var setup = function () {
            testsCompleted = false;
        };

        var timeoutId;
        var videoPlayerErrorsTests = new jqUnit.TestCase("Video Player Error Handling Tests", setup);

        var captionItemSelector = ".flc-videoPlayer-captionControls-container .flc-videoPlayer-language";
        var transcriptItemSelector = ".flc-videoPlayer-transcriptControls-container .flc-videoPlayer-language";

        /* Using custom baseOpts here because we specifically don't want the default base opts */
        var baseOpts = {
            video: {
                sources: [
                    {
                        src: "../../demos/videos/ReorganizeFuture/ReorganizeFuture.webm",
                        type: "video/webm"
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
                media: {
                    options: {
                        components: {
                            errorPanel: {
                                options: {
                                    templates: {
                                        panel: {
                                            href: "errorPanel_template.html"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };

        fluid.tests.initVideoPlayer = function () {
            var opts = fluid.copy(baseOpts);
            var container = arguments[0];
            for (var index = 1; index < arguments.length; index++) {
                $.extend(true, opts, arguments[index]);
            }
            return fluid.videoPlayer(container, opts);
        };

        fluid.tests.makeListenersForLoadTriggeredTest = function (selector, errorEventName) {
            var obj = {};
            obj[errorEventName] = {
                listener: function (that) {
                    fluid.tests.testMenuItemAfterLoadError(selector, false);
                    testsCompleted = true;
                    clearTimeout(timeoutId);
                    start();
                },
                priority: "last"
            };
            return obj;
        };

        fluid.tests.makeListenersForClickTriggeredTest = function (selector, errorEventName) {
            var obj = {
                onReady: function (tjat) {
                    fluid.tests.testMenuItemBeforeLoad(selector);
                    $(selector).click();
                }
            };
            obj[errorEventName] = {
                listener: function (that) {
                    fluid.tests.testMenuItemAfterLoadError(selector, true);
                    testsCompleted = true;
                    clearTimeout(timeoutId);
                    start();
                },
                priority: "last"
            };
            return obj;
        };

        fluid.tests.testMenuItemBeforeLoad = function (itemSelector) {
            var item = $(itemSelector);
            jqUnit.assertEquals("Before language is selected, language is present in caption menu", 1, item.length);
            jqUnit.assertTrue("Before language is selected, language is selectable in caption menu", item.hasClass("flc-videoPlayer-menuItem"));
            jqUnit.assertFalse("Before language is selected, language is not styled as disabled in caption menu", item.hasClass("fl-videoPlayer-menuItem-disabled"));
        };

        fluid.tests.testMenuItemAfterLoadError = function (itemSelector, displayMessage) {
            jqUnit.assertTrue("Error event fires", true);
            var msgLen = $(".flc-videoPlayer-errorMessage").text().length;
            jqUnit.assertTrue("Error message is " + (displayMessage ? "" : "not ") + "displayed", (displayMessage ? msgLen > 0 : msgLen === 0));
            var item = $(itemSelector);
            jqUnit.assertEquals("Language is still present in caption menu", 1, item.length);
            jqUnit.assertTrue("Language is not selectable in caption menu", item.hasClass("flc-videoPlayer-menuItem"));
            jqUnit.assertFalse("Language is styled as disabled in caption menu", item.hasClass("fl-videoPlayer-menuItem-disabled"));
        };

        fluid.tests.runTestWithTimeout = function (config) {
            videoPlayerErrorsTests.asyncTest(config.desc, function () {
                jqUnit.expect(config.expect);
                fluid.tests.initVideoPlayer($(".videoPlayer-errors"), config.opts);
                timeoutId = setTimeout(function () {
                    if (!testsCompleted) {
                        jqUnit.assertFalse("Expected error event didn't fire", true);
                        start();
                    }
                }, 5000);
            });
        };

        fluid.tests.runTestWithTimeout({
            desc: "Video load error",
            expect: 2,
            opts: {
                video: {
                    sources: [
                        {
                            src: "bad.video.webm",
                            type: "video/webm"
                        }
                    ]
                },
                listeners: {
                    onMediaLoadError: {
                        listener: function (that) {
                            jqUnit.assertTrue("Error event fires", true);
                            jqUnit.assertTrue("Error message is displayed", $(".flc-videoPlayer-videoError .flc-errorPanel-message").text().length > 0);
                            testsCompleted = true;
                            clearTimeout(timeoutId);
                            start();
                        },
                        priority: "last"
                    }
                }
            }
        });


        fluid.tests.runTestWithTimeout({
            desc: "Caption (amara) load error",
            expect: 5,
            opts: {
                video: {
                    captions: [
                        {
                            src: "bad.amara.url",
                            type: "text/amarajson",
                            srclang: "en",
                            label: "English"
                        }
                    ]
                },
                listeners: fluid.tests.makeListenersForLoadTriggeredTest(captionItemSelector, "onLoadCaptionError")
            }
        });

        fluid.tests.runTestWithTimeout({
            desc: "Caption (non-amara) load error",
            expect: 8,
            opts: {
                video: {
                    captions: [
                        {
                            src: "bad.vtt.url",
                            type: "text/vtt",
                            srclang: "en",
                            label: "English"
                        }
                    ]
                },
                listeners: fluid.tests.makeListenersForClickTriggeredTest(captionItemSelector, "onLoadCaptionError")
            }
        });

        fluid.tests.runTestWithTimeout({
            desc: "Transcript (amara, default selection) load error",
            expect: 5,
            opts: {
                video: {
                    transcripts: [
                        {
                            src: "bad.amara.url",
                            type: "text/amarajson",
                            srclang: "en",
                            label: "English"
                        }
                    ]
                },
                model: {
                    currentTracks: {
                        transcripts: [0]
                    }
                },
                listeners: fluid.tests.makeListenersForLoadTriggeredTest(transcriptItemSelector, "onLoadTranscriptError")
            }
        });

        fluid.tests.runTestWithTimeout({
            desc: "Transcript (non-amara) load error",
            expect: 8,
            opts: {
                video: {
                    transcripts: [
                        {
                            src: "bad.json.url",
                            type: "JSONcc",
                            srclang: "en",
                            label: "English"
                        }
                    ]
                },
                listeners: fluid.tests.makeListenersForClickTriggeredTest(transcriptItemSelector, "onLoadTranscriptError")
            }
        });
    });

})(jQuery);
