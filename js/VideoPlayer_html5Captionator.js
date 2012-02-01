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
            currentTracks: undefined
        },
        events: {
            onCaptionified: null
        }
    });
    
    
    var bindCaptionatorModel = function (that) {
        that.applier.modelChanged.addListener("captions.currentTracks", that.changeCaptions);
        that.applier.modelChanged.addListener("states.displayCaptions", that.displayCaptions);
    };
    
    
    fluid.videoPlayer.html5Captionator.preInit = function (that) {
        // hide all captions
        that.hideAllTracks = function () {
            fluid.each(that.container.tracks, function (element) {
                element.mode = captionator.TextTrack.OFF;
            });
        };
        
        // show captions depending on which one is on in the model
        that.showCurrentTracks = function (currentTracks) {
            fluid.each(that.container.tracks, function (element) {
                if ($.inArray(element.label, currentTracks) > -1) {
                    element.mode = captionator.TextTrack.SHOWING;
                } else {
                    element.mode = captionator.TextTrack.OFF;
                }
            });
        };
        
        that.displayCaptions = function () {
            if (that.model.states.displayCaptions === true) {
                that.showCurrentTracks(that.model.captions.currentTracks);
            } else {
                that.hideAllTracks();
            }
        };

        that.changeCaptions = function () {
            that.showCurrentTracks(that.model.captions.currentTracks);
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
            
            if ($.inArray(key, that.options.captions.currentTracks) > -1) {
                trackTag.attr("default", true);
            }

            that.container.append(trackTag);
        });

        captionator.captionify(that.container[0]);
        
        bindCaptionatorModel(that);
        that.events.onCaptionified.fire(that);
    };

})(jQuery);
