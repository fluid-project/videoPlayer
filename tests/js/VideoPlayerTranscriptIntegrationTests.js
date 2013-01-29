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

        var uiOptions = fluid.uiOptions.fatPanel.withMediaPanel(".flc-uiOptions", {
            prefix: "../../lib/infusion/components/uiOptions/html/",
            components: {
                relay: {
                    type: "fluid.videoPlayer.relay"
                }
            },
            templateLoader: {
                options: {
                    templates: {
                        mediaControls: "../../html/UIOptionsTemplate-media.html"
                    }
                }
            }
        });

        var videoPlayerTranscriptIntegrationTests = new jqUnit.TestCase("Video Player Transcript Integration Tests");

        videoPlayerTranscriptIntegrationTests.asyncTest("FLUID-4812: Transcripts showing on UIO reset", function () {
            jqUnit.expect(2);
            var instance = {
                container: ".videoPlayer-transcript",
                options: {
                    templates: {
                        videoPlayer: {
                            href: "../../html/videoPlayer_template.html"
                        }
                    },
                    listeners: {
                        onReady: function (that) {
                            jqUnit.notVisible("Before UIO reset, transcripts are not visible", $(".flc-videoPlayer-transcriptArea"));
                            uiOptions.uiOptionsLoader.uiOptions.events.onUIOptionsRefresh.addListener(function () {
                                jqUnit.notVisible("After UIO reset, transcripts are not visible", $(".flc-videoPlayer-transcriptArea"));
                                start();
                            });
                            uiOptions.uiOptionsLoader.uiOptions.reset();
                        }
                    }
                }
            };
            fluid.testUtils.initEnhancedVideoPlayer(instance, uiOptions.relay);
        });

        videoPlayerTranscriptIntegrationTests.asyncTest("Scrubbing", function () {
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
                    templates: {
                        videoPlayer: {
                            href: "../../html/videoPlayer_template.html"
                        }
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
                    listeners: {
                        onVideoAndTranscriptsLoaded: function (vp, that) {
                            var anElement = $("[id^=flc-videoPlayer-transcript-element]").eq(7);
                            newTime = (that.convertToMilli(that.options.transcripts[0].tracks[7].inTime) + 1) / 1000;
                            
                            vp.events.onTimeUpdate.addListener(function (currTime, buffered) {
                                jqUnit.assertEquals("New time is same as clicked transcript", newTime, currTime);
                                vp.events.onTimeUpdate.removeListener("timeChecker");
                                start();
                            }, "timeChecker");
                            
                            anElement.click();
                        }
                    }
                }
            };
            fluid.testUtils.initEnhancedVideoPlayer(instance, uiOptions.relay);
        });

    });
})(jQuery);
