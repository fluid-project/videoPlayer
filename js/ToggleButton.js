/*
Copyright 2012 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/*global jQuery, window, fluid*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */


(function ($) {

    fluid.defaults("fluid.toggleButton", {
        gradeNames: ["fluid.viewComponent", "fluid.videoPlayer.indirectReader", "autoInit"],
        postInitFunction: "fluid.toggleButton.postInit",
        finalInitFunction: "fluid.toggleButton.finalInit",
        events: {
            onPress: null,
            onReady: null
        },
        selectors: {    // Integrators may override this selector
            button: ".flc-videoPlayer-button"
        },
        styles: {
            init: "fl-videoPlayer-button-init",
            pressed: "fl-videoPlayer-button-pressed",
            tooltip: "fl-videoPlayer-tooltip"
        },
        ownModel: true,
        model: {},
        modelPath: "pressed",
        // TODO: Strings should be moved out into a single top-level bundle (FLUID-4590)
        strings: {  // Integrators will likely override these strings
            press: "Press",
            release: "Release"
        }
    });

    fluid.toggleButton.postInit = function (that) {
        if (that.options.ownModel || that.readIndirect("modelPath") === undefined) {
            that.writeIndirect("modelPath", false);
        }
        that.requestStateChange = function () {
            that.writeIndirect("modelPath", !that.readIndirect("modelPath"));
        };

        that.refreshView = function () {
            var button = that.locate("button");
            var pressed = that.readIndirect("modelPath");
            var styles = that.options.styles;
            if (styles.init === styles.pressed) {
                button.addClass(styles.init);
            } else {
                button.toggleClass(styles.init, !pressed);
                button.toggleClass(styles.pressed, pressed);
            }
            button.prop("aria-pressed", pressed);
        };
        
        that.enabled = function (state) {
            that.locate("button").prop("disabled", !state);
        };
    };

    fluid.toggleButton.setUpToggleButton = function (that) {
        var toggleButton = that.locate("button");
        toggleButton.attr("role", "button");

        that.tooltip = fluid.tooltip(toggleButton, {
            styles: {
                tooltip: that.options.styles.tooltip
            },
            content: function () {
                return that.options.strings[that.readIndirect("modelPath")? "release": "press"];
            }
        });

        that.refreshView();
    };

    fluid.toggleButton.bindToggleButtonEvents = function (that) {
        var button = that.locate("button");
        button.click(function () {
            that.requestStateChange();
            that.events.onPress.fire();
            return false;
        });

        that.applier.modelChanged.addListener(that.options.modelPath, function () {
            that.refreshView();
        });
    };

    fluid.toggleButton.finalInit = function (that) {
        fluid.toggleButton.setUpToggleButton(that);
        fluid.toggleButton.bindToggleButtonEvents(that);
        that.events.onReady.fire(that);
    };
    
})(jQuery);
