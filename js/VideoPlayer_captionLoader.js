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

/*global jQuery, window, fluid*/


(function ($) {
    /**
     * captionLoader renders loads from an Js object src element a caption file and converts it to JsonCC.
     * 
     * @param {Object} options configuration options for the comoponent
     * Note: when the caption is loaded by Ajax the event onCaptionsLoaded is fired
     */
    var bindCaptionLoaderModel = function (that) {
        that.applier.modelChanged.addListener("captions.currentTrack", that.loadCaptions);
    };

    fluid.defaults("fluid.videoPlayer.captionLoader", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        finalInitFunction: "fluid.videoPlayer.captionLoader.finalInit",
        preInitFunction: "fluid.videoPlayer.captionLoader.preInit",
        events: {
            onReady: null,
            onCaptionsLoaded: null
        }
    });
    
    fluid.videoPlayer.captionLoader.preInit = function (that) {
        that.setCaptions = function (captions) {
            // Render the caption area if necessary
            captions = (typeof (captions) === "string") ? JSON.parse(captions) : captions;
            //we get the actual captions and get rid of the rest
            if (captions.captionCollection) {
                captions = captions.captionCollection;
            }
            
            that.applier.fireChangeRequest({
                path: "captions.track",
                value: captions
            });
            that.events.onCaptionsLoaded.fire(captions);
            return that;
        };  
        
        //Creates an ajax query and uses or not a convertor for the captions
        that.loadCaptions = function () {
            var caps = that.model.captions.sources[that.model.captions.currentTrack];
            if (caps.type !== "JSONcc") {
                $.ajax({
                    type: "GET",
                    dataType: "text",
                    url: that.model.captions.conversionServiceUrl,
                    data: {
                        cc_result: 0,
                        cc_url: caps.src,
                        cc_target: "JSONcc",
                        cc_name: "__no_name"
                    },
                    success: that.setCaptions
                });
            } else {
                $.ajax({
                    type: "GET",
                    dataType: "text",
                    url: caps.src,
                    success: that.setCaptions
                });
            }
        };
    };
    
    fluid.videoPlayer.captionLoader.finalInit = function (that) {
        bindCaptionLoaderModel(that);
        //if we provided default captions when we created the component we load it
        if (that.model.captions.sources && that.model.captions.currentTrack) {
            that.loadCaptions();
        } else {
            that.applier.fireChangeRequest({
                path: "states.displayCaptions",
                value: false
            });
        }
        that.events.onReady.fire();
        return that;
    };

    fluid.demands("fluid.videoPlayer.captionLoader", "fluid.videoPlayer", {
        options: {
            model: "{videoPlayer}.model",
            applier: "{videoPlayer}.applier"
        }
    });    
})(jQuery);


