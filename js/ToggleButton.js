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


    /*****************************************************************************
        Toggle button subcomponent
        Used for Play, Mute, Fullscreen, Captions, Transcripts
     *****************************************************************************/
    fluid.defaults("fluid.videoPlayer.controllers.toggleButton", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        preInitFunction: "fluid.videoPlayer.controllers.toggleButton.preInit",
        postInitFunction: "fluid.videoPlayer.controllers.toggleButton.postInit",
        finalInitFunction: "fluid.videoPlayer.controllers.toggleButton.finalInit",
        events: {
            onPress: "preventable", // listeners can prevent button from becoming pressed
            onReady: null
        },
        listeners: {
            onPress: {
                listener: "{toggleButton}.requestStateChange",
                priority: "last"
            }
        },
        selectors: {    // Integrators may override this selector
            button: ".flc-videoPlayer-button"
        },
        styles: {
            pressed: "fl-videoPlayer-button-pressed",
            tooltip: "fl-videoPlayer-tooltip"
        },
        model: {},
        modelPath: "pressed",
        // TODO: Strings should be moved out into a single top-level bundle (FLUID-4590)
        strings: {  // Integrators will likely override these strings
            press: "Press",
            release: "Release"
        }
    });

    fluid.videoPlayer.controllers.toggleButton.preInit = function (that) {
        that.requestStateChange = function () {
            that.applier.requestChange(that.options.modelPath, !fluid.get(that.model, that.options.modelPath));
        };
    };

    fluid.videoPlayer.controllers.toggleButton.postInit = function (that) {
        that.requestPress = function () {
            that.applier.requestChange(that.options.modelPath, true);
        };
        that.requestRelease = function () {
            that.applier.requestChange(that.options.modelPath, false);
        };
        that.updatePressedState = function () {
            var button = that.locate("button");
            var pressed = !!fluid.get(that.model, that.options.modelPath);
            button.toggleClass(that.options.styles.pressed, pressed);
            button.attr("aria-pressed", pressed.toString());
        };
        that.enabled = function (state) {
            that.locate("button").prop("disabled", !state);
        };
        that.focus = function () {
            that.locate("button").focus();
        };
    };

    fluid.videoPlayer.controllers.toggleButton.setUpToggleButton = function (that) {
        var toggleButton = that.locate("button");
        toggleButton.attr("role", "button");

        that.tooltip = fluid.tooltip(toggleButton, {
            styles: {
                tooltip: that.options.styles.tooltip
            },
            content: function () {
                return (fluid.get(that.model, that.options.modelPath) ? that.options.strings.release : that.options.strings.press);
            }
        });

        that.updatePressedState();
    };

    fluid.videoPlayer.controllers.toggleButton.bindEventListeners = function (that) {
        that.locate("button").click(function (evt) {
            that.events.onPress.fire(evt);
            return false;
        });

        that.applier.modelChanged.addListener(that.options.modelPath, function (model, oldModel, changeRequest) {
            that.updatePressedState();
        });
    };

    fluid.videoPlayer.controllers.toggleButton.finalInit = function (that) {
        fluid.videoPlayer.controllers.toggleButton.setUpToggleButton(that);
        fluid.videoPlayer.controllers.toggleButton.bindEventListeners(that);
        that.events.onReady.fire(that);
    };

    
})(jQuery);