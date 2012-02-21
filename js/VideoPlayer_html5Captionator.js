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
        finalInitFunction: "fluid.videoPlayer.html5Captionator.finalInit",
        preInitFunction:   "fluid.videoPlayer.html5Captionator.preInit",
        model: {},
        captions: [],
        events: {
            onReady: null
        },
        elPaths: {
            currentCaptions: "currentTracks.captions",
            displayCaptions: "displayCaptions"
        }
    });
    
    
    var bindCaptionatorModel = function (that) {
        that.applier.modelChanged.addListener("model.currentCaptions", that.changeCaptions);
        that.applier.modelChanged.addListener("model.displayCaptions", that.displayCaptions);
    };
    
    // Hide all tracks
    fluid.videoPlayer.html5Captionator.hideAllTracks = function (tracks) {
        fluid.each(tracks, function (element) {
            element.mode = captionator.TextTrack.OFF;
        });
    };
    
    // show captions depending on which one is on in the model
    fluid.videoPlayer.html5Captionator.showCurrentTrack = function (currentCaptions, tracks, captionSources) {
        fluid.each(captionSources, function (element, key) {
            tracks[key].mode = captionator.TextTrack[!($.inArray(key, currentCaptions)) ? "SHOWING" : "OFF"];
        });
    };

    // hide all captions
    fluid.videoPlayer.html5Captionator.preInit = function (that) {
  
        // listener for hiding/showing all captions
        that.displayCaptions = function () {
            var tracks = that.container[0].tracks;
            if (fluid.get(that.model, elPaths.displayCaptions)) {
                fluid.videoPlayer.html5Captionator.showCurrentTrack(fluid.get(that.model, that.options.elPaths.currentCaptions), tracks, that.options.captions);
            } else {
                fluid.videoPlayer.html5Captionator.hideAllTracks(tracks);
            }
        };

        // listener for changed selected currentTrack
        that.changeCaptions = function () {
            fluid.videoPlayer.html5Captionator.showCurrentTrack(fluid.get(that.model, that.options.elPaths.currentCaptions), that.container[0].tracks, that.options.captions);
        };
    };


    fluid.videoPlayer.html5Captionator.finalInit = function (that) {
        var captions = that.options.captions || [];
        var elPaths = that.options.elPaths;
        
        // Before we go any further check if it makes sense to create captionator and bind events
        if(captions.length === 0) {
            return false;
        }
        
        var currentCaptions = fluid.get(that.model, elPaths.currentCaptions) || [];
        
        // If currentTrack is not specified, then default it to the first track
        if (currentCaptions.length === 0) {
            //that.model.currentCaptions.push(0);
            that.applier.requestChange(elPaths.currentCaptions, [0]);
        }
        
        // Start adding tracks to the video tag
        fluid.each(captions, function (element, key) {
            
            var trackTag = $("<track />");
            var attributes = fluid.filterKeys(fluid.copy(element), ["kind", "src", "type", "srclang", "label"], false);

            if (!($.inArray(key, fluid.get(that.model, that.options.elPaths.currentCaptions)))) {
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
