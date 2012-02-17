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
    // TODO: Privacy is inherited. Consider making this public
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
                    applier: "{controllers}.applier",
                    events: {
                        onChange: "{controllers}.events.onVolumeChange"
                    }
                }
            },
            captionControls: {
                type: "fluid.videoPlayer.controllers.languageControls",
                container: "{controllers}.dom.captionControlsContainer",
                options: {
                    model: "{controllers}.model",
                    modelPath: "captions",
                    showHidePath: "states.displayCaptions",
                    applier: "{controllers}.applier",
                    selectors: {
                        button: ".flc-videoPlayer-captions-button",
                        menu: ".flc-videoPlayer-captions-languageMenu"
                    },
                    strings: {
                        languageIsOff: "Show Captions",
                        turnLanguageOff: "Hide Captions",
                        press: "Captions",
                        release: "Captions"
                    }
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
                        pressed: "fl-videoPlayer-playing"
                    },
                    // TODO: Strings should be moved out into a single top-level bundle (FLUID-4590)
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
                        pressed: "fl-videoPlayer-fullscreen-on"
                    },
                    // TODO: Strings should be moved out into a single top-level bundle (FLUID-4590)
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
            afterTimeChange: null,
            onMarkupReady: null
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
        
    // TODO: Privacy is inherited. Consider making this public
    //change the text of the selected time
    var updateTime = function (that, element) {
        var time = that.locate(element);
        time.text(fluid.videoPlayer.formatTime(that.model.states[element]));
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

    // TODO: Privacy is inherited. Consider making this public
    var createScrubberMarkup = function (that) {
        var scrubber = that.locate("scrubber");
        scrubber.slider({
            unittext: "seconds",
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
            handle: ".ui-slider-handle"
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
            var startTime = that.model.states.startTime || 0;
            var scrubber = that.locate("scrubber");
            scrubber.slider("option", "min", startTime + that.model.states.currentTime);
            that.locate("handle").attr({
                "aria-valuemin": startTime + that.model.states.currentTime
            });
        };

        that.updateMax = function () {
            updateTime(that, "totalTime");
            var scrubber = that.locate("scrubber");
            scrubber.slider("option", "max", that.model.states.totalTime);
            that.locate("handle").attr({
                "aria-valuemax": that.model.states.totalTime
            });
        };

        that.updateCurrent = function () {
            updateTime(that, "currentTime");
            var scrubber = that.locate("scrubber");
            scrubber.slider("value", that.model.states.currentTime);
            that.locate("handle").attr({
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
    // TODO: Privacy is inherited. Consider making this public
    var bindVolumeDOMEvents = function (that) {
        // Bind the volume Control slide event to change the video's volume and its image.
        that.locate("volumeControl").bind("slide", function (evt, ui) {
            that.events.onChange.fire(ui.value / 100.0);
        });

        that.locate("volumeControl").bind("slidechange", function (evt, ui) {
            that.events.onChange.fire(ui.value / 100.0);
        });

    };

    // TODO: Privacy is inherited. Consider making this public
    var bindVolumeModel = function (that) {
        that.applier.modelChanged.addListener("states.volume", that.updateVolume);
        that.applier.modelChanged.addListener("states.canPlay", function () {
            that.locate("mute").attr("disabled", !that.model.states.canPlay);
        });
    };

    // TODO: Privacy is inherited. Consider making this public
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
        // TODO: This in inherited. Do we need to add aria to sliders ourselves?
        that.locate("handle").attr({
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
        fluid.tabindex(that.locate("handle"), -1);

        fluid.activatable(that.container, function (evt) {
            that.muteButton.events.onPress.fire(evt);
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
                type: "fluid.videoPlayer.controllers.toggleButton",
                options: {
                    selectors: {
                        button: ".flc-videoPlayer-mute"
                    },
                    styles: {
                        pressed: "fl-videoPlayer-muted"
                    },
                    // TODO: Strings should be moved out into a single top-level bundle (FLUID-4590)
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


    /*****************************************************************************
        Toggle button subcomponent
        Used for Play, Mute, Fullscreen, Captions
     *****************************************************************************/
    fluid.defaults("fluid.videoPlayer.controllers.toggleButton", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        preInitFunction: "fluid.videoPlayer.controllers.toggleButton.preInit",
        postInitFunction: "fluid.videoPlayer.controllers.toggleButton.postInit",
        finalInitFunction: "fluid.videoPlayer.controllers.toggleButton.finalInit",
        events: {
            onPress: "preventable", // listeners can prevent button from becoming pressed
            onReady: null
        },
        listeners: {
            onPress: {
                listener: "{toggleButton}.requestStateChange",
                priority: "last"
            }
        },
        selectors: {    // Integrators may override this selector
            button: ".flc-videoPlayer-button"
        },
        styles: {
            pressed: "fl-videoPlayer-button-pressed",
            tooltip: "fl-videoPlayer-tooltip"
        },
        model: {},
        modelPath: "pressed",
        // TODO: Strings should be moved out into a single top-level bundle (FLUID-4590)
        strings: {  // Integrators will likely override these strings
            press: "Press",
            release: "Release"
        }
    });

    fluid.videoPlayer.controllers.toggleButton.preInit = function (that) {
        that.requestStateChange = function () {
            that.applier.requestChange(that.options.modelPath, !fluid.get(that.model, that.options.modelPath));
        };
    };

    fluid.videoPlayer.controllers.toggleButton.postInit = function (that) {
        that.requestPress = function () {
            that.applier.requestChange(that.options.modelPath, true);
        };
        that.requestRelease = function () {
            that.applier.requestChange(that.options.modelPath, false);
        };
        that.updatePressedState = function () {
            var button = that.locate("button");
            var pressed = !!fluid.get(that.model, that.options.modelPath);
            button.toggleClass(that.options.styles.pressed, pressed);
            button.attr("aria-pressed", pressed.toString());
        };
        that.enabled = function (state) {
            that.locate("button").prop("disabled", !state);
        };
        that.focus = function () {
            that.locate("button").focus();
        };
    };

    fluid.videoPlayer.controllers.toggleButton.setUpToggleButton = function (that) {
        var toggleButton = that.locate("button");
        toggleButton.attr("role", "button");

        that.tooltip = fluid.tooltip(toggleButton, {
            styles: {
                tooltip: that.options.styles.tooltip
            },
            content: function () {
                return (fluid.get(that.model, that.options.modelPath) ? that.options.strings.release : that.options.strings.press);
            }
        });

        that.updatePressedState();
    };

    fluid.videoPlayer.controllers.toggleButton.bindEventListeners = function (that) {
        that.locate("button").click(function (evt) {
            that.events.onPress.fire(evt);
            if (evt) {
                evt.stopPropagation();
            }
        });

        that.applier.modelChanged.addListener(that.options.modelPath, function (model, oldModel, changeRequest) {
            that.updatePressedState();
        });
    };

    fluid.videoPlayer.controllers.toggleButton.finalInit = function (that) {
        fluid.videoPlayer.controllers.toggleButton.setUpToggleButton(that);
        fluid.videoPlayer.controllers.toggleButton.bindEventListeners(that);
        that.events.onReady.fire(that);
    };

    /*****************************************************************************
        Language Menu subcomponent
        Used for Captions, Transcripts, Audio Descriptions.
        Starts with a list of languages and adds the "none, please" options.
        Eventually, we'll add the "Make new" and "Request new" buttons.
     *****************************************************************************/
    fluid.defaults("fluid.videoPlayer.controllers.languageMenu", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        renderOnInit: true,
        preInitFunction: "fluid.videoPlayer.controllers.languageMenu.preInit",
        postInitFunction: "fluid.videoPlayer.controllers.languageMenu.postInit",
        finalInitFunction: "fluid.videoPlayer.controllers.languageMenu.finalInit",
        produceTree: "fluid.videoPlayer.controllers.languageMenu.produceTree",
        model: {
        },
        modelPath: "",
        showHidePath: "",
        events: {
            onReady: null,
            activated: null,
            activatedByKeyboard: null,
            collapsedByKeyboard: null,
            captionOnOff: null,
            trackChanged: null
        },
        listeners: {
            trackChanged: {
                listener: "fluid.videoPlayer.controllers.languageMenu.updateTracks"
            }
        },
        selectors: {
            menuItem: ".flc-videoPlayer-menuItem",
            language: ".flc-videoPlayer-language",
            none: ".flc-videoPlayer-languageNone"
        },
        repeatingSelectors: ["language"],
        strings: {
            languageIsOff: "Language OFF",
            turnLanguageOff: "Turn Language OFF"
        },
        styles: {
            selected: "fl-videoPlayer-menuItem-selected",
            active: "fl-videoPlayer-menuItem-active"
        },
        hideOnInit: true
    });

    fluid.videoPlayer.controllers.languageMenu.produceTree = function (that) {
        var tree = {
            // create a menu item for each language in the model
            expander: {
                type: "fluid.renderer.repeat",
                repeatID: "language",
                controlledBy: that.options.modelPath + ".list",
                pathAs: "lang",
                tree: {
                    value: "${{lang}.label}"
                }
            },

            // add the 'turn off' option
            none: {
                value: that.options.strings.languageIsOff
            }
        };
        return tree;
    };

    fluid.videoPlayer.controllers.languageMenu.selectLastItem = function (that) {
        that.container.fluid("selectable.select", that.locate("menuItem").last());
    };

    fluid.videoPlayer.controllers.languageMenu.setUpKeyboardA11y = function (that) {
        that.container.fluid("tabbable");
        that.container.fluid("selectable", {
            direction: fluid.a11y.orientation.VERTICAL,
            selectableSelector: that.options.selectors.menuItem,
            onSelect: function (el) {
                that.show();
                $(el).addClass(that.options.styles.selected);
            },
            onUnselect: function (el) {
                $(el).removeClass(that.options.styles.selected);
            },
            rememberSelectionState: false,
            autoSelectFirstItem: false,
            noWrap: true
        });

        // When a menu item is activated using the keyboard, in addition to hiding the menu,
        // focus must be return to the button
        that.locate("language").fluid("activatable", function (evt) {
            that.activate(that.locate("language").index(evt.currentTarget));
            that.events.activatedByKeyboard.fire();
            return false;
        });
        var noneButton = that.locate("none");
        noneButton.fluid("activatable", function (evt) {
            that.hide();
            that.applier.requestChange(that.options.showHidePath, !fluid.get(that.model, that.options.showHidePath));
            that.events.activatedByKeyboard.fire();
            return false;
        });

        // when the DOWN arrow is used on the bottom item of the menu, the menu should hide
        // and focus should return to the button
        noneButton.keydown(function (evt) {
            if (evt.which === $.ui.keyCode.DOWN) {
                that.hide();
                that.events.collapsedByKeyboard.fire();
                return false;
            }
            return true;
        });
    };

    fluid.videoPlayer.controllers.languageMenu.bindEventListeners = function (that) {
        that.applier.modelChanged.addListener(that.options.modelPath + ".currentTrack", function (model, oldModel, changeRequest) {
            var newTrack = model[that.options.modelPath].currentTrack;
            var oldTrack = oldModel[that.options.modelPath].currentTrack;
            if (newTrack == oldTrack) {
                return;
            }
            that.events.trackChanged.fire(that, model[that.options.modelPath].currentTrack);
        });
        that.applier.modelChanged.addListener(that.options.showHidePath, function (model, oldModel, changeRequest) {
            that.locate("none").text(fluid.get(that.model, that.options.showHidePath) ? that.options.strings.turnLanguageOff : that.options.strings.languageIsOff);
            that.events.captionOnOff.fire();
        });

        var langList = that.locate("language");
        langList.click(function (evt) {
            that.activate(langList.index(evt.currentTarget));
        });
        that.locate("none").click(function (evt) {
            that.applier.requestChange(that.options.showHidePath, !fluid.get(that.model, that.options.showHidePath));
            that.hide();
        });
    };

    fluid.videoPlayer.controllers.languageMenu.updateTracks = function (that, activeTrack) {
        var menuItems = that.locate("menuItem");
        menuItems.removeClass(that.options.styles.selected).removeClass(that.options.styles.active);

        $(menuItems[activeTrack]).addClass(that.options.styles.active);
        that.hide();
    };

    fluid.videoPlayer.controllers.languageMenu.preInit = function (that) {
        if (that.options.modelPath && that.options.model[that.options.modelPath]) {
            if (that.options.model[that.options.modelPath].currentTrack === undefined) {
                that.options.model[that.options.modelPath].currentTrack = 0;
            }
        }

        that.toggleView = function () {
            that.container.toggle();
        };
        that.hide = function () {
            that.locate("language").removeClass(that.options.styles.selected);
            that.container.hide();
        };
    };

    fluid.videoPlayer.controllers.languageMenu.postInit = function (that) {
        that.show = function () {
            that.container.show();
        };
        that.showAndSelect = function () {
            that.show();
            that.container.fluid("selectable.select", that.locate("menuItem").last());
        };
        that.activate = function (index) {
            that.applier.requestChange(that.options.modelPath + ".currentTrack", index);
            that.applier.requestChange(that.options.showHidePath, true);
        };
    };

    fluid.videoPlayer.controllers.languageMenu.finalInit = function (that) {
        fluid.videoPlayer.controllers.languageMenu.bindEventListeners(that);
        fluid.videoPlayer.controllers.languageMenu.setUpKeyboardA11y(that);
        if (that.options.modelPath && that.model[that.options.modelPath]) {
            fluid.videoPlayer.controllers.languageMenu.updateTracks(that, that.model[that.options.modelPath].currentTrack);
        }
        that.hide();
        that.events.onReady.fire(that);
    };


    /*****************************************************************************
        Language Controls subcomponent: a button and its associated languageMenu
        Used for Captions, Transcripts, Audio Descriptions.
     *****************************************************************************/
    fluid.defaults("fluid.videoPlayer.controllers.languageControls", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        finalInitFunction: "fluid.videoPlayer.controllers.languageControls.finalInit",
        selectors: {
            button: ".flc-videoPlayer-languageButton",
            menu: ".flc-videoPlayer-languageMenu"
        },
        events: {
            onReady: null,
            activatedByKeyboard: null
        },
        modelPath: "",
        showHidePath: "",
        components: {
            button: {
                type: "fluid.videoPlayer.controllers.toggleButton",
                container: "{languageControls}.container",
                options: {
                    selectors: {
                        button: "{languageControls}.options.selectors.button"
                    },
                    // TODO: Strings should be moved out into a single top-level bundle (FLUID-4590)
                    strings: "{languageControls}.options.strings",
                    events: {
                        activatedByKeyboard: "{languageControls}.events.activatedByKeyboard"
                    }
                }
            },
            menu: {
                type: "fluid.videoPlayer.controllers.languageMenu",
                container: "{languageControls}.dom.menu",
                options: {
                    model: "{languageControls}.model",
                    modelPath: "{languageControls}.options.modelPath",
                    showHidePath: "{languageControls}.options.showHidePath",
                    applier: "{languageControls}.applier",
                    strings: "{languageControls}.options.strings"
                }
            },
            eventBinder: {
                type: "fluid.videoPlayer.controllers.languageControls.eventBinder",
                createOnEvent: "onReady"
            }
        }
    });

    fluid.videoPlayer.controllers.languageControls.setUpKeyboardA11y = function (that) {
        fluid.tabindex(that.locate("menu"), -1);
        that.locate("button").fluid("activatable", [fluid.identity, {
            additionalBindings: [{
                // in addition to space and enter, we want the UP arrow key to show the menu
                // but we also want it to automatically select the first item above the button,
                // i.e. the bottom item in the menu
                key: $.ui.keyCode.UP,
                activateHandler: function () {
                    that.events.activatedByKeyboard.fire();
                    return false;
                }
            }]
        }]);
        fluid.deadMansBlur(that.container, {
            exclusions: [that.menu.options.selectors.menuItem, that.options.selectors.button],
            handler: function () {
                that.menu.hide();
            }
        });

        // TODO: This is a workaround for around FLUID-4606 (there's a button tag inside the anchor;
        //       it's for styling only, and we don't want it in the tab order)
        $("button", that.locate("button")).fluid("tabindex", -1);
    };

    fluid.videoPlayer.controllers.languageControls.finalInit = function (that) {
        fluid.videoPlayer.controllers.languageControls.setUpKeyboardA11y(that);
        that.events.onReady.fire(that);
    };

    /**************************************************************************************
     * LanguageControls Event Binder: Binds events between components "button" and "menu" *
     **************************************************************************************/

    fluid.defaults("fluid.videoPlayer.controllers.languageControls.eventBinder", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        listeners: {
            "{button}.events.onPress": "{menu}.toggleView",
            "{button}.events.activatedByKeyboard": "{menu}.showAndSelect",

            "{menu}.events.collapsedByKeyboard": "{button}.focus",
            "{menu}.events.activatedByKeyboard": "{button}.focus",
            "{menu}.events.captionOnOff": "{button}.requestStateChange"
        }
    });

})(jQuery);
