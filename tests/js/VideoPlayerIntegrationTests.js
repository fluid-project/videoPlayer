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

        var videoPlayerIntegrationTests = new jqUnit.TestCase("Video Player Integration Tests");

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
                    },
                ],
                captions: [
                    {
                        src: "TestCaptions.en.vtt",
                        type: "text/vtt",
                        srclang: "en",
                        label: "English",
                    },
                    {
                        src: "TestCaptions.fr.vtt",
                        type: "text/vtt",
                        srclang: "fr",
                        label: "French",
                    }
                ],
                transcripts: [
                    {
                        // TODO: renamed to TestTranscript.en(fr).json once the pull request for transcript component
                        // unit test (FLUID-4643) is merged into demo branch
                        src: "../../demos/videos/ReorganizeFuture/ReorganizeFuture.transcripts.en.json",
                        type: "JSONcc",
                        srclang: "en",
                        label: "English",
                    },
                    {
                        src: "../../demos/videos/ReorganizeFuture/ReorganizeFuture.transcripts.fr.json",
                        type: "JSONcc",
                        srclang: "fr",
                        label: "French",
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
        
        videoPlayerIntegrationTests.asyncTest("Play button - Play/Pause", function () {
            expect(2);
            
            fluid.videoPlayer.testPlayButton = function (that) {
                // Play button plays and pauses video
                var playButton = $(".flc-videoPlayer-play");
                var clickFunc = function () { playButton.click() };
                
                testPlayPause(clickFunc);
            };

            var testOpts = {
                    listeners: {
                        onReady: fluid.videoPlayer.testPlayButton
                    }
                };
            
            initVideoPlayer($(".videoPlayer-playButton"), testOpts);
        });

        videoPlayerIntegrationTests.asyncTest("Container click - Play/Pause", function () {
            expect(2);

            fluid.videoPlayer.testContainerClick = function (that) {
                // Clicking on video container plays and pauses video
                var videoPlayerContainer = $(".flc-videoPlayer-video");
                var clickFunc = function () { videoPlayerContainer.click() };
                
                testPlayPause(clickFunc);
            };

            var testOpts = {
                    listeners: {
                        onReady: fluid.videoPlayer.testContainerClick
                    }
                };
            
            initVideoPlayer($(".videoPlayer-containerClick"), testOpts);
        });

        videoPlayerIntegrationTests.asyncTest("Mute button", function () {
            expect(2);

            fluid.videoPlayer.testMuteButton = function (that) {
                var video = $(".flc-videoPlayer-video");
                jqUnit.assertFalse("The video is NOT initially muted", video[0].muted);
                
                // Click mute button
                $(".flc-videoPlayer-mute").click();
                jqUnit.assertTrue("The video is muted", video[0].muted);
                
                start();
            };

            var testOpts = {
                    listeners: {
                        onReady: fluid.videoPlayer.testMuteButton
                    }
                };
            
            initVideoPlayer($(".videoPlayer-playButton"), testOpts);
        });

        videoPlayerIntegrationTests.asyncTest("Show transcript button", function () {
            expect(2);

            fluid.videoPlayer.testTranscript = function (that) {
                var video = $(".flc-videoPlayer-video");
                var transMenu = $(".flc-videoPlayer-transcripts-languageMenu");

                jqUnit.assertFalse("The transcript panel is hidden initially", $(".flc-videoPlayer-transcriptArea").is(":visible"));
                
                // Clicking "show transcript" menu item to open transcript panel
                $(".flc-videoPlayer-transcripts-languageMenu li:last").click();  // click "show transcript" button
                jqUnit.assertTrue("The transcript panel is shown", $(".flc-videoPlayer-transcriptArea").is(":visible"));
                
                start();
            };

            var testOpts = {
                    listeners: {
                        onReady: fluid.videoPlayer.testTranscript
                    }
                };
            
            initVideoPlayer($(".videoPlayer-transcript"), testOpts);
        });

        videoPlayerIntegrationTests.asyncTest("Switch transcript language buttons", function () {
            expect(3);

            var initialTranscriptText;
            var testedTranscriptSpanClick = false;
            
            fluid.videoPlayer.testTranscript = function (that) {
                // initial loading
                $(".flc-videoPlayer-transcripts-languageMenu li:eq(0)").click();
                // switch to another language
                $(".flc-videoPlayer-transcripts-languageMenu li:eq(1)").click();

            };
            
            fluid.videoPlayer.testTranscriptLoaded = function (intervalList, that) {
                var transcriptTextArea = $(".flc-videoPlayer-transcript-text");

                // make sure the transcript text is switched when another option is selected from the language combo box
                // Depending on the connection with universal subtitle site, the test below may not get run with remote universal subtitle transcript files.
                if (!initialTranscriptText) {
                    initialTranscriptText = transcriptTextArea.text();
                    jqUnit.assertNotNull("The transcript text is filled in", initialTranscriptText);
                } else {
                    jqUnit.assertNotEquals("The transcript text is switched", transcriptTextArea.text(), initialTranscriptText);
                }
                
                // click on one transcript span advances video
                // Use a time delay for the video to be fully loaded
                setTimeout(function () {
                    if (!testedTranscriptSpanClick) {
                        var video = $(".flc-videoPlayer-video");
                        var currentTimeBf = video[0].currentTime;

                        var transcriptSpan = $("#" + that.options.transcriptElementIdPrefix + "-4");
                        transcriptSpan.click();
                        jqUnit.assertNotEquals("The video is advanced", video[0].currentTime, currentTimeBf);
                        
                        testedTranscriptSpanClick = true;
                    }
                    
                    // The delay is to allow the transcript span highlight function to finish. This function is executed with
                    // a slight time delay (100 millisec, see VideoPlayer_transcript.js), after another transcript span is clicked, 
                    // to prevent the event queuing-up.
                    setTimeout(function () {
                        start();
                    }, 500);
                }, 1000);
            };
            
            var testOpts = {
                    listeners: {
                        onReady: fluid.videoPlayer.testTranscript
                    },
                    components: {
                        transcript: {
                            options: {
                                listeners: {
                                    onTranscriptsLoaded: fluid.videoPlayer.testTranscriptLoaded
                                }
                            }
                        }
                    }
                };
            
            initVideoPlayer($(".videoPlayer-transcript"), testOpts);
        });

    });
})(jQuery);
