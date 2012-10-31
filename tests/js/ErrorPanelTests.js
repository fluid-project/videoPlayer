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

fluid.registerNamespace("fluid.tests");

(function ($) {
    $(document).ready(function () {

        fluid.registerNamespace("fluid.tests");
        
        var errorPanelTests = new jqUnit.TestCase("Error Panel Tests");

        errorPanelTests.asyncTest("Basic functioning", function () {
            var panel = fluid.errorPanel(".panel1", {
                listeners: {
                    onReady: function (that) {
                        jqUnit.notVisible("Initially, error panel should be hidden", ".panel1");
                        jqUnit.exists("Error panel should populated with template", ".panel1 .flc-errorPanel-message");
                        var testStrings = ["string1", "string2"];
                        var expectedString = fluid.stringTemplate(panel.options.strings.messageTemplate, testStrings);
                        panel.show(testStrings);
                        jqUnit.isVisible("After show, error panel should be visible", ".panel1");
                        jqUnit.assertEquals("Panel should contain correct error message", expectedString, $(".panel1 .flc-errorPanel-message").text());

                        panel.hide();
                        jqUnit.notVisible("After hide, error panel should not be visible", ".panel1");

                        testStrings = ["string3", "string4"];
                        expectedString = fluid.stringTemplate(panel.options.strings.messageTemplate, testStrings);
                        panel.show(testStrings);
                        jqUnit.isVisible("After show with new values, error panel should be visible", ".panel1");
                        jqUnit.assertEquals("Panel should contain correct error message", expectedString, $(".panel1 .flc-errorPanel-message").text());

                        panel.show();
                        jqUnit.assertEquals("After show with no values, panel should contain correct error message", panel.options.strings.messageTemplate, $(".panel1 .flc-errorPanel-message").text());
                        start();
                    }
                }
            });
        });

        errorPanelTests.asyncTest("Custom string template", function () {
            var panel = fluid.errorPanel(".panel1", {
                strings: {
                    messageTemplate: "This template has %0 configurable %1"
                },
                listeners: {
                    onReady: function (that) {
                        var testStrings = ["two", "things"];
                        var expectedString = "This template has two configurable things";
                        panel.show(testStrings);
                        jqUnit.assertEquals("Panel should contain correct error message", expectedString, $(".panel1 .flc-errorPanel-message").text());
                        start();
                    }
                }
            });
        });

        errorPanelTests.asyncTest("Interactions", function () {
            jqUnit.expect(3);
            var panel = fluid.errorPanel(".panel0", {
                retryCallback: function () {
                    jqUnit.assertTrue("retry callback is called", true);
                },
                listeners: {
                    onReady: function (that) {
                        panel.show();
                        jqUnit.isVisible("After show, error panel should be visible", ".panel0");

                        $(".panel0 .flc-errorPanel-retryButton").click();

                        $(".panel0 .flc-errorPanel-dismissButton").click();
                        jqUnit.notVisible("After clicking dismiss button, error panel should not be visible", ".panel0");

                        start();
                    }
                }
            });
        });

        errorPanelTests.asyncTest("Custom template (no dismiss)", function () {
            jqUnit.expect(2);
            var panel = fluid.errorPanel(".panel0", {
                templates: {
                    panel: {
                        href: "errorPanel_template_noDismiss.html"
                    }
                },
                retryCallback: function () {
                    jqUnit.assertTrue("retry callback is called", true);
                },
                listeners: {
                    onReady: function (that) {
                        panel.show();
                        jqUnit.isVisible("After show, error panel should be visible", ".panel0");

                        $(".panel0 .flc-errorPanel-retryButton").click();

                        start();
                    }
                }
            });
        });

        errorPanelTests.asyncTest("Custom template (no retry)", function () {
            jqUnit.expect(2);
            var panel = fluid.errorPanel(".panel0", {
                templates: {
                    panel: {
                        href: "errorPanel_template_noRetry.html"
                    }
                },
                listeners: {
                    onReady: function (that) {
                        panel.show();
                        jqUnit.isVisible("After show, error panel should be visible", ".panel0");

                        $(".panel0 .flc-errorPanel-dismissButton").click();
                        jqUnit.notVisible("After clicking dismiss button, error panel should not be visible", ".panel0");

                        start();
                    }
                }
            });
        });

        errorPanelTests.asyncTest("Multiple panels", function () {
            var count = 0;
            var panels = [];
            var testFunction = function (that) {
                if (count === 3) {
                    fluid.each(panels, function (value, key) {
                        jqUnit.notVisible("Initially, error panel should be hidden", ".panel" + key);
                        jqUnit.exists("Error panel should populated with template", ".panel" + key + " .flc-errorPanel-message");
                    });
                    panels[1].show();
                    jqUnit.isVisible("After showing one panel, it should be visible", ".panel1");
                    jqUnit.notVisible("Other panels should not be visible", ".panel0");
                    jqUnit.notVisible("Other panels should not be visible", ".panel2");

                    var testStrings = ["string1", "string2"];
                    var expectedString = fluid.stringTemplate(panels[0].options.strings.messageTemplate, testStrings);
                    panels[0].show(testStrings);
                    jqUnit.assertEquals("After showing another panel with different message, first panel's message should be correct", panels[1].options.strings.messageTemplate, $(".panel1 .flc-errorPanel-message").text());
                    jqUnit.assertEquals("Sirst panel's message should be correct", expectedString, $(".panel0 .flc-errorPanel-message").text());

                    start();
                }
            };
            var panelCount = function (that) {
                count++;
                testFunction(that);
            };
            for (var i = 0; i < 3; i++) {
                panels[i] = fluid.errorPanel(".panel" + i, {
                    listeners: {
                        onReady: panelCount
                    }
                });
            }
        });

    });
})(jQuery);