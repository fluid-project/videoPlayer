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

/*global jQuery, fluid_1_5*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_5 = fluid_1_5 || {};

(function ($, fluid) {

    /**
     * controllers is a video controller containing a play button, a time scrubber, 
     *      a volume controller, a button to put captions on/off
     *      , a button to put transcripts on/off
     * 
     * @param {Object} container the container which this component is rooted
     * @param {Object} options configuration options for the component
     */
    fluid.registerNamespace("fluid.videoPlayer.controllers");
    
    fluid.videoPlayer.controllers.togglePlayDependentControls = function (that) {
        that.locate("play").attr("disabled", !that.model.canPlay);
        that.locate("fullscreen").attr("disabled", !that.model.canPlay);
    };

    fluid.videoPlayer.controllers.supportFullscreen = function () {
        var fullscreenFnNames = ["requestFullScreen", "mozRequestFullScreen", "webkitRequestFullScreen", "oRequestFullScreen", "msieRequestFullScreen"];
        
        return fluid.find(fullscreenFnNames, function (name) {
            return !!$("<div></div>")[0][name] || undefined;
        });
    };
    
    fluid.enhance.check({
        "fluid.browser.supportsFullScreen": "fluid.videoPlayer.controllers.supportFullscreen",
        "fluid.browser.nativeVideoSupport": "fluid.browser.nativeVideoSupport"
    });

    fluid.defaults("fluid.videoPlayer.controllers", { 
        gradeNames: ["fluid.viewRelayComponent", "autoInit", "{that}.getCaptionGrade", "{that}.getFullScreenGrade"],
        modelListeners: {
            canPlay: {
                funcName: "fluid.videoPlayer.controllers.togglePlayDependentControls",
                args: "{controllers}"
            }
        },
        components: {
            scrubber: {
                type: "fluid.videoPlayer.controllers.scrubber",
                container: "{controllers}.dom.scrubberContainer",
                createOnEvent: "afterTemplateLoaded",
                options: {
                    model: {
                        currentTime: "{controllers}.model.currentTime",
                        scrubTime: "{controllers}.model.scrubTime",
                        totalTime: "{controllers}.model.totalTime",
                        bufferEnd: "{controllers}.model.bufferedEnd",
                        canPlay: "{controllers}.model.canPlay",
                        isShown: "{controllers}.model.isShown"
                    },
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
                type: "fluid.videoPlayer.controllers.volumeControls",
                container: "{controllers}.dom.volumeContainer",
                createOnEvent: "afterTemplateLoaded",
                options: {
                    model: {
                        canPlay: "{controllers}.model.canPlay",
                        muted: "{controllers}.model.muted",
                        volume: "{controllers}.model.volume",
                        minVolume: "{controllers}.model.minVolume",
                        maxVolume: "{controllers}.model.maxVolume"
                    },
                    listeners: {
                        onReady: "{controllers}.events.onVolumeReady"
                    }
                }
            },
            captionControls: {
                type: "fluid.emptyEventedSubcomponent",
                createOnEvent: "afterTemplateLoaded",
                options: {
                    listeners: {
                        onReady: "{controllers}.events.onCaptionControlsReady"
                    }
                }
            },
            transcriptControls: {
                type: "fluid.videoPlayer.languageControls",
                container: "{controllers}.dom.transcriptControlsContainer",
                createOnEvent: "afterTemplateLoaded",
                options: {
                    languages: "{controllers}.options.transcripts",
                    model: {
                        showLanguage: "{controllers}.model.displayTranscripts",
                        currentLanguage: "{controllers}.model.currentTracks.transcripts"
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
                createOnEvent: "afterTemplateLoaded",
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
                    model: {
                        pressed: "{controllers}.model.play"
                    },
                    listeners: {
                        onAttach: "{controllers}.events.onPlayReady"
                    }
                }
            },
            fullScreenButton: {
                type: "fluid.emptyEventedSubcomponent",
                createOnEvent: "afterTemplateLoaded",
                options: {
                    model: {
                        pressed: "{controllers}.model.fullscreen"
                    },
                    listeners: {
                        onCreate: "{controllers}.events.onFullScreenReady"
                    }
                }
            }
        },
        events: {
            afterTemplateLoaded: null,
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
                    templateLoaded: "afterTemplateLoaded",
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
                funcName: "fluid.videoPlayer.controllers.scrubber.showHideHandle", 
                args: ["{scrubber}", "{arguments}.0.totalTime"]
            },
            getCaptionGrade: {
                funcName: "fluid.videoPlayer.controllers.getCaptionGrade"
            },
            getFullScreenGrade: {
                funcName: "fluid.videoPlayer.controllers.getFullScreenGrade"
            }
        },
        
        templates: {
            controllers: {
                forceCache: true,
                href: "../html/videoPlayer_controllers_template.html"
            }
        },

        listeners: {
            onCreate: {
                listener: "fluid.videoPlayer.controllers.loadTemplates",
                args: ["{that}"]
            }
        }
    });

    fluid.defaults("fluid.videoPlayer.controllers.fullScreenButton", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            fullScreenButton: {
                type: "fluid.toggleButton",
                container: "{controllers}.container",
                createOnEvent: "afterTemplateLoaded",
                options: {
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
                    model: {
                        pressed: "{controllers}.model.fullscreen"
                    },
                    listeners: {
                        onCreate: "{controllers}.events.onFullScreenReady"
                    }
                }
            }
        }
    });

    fluid.defaults("fluid.videoPlayer.controllers.captionControls", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            captionControls: {
                type: "fluid.videoPlayer.languageControls",
                container: "{controllers}.dom.captionControlsContainer",
                createOnEvent: "afterTemplateLoaded",
                options: {
                    languages: "{controllers}.options.captions",
                    model: {
                        showLanguage: "{controllers}.model.displayCaptions",
                        currentLanguage: "{controllers}.model.currentTracks.captions"
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
                    },
                    events: {
                        onControlledElementReady: "{controllers}.events.onCaptionsReady"
                    },
                    templates: {
                        menuButton: {
                            href: "{controllers}.options.templates.menuButton.href"
                        }
                    }
                }
            }
        }
    });

    fluid.videoPlayer.controllers.getFullScreenGrade = function () {
        return fluid.videoPlayer.getGrade("fluid.browser.supportsFullScreen", "fluid.videoPlayer.controllers.fullScreenButton");
    };

    fluid.videoPlayer.controllers.getCaptionGrade = function () {
        return fluid.videoPlayer.getGrade("fluid.browser.nativeVideoSupport", "fluid.videoPlayer.controllers.captionControls");
    };

    fluid.videoPlayer.controllers.loadTemplates = function (that) {
        var templates = that.options.templates;
        fluid.fetchResources(templates, function () {
            var resourceSpec = templates.controllers;
            
            if (!resourceSpec.fetchError) {
                that.container.append(resourceSpec.resourceText);
                that.events.afterTemplateLoaded.fire();
                
                that.showHideScrubberHandle(that.model);
            }
        });
        
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
        gradeNames: ["fluid.viewRelayComponent", "fluid.videoPlayer.showHide", "autoInit"],
        model: {
            currentTime: 0,
            scrubTime: 0,
            totalTime: 0,
            bufferEnd: 0,
            canPlay: false,
            isShown: {}
        },
        modelListeners: {
            startTime: {
                funcName: "fluid.videoPlayer.controllers.scrubber.updateMin",
                args: ["{scrubber}"]
            },
            totalTime: [{
                funcName: "fluid.videoPlayer.controllers.scrubber.updateMax",
                args: ["{scrubber}"]
            },{
                funcName: "fluid.videoPlayer.controllers.scrubber.showHideHandle", 
                args: ["{scrubber}", "{arguments}.0.value"]
            }],
            currentTime: {
                funcName: "fluid.videoPlayer.controllers.scrubber.updateCurrent",
                args: ["{scrubber}"]
            },
            bufferedEnd: {
                funcName: "fluid.videoPlayer.controllers.scrubber.updateBuffered",
                args: ["{fluid.videoPlayer.controllers.scrubber}"]
            },
            canPlay: {
                funcName: "fluid.videoPlayer.controllers.scrubber.syncState",
                args: ["{scrubber}"]
            }
        },
        events: {
            afterScrub: null,
            onScrub: null,
            onStartScrub: null,
            onProgressAttached: null,
            afterInit: null,
            onReady: {
                events: {
                    onProgressAttached: "onProgressAttached",
                    afterInit: "afterInit"
                },
                args: ["{scrubber}"]
            }
        },
        listeners: {
            onCreate: {
                listener: "fluid.videoPlayer.controllers.scrubber.init",
                args: ["{scrubber}"]
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
        },
        showHidePath: "scrubber",
        invokers: {
            updateBuffered: {
                funcName: "fluid.videoPlayer.controllers.scrubber.updateBuffered",
                args: ["{fluid.videoPlayer.controllers.scrubber}"]
            },
            updateMin: {
                funcName: "fluid.videoPlayer.controllers.scrubber.updateMin",
                args: ["{scrubber}"]
            },
            updateMax: {
                funcName: "fluid.videoPlayer.controllers.scrubber.updateMax",
                args: ["{scrubber}"]
            },
            updateCurrent: {
                funcName: "fluid.videoPlayer.controllers.scrubber.updateCurrent",
                args: ["{scrubber}"]
            },
            syncState: {
                funcName: "fluid.videoPlayer.controllers.scrubber.syncState",
                args: ["{scrubber}"]
            },
            refresh: {
                funcName: "fluid.videoPlayer.controllers.scrubber.refresh",
                args: ["{scrubber}"]
            }
        },
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
        }
    });

    // The flag that stops the buffer progress update once the video is fully buffered.
    var bufferCompleted = false;

    fluid.videoPlayer.controllers.scrubber.updateBuffered = function (that) {
        if (!that.modelRelay || that.modelRelay.__CURRENTLY_IN_EVALUATION__) {
            return;
        }
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

    fluid.videoPlayer.controllers.scrubber.updateMin = function (that) {
        if (!that.modelRelay || that.modelRelay.__CURRENTLY_IN_EVALUATION__) {
            return;
        }
        var startTime = that.model.startTime || 0;
        var scrubber = that.locate("scrubber");
        scrubber.slider("option", "min", startTime + that.model.currentTime);
        that.locate("handle").attr({
            "aria-valuemin": startTime + that.model.currentTime
        });
    };

    fluid.videoPlayer.controllers.scrubber.updateMax = function (that) {
        if (!that.modelRelay || that.modelRelay.__CURRENTLY_IN_EVALUATION__) {
            return;
        }
        updateTime(that, "totalTime");
        var scrubber = that.locate("scrubber");
        scrubber.slider("option", "max", that.model.totalTime);
        that.locate("handle").attr({
            "aria-valuemax": that.model.totalTime
        });
    };

    fluid.videoPlayer.controllers.scrubber.updateCurrent = function (that) {
        if (!that.modelRelay || that.modelRelay.__CURRENTLY_IN_EVALUATION__) {
            return;
        }
        updateTime(that, "currentTime");
        var scrubber = that.locate("scrubber");
        scrubber.slider("value", that.model.currentTime);
        that.locate("handle").attr({
            "aria-valuenow": that.model.currentTime,
            "aria-valuetext": fluid.videoPlayer.formatTime(that.model.currentTime) + " of " + fluid.videoPlayer.formatTime(that.model.totalTime)
        });
    };

    fluid.videoPlayer.controllers.scrubber.syncState = function (that) {
        if (!that.modelRelay || that.modelRelay.__CURRENTLY_IN_EVALUATION__) {
            return;
        }
        var scrubber = that.locate("scrubber");
        if (that.model.canPlay === true) {
            scrubber.slider("enable");
        } else {
            scrubber.slider("disable");
        }
    };

    fluid.videoPlayer.controllers.scrubber.showHideHandle = function (scrubber, totalTime) {
        scrubber.applier.change("isShown.scrubber.handle", !!totalTime);
    };

    fluid.videoPlayer.controllers.scrubber.refresh = function (that) {
        that.updateMin();
        that.updateMax();
        that.updateCurrent();
        that.syncState();
    };

    fluid.videoPlayer.controllers.scrubber.init = function (that) {
        createScrubberMarkup(that);
        bindScrubberDOMEvents(that);
        that.refresh();
        that.events.afterInit.fire();
    };

    /********************************************************
    * Volume Control: a button that turns into a slider     *
    *           To control the volume                       *
    *********************************************************/
    fluid.defaults("fluid.videoPlayer.controllers.volumeControls", {
        gradeNames: ["fluid.viewRelayComponent", "autoInit"],
        model: {
            muted: false,
            volume: 50,
            minVolume: 0,
            maxVolume: 100
        },
        modelListeners: {
            volume: [{
                funcName: "fluid.videoPlayer.controllers.volumeControls.updateMuteStatus",
                args: ["{volumeControls}", "{change}.value", "{change}.oldValue", "{change}"]
            }, {
                funcName: "fluid.videoPlayer.controllers.volumeControls.updateSlider",
                args: ["{volumeControls}", "{change}.value", "{change}.oldValue"]
            }],
            canPlay: {
                funcName: "fluid.videoPlayer.controllers.volumeControls.enableMuteButton",
                args: "{volumeControls}"
            },
            muted: {
                funcName: "fluid.videoPlayer.controllers.volumeControls.handleMute",
                args: ["{volumeControls}", "{change}.value", "{change}.oldValue", "{change}"]
            }
        },
        events: {
            muteButtonReady: null,
            afterSetup: null,
            onReady: {
                events: {
                    muteButtonReady: "muteButtonReady",
                    afterSetup: "afterSetup"
                },
                args: ["{volumeControls}"]
            }
        },
        listeners: {
            onCreate: [{
                listener: "fluid.videoPlayer.controllers.volumeControls.setup",
                args: ["{volumeControls}"]
            }]
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
            volume: "Volume",
            instructions: "Volume controls. Use up and down arrows to adjust volume, space or enter to mute."
        },
        unmuteVolume: 10,
        members: {
            oldVolume: "{that}.options.unmuteVolue"
        },
        invokers: {
            updateSlider: {
                funcName: "fluid.videoPlayer.controllers.volumeControls.updateSlider",
                args: ["{volumeControls}"]
            },
            
        },
        components: {
            muteButton: {
                type: "fluid.toggleButton",
                container: "{volumeControls}.container",
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
                    model: {
                        pressed: "{volumeControls}.model.muted"
                    },
                    components: {
                        tooltip: {
                            container: "{volumeControls}.container"
                        }
                    },
                    listeners: {
                        onCreate: "{volumeControls}.events.muteButtonReady"
                    } 
                }
            }
        }
    });
    
    fluid.videoPlayer.controllers.volumeControls.updateMuteStatus = function (that, newVolume, oldVolume, change) {
        if (that.modelRelay.__CURRENTLY_IN_EVALUATION__) {
            // skip the initial transaction
            return;
        }
        if (that.model.volume === 0) {
            that.oldVolume = oldVolume;
            that.applier.change("muted", true);
        } else if (that.model.muted) {
            that.applier.change("muted", false);
        }
    };

    fluid.videoPlayer.controllers.volumeControls.enableMuteButton = function (that) {
        that.locate("mute").attr("disabled", !that.model.canPlay);
    };

    fluid.videoPlayer.controllers.volumeControls.handleMute = function (that, newMuteValue, oldMuteValue, change) {
        if (that.modelRelay.__CURRENTLY_IN_EVALUATION__) {
            // skip the initial transaction
            return;
        }
        // See updateVolume method for converse logic
        if (that.model.volume > 0) {
            that.oldVolume = that.model.volume;
        }
        if (newMuteValue) {
            that.applier.change("volume", 0);
        } else {
            that.applier.change("volume", that.oldVolume);
        }
    };

    fluid.videoPlayer.controllers.volumeControls.setup = function (that) {
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

        // Bind the volume Control slide event to change the video's volume and its image.
        var volumeControl = that.locate("volumeControl");
        var muteButton = that.muteButton;
        var tooltip = muteButton.tooltip;

        fluid.each(["slide", "slidechange"], function (value) {
            volumeControl.bind(value, function (evt, ui) {
                if (ui.value !== that.model.volume) {
                    that.applier.change("volume", ui.value);
                }
            });
        });

        volumeControl.mouseenter(function () {
            tooltip.updateContent(that.options.strings.volume);
        });

        volumeControl.mouseleave(function () {
            tooltip.updateContent(muteButton.tooltipContentFunction);
        });
        that.events.afterSetup.fire();
    };
    

    fluid.videoPlayer.controllers.volumeControls.updateSlider = function (that, newValue, oldValue) {
        if (that.modelRelay.__CURRENTLY_IN_EVALUATION__) {
            // skip the initial transaction
            return;
        }
        var volumeControl = that.locate("volumeControl");
        var volume = that.model.volume;
        volumeControl.slider("value", volume);
        that.locate("handle").attr({
            "aria-valuenow": volume,
            "aria-valuetext": Math.round(volume) + "%"
        });
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

})(jQuery, fluid_1_5);
