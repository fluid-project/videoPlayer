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

(function ($) {
    $(document).ready(function () {

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
                        // TODO: renamed to TestTranscript.en(fr).json once the pull request for transcript component
                        // unit test (FLUID-4643) is merged into demo branch
                        src: "../../demos/videos/ReorganizeFuture/ReorganizeFuture.transcripts.en.json",
                        type: "JSONcc",
                        srclang: "en",
                        label: "English"
                    },
                    {
                        src: "../../demos/videos/ReorganizeFuture/ReorganizeFuture.transcripts.fr.json",
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
            }
        };
        
        var initVideoPlayer = function () {
            var opts = fluid.copy(baseOpts);
            
            // the 1st argument is the container and the following is component options
            for (var index in arguments) {
                if (index === "0") {
                    var container = arguments[index];
                } else {
                    $.extend(true, opts, arguments[index]);
                }
            }
            
            return fluid.videoPlayer(container, opts);
        };
        

        var testPlayPause = function (clickFunc) {
            var video = $(".flc-videoPlayer-video");
            
            clickFunc();
            var currentTimeBeforePlay = video[0].currentTime;
            
            setTimeout(function () {
                var currentTimeAfterPlay = video[0].currentTime;
                jqUnit.assertNotEquals("The video is playing", currentTimeBeforePlay, currentTimeAfterPlay);

                // pause
                clickFunc();
                
                var currentTimeBeforePause = video[0].currentTime;
                setTimeout(function () {
                    var currentTimeAfterPause = video[0].currentTime;
                    jqUnit.assertEquals("The video is paused", currentTimeBeforePause, currentTimeAfterPause);
                    start();
                }, 500);
            }, 1500);
        };
        
        fluid.videoPlayer.checkAriaControls = function (controlsToTest) {
console.log("in checkAriaControls");
            fluid.each(controlsToTest, function (spec, index) {
                expect(1);
                jqUnit.assertEquals(spec.controlName + " should aria-controls " + spec.controlledName,
                                    $(spec.controlled).attr("id"),
                                    $(spec.control).attr("aria-controls"));
            });
        };

        videoPlayerARIATests.asyncTest("aria-controls on language menus", function () {

            fluid.videoPlayer.triggerTranscript = function (that) {
                // initial loading
                $(".flc-videoPlayer-transcripts-languageMenu li:eq(0)").click();
            };
            fluid.videoPlayer.testARIAControls = function (that) {
                var controlsToTest = [{
                    controlName: "Caption menu",
                    control: ".flc-videoPlayer-captions-languageMenu",
                    controlledName: "captions area",
                    controlled: ".flc-videoPlayer-captionArea"
                },{
                    controlName: "Transcript menu",
                    control: ".flc-videoPlayer-transcripts-languageMenu",
                    controlledName: "transcript area",
                    controlled: ".flc-videoPlayer-transcript-text"
                }];

                var captionMenuLanguages = $(".flc-videoPlayer-captions-languageMenu .flc-videoPlayer-language");
                for (var i = 0; i < captionMenuLanguages.length; i++) {
                    controlsToTest.push({
                        controlName: "Caption language " + i,
                        control: captionMenuLanguages[i],
                        controlledName: "captions area",
                        controlled: ".flc-videoPlayer-captionArea"
                    });
                }
                var transcriptMenuLanguages = $(".flc-videoPlayer-transcripts-languageMenu .flc-videoPlayer-language");
                for (var i = 0; i < transcriptMenuLanguages.length; i++) {
                    controlsToTest.push({
                        controlName: "Transcript language " + i,
                        control: transcriptMenuLanguages[i],
                        controlledName: "transcript area",
                        controlled: ".flc-videoPlayer-transcript-text"
                    });
                }

                setTimeout(function () {
console.log("in the timeout. controlsToTest.length =  "+controlsToTest.length);
                    fluid.videoPlayer.checkAriaControls(controlsToTest);
                    start();
                }, 1500);
            };

            var testOpts = {
                listeners: {
                    onReady: fluid.videoPlayer.triggerTranscript
                },
                components: {
                    transcript: {
                        options: {
                            listeners: {
                                onReady: fluid.videoPlayer.testARIAControls
                                // {
                                    // listener: fluid.videoPlayer.testARIAControls,
                                    // priority: "last"
                                // }
                            }
                        }
                    }
                }
            };

            initVideoPlayer($(".videoPlayer-aria"), testOpts);
        });

   });
})(jQuery);
