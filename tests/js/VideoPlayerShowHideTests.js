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

(function ($) {
    $(document).ready(function () {

        var videoPlayerTranscriptTests = new jqUnit.TestCase("Video Player Display Config Tests");
    
        var container = ".flc-videoPlayer-showHide";
        
        fluid.defaults("fluid.videoPlayer.testShowHide", {
            gradeNames: ["fluid.viewComponent", "fluid.videoPlayer.showHide", "autoInit"],
            showHidePath: "scrubber"
        });
        
        videoPlayerTranscriptTests.test("hide", function () {
            var that = fluid.videoPlayer.testShowHide(container);
            
            jqUnit.isVisible("The container is shown", $(container));
            that.applier.requestChange("showFlags.scrubber", false);
            jqUnit.notVisible("The container is hidden", $(container));
            that.applier.requestChange("showFlags.scrubber", true);
            jqUnit.isVisible("The container is back to be shown", $(container));
        });
        
    });
})(jQuery);
