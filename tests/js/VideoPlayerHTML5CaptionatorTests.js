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
        fluid.setLogging(false);    // disable it not to mess up with FireBug in FF
        
        var container = ".videoPlayer";
        var videoPlayerCaptionatorTests = new jqUnit.TestCase("Video Player HTML5 Captionator Test Suite");
        
        var testOptions1 = {
            model: {
                video: {
                    sources: [
                        {
                            src: "TestVideo.mp4",
                            type: "video/mp4"
                        }
                    ]
                },
                captions: {
                    sources: {
                        english: {
                            src: "TestCaptions.en.vtt",
                            type: "text/vtt",
                            srclang: "en",
                            label: "English Subtitles",
                            kind: "subtitles"
                        },
                        french: {
                            src: "TestCaptions.fr.vtt",
                            type: "text/vtt",
                            srclang: "fr",
                            label: "French Subtitles",
                            kind: "subtitles"
                        }
                    },
                    currentTrack: "english"
                }
            },
            templates: {
                videoPlayer: {
                    href: "../../html/videoPlayer_template.html"
                }
            }
        };
        
        var initVideoPlayer = function (options, callback) {
            options = options || {};
            
            fluid.merge(null, options, {
                listeners: {
                    onReady: function (that) {
                        callback(that);
                    }
                }
            });
            
            return fluid.videoPlayer(container, options);
        };

        function setupEnvironment(withHtml5) {
            if (withHtml5) {
                fluid.staticEnvironment.browserHtml5 = fluid.typeTag("fluid.browser.html5");
            } else {
                fluid.staticEnvironment.browserHtml5 = undefined;
            }
        }
        
        videoPlayerCaptionatorTests.asyncTest("HTML5: html5Captionator was initialized", function () {
            expect(1);
            
            setupEnvironment(true);
            
            initVideoPlayer(testOptions1, function (videoPlayer) {
                videoPlayer.events.onViewReady.fire();
                jqUnit.assertNotUndefined("html5Captionator has been instantiated", videoPlayer.html5Captionator);
                start();
            });
        });

        videoPlayerCaptionatorTests.asyncTest("NO HTML5: html5Captionator was not initialized", function () {
            expect(1);
            
            setupEnvironment(false);
            
            initVideoPlayer(testOptions1, function (videoPlayer) {
                videoPlayer.events.onViewReady.fire();     
                jqUnit.assertUndefined("html5Captionator has NOT been instantiated", videoPlayer.html5Captionator);
                start();
            });
        });

    });
})(jQuery);
