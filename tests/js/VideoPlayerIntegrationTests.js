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
    fluid.registerNamespace("fluid.tests");

    fluid.tests.transcriptMenuSelector = ".flc-videoPlayer-transcriptControls-container .flc-menuButton-languageMenu";

    fluid.defaults("fluid.tests.transcriptsTests", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            videoPlayer: {
                type: "fluid.videoPlayer",
                container: ".videoPlayer-transcript",
                options: {
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
                        transcripts: [{
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
                        }]
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
                                    controllers: {
                                        href: "../../html/videoPlayer_controllers_template.html"
                                    },
                                    menuButton: {
                                        href: "../../html/menuButton_template.html"
                                    }
                                }
                            }
                        }
                    }
                }
            },
            tester: {
                type: "fluid.tests.transcriptTester"
            }
        }
    });

    fluid.defaults("fluid.tests.transcriptTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "Multiple Transcripts",
            tests: [{
                expect: 6,
                name: "Load and switch transcript",
                sequence: [{
                    event: "{videoPlayer}.events.onReady",
                    listener: "fluid.tests.transcriptsInitialized"
                },{
                    // click the first one
                    element: fluid.tests.transcriptMenuSelector + " li:eq(1)",
                    jQueryTrigger: "click"
                },{
                    event: "{videoPlayer}.events.onTranscriptsLoaded",
                    listener: "fluid.tests.transcriptsSwitched"
                },{
                    // click the second one
                    element: fluid.tests.transcriptMenuSelector + " li:eq(0)",
                    jQueryTrigger: "click"
                },{
                    event: "{videoPlayer}.events.onCurrentTranscriptChanged",
                    listener: "fluid.tests.transcriptsSwitched"
                }]
            }]
        }]
    });

    fluid.tests.initialTranscriptText = null;

    fluid.tests.transcriptsInitialized = function (that) {
        jqUnit.assertTrue("The transcript text is filled in", $(".flc-videoPlayer-transcript-text").text().length > 0);
        jqUnit.assertTrue("Each transcript element is wrapped in a properly-named span", 
                ($(".flc-videoPlayer-transcript-text").find('[id|="' + that.transcript.options.transcriptElementIdPrefix + '"]').length > 0));

        fluid.tests.initialTranscriptText = $(".flc-videoPlayer-transcript-text").text();
    };

    fluid.tests.transcriptsSwitched = function (intervalList, id, that) {
        jqUnit.assertTrue("The transcript text is filled in", $(".flc-videoPlayer-transcript-text").text().length > 0);
        jqUnit.assertNotEquals("The transcript text is switched", $(".flc-videoPlayer-transcript-text").text(), fluid.tests.initialTranscriptText.substring(0, 100));

        fluid.tests.initialTranscriptText = $(".flc-videoPlayer-transcript-text").text();
    };

    $(document).ready(function () {

        fluid.test.runTests([
            "fluid.tests.transcriptsTests"
        ]);

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

        jqUnit.asyncTest("Show transcript button", function () {
            jqUnit.expect(2);

            fluid.videoPlayer.testTranscript = function (that) {
                var video = $(".flc-videoPlayer-video");
                var transMenu = $(fluid.tests.transcriptMenuSelector);

                jqUnit.assertFalse("The transcript panel is hidden initially", $(".flc-videoPlayer-transcriptArea").is(":visible"));
                
                // Clicking "show transcript" menu item to open transcript panel
                $(fluid.tests.transcriptMenuSelector + " li:last").click();  // click "show transcript" button
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

    });
})(jQuery);
