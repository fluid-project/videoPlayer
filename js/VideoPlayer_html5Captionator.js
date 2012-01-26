/*
Copyright 2009 University of Toronto
Copyright 2011 Charly Molter
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, window, fluid, captionator*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */


(function ($) {

    /********************************************************************
     * HTML5 Captionator                                                *
     * A wrapper component of captionatorjs (http://captionatorjs.com/) *
     * that makes it accessible in the infusion way.                    *
     ********************************************************************/

    fluid.defaults("fluid.videoPlayer.html5Captionator", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        container: null,
        finalInitFunction: "fluid.videoPlayer.html5Captionator.finalInit",
        captions: {
            sources: null,
            currentTrack: undefined
        },
        events: {
            onCaptionified: null
        }
    });

    fluid.videoPlayer.html5Captionator.finalInit = function (that) {
        var trackTag = $("<track />");
        
        for (var key in that.options.captions.sources) {
            var caption = that.options.captions.sources[key];
            
            trackTag.attr("kind", caption.kind);
            trackTag.attr("src", caption.src);
            trackTag.attr("type", caption.type);
            trackTag.attr("srclang", caption.srclang);
            trackTag.attr("label", caption.label);
            
            if ($.inArray(key, that.options.captions.currentTrack) > -1) {
                trackTag.attr("default", true);
            }

            that.container.append(trackTag);
        }

        captionator.captionify(that.container[0]);
        
        that.events.onCaptionified.fire(that);
    };

})(jQuery);
