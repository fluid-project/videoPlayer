/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, window*/

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
    
    var renderSources = function (that, video) {
        $.each(that.options.sources, function (idx, source) {
            var renderer = that.options.mediaRenderers[source.type];
            
            if ($.isFunction(renderer)) {
                renderer.apply(that, video, source);
            } else {
                fluid.invokeGlobalFunction(renderer, [that, video, source]);
            }
        });
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

        // Render each media source with its custom renderer, registered by type.
        // TODO: There is a problem with IE throwing an error while rendering the <source> tags.
        // This is a temporary workaround.
        if (!$.browser.msie) {
            renderSources(that, video);
        }
        
        return video;
    };
    
    var renderCaptionArea = function (that) {
        var captionArea = $("<div class='flc-videoPlayer-captionArea fl-player-caption'></div>");
        that.locate("controller").before(captionArea);
        return captionArea;
    };
    
    // TODO: This should be removed once capscribe desktop gives us the time in millis in the captions
    // time is in the format hh:mm:ss:mmm
    var convertToMilli = function (time) {
        var splitTime = time.split(":");
        var hours = parseFloat(splitTime[0]);
        var mins = parseFloat(splitTime[1]) + (hours * 60);
        var secs = parseFloat(splitTime[2]) + (mins * 60);
        return Math.round(secs * 1000);
    };
     
    var normalizeInOutTimes = function (captions) {
        // TODO: This is temporary to work around the difference between capscribe web and capscribe desktop captions
        for (var i = 0; i < captions.length; i++) {
            var cap = captions[i];
            if (!cap.inTimeMilli) {
                cap.inTimeMilli = convertToMilli(cap.inTime);
            }
            if (!cap.outTimeMilli) {
                cap.outTimeMilli = convertToMilli(cap.outTime);
            }
        }
    };
        
    var loadCaptions = function (that) {
        var caps = that.options.captions;
        
        // Bail immediately if we just don't have any captions.
        if (!caps) {
            return;
        }
        
        // Otherwise go and fetch the captions.
        $.ajax({
            type: "GET",
            dataType: "text",
            url: caps,
            success: that.setCaptions
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
        var controller = $("<div class='flc-videoPlayer-controller fl-videoPlayer-controller'></div>");
        that.locate("video").after(controller);
        return controller;
    };
    
    var setupVideoPlayer = function (that) {
        // Render the video element.
        that.video = renderVideoTag(that);
        
        // If we aren't on an HTML 5 video-enabled browser, don't bother setting up the controller or captions.
        if (typeof(window.HTMLMediaElement) === "undefined") {
            return;
        }
        
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
        
        that.setCaptions = function (captions) {
            // If the captions option isn't a String, we'll assume it consists of the captions themselves.
            that.captions = (typeof(captions) === "string") ? JSON.parse(captions) : captions;
            normalizeInOutTimes(that.captions);

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
        
        mediaRenderers: {
            "video/mp4": "fluid.videoPlayer.mediaRenderers.html5SourceTag",
            "video/ogg": "fluid.videoPlayer.mediaRenderers.html5SourceTag",
            "youtube": "fluid.videoPlayer.mediaRenderers.youTubePlayer"
        },
        
        controllerType: "html", // "native", "html", "none" (or null)    
        showCaptions: true
    });
    
    fluid.videoPlayer.mediaRenderers = {
        html5SourceTag: function (videoPlayer, video, mediaSource) {
            var sourceTag = $("<source />");
            sourceTag.attr(mediaSource);
            video.append(sourceTag);
        },
        
        youTubePlayer: function (videoPlayer, video, mediaSource) {
            var placeholder = $("<div/>"),
                id = fluid.allocateSimpleId(placeholder);
            swfobject.embedSWF(mediaSource.src, id, "425", "356", "8");
            video.append(placeholder);
        }
    };
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

(function ($) {

    var renderScrubber = function (that) {
        var scrubber = $("<div class='flc-videoPlayer-controller-scrubber fl-player-scrubber'></div>");
        that.container.append(scrubber);
        return scrubber;
    };
    
    var bindDOMEvents = function (that) {
        var scrubber = that.locate("scrubber");
        var jVideo = $(that.video);
        
        // Setup the scrubber when we know the duration of the video.
        jVideo.bind("durationchange", function () {
            var startTime = that.video.startTime || 0; // FF doesn't implement startTime from the HTML 5 spec.
            scrubber.slider("option", "min", startTime);
            scrubber.slider("option", "max", that.video.duration + startTime);
            scrubber.slider("enable");
        });
        
        // Bind to the video's timeupdate event so we can programmatically update the slider.
        jVideo.bind("timeupdate", function () {
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
                that.video.play();
            } else {
                that.video.pause();
            }
        });
        
        // Bind the Play/Pause button's text status to the HTML 5 video events.
        jVideo.bind("play", function () {
            playButton.text(that.options.strings.pause);
        });
        jVideo.bind("pause", function () {
            playButton.text(that.options.strings.play);
        });
        
        // Enable the Play/Pause button when the video can start playing.
        jVideo.bind("canplay", function () {
            playButton.removeAttr("disabled");
        });
    };
    
    var setupController = function (that) {
        // Render the play button if it's not already there.
        var playButton = that.locate("playButton");
        if (playButton.length === 0) {
            playButton = $("<button class='flc-videoPlayer-controller-play'/>").text(that.options.strings.play);
            that.container.append(playButton);   
        }

        // Render the scrubber if it's not already there.
        var scrubber = that.locate("scrubber");
        if (scrubber.length === 0) {
            scrubber = renderScrubber(that);
        }
                
        // Initially disable the play button and scrubber until the video is ready to go.
        playButton.attr("disabled", "disabled");
        scrubber.slider({unittext: " seconds"}).slider("disable");
        
        bindDOMEvents(that);
    };
    
    /**
     * PlayAndScrubController is a simple video controller containing a play button and a time scrubber.
     * 
     * @param {Object} container the container which this component is rooted
     * @param {Object} options configuration options for the component
     */
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
