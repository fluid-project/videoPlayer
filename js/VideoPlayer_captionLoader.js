/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, window*/

var fluid_1_4 = fluid_1_4 || {};

(function ($, fluid) {
    

    /**
     * captionLoads renders loads from an Js object src element a caption file and converts it to JsonCC.
     * 
     * @param {Object} options configuration options for the comoponent
     * Note: when the caption is loaded by Ajax the event onCaptionsLoaded is fired
     */
    
    fluid.defaults("fluid.videoPlayer.captionLoader", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        finalInitFunction: "fluid.videoPlayer.captionLoader.finalInit",
        events: {
            onReady: null,
            onCaptionsLoaded: null,
            onCaptionsChange: null
        },
        listeners: {
            onCaptionsChange: "{captionLoader}.loadCaptions"
        }
    }); 
    
    fluid.videoPlayer.captionLoader.finalInit = function (that) {
    
        that.setCaptions = function (caps) {
            // Render the caption area if necessary
            that.events.onCaptionsLoaded.fire(caps);
            return that;
        };  
        
        //Creates an ajax query and uses or not a convertor for the captions
        that.loadCaptions = function (caps) {
            if (caps[0].type !== "JSONcc") {
                $.ajax({
                    type: "GET",
                    dataType: "text",
                    url: "/videoPlayer/conversion_service/index.php",
                    data: {
                        cc_result: 0,
                        cc_url: caps[0].src,
                        cc_target: "JSONcc",
                        cc_name: "__no_name"
                    },
                    success: that.setCaptions
                });
            } else {
                $.ajax({
                    type: "GET",
                    dataType: "text",
                    url: caps[0].src,
                    success: that.setCaptions
                });
            }
        };
        
        //if we provided default captions when we created the component
        if  (that.options.captions) {
            that.loadCaptions(that.options.captions);
        }
        
        that.events.onReady.fire();
        
        return that;
    };
    
})(jQuery, fluid_1_4);


