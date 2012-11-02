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

        fluid.tests.testRetryCallback = function () {
            jqUnit.assertTrue("Retrycallback is called", true);
            testsCompleted = true;
            clearTimeout(timeoutId);
            start();
        };

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
            model: {
                currentTracks: {
                    transcripts: [0]
                }
            },
            components: {
                media: {
                    options: {
                        components: {
                            videoError: {
                                options: {
                                    templates: {
                                        panel: {
                                            href: "errorPanel_template.html"
                                        }
                                    },
                                    retryCallback: "fluid.tests.testRetryCallback"
                                }
                            },
                            transcript: {
                                options: {
                                    components: {
                                        transcriptError: {
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
                    }
                },
                html5Captionator: {
                    options: {
                        components: {
                            captionError: {
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

        fluid.tests.makeListenersForClickTriggeredTest = function (selector, errorEventName, listenerFn) {
            var obj = {
                onReady: function (tjat) {
                    $(selector).click();
                }
            };
            obj[errorEventName] = {
                listener: listenerFn,
                priority: "last"
            };
            return obj;
        };

        fluid.tests.runTestWithTimeout = function (config) {
            videoPlayerErrorsTests.asyncTest(config.desc, function () {
                jqUnit.expect(config.expect);
                fluid.tests.initVideoPlayer($(".videoPlayer-errors"), config.opts);
                timeoutId = setTimeout(function () {
                    if (!testsCompleted) {
                        jqUnit.assertFalse("Expected error event or callback didn't fire", true);
                        start();
                    }
                }, 5000);
            });
        };

        fluid.tests.runTestWithTimeout({
            desc: "Video load error",
            expect: 3,
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
                            // trigger the retry callback
                            $(".flc-videoPlayer-videoError .flc-errorPanel-retryButton").click();
                        },
                        priority: "last"
                    }
                }
            }
        });

        var testTranscriptLoadError = function (that) {
            jqUnit.isVisible("Transcript are should be visible", $(".flc-videoPlayer-transcriptArea"));
            jqUnit.isVisible("Transcript are should container error message", $(".flc-videoPlayer-transcriptArea .flc-videoPlayer-transcriptError"));
            jqUnit.notVisible("Transcript are should not container transcript text", $(".flc-videoPlayer-transcriptArea .flc-videoPlayer-transcript-text"));
            testsCompleted = true;
            clearTimeout(timeoutId);
            start();
        };

        fluid.tests.runTestWithTimeout({
            desc: "Transcript (amara) load error",
            expect: 3,
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
                listeners: fluid.tests.makeListenersForClickTriggeredTest(transcriptItemSelector, "onLoadTranscriptError", testTranscriptLoadError)
            }
        });

        fluid.tests.runTestWithTimeout({
            desc: "Transcript (non-amara) load error",
            expect: 3,
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
                listeners: fluid.tests.makeListenersForClickTriggeredTest(transcriptItemSelector, "onLoadTranscriptError", testTranscriptLoadError)
            }
        });

        var testCaptionLoadError = function (that) {
            jqUnit.isVisible("Caption error message should be visible", $(".flc-videoPlayer-captionArea .flc-videoPlayer-captionError"));
            $(".flc-videoPlayer-captionArea .flc-videoPlayer-captionError .flc-errorPanel-dismissButton").click();
            jqUnit.notVisible("After dismiss, caption error message should not be visible", $(".flc-videoPlayer-captionArea .flc-videoPlayer-captionError"));
            testsCompleted = true;
            clearTimeout(timeoutId);
            start();
        };

        fluid.tests.runTestWithTimeout({
            desc: "Caption (amara) load error",
            expect: 2,
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
                listeners: fluid.tests.makeListenersForClickTriggeredTest(captionItemSelector, "onLoadCaptionError", testCaptionLoadError)
            }
        });

        fluid.tests.runTestWithTimeout({
            desc: "Caption (non-amara) load error",
            expect: 2,
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
                listeners: fluid.tests.makeListenersForClickTriggeredTest(captionItemSelector, "onLoadCaptionError", testCaptionLoadError)
            }
        });

    });
})(jQuery);
