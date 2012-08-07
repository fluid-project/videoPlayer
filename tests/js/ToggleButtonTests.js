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

(function ($) {
    $(document).ready(function () {

        var toggleButtonTests = new jqUnit.TestCase("Video Player Controls Tests");

        fluid.tests.toggleButtonDefaults = fluid.defaults("fluid.toggleButton");

        fluid.tests.onPressEventHandler = function () {
            expect(1);
            jqUnit.assertTrue("The onPress event should fire", true);
        };

        var baseToggleButtonOpts = {
            selectors: {
                button: ".test-toggle-button"
            }
        };
        fluid.tests.initToggleButton = function (testOpts) {
            var opts = fluid.copy(baseToggleButtonOpts);
            $.extend(true, opts, testOpts);
            return fluid.toggleButton("#basic-toggle-button-test", opts);
        };

        toggleButtonTests.asyncTest("Toggle button, default functionality", function () {
            expect(3);
            var testComponent = fluid.tests.initToggleButton({
                listeners: {
                    onPress: fluid.tests.onPressEventHandler,
                    onReady: function (that) {
                        var toggleButton = that.locate("button");

                        fluid.testUtils.verifyBasicButtonFunctions(toggleButton, "toggle",
                            fluid.tests.toggleButtonDefaults.strings.press,
                            fluid.tests.toggleButtonDefaults.strings.release,
                            fluid.tests.toggleButtonDefaults.styles.pressed);

                        jqUnit.assertFalse("By default, button should be enabled", toggleButton.prop("disabled"));
                        that.enabled(false);
                        jqUnit.assertTrue("enabled(false) should disable the button", toggleButton.prop("disabled"));
                        that.enabled(true);
                        jqUnit.assertFalse("enabled(true) should re-enable the button", toggleButton.prop("disabled"));

                        start();
                    }
                }
            });
        });


        toggleButtonTests.asyncTest("Toggle button, overriding strings", function () {
            expect(1);
            var testStrings = {
                press: "press me",
                release: "release me"
            };
            var testComponent = fluid.tests.initToggleButton({
                strings: testStrings,
                listeners: {
                    onReady: function (that) {
                        var toggleButton = that.locate("button");
                        var tooltip = fluid.testUtils.getTooltipCheckString(toggleButton, testStrings.press);

                        toggleButton.click();
                        toggleButton.blur().focus(); // tooltip not updated until 'requested' again
                        jqUnit.assertEquals("After click, Tooltip should contain '" + testStrings.release + "'", testStrings.release, tooltip.text());

                        start();
                    }
                }
            });
        });

    });
})(jQuery);
