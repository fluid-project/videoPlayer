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

(function ($) {
    fluid.staticEnvironment.vpTest = fluid.typeTag("fluid.tests.videoPlayer");

    $(document).ready(function () {
        var separatedPanel = fluid.prefs.separatedPanel(".flc-prefsEditor", {
            gradeNames: ["fluid.prefs.transformDefaultPanelsOptions"],
            templatePrefix: "../../lib/infusion/framework/preferences/html/",
            messagePrefix: "../../lib/infusion/framework/preferences/messages/",
            templateLoader: {
                gradeNames: ["fluid.videoPlayer.mediaPanelTemplateLoader", "fluid.prefs.starterTemplateLoader"]
            },
            messageLoader: {
                gradeNames: ["fluid.videoPlayer.mediaPanelMessageLoader", "fluid.prefs.starterMessageLoader"]
            },
            prefsEditor: {
                gradeNames: ["fluid.videoPlayer.mediaPanels", "fluid.prefs.starterPanels", "fluid.prefs.rootModel.starter", "fluid.prefs.uiEnhancerRelay"]
            }
        });
        fluid.demands("templateLoader", ["fluid.prefs.separatedPanel", "fluid.tests.videoPlayer"], {
            options: {
                templates: {
                    prefsEditor: "../../html/SeparatedPanelNoNativeVideo.html",
                    captionsSettings: "../../html/MediaPanelTemplate.html",
                    transcriptsSettings: "../../html/MediaPanelTemplate.html"
                }
            }
        });
        fluid.demands("templateLoader", ["fluid.browser.nativeVideoSupport", "fluid.prefs.separatedPanel", "fluid.tests.videoPlayer"], {
            options: {
                templates: {
                    prefsEditor: "../../html/SeparatedPanel.html"
                }
            }
        });
        fluid.demands("messageLoader", ["fluid.prefs.separatedPanel", "fluid.tests.videoPlayer"], {
            options: {
                templates: {
                    captionSettings: "../../messages/captions.json",
                    transcriptSettings: "../../messages/transcripts.json"
                }
            }
        });

        jqUnit.module("Video Player Transcript Integration Tests");

        jqUnit.asyncTest("FLUID-4812: Transcripts showing on prefsEditor reset", function () {
            jqUnit.expect(2);
            var instance = {
                container: ".videoPlayer-transcript",
                options: {
                    listeners: {
                        onReady: function (that) {
                            jqUnit.notVisible("Before PrefsEditor reset, transcripts are not visible", $(".flc-videoPlayer-transcriptArea"));
                            separatedPanel.prefsEditor.events.onReset.addListener(function () {
                                jqUnit.notVisible("After PrefsEditor reset, transcripts are not visible", $(".flc-videoPlayer-transcriptArea"));
                                jqUnit.start();
                            });
                            separatedPanel.prefsEditor.reset();
                        }
                    }
                }
            };
            fluid.testUtils.initEnhancedVideoPlayer(instance);
        });

        jqUnit.asyncTest("Scrubbing", function () {
            var newTime;
            var instance = {
                container: ".videoPlayer-transcript",
                options: {
                    video: {
                        sources: [{
                            src: "../../demos/videos/ReorganizeFuture/ReorganizeFuture.mp4",
                            type: "video/mp4"
                        }, {
                            src: "../../demos/videos/ReorganizeFuture/ReorganizeFuture.webm",
                            type: "video/webm"
                        }, {
                            src: "http://www.youtube.com/v/_VxQEPw1x9E",
                            type: "video/youtube"
                        }],
                        transcripts: [{
                            src: "../../demos/videos/ReorganizeFuture/ReorganizeFuture.transcripts.fr.json",
                            type: "JSONcc",
                            srclang: "fr",
                            label: "French"
                        }]
                    },
                    events: {
                        onVideoAndTranscriptsLoaded: {
                            events: {
                                transcriptsLoaded: "onTranscriptsLoaded",
                                loadedMetadata: "onLoadedMetadata"
                            },
                            args: ["{videoPlayer}", "{transcript}"]
                        }
                    },
                    model: {
                        currentTracks: {
                            transcripts: [0] // ensure that the test transcript is selected so it loads
                        }
                    },
                    listeners: {
                        onVideoAndTranscriptsLoaded: function (vp, that) {
                            var anElement = $("[id^=flc-videoPlayer-transcript-element]").eq(7);
                            newTime = (that.convertToMilli(that.options.transcripts[0].tracks[7].inTime) + 1) / 1000;

                            vp.events.onTimeUpdate.addListener(function (currTime, buffered) {
                                // Removing precision from the currTime as chrome returns the value with about 15 decimal places.
                                // This comes from VideoPLayer_media.js, in the fluid.videoPlayer.media.handleTimeUpdate function.
                                var reducedCurrTime = Math.floor(1000 * currTime) / 1000;
                                jqUnit.assertEquals("New time is same as clicked transcript", newTime, reducedCurrTime);
                                vp.events.onTimeUpdate.removeListener("timeChecker");
                                jqUnit.start();
                            }, "timeChecker");

                            anElement.click();
                        }
                    }
                }
            };
            fluid.testUtils.initEnhancedVideoPlayer(instance);
        });

    });
})(jQuery);
