var fluid = fluid || {};

(function ($) {
    
    var replaceWithVideo = function(elementToReplace){
        var contents = elementToReplace.contents();
        var video = $("<video class='flc-videoPlayer-video'></video>");
        video.append(contents);
        elementToReplace.after(video);
        elementToReplace.remove();
        return video;
    };
    
    var renderVideoTag = function (that) {
        var video = that.locate("video");
        
        // If we're not given a video tag, replace it with one.
        if (!video.is("video")) {
            video = replaceWithVideo(video);
        }

        // Safari seems to show controls if the attribute is present at all, 
        // regardless of its value.
        if (that.options.controllerType === "native") {
            video.attr("controls", "true"); 
        }
        
        $.each(that.options.sources, function (idx, source) {
            var sourceTag = $("<source />");
            sourceTag.attr(source);
            video.append(sourceTag);
        });
        
        return video;
    };
    
    var renderCaptionArea = function (that) {
        var captionArea = $("<div class='flc-videoPlayer-captionArea'></div>");
        that.locate("controller").before(captionArea);
        return captionArea;
    };
    
    var loadCaptions = function (that) {
        var caps = that.options.captions;
        
        // Bail immediately if we just don't have any captions.
        if (!caps) {
            return;
        }
        
        // If the captions option isn't a String, we'll assume it consists of the captions themselves.
        if (typeof(caps) !== "string") {
            that.captions = caps;
            return;
        }
        
        var successfulLoadCallback = function (data) {
            that.captions = JSON.parse(data);
            
            // Render the caption area if necessary
            var captionArea = that.locate("captionArea");
            captionArea = captionArea.length === 0 ? renderCaptionArea(that) : captionArea;
            
            // Instantiate the caption view component.
            that.captionView = fluid.initSubcomponent(that, "captionView", [
                captionArea, 
                {
                    video: that.video,
                    captions: that.captions
                }
            ]);
        };
        
        // Otherwise go and fetch the captions.
        $.ajax({
            type: "GET",
            dataType: "text",
            url: caps,
            success: successfulLoadCallback
        });
    };
    
    var bindDOMEvents = function (that) {
        that.video.attr("tabindex", 0);
        
        var playHandler = function (evt) {
            that.togglePlayback();
        };
        
        that.video.click(playHandler);
        that.video.fluid("activatable", playHandler);
    };
    
    var renderControllerContainer = function (that) {
        var controller = $("<div class='flc-videoPlayer-controller'></div>");
        that.locate("video").after(controller);
        return controller;
    };
    
    var setupVideoPlayer = function (that) {
        // Render the video element.
        if (that.options.clearVideoContainer) {
            that.locate("video").empty();
        }
        that.video = renderVideoTag(that);
        
        // Add the controller if required.
        if (that.options.controllerType === "html") {
            var controller = that.locate("controller");
            controller = (controller.length === 0) ? renderControllerContainer(that) : controller;
            that.controller = fluid.initSubcomponent(that, "controller", [controller, {
                video: that.video
            }]);
        }
        
        // Load and render the caption view.
        loadCaptions(that);
        
        bindDOMEvents(that);
    };
    
    /**
     * Video player renders HTML 5 video content and degrades gracefully to an alternative.
     * 
     * @param {Object} container the container in which video and (optionally) captions are displayed
     * @param {Object} options configuration options for the comoponent
     */
    fluid.videoPlayer = function (container, options) {
        var that = fluid.initView("fluid.videoPlayer", container, options);
        
        that.play = function () {
            that.video[0].play();
        };
        
        that.pause = function () {
            that.video[0].pause();    
        };
        
        that.togglePlayback = function () {
            if (that.video[0].paused) {
                that.play();
            } else {
                that.pause();
            }
        };
        
        setupVideoPlayer(that);
        return that;    
    };
    
    fluid.defaults("fluid.videoPlayer", {
        captionView: {
            type: "fluid.videoPlayer.singleCaptionView"
        },
        
        controller: {
            type: "fluid.videoPlayer.playAndScrubController"
        },
        
        selectors: {
            video: ".flc-videoPlayer-video",
            captionArea: ".flc-videoPlayer-captionArea",
            controller: ".flc-videoPlayer-controller"
        },
        
        controllerType: "html", // "native", "html", "none" (or null)    
        showCaptions: true,
        clearVideoContainer: true
    });
})(jQuery);

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
                return match;
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

(function ($) {

    var renderScrubber = function (that) {
        var scrubber = $("<div class='flc-videoPlayer-controller-scrubber'></div>");
        that.container.append(scrubber);
        return scrubber;
    };
    
    var bindDOMEvents = function (that) {
        var scrubber = that.locate("scrubber");
        
        // Setup the controller when the video is ready.
        $(that.video).bind("load", function () {
            scrubber.slider("option", "min", that.video.startTime);
            scrubber.slider("option", "max", that.video.duration + that.video.startTime);
            scrubber.slider("enable");
        });
        
        // Bind to the video's timeupdate event so we can programmatically update the slider.
        $(that.video).bind("timeupdate", function () {
            scrubber.slider("value", that.video.currentTime);    
        });
        
        // Bind the scrubbers slide event to change the video's time.
        that.locate("scrubber").bind("slide", function (evt, ui) {
            that.video.currentTime = ui.value;
        });
        
        // Bind the play button.
        var playButton = that.locate("playButton");
        playButton.click(function () {
            if (that.video.paused) {
                playButton.text(that.options.strings.pause);
                that.video.play();
            } else {
                playButton.text(that.options.strings.play);
                that.video.pause();
            }
        });
    };
    
    var setupController = function (that) {
        if (that.locate("playButton").length === 0) {
            var playButton = $("<button class='flc-videoPlayer-controller-play'></button>");
            playButton.text(that.options.strings.play);
            that.container.append(playButton);   
        }

        var scrubber = that.locate("scrubber");
        if (scrubber.length === 0) {
            scrubber = renderScrubber(that);
        }
        scrubber.slider().slider("disable");
        
        bindDOMEvents(that);
    };
    
    fluid.videoPlayer.playAndScrubController = function (container, options) {
        var that = fluid.initView("fluid.videoPlayer.playAndScrubController", container, options);
        that.video = fluid.unwrap(that.options.video);
        
        setupController(that);
        return that;
    };
    
    fluid.defaults("fluid.videoPlayer.playAndScrubController", {        
        video: null,
        
        selectors: {
            playButton: ".flc-videoPlayer-controller-play",
            scrubber: ".flc-videoPlayer-controller-scrubber"
        },
        
        strings: {
            play: "Play",
            pause: "Pause"
        }
    });

})(jQuery);
