/*
Copyright 2012 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, jQuery, start*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

fluid.registerNamespace("fluid.testUtils");

/* A number of utility functions for testing things common among many controls */

(function ($) {
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

    fluid.testUtils.initVideoPlayer = function (container, options) {
        var opts = fluid.copy(baseOpts);
        $.extend(true, opts, options);

        return fluid.videoPlayer(container, opts);
    };

    fluid.testUtils.initEnhancedVideoPlayer = function (instance, relay) {
        var opts = fluid.copy(baseOpts);
        $.extend(true, instance.options, opts);
        return fluid.videoPlayer.makeEnhancedInstances(instance, relay);
    };

    fluid.testUtils.getTooltipCheckString = function (jEl, expectedText) {
        jqUnit.expect(1);
        jEl.mouseover();
        var tooltip = $("#" + jEl.attr("aria-describedby"));
        jqUnit.assertEquals("Tooltip should contain " + expectedText + " initially", expectedText, tooltip.text());
        return tooltip;
    };

    fluid.testUtils.verifyBasicButtonFunctions = function (buttonEl, name, tooltipReleased, tooltipPressed, stylePressed) {
        jqUnit.expect(12);
        jqUnit.assertEquals("There should be exactly one " + name + " button", 1, buttonEl.length);
        jqUnit.assertEquals(name + " button should have role of 'button'", "button", buttonEl.attr("role"));
        jqUnit.assertEquals(name + " button should have aria-pressed of 'false' initially", "false", buttonEl.attr("aria-pressed"));
        jqUnit.assertFalse(name + " button should not have the 'pressed' style", buttonEl.hasClass(stylePressed));

        var tooltip = fluid.testUtils.getTooltipCheckString(buttonEl, tooltipReleased);
        var tooltipID = buttonEl.attr("aria-describedby");
        jqUnit.assertNotEquals(name + " button should have aria-describedby referencing the 'tooltip'", -1, tooltipID.indexOf("tooltip"));
        jqUnit.assertFalse("After mouseover, " + name + " button should still not have the 'pressed' style", buttonEl.hasClass(stylePressed));

        buttonEl.click();
        jqUnit.assertEquals("After click, " + name + " button should have aria-pressed of 'true'", "true", buttonEl.attr("aria-pressed"));
        jqUnit.assertTrue("While pressed, " + name + " button should have the 'pressed' style", buttonEl.hasClass(stylePressed));
        buttonEl.blur().focus(); // tooltip not updated until 'requested' again
        jqUnit.assertEquals("Tooltip should contain " + tooltipPressed, tooltipPressed, tooltip.text());

        buttonEl.click();
        jqUnit.assertEquals("After another click, " + name + " button should have aria-pressed of 'false' again", "false", buttonEl.attr("aria-pressed"));
        jqUnit.assertFalse(name + " button should not have the 'pressed' style", buttonEl.hasClass(stylePressed));
        buttonEl.blur().focus();
        jqUnit.assertEquals("Tooltip should contain " + tooltipReleased + " again", tooltipReleased, tooltip.text());
    };

})(jQuery);
