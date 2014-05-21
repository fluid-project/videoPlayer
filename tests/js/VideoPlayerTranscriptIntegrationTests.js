/*
Copyright 2012 OCAD University

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

        jqUnit.module("Video Player Transcript Integration Tests");

        jqUnit.asyncTest("FLUID-4812: Transcripts showing on UIO reset", function () {
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
                                jqUnit.start();
                            });
                            uiOptions.uiOptionsLoader.uiOptions.reset();
                        }
                    }
                }
            };
            fluid.testUtils.initEnhancedVideoPlayer(instance, uiOptions.relay);
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
                            newTime = (that.convertToMilli(that.options.model.transcripts[0].tracks[7].inTime) + 1) / 1000;
                            
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
            fluid.testUtils.initEnhancedVideoPlayer(instance, uiOptions.relay);
        });

    });
})(jQuery);
