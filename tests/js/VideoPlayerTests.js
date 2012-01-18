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

        var videoPlayerTests = new jqUnit.TestCase("Video Player Tests");

        var initVideoPlayer = function (testOptions) {
            var opts = {
                model: {
                    video: {
                        sources: [
                            {
                                src: "http://royalgiz.fr/videoplayer/video/Richard.Stallman.mp4",
                                type: "video/mp4"
                            }
                        ]
                    }
                },
                templates: {
                    videoPlayer: {
                        // override the default template path
                        // TODO: We need to refactor the VideoPlayer to better support
                        //       overriding the path without needing to know file names
                        href: "../../html/videoPlayer_template.html"
                    }
                }
            };
            $.extend(true, opts, testOptions);
            return fluid.videoPlayer(".videoPlayer", opts);
        };

        videoPlayerTests.asyncTest("Configurable template path (FLUID-4572): valid path", function () {
            expect(1);
            var vidPlayer = initVideoPlayer({
                listeners: {
                    onTemplateReady: function () {
                        jqUnit.assertTrue("The template should load", true);
                        start();
                    },
                    onTemplateLoadError: function (href) {
                        jqUnit.assertTrue("Template Load Error should not fire", false);
                        start();
                    }
                }
            });
        });

        videoPlayerTests.asyncTest("Configurable template path (FLUID-4572): invalid path", function () {
            expect(1);
            var vidPlayer = initVideoPlayer({
                templates: {
                    videoPlayer: {
                        href: "bad/test/path.html"
                    }
                },
                listeners: {
                    onTemplateReady: function () {
                        jqUnit.assertTrue("The template should not load", false);
                        start();
                    },
                    onTemplateLoadError: function (href) {
                        jqUnit.assertTrue("Event 'onTemplateLoadError' should fire", true);
                        start();
                    }
                }
            });
        });

        function setupEnvironment(withHtml5) {
            delete fluid.staticEnvironment.browserHtml5;
            
            if (withHtml5) {
                fluid.staticEnvironment.browserHtml5 = fluid.typeTag("fluid.browser.html5");
            }
        }
        
        videoPlayerTests.asyncTest("HTML5: video player instantiation with customized controller", function () {
            expect(5);
            
            setupEnvironment(true);
            
            initVideoPlayer({
                controls: "custom",
                listeners: {
                    onReady: function (videoPlayer) {
                        jqUnit.assertNotUndefined("The sub-component media has been instantiated", videoPlayer.media);
                        jqUnit.assertNotUndefined("The sub-component controllers has been instantiated", videoPlayer.controllers);
                        jqUnit.assertNotUndefined("The sub-component captionner has been instantiated", videoPlayer.captionner);
                        jqUnit.assertNotUndefined("The sub-component captionLoader has been instantiated", videoPlayer.captionLoader);
                        jqUnit.assertUndefined("The sub-component browserCompatibility has NOT been instantiated", videoPlayer.browserCompatibility);
                        
                        start();
                    }
                }
            });
        });

        videoPlayerTests.asyncTest("HTML5: video player instantiation with native controller", function () {
            expect(5);
            
            setupEnvironment(true);
            
            initVideoPlayer({
                controls: "native",
                listeners: {
                    onReady: function (videoPlayer) {
                        jqUnit.assertNotUndefined("The sub-component media has been instantiated", videoPlayer.media);
                        jqUnit.assertUndefined("The sub-component controllers has been instantiated", videoPlayer.controllers);
                        jqUnit.assertNotUndefined("The sub-component captionner has been instantiated", videoPlayer.captionner);
                        jqUnit.assertNotUndefined("The sub-component captionLoader has been instantiated", videoPlayer.captionLoader);
                        jqUnit.assertUndefined("The sub-component browserCompatibility has NOT been instantiated", videoPlayer.browserCompatibility);
                        
                        start();
                    }
                }
            });
        });

        videoPlayerTests.asyncTest("HTML5: Controllers instantiation", function () {
            expect(5);
            
            setupEnvironment(true);
            
            initVideoPlayer({
                controls: "custom",
                listeners: {
                    onControllersReady: function (controllers) {
                        jqUnit.assertNotUndefined("The sub-component scrubber has been instantiated", controllers.scrubber);
                        jqUnit.assertNotUndefined("The sub-component volumeControl has been instantiated", controllers.volumeControl);
                        jqUnit.assertNotUndefined("The sub-component captionControls has been instantiated", controllers.captionControls);
                        jqUnit.assertNotUndefined("The sub-component playButton has been instantiated", controllers.playButton);
                        jqUnit.assertNotUndefined("The sub-component fullScreenButton has been instantiated", controllers.fullScreenButton);
                        
                        start();
                    }
                }
            });
        });

        videoPlayerTests.asyncTest("NON-HTML5: video player instantiation", function () {
            expect(5);
            
            setupEnvironment(false);
            
            initVideoPlayer({
                listeners: {
                    onReady: function (videoPlayer) {
                        jqUnit.assertNotUndefined("The sub-component media has been instantiated", videoPlayer.media);
                        jqUnit.assertUndefined("The sub-component controllers has NOT been instantiated", videoPlayer.controllers);
                        jqUnit.assertUndefined("The sub-component captionner has NOT been instantiated", videoPlayer.captionner);
                        jqUnit.assertNotUndefined("The sub-component captionLoader has been instantiated", videoPlayer.captionLoader);
                        jqUnit.assertNotUndefined("The sub-component browserCompatibility has been instantiated", videoPlayer.browserCompatibility);
                        
                        start();
                    }
                }
            });
        });

    });
})(jQuery);
