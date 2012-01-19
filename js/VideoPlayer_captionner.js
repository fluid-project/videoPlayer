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

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */


(function ($) {

    //creates the container for a caption and adds it to the DOM
    var makeCaption = function (that, caption) {
        var captionElt = $("<div class='flc-videoPlayer-caption-captionText'>" + caption.caption + "</div>");
        captionElt.addClass(that.options.styles.caption);
        if (caption.textStyles) {
            captionElt.css(caption.textStyles);
        }
        that.container.append(captionElt); 
        return captionElt;
    };

    var displayCaption = function (that, caption) { 
        caption.container = makeCaption(that, caption).fadeIn("fast", "linear");
        var temp = that.model.captions.currentCaptions;
        temp.push(caption);
        that.applier.fireChangeRequest({
            path: "captions.currentCaptions",
            value: temp
        });
    };

    //delete and undisplay a piece of caption
    var removeCaption = function (that, elt) {
        elt.container.fadeOut("slow", function () {
            elt.container.remove();
        });
        var temp = that.model.captions.currentCaptions;
        temp.splice(elt, 1);
        that.applier.fireChangeRequest({
            path: "captions.currentCaptions",
            value: temp
        });
    };

    var bindCaptionnerModel = function (that) {
        that.applier.modelChanged.addListener("captions.currentCaptions", that.refreshView);
        that.applier.modelChanged.addListener("states.displayCaptions", that.toggleCaptionView);
    };
    
    var createCaptionnerMarkup = function (that) {
        that.toggleCaptionView();
    };

    /**
     * captionner is responsible for displaying captions in a one-at-a-time style.
     * 
     * @param {Object} container the container in which the captions should be displayed
     * @param {Object} options configuration options for the component
     */

    fluid.defaults("fluid.videoPlayer.captionner", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        components: {
            captionnerEventBinder: {
                type: "fluid.videoPlayer.captionner.eventBinder",
                createOnEvent: "onCaptionnerReady"
            }
        },
        finalInitFunction:   "fluid.videoPlayer.captionner.finalInit",
        preInitFunction:   "fluid.videoPlayer.captionner.preInit",
        events: {
            onCaptionnerReady: "{videoPlayer}.events.onCaptionnerReady"
        },
        selectors: {
            caption: ".flc-videoPlayer-caption-captionText"
        },
        styles: {
            caption: "fl-videoPlayer-caption-captionText"
        },
        model: {
            captions: {
                currentCaptions: [],
                currentIndice: 0
            }
        }
    });

    fluid.videoPlayer.captionner.preInit = function (that) {
        that.resyncCaptions = function () {
            //we clean the screen of the captions that were there
            that.container.empty();
            that.applier.fireChangeRequest({
                path: "captions.currentCaptions", 
                value: []
            });
            
            that.applier.fireChangeRequest({
                path: "captions.currentIndice", 
                value: 0
            });
            that.showCaptions();
        };

        that.displayCaptionForInterval = function (trackId) {
            if (that.model.captions.track) {
                // Display a new caption.
                that.applier.requestChange("captions.currentIndice", trackId + 1);
                var nextCaption = that.model.captions.track[trackId];
                if (nextCaption !== null && $.inArray(nextCaption, that.model.captions.currentCaptions) === -1) {
                    displayCaption(that, nextCaption);
                }
            }
            
        };
        
        that.toggleCaptionView = function () {
            if (that.model.states.displayCaptions === true) {
                that.container.fadeIn("fast", "linear");
            } else {
                that.container.fadeOut("fast", "linear");
            }
        };

        that.refreshView = function () {
            // Clear out any caption that has hit its end time.
            var timeInMillis = Math.round(that.model.states.currentTime * 1000);
            fluid.each(that.model.captions.currentCaptions, function (elt) {
                if (timeInMillis >= elt.outMilliTime) {
                    removeCaption(that, elt);
                }
            });

            //if there's too many captions remove the oldest one
            if (that.model.captions.currentCaptions && that.model.captions.currentCaptions.length > that.model.captions.maxNumber) {
                removeCaption(that, that.model.captions.currentCaptions[0]);
            }
        };
        
        that.hideCaptions = function () {
            that.container.hide();
        };
        
        that.showCaptions = function () {
            that.container.show();
        };
    };

    fluid.videoPlayer.captionner.finalInit = function (that) {
        createCaptionnerMarkup(that);
        bindCaptionnerModel(that);

        that.events.onCaptionnerReady.fire(that);
    };

    /*******************************************************************************************
     * Captionner Event Binder: Binds events between components "videoPlayer" and "captionner" *
     *******************************************************************************************/
        
    fluid.defaults("fluid.videoPlayer.captionner.eventBinder", {
        gradeNames: ["fluid.eventedComponent", "autoInit"]
    });

})(jQuery);
