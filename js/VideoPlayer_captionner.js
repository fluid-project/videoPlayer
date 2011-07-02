//Captions
(function ($) {
    
    var findCaptionForTime = function (that, timeInMillis) {     
        // TODO: This algorithm is totally evil and incorrect.  
        for (var x = that.currentIndice; x < that.captions.length; x++) {
            //we use memoization in order to compute the convertion to milliseconds only once by caption
            if (typeof(that.captions[x].inMilliTime) !== 'number') {
                that.captions[x].inMilliTime = fluid.videoPlayer.captionner.convertToMilli(that.captions[x].inTime);
            }
            if (typeof(that.captions[x].outMilliTime) !== 'number') {
                that.captions[x].outMilliTime = fluid.videoPlayer.captionner.convertToMilli(that.captions[x].outTime);
            }
            var match = that.captions[x];
            if ( match.inMilliTime <= timeInMillis && match.outMilliTime >= timeInMillis) {
                that.currentIndice = x + 1;
                return match; 
            }      
        }
        return null;
    };
    
    var displayCaption = function (that, caption) { 
        caption.container = makeCaption(that,caption).fadeIn("fast","linear");
        that.currentCaptions.push(caption);
    };
    
    var removeCaption = function (that, elt) {
        elt.container.fadeOut("fast", function() {
            elt.container.remove();
        });
        that.currentCaptions.splice(elt, 1);
    };
    
    //creates the container for a caption and adds it to the DOM
    var makeCaption = function (that, caption) {
        var captionElt = $("<div class='flc-videoPlayer-caption-captionText'>" + caption.caption + "</div>");
        captionElt.addClass(that.options.styles.caption);
        captionElt.css(caption.textStyles);
        that.container.append(captionElt); 
        return captionElt;
    };
    
    var bindDOMEvents = function (that) {
        that.video.bind("timeupdate", function () {
            var timeInMillis = Math.round(this.currentTime * 1000);
            that.timeUpdate(timeInMillis);
            
        });
    };
    /**
     * captionner is responsible for displaying captions in a one-at-a-time style.
     * 
     * @param {Object} container the container in which the captions should be displayed
     * @param {Object} options configuration options for the component
     */

    fluid.defaults("fluid.videoPlayer.captionner", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        events: {
            afterScrub: null,
            onReady: null
        }, 
        listeners: {
            afterScrub: "{captionner}.bigTimeUpdate"
        },
        preInitFunction:   "fluid.videoPlayer.captionner.preInit",
        maxCaption: 3, //number max of lines of captions displayed at the same time
        selectors: {
            caption: ".flc-videoPlayer-caption-captionText"
        },
        
        styles: {
            caption: "fl-videoPlayer-caption-captionText"
        }
        
    });
    
    fluid.videoPlayer.captionner.finalInit = function(that) {
        that.events.onReady.fire();
    };
    
    fluid.videoPlayer.captionner.preInit = function(that) {
            //replace the captionIndice at the right place (used when scrubbed for example)
        that.video = that.options.video;
        that.currentCaptions = [];
        that.currentIndice = 0;
        that.captions = (typeof(that.options.captions) === "string") ? JSON.parse(that.options.captions) : that.options.captions;
        //we get the actual captions and get rid of the rest
        
        if (that.captions.captionCollection) {
            that.captions = that.captions.captionCollection;
        }
        that.bigTimeUpdate = function (timeInMillis) {
                fluid.each(that.currentCaptions, function (caption) {
                    removeCaption(that, caption);
                });
            that.currentIndice = 0; //should be enough :)
        };
        
        that.timeUpdate = function (timeInMillis) {
            // Clear out any caption that has hit its end time.
            fluid.each(that.currentCaptions, function(elt) {
                if (timeInMillis >= elt.outMilliTime) {
                    removeCaption(that, elt);
                }
            }); 
            // Display a new caption.
            var nextCaption = findCaptionForTime(that, timeInMillis);
            if (nextCaption && jQuery.inArray(nextCaption, that.currentCaptions) === -1 ) {
                displayCaption(that, nextCaption);
            }
            //if there's too many captions remove the oldest one
            if (that.currentCaptions && that.currentCaptions.length > that.options.maxCaption) {
                removeCaption(that , that.currentCaptions[0]);
            }
         
        };
        bindDOMEvents(that);
        
        return that;
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
   
    fluid.demands("fluid.videoPlayer.captionner",
                  "fluid.videoPlayer.controllers", {
            options: {
                events: {
                    afterScrub: "{controllers}.events.afterScrub"
                }
            }
    });
})(jQuery);
