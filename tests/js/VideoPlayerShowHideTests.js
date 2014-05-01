/*
Copyright 2013 OCAD University

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

(function ($) {
    $(document).ready(function () {

        jqUnit.module("Video Player Display Config Tests");
    
        var showHideContainer = ".flc-videoPlayer-testContainer";
        
        fluid.registerNamespace("fluid.tests.showHide");
        fluid.defaults("fluid.videoPlayer.testShowHide", {
            gradeNames: ["fluid.viewRelayComponent", "fluid.videoPlayer.showHide", "autoInit"],
            modelListeners: {
                isShown: {
                    listener: "fluid.tests.showHide.checkValue",
                    args: ["{testShowHide}", "{arguments}"]
                }
            },
            showHidePath: "scrubber",
            selectors: {
                testContainer: showHideContainer
            },
            listeners: {
                onCreate: {
                    listener: "fluid.tests.showHide.test",
                    args: ["{testShowHide}"]
                }
            }
        });

        fluid.tests.showHide.expectedValue = undefined;

        fluid.tests.showHide.checkValue = function (testThat, changeRequest) {
            // skip the initial transaction
            if (fluid.tests.showHide.expectedValue !== undefined) {
                jqUnit[fluid.tests.showHide.expectedValue ? "isVisible" : "notVisible"]("When 'isShown' flag is " + fluid.tests.showHide.expectedValue + ", container should" + (fluid.tests.showHide.expectedValue ? "" : " not") + " be visible", $(showHideContainer));
            }
        };

        fluid.tests.showHide.test = function (that) {
            fluid.tests.showHide.expectedValue = true;
            that.applier.change("isShown.scrubber.testContainer", true);

            fluid.tests.showHide.expectedValue = false;
            that.applier.change("isShown.scrubber.testContainer", false);

            fluid.tests.showHide.expectedValue = true;
            that.applier.change("isShown.scrubber.testContainer", true);
        };

        jqUnit.test("hide", function () {
            var that = fluid.videoPlayer.testShowHide(".flc-videoPlayer-showHide");
        });
        
    });
})(jQuery);
