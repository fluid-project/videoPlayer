//Captions

var fluid_1_4 = fluid_1_4 || {};
(function ($, fluid) {
    //TODO deal when there's no captions!!!!!!!!
    
    var findCaptionForTime = function (that, timeInMillis) {     
        // TODO: This algorithm looks better but there might be even better.
        for (var x = that.model.captions.currentIndice; x < that.model.captions.track.length; x++) {
            //we use memoization in order to compute the convertion to milliseconds only once by caption
            if (typeof (that.model.captions.track[x].inMilliTime) !== 'number') {
                that.model.captions.track[x].inMilliTime = fluid.videoPlayer.captionner.convertToMilli(that.model.captions.track[x].inTime);
            }
            if (typeof (that.model.captions.track[x].outMilliTime) !== 'number') {
                that.model.captions.track[x].outMilliTime = fluid.videoPlayer.captionner.convertToMilli(that.model.captions.track[x].outTime);
            }
            var match = that.model.captions.track[x];
            if (match.inMilliTime <= timeInMillis && match.outMilliTime >= timeInMillis) {
                that.model.captions.currentIndice = x + 1;
                return match; 
            }      
        }
        return null;
    };

    //creates the container for a caption and adds it to the DOM
    var makeCaption = function (that, caption) {
        var captionElt = $("<div class='flc-videoPlayer-caption-captionText'>" + caption.caption + "</div>");
        captionElt.addClass(that.options.styles.caption);
        captionElt.css(caption.textStyles);
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
        elt.container.fadeOut("fast", function () {
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
        
        that.applier.modelChanged.addListener("states.currentTime", that.displayCaptionForTime);
        
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
        finalInitFunction:   "fluid.videoPlayer.captionner.finalInit",
        preInitFunction:   "fluid.videoPlayer.captionner.preInit",
        events: {
            onCaptionnerReady: null
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
            fluid.each(that.model.captions.currentCaptions, function (caption) {
                removeCaption(that, caption);
            });
            
            that.applier.fireChangeRequest({
                path: "captions.currentIndice", 
                value: 0
            });
            return that;
        };
        
        that.displayCaptionForTime = function (time) {
            if (that.model.captions.track) {
                // Display a new caption.
                var timeInMillis = Math.round(that.model.states.currentTime * 1000);
                var nextCaption = findCaptionForTime(that, timeInMillis);
                if (nextCaption !== null && $.inArray(nextCaption, that.model.captions.currentCaptions) === -1) {
                    displayCaption(that, nextCaption);
                }
            }
            return that;
            
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
                removeCaption(that, that.model.currentCaptions[0]);
            }    
        };
    };
    
    fluid.videoPlayer.captionner.finalInit = function (that) {
        createCaptionnerMarkup(that);
        bindCaptionnerModel(that);
        
        that.events.onCaptionnerReady.fire();
    };
    // TODO: This should be removed once capscribe desktop gives us the time in millis in the captions
    // time is in the format hh:mm:ss:mmm
    fluid.videoPlayer.captionner.convertToMilli = function (time) {
        var splitTime = time.split(":");
        var hours = parseFloat(splitTime[0]);
        var mins = parseFloat(splitTime[1]) + (hours * 60);
        var secs = parseFloat(splitTime[2]) + (mins * 60);
        return Math.round(secs * 1000);
    };
    
    fluid.demands("fluid.videoPlayer.captionner", "fluid.videoPlayer", {
        options: {
            model: "{videoPlayer}.model",
            applier: "{videoPlayer}.applier",
            listeners: {
                onCaptionnerReady: "{videoPlayer}.events.onCaptionnerReady.fire"
            }
        }
    });
    
})(jQuery, fluid_1_4);
