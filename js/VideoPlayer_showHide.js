/*
Copyright 2009 University of Toronto
Copyright 2011 Charly Molter
Copyright 2011-2013 OCAD University

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
    fluid.setLogging(false);

    fluid.defaults("fluid.videoPlayer.showHide", {
        gradeNames: ["fluid.modelComponent", "autoInit"],
        finalInit: "fluid.videoPlayer.showHide.finalInit",
        model: {},
        showHidePath: ""
    });
    
    fluid.videoPlayer.showHide.finalInit = function (that) {
        var modelCollectionName = "showFlags";
        
        that.applier.modelChanged.addListener(modelCollectionName + "." + that.options.showHidePath, function () {
            if (!that.container) return;
            
            var showFlag = fluid.get(that.model, modelCollectionName + "." + that.options.showHidePath) ? true : false;
            
            if (showFlag) {
                that.container.show();
            } else {
                that.container.hide();
            }
        });
    };

})(jQuery);
