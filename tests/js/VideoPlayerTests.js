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

        videoPlayerTests.asyncTest("Play button (FLUID-4546)", function () {
            expect(12);
            var vidPlayer = initVideoPlayer({
                listeners: {
                    afterRender: function () {
                        // TODO: this selector should not be hardcoded, but until the controllers
                        // are a valid subcomponent, this is necessary
                        var playButton = $(".flc-videoPlayer-play");
                        jqUnit.assertEquals("There should be exactly one Play button", 1, playButton.length);
                        jqUnit.assertEquals("Play button should have role of 'button'", "button", playButton.attr("role"));
                        jqUnit.assertEquals("Play button should have aria-pressed of 'false' initially", "false", playButton.attr("aria-pressed"));

                        playButton.mouseover(); // tooltip not attached to button until first "used"
                        var tooltipID = playButton.attr("aria-describedby");
                        jqUnit.assertNotEquals("Play button should have aria-describedby referencing the 'tooltip'", -1, tooltipID.indexOf("tooltip"));
                        var tooltip = $("#" + tooltipID);
                        // TODO: These strings should not be hard-coded, but until the controllers
                        // are a valid subcomponent, this is necessary
                        jqUnit.assertEquals("Tooltip should contain 'Play' initially", "Play", tooltip.text());

                        var jVid = $("#video");
                        jqUnit.assertTrue("Initially, video should not be playing", jVid[0].paused);
                        playButton.click();
                        jqUnit.assertFalse("Activating Play button should cause video to play", jVid[0].paused);
                        jqUnit.assertEquals("After click, Play button should have aria-pressed of 'true'", "true", playButton.attr("aria-pressed"));
                        playButton.blur().focus(); // tooltip not updated until 'requested' again
                        jqUnit.assertEquals("After click, Tooltip should contain 'Pause'", "Pause", tooltip.text());

                        playButton.click();
                        jqUnit.assertTrue("Activating Play button again should cause video to pause", jVid[0].paused);
                        jqUnit.assertEquals("Play button should have aria-pressed of 'false' again", "false", playButton.attr("aria-pressed"));
                        playButton.blur().focus();
                        jqUnit.assertEquals("Tooltip should contain 'Play' again", "Play", tooltip.text());

                        start();
                    }
                }
            });
        });

    });
})(jQuery);
