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
            onCaptionified: null
        }
    });
    
    
    var bindCaptionatorModel = function (that) {
        that.applier.modelChanged.addListener("captions.currentTrack", that.changeCaptions);
        that.applier.modelChanged.addListener("states.displayCaptions", that.displayCaptions);
    };
    
    
    fluid.videoPlayer.html5Captionator.preInit = function (that) {

        // ?? Ask if we need to put those functions as public outside of preInit ??
        
        // hide all captions
        that.hideAllTracks = function () {
            fluid.each(that.container[0].tracks, function (element) {
                element.mode = captionator.TextTrack.OFF;
            });
        };
        
        // show captions depending on which one is on in the model
        that.showCurrentTrack = function (currentTrack) {
            var index = 0; 
            var tracks = that.container[0].tracks;
            fluid.each(that.model.captions.sources, function (element, key) {
                // TODO: We want to have a multi caption support!!!
                if (key === currentTrack) {
                    tracks[index].mode = captionator.TextTrack.SHOWING;
                } else {
                    tracks[index].mode = captionator.TextTrack.OFF;
                }
                
                index = index + 1;
            });
        };
        
        that.displayCaptions = function () {
            if (that.model.states.displayCaptions === true) {
                that.showCurrentTrack(that.model.captions.currentTrack);
            } else {
                that.hideAllTracks();
            }
        };

        that.changeCaptions = function () {
            that.showCurrentTrack(that.model.captions.currentTrack);
        };
    };


    fluid.videoPlayer.html5Captionator.finalInit = function (that) {
        fluid.each(that.options.captions.sources, function (element, key) {
            var trackTag = $("<track />");
            
            trackTag.attr("kind", element.kind);
            trackTag.attr("src", element.src);
            trackTag.attr("type", element.type);
            trackTag.attr("srclang", element.srclang);
            trackTag.attr("label", element.label);
            
            // TODO: We want to have a multi caption support!!!
            if (key === that.options.captions.currentTrack) {
                trackTag.attr("default", true);
            }

            that.container.append(trackTag);
        });

        captionator.captionify(that.container[0]);
        
        bindCaptionatorModel(that);
        that.events.onCaptionified.fire(that);
    };

})(jQuery);
