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
        preInitFunction:   "fluid.videoPlayer.html5Captionator.preInit",
        captions: {
            sources: null,
            currentTrack: undefined
        },
        events: {
            onReady: null
        }
    });
    
    
    var bindCaptionatorModel = function (that) {
        that.applier.modelChanged.addListener("captions.currentTrack", that.changeCaptions);
        that.applier.modelChanged.addListener("states.displayCaptions", that.displayCaptions);
    };
    
    // Hide all tracks
    fluid.videoPlayer.html5Captionator.hideAllTracks = function (tracks) {
        fluid.each(tracks, function (element) {
            element.mode = captionator.TextTrack.OFF;
        });
    };
    
    // show captions depending on which one is on in the model
    fluid.videoPlayer.html5Captionator.showCurrentTrack = function (currentTrack, tracks, sources) {
        var index = 0; 
        fluid.each(sources, function (element, key) {
            // TODO: We want to have a multi caption support!!!
            tracks[index].mode = captionator.TextTrack[key === currentTrack ? "SHOWING" : "OFF"];
            
            ++index;
        });
    };

    // hide all captions
    fluid.videoPlayer.html5Captionator.preInit = function (that) {
  
        // listener for hiding/showing all captions
        that.displayCaptions = function () {
            var tracks = that.container[0].tracks;
            if (that.model.states.displayCaptions) {
                fluid.videoPlayer.html5Captionator.showCurrentTrack(that.model.captions.currentTrack, tracks, that.model.captions.sources);
            } else {
                fluid.videoPlayer.html5Captionator.hideAllTracks(tracks);
            }
        };

        // listener for changed selected currentTrack
        that.changeCaptions = function () {
            fluid.videoPlayer.html5Captionator.showCurrentTrack(that.model.captions.currentTrack, that.container[0].tracks, that.model.captions.sources);
        };
    };


    fluid.videoPlayer.html5Captionator.finalInit = function (that) {
        var captions = that.options.captions || {};
        
        // Before we go any further check if it makes sense to create captionator and bind events
        if(fluid.get(captions, "sources.length") === 0) {
            return false;
        }
        
        var sources = captions.sources || {};
        var currentTrack = captions.currentTrack;
        
        // If currentTrack is not specified, then default it to the first track
        if (!currentTrack || !sources[currentTrack]) {
            var foundKey = fluid.find(sources, function(value, key) {
                return key;
            });
            captions.currentTrack = foundKey;
        }
        
        // Start adding tracks to the video tag
        fluid.each(sources, function (element, key) {
            
            var trackTag = $("<track />");
            var attributes = fluid.filterKeys(fluid.copy(element), ["kind", "src", "type", "srclang", "label"], false);

            // TODO: We want to have a multi caption support in future
            if (key === captions.currentTrack) {
                attributes.default = "true";
            }
            trackTag.attr(attributes);

            that.container.append(trackTag);
        });

        // Create captionator code which will add a captionator div to the HTML
        captionator.captionify(that.container[0]);
        
        bindCaptionatorModel(that);
        that.events.onReady.fire(that);
    };

})(jQuery);
