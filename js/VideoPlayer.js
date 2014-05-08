/*
Copyright 2009 University of Toronto
Copyright 2011 Charly Molter
Copyright 2011-2014 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/*global jQuery, window, fluid_1_5*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_5 = fluid_1_5 || {};

(function ($, fluid) {
    fluid.setLogging(false);
    
    /*******************************************************************************
     * Video Player                                                                *
     *                                                                             *
     * Renders HTML 5 video player at the detection of HTML5 browsers. It degrades * 
     * gracefully to the browser built-in video player when the browser does not   *
     * support HTML5.                                                              * 
     *******************************************************************************/
    
    fluid.registerNamespace("fluid.videoPlayer");
    
    fluid.videoPlayer.isSafari = function () {
        var ua = navigator.userAgent.toLowerCase();
        return ((ua.indexOf("safari") > 0) && (ua.indexOf("chrome") < 0)) ? fluid.typeTag("fluid.browser.safari") : undefined;
    };
    
    fluid.enhance.check({
        "fluid.browser.safari": "fluid.videoPlayer.isSafari"
    });
    
    //This is the default key bindings
    fluid.videoPlayer.defaultKeys = {
        play: {
            modifier: $.ui.keyCode.SHIFT,
            key: 80
        },
        captions: {
            modifier: $.ui.keyCode.SHIFT,
            key: 67
        },
        transcripts: {
            modifier: $.ui.keyCode.SHIFT,
            key: 84
        },
        fullscreen: {
            modifier: $.ui.keyCode.SHIFT,
            key: 70
        },
        volumePlus: {
            key: $.ui.keyCode.UP
        },
        volumeMinus: {
            key: $.ui.keyCode.DOWN
        },
        forward: {
            key: $.ui.keyCode.RIGHT
        },
        rewind: {
            key: $.ui.keyCode.LEFT
        },
        escape: {
            key: $.ui.keyCode.ESCAPE
        }
    };

    fluid.enhance.check({"fluid.browser.nativeVideoSupport": "fluid.browser.nativeVideoSupport"});

    /**
     * Video player renders HTML 5 video content and degrades gracefully to an alternative.
     * 
     * @param {Object} container the container in which video and (optionally) captions are displayed
     * @param {Object} options configuration options for the component
     */

    fluid.defaults("fluid.videoPlayer", {
        gradeNames: ["fluid.viewRelayComponent", "fluid.progressiveCheckerForComponent", "{that}.getCaptionGrade", "autoInit"],
        componentName: "fluid.videoPlayer",
        progressiveCheckerOptions: {
            checks: [{
                // Don't animate show/hide in Safari
                feature: "{fluid.browser.safari}",
                contextName: "fluid.videoPlayer.simpleControllers"
            }]
        },
        components: {
            media: {
                type: "fluid.videoPlayer.media",
                container: "{videoPlayer}.dom.video",
                createOnEvent: "onCreateMediaReady",
                priority: "first",
                options: {
                    model: {
                        play: "{videoPlayer}.model.play",
                        canPlay: "{videoPlayer}.model.canPlay",
                        muted: "{videoPlayer}.model.muted",
                        volume: "{videoPlayer}.model.volume",
                        totalTime: "{videoPlayer}.model.totalTime",
                        currentTime: "{videoPlayer}.model.currentTime",
                        scrubTime: "{videoPlayer}.model.scrubTime"
                    },
                    events: {
                        onLoadedMetadata: "{videoPlayer}.events.onLoadedMetadata",
                        onTimeUpdate: "{intervalEventsConductor}.events.onTimeUpdate"
                    },
                    listeners: {
                        onExitFullScreen: {
                            // Ensures that the model is in the correct state after exiting fullscren
                            // for example when exiting with "esc" instead of clicking the exit full screen button
                            listener: "{videoPlayer}.applier.requestChange",
                            args: ["fullscreen", false]
                        },
                        // This event should be split into two to differentiate between the setting and unsetting of fullscreen
                        "{videoPlayer}.events.onFullscreenModelChanged": {
                            listener: function (videoPlayer, media, fullscreenFlag) {
                                if (fullscreenFlag) {
                                    media.requestFullScreen(videoPlayer.locate("videoPlayer")[0]);
                                } else {
// XXX This is happening on construction, before media is actually ready; cancelFullScreen doesn't exist
//                                    media.cancelFullScreen();
                                }
                            },
                            args: ["{videoPlayer}", "{media}", "{arguments}.0"]
                        },
                        onReady: "{videoPlayer}.events.onMediaReady"
                    },
                    sources: "{videoPlayer}.options.video.sources",
                    components: {
                        mediaEventBinder: {
                            options: {
                                listeners: {
                                    "{videoPlayer}.events.onScrub": "{media}.setTime",
                                    "{videoPlayer}.events.onTimeUpdate": "{media}.updateCurrentTime",
                                    "{videoPlayer}.events.onTranscriptElementChange": "{media}.setTime"
                                }
                            }
                        }
                    }
                }
            },
            transcript: {
                type: "fluid.videoPlayer.transcript",
                container: "{videoPlayer}.dom.transcript",
                createOnEvent: "onIntervalEventsConductorReady",
                options: {
                    model: {
                        displayTranscripts: "{videoPlayer}.model.displayTranscripts",
                        currentTranscriptTracks: "{videoPlayer}.model.currentTracks.transcripts"
                    },
                    transcripts: "{videoPlayer}.options.video.transcripts",
                    events: {
                        onCurrentTranscriptChanged: "{videoPlayer}.events.onCurrentTranscriptChanged",
                        onTranscriptHide: "{videoPlayer}.events.onTranscriptHide",
                        onTranscriptShow: "{videoPlayer}.events.onTranscriptShow",
                        onTranscriptElementChange: "{videoPlayer}.events.onTranscriptElementChange",
                        onTranscriptsLoaded: "{videoPlayer}.events.onTranscriptsLoaded"
                    }
                }
            },
            intervalEventsConductor: {
                type: "fluid.videoPlayer.intervalEventsConductor",
                createOnEvent: "onMediaReady",
                options: {
                    events: {
                        onTimeUpdate: "{videoPlayer}.events.onTimeUpdate",
                        onIntervalChange: "{transcript}.events.onIntervalChange"
                    },
                    listeners: {
                        "{transcript}.events.onTranscriptsLoaded": "{intervalEventsConductor}.setIntervalList"
                    }
                }
            },
            controllers: {
                type: "fluid.videoPlayer.controllers",
                container: "{videoPlayer}.dom.controllers",
                createOnEvent: "onTemplateReady",
                options: {
                    model: "{videoPlayer}.model",
                    captions: "{videoPlayer}.options.video.captions",
                    transcripts: "{videoPlayer}.options.video.transcripts",
                    events: {
                        onStartScrub: "{videoPlayer}.events.onStartScrub",
                        onScrub: "{videoPlayer}.events.onScrub",
                        afterScrub: "{videoPlayer}.events.afterScrub",
                        onTranscriptsReady: "{videoPlayer}.events.canBindTranscriptMenu",
                        onCaptionsReady: "{videoPlayer}.events.canBindCaptionMenu"
                    },
                    listeners: {
                        onReady: "{videoPlayer}.events.onControllersReady"
                    },
                    templates: {
                        menuButton: "{videoPlayer}.options.templates.menuButton"
/*
                    },
                    members: {
                        applier: "{videoPlayer}.applier"
*/
                    }
                }
            }
        },
        events: {
            onScrub: null,
            onTemplateReady: null,
            onLoadedMetadata: null,
            onMediaReady: null,
            onControllersReady: null,
            afterScrub: null,
            onStartScrub: null,
            onTemplateLoadError: null,
            onCurrentTranscriptChanged: null,
            onTranscriptHide: null,
            onTranscriptShow: null,
            onTranscriptElementChange: null,
            
            onFullscreenModelChanged: null,

            onReady: {
                events: {
                    onTemplateReady: "onTemplateReady",
                    onControllersReady: "onControllersReady",
                    onMediaReady: "onMediaReady",
                    onCreate: "onCreate"
                },
                args: ["{videoPlayer}"]
            },
            
            // public, time events
            onTimeUpdate: null,
            
            // The following events are private
            onCreateMediaReady: null,
            onIntervalEventsConductorReady: null,

            // private events used for associating menus with what they control via ARIA
            onTranscriptsReady: null,
            onTranscriptsLoaded: null,
            onCaptionsReady: null,
            canBindTranscriptMenu: {
                events: {
                    controllers: "onControllersReady",
                    transcripts: "onTranscriptsLoaded"
                },
                args: ["{arguments}.transcripts.1"]
            },
            canBindCaptionMenu: {
                events: {
                    controllers: "onControllersReady",
                    captions: "onCaptionsReady"
                },
                args: ["{arguments}.captions.1"]
            }
        },
        listeners: {
            onCreate: [{
                listener: "fluid.videoPlayer.addKindToTracks",
                args: ["{that}"]
            },{
                listener: "fluid.videoPlayer.addVolumeGuard",
                args: ["{that}"]
            },{
                listener: "fluid.videoPlayer.loadTemplates",
                args: ["{that}"]
            },{
                listener: "fluid.videoPlayer.initializeCurrentTracks",
                args: ["{that}"]
            }]
        },
        selectors: {
            videoPlayer: ".flc-videoPlayer-main",
            video: ".flc-videoPlayer-video",
            videoOverlay: ".flc-videoPlayer-video-overlay",
            videoContainer: ".flc-videoPlayer-video-container",
            caption: ".flc-videoPlayer-captionArea",
            controllers: ".flc-videoPlayer-controller",
            transcript: ".flc-videoPlayer-transcriptArea",
            overlay: ".flc-videoPlayer-overlay"
        },
        strings: {
            captionsOff: "Captions OFF",
            turnCaptionsOff: "Turn Captions OFF",
            transcriptsOff: "Transcripts OFF",
            turnTranscriptsOff: "Turn Transcripts OFF",
            videoTitlePreface: "Video: "
        },
        styles: {
            playOverlay: "fl-videoPlayer-video-play"
        },
        selectorsToIgnore: ["overlay", "caption", "videoPlayer", "transcript", "video", "videoContainer", "videoOverlay"],
        keyBindings: fluid.videoPlayer.defaultKeys,
        video: {
            sources: [],
            captions: [],
            transcripts: []
        },
        defaultKinds: {
            captions: "subtitles",
            transcripts: "transcripts"
        },
        model: {
            currentTracks: {
                captions: [],
                transcripts: []
            },
            currentTime: 0,
            scrubTime: null,
            totalTime: 0,
            bufferEnd: 0,
            displayCaptions: false,
            displayTranscripts: false,
            fullscreen: false,
            volume: 60,
            muted: false,
            canPlay: false,
            play: false
        },
        modelListeners: {
            play: {
                funcName: "fluid.videoPlayer.togglePlayOverlay",
                args: "{videoPlayer}"
            },
            fullScreen: "{videoPlayer}.events.onFullscreenModelChanged.fire"
        },
        templates: {
            videoPlayer: {
                forceCache: true,
                href: "../html/videoPlayer_template.html"
            }
        },
        videoTitle: "unnamed video",
        invokers: {
            showControllers: "fluid.videoPlayer.showControllersAnimated",
            hideControllers: "fluid.videoPlayer.hideControllersAnimated",
            getCaptionGrade: {
                funcName: "fluid.videoPlayer.getCaptionGrade"
            },
            play: {
                funcName: "fluid.videoPlayer.play",
                args: ["{videoPlayer}"]
            },
            incrTime: {
                funcName: "fluid.videoPlayer.incrTime",
                args: ["{videoPlayer}"]
            },
            decrTime: {
                funcName: "fluid.videoPlayer.decrTime",
                args: ["{videoPlayer}"]
            },
            toggleFullscreen: {
                funcName: "fluid.videoPlayer.toggleFullscreen",
                args: ["{videoPlayer}"]
            }
        }
    });
    
    fluid.videoPlayer.getCaptionGrade = function () {
        return fluid.videoPlayer.getGrade("fluid.browser.nativeVideoSupport", "fluid.videoPlayer.captionSupport");
    };

    // This grade is solely for the purpose of adding the html5captionator subcomponent,
    // which doesn't happen if native video is not supported. It should never be instantiated.
    fluid.defaults("fluid.videoPlayer.captionSupport", {
        components: {
            html5Captionator: {
                type: "fluid.videoPlayer.html5Captionator",
                container: "{videoPlayer}.dom.videoPlayer",
                createOnEvent: "onMediaReady",
                options: {
                    model: "{videoPlayer}.model",
                    captions: "{videoPlayer}.options.video.captions",
                    events: {
                        onReady: "{videoPlayer}.events.onCaptionsReady"
                    }
                }
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
                activateHandler: that.toggleFullscreen
            }, {
                modifier: that.options.keyBindings.captions.modifier,
                key: that.options.keyBindings.captions.key,
                activateHandler: function () {
                    that.applier.fireChangeRequest({
                        path: "displayCaptions",
                        value: !that.model.displayCaptions
                    });
                }
            }, {
                modifier: that.options.keyBindings.transcripts.modifier,
                key: that.options.keyBindings.transcripts.key,
                activateHandler: function () {
                    that.applier.fireChangeRequest({
                        path: "displayTranscripts",
                        value: !that.model.states.displayTranscripts
                    });
                }
            }, {
                modifier: that.options.keyBindings.volumePlus.modifier,
                key: that.options.keyBindings.volumePlus.key,
                activateHandler: function () {
                    that.applier.fireChangeRequest({
                        path: "volume",
                        value: that.model.volume + 10
                    });
                    return false;
                }
            }, {
                modifier: that.options.keyBindings.volumeMinus.modifier,
                key: that.options.keyBindings.volumeMinus.key,
                activateHandler: function () {
                    that.applier.fireChangeRequest({
                        path: "volume",
                        value: that.model.volume - 10
                    });
                    return false;
                }
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
    };

    fluid.videoPlayer.showControllersSimple = function (that) {
        that.locate("controllers").show();
    };
    fluid.videoPlayer.hideControllersSimple = function (that) {
        that.locate("controllers").hide();
    };
    fluid.videoPlayer.showControllersAnimated = function (that) {
        that.locate("controllers").stop(false, true).slideDown();
    };

    fluid.videoPlayer.hideControllersAnimated = function (that) {
        that.locate("controllers").stop(false, true).delay(500).slideUp();
    };

    fluid.videoPlayer.togglePlayOverlay = function (that) {
        var ol = that.locate("videoOverlay");
        var olstyle = that.options.styles.playOverlay;
        
        if (!that.model.play) {
            ol.addClass(olstyle);
        } else {
            ol.removeClass(olstyle);
        }    
    }; 

    var bindVideoPlayerDOMEvents = function (that) {
        var videoContainer = that.locate("videoContainer");
        
        fluid.tabindex(videoContainer, 0);

        // The two mousedown listeners below are the work-around for IE9 issue that the video overlay is rendered
        // on top of the play button overlay most of time in IE9, which causes the play button overlay don't receive
        // any mouse events. The first listener plays/pauses video when the click is received by the video overlay.
        // The second listener prevents the mousedown event on the controller bar from bubbling up to the video
        // overlay so the video does not respond with playing/pausing.
        that.locate("overlay").mousedown(function (ev) {
            that.play();
        });
        
        that.locate("controllers").mousedown(function (ev) {
            ev.stopPropagation();
        });
        
        // Using "mousedown" event rather than "click", which does not work
        // with the flash fallback in IE8
        videoContainer.mousedown(function (ev) {
            ev.preventDefault();
            that.play();
        });
        
        that.locate("videoPlayer").mouseenter(function () {
            that.showControllers(that);
        });

        that.container.mouseleave(function () {
            that.hideControllers(that);
        });

        videoContainer.focus(function () {
            that.showControllers(that);
        });

        that.events.onLoadedMetadata.addListener(function () {
            bindKeyboardControl(that);
        });
    };

    fluid.videoPlayer.addDefaultKind = function (tracks, defaultKind) {
        fluid.each(tracks, function (track) {
            if (!track.kind) {
                track.kind = defaultKind;
            }
        });
    };

    fluid.videoPlayer.addKindToTracks = function (that) {
        fluid.each(that.options.defaultKinds, function (defaultKind, index) {
            fluid.videoPlayer.addDefaultKind(fluid.get(that.options.video, index), defaultKind);  
        });
        
    };

    fluid.videoPlayer.initializeCurrentTracks = function (that) {
        if (that.options.video.captions.length > 0) {
            that.applier.change("currentTracks.captions", [0]);
        }
        if (that.options.video.transcripts.length > 0) {
            that.applier.change("currentTracks.transcripts", [0]);
        }
    };

    fluid.videoPlayer.toggleFullscreen = function (that) {
        that.applier.requestChange("fullscreen", !that.model.fullscreen);
    };

    fluid.videoPlayer.play = function (that) {
        that.applier.fireChangeRequest({
            "path": "play",
            "value": !that.model.play
        });
    };

    fluid.videoPlayer.incrTime = function (that) {
        that.events.onStartScrub.fire();
        if (that.model.currentTime < that.model.totalTime) {
            var newVol = that.model.currentTime + that.model.totalTime * 0.05;
            that.events.onScrub.fire(newVol <= that.model.totalTime ? newVol : that.model.totalTime);
        }
        that.events.afterScrub.fire();
    };

    fluid.videoPlayer.decrTime = function (that) {
        that.events.onStartScrub.fire();

        if (that.model.currentTime > 0) {
            var newVol = that.model.currentTime - that.model.totalTime * 0.05;
            that.events.onScrub.fire(newVol >= 0 ? newVol : 0);
        }
        that.events.afterScrub.fire();
    };

    fluid.videoPlayer.addVolumeGuard = function (that) {
        // TODO: declarative syntax for this in framework
        // note that the "mega-model" is shared throughout all components - morally, this should go into the 
        // volume control component, but it is best to get at the single model + applier as early as possible


// XXX  guards doesn't exist anymore
//        that.applier.guards.addListener({path: "volume", transactional: true}, fluid.linearRangeGuard(0, 100));

    };
    
    fluid.videoPlayer.loadTemplates = function (that) {
        that.container.attr("role", "application");

        // Render each media source with its custom renderer, registered by type.
        // If we aren't on an HTML 5 video-enabled browser, don't bother setting up the controller, captions or transcripts.

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
                    that.container.append(res[key].resourceText);
                    var video = that.locate("video");
                    // Setting the width and height attributes to respect the CSS API for setting the size of the video
                    // This is required for cross browser sizing of the video
                    video.attr("width", video.css("width"));
                    video.attr("height", video.css("height"));

                    that.locate("videoContainer").attr("aria-label", that.options.strings.videoTitlePreface + that.options.videoTitle);

                    bindVideoPlayerDOMEvents(that);
                }
            }

            if (!fetchFailed) {
                that.events.onTemplateReady.fire();

                if (that.options.video.sources) {
                    that.events.onCreateMediaReady.fire();
                }
            }

            that.locate("controllers").hide();
            fluid.videoPlayer.togglePlayOverlay(that);

            // Ensure <object> element is not in tab order, for IE9
            $("object", that.locate("video")).attr("tabindex", "-1");
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
     * Event Binder:                                                                 *
     * Shared by all video player component whenever an event binder component is    *
     * needed                                                                        *
     *********************************************************************************/
        
    fluid.defaults("fluid.videoPlayer.eventBinder", {
        gradeNames: ["fluid.eventedComponent", "autoInit"]
    });

    /*******************************************************************
     * Converts milliseconds into a WebVTT Timestamp:  HH:MM:SS.mmm
     * @millis:  time in milliseconds expressed as a floating point number
     *******************************************************************/
    fluid.videoPlayer.millisToHmsm = function (millis) {
        var seconds = parseFloat(millis) / 1000;
        seconds = seconds < 0 || isNaN(seconds) ? 0 : seconds;

        var hours = parseInt(seconds / 3600);
        var minutes = parseInt(seconds / 60) % 60;
        seconds = (seconds % 60).toFixed(3);

        // Return result of type HH:MM:SS.mmm
        return (hours < 10 ? "0" + hours : hours) + ":"
            + (minutes < 10 ? "0" + minutes : minutes) + ":"
            + (seconds  < 10 ? "0" + seconds : seconds);
    };

    /******************************************************************************************************
     * Converts JSON from Amara (http://www.universalsubtitles.org/api/1.0/subtitles/) into WebVTT format.
     * Each caption in WebVTT looks like:
     *  empty line
     *  HH:MM:SS.mmm --> HH:MM:SS.mmm
     *  Caption text
     *
     *****************************************************************************************************/
    fluid.videoPlayer.amaraJsonToVTT = function (json) {
        var vtt = "WEBVTT";

        for (var i = 0; i < json.length; i++) {
            var startTime = fluid.videoPlayer.millisToHmsm(json[i].start);
            var endTime = fluid.videoPlayer.millisToHmsm(json[i].end);
            vtt = vtt.concat("\n\n", startTime, " --> ", endTime, "\n", json[i].text);
        }

        return vtt;
    };

    fluid.videoPlayer.fetchAmaraJson = function (videoUrl, lang, callback) {
        // No point continuing because we can't get a useful JSONP response without the url and a callback
        if (!videoUrl || !callback) {
            return;
        }

        // Hard coded URL to amara here         
        var url = encodeURI("http://www.universalsubtitles.org/api2/partners/videos/?video_url=" + videoUrl + "&callback=?");        
        $.getJSON(url, function( data ) {
            var captionUrl = encodeURI("http://www.universalsubtitles.org/api2/partners/videos/" + data.objects[0].id + "/languages/" + lang + "/subtitles/?callback=?");        
            $.getJSON(captionUrl, callback);            
        });
        
    };

    /*********
     * In Safari, repositioning of relatively positioned elements is buggy. See
     *    http://www.quirksmode.org/css/position.html (sidebar)
     * This manifests itself in the video player as disappearing controls.
     *    http://issues.fluidproject.org/browse/FLUID-4804
     * Workaround: Don't animate show/hide in Safari
     *********/
    // These two grades are solely for the purpose of defining the show/hide functions for XX.
    // They should never be instantiated.
    fluid.defaults("fluid.videoPlayer.simpleControllers", {
        invokers: {
            showControllers: "fluid.videoPlayer.showControllersSimple",
            hideControllers: "fluid.videoPlayer.hideControllersSimple"
        }
    });
    fluid.defaults("fluid.videoPlayer.animatedControllers", {
        invokers: {
            showControllers: "fluid.videoPlayer.showControllersAnimated",
            hideControllers: "fluid.videoPlayer.hideControllersAnimated"
        }
    });
    
})(jQuery, fluid_1_5);
