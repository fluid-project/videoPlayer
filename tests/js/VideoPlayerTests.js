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
                }
            };
            $.extend(true, opts, testOptions);
            return fluid.videoPlayer(".videoPlayer", opts);
        };

        videoPlayerTests.asyncTest("Configurable template path (FLUID-4572): valid path", function () {
            expect(1);
            var vidPlayer = initVideoPlayer({
                templatePath: "../../html/",
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
            var badTestPath = "foo.bar/";
            var vidPlayer = initVideoPlayer({
                templatePath: badTestPath,
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
    });
})(jQuery);
