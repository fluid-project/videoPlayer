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

fluid.registerNamespace("fluid.tests");
fluid.staticEnvironment.vidPlayerTests = fluid.typeTag("fluid.videoPlayerTests");
fluid.staticEnvironment.vidPlayerTests2 = fluid.typeTag("fluid.videoPlayerTests2");

(function ($) {
    $(document).ready(function () {

        fluid.setLogging(true);

        fluid.tests.pressEventHandler = function (state) {
            jqUnit.assertTrue("The onPress event should fire", true);
        };

        var videoPlayerControlsTests = new jqUnit.TestCase("Video Player Controls Tests");

        var baseOpts = {
            selectors: {
                button: ".test-toggle-button"
            }
        };

        fluid.tests.initToggleButton = function (testOpts) {
            var opts = fluid.copy(baseOpts);
            $.extend(true, opts, testOpts);
            return fluid.videoPlayer.controllers.toggleButton("#basic-toggle-button-test", opts);
        };

        videoPlayerControlsTests.asyncTest("Configurable template path (FLUID-4572): valid path", function () {
            expect(11);

            var toggleButtonDefaults = fluid.defaults("fluid.videoPlayer.controllers.toggleButton");
            var testComponent = fluid.tests.initToggleButton({
                listeners: {
                    onPress: fluid.tests.pressEventHandler,
                    onReady: function (that) {
                        var toggleButton = $(baseOpts.selectors.button);
                        jqUnit.assertEquals("There should be exactly one toggle button", 1, toggleButton.length);
                        jqUnit.assertEquals("Toggle button should have role of 'button'", "button", toggleButton.attr("role"));
                        jqUnit.assertEquals("Toggle button should have aria-pressed of 'false' initially", "false", toggleButton.attr("aria-pressed"));

                        toggleButton.mouseover();
                        var tooltipID = toggleButton.attr("aria-describedby");
                        jqUnit.assertNotEquals("Toggle button should have aria-describedby referencing the 'tooltip'", -1, tooltipID.indexOf("tooltip"));
                        var tooltip = $("#" + tooltipID);
                        jqUnit.assertEquals("Tooltip should contain '"+toggleButtonDefaults.strings.press+"' initially", toggleButtonDefaults.strings.press, tooltip.text());

                        toggleButton.click();
                        jqUnit.assertEquals("After click, toggle button should have aria-pressed of 'true'", "true", toggleButton.attr("aria-pressed"));
                        toggleButton.blur().focus(); // tooltip not updated until 'requested' again
                        jqUnit.assertEquals("After click, Tooltip should contain '"+toggleButtonDefaults.strings.release+"'", toggleButtonDefaults.strings.release, tooltip.text());

                        toggleButton.click();
                        jqUnit.assertEquals("After another click, toggle button should have aria-pressed of 'false' again", "false", toggleButton.attr("aria-pressed"));
                        toggleButton.blur().focus();
                        jqUnit.assertEquals("Tooltip should contain '"+toggleButtonDefaults.strings.press+"' again", toggleButtonDefaults.strings.press, tooltip.text());

                        start();
                    }
                }
            });


/*
        var runToggleButtonTests = function (testFunc) {
            // load the template that the controls need
            fluid.fetchResources({
                videoPlayer: {
                    forceCache: true,
                    href: "../../html/videoPlayer_template.html"
                }
            }, testFunc);
        };

        runToggleButtonTests(function (resourceSpec) {
            // inject the template into the DOM
            $("#main").html(resourceSpec.videoPlayer.resourceText);

            // run the tests
            videoPlayerControlsTests.asyncTest("Configurable template path (FLUID-4572): valid path", function () {
                expect(11);


                var toggleButton = fluid.tests.initToggleButton({
                    listeners: {
                        onPress: pressEventHandler,
                        onReady: function (that) {
                            // TODO: this selector should not be hardcoded, but until the controllers
                            // are a valid subcomponent, this is necessary
                            var toggleButton = $(baseOpts.selectors.button);
                            jqUnit.assertEquals("There should be exactly one Play button", 1, toggleButton.length);
                            jqUnit.assertEquals("Play button should have role of 'button'", "button", toggleButton.attr("role"));
                            jqUnit.assertEquals("Play button should have aria-pressed of 'false' initially", "false", toggleButton.attr("aria-pressed"));
    
                            toggleButton.mouseover();
                            var tooltipID = toggleButton.attr("aria-describedby");
                            jqUnit.assertNotEquals("Play button should have aria-describedby referencing the 'tooltip'", -1, tooltipID.indexOf("tooltip"));
                            var tooltip = $("#" + tooltipID);
                            // TODO: These strings should not be hard-coded, but until the controllers
                            // are a valid subcomponent, this is necessary
                            jqUnit.assertEquals("Tooltip should contain 'Play' initially", "Play", tooltip.text());
    
                            toggleButton.click();
                            jqUnit.assertEquals("After click, Play button should have aria-pressed of 'true'", "true", toggleButton.attr("aria-pressed"));
                            toggleButton.blur().focus(); // tooltip not updated until 'requested' again
                            jqUnit.assertEquals("After click, Tooltip should contain 'Pause'", "Pause", tooltip.text());
    
                            toggleButton.click();
                            jqUnit.assertEquals("Play button should have aria-pressed of 'false' again", "false", toggleButton.attr("aria-pressed"));
                            toggleButton.blur().focus();
                            jqUnit.assertEquals("Tooltip should contain 'Play' again", "Play", tooltip.text());
                            
                            start();
                        }
                    }
                });
            });
*/
        });
    });
})(jQuery);
