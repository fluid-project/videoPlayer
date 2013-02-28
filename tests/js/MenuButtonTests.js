/*
Copyright 2012-2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

fluid.registerNamespace("fluid.tests");

(function ($) {
    $(document).ready(function () {

        jqUnit.module("Menu Button Tests");

        /*===================
         * LanguageMenu Tests
         *===================*/
        
        fluid.tests.languageMenuDefaults = fluid.defaults("fluid.videoPlayer.languageMenu");

        var baseMenuOpts = {
            model: {
                activeLanguages: [0],
                showLanguage: false,
                languages: [{
                    srclang: "klingon",
                    label: "Klingo√±"
                }, {
                    srclang: "esperanto",
                    label: "Esp√©ranto"
                }, {
                    srclang: "lolspeak",
                    label: "LOLspeak"
                }, {
                    srclang: "elvish",
                    label: "Elv√Æsh"
                }]
            }
        };

        fluid.tests.initMenu = function (testOpts) {
            var opts = fluid.copy(baseMenuOpts);
            $.extend(true, opts, testOpts);
            return fluid.videoPlayer.languageMenu("#basic-menu-test", opts);
        };

        var verifyActivation = function (actionString, that, activatedIndex) {
            jqUnit.expect(5);
            var menuItems = that.locate("menuItem");
            jqUnit.assertEquals(actionString + " updates the active language", activatedIndex, that.readIndirect("currentLanguagePath")[0]);
            jqUnit.assertTrue(actionString + " adds the 'active' style to the item", $(menuItems[activatedIndex]).hasClass(that.options.styles.active));
            jqUnit.assertEquals("Only one item is active at a time", 1, $(that.options.selectors.menuItem + "." + that.options.styles.active).length);
            jqUnit.assertFalse(actionString + " removes 'selected' style from all items", menuItems.hasClass(that.options.styles.selected));
            jqUnit.notVisible(actionString + " hides the menu", that.container);
        };

        var verifySelection = function (actionString, that, selectedIndex, activeIndex) {
            jqUnit.expect(3);
            var langList = that.locate("menuItem");
            jqUnit.assertTrue(actionString + " adds 'selected' style to the language", $(langList[selectedIndex]).hasClass(that.options.styles.selected));
            jqUnit.assertEquals("Only one item is selected at a time", 1, $(that.options.selectors.menuItem + "." + that.options.styles.selected).length);
            jqUnit.assertTrue(actionString + " leaves 'active' style on the active language", $(langList[activeIndex]).hasClass(that.options.styles.active));
        };

        jqUnit.asyncTest("Language Menu: Default configuration", function () {
            var numLangs = baseMenuOpts.model.languages.length;
            jqUnit.expect(9);
            var testMenu = fluid.tests.initMenu({
                listeners: {
                    onReady: function (that) {
                        var langList = that.locate("language");
                        jqUnit.assertEquals("Menu should have correct number of languages listed", numLangs, langList.length);
                        jqUnit.exists("Menu should have also have the 'show/hide' option", that.locate("showHide"));
                        jqUnit.assertFalse("Initially, nothing should have 'selected' style", langList.hasClass(that.options.styles.selected));
                        jqUnit.assertTrue("Initially, the 'active language' have the 'active' style", $(langList[that.model.activeLanguages[0]]).hasClass(that.options.styles.active));
                        jqUnit.assertEquals("Initially, 'show/hide' option should have the correct text", that.options.strings.showLanguage, that.locate("showHide").text());

                        jqUnit.notVisible("The menu should be hidden by default", that.container);
                        that.showMenu();
                        jqUnit.isVisible("showMenu() shows the menu", that.container);
                        that.hideMenu();
                        jqUnit.notVisible("hideMenu() hides the menu", that.container);

                        that.container.fluid("selectable.select", that.locate("showHide"));
                        verifySelection("Selecting the 'show/hide' option", that, numLangs, 0);

                        that.container.fluid("selectable.select", langList[numLangs - 1]);
                        verifySelection("Selecting a language", that, numLangs - 1, 0);

                        that.applier.modelChanged.addListener("showLanguage", function () {
                            jqUnit.assertEquals("Activating a new language changes the 'show/hide' option text", that.options.strings.hideLanguage, that.locate("showHide").text());
                            that.applier.modelChanged.removeListener("showLanguageChecker");
                        }, "showLanguageChecker");
                        that.activate(1);
                        verifyActivation("Activating a new language", that, 1);

                        that.showMenu();
                        $(that.locate("language")[2]).click();
                        verifyActivation("Clicking a language", that, 2);

                        // double-check notes on interaction between keyboard selection and hover, and add tests
                        jqUnit.start();
                    }
                }
            });
        });

        jqUnit.asyncTest("Language Menu: Custom 'show/hide' option strings", function () {
            var numLangs = baseMenuOpts.model.languages.length;
            jqUnit.expect(2);
            var testStrings = {
                showLanguage: "No one is talking",
                hideLanguage: "Please stop all the talking!"
            };
            var testMenu = fluid.tests.initMenu({
                strings: testStrings,
                listeners: {
                    onReady: function (that) {
                        var langList = that.locate("language");
                        jqUnit.assertEquals("Initially, 'show/hide' option should have the correct custom text", testStrings.showLanguage, that.locate("showHide").text());
                        that.activate(1);
                        jqUnit.assertEquals("Activating an item changes the 'show/hide' option text to the custom text", testStrings.hideLanguage, that.locate("showHide").text());

                        jqUnit.start();
                    }
                }
            });
        });

        /*=======================
         * LanguageControls Tests
         *=======================*/

        var baseLanguageControlsOpts = {
            model: {
                currentTracks: {
                    captions: [0]
                },
                languages: [{
                    srclang: "klingon",
                    label: "Klingoñ"
                }, {
                    srclang: "esperanto",
                    label: "Espéranto"
                }, {
                    srclang: "lolspeak",
                    label: "LOLspeak"
                }, {
                    srclang: "elvish",
                    label: "Elvîsh"
                }],
                displayCaptions: false
            },
            templates: {
                menuButton: {
                    href: "../../html/menuButton_template.html"
                }
            },
            currentLanguagePath: "currentTracks.captions",
            showHidePath: "displayCaptions"
        };

        fluid.tests.initLangControls = function (testOpts) {
            var opts = fluid.copy(baseLanguageControlsOpts);
            $.extend(true, opts, testOpts);
            return fluid.videoPlayer.languageControls("#basic-languageControls-test", opts);
        };

        jqUnit.asyncTest("Language Controls: default functionality", function () {
            var numLangs = baseLanguageControlsOpts.model.languages.length;
            var testControls = fluid.tests.initLangControls({
                listeners: {
                    onReady: {
                        listener: function (that) {
                            jqUnit.expect(10);
                            var langList = that.menu.locate("language");
                            var showHide = $(that.menu.locate("showHide")[0]);
                            var button = that.locate("button");
                            var verifyLanguageState = function (expectedShowText, expectedShowHideFlag) {
                                jqUnit.expect(2);
                                jqUnit.assertEquals("The 'show language' model flag should be " + expectedShowHideFlag, expectedShowHideFlag, fluid.get(that.model, that.options.showHidePath));
                                jqUnit.assertEquals("The 'show language' text should be updated", expectedShowText, showHide.text());
                            };

                            jqUnit.assertEquals("Menu should have correct number of languages listed", numLangs, langList.length);
                            jqUnit.notVisible("Menu should not be visible initially", that.menu.container);
                            verifyLanguageState(that.options.strings.showLanguage, false);

                            jqUnit.assertEquals("Button should have default aria-label", that.button.options.strings.press, button.attr("aria-label"));
                            button.click();
                            jqUnit.isVisible("Clicking the button should show menu", that.menu.container);
                            jqUnit.assertTrue("Buttons state should be released", that.button.model.pressed);
                            jqUnit.assertEquals("Button should have pressed aria-label", that.button.options.strings.release, button.attr("aria-label"));
                            button.click();
                            jqUnit.notVisible("Clicking the button again should hide menu again", that.menu.container);

                            button.click();
                            $(langList[1]).click();
                            jqUnit.notVisible("Show the menu, click a language, menu should hide", that.menu.container);
                            jqUnit.assertEquals("'current langauge' should be updated", 1, fluid.get(that.model, that.options.currentLanguagePath)[0]);
                            verifyLanguageState(that.options.strings.hideLanguage, true);

                            button.click();
                            showHide.click();
                            verifyLanguageState(that.options.strings.showLanguage, false);
                            jqUnit.assertEquals("'current langauge' should be not be changed", 1, fluid.get(that.model, that.options.currentLanguagePath)[0]);

                            button.click();
                            showHide.click();
                            verifyLanguageState(that.options.strings.hideLanguage, true);

                            jqUnit.start();
                        }
                    }
                }
            });
        });

        jqUnit.asyncTest("Language Controls: ARIA", function () {
            jqUnit.expect(8);
            var testControls = fluid.tests.initLangControls({
                listeners: {
                    onReady: {
                        listener: function (that) {
                            var button = that.button.locate("button");
                            var ariaOwns = button.attr("aria-owns");
                            var ariaControls = button.attr("aria-controls");
                            jqUnit.assertTrue("Button should have aria-owns attribute", !!ariaOwns);
                            jqUnit.assertEquals("Button should 'own' menu", that.menu.container.attr("id"), ariaOwns);
                            jqUnit.assertTrue("Button should have aria-haspopup attribute", !!button.attr("aria-haspopup"));
                            jqUnit.assertTrue("Menu should be aria-hidden", that.menu.container.attr("aria-hidden"));
                            jqUnit.assertTrue("Button should have aria-controls attribute", !!ariaControls);
                            jqUnit.assertEquals("Button should aria-controls the menu", that.menu.container.attr("id"), ariaControls);

                            that.menu.showMenu();
                            jqUnit.assertEquals("After show, menu should not be aria-hidden", "false", that.menu.container.attr("aria-hidden"));

                            that.menu.hideMenu();
                            jqUnit.assertEquals("After hide, menu should be aria-hidden", "true", that.menu.container.attr("aria-hidden"));
                            jqUnit.start();                            

                        }
                    }
                }
            });
        });

    });
})(jQuery);
