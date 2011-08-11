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
    fluid.setLogging(false);

    var bindKeyboardControl = function (that) {
        var opts = {
            additionalBindings: [{
                modifier: that.options.keyBindings.play.modifier,
                key: that.options.keyBindings.play.key,
                activateHandler: that.play
            }, {
                modifier: that.options.keyBindings.fullscreen.modifier,
                key: that.options.keyBindings.fullscreen.key,
                activateHandler: function () {
                    that.applier.fireChangeRequest({
                        path: "states.fullscreen",
                        value: !that.model.states.fullscreen
                    });
                }
            }, {
                modifier: that.options.keyBindings.captions.modifier,
                key: that.options.keyBindings.captions.key,
                activateHandler: function () {
                    that.applier.fireChangeRequest({
                        path: "states.displayCaptions",
                        value: !that.model.states.displayCaptions
                    });
                }
            },{
                modifier: that.options.keyBindings.volumePlus.modifier,
                key: that.options.keyBindings.volumePlus.key,
                activateHandler: that.incrVolume
            },{
                modifier: that.options.keyBindings.volumeMinus.modifier,
                key: that.options.keyBindings.volumeMinus.key,
                activateHandler: that.decrVolume
            },{
                modifier: that.options.keyBindings.forward.modifier,
                key: that.options.keyBindings.forward.key,
                activateHandler: that.incrTime
            },{
                modifier: that.options.keyBindings.rewind.modifier,
                key: that.options.keyBindings.rewind.key,
                activateHandler: that.decrTime
            }]
        };
        var video = that.locate("video");
        video.fluid("tabbable");
        video.fluid("activatable", [that.play, opts]);
        //Only problem now when navigating in the controller the keyboard shortcuts are not available anymore
        video.focus();
    };
    
    var bindVideoPlayerDOMEvents = function (that) {
        var video = that.locate("video");
        video.click(that.play);
        video.bind("loadedmetadata", function () {
            //that shouldn't be usefull but the video is too big if it's not used
            that.container.css("width", video[0].videoWidth);
            bindKeyboardControl(that);
        });
    };
    
    var bindVideoPlayerModel = function (that) {
        that.applier.modelChanged.addListener("states.fullscreen", that.fullscreen);
        that.applier.modelChanged.addListener("states.canPlay", function() {
            that.events.onViewReady.fire();
            //that.refresh();
        });
    };
    
    
    //This is the default key bindings
    var defaultKeys = {
        play: {
            modifier: $.ui.keyCode.SHIFT,
            key: 80
        },
        captions: {
            modifier: $.ui.keyCode.SHIFT,
            key: 67
        },
        fullscreen: {
            modifier: $.ui.keyCode.SHIFT,
            key: 70
        },
        volumePlus: {
            modifier: $.ui.keyCode.SHIFT,
            key: $.ui.keyCode.UP
        },
        volumeMinus: {
            modifier: $.ui.keyCode.SHIFT,
            key: $.ui.keyCode.DOWN
        },
        forward: {
            modifier: $.ui.keyCode.SHIFT,
            key: $.ui.keyCode.RIGHT
        },
        rewind: {
            modifier: $.ui.keyCode.SHIFT,
            key: $.ui.keyCode.LEFT
        }
    };
    
    /**
     * Video player renders HTML 5 video content and degrades gracefully to an alternative.
     * 
     * @param {Object} container the container in which video and (optionally) captions are displayed
     * @param {Object} options configuration options for the component
     */
    
    fluid.defaults("fluid.videoPlayer", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        preInitFunction: "fluid.videoPlayer.preInit",
        finalInitFunction: "fluid.videoPlayer.finalInit",
        events: {
            afterScrub: null,
            onReadyToLoadCaptions: null,
            onCaptionsLoaded: null,
            onVideoLoaded: null,
            onVolumeChange: null,
            onTimeChange: null,
            onTemplateReady: null,
            onViewReady: null,
            onMediaReady: null,
            onControllersReady: null,
            onCaptionnerReady: null,
            afterTimeChange: null
        }, 
        listeners: {
            onViewReady: "{videoPlayer}.refresh"
        },
        
        components: {
            captionLoader: {
                type: "fluid.videoPlayer.captionLoader",
                container: "{videoPlayer}.container",
                createOnEvent: "onTemplateReady",
                options: {
                    listeners: {
                        onCaptionsLoaded: "{videoPlayer}.onCaptionsLoaded"
                    }
                }
            }
        },
        
        selectors: {
            video: ".flc-videoPlayer-video",
            caption: ".flc-videoPlayer-captionArea",
            controllers: ".flc-videoPlayer-controller"
        },
        
        keyBindings: defaultKeys,
        
        produceTree: "fluid.videoPlayer.produceTree",
        controllerType: "html", // "native", "html", "none" (or null),
                        
        model: {
            states: {
                play: false,
                currentTime: 0,
                totalTime: 0,
                displayCaptions: true,
                fullscreen: false,
                volume: 60,
                canPlay: false
            },
            video: {
                sources: null
            },
            captions: {
                sources: null,
                currentTrack: undefined,
                conversionServiceUrl: "/videoPlayer/conversion_service/index.php",
                maxNumber: 3,
                track: undefined
            }
        },
        templates: {
            videoPlayer: {
                forceCache: true,
                href: "../html/videoPlayer_template.html"
            }
        } 
        
    });
    
    fluid.videoPlayer.produceTree = function (that) {
        var tree = {};
        if (that.model.video.sources) {
            tree.video = {
                decorators: [{
                    type: "fluid",
                    func: "fluid.videoPlayer.media"
                },
                {
                    type: "fluid",
                    func: "fluid.videoPlayer.eventBinderMedia"
                }]
            };
        }
        if (that.options.controllerType === "html") {
            tree.controllers = {
                decorators: [{
                    type: "fluid",
                    func: "fluid.videoPlayer.controllers"
                },
                {
                    type: "fluid",
                    func: "fluid.videoPlayer.eventBinderControllers"
                }]
            };
        } else if (that.options.controllerType === "native") {
            tree.video.decorators.push({
                type: "attrs",
                attributes: {
                    controls: "true"
                }
            });
        }
        tree.caption = {
            decorators: [{
                type: "fluid",
                func: "fluid.videoPlayer.captionner"
            },
            {
                type: "fluid",
                func: "fluid.videoPlayer.eventBinderCaptionner"
            }]
        };
        return tree;
    };

    fluid.videoPlayer.preInit = function (that) {
        that.play = function(ev) {
            that.applier.fireChangeRequest({
                "path": "states.play",
                "value": !that.model.states.play
            });
        };
        
        that.fullscreen = function () {
            // For real fullscreen (only on safari how do I make the difference?)
            /*if ($.browser.webkit) {
                var video = that.locate("video");
                if (that.model.states.fullscreen === true) {
                    video[0].webkitEnterFullscreen();
                } else {
                    video[0].webkitExitFullscreen();
                }
            } else {*/
                if (that.model.states.fullscreen === true) {
                    that.videoWidth = that.container.css("width");
                    that.videoHeight = that.container.css("height");
                    that.container.css({
                        width: window.innerWidth + "px",
                        height: window.innerHeight + "px",
                        left: 0,
                        top: 0,
                        position: "fixed"
                    });
                    that.locate("video").css({
                        width: "100%",
                        height: "100%"
                    });
                } else {
                    var video = that.locate("video");
                    that.container.css({
                        width: video[0].videoWidth,
                        height: video[0].videoHeight,
                        position: "relative"
                    });
                }
            //}
        };
        
        that.incrVolume = function () {
            if (that.model.states.volume < 100) {
                var newVol = (that.model.states.volume + 10) / 100.0;
                that.events.onVolumeChange.fire(newVol <= 1 ? newVol : 1);
            }
        };
        
        that.decrVolume = function () {
            if (that.model.states.volume > 0) {
                var newVol = (that.model.states.volume - 10) / 100.0;
                that.events.onVolumeChange.fire(newVol >= 0 ? newVol : 0);
            }
        };
        
        that.incrTime = function () {
            if (that.model.states.currentTime < that.model.states.totalTime) {
                var newVol = that.model.states.currentTime + that.model.states.totalTime * 0.05;
                that.events.onTimeChange.fire(newVol <= that.model.states.totalTime ? newVol : that.model.states.totalTime);
            }
        };
        
        that.decrTime = function () {
            if (that.model.states.currentTime > 0) {
                var newVol = that.model.states.currentTime - that.model.states.totalTime * 0.05;
                that.events.onTimeChange.fire(newVol >= 0 ? newVol : 0);
            }
        };   
        
        that.refresh = function () {
            that.fullscreen();
        };
    };
    
    fluid.videoPlayer.finalInit = function (that) {
        that.applier = fluid.makeChangeApplier(that.model);
       // Render each media source with its custom renderer, registered by type.
      // If we aren't on an HTML 5 video-enabled browser, don't bother setting up the controller or captions.
        if (!document.createElement('video').canPlayType) {
            return;
        }
        
        fluid.fetchResources(that.options.templates, function (res) {
            for (var key in res) {
                if (res[key].fetchError) {
                    fluid.log("couldn't fetch" + res[key].href);
                    fluid.log("status: " + res[key].fetchError.status +
                    ", textStatus: " + res[key].fetchError.textStatus +
                    ", errorThrown: " + res[key].fetchError.errorThrown);
                } else if (key === "videoPlayer") {
                    that.container.append(res[key].resourceText);
                    that.refreshView();
                    bindVideoPlayerDOMEvents(that);
                    //create all the listeners to the model
                    bindVideoPlayerModel(that);
                }
            }

            that.events.onTemplateReady.fire();
            
        });
        
        return that;
    };
        
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
            videoPlayer.container.append(sourceTag);
            return sourceTag;
        },
        
        youTubePlayer: function (videoPlayer, mediaSource) {
            var placeholder = $("<div/>"),
                id = fluid.allocateSimpleId(placeholder);
            videoPlayer.container.append(placeholder);
            swfobject.embedSWF(mediaSource.src, id, "425", "356", "8");
            return placeholder;
        }
    };
    
    /************************************************
     *      VideoPlayer Event Binders                *
     ************************************************/   
    fluid.defaults("fluid.videoPlayer.eventBinderControllers", {
        gradeNames: ["fluid.eventedComponent", "autoInit"]
    });
    
    fluid.demands("fluid.videoPlayer.eventBinderControllers",
        ["fluid.videoPlayer", "fluid.videoPlayer.controllers"], {
        options: {
            listeners: {
                "{controllers}.events.onTimeChange": "{videoPlayer}.events.onTimeChange.fire",
                "{controllers}.events.onVolumeChange": "{videoPlayer}.events.onVolumeChange.fire",
                "{controllers}.events.afterTimeChange": "{videoPlayer}.events.afterTimeChange.fire"
            }
        }
    });
    
    fluid.defaults("fluid.videoPlayer.eventBinderCaptionner", {
        gradeNames: ["fluid.eventedComponent", "autoInit"]
    });
    
    fluid.demands("fluid.videoPlayer.eventBinderCaptionner",
        ["fluid.videoPlayer.captionner", "fluid.videoPlayer"], {
        options: {
            listeners: {
                "{videoPlayer}.events.onCaptionsLoaded": "{captionner}.resyncCaptions",
                "{videoPlayer}.events.afterTimeChange": "{captionner}.resyncCaptions"
            }
        }
    });
    
    fluid.defaults("fluid.videoPlayer.eventBinderMedia", {
        gradeNames: ["fluid.eventedComponent", "autoInit"]
    });
    
    fluid.demands("fluid.videoPlayer.eventBinderMedia",
        ["fluid.videoPlayer.media", "fluid.videoPlayer"], {
        options: {
            listeners: {
                    "{videoPlayer}.events.onTimeChange": "{media}.setTime",
                    "{videoPlayer}.events.onVolumeChange": "{media}.setVolume",
                    "{videoPlayer}.events.onViewReady": "{media}.refresh"
            }
        }
    });  
    
    //////////////// For future implementation
    //this binds all the events of the videoPlayer to their listeners 
    // That would be the clean way but there is a real issue with contexts
    
    
    /*fluid.defaults("fluid.videoPlayer.eventBinder", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        events: {
            onEventBinderReady: null,
            afterTimeChange: null,
            onCaptionsLoaded: null,
            onTimeChage: null,
            onVolumeChange: null,
            onViewReady:null
        }
    });
    
    fluid.demands("fluid.videoPlayer.eventBinder", 
           "fluid.videoPlayer", {
            options: {
                events: {
                    afterTimeChange: "{controllers}.events.afterTimeChange",
                    onCaptionsLoaded: "{captionLoader}.events.onCaptionsLoaded", 
                    onTimeChange: "{controllers}.events.onTimeChange",
                    onVolumeChange: "{controllers}.events.onVolumeChange",
                    //onVolumeChange: "{videoPlayer}.events.onVolumeChange",
                    onViewReady: "{videoPlayer}.events.onViewReady" 
                },
                listeners: {
                    afterTimeChange: "{captionner}.resyncCaptions",
                    onCaptionsLoaded: "{captionner}.resyncCaptions",
                    onTimeChange: "{media}.setTime",
                    //"{videoPlayer}.events.onTimeChange": "{media}.setTime",
                    onVolumeChange: "{media}.setVolume",
                    //"{videoPlayer}.events.onVolumeChange": "{media}.setVolume",
                    onViewReady: "{media}.refresh",
                }
            }
    });  */ 

})(jQuery, fluid_1_4);
