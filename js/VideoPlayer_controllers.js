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
     * 
     * @param {Object} container the container which this component is rooted
     * @param {Object} options configuration options for the component
     */
    //add all the modelChanged listener to the applier
    var bindControllerModel = function (that) {
        that.applier.modelChanged.addListener("states.canPlay", function () {
            that.locate("play").attr("disabled", !that.model.states.canPlay);
            that.locate("fullscreen").attr("disabled", !that.model.states.canPlay);
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
                        onScrub: "{controllers}.events.onTimeChange",
                        afterScrub: "{controllers}.events.afterTimeChange",
                        onStartScrub: "{controllers}.events.onStartTimeChange"
                    }
                }
            },
            volumeControl: {
                type: "fluid.videoPlayer.controllers.volumeControls",
                container: "{controllers}.dom.volumeContainer",
                options: {
                    model: "{controllers}.model",
                    applier: "{controllers}.applier",
                    events: {
                        onChange: "{controllers}.events.onVolumeChange"
                    }
                }
            },
            captionControls: {
                type: "fluid.videoPlayer.controllers.captionControls",
                container: "{controllers}.dom.captionControlsContainer",
                options: {
                    model: "{controllers}.model",
                    applier: "{controllers}.applier"
                }
            },
            playButton: {
                type: "fluid.videoPlayer.controllers.toggleButton",
                container: "{controllers}.container",
                options: {
                    selectors: {
                        button: ".flc-videoPlayer-play"
                    },
                    styles: {
                        pressed: "fl-videoPlayer-playing",
                        released: "fl-videoPlayer-paused"
                    },
                    strings: {
                        press: "Play",
                        release: "Pause"
                    },
                    model: "{controllers}.model",
                    modelPath: "states.play",
                    applier: "{controllers}.applier"
                }
            },
            fullScreenButton: {
                type: "fluid.videoPlayer.controllers.toggleButton",
                container: "{controllers}.container",
                options: {
                    selectors: {
                        button: ".flc-videoPlayer-fullscreen"
                    },
                    styles: {
                        pressed: "fl-videoPlayer-fullscreen-on",
                        released: "fl-videoPlayer-fullscreen-off"
                    },
                    strings: {
                        press: "Full screen",
                        release: "Exit full screen mode"
                    },
                    model: "{controllers}.model",
                    modelPath: "states.fullscreen",
                    applier: "{controllers}.applier"
                }
            }
        },
        finalInitFunction: "fluid.videoPlayer.controllers.finalInit",
        events: {
            onControllersReady: null,
            onVolumeChange: null,
            onStartTimeChange: null,
            onTimeChange: null,
            afterTimeChange: null
        },

        selectors: {
            play: ".flc-videoPlayer-play",
            scrubberContainer: ".flc-videoPlayer-scrubberContainer",
            volumeContainer: ".flc-videoPlayer-volumeContainer",
            captionControlsContainer: ".flc-videoPlayer-captionControls-container",
            fullscreen: ".flc-videoPlayer-fullscreen"
        },

        styles: {
            fullscreenOn: "fl-videoPlayer-state-fullscreenOn",
            fullscreenOff: "fl-videoPlayer-state-fullscreenOff",
            fullscreenIcon: "ui-icon-extlink",
            captionIcon: "ui-icon-comment"
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
        
    //change the text of the selected time
    var updateTime = function (that, element) {
        var time = that.locate(element);
        time.text(fluid.videoPlayer.formatTime(that.model.states[element]));
    };
    
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

    var bindScrubberModel = function (that) {
        that.applier.modelChanged.addListener("states.currentTime", that.updateCurrentTime);
        that.applier.modelChanged.addListener("states.totalTime", that.updateTotalTime);

        // Setup the scrubber when we know the duration of the video.
        that.applier.modelChanged.addListener("states.startTime", that.updateMin);
        that.applier.modelChanged.addListener("states.startTime", that.updateMax);
        that.applier.modelChanged.addListener("states.totalTime", that.updateMax);

        // Bind to the video's timeupdate event so we can programmatically update the slider.
        that.applier.modelChanged.addListener("states.currentTime", that.updateCurrent);

        that.applier.modelChanged.addListener("states.canPlay", function () {
            var scrubber = that.locate("scrubber");
            if (that.model.states.canPlay === true) {
                scrubber.slider("enable");
            } else {
                scrubber.slider("disable");
            }
        });
    };

    var createScrubberMarkup = function (that) {
        var scrubber = that.locate("scrubber");
        scrubber.slider({
            unittext: "seconds",
            disabled: true
        }).attr({
            "role": "slider"
        });
        
        scrubber.find(".ui-slider-handle").attr({
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
            scrubber: ".flc-videoPlayer-scrubber"
        },
        strings: {
            scrubber: "Time scrub"
        }
    });

    fluid.videoPlayer.controllers.scrubber.postInit = function (that) {
        that.updateCurrentTime = function () {
            that.locate("currentTime").text(that.model.states.currentTime);
        };

        that.updateTotalTime = function () {
            that.locate("totalTime").text(that.model.states.totalTime);
        };

        that.updateMin = function () {
            var startTime = that.model.states.startTime || 0;
            var scrubber = that.locate("scrubber");
            scrubber.slider("option", "min", startTime + that.model.states.currentTime);
            scrubber.find(".ui-slider-handle").attr({
                "aria-valuemin": startTime + that.model.states.currentTime
            });
        };

        that.updateMax = function () {
            updateTime(that, "totalTime");
            var scrubber = that.locate("scrubber");
            scrubber.slider("option", "max", that.model.states.totalTime);
            scrubber.find(".ui-slider-handle").attr({
                "aria-valuemax": that.model.states.totalTime
            });
        };

        that.updateCurrent = function () {
            updateTime(that, "currentTime");
            var scrubber = that.locate("scrubber");
            scrubber.slider("value", that.model.states.currentTime);
            scrubber.find(".ui-slider-handle").attr({
                "aria-valuenow": that.model.states.totalTime,
                "aria-valuetext": fluid.videoPlayer.formatTime(that.model.states.currentTime) + " of " + fluid.videoPlayer.formatTime(that.model.states.totalTime)
            });
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
    var bindVolumeDOMEvents = function (that) {
        // Bind the volume Control slide event to change the video's volume and its image.
        that.locate("volumeControl").bind("slide", function (evt, ui) {
            that.events.onChange.fire(ui.value / 100.0);
        });

        that.locate("volumeControl").bind("slidechange", function (evt, ui) {
            that.events.onChange.fire(ui.value / 100.0);
        });

    };

    var bindVolumeModel = function (that) {
        that.applier.modelChanged.addListener("states.volume", that.updateVolume);
        that.applier.modelChanged.addListener("states.canPlay", function () {
            that.locate("mute").attr("disabled", !that.model.states.canPlay);
        });
    };

    var setUpVolumeControls = function (that) {
        var volumeControl = that.locate("volumeControl");
        volumeControl.addClass(that.options.styles.volumeControl);
        volumeControl.slider({
            orientation: "vertical",
            range: "min",
            min: that.model.states.minVolume,
            max: that.model.states.maxVolume,
            value: that.model.states.volume
        });
        volumeControl.find(".ui-slider-handle").attr({
            "aria-label": that.options.strings.volume,
            "aria-valuemin": that.model.states.minVolume,
            "aria-valuemax": that.model.states.maxVolume,
            "aria-valuenow": that.model.states.volume,
            "aria-valuetext": that.model.states.volume + "%",
            "role": "slider"
        });

        fluid.tabindex(that.container, 0);
        fluid.tabindex(that.locate("mute"), -1);
        fluid.tabindex(volumeControl, -1);

        fluid.activatable(that.container, function (evt) {
            that.muteButton.activate(evt);
        });
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
            onReady: null,
            onChange: null
        },
        model: {
            // TODO: the 'states' is to mimic the videoPlayer model layout
            // Ideally, the volumeControls should operate without requiring that knowledge.
            states: {
                muted: false,
                volume: 50,
                minVolume: 0,
                maxVolume: 100
            }
        },
        selectors: {
            mute: ".flc-videoPlayer-mute",
            volumeControl: ".flc-videoPlayer-volumeControl"
        },
        styles: {
            mute: "fl-videoPlayer-mute",
            volumeControl: "fl-videoPlayer-volumeControl",
            buttonIcon: "ui-icon-signal"
        },
        strings: {
            volume: "Volume"
        },
        components: {
            muteButton: {
                type: "fluid.videoPlayer.controllers.toggleButton",
                options: {
                    selectors: {
                        button: ".flc-videoPlayer-mute"
                    },
                    styles: {
                        pressed: "fl-videoPlayer-muted",
                        released: ""
                    },
                    strings: {
                        press: "Mute",
                        release: "Un-mute"
                    },
                    model: "{volumeControls}.model",
                    modelPath: "states.muted",
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
            var volume = that.model.states.volume;
            var volumeControl = that.locate("volumeControl");
            volumeControl.slider("value", volume);
            volumeControl.find(".ui-slider-handle").attr({
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


    /*****************************************************************************
        Caption controls
        Toggle button plus language selection pull-down
     *****************************************************************************/
    // TODO: show/hide of captions not yet working; turning off just switches to English
    fluid.defaults("fluid.videoPlayer.controllers.captionControls", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        renderOnInit: true,
        rendererOptions: {
            autoBind: true
        },
        finalInitFunction: "fluid.videoPlayer.controllers.captionControls.finalInit",
        produceTree: "fluid.videoPlayer.controllers.captionControls.produceTree",
        events: {
            onReady: null
        },
        model: {
            // TODO: the 'captions' is to mimic the videoPlayer model layout
            // Ideally, the captionControls should operate without requiring that knowledge.
            captions: {
                selection: "none",
                choices: [],
                names: [],
                show: false,
                sources: null,
                conversionServiceUrl: "/videoPlayer/conversion_service/index.php",
                maxNumber: 3,
                track: undefined
            }
        },
        selectors: {
            button: ".flc-videoPlayer-captions-button",
            languageList: ".flc-videoPlayer-captions-languageList",
            languageRow: ".flc-videoPlayer-captions-language",
            languageButton: ".flc-videoPlayer-captions-languageButton",
            languageLabel: ".flc-videoPlayer-captions-languageLabel"
        },
        repeatingSelectors: ["languageRow"],
        selectorsToIgnore: ["languageList"],
        styles: {
            selected: "fl-videoPlayer-caption-selected"
        },
        strings: {
            captionsOff: "Captions OFF",
            turnCaptionsOff: "Turn Captions OFF"
        },
        components: {
            captionButton: {
                type: "fluid.videoPlayer.controllers.toggleButton",
                container: "{captionControls}.container",
                options: {
                    selectors: {
                        button: ".flc-videoPlayer-captions-button"
                    },
                    styles: {
                        pressed: "fl-videoPlayer-caption-active",
                        released: ""
                    },
                    strings: {
                        press: "Captions",
                        release: "Captions"
                    }
                }
            }
        }
    });

    var setUpCaptionControls = function (that) {
        that.captionsOffOption = $(that.locate("languageLabel")[that.model.captions.choices.indexOf("none")]);
        that.locate("languageList").hide();
        that.captionsOffOption.addClass(that.options.styles.selected);
    };

    var bindCaptionDOMEvents = function (that) {
        that.captionButton.events.onPress.addListener(function (evt) {
            that.locate("languageList").toggle();
            // prevent the default onPress handler from toggling the button state:
            //   it should only toggle if the user turns captions on or off
            return false;
        });
    };

    var bindCaptionModel = function (that) {
        that.applier.modelChanged.addListener("captions.selection", function (model, oldModel, changeRequest) {
            var oldSel = oldModel.captions.selection;
            var newSel = model.captions.selection;
            if (oldSel !== newSel) {
                var labels = that.locate("languageLabel");
                $(labels[model.captions.choices.indexOf(oldSel)]).removeClass(that.options.styles.selected);
                $(labels[model.captions.choices.indexOf(newSel)]).addClass(that.options.styles.selected);

                if ((oldSel === "none") || (newSel === "none")) {
                    that.captionButton.toggleState();
                    if (newSel === "none") {
                        that.captionsOffOption.text(that.options.strings.captionsOff);
                    } else if (oldSel === "none") {
                        that.captionsOffOption.text(that.options.strings.turnCaptionsOff);
                    }
                }
            }
            return true;
        }, "captionControls");
    };

    fluid.videoPlayer.controllers.captionControls.finalInit = function (that) {
        setUpCaptionControls(that);
        bindCaptionDOMEvents(that);
        bindCaptionModel(that);
        that.events.onReady.fire(that);
    };

    fluid.videoPlayer.controllers.captionControls.produceTree = function (that) {
        return {
            button: {
                // TODO: Note that until FLUID-4573 is fixed, this binding doesn't actually do anything
                value: "${captions.show}"
            },
            expander: {
                type: "fluid.renderer.selection.inputs",
                rowID: "languageRow",
                labelID: "languageLabel",
                inputID: "languageButton",
                selectID: "captionLanguages",
                tree: {
                    selection: "${captions.selection}",
                    optionlist: "${captions.choices}",
                    optionnames: "${captions.names}"
                }
            }
        };
    };

    /*****************************************************************************
        Toggle button subcomponent
        Used for Play, Mute, Fullscreen, Captions
     *****************************************************************************/
    fluid.defaults("fluid.videoPlayer.controllers.toggleButton", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        postInitFunction: "fluid.videoPlayer.controllers.toggleButton.postInit",
        finalInitFunction: "fluid.videoPlayer.controllers.toggleButton.finalInit",
        events: {
            onPress: "preventable", // listeners can prevent button from becoming pressed
            onReady: null
        },
        selectors: {    // Integrators may override this selector
            button: ".flc-videoPlayer-button"
        },
        styles: {   // Integrators will likely override these styles
            pressed: "fl-videoPlayer-button-pressed",
            released: "fl-videoPlayer-button-released"
        },
        model: {
            pressed: false
        },
        modelPath: "pressed",
        strings: {  // Integrators will likely override these strings
            press: "Press",
            release: "Release"
        }
    });

    fluid.videoPlayer.controllers.toggleButton.postInit = function (that) {
        that.activate = function (evt) {
            that.events.onPress.fire(evt);
        };
        that.toggleButton = function () {
            var button = that.locate("button");
            button.toggleClass(that.options.styles.pressed + " " + that.options.styles.released);
            button.attr("aria-pressed", fluid.get(that.model, that.options.modelPath));
        };
        that.toggleState = function (evt) {
            that.applier.requestChange(that.options.modelPath, !fluid.get(that.model, that.options.modelPath));
            if (evt) {
                evt.stopPropagation();
            }
            return true;
        };
    };

    var setUpToggleButton = function (that) {
        var toggleButton = that.locate("button");
        toggleButton.attr("role", "button").attr("aria-pressed", "false");
        toggleButton.addClass(fluid.get(that.model, that.options.modelPath) ? that.options.styles.pressed : that.options.styles.released);

        that.tooltip = fluid.tooltip(toggleButton, {
            styles: {
                tooltip: "fl-videoPlayer-tooltip"
            },
            content: function () {
                return (fluid.get(that.model, that.options.modelPath) ? that.options.strings.release : that.options.strings.press);
            }
        });
    };

    var bindToggleButtonEvents = function (that) {
        var button = that.locate("button");
        button.click(function (evt) {
            that.activate(evt);
        });

        that.events.onPress.addListener(that.toggleState, undefined, undefined, "last");

        that.applier.modelChanged.addListener(that.options.modelPath, function (model, oldModel, changeReqquest) {
            that.toggleButton();
        });
    };

    fluid.videoPlayer.controllers.toggleButton.finalInit = function (that) {
        setUpToggleButton(that);
        bindToggleButtonEvents(that);
        that.events.onReady.fire(that);
    };
 
})(jQuery);
