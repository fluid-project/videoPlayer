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

    /*******************************************************************************
     * Browser type detection: html5 or non-html5.                                 *
     *                                                                             *
     * Add type tags of html5 into static environment for the html5 browsers.      *
     *******************************************************************************/
    fluid.registerNamespace("fluid.browser");

    fluid.browser.html5 = function () {
        // ToDo: The plan is to use mediaElement for the detection of the html5 browser.
        // Needs re-work at the integration of mediaElement.
        var isHtml5Browser = !($.browser.msie && $.browser.version < 9);
        return isHtml5Browser ? fluid.typeTag("fluid.browser.html5") : undefined;
    };

    var features = {
        browserHtml5: fluid.browser.html5()
    };
    
    fluid.merge(null, fluid.staticEnvironment, features);
    
    fluid.hasFeature = function (tagName) {
        return fluid.find(fluid.staticEnvironment, function (value) {
            return value && value.typeName === tagName ? true : undefined;
        });
    };
    
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
            if (key === currentTrack) {
                tracks[index].mode = captionator.TextTrack.SHOWING;
            } else {
                tracks[index].mode = captionator.TextTrack.OFF;
            }
            
            index = index + 1;
        });
    };

    // hide all captions
    fluid.videoPlayer.html5Captionator.preInit = function (that) {
        // Stop before we do anything. Captionator works only in HTML5 browser
        if (!fluid.hasFeature("fluid.browser.html5")) {
            return false;
        }
  
        that.displayCaptions = function () {
            var tracks = that.container[0].tracks;
            if (that.model.states.displayCaptions === true) {
                fluid.videoPlayer.html5Captionator.showCurrentTrack(that.model.captions.currentTrack, tracks, that.model.captions.sources);
            } else {
                fluid.videoPlayer.html5Captionator.hideAllTracks(tracks);
            }
        };

        that.changeCaptions = function () {
            fluid.videoPlayer.html5Captionator.showCurrentTrack(that.model.captions.currentTrack, that.container[0].tracks, that.model.captions.sources);
        };
    };


    fluid.videoPlayer.html5Captionator.finalInit = function (that) {
        // Stop before we do anything. Captionator works only in HTML5 browser
        if (!fluid.hasFeature("fluid.browser.html5")) {
            return false;
        }
        
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
        that.events.onReady.fire(that);
    };

})(jQuery);
