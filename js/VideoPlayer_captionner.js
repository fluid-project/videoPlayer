//Captions
(function ($) {
    
    var findCaptionForTime = function (that, timeInMillis) {     
        // TODO: This algorithm is totally evil and incorrect.  
        for (var x = that.currentIndice; x < that.captions.length; x++) {
            var match = that.captions[x];
            if (fluid.videoPlayer.captionner.convertToMilli(match.inTime) <= timeInMillis && fluid.videoPlayer.captionner.convertToMilli(match.outTime) >= timeInMillis) {
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
    
    var makeCaption = function (that, caption) {
        var captionElt = $("<div class='flc-videoPlayer-caption-captionText'>" + caption.caption_text + "</div>");
        captionElt.addClass(that.options.styles.caption);
        that.container.append(captionElt); 
        return captionElt;
    };
    
    var setupCaptionView = function (that) {
        // that.captions = indexCaptions(that.options.captions);
        // If the captions option isn't a String, we'll assume it consists of the captions themselves.
        that.captions = (typeof(that.options.captions) === "string") ? JSON.parse(that.options.captions) : that.options.captions;
        //normalizeInOutTimes(that.captions);
        
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
    fluid.videoPlayer.captionner = function (container, options) {
        var that = fluid.initView("fluid.videoPlayer.captionner", container, options);
        that.video = that.options.video;
        that.currentCaptions = [];
        that.currentIndice = 0;
        that.timeUpdate = function (timeInMillis) {
            // Clear out any caption that has hit its end time.
            fluid.each(that.currentCaptions, function(elt) {
                if (timeInMillis >= fluid.videoPlayer.captionner.convertToMilli(elt.outTime)) {
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
        
        setupCaptionView(that);
        return that;
    };
    
    fluid.defaults("fluid.videoPlayer.captionner", {
        video: null,
        captions: null,
        maxCaption: 3, //number max of lines of captions displayed at the same time
        selectors: {
            caption: ".flc-videoPlayer-caption-captionText"
        },
        
        styles: {
            caption: "fl-videoPlayer-caption-captionText"
        }
        
    });
    
    // TODO: This should be removed once capscribe desktop gives us the time in millis in the captions
    // time is in the format hh:mm:ss:mmm
    fluid.videoPlayer.captionner.convertToMilli = function (time) {
        var splitTime = time.split(":");
        var hours = parseFloat(splitTime[0]);
        var mins = parseFloat(splitTime[1]) + (hours * 60);
        var secs = parseFloat(splitTime[2]) + (mins * 60);
        return Math.round(secs * 1000);
    };
    
})(jQuery);
