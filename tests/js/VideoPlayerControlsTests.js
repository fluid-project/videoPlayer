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

        var videoPlayerControlsTests = new jqUnit.TestCase("Video Player Controls Tests");

        var baseMenuOpts = {
            model: {
                list: [
                    {menuItem: "Klingon"},
                    {menuItem: "Esperanto"},
                    {menuItem: "LOLspeak"},
                    {menuItem: "Elvish"}
                ]
            },
            strings: {
                languageIsOff: "No on is talking",
                turnLanguageOff: "Please stop all the talking"
            }
            
        }

        fluid.tests.initMenu = function (testOpts) {
            var opts = fluid.copy(baseMenuOpts);
            $.extend(true, opts, testOpts);
            return fluid.videoPlayer.controllers.languageMenu("#basic-menu-test", opts);
        };

        videoPlayerControlsTests.asyncTest("Menu: Default configuration", function () {
            var numLangs = baseMenuOpts.model.list.length;
            fluid.setLogging(false);
            // expect (?);
            var testMenu = fluid.tests.initMenu({
                listeners: {
                    onReady: function (that) {
                        var langList = that.locate("menuItem");
                        jqUnit.assertEquals("Menu should have correct number of items (num languages +1)", numLangs + 1, langList.length);
                        jqUnit.assertFalse("Initially, nothing should have 'selected' style", langList.hasClass(that.options.styles.selected));
                        jqUnit.assertEquals("Initially, 'no language' should be the active value", numLangs, that.model.currentTrack);
                        jqUnit.assertTrue("Initially, 'no language' should have the 'active' style", $(langList[numLangs]).hasClass(that.options.styles.active));

                        jqUnit.notVisible("The menu should be hidden initially", that.container);
                        that.show();
                        jqUnit.isVisible("show() shows the menu", that.container);
                        that.hide();
                        jqUnit.notVisible("hide() hides the menu", that.container);

                        that.container.fluid("selectable.select", langList[numLangs]);
                        jqUnit.isVisible("Selecting final item shows menu", that.container);
                        jqUnit.assertTrue("Selecting final item adds 'selected' style to final item", $(langList[numLangs]).hasClass(that.options.styles.selected));
                        jqUnit.assertEquals("Selecting final item does not update active value", numLangs, that.model.currentTrack);

                        that.container.fluid("selectable.select", langList[numLangs - 1]);
                        jqUnit.assertTrue("Changing selection adds 'selected' style to new item", $(langList[numLangs - 1]).hasClass(that.options.styles.selected));
                        jqUnit.assertEquals("Only one item is selected at a time", 1, $(that.options.selectors.menuItem+"."+that.options.styles.selected).length);
                        jqUnit.assertEquals("Selecting final item does not update active value", numLangs, that.model.currentTrack);

                        that.activate(0);
                        jqUnit.assertEquals("Activating an item updates the active value", 0, that.model.currentTrack);
                        jqUnit.assertTrue("Activating an item adds the 'active' style to the item", $(langList[0]).hasClass(that.options.styles.active));
                        jqUnit.assertEquals("Only one item is active at a time", 1, $(that.options.selectors.menuItem+"."+that.options.styles.active).length);
                        jqUnit.assertFalse("Activating an item removes 'selected' style from all items", langList.hasClass(that.options.styles.selected));
                        jqUnit.notVisible("Activating an item hides the menu", that.container);

                        that.show();
                        $(that.locate("menuItem")[1]).click();
                        jqUnit.assertEquals("Clicking an item in the list activates the item", 1, that.model.currentTrack);
                        jqUnit.assertTrue("Clicking an item adds the 'active' style to the item", $(langList[1]).hasClass(that.options.styles.active));
                        jqUnit.assertFalse("Clicking an item removes 'selected' style from all items", langList.hasClass(that.options.styles.selected));
                        jqUnit.notVisible("Clicking an item hides the menu", that.container);

                        // double-check notes on interaction between keyboard selection and hover, and add tests
                        start();
                    }
                }
            });
        });

        videoPlayerControlsTests.asyncTest("Menu: Active language on init", function () {
            var numLangs = baseMenuOpts.model.list.length;
            fluid.setLogging(false);
            // expect (?);
            var testMenu = fluid.tests.initMenu({
                model: {
                    currentTrack: 2
                },
                listeners: {
                    onReady: function (that) {
                        var langList = that.locate("menuItem");
                        jqUnit.assertEquals("Menu should have correct number of items (num languages +1)", numLangs + 1, langList.length);
                        jqUnit.assertEquals("When initialized with a choice, that choice should be the active value", 2, that.model.currentTrack);
                        jqUnit.assertTrue("The active item should have the 'active' style", $(langList[2]).hasClass(that.options.styles.active));

that.show();
that.container.focus();
                        start();
                    }
                }
            });
        });

    });
})(jQuery);
