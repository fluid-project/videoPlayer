/*
Copyright 2009 University of Toronto
Copyright 2011 Charly Molter
Copyright 2011-2012 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/*global jQuery, window, fluid*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */


(function ($) {
    fluid.setLogging(false);

    /*******************************************************************************
     * Browser type detection: html5 or non-html5.                                 *
     *                                                                             *
     * Add type tags of html5 into static environment for the html5 browsers.      *
     *******************************************************************************/
    fluid.registerNamespace("fluid.browser");

    fluid.browser.html5 = function () {
        // ToDo: The plan is to use mediaElement for the detection of the html5 browser.
        // Needs re-work at the integration of mediaElement.
        var isHtml5Browser = !($.browser.msie && $.browser.version < 9);
        return isHtml5Browser ? fluid.typeTag("fluid.browser.html5") : undefined;
    };

    var features = {
        browserHtml5: fluid.browser.html5()
    };
    
    fluid.merge(null, fluid.staticEnvironment, features);
    
    fluid.hasFeature = function (tagName) {
        return fluid.find(fluid.staticEnvironment, function (value) {
            return value && value.typeName === tagName ? true : undefined;
        });
    };

    
    /*******************************************************************************
     * Video Player                                                                *
     *                                                                             *
     * Renders HTML 5 video player at the detection of HTML5 browsers. It degrades * 
     * gracefully to the browser built-in video player when the browser does not   *
     * support HTML5.                                                              * 
     *******************************************************************************/
    
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
        components: {
            media: {
                type: "fluid.videoPlayer.media",
                container: "{videoPlayer}.dom.video",
                createOnEvent: "onCreateMediaReady",
                priority: "first",
                options: {
                    model: "{videoPlayer}.model",
                    applier: "{videoPlayer}.applier",
                    events: {
                        onMediaReady: "{videoPlayer}.events.onMediaReady"
                    }
                }
            },
            controllers: {
                type: "fluid.videoPlayer.controllers",
                container: "{videoPlayer}.dom.controllers",
                createOnEvent: "onCreateControllersReady",
                options: {
                    model: "{videoPlayer}.model",
                    applier: "{videoPlayer}.applier",
                    events: {
                        onControllersReady: "{videoPlayer}.events.onControllersReady",
                        onVolumeChange: "{videoPlayer}.events.onVolumeChange",
                        onStartScrub: "{videoPlayer}.events.onStartScrub",
                        onScrub: "{videoPlayer}.events.onScrub",
                        afterScrub: "{videoPlayer}.events.afterScrub"
                    }
                }
            },
            captionner: {
                type: "fluid.videoPlayer.captionner",
                container: "{videoPlayer}.dom.caption",
                createOnEvent: "onCreateCaptionnerReady",
                options: {
                    model: "{videoPlayer}.model",
                    applier: "{videoPlayer}.applier"
                }
            },
            captionLoader: {
                type: "fluid.videoPlayer.captionLoader",
                container: "{videoPlayer}.container",
                createOnEvent: "onReadyToLoadCaptions",
                options: {
                    model: "{videoPlayer}.model",
                    applier: "{videoPlayer}.applier",
                    events: {
                        onReady: "{videoPlayer}.events.onCreateCaptionnerReady",
                        onCaptionsLoaded: "{videoPlayer}.events.onCaptionsLoaded"
                    }
                }
            },
            browserCompatibility: {
                type: "demo.html5BackwardsCompatability",
                createOnEvent: "onOldBrowserDetected"
            },
            intervalEventsConductor: {
                type: "fluid.videoPlayer.intervalEventsConductor",
                createOnEvent: "onCaptionsLoaded",
                options: {
                    components: {
                        html5MediaTimer: {
                            type: "fluid.videoPlayer.html5MediaTimer",
                            options: {
                                mediaElement: "{media}.container"
                            }
                        }
                    },
                    intervalList: "{captionLoader}.options.intervalList",
                    events: {
                        onTimeChange: "{videoPlayer}.events.onTimeChange",
                        onIntervalChange: "{videoPlayer}.events.onIntervalChange"
                    }
                }
            }
        },
        preInitFunction: "fluid.videoPlayer.preInit",
        postInitFunction: "fluid.videoPlayer.postInit",
        finalInitFunction: "fluid.videoPlayer.finalInit",
        events: {
            onReadyToLoadCaptions: null,
            onCaptionsLoaded: null,
            onVolumeChange: null,
            onScrub: null,
            onTemplateReady: null,
            onViewReady: null,
            onMediaReady: null,
            onControllersReady: null,
            onCaptionnerReady: null,
            afterScrub: null,
            onStartScrub: null,
            onOldBrowserDetected: null,
            onTemplateLoadError: null,
            onReady: null,
            
            // public, time events
            onTimeChange: null,
            onIntervalChange: null,
            
            // The following events are private
            onCreateControllersReady: null,
            onCreateMediaReady: null,
            onCreateCaptionnerReady: null
        },
        listeners: {
            onViewReady: "{videoPlayer}.fullscreen"
        },
        selectors: {
            videoContainer: ".flc-videoPlayer-videoContainer",
            video: ".flc-videoPlayer-video",
            caption: ".flc-videoPlayer-captionArea",
            controllers: ".flc-videoPlayer-controller"
        },
        strings: {
            captionsOff: "Captions OFF",
            turnCaptionsOff: "Turn Captions OFF"
        },
        selectorsToIgnore: ["videoContainer", "caption"],
        keyBindings: defaultKeys,
        produceTree: "fluid.videoPlayer.produceTree",
        controls: "custom",
        model: {
            states: {
                play: false,
                currentTime: 0,
                totalTime: 0,
                displayCaptions: true,
                fullscreen: false,
                volume: 60,
                muted: false,
                canPlay: false
            },
            video: {
                sources: null
            },
            captions: {
                selection: "none",
                choices: [],
                names: [],
                show: false,
                sources: null,
                conversionServiceUrl: "/videoPlayer/conversion_service/index.php",
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
            }, {
                modifier: that.options.keyBindings.volumePlus.modifier,
                key: that.options.keyBindings.volumePlus.key,
                activateHandler: that.incrVolume
            }, {
                modifier: that.options.keyBindings.volumeMinus.modifier,
                key: that.options.keyBindings.volumeMinus.key,
                activateHandler: that.decrVolume
            }, {
                modifier: that.options.keyBindings.forward.modifier,
                key: that.options.keyBindings.forward.key,
                activateHandler: that.incrTime
            }, {
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
        video.click(function (ev) {
            ev.preventDefault();
            that.play();
        });
        video.bind("loadedmetadata", function () {
            //that shouldn't be usefull but the video is too big if it's not used
            that.container.css("width", video[0].videoWidth);
            bindKeyboardControl(that);
        });
    };

    var bindVideoPlayerModel = function (that) {
        that.applier.modelChanged.addListener("states.fullscreen", that.fullscreen);
        that.applier.modelChanged.addListener("states.canPlay", function () {
            that.events.onViewReady.fire();
        });
    };

    fluid.videoPlayer.produceTree = function (that) {
        var tree = {};
        
        if (fluid.hasFeature("fluid.browser.html5") && that.options.controls === "native") {
            // Use browser built-in video player
            tree.video = {
                decorators: [{
                    type: "attrs",
                    attributes: {
                        controls: "true"
                    }
                }]
            };
        } else if (that.canRenderMedia(that.model.video.sources)) {
            // Keep the selector to render "fluid.videoPlayer.media"
            that.options.selectorsToIgnore.push("video");
        }
        
        // Keep the selector to render "fluid.videoPlayer.controllers"
        if (that.canRenderControllers(that.options.controls)) {
            that.options.selectorsToIgnore.push("controllers");
        }
        
        return tree;
    };

    fluid.videoPlayer.preInit = function (that) {
        // build the 'choices' from the caption list provided
        fluid.each(that.options.model.captions.sources, function (value, key) {
            that.options.model.captions.choices.push(key);
            that.options.model.captions.names.push(key);
        });
        // add the 'turn captions off' option
        that.options.model.captions.choices.push("none");
        that.options.model.captions.names.push(that.options.strings.captionsOff);

        that.fullscreen = function () {
            var videoContainer = that.locate("videoContainer");
            var video = that.locate("video");
            if (that.model.states.fullscreen === true) {
                var windowWidth = window.innerWidth + "px";
                
                videoContainer.css({
                    // TODO: This doesn't actually do full-screen, it simply tries to maximise
                    // to the current window size. (FLUID-4570)
                    width: windowWidth,
                    height: window.innerHeight - 20 + "px"
                });
                that.container.css("width", windowWidth);
            } else {
                videoContainer.css({
                    width: video[0].videoWidth,
                    height: video[0].videoHeight
                });
                that.container.css("width", video[0].videoWidth);
            }
        };
    };

    fluid.videoPlayer.postInit = function (that) {
        that.canRenderControllers = function (controlsType) {
            return (fluid.hasFeature("fluid.browser.html5") && controlsType === "custom") ? true : false;
        };
        
        that.canRenderMedia = function (videoSource) {
            return videoSource ? true : false;
        };
        
        that.play = function (ev) {
            that.applier.fireChangeRequest({
                "path": "states.play",
                "value": !that.model.states.play
            });
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
            that.events.onStartScrub.fire();
            if (that.model.states.currentTime < that.model.states.totalTime) {
                var newVol = that.model.states.currentTime + that.model.states.totalTime * 0.05;
                that.events.onScrub.fire(newVol <= that.model.states.totalTime ? newVol : that.model.states.totalTime);
            }
            that.events.afterScrub.fire();
        };

        that.decrTime = function () {
            that.events.onStartScrub.fire();
            
            if (that.model.states.currentTime > 0) {
                var newVol = that.model.states.currentTime - that.model.states.totalTime * 0.05;
                that.events.onScrub.fire(newVol >= 0 ? newVol : 0);
            }
            that.events.afterScrub.fire();
        };
    };
    
    fluid.videoPlayer.finalInit = function (that) {
        that.container.attr("role", "application");

        // Render each media source with its custom renderer, registered by type.
        // If we aren't on an HTML 5 video-enabled browser, don't bother setting up the controller or captions.

        fluid.fetchResources(that.options.templates, function (res) {
            var fetchFailed = false;
            for (var key in res) {
                if (res[key].fetchError) {
                    fluid.log("couldn't fetch" + res[key].href);
                    fluid.log("status: " + res[key].fetchError.status +
                        ", textStatus: " + res[key].fetchError.textStatus +
                        ", errorThrown: " + res[key].fetchError.errorThrown);
                    that.events.onTemplateLoadError.fire(res[key].href);
                    fetchFailed = true;
                } else if (key === "videoPlayer") {
                    if (!fluid.hasFeature("fluid.browser.html5")) {
                        that.events.onOldBrowserDetected.fire($.browser);
                    }
                    that.container.append(res[key].resourceText);
                    that.refreshView();
                    //if we're on an old browser there's no point in linking all the evets as they won't exist...
                    if (fluid.hasFeature("fluid.browser.html5")) {
                        bindVideoPlayerDOMEvents(that);
                        //create all the listeners to the model
                        bindVideoPlayerModel(that);
                    }
                }
            }

            if (!fetchFailed) {
                that.events.onTemplateReady.fire();

                if (that.canRenderMedia(that.model.video.sources)) {
                    that.events.onCreateMediaReady.fire();
                }
                if (that.canRenderControllers(that.options.controls)) {
                    that.events.onCreateControllersReady.fire();
                }
                // TODO: Once we have a non-html5 fall-back for captions
                //    (i.e. captionator and/or mediaelement.js), we will
                //    not need to do this.
                if (fluid.hasFeature("fluid.browser.html5")) {
                    that.events.onReadyToLoadCaptions.fire();
                }
            }

            that.events.onReady.fire(that);
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

    /*********************************************************************************
     * Demands blocks for event binding components                                   *
     *********************************************************************************/
    
    fluid.demands("fluid.videoPlayer.media.eventBinder", ["fluid.videoPlayer.media", "fluid.videoPlayer"], {
        options: {
            listeners: {
                "{videoPlayer}.events.onScrub": "{media}.setTime",
                "{videoPlayer}.events.onVolumeChange": "{media}.setVolume",
                "{videoPlayer}.events.onViewReady": "{media}.refresh",
                "{videoPlayer}.events.onTimeChange": "{media}.updateCurrentTime"
            }
        }
    });

    fluid.demands("fluid.videoPlayer.captionner.eventBinder", ["fluid.videoPlayer.captionner", "fluid.videoPlayer"], {
        options: {
            listeners: {
                "{videoPlayer}.events.onCaptionsLoaded": "{captionner}.resyncCaptions",
                "{videoPlayer}.events.afterScrub": "{captionner}.resyncCaptions",
                "{videoPlayer}.events.onStartScrub": "{captionner}.hideCaptions",
                "{videoPlayer}.events.onIntervalChange": "{captionner}.displayCaptionForInterval"
            }
        }
    });

})(jQuery);
