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

        var container = ".videoPlayer";

        fluid.setLogging(false);    // disable it not to mess up with FireBug in FF
        var videoPlayerCaptionLoaderTests = new jqUnit.TestCase("HTML5 Video Player Captionator Test Suite");

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

            }
        };
        
        function setupEnvironment(withHtml5) {
            delete fluid.staticEnvironment.browserHtml5;
            
            if (withHtml5) {
                fluid.staticEnvironment.browserHtml5 = fluid.typeTag("fluid.browser.html5");
            }
        }

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
        
        /*
videoPlayerCaptionLoaderTests.asyncTest("Check that html5Captionator rendered in HTML5 browser", function () {
            expect(1);
            
            setupEnvironment(true);
            
            initVideoPlayer(testOptions1, function (videoPlayer) {
                jqUnit.assertEquals("test test", 0, 0);
                
                start();
            });
        });
        
        videoPlayerCaptionLoaderTests.asyncTest("Check that html5Captionator did not render in non HTML5 browser", function () {
            expect(1);
            
            setupEnvironment(false);
            
            initVideoPlayer(testOptions1, function (videoPlayer) {
                jqUnit.assertEquals("test test", 0, 0);
                
                start();
            });
        });
*/

    });
})(jQuery);
