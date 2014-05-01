/*
Copyright 2013-2014 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/*global jQuery, window, fluid_1_5*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_5 = fluid_1_5 || {};

(function ($, fluid) {

    fluid.defaults("fluid.videoPlayer.showHide", {
        gradeNames: ["fluid.modelRelayComponent", "autoInit", "{showHide}.createModelListenersGrade"],
        model: {
            isShown: {
                // A list of flags (true or false) to define the showing/hiding of any selectors
                // in a component. Example:
                // "scrubber.handle": false
                // "scrubber" is the identifier defined in the option "showHidePath", normally the 
                // unique component name. "handle" is the selector defined in the "scrubber" component.
            }
        },
        modelPrefix: "isShown",

        // The identifier of the component for showing/hiding in the model "isShown" collection,
        // normally the unique component name, or any name as long as it maintains the uniqueness
        // of each component that has the "showHide" grade attached on.
        showHidePath: "",

        invokers: {
            createModelListenersGrade: {
                funcName: "fluid.videoPlayer.showHide.createModelListenersGrade",
                args: ["{showHide}.options.selectors", "{showHide}.options.modelPrefix", "{showHide}.options.showHidePath"]
            }
        }
    });
    
    fluid.videoPlayer.showHide.createModelListenersGrade = function (selectors, modelPrefix, showHidePath) {
        var gradeName = "fluid.videoPlayer.showHide.modelListeners";
        var defaults = {
            modelListeners: {}
        };
        fluid.each(selectors, function (selectorValue, selectorKey) {
            var modelPath = fluid.pathUtil.composePath(
                    fluid.pathUtil.composePath(modelPrefix, showHidePath),
                    selectorKey
                );
            defaults.modelListeners[modelPath] = {
                funcName: "fluid.videoPlayer.showHide.updateVisibility",
                args: ["{showHide}", selectorKey, modelPath]
            };
        });
        fluid.defaults(gradeName, defaults);
        return gradeName;
    };

    fluid.videoPlayer.showHide.updateVisibility = function (that, selectorKey, modelPath) {
        var container = that.locate(selectorKey);
        if (!container) {
            return;
        }

        var showFlag = fluid.get(that.model, modelPath);
        container.toggle(showFlag);
    };

})(jQuery, fluid_1_5);
