/*
Copyright 2009 University of Toronto
Copyright 2011 Charly Molter
Copyright 2011-2013 OCAD University

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
                    events: {
                        onScrub: "{controllers}.events.onScrub",
                        afterScrub: "{controllers}.events.afterScrub",
                        onStartScrub: "{controllers}.events.onStartScrub"
                    },
                    listeners: {
                        onReady: "{controllers}.events.onScrubberReady"
                    }
                }
            },
            volumeControl: {
                type: "fluid.videoPlayer.volumeControls",
                container: "{controllers}.dom.volumeContainer",
                options: {
                    model: "{controllers}.model",
                    applier: "{controllers}.applier",
                    listeners: {
                        onReady: "{controllers}.events.onVolumeReady"
                    }
                }
            },
            captionControls: {
                type: "fluid.emptyEventedSubcomponent",
                options: {
                    listeners: {
                        onReady: "{controllers}.events.onCaptionControlsReady"
                    }
                }
            },
            transcriptControls: {
                type: "fluid.videoPlayer.languageControls",
                container: "{controllers}.dom.transcriptControlsContainer",
                options: {
                    languages: "{controllers}.options.transcripts",
                    model: "{controllers}.model",
                    applier: "{controllers}.applier",
                    showHidePath: "displayTranscripts",
                    currentLanguagePath: "currentTracks.transcripts",
                    styles: {
                        button: "fl-videoPlayer-transcripts-button",
                        buttonWithShowing: "fl-videoPlayer-transcripts-button-on"
                    },
                    strings: {
                        showLanguage: "Show Transcripts",
                        hideLanguage: "Hide Transcripts",
                        press: "Transcripts",
                        release: "Transcripts"
                    },
                    events: {
                        onControlledElementReady: "{controllers}.events.onTranscriptsReady",
                        onReady: "{controllers}.events.onTranscriptControlsReady"
                    },
                    templates: {
                        menuButton: {
                            href: "{controllers}.options.templates.menuButton.href"
                        }
                    }
                }
            },
            playButton: {
                type: "fluid.toggleButton",
                container: "{controllers}.container",
                options: {
                    selectors: {
                        button: ".flc-videoPlayer-play",
                        label: ".flc-videoPlayer-play-label"
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
                    applier: "{controllers}.applier",
                    listeners: {
                        onReady: "{controllers}.events.onPlayReady"
                    }
                }
            },
            fullScreenButton: {
                type: "fluid.emptyEventedSubcomponent",
                options: {
                    listeners: {
                        onReady: "{controllers}.events.onFullScreenReady"
                    }
                }
            }
        },
        finalInitFunction: "fluid.videoPlayer.controllers.finalInit",
        events: {
            onStartTimeChange: null,
            afterTimeChange: null,
            onMarkupReady: null,
            onScrub: null,
            onStartScrub: null,
            afterScrub: null,

            // private event used for associating transcript menu with transcript via ARIA
            onTranscriptsReady: null,
            onCaptionsReady: null,

            // aggregating all subcomponent's ready events for the main controllers onReady
            onPlayReady: null,
            onVolumeReady: null,
            onScrubberReady: null,
            onCaptionControlsReady: null,
            onTranscriptControlsReady: null,
            onFullScreenReady: null,
            onReady: {
                events: {
                    playReady: "onPlayReady",
                    volumeReady: "onVolumeReady",
                    scrubReady: "onScrubberReady",
                    captionControlsReady: "onCaptionControlsReady",
                    transcriptControlsReady: "onTranscriptControlsReady",
                    fullScreenReady: "onFullScreenReady"
                },
                args: ["{controllers}"]
            }
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
        },
        
        invokers: {
            showHideScrubberHandle: { 
                funcName: "fluid.videoPlayer.controllers.showHideScrubberHandle", 
                args: ["{controllers}", "{controllers}.model.totalTime"]
            }
        }
    });

    var fullScreenButtonOptions = {
        selectors: {
            button: ".flc-videoPlayer-fullscreen",
            label: ".flc-videoPlayer-fullscreen-label"
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
        applier: "{controllers}.applier",
        listeners: {
            onReady: "{controllers}.events.onFullScreenReady"
        }
    };

    var captionControlsOptions = {
        languages: "{controllers}.options.captions",
        model: "{controllers}.model",
        applier: "{controllers}.applier",
        showHidePath: "displayCaptions",
        currentLanguagePath: "currentTracks.captions",
        styles: {
            button: "fl-videoPlayer-captions-button",
            buttonWithShowing: "fl-videoPlayer-captions-button-on"
        },
        strings: {
            showLanguage: "Show Captions",
            hideLanguage: "Hide Captions",
            press: "Captions",
            release: "Captions"
        },
        events: {
            onControlledElementReady: "{controllers}.events.onCaptionsReady",
            onReady: "{controllers}.events.onCaptionControlsReady"
        },
        templates: {
            menuButton: {
                href: "{controllers}.options.templates.menuButton.href"
            }
        }
    };

    fluid.demands("fullScreenButton", ["fluid.browser.supportsFullScreen"], {
        funcName: "fluid.toggleButton",
        args: ["{controllers}.container", fullScreenButtonOptions]
    });
    fluid.demands("captionControls", ["fluid.browser.supportsHtml5"], {
        funcName: "fluid.videoPlayer.languageControls",
        args: ["{controllers}.dom.captionControlsContainer", captionControlsOptions]
    });

    fluid.videoPlayer.controllers.showHideScrubberHandle = function (that, totalTime) {
        that.applier.requestChange("isShown.scrubber.handle", !!totalTime);
    };
    
    fluid.videoPlayer.controllers.finalInit = function (that) {
        bindControllerModel(that);
        that.showHideScrubberHandle();
        
        that.applier.modelChanged.addListener("totalTime", that.showHideScrubberHandle);
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
        that.applier.modelChanged.addListener("totalTime", that.updateMax);

        // Bind to the video's timeupdate event so we can programmatically update the slider.
        that.applier.modelChanged.addListener("currentTime", that.updateCurrent);
        that.applier.modelChanged.addListener("bufferEnd", that.updateBuffered);

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
        });
        
        // TODO: This in inherited. Do we need to add aria to sliders ourselves?
        that.locate("handle").attr({
            "aria-label": that.options.strings.scrubber,
            "aria-valuemin": 0,
            "aria-valuemax": 0,
            "aria-valuenow": 0,
            "aria-valuetext": 0,
            "role": "slider"
        });
        return scrubber;
    };

    fluid.defaults("fluid.videoPlayer.controllers.scrubber", {
        gradeNames: ["fluid.viewComponent", "fluid.videoPlayer.showHide", "autoInit"],
        finalInitFunction: "fluid.videoPlayer.controllers.scrubber.finalInit",
        showHidePath: "scrubber",
        components: {
            bufferedProgress: {
                type: "fluid.progress",
                container: "{scrubber}.dom.bufferedProgress",
                options: {
                    initiallyHidden: false,
                    minWidth: 0,
                    listeners: {
                        onAttach: "{scrubber}.events.onProgressAttached"
                    }
                }
            }
        },
        events: {
            afterScrub: null,
            onScrub: null,
            onStartScrub: null,
            onProgressAttached: null,
            onReady: {
                events: {
                    onProgressAttached: "onProgressAttached",
                    onCreate: "onCreate"
                },
                args: ["{scrubber}"]
            }
        },
        invokers: {
            updateBuffered: {
                funcName: "fluid.videoPlayer.controllers.scrubber.updateBuffered",
                args: ["{fluid.videoPlayer.controllers.scrubber}"]
            }
        },
        selectors: {
            totalTime: ".flc-videoPlayer-total",
            currentTime: ".flc-videoPlayer-current",
            scrubber: ".flc-videoPlayer-scrubber",
            handle: ".ui-slider-handle",
            bufferedProgress: ".flc-videoPlayer-buffered-progress",
            bufferedProgressBar: ".flc-progress-bar"
        },
        // TODO: Strings should be moved out into a single top-level bundle (FLUID-4590)
        strings: {
            scrubber: "Time scrub"
        }
    });

    // The flag that stops the buffer progress update once the video is fully buffered.
    var bufferCompleted = false;
    
    fluid.videoPlayer.controllers.scrubber.updateBuffered = function (that) {
        var lastBufferedTime = that.model.bufferEnd;
        var totalTime = that.model.totalTime;

        // Turn on buffer progress update if the re-buffering is triggered, for instance, 
        // by rewinding back
        if (lastBufferedTime !== totalTime) {
            bufferCompleted = false;
        }
        
        if (totalTime && lastBufferedTime && !bufferCompleted) {
            var percent = Math.round(lastBufferedTime / totalTime * 100);
            
            // Explicitly setting the width of .flc-progress-bar is a work-around for the Chrome/IE9 issue
            // that the width of the progress div is reduced at the controller bar slide-up
            that.locate("bufferedProgressBar").width(that.model.videoWidth);
            that.bufferedProgress.update(percent);
            
            // Stops the buffer progress from being kept updated once the progress reaches 100%
            if (lastBufferedTime === totalTime) {
                bufferCompleted = true;
            }
        }
    };

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

    };

    fluid.videoPlayer.controllers.scrubber.finalInit = function (that) {
        createScrubberMarkup(that);
        bindScrubberDOMEvents(that);
        bindScrubberModel(that);
    };
    

    /********************************************************
    * Volume Control: a button that turns into a slider     *
    *           To control the volume                       *
    *********************************************************/
    
    fluid.registerNamespace("fluid.videoPlayer.volumeControls");
    
    fluid.videoPlayer.volumeControls.bindDOMEvents = function (that) {
        // Bind the volume Control slide event to change the video's volume and its image.
        var volumeControl = that.locate("volumeControl");
        var muteButton = that.muteButton;
        var tooltip = muteButton.tooltip;

        fluid.each(["slide", "slidechange"], function (value) {
            volumeControl.bind(value, function (evt, ui) {
                fluid.fireSourcedChange(that.applier, "volume", ui.value, "slider");
            });
        });

        volumeControl.mouseenter(function () {
            tooltip.updateContent(that.options.strings.volume);
        });

        volumeControl.mouseleave(function () {
            tooltip.updateContent(muteButton.tooltipContentFunction);
        });
    };
    
    fluid.videoPlayer.updateMuteStatus = function (that) {
        return function (newModel, oldModel) {
            if (!that.applier.hasChangeSource("mute")) {
                if (that.model.volume === 0) {
                    that.oldVolume = oldModel.volume;
                    fluid.fireSourcedChange(that.applier, "muted", true, "volume");
                } else if (that.model.muted) {
                    fluid.fireSourcedChange(that.applier, "muted", false, "volume");
                }
            }
        };
    };

    fluid.videoPlayer.volumeControls.bindModel = function (that) {
        // Relay non-slider based volume changes to slider, and all volume changes to mute status
        fluid.addSourceGuardedListener(that.applier, "volume", "slider", that.updateSlider);
        that.applier.modelChanged.addListener("volume", fluid.videoPlayer.updateMuteStatus(that));

        that.applier.modelChanged.addListener("canPlay", function () {
            that.locate("mute").attr("disabled", !that.model.canPlay);
        });

        that.applier.modelChanged.addListener("muted", function (newModel, oldModel) {
            // See updateVolume method for converse logic
            if (oldModel.volume > 0) {
                that.oldVolume = oldModel.volume;
            }
            var fromVolume = that.applier.hasChangeSource("volume");
            if (!fromVolume) { 
                var isMuting = newModel.muted;
                if (isMuting) {
                    // If this mute event was not already sourced from a volume change, fire volume to 0
                    fluid.fireSourcedChange(that.applier, "volume", 0, "mute");
                } else {
                    fluid.fireSourcedChange(that.applier, "volume", that.oldVolume, "mute");              
                }
            }
        });
    };

    fluid.videoPlayer.volumeControls.init = function (that) {
        var volumeControl = that.locate("volumeControl");
        var mute = that.locate("mute");

        volumeControl.addClass(that.options.styles.volumeControl);
        volumeControl.slider({
            orientation: "vertical",
            range: "min",
            min: that.model.minVolume,
            max: that.model.maxVolume,
            value: that.model.volume
        });
        var handle = that.locate("handle");

        // TODO: This in inherited. Do we need to add aria to sliders ourselves?
        handle.attr({
            "aria-label": that.options.strings.volume,
            "aria-valuemin": that.model.minVolume,
            "aria-valuemax": that.model.maxVolume,
            "aria-valuenow": that.model.volume,
            "aria-valuetext": that.model.volume + "%",
            "role": "slider"
        });

        fluid.tabindex(that.container, 0);
        fluid.tabindex(mute, -1);
        fluid.tabindex(volumeControl, -1);
        fluid.tabindex(handle, -1);

        fluid.activatable(that.container, function (evt) {
            that.muteButton.press();
        }, {
            additionalBindings: [{
                key: $.ui.keyCode.UP,
                activateHandler: function () {
                    volumeControl.slider("value", volumeControl.slider("value") + 1);
                    return false;
                }
            }, {
                key: $.ui.keyCode.DOWN,
                activateHandler: function () {
                    volumeControl.slider("value", volumeControl.slider("value") - 1);
                    return false;
                }
            }]
        });

        that.container.attr("aria-label", that.options.strings.instructions);
        mute.attr("title", that.options.strings.instructions);
    };

    fluid.defaults("fluid.videoPlayer.volumeControls", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        postInitFunction: "fluid.videoPlayer.volumeControls.postInit",
        finalInitFunction: "fluid.videoPlayer.volumeControls.finalInit",
        events: {
            muteButtonReady: null,
            onReady: {
                events: {
                    muteButtonReady: "muteButtonReady",
                    onCreate: "onCreate"
                },
                args: ["{volumeControls}"]
            }
        },
        model: {
            muted: false,
            volume: 50,
            minVolume: 0,
            maxVolume: 100
        },
        unmuteVolume: 10,
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
            volume: "Volume",
            instructions: "Volume controls. Use up and down arrows to adjust volume, space or enter to mute."
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
                    applier: "{volumeControls}.applier",
                    modelPath: "muted",
                    components: {
                        tooltip: {
                            container: "{volumeControls}.container"
                        }
                    },
                    listeners: {
                        onReady: "{volumeControls}.events.muteButtonReady"
                    } 
                }
            }
        }
    });

    fluid.videoPlayer.volumeControls.postInit = function (that) {
        that.options.components.muteButton.container = that.container;
        that.oldVolume = that.options.unmuteVolume;

        that.updateSlider = function () {
            var volume = that.model.volume;
            var volumeControl = that.locate("volumeControl");
            volumeControl.slider("value", volume);
            that.locate("handle").attr({
                "aria-valuenow": volume,
                "aria-valuetext": Math.round(volume) + "%"
            });
        };
    };

    fluid.videoPlayer.volumeControls.finalInit = function (that) {
        var volumeControls = fluid.videoPlayer.volumeControls;

        volumeControls.init(that);
        volumeControls.bindDOMEvents(that);
        volumeControls.bindModel(that);
    };

    /********************************************************************************
     * Evented empty subcomponent: an empty subcomponent that fires an onReady event
     */
    fluid.defaults("fluid.emptyEventedSubcomponent", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        events: {
            onReady: {
                events: {
                    onCreate: "onCreate"
                },
                args: ["{emptyEventedSubcomponent}"]
            }
        }
    });

})(jQuery);
