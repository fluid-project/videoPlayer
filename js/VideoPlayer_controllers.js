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

    /**
     * controllers is a video controller containing a play button, a time scrubber, 
     *      a volume controller, a button to put captions on/off
     *      , a button to put transcripts on/off
     * 
     * @param {Object} container the container which this component is rooted
     * @param {Object} options configuration options for the component
     */
    //add all the modelChanged listener to the applier
    // TODO: Privacy is inherited. Consider making this public
    var bindControllerModel = function (that) {
        that.applier.modelChanged.addListener("canPlay", function () {
            that.locate("play").attr("disabled", !that.model.canPlay);
            that.locate("fullscreen").attr("disabled", !that.model.canPlay);
        });
    };

    fluid.defaults("fluid.videoPlayer.controllers", { 
        gradeNames: ["fluid.viewComponent", "autoInit"], 
        components: {
            scrubber: {
                type: "fluid.videoPlayer.controllers.scrubber",
                container: "{controllers}.dom.scrubberContainer",
                options: {
                    model: "{controllers}.model",
                    applier: "{controllers}.applier",
                    components: {
                        bufferedProgress: {
                            type: "fluid.progress",
                            container: "{scrubber}.dom.bufferedProgress",
                            options: {
                                initiallyHidden: false,
                                speed: 1000,
                                minWidth: 0
                            }
                        },
                    },
                    events: {
                        onScrub: "{controllers}.events.onScrub",
                        afterScrub: "{controllers}.events.afterScrub",
                        onStartScrub: "{controllers}.events.onStartScrub"
                    }
                }
            },
            volumeControl: {
                type: "fluid.videoPlayer.controllers.volumeControls",
                container: "{controllers}.dom.volumeContainer",
                options: {
                    model: "{controllers}.model",
                    applier: "{controllers}.applier"
                }
            },
            captionControls: {
                type: "fluid.videoPlayer.controllers.languageControls",
                container: "{controllers}.dom.captionControlsContainer",
                options: {
                    languages: "{controllers}.options.captions",
                    model: "{controllers}.model",
                    applier: "{controllers}.applier",
                    showHidePath: "displayCaptions",
                    currentLanguagePath: "currentTracks.captions",
                    selectors: {
                        button: ".flc-videoPlayer-captions-button",
                        menu: ".flc-videoPlayer-captions-languageMenu"
                    },
                    styles: {
                        button: "fl-videoPlayer-captions-button",
                        buttonWithShowing: "fl-videoPlayer-captions-button-on"
                    },
                    strings: {
                        showLanguage: "Show Captions",
                        hideLanguage: "Hide Captions",
                        press: "Captions",
                        release: "Captions"
                    }
                }
            },
            transcriptControls: {
                type: "fluid.videoPlayer.controllers.languageControls",
                container: "{controllers}.dom.transcriptControlsContainer",
                options: {
                    languages: "{controllers}.options.transcripts",
                    model: "{controllers}.model",
                    applier: "{controllers}.applier",
                    showHidePath: "displayTranscripts",
                    currentLanguagePath: "currentTracks.transcripts",
                    selectors: {
                        button: ".flc-videoPlayer-transcripts-button",
                        menu: ".flc-videoPlayer-transcripts-languageMenu"
                    },
                    styles: {
                        button: "fl-videoPlayer-transcripts-button",
                        buttonWithShowing: "fl-videoPlayer-transcripts-button-on"
                    },
                    strings: {
                        showLanguage: "Show Transcripts",
                        hideLanguage: "Hide Transcripts",
                        press: "Transcripts",
                        release: "Transcripts"
                    }
                }
            },
            playButton: {
                type: "fluid.toggleButton",
                container: "{controllers}.container",
                options: {
                    selectors: {
                        button: ".flc-videoPlayer-play"
                    },
                    styles: {
                        init: "fl-videoPlayer-play",
                        pressed: "fl-videoPlayer-playing"
                    },
                    // TODO: Strings should be moved out into a single top-level bundle (FLUID-4590)
                    strings: {
                        press: "Play",
                        release: "Pause"
                    },
                    model: "{controllers}.model",
                    modelPath: "play",
                    ownModel: false,
                    applier: "{controllers}.applier"
                }
            },
            fullScreenButton: {
                type: "fluid.toggleButton",
                container: "{controllers}.container",
                options: {
                    selectors: {
                        button: ".flc-videoPlayer-fullscreen"
                    },
                    styles: {
                        init: "fl-videoPlayer-fullscreen",
                        pressed: "fl-videoPlayer-fullscreen-on"
                    },
                    // TODO: Strings should be moved out into a single top-level bundle (FLUID-4590)
                    strings: {
                        press: "Full screen",
                        release: "Exit full screen mode"
                    },
                    model: "{controllers}.model",
                    modelPath: "fullscreen",
                    ownModel: false,
                    applier: "{controllers}.applier"
                }
            }
        },
        finalInitFunction: "fluid.videoPlayer.controllers.finalInit",
        events: {
            onControllersReady: null,
            onStartTimeChange: null,
            onTimeChange: null,
            afterTimeChange: null,
            onMarkupReady: null
        },

        selectors: {
            play: ".flc-videoPlayer-play",
            scrubberContainer: ".flc-videoPlayer-scrubberContainer",
            volumeContainer: ".flc-videoPlayer-volumeContainer",
            captionControlsContainer: ".flc-videoPlayer-captionControls-container",
            transcriptControlsContainer: ".flc-videoPlayer-transcriptControls-container",
            fullscreen: ".flc-videoPlayer-fullscreen"
        },

        styles: {
            fullscreenOn: "fl-videoPlayer-state-fullscreenOn",
            fullscreenOff: "fl-videoPlayer-state-fullscreenOff",
            fullscreenIcon: "ui-icon-extlink",
            captionIcon: "ui-icon-comment",
            transcriptIcon: "ui-icon-comment"
        }
    });

    fluid.videoPlayer.controllers.finalInit = function (that) {
        bindControllerModel(that);

        that.events.onControllersReady.fire(that);
    };
    
    /********************************************
    * scrubber: a slider to follow the progress *
    *           of the video                    *
    ********************************************/
        
    // TODO: Privacy is inherited. Consider making this public
    //change the text of the selected time
    var updateTime = function (that, element) {
        var time = that.locate(element);
        time.text(fluid.videoPlayer.formatTime(that.model[element]));
    };
    
    // TODO: Privacy is inherited. Consider making this public
    var bindScrubberDOMEvents = function (that) {
        // Bind the scrubbers slide event to change the video's time.
        var scrubber = that.locate("scrubber");
        scrubber.bind({
            "slidestart": function (evt, ui) {
                that.events.onStartScrub.fire(ui.value);
            },
            "slide": function (evt, ui) {
                that.events.onScrub.fire(ui.value);
            },
            "slidestop": function (evt, ui) {
                that.events.afterScrub.fire(ui.value);
            }
        });
    };

    // TODO: This function is inherited. Consider making this public
    var bindScrubberModel = function (that) {
        // Setup the scrubber when we know the duration of the video.
        that.applier.modelChanged.addListener("startTime", that.updateMin);
        that.applier.modelChanged.addListener("startTime", that.updateMax);
        that.applier.modelChanged.addListener("totalTime", that.updateMax);

        // Bind to the video's timeupdate event so we can programmatically update the slider.
        that.applier.modelChanged.addListener("currentTime", that.updateCurrent);
        that.applier.modelChanged.addListener("buffered", that.updateBuffered);

        that.applier.modelChanged.addListener("canPlay", function () {
            var scrubber = that.locate("scrubber");
            if (that.model.canPlay === true) {
                scrubber.slider("enable");
            } else {
                scrubber.slider("disable");
            }
        });
    };

    // TODO: Privacy is inherited. Consider making this public
    var createScrubberMarkup = function (that) {
        var scrubber = that.locate("scrubber");
        scrubber.slider({
            unittext: "seconds",
            range: "min",
            disabled: true
        }).attr({
            "role": "slider"
        });
        
        // TODO: This in inherited. Do we need to add aria to sliders ourselves?
        that.locate("handle").attr({
            "aria-label": that.options.strings.scrubber,
            "aria-valuemin": 0,
            "aria-valuemax": 0,
            "aria-valuenow": 0,
            "aria-valuetext": 0
        });
        return scrubber;
    };

    fluid.defaults("fluid.videoPlayer.controllers.scrubber", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        finalInitFunction: "fluid.videoPlayer.controllers.scrubber.finalInit",
        postInitFunction: "fluid.videoPlayer.controllers.scrubber.postInit",
        events: {
            afterScrub: null,
            onScrub: null,
            onScrubberReady: null,
            onStartScrub: null
        },
        selectors: {
            totalTime: ".flc-videoPlayer-total",
            currentTime: ".flc-videoPlayer-current",
            scrubber: ".flc-videoPlayer-scrubber",
            handle: ".ui-slider-handle",
            bufferedProgress: ".flc-videoPlayer-buffered-progress"
        },
        // TODO: Strings should be moved out into a single top-level bundle (FLUID-4590)
        strings: {
            scrubber: "Time scrub"
        }
    });

    fluid.videoPlayer.controllers.scrubber.postInit = function (that) {
        // TODO: these methods should be public functions, since people might like to alter them
        //       (inherited code)
        that.updateMin = function () {
            var startTime = that.model.startTime || 0;
            var scrubber = that.locate("scrubber");
            scrubber.slider("option", "min", startTime + that.model.currentTime);
            that.locate("handle").attr({
                "aria-valuemin": startTime + that.model.currentTime
            });
        };

        that.updateMax = function () {
            updateTime(that, "totalTime");
            var scrubber = that.locate("scrubber");
            scrubber.slider("option", "max", that.model.totalTime);
            that.locate("handle").attr({
                "aria-valuemax": that.model.totalTime
            });
        };

        that.updateCurrent = function () {
            updateTime(that, "currentTime");
            var scrubber = that.locate("scrubber");
            scrubber.slider("value", that.model.currentTime);
            that.locate("handle").attr({
                "aria-valuenow": that.model.currentTime,
                "aria-valuetext": fluid.videoPlayer.formatTime(that.model.currentTime) + " of " + fluid.videoPlayer.formatTime(that.model.totalTime)
            });
        };

        var bufferCompleted = false;
        
        that.updateBuffered = function () {
            var lastBufferedTime = that.model.buffered.end(that.model.buffered.length - 1);
            var totalTime = that.model.totalTime;
            
            if (totalTime && lastBufferedTime && !bufferCompleted) {
                var percent = Math.round(lastBufferedTime / totalTime * 100);
                
                that.bufferedProgress.update(percent);
                
                // Stops the buffer progress from being kept updated once the progress reaches 100%
                if (lastBufferedTime === totalTime) {
                    bufferCompleted = true;
                }
            }
        };
    };

    fluid.videoPlayer.controllers.scrubber.finalInit = function (that) {
        createScrubberMarkup(that);
        bindScrubberDOMEvents(that);
        bindScrubberModel(that);
        
        that.events.onScrubberReady.fire();
    };
    

    /********************************************************
    * Volume Control: a button that turns into a slider     *
    *           To control the volume                       *
    *********************************************************/
    // TODO: Privacy is inherited. Consider making this public
    var bindVolumeDOMEvents = function (that) {
        // Bind the volume Control slide event to change the video's volume and its image.
        that.locate("volumeControl").bind("slide", function (evt, ui) {
            fluid.fireSourcedChange(that.applier, "volume", ui.value, "slider");
        });

        that.locate("volumeControl").bind("slidechange", function (evt, ui) {
            fluid.fireSourcedChange(that.applier, "volume", ui.value, "slider");
        });

    };

    // TODO: Privacy is inherited. Consider making this public
    var bindVolumeModel = function (that) {
        fluid.addSourceGuardedListener(that.applier.modelChanged, 
            "volume", "slider", that.updateVolume); 
        that.applier.modelChanged.addListener("canPlay", function () {
            that.locate("mute").attr("disabled", !that.model.canPlay);
        });
    };

    // TODO: Privacy is inherited. Consider making this public
    var setUpVolumeControls = function (that) {
        var volumeControl = that.locate("volumeControl");
        volumeControl.addClass(that.options.styles.volumeControl);
        volumeControl.slider({
            orientation: "vertical",
            range: "min",
            min: that.model.minVolume,
            max: that.model.maxVolume,
            value: that.model.volume
        });
        // TODO: This in inherited. Do we need to add aria to sliders ourselves?
        that.locate("handle").attr({
            "aria-label": that.options.strings.volume,
            "aria-valuemin": that.model.minVolume,
            "aria-valuemax": that.model.maxVolume,
            "aria-valuenow": that.model.volume,
            "aria-valuetext": that.model.volume + "%",
            "role": "slider"
        });

        fluid.tabindex(that.container, 0);
        fluid.tabindex(that.locate("mute"), -1);
        fluid.tabindex(volumeControl, -1);
        fluid.tabindex(that.locate("handle"), -1);

        fluid.activatable(that.container, function (evt) {
            that.muteButton.events.onPress.fire();
        });
        // TODO: This will be converted to use the activatable plugin
        // as part of FLUID-4552
        that.container.keydown(function (evt) {
            var volumeControl = that.locate("volumeControl");
            var code = evt.which ? evt.which : evt.keyCode;
            if ((code === $.ui.keyCode.UP)  || (code === $.ui.keyCode.RIGHT)) {
                volumeControl.slider("value", volumeControl.slider("value") + 1);
            } else if ((code === $.ui.keyCode.DOWN)  || (code === $.ui.keyCode.LEFT)) {
                volumeControl.slider("value", volumeControl.slider("value") - 1);
            } else {
                return true;
            }
            return false;
        });
    };

    fluid.defaults("fluid.videoPlayer.controllers.volumeControls", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        postInitFunction: "fluid.videoPlayer.controllers.volumeControls.postInit",
        finalInitFunction: "fluid.videoPlayer.controllers.volumeControls.finalInit",
        events: {
            onReady: null
        },
        model: {
            muted: false,
            volume: 50,
            minVolume: 0,
            maxVolume: 100
        },
        selectors: {
            mute: ".flc-videoPlayer-mute",
            volumeControl: ".flc-videoPlayer-volumeControl",
            handle: ".ui-slider-handle"
        },
        styles: {
            mute: "fl-videoPlayer-mute",
            volumeControl: "fl-videoPlayer-volumeControl",
            buttonIcon: "ui-icon-signal"
        },
        // TODO: Strings should be moved out into a single top-level bundle (FLUID-4590)
        strings: {
            volume: "Volume"
        },
        components: {
            muteButton: {
                type: "fluid.toggleButton",
                options: {
                    selectors: {
                        button: ".flc-videoPlayer-mute"
                    },
                    styles: {
                        init: "fl-videoPlayer-mute",
                        pressed: "fl-videoPlayer-muted"
                    },
                    // TODO: Strings should be moved out into a single top-level bundle (FLUID-4590)
                    strings: {
                        press: "Mute",
                        release: "Un-mute"
                    },
                    model: "{volumeControls}.model",
                    modelPath: "muted",
                    applier: "{volumeControls}.applier"
                }
            }
        }
    });

    fluid.videoPlayer.controllers.volumeControls.postInit = function (that) {
        that.options.components.muteButton.container = that.container;
        
        that.showVolumeControl = function () {
            that.locate("volumeControl").show();
        };
        that.hideVolumeControl = function () {
            that.locate("volumeControl").hide();
        };

        that.updateVolume = function () {
            var volume = that.model.volume;
            var volumeControl = that.locate("volumeControl");
            volumeControl.slider("value", volume);
            that.locate("handle").attr({
                "aria-valuenow": volume,
                "aria-valuetext": Math.round(volume) + "%"
            });
        };
    };

    fluid.videoPlayer.controllers.volumeControls.finalInit = function (that) {
        setUpVolumeControls(that);
        bindVolumeDOMEvents(that);
        bindVolumeModel(that);
        that.events.onReady.fire(that);
    };

})(jQuery);
