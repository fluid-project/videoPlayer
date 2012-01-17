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

    var disableElement = function (jQel) {
        jQel.attr("disabled", "disabled");
    };
    var enableElement = function (jQel) {
        jQel.removeAttr("disabled");
    };

    //change the classes/title/checked of the selected checkbox
    var toggleView = function (that, element) {
        var tag = that.locate(element);
        if (that.model.states[element] === false) {
            tag.removeAttr("checked");
            tag.button("option", "label", that.options.strings[element + "On"]);
            tag.removeClass(that.options.styles[element + "Off"]).addClass(that.options.styles[element + "On"]);                
        } else {
            tag.attr({
                "checked": "checked"
            });
            tag.button("option", "label", that.options.strings[element + "Off"]);
            
            tag.removeClass(that.options.styles[element + "On"]).addClass(that.options.styles[element + "Off"]);
        }
        tag.button("refresh");
    };
    
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
            var playButton = that.locate("play");
            if (that.model.states.canPlay === true) {
                enableElement(playButton);
                that.locate("displayCaptions").button("enable");
                that.locate("fullscreen").button("enable");
            } else {
                disableElement(playButton);
                that.locate("displayCaptions").button("disable");
                that.locate("fullscreen").button("disable");
            }
        });
        that.applier.modelChanged.addListener("states.displayCaptions", that.toggleCaptionsView);
        that.applier.modelChanged.addListener("states.fullscreen", that.toggleFullscreenView);
    };

    var bindControllerDOMEvents = function (that) {
        that.locate("fullscreen").fluid("activatable", function () {
            that.applier.fireChangeRequest({
                "path": "states.fullscreen",
                "value": !that.model.states.fullscreen
            });
        });

        that.locate("displayCaptions").fluid("activatable", function () {
            that.applier.fireChangeRequest({
                "path": "states.displayCaptions",
                "value": !that.model.states.displayCaptions
            });
        });
    };
    
    // TODO: this function should probably be renamed, since it's not really creating markup
    var createControllerMarkup = function (that) {

        that.locate("displayCaptions").button({
            icons: {
                primary: that.options.styles.captionIcon
            },
            disabled: !that.model.states.canPlay,
            text: false,
            label: that.model.states.displayCaptions ? that.options.strings.displayCaptionsOff : that.options.strings.displayCaptionsOn
        });
        that.locate("fullscreen").button({
            icons: {
                primary: that.options.styles.fullscreenIcon
            },
            disabled: !that.model.states.canPlay,
            text: false,
            label: that.model.states.fullscreen ? that.options.strings.fullscreenOff : that.options.strings.fullscreenOn
        });
        
        that.events.onMarkupReady.fire();
    };

    fluid.defaults("fluid.videoPlayer.controllers", { 
        gradeNames: ["fluid.rendererComponent", "autoInit"], 
        postInitFunction: "fluid.videoPlayer.controllers.postInit",
        components: {
            scrubber: {
                type: "fluid.videoPlayer.controllers.scrubber",
                container: "{controllers}.dom.scrubberContainer",
                createOnEvent: "onMarkupReady",
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
                createOnEvent: "onMarkupReady",
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
                createOnEvent: "onMarkupReady",
                options: {
                    model: "{controllers}.model",
                    applier: "{controllers}.applier"
                }
            },
            playButton: {
                type: "fluid.videoPlayer.controllers.toggleButton",
                createOnEvent: "afterRender",
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
                    }
                }
            }
        },
        finalInitFunction: "fluid.videoPlayer.controllers.finalInit",
        events: {
            onControllersReady: null,
            onVolumeChange: null,
            onStartTimeChange: null,
            onTimeChange: null,
            afterTimeChange: null,
            onMarkupReady: null
        },

        selectors: {
            displayCaptions: ".flc-videoPlayer-caption",
            fullscreen: ".flc-videoPlayer-fullscreen",
            scrubberContainer: ".flc-videoPlayer-scrubberContainer",
            volumeContainer: ".flc-videoPlayer-volumeContainer",
            captionControlsContainer: ".flc-videoPlayer-captionControls-container"
        },
        selectorsToIgnore: ["scrubberContainer", "volumeContainer", "captionControlsContainer"],

        styles: {
            displayCaptionsOn: "fl-videoPlayer-state-captionOn",
            displayCaptionsOff: "fl-videoPlayer-state-captionOff",
            fullscreenOn: "fl-videoPlayer-state-fullscreenOn",
            fullscreenOff: "fl-videoPlayer-state-fullscreenOff",
            fullscreenIcon: "ui-icon-extlink",
            captionIcon: "ui-icon-comment"
        },

        strings: {
            displayCaptionsOn: "Captions On",
            displayCaptionsOff: "Captions Off",
            fullscreenOn: "Fullscreen On",
            fullscreenOff: "Fullscreen Off"
        },

        rendererOptions: {
            autoBind: true,
            applier: "{controllers}.applier"
        },

        produceTree: "fluid.videoPlayer.controllers.produceTree"
    });

    fluid.videoPlayer.controllers.produceTree = function (that) {
        var tree = {};
        var value;
        
        for (var item in that.model.states) {
            if (that.options.selectors[item]) {
                tree[item] = {};
                // TODO: this is temporary until the rest of the prototree is redesigned
                if (item === "play") {
                    continue;
                }

                if (item === "fullscreen" || item === "displayCaptions") {
                    tree[item].valuebinding = "states." + item;
                }
                if (item === "displayCaptions" || item === "fullscreen") {
                    value = that.model.states[item] ? "On" : "Off";
                    // render radio buttons
                    tree[item].decorators = {
                        addClass: that.options.styles[item + value]
                    };
                }
            }
        }
        return tree;
    };

    fluid.videoPlayer.controllers.postInit = function (that) {   

        that.toggleCaptionsView = function () {
            toggleView(that, "displayCaptions");
        };

        that.toggleFullscreenView = function () {
            toggleView(that, "fullscreen");
        };

        that.refresh = function () {
            createControllerMarkup(that);
        };
    };

    fluid.videoPlayer.controllers.finalInit = function (that) {
        that.renderer.refreshView();
        createControllerMarkup(that);
        bindControllerModel(that);
        bindControllerDOMEvents(that);

        // TODO: This will not be necessary when we can autobind to a toggle button (FLUID-4573)
        that.playButton.events.onPress.addListener(function () {
            that.applier.requestChange("states.play", !that.model.states.play);
            return true;
        });

        // TODO: This will not be necessary when we can autobind to a toggle button (FLUID-4573)
        that.volumeControl.muteButton.events.onPress.addListener(function () {
            that.applier.requestChange("states.muted", !that.model.states.muted);
            return true;
        });
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
        gradeNames: ["fluid.rendererComponent", "autoInit"],
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
        },
        produceTree: "fluid.videoPlayer.controllers.scrubber.produceTree"
    });

    fluid.videoPlayer.controllers.scrubber.produceTree = function (that) {
        var tree = {
            currentTime: "${states.currentTime}",
            totalTime: "${states.totalTime}",
            scrubber: {}
        };
        
        return tree;
    };

    fluid.videoPlayer.controllers.scrubber.postInit = function (that) {
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
        // show/hide the volume slider on mousein/out and on focus/blur
        that.container.mouseover(that.showVolumeControl).mouseout(that.hideVolumeControl);
        that.container.focus(that.showVolumeControl).blur(that.hideVolumeControl);

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
            if (that.model.states.canPlay === true) {
                that.locate("mute").button("enable");
            } else {
                that.locate("mute").button("disable");
            }
        });
    };

    fluid.videoPlayer.arrowKeys = {
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40
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
        volumeControl.hide();

        fluid.tabindex(that.container, 0);
        fluid.tabindex(that.locate("mute"), -1);
        fluid.tabindex(volumeControl, -1);

        fluid.activatable(that.container, function (evt) {
            that.muteButton.activate(evt);
        });
        that.container.keydown(function (evt) {
            var volumeControl = that.locate("volumeControl");
            var code = evt.which? evt.which : evt.keyCode;
            if ((code === fluid.videoPlayer.arrowKeys.UP)  || (code === fluid.videoPlayer.arrowKeys.RIGHT)) {
                volumeControl.slider("value", volumeControl.slider("value")+1);
            } else if ((code === fluid.videoPlayer.arrowKeys.DOWN)  || (code === fluid.videoPlayer.arrowKeys.LEFT)) {
                volumeControl.slider("value", volumeControl.slider("value")-1);
            } else {
                return true;
            }
            return false;
        });
    };

    fluid.defaults("fluid.videoPlayer.controllers.volumeControls", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        renderOnInit: true,
        postInitFunction: "fluid.videoPlayer.controllers.volumeControls.postInit",
        finalInitFunction: "fluid.videoPlayer.controllers.volumeControls.finalInit",
        produceTree: "fluid.videoPlayer.controllers.volumeControls.produceTree",
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
                        pressed: "fl-videoPlayer-volume-muted",
                        released: "",
                        focused: "fl-videoPlayer-volume-active",
                        notFocused: ""
                    },
                    strings: {
                        press: "Mute",
                        release: "Un-mute"
                    },
                    manageFocusStyling: false
                }
            }
        }
    });

    fluid.videoPlayer.controllers.volumeControls.postInit = function (that) {
        that.options.components.muteButton.container = that.container;
        
        that.showVolumeControl = function () {
            that.muteButton.setStyleFocused();
            that.locate("volumeControl").show();
        };
        that.hideVolumeControl = function () {
            that.muteButton.setStyleNotFocused();
            that.locate("volumeControl").hide();
        };

        that.updateVolume = function () {
            var volume = that.model.states.volume;
            var volumeControl = that.locate("volumeControl");
            volumeControl.slider("value", volume);
            volumeControl.find(".ui-slider-handle").attr({
                "aria-valuenow": that.model.states.volume,
                "aria-valuetext": Math.round(that.model.states.volume) + "%"
            });
        };
    };

    fluid.videoPlayer.controllers.volumeControls.finalInit = function (that) {
        setUpVolumeControls(that);
        bindVolumeDOMEvents(that);
        bindVolumeModel(that);
        that.events.onReady.fire(that);
    };

    fluid.videoPlayer.controllers.volumeControls.produceTree = function (that) {
        return {
            mute: {
                // TODO: Note that until FLUID-4573 is fixed, this binding doesn't actually do anything
                value: "${muted}",
                decorators: [{
                    type: "addClass",
                    classes: (that.model.pressed ? that.options.styles.pressed : that.options.styles.released)
                }]
            },
            volumeControl: {
                // TODO: Note that until FLUID-4573 is fixed, this binding doesn't actually do anything
                value: "${value}"
            }
        };
    };


    /*****************************************************************************
        Caption controls
        Toggle button plus language selection pull-down
     *****************************************************************************/
    fluid.defaults("fluid.videoPlayer.controllers.captionControls", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        renderOnInit: true,
        rendererOptions: {
            autoBind: true
        },
        preInitFunction: "fluid.videoPlayer.controllers.captionControls.preInit",
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
                currentTrack: "none",
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
                        released: "",
                        focused: "",
                        notFocused: ""
                    },
                    strings: {
                        press: "Captions",
                        release: "Captions"
                    },
                    manageFocusStyling: false
                }
            }
        }
    });

    fluid.videoPlayer.controllers.captionControls.preInit = function (that) {
        // build the 'choices' from the caption list provided
        fluid.each(that.options.model.captions.sources, function (value, key) {
            that.options.model.captions.choices.push(key);
            that.options.model.captions.names.push(key);
        });
        // add the 'turn captions off' option
        that.options.model.captions.choices.push("none");
        that.options.model.captions.names.push(that.options.strings.captionsOff);
    };

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
        
        // TODO: This shouldn't be necessary with the autoBinding on; need to investigate
        that.locate("languageButton").click(function (e) {
            that.applier.requestChange("captions.selection", e.currentTarget.value);
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
        });
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
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        renderOnInit: true,
        postInitFunction: "fluid.videoPlayer.controllers.toggleButton.postInit",
        finalInitFunction: "fluid.videoPlayer.controllers.toggleButton.finalInit",
        produceTree: "fluid.videoPlayer.controllers.toggleButton.produceTree",
        events: {
            onPress: "preventable", // listeners can prevent button from becoming pressed
            onReady: null
        },
        selectors: {    // Integrators may override this selector
            button: ".flc-videoPlayer-button"
        },
        styles: {   // Integrators will likely override these styles
            pressed: "fl-videoPlayer-button-pressed",
            released: "fl-videoPlayer-button-released",
            focused: "fl-videoPlayer-button-focused",
            notFocused: "fl-videoPlayer-button-notfocused"
        },
        model: {
            pressed: false
        },
        strings: {  // Integrators will likely override these strings
            press: "Press",
            release: "Release"
        },
        rendererOptions: {
            autoBind: true,
            applier: "{toggleButton}.applier"
        },
        manageFocusStyling: true
    });

    fluid.videoPlayer.controllers.toggleButton.produceTree = function (that) {
        return {
            button: {
                // TODO: Note that until FLUID-4573 is fixed, this binding doesn't actually do anything
                value: "${pressed}",
                decorators: [{
                    type: "addClass",
                    classes: (that.model.pressed ? that.options.styles.pressed : that.options.styles.released)
                },{
                    type: "addClass",
                    classes: that.options.styles.notFocused
                }
/*
                // TODO: Once FLUID-4571 is fixed, here's how to instantiate the tooltip as a decorator
                ,
                {
                    type: "fluid",
                    func: "fluid.tooltip",
                    container: that.locate("button"),
                    options: {
                        styles: {
                            tooltip: "fl-videoPlayer-tooltip"
                        },
                        content: function () {
                            return (that.model.pressed ? that.options.strings.release : that.options.strings.press);
                        }
                    }
               }
*/
               ]
            }
        };
    };

    fluid.videoPlayer.controllers.toggleButton.postInit = function (that) {
        that.activate = function (evt) {
            that.events.onPress.fire(evt);
        };
        that.toggleButton = function (evt) {
            var button = that.locate("button");
            button.toggleClass(that.options.styles.pressed + " " + that.options.styles.released);
            button.attr("aria-pressed", that.model.pressed);
        };
        that.setStyleFocused = function (evt) {
            that.locate("button").addClass(that.options.styles.focused).removeClass(that.options.styles.notFocused);
        };
        that.setStyleNotFocused = function (evt) {
            that.locate("button").addClass(that.options.styles.notFocused).removeClass(that.options.styles.focused);
        };
        that.toggleState = function (evt) {
            that.applier.requestChange("pressed", !that.model.pressed);
            if (evt) {
                evt.stopPropagation();
            }
            return true;
        };
    };

    var setUpToggleButton = function (that) {
        var toggleButton = that.locate("button");
        toggleButton.attr("role", "button").attr("aria-pressed", "false");
        // TODO: tooltip should be a renderer decorator instead (waiting for a fix to FLUID-4571)
        toggleButton.tooltip = fluid.tooltip(toggleButton, {
            styles: {
                tooltip: "fl-videoPlayer-tooltip"
            },
            content: function () {
                return (that.model.pressed ? that.options.strings.release : that.options.strings.press);
            }
        });
    };

    var bindToggleButtonEvents = function (that) {
        var button = that.locate("button");
        if (that.options.manageFocusStyling) {
            button.focus(that.setStyleFocused).blur(that.setStyleNotFocused);
            button.mouseover(that.setStyleFocused).mouseout(that.setStyleNotFocused);
        }
        button.click(function (evt) {
            that.activate(evt);
        });

        that.events.onPress.addListener(that.toggleState, undefined, undefined, "last");

        that.applier.modelChanged.addListener("pressed", function (evt) {
            that.toggleButton(evt);
        });
    };

    fluid.videoPlayer.controllers.toggleButton.finalInit = function (that) {
        setUpToggleButton(that);
        bindToggleButtonEvents(that);
        that.events.onReady.fire(that);
    };
 
})(jQuery);
