/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, window*/

var fluid_1_4 = fluid_1_4 || {};

(function ($, fluid) {
    
    var renderSources = function (that) {
        $.each(that.options.sources, function (idx, source) {
            var renderer = that.options.mediaRenderers[source.type];

            if ($.isFunction(renderer)) {
                renderer.apply(that, source);
            } else {
                fluid.invokeGlobalFunction(renderer, [that, source]); 
            }                                      
        });
    };
    
    var injectVideo = function (container, video) {
        video.addClass("flc-videoPlayer-video");
        container.append(video);
    };

    var renderVideo = function (that) {
        var video = that.locate("video");
        
        if ($.browser.msie) {
            // IE is blatantly hostile to the video tag. 
            // If one is found, remove it and replace it with something less awesome.
            video.remove();
            video = $("<div/>");
            injectVideo(that.container, video);
        } else if (video.length === 0) {
            video = $("<video/>");
            injectVideo(that.container, video);
        }

        // Safari seems to show controls if the attribute is present at all, 
        // regardless of its value.
        if (that.options.controllerType === "native") {
            video.attr("controls", "true"); 
        }
        
        return video;
    };

    var bindDOMEvents = function (that) {
        that.video.attr("tabindex", 0);
        
        var playHandler = function (evt) {
            that.togglePlayback();
            that.events.test.fire();
        };
        
        that.video.click(playHandler);
        that.video.fluid("activatable", playHandler);
        
        that.video.bind("loadedmetadata", function () {
            that.container.css("width", that.video[0].videoWidth);
        });
    };
    
    var renderControllerContainer = function (that) {
        var controller = $("<div class='flc-videoPlayer-controller'></div>");
        controller.addClass(that.options.styles.controller);
        that.locate("video").after(controller);
        return controller;
    };
    
    var renderCaptionnerContainer = function (that) {
        var captionArea = $("<div class='flc-videoPlayer-captionArea'></div>");
        captionArea.addClass(that.options.styles.captionArea);
        that.locate("video").after(captionArea);
        return captionArea;
    };
    
    /**
     * Video player renders HTML 5 video content and degrades gracefully to an alternative.
     * 
     * @param {Object} container the container in which video and (optionally) captions are displayed
     * @param {Object} options configuration options for the comoponent
     */
     
    fluid.videoPlayer = function (container, options) {
        var that = fluid.initView("fluid.videoPlayer", container, options);
        that.video = renderVideo(that);
        
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
        
        that.fullscreenToggle = function () {
            if (!that.fullscreen) {
                that.videoWidth = that.container.css("width");
                that.videoHeight = that.container.css("height");
                that.container.css({
                    width: window.innerWidth + "px",
                    height: window.innerHeight + "px",
                    left: 0,
                    top: 0,
                    position: "fixed"
                });
                that.video.css({
                    width: "100%",
                    height: "100%"
                });
            } else {
                that.container.css({
                    width: that.videoWidth,
                    height: that.videoHeight,
                    position: "relative"
                });
            }
            that.fullscreen = !that.fullscreen;
        };
        
        renderSources(that);
        
       // Render each media source with its custom renderer, registered by type.
      // If we aren't on an HTML 5 video-enabled browser, don't bother setting up the controller or captions.
        if (!document.createElement('video').canPlayType) {
            return;
        }

        // Add the controller if required.
        if (that.options.controllerType === "html") {
            var controller = that.locate("controller");
            that.controllerContainer = (controller.length === 0) ? renderControllerContainer(that) : controller;
        }
        
        // Add the captions if required
        if (that.options.captionsAvailable === true) {
            var captionArea = that.locate("captionArea");
            that.captionnerContainer = captionArea.length === 0 ? renderCaptionnerContainer(that) : captionArea;
        }
        fluid.initDependents(that);
        bindDOMEvents(that);
        that.events.onReady.fire();
        return that;
    };
    
    fluid.defaults("fluid.videoPlayer", {
        grades: "fluid.viewComponent",
        events: {
            afterScrub: null,
            onReadyToLoadCaptions: null,
            onReady: null
        },
        
        components: {
            captionView: {
                type: "fluid.videoPlayer.captionner",
                priority: "last",
                container: "{videoPlayer}.captionnerContainer",
                options: {
                    video: "{videoPlayer}.video"   
                }
            },
            captionLoader: {
                type: "fluid.videoPlayer.captionLoader",
                options: {
                    captions: "{videoPlayer}.options.menu.captions.elements"
                }            
            },
            controllers: {
                type: "fluid.videoPlayer.controllers",
                priority: "first",
                container: "{videoPlayer}.controllerContainer",
                options: {
                    video: "{videoPlayer}.video",
                    //languages: "{videoPlayer}.options.languages",
                    selectors: {
                        captionArea: "{videoPlayer}.options.selectors.captionArea"
                    },
                    listeners: {
                        onChangeFullscreen: "{videoPlayer}.fullscreenToggle"
                    },
                    plusAvailable: true
                }
            }
        },
        
        selectors: {
            video: ".flc-videoPlayer-video",
            captionArea: ".flc-videoPlayer-captionArea",
            controller: ".flc-videoPlayer-controller"
        },
        
        styles : {
            controller: "fl-videoPlayer-controller",
            captionArea: "fl-videoPlayer-captionArea"
        },
        
        mediaRenderers: {
            "video/mp4": "fluid.videoPlayer.mediaRenderers.html5SourceTag",
            "video/ogg": "fluid.videoPlayer.mediaRenderers.html5SourceTag",
            "youtube": "fluid.videoPlayer.mediaRenderers.youTubePlayer"
        },
        
        controllerType: "html", // "native", "html", "none" (or null)    
        displayCaptions: true,
        captionsAvailable: true
    });
        
    //returns the time in format hh:mm:ss from a time in seconds 
    fluid.videoPlayer.formatTime = function (time) {
        var fullTime = Math.floor(time);
        var sec = fullTime % 60;
        sec = sec < 10 ? "0" + sec : sec;
        fullTime = Math.floor(fullTime / 60);
        var min = fullTime % 60;
        fullTime = Math.floor(fullTime / 60);
        var ret = "";
        if (fullTime !== 0) {
            ret = fullTime + ":";
        }
        return ret + min + ":" + sec;
    };

    fluid.videoPlayer.mediaRenderers = {
        html5SourceTag: function (videoPlayer, mediaSource) {
            var sourceTag = $("<source />");
            sourceTag.attr(mediaSource);
            videoPlayer.video.append(sourceTag);
            return sourceTag;
        },
        
        youTubePlayer: function (videoPlayer, mediaSource) {
            var placeholder = $("<div/>"),
                id = fluid.allocateSimpleId(placeholder);
            videoPlayer.video.append(placeholder);
            swfobject.embedSWF(mediaSource.src, id, "425", "356", "8");
            return placeholder;
        }
    };
    

})(jQuery, fluid_1_4);

