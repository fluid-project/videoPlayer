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
        
        /*
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
*/
        
/*
        var envFeatures = {"supportsHtml5": "fluid.browser.supportsHtml5"};
        var UniSubOpts = [{
            desc: "Caption and Transcript menu re-rendering after fetching languages from Amara",
            async: true,
            testFn: function () {
                jqUnit.expect(2);

                var vidPlayer = fluid.testUtils.initVideoPlayer(".videoPlayer", {
                    controls: "custom",
                    listeners: {
                        onReady: function (videoPlayer) {
                            jqUnit.assertNotUndefined("The sub-component media has been instantiated", videoPlayer.media);
                            jqUnit.assertNotUndefined("The sub-component controllers has been instantiated", videoPlayer.controllers);
                            jqUnit.assertNotUndefined("The sub-component html5Captionator has been instantiated", videoPlayer.html5Captionator);

                            jqUnit.start();
                        }
                    }
                });
            }
        }];
        fluid.testUtils.testCaseWithEnv("UniSub integration tests", UniSubOpts, envFeatures);
*/
        
        fluid.unisubComponent.testLoadCaptionsData = function (that) {
            that.events.onReady.fire([{
                // going to put a real working link for now
                src: "http://www.youtube.com/watch?v=_VxQEPw1x9E&language=en",
                type: "text/amarajson",
                srclang: "rs",
                label: "Rastafarian"
            }]);
        };
        
        var integrationUniSub = function () {
            var initialLanguageMenuLength = fluid.testUtils.baseOpts.video.transcripts.length;
            
            var transcriptSecondRender = false;
            var transcriptMenuLanguagesLengths = [];
            
            var captionsSecondRender = false;
            var captionsMenuLanguagesLengths = [];
            jqUnit.expect(2);
            var testOpts = {
                events: {
                    onCaptionatorReady: null,
                    
                    onTranscriptUpdateEnd: null,
                    onTranscriptAfterRender: null,
                    
                    onCaptionsUpdateEnd: null,
                    onCaptionsAfterRender: null,
                    
                    onTestEnd: {
                        events: {
                            onTranscriptUpdateEnd: "onTranscriptUpdateEnd",
                            onCaptionsUpdateEnd: "onCaptionsUpdateEnd",
                            onCaptionatorReady: "onCaptionatorReady"
                        }
                    }
                },
                listeners: {
                    onCaptionListUpdated: function () {
                        console.log('Im actually changed my caption model here');
                    },
                    
                    onCaptionsAfterRender: function (that) {
                        console.log('captions after render');
                        
                        // push number of items in the language menu into array. We will check those array values at the end to see if values are set to the proper ones
                        var languages = $(".flc-videoPlayer-captionControls-container .flc-menuButton-languageMenu").find(".flc-videoPlayer-language");
                        captionsMenuLanguagesLengths.push(languages.length);
                        
                        // If it is the second time we call afterRender then we want to fire an event saying that Transcript Language Menu was updated
                        if (captionsSecondRender) {
                            that.events.onCaptionsUpdateEnd.fire();
                        } else {
                            captionsSecondRender = true;
                        }
                    },
                    onCaptionsUpdateEnd: {
                        listener: function (that) {
                            var initialLength = captionsMenuLanguagesLengths.shift();
                            jqUnit.assertTrue("Initial number of languages is the same", (initialLength === initialLanguageMenuLength));
                            
                            var updatedLength = captionsMenuLanguagesLengths.shift();
                            jqUnit.assertTrue("Updated number of languages is bigger", (updatedLength > initialLanguageMenuLength));
                        },
                        args: "{videoPlayer}"
                    },
                    
                    onTranscriptAfterRender: function (that) {
                        console.log('transcripts after render');
                        
                        // push number of items in the language menu into array. We will check those array values at the end to see if values are set to the proper ones
                        var languages = $(".flc-videoPlayer-transcriptControls-container .flc-menuButton-languageMenu").find(".flc-videoPlayer-language");
                        transcriptMenuLanguagesLengths.push(languages.length);
                        
                        // If it is the second time we call afterRender then we want to fire an event saying that Transcript Language Menu was updated
                        if (transcriptSecondRender) {
                            that.events.onTranscriptUpdateEnd.fire();
                        } else {
                            transcriptSecondRender = true;
                        }
                    },
                    onTranscriptUpdateEnd: {
                        listener: function (that) {
                            var initialLength = transcriptMenuLanguagesLengths.shift();
                            jqUnit.assertTrue("Initial number of languages is the same", (initialLength === initialLanguageMenuLength));
                            
                            var updatedLength = transcriptMenuLanguagesLengths.shift();
                            jqUnit.assertTrue("Updated number of languages is bigger", (updatedLength > initialLanguageMenuLength));
                        },
                        args: "{videoPlayer}"
                    },
                    
                    onTestEnd: function () {
                        // We require to start our test here to ensure that captionator did its work before test has finished to avoid an error.
                        // An error due to the asynchronous calls for captionator to create tracks after test is done.
                        jqUnit.start();
                    }
                },
                video: {
                    sources: [{
                        // This is a link to a video with multiple languages for test purposes
                        src: "http://www.youtube.com/watch?v=Xxj0jWQo6ao",
                        type: "video/youtube"
                    }]
                },
                components: {
                    controllers: {
                        options: {
                            components: {
                                captionControls: {
                                    options: {
                                        components: {
                                            menu: {
                                                options: {
                                                    events: {
                                                        onCaptionsUpdateEnd: "{videoPlayer}.events.onCaptionsUpdateEnd"
                                                    },
                                                    listeners: {
                                                        afterRender: "{videoPlayer}.events.onCaptionsAfterRender",
                                                        onLanguageListUpdated: function () {
                                                            console.log('Im a child captionControls and I see that the language was updated');
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                },
                                transcriptControls: {
                                    options: {
                                        components: {
                                            menu: {
                                                options: {
                                                    events: {
                                                        onTranscriptUpdateEnd: "{videoPlayer}.events.onTranscriptUpdateEnd"
                                                    },
                                                    listeners: {
                                                        afterRender: "{videoPlayer}.events.onTranscriptAfterRender",
                                                        onLanguageListUpdated: function () {
                                                            console.log('Im a child transcriptControls and I see that the language was updated');
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
                    amara: {
                        type: "fluid.unisubComponent",
                        createOnEvent: "onMediaReady",
                        options: {
                            sources: "{videoPlayer}.options.video.sources",
                            urls: {
                                captionsUrl: "https://www.universalsubtitles.org/api2/partners/videos/"
                            },
                            languagesPath: "objects.0.languages",
                            events: {
                                onReady: "{videoPlayer}.events.onAmaraCaptionsReady"
                            }/*
,
                            invokers: {
                                loadCaptionsData: {
                                    funcName: "fluid.unisubComponent.testLoadCaptionsData",
                                    args: ["{that}"]
                                }
                            }
*/
                        }
                    },
                    html5Captionator: {
                        createOnEvent: "onAmaraCaptionsReady",
                        options: {
                            listeners: {
                                onReady: "{videoPlayer}.events.onCaptionatorReady.fire"
                            }
                        }
                    }
                }
            };
            fluid.testUtils.initVideoPlayer(".videoPlayer-transcript", testOpts);
        };
        
        var UniSubOpts = [{
           desc: "Check that menus are updated after UniSub updates language list",
           async: true,
           testFn: integrationUniSub
        }];
        fluid.testUtils.testCaseWithEnv("Video Player UniSub integration test. ", UniSubOpts, ["fluid.browser.nativeVideoSupport"]);

    });
})(jQuery);
