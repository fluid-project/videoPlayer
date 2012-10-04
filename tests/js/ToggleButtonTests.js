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

        var toggleButtonTests = new jqUnit.TestCase("Toggle Button Tests");

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

        toggleButtonTests.asyncTest("State change", function () {
            expect(3);
            var testComponent = fluid.tests.initToggleButton({
                listeners: {
                    onReady: function (that) {
                        jqUnit.assertEquals("Initial state should be 'false'", false, that.readIndirect("modelPath"));
                        that.requestStateChange();
                        jqUnit.assertEquals("After request for state change, state should be 'true'", true, that.readIndirect("modelPath"));
                        that.requestStateChange();
                        jqUnit.assertEquals("After another request for state change, state should be 'false'", false, that.readIndirect("modelPath"));

                        start();
                    }
                }
            });
        });

        toggleButtonTests.asyncTest("onPress event", function () {
            expect(1);
            var testComponent = fluid.tests.initToggleButton({
                listeners: {
                    onReady: function (that) {
                        var toggleButton = that.locate("button");
                        toggleButton.click();
                    },
                    onPress: function () {
                        jqUnit.assertTrue("onPress event should fire", true);
                        start();
                    }
                }
            });
        });

        toggleButtonTests.asyncTest("Press", function () {
            expect(3);
            var testComponent;
            testComponent = fluid.tests.initToggleButton({
                listeners: {
                    onReady: function (that) {
                        jqUnit.assertEquals("Initial state should be 'false'", false, that.readIndirect("modelPath"));
                        that.press();
                    },
                    onPress: function (that) {
                        jqUnit.assertTrue("onPress event should fire", true);
                        jqUnit.assertEquals("State should change to be 'true'", true, that.readIndirect("modelPath"));
                        start();
                    }
                }
            });
        });

        toggleButtonTests.asyncTest("Default integrated functionality", function () {
            var testComponent = fluid.tests.initToggleButton({
                listeners: {
                    onPress: fluid.tests.onPressEventHandler,
                    onReady: function (that) {
                        var toggleButton = that.locate("button");

                        fluid.testUtils.verifyBasicButtonFunctions(toggleButton, "toggle",
                            fluid.tests.toggleButtonDefaults.strings.press,
                            fluid.tests.toggleButtonDefaults.strings.release,
                            fluid.tests.toggleButtonDefaults.styles.pressed);

                        start();
                    }
                }
            });
        });

        toggleButtonTests.asyncTest("Overriding strings", function () {
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
                        toggleButton.blur();
                        start();
                    }
                }
            });
        });

        var myCustomText = "My custom text to replace default toggleButton's tooltip content behaviour"; 
        fluid.tests.tooltipContentFunction = function () {
            return myCustomText;
        };

        toggleButtonTests.asyncTest("Changing tooltipContentFunction", function () {
            var testStrings = {
                    press: "press me",
                    release: "release me"
                },
                testComponent = fluid.tests.initToggleButton({
                    invokers: {
                        tooltipContentFunction: {
                            funcName: "fluid.tests.tooltipContentFunction"
                        }
                    },
                    strings: testStrings,
                    listeners: {
                        onReady: function (that) {
                            var toggleButton = that.locate("button"),
                                tooltip = fluid.testUtils.getTooltipCheckString(toggleButton, myCustomText);
                            start();
                        }
                    }
                });
        });

    });
})(jQuery);
