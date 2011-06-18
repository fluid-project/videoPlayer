//Captions
(function ($) {
    var indexCaptions = function (captions) {
        var indexedCaptions = [];
        $.each(captions, function (idx, caption) {
            indexedCaptions[caption.inTimeMilli] = caption; 
        });
        return indexedCaptions;
    };
    
    var clearCurrentCaption = function (that) {
        that.container.empty();
        that.currentCaption = null;
    };
    
    var findCaptionForTime = function (that, timeInMillis) {     
        // TODO: This algorithm is totally evil and incorrect.
        var timeRange = {
            lower: timeInMillis - 333,
            upper: timeInMillis + 333
        };
        
        for (var x = timeRange.lower; x <= timeRange.upper; x++) {
            var match = that.captions[x];
            if (match) {
                if (match.inTimeMilli <= x && match.outTimeMilli >= x) {
                    return match; 
                }      
            }
        }
        
        return null;
    };
    
    var displayCaption = function (that, caption) {
        that.currentCaption = caption;
        that.container.text(caption.caption_text);
    };
    
    var setupCaptionView = function (that) {
        that.captions = indexCaptions(that.options.captions);
        
        that.video.bind("timeupdate", function () {
            var timeInMillis = Math.round(this.currentTime * 1000);
            that.timeUpdate(timeInMillis);
        });
    };
    
    /**
     * SingleCaptionView is responsible for displaying captions in a one-at-a-time style.
     * 
     * @param {Object} container the container in which the captions should be displayed
     * @param {Object} options configuration options for the component
     */
    fluid.videoPlayer.singleCaptionView = function (container, options) {
        var that = fluid.initView("fluid.videoPlayer.singleCaptionView", container, options);
        that.video = that.options.video;
        that.currentCaption = null;
        
        that.timeUpdate = function (timeInMillis) {
            // Clear out any caption that has hit its end time.
            if (that.currentCaption && timeInMillis >= that.currentCaption.outTimeMilli) {
                clearCurrentCaption(that);
            }
            
            // Display a new caption.
            var nextCaption = findCaptionForTime(that, timeInMillis);
            if (nextCaption) {
                displayCaption(that, nextCaption);
            }
        };
        
        setupCaptionView(that);
        return that;
    };
    
    fluid.defaults("fluid.videoPlayer.singleCaptionView", {
        video: null,
        captions: null
    });
    
})(jQuery);
