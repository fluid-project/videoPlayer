/*
Copyright 2013 OCAD University

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

    fluid.defaults("fluid.videoPlayer.showHide", {
        gradeNames: ["fluid.modelComponent", "autoInit"],
        finalInit: "fluid.videoPlayer.showHide.finalInit",
        modelPrefix: "isShown",
        model: {
            isShown: {
                // A list of flags (true or false) to define the showing/hiding of any selectors
                // in a component. Example:
                // "scrubber.handle": false
                // "scrubber" is the identifier defined in the option "showHidePath", normally the 
                // unique component name. "handle" is the selector defined in the "scrubber" component.
            }
        },
        // The identifier of the component for showing/hiding in the model "isShown" collection,
        // normally the unique component name, or any name as long as it maintains the uniqueness
        // of each component that has the "showHide" grade attached on.
        showHidePath: ""
    });
    
    fluid.videoPlayer.showHide.finalInit = function (that) {
        fluid.each(that.options.selectors, function (selectorValue, selectorKey) {
            var modelPath = fluid.pathUtil.composePath(
                    fluid.pathUtil.composePath(that.options.modelPrefix, that.options.showHidePath),
                    selectorKey
                );
            
            that.applier.modelChanged.addListener(modelPath, function () {
                var container = that.locate(selectorKey);
                
                if (!container) {
                    return;
                }

                var showFlag = fluid.get(that.model, modelPath);
                
                container[showFlag ? "show" : "hide"]();
            });
        });
    };

})(jQuery);
