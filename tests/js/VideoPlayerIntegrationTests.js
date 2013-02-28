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
    $(document).ready(function () {

        jqUnit.module("Video Player Integration Tests");


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
                    jqUnit.start();
                }, 500);
            }, 1500);
        };
        
        jqUnit.asyncTest("Play button - Play/Pause", function () {
            jqUnit.expect(2);
            
            fluid.videoPlayer.testPlayButton = function (that) {
                // Play button plays and pauses video
                var playButton = $(".flc-videoPlayer-play");
                var clickFunc = function () { playButton.click(); };
                
                testPlayPause(clickFunc);
            };

            var testOpts = {
                    listeners: {
                        onReady: fluid.videoPlayer.testPlayButton
                    }
                };
            
            fluid.testUtils.initVideoPlayer(".videoPlayer-playButton", testOpts);
        });

        jqUnit.asyncTest("Container click - Play/Pause", function () {
            jqUnit.expect(2);

            fluid.videoPlayer.testContainerClick = function (that) {
                // Clicking on video container plays and pauses video
                var videoPlayerContainer = $(".flc-videoPlayer-video-container");
                var clickFunc = function () { videoPlayerContainer.mousedown(); };
                
                testPlayPause(clickFunc);
            };

            var testOpts = {
                    listeners: {
                        onReady: fluid.videoPlayer.testContainerClick
                    }
                };
            
            fluid.testUtils.initVideoPlayer(".videoPlayer-containerClick", testOpts);
        });

        jqUnit.asyncTest("Mute button", function () {
            jqUnit.expect(2);

            fluid.videoPlayer.testMuteButton = function (that) {
                var video = $(".flc-videoPlayer-video");
                jqUnit.assertFalse("The video is NOT initially muted", video[0].muted);
                
                // Click mute button
                $(".flc-videoPlayer-mute").click();
                jqUnit.assertTrue("The video is muted", video[0].muted);
                
                jqUnit.start();
            };

            var testOpts = {
                    listeners: {
                        onReady: fluid.videoPlayer.testMuteButton
                    }
                };
            
            fluid.testUtils.initVideoPlayer(".videoPlayer-playButton", testOpts);
        });

        var transcriptMenuSelector = ".flc-videoPlayer-transcriptControls-container .flc-menuButton-languageMenu";

        jqUnit.asyncTest("Show transcript button", function () {
            jqUnit.expect(2);

            fluid.videoPlayer.testTranscript = function (that) {
                var video = $(".flc-videoPlayer-video");
                var transMenu = $(transcriptMenuSelector);

                jqUnit.assertFalse("The transcript panel is hidden initially", $(".flc-videoPlayer-transcriptArea").is(":visible"));
                
                // Clicking "show transcript" menu item to open transcript panel
                $(transcriptMenuSelector + " li:last").click();  // click "show transcript" button
                jqUnit.assertTrue("The transcript panel is shown", $(".flc-videoPlayer-transcriptArea").is(":visible"));
                
                jqUnit.start();
            };

            var testOpts = {
                    listeners: {
                        onReady: fluid.videoPlayer.testTranscript
                    }
                };
            
            fluid.testUtils.initVideoPlayer(".videoPlayer-transcript", testOpts);
        });

        jqUnit.asyncTest("Switch transcript language buttons", function () {
            jqUnit.expect(3);

            var initialTranscriptText;
            var testedTranscriptSpanClick = false;
            
            fluid.videoPlayer.testTranscript = function (that) {
                // initial loading
                $(transcriptMenuSelector + " li:eq(0)").click();
                // switch to another language
                $(transcriptMenuSelector + " li:eq(1)").click();

            };
            
            fluid.videoPlayer.testTranscriptLoaded = function (intervalList, id, that) {
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
                        jqUnit.start();
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
            
            fluid.testUtils.initVideoPlayer(".videoPlayer-transcript", testOpts);
        });
        
        videoPlayerIntegrationTests.asyncTest("Auto-fetch of amara captions disabled", function () {
            jqUnit.expect(1);
            var testOpts = {
                listeners: {
                    onReady: function (vp, languageMenu) {
                        jqUnit.assertEquals("Language menu doesn't contain amara captions",
                            fluid.testUtils.baseOpts.video.captions.length,
                            $(".flc-videoPlayer-captions-languageMenu .flc-videoPlayer-language").length);
                        start();
                    }
                },
                video: {
                    sources: [{
                        // this caption is known to have two amara captions: French and English
                        src: "http://www.youtube.com/v/_VxQEPw1x9E",
                        type: "youtube"
                    }]
                },
                queryAmaraForCaptions: false
            };
            fluid.testUtils.initVideoPlayer(".videoPlayer-transcript", testOpts);
        });

        videoPlayerIntegrationTests.asyncTest("Auto-fetch of amara captions enabled", function () {
            jqUnit.expect(1);
            var testOpts = {
                listeners: {
                    onAmaraCaptionsReadyBoiled: {
                        priority: "first",
                        listener: function (vp, captionData) {
                            vp.events.onCaptionControlsRenderedBoiled.addListener(function (vp, languageMenu) {
                                jqUnit.assertEquals("Language menu contains amara captions",
                                    fluid.testUtils.baseOpts.video.captions.length + 2,
                                    $(".flc-videoPlayer-captions-languageMenu .flc-videoPlayer-language").length);
                                start();
                            });
                        }
                    }
                },
                video: {
                    sources: [{
                        // this caption is known to have two amara captions: French and English
                        src: "http://www.youtube.com/v/_VxQEPw1x9E",
                        type: "youtube"
                    }]
                },
                queryAmaraForCaptions: true
            };
            fluid.testUtils.initVideoPlayer(".videoPlayer-transcript", testOpts);
        });

    });
})(jQuery);
