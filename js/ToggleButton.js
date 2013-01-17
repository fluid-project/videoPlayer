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
            onTooltipAttached: null,
            onReady: {
                events: {
                    onCreate: "onCreate",
                    tooltip: "onTooltipAttached"
                },
                args: ["{toggleButton}"]
            }
        },
        selectors: {    // Integrators may override this selector
            button: ".flc-videoPlayer-button",
            label: ".flc-videoPlayer-button-label"
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
        },
        invokers: {
            tooltipContentFunction: {
                funcName: "fluid.toggleButton.tooltipContentFunction",
                args: "{toggleButton}"
            }
        },
        components: {
            tooltip: {
                type: "fluid.tooltip",
                container: "{toggleButton}.dom.button",
                options: {
                    styles: {
                        tooltip: "{toggleButton}.options.styles.tooltip"
                    },
                    listeners: {
                        onAttach: "{toggleButton}.events.onTooltipAttached"
                    }
                }
            }
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
            button.attr("aria-pressed", pressed);

            var labelText = that.tooltipContentFunction(that);
            that.locate("button").attr("aria-label", labelText);
            that.tooltip.updateContent(labelText);
        };

        that.press = function () {
            that.requestStateChange();
            that.events.onPress.fire(that);
            return false;
        };
    };

    fluid.toggleButton.tooltipContentFunction = function (that) {
          return that.options.strings[that.readIndirect("modelPath")? "release": "press"];
    };

    fluid.toggleButton.setUpToggleButton = function (that) {
        that.locate("button").attr("role", "button");
        that.refreshView();
    };

    fluid.toggleButton.bindToggleButtonEvents = function (that) {
        var button = that.locate("button");
        button.click(that.press);

        that.applier.modelChanged.addListener(that.options.modelPath, function () {
            that.refreshView();
        });
    };

    fluid.toggleButton.finalInit = function (that) {
        fluid.toggleButton.setUpToggleButton(that);
        fluid.toggleButton.bindToggleButtonEvents(that);
    };
    
})(jQuery);
