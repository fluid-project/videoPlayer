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
    fluid.setLogging(true);   
    var renderSources = function (that) {
        $.each(that.model.video.sources, function (idx, source) {
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

    //for boolean data from the model fire a changeRequest to change the value
    var toggleChangeRequest = function (that, path, value) {
        that.applier.fireChangeRequest({
            "path": path,
            "value": !value
        });    
    };

    var bindDOMEvents = function (that) {
        
        that.video.attr("tabindex", 0);
        
        that.video.click(function() {
            that.applier.fireChangeRequest({
            "path": "states.play",
            "value": !that.model.states.play
            });
        });
        
       // that.video.fluid(toggleChangeRequest(that, "states.play", that.model.states.play));
        
        that.video.bind("timeupdate", {obj: that.video[0]}, function (ev) {
            that.applier.fireChangeRequest({
                path: "states.currentTime", 
                value: ev.data.obj.currentTime
            });
        });
        
        that.video.bind("durationchange", {obj: that.video[0]}, function (ev) {
            // FF doesn't implement startTime from the HTML 5 spec.
            var startTime = ev.data.obj.startTime || 0;
            that.applier.fireChangeRequest({
                path: "states.totalTime", 
                value: ev.data.obj.duration
            });
            that.applier.fireChangeRequest({
                path: "states.currentTime",
                value: startTime
            });
            that.applier.fireChangeRequest({
                path: "states.startTime",
                value: startTime
            });
        });
        
        that.video.bind("canplay", function () {
            that.applier.fireChangeRequest({
                path: "states.canPlay", 
                value: true
            });
        });
        
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
        that.model.video = that.options.video;
        if (that.options.captions) {
            that.model.captions.sources = that.options.captions.sources || null;
        }
        that.video = renderVideo(that);
        
        renderSources(that);
        
       // Render each media source with its custom renderer, registered by type.
      // If we aren't on an HTML 5 video-enabled browser, don't bother setting up the controller or captions.
        if (!document.createElement('video').canPlayType) {
            return;
        }

        that.applier = fluid.makeChangeApplier(that.model);
        fluid.initDependents(that);

        that.updateTime = function (time) {
            that.video[0].currentTime = time;
        }
        // Add the controller if required.
        if (that.options.controllerType === "html") {
            var controller = that.locate("controller");
            that.controllerContainer = (controller.length === 0) ? renderControllerContainer(that) : controller;
            that.events.onCreateControllerContainer.fire();
        }

        // Add the captions if required
        if (that.model.captions.sources) {
            var captionArea = that.locate("captionArea");
            that.captionnerContainer = captionArea.length === 0 ? renderCaptionnerContainer(that) : captionArea;
            that.events.onCreateCaptionContainer.fire();
        }
        bindDOMEvents(that);
        
        //create all the listeners to the model
        that.applier.modelChanged.addListener("states.play",
            function (model, oldModel, changeRequest) {
            if (that.model.states.play === true) {
                that.video[0].play();
            } else {
                that.video[0].pause();
            }
        });
        
        that.applier.modelChanged.addListener("states.fullscreen", 
            function (model, oldModel, changeRequest) {
                if (that.model.states.fullscreen === false) {
                    that.container.css({
                        width: that.videoWidth,
                        height: that.videoHeight,
                        position: "relative"
                    });
                } else {
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
                }       
        });
        that.applier.modelChanged.addListener("states.volume",
            function (model, oldModel, changeRequest) {
                that.video[0].volume = that.model.states.volume; 
        });
        
        that.events.onReady.fire();
        return that;
    };
    
    fluid.defaults("fluid.videoPlayer", {
        grades: "fluid.viewComponent",
        events: {
            afterScrub: null,
            onReadyToLoadCaptions: null,
            onReady: null,
            onVideoLoaded: null,
            onCreateControllerContainer: null,
            onCreateCaptionContainer: null
        }, 
        listeners: {
            onReady : function() {console.log("videoPlayer");} 
        },
        
        components: {
            eventBinder: {
                type: "fluid.videoPlayer.eventBinder",
                createOnEvent: "onReady"
            },
            captionner: {
                type: "fluid.videoPlayer.captionner",
                container: "{videoPlayer}.captionnerContainer",
                createOnEvent: "onCreateCaptionContainer",
                options: {
                    model: "{videoPlayer}.model",
                    applier: "{videoPlayer}.applier"
                }
            },
            captionLoader: {
                type: "fluid.videoPlayer.captionLoader",
                container: "{videoPlayer}.container",
                options: {
                    model: "{videoPlayer}.model",
                    applier: "{videoPlayer}.applier"
                }
            },
            controllers: {
                type: "fluid.videoPlayer.controllers",
                createOnEvent: "onCreateControllerContainer",
                container: "{videoPlayer}.controllerContainer",
                options: {
                    model: "{videoPlayer}.model",
                    applier: "{videoPlayer}.applier"
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
        controllerType: "html", // "native", "html", "none" (or null),
                        
        model: {
            states: {
                play: false,
                currentTime: 0,
                totalTime: 0,
                displayCaptions: true,
                fullscreen: false,
                volume: 0
            },
            video: {
                sources: null
            },
            captions: {
                sources: null,
                currentTrack: 1,
                conversionServiceUrl: "/videoPlayer/conversion_service/index.php",
                maxNumber: 3,
                track: undefined
            }
        }
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
    
    fluid.defaults("fluid.videoPlayer.eventBinder", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        events: {
            onReady: null
        }, 
        listeners: {
            onReady : function() {console.log("eventbinder");}
        }
    });
    
    //this binds all the events of the videoPlayer to their listeners
    fluid.demands("fluid.videoPlayer.eventBinder", 
        ["fluid.videoPlayer.controllers",
            "fluid.videoPlayer.captionner",
            "fluid.videoPlayer.captionLoader",
            "fluid.videoPlayer"],
        {
            options: {
                listeners: {
                    "{controllers}.times.events.afterScrub": "{captionner}.resyncCaptions",
                    "{captionLoader}.events.onCaptionsLoaded": "{captionner}.resyncCaptions",
                    "{controllers}.times.events.onScrub": "{videoPlayer}.updateTime"
                }
            }
        });
    

})(jQuery, fluid_1_4);

