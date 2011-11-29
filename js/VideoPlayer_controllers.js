/*
Copyright 2009 University of Toronto
Copyright 2011 Charly Molter
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, window, fluid*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */


(function ($) {

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
     *      a volume controller, a button to put captions on/off and a menu
     * 
     * @param {Object} container the container which this component is rooted
     * @param {Object} options configuration options for the component
     */
    //add all the modelChanged listener to the applier
    var bindControllerModel = function (that) {
        that.applier.modelChanged.addListener("states.canPlay", function () {
            var playButton = that.locate("play");
            if (that.model.states.canPlay === true) {
                playButton.button("enable");
                that.locate("displayCaptions").button("enable");
                that.locate("fullscreen").button("enable");
            } else {
                playButton.button("disable");
                that.locate("displayCaptions").button("disable");
                that.locate("fullscreen").button("disable");
            }
        });
        that.applier.modelChanged.addListener("states.play", that.togglePlayView);
        that.applier.modelChanged.addListener("states.displayCaptions", that.toggleCaptionsView);
        that.applier.modelChanged.addListener("states.fullscreen", that.toggleFullscreenView);
    };

    var bindControllerDOMEvents = function (that) {
        that.locate("play").click(function () {
            that.applier.fireChangeRequest({
                "path": "states.play",
                "value": !that.model.states.play
            });
        });

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
    
    var createControllerMarkup = function (that) {
        that.locate("play").button({
            icons: {
                primary: that.model.states.play ? that.options.styles.pauseIcon : that.options.styles.playIcon
            },
            disabled: !that.model.states.canPlay,
            text: false,
            label: that.model.states.play ? that.options.strings.playOff : that.options.strings.playOn 
        });
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
    };

    fluid.defaults("fluid.videoPlayer.controllers", { 
        gradeNames: ["fluid.rendererComponent", "autoInit"], 
        finalInitFunction: "fluid.videoPlayer.controllers.finalInit",
        preInitFunction: "fluid.videoPlayer.controllers.preInit",
        events: {
            onControllersReady: null,
            onVolumeChange: null,
            onStartTimeChange: null,
            onTimeChange: null,
            afterTimeChange: null
        },

        selectors: {
            play: ".flc-videoPlayer-controller-play",
            displayCaptions: ".flc-videoPlayer-controller-caption",
            fullscreen: ".flc-videoPlayer-controller-fullscreen",
            scrubberContainer: ".flc-videoPlayer-controller-scrubberContainer",
            volumeContainer: ".flc-videoPlayer-controller-volumeContainer",
            menuContainer: ".flc-videoPlayer-controller-menuContainer"
        },

        styles: {
            playOn: "fl-videoPlayer-state-play",
            playOff: "fl-videoPlayer-state-pause",
            displayCaptionsOn: "fl-videoPlayer-state-captionOn",
            displayCaptionsOff: "fl-videoPlayer-state-captionOff",
            fullscreenOn: "fl-videoPlayer-state-fullscreenOn",
            fullscreenOff: "fl-videoPlayer-state-fullscreenOff",
            pauseIcon: "ui-icon-pause",
            playIcon: "ui-icon-play",
            fullscreenIcon: "ui-icon-extlink",
            captionIcon: "ui-icon-comment"
        },

        strings: {
            playOn: "Play",
            playOff: "Pause",
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
                if (item === "fullscreen" || item === "displayCaptions") {
                    tree[item].valuebinding = "states." + item;
                }
                if (item === "play" || item === "displayCaptions" || item === "fullscreen") {
                    value = that.model.states[item] ? "On" : "Off";
                    // render radio buttons
                    tree[item].decorators = {
                        addClass: that.options.styles[item + value]
                    };
                    if (item === "play") {
                        tree[item].decorators.attributes = {"disabled": "disabled"};
                    }
                }
            }
        }
        if (that.options.selectors.scrubberContainer) {
            tree.scrubberContainer = {
                decorators: [{
                    type: "fluid",
                    func: "fluid.videoPlayer.controllers.scrubber"
                }]
            };
        }
        if (that.options.selectors.volumeContainer) {
            tree.volumeContainer = {
                decorators: [{
                    type: "fluid",
                    func: "fluid.videoPlayer.controllers.volumeControl"
                }]
            };
        }
        if (that.options.selectors.menuContainer) {
            tree.menuContainer = {
                decorators: [{
                    type: "fluid",
                    func: "fluid.videoPlayer.controllers.menu"
                }]
            };
        }
        return tree;
    };

    fluid.videoPlayer.controllers.preInit = function (that) {   
        that.togglePlayView = function () {
            var play = that.locate("play");
            var options = {};
            if (that.model.states.play) {
                play.removeClass(that.options.styles.playOn).addClass(that.options.styles.playOff);
                options = {
                    label: that.options.strings.playOff,
                    icons: { primary: that.options.styles.pauseIcon}
                };
            } else {
                play.removeClass(that.options.styles.playOff).addClass(that.options.styles.playOn);
                options = {
                    label: that.options.strings.playOn,
                    icons: { primary: that.options.styles.playIcon}
                };
            }
            play.button("option", options);
        };

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

        that.events.onControllersReady.fire();
    };
    
    fluid.demands("fluid.videoPlayer.controllers", "fluid.videoPlayer", {
        options: {
            model: "{videoPlayer}.model",
            applier: "{videoPlayer}.applier",
            listeners: {
                onControllersReady: "{videoPlayer}.events.onControllersReady.fire"
            }
        }
    });
    
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
        preInitFunction: "fluid.videoPlayer.controllers.scrubber.preInit",
        events: {
            afterScrub: null,
            onScrub: null,
            onScrubberReady: null,
            onStartScrub: null
        },
        selectors: {
            totalTime: ".flc-videoPlayer-controller-total",
            currentTime: ".flc-videoPlayer-controller-current",
            scrubber: ".flc-videoPlayer-controller-scrubber"
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
    };

    fluid.videoPlayer.controllers.scrubber.preInit = function (that) {
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

    fluid.demands("fluid.videoPlayer.controllers.scrubber", "fluid.videoPlayer.controllers", {
        options: {
            model: "{controllers}.model",
            applier: "{controllers}.applier",
            listeners: {
                onScrub: "{controllers}.events.onTimeChange.fire",
                afterScrub: "{controllers}.events.afterTimeChange.fire",
                onStartScrub: "{controllers}.events.onStartTimeChange.fire"
            }
        }
    });

    /********************************************************
    * Volume Control: a button that turns into a slider     *
    *           To control the volume                       *
    *********************************************************/
    var bindVolumeDOMEvents = function (that) {
        var volumeButton = that.locate("volume");
        var volumeControl = that.locate("volumeControl");
        // hide the volume slider when the button is clicked
        volumeButton.click(that.toggleSlider);
        volumeControl.focusout(that.toggleSlider);
        // Bind the volume Control slide event to change the video's volume and its image.
        volumeControl.bind("slide", function (evt, ui) {
            that.events.onChange.fire(ui.value / 100.0);
        });
    };

    var bindVolumeModel = function (that) {
        that.applier.modelChanged.addListener("states.volume", that.updateVolume);
        that.applier.modelChanged.addListener("states.canPlay", function () {
            if (that.model.states.canPlay === true) {
                that.locate("volume").button("enable");
            } else {
                that.locate("volume").button("disable");
            }
        });
    };

    var createVolumeMarkup = function (that) {
        var volumeElt = $("<button class='flc-videoPlayer-controller-volume'/>");
        volumeElt.addClass(that.options.styles.volume);
        volumeElt.button({
            "icons": {
                primary: that.options.styles.buttonIcon
            },
            disabled: !that.model.states.canPlay,
            label: that.options.strings.volume,
            text: false
        });
        that.container.append(volumeElt);
        var volumeControl = $("<div class='flc-videoPlayer-controller-volumeControl'/>");
        volumeControl.addClass(that.options.styles.volumeControl);
        volumeControl.slider({
            orientation: "vertical",
            range: "min",
            min: 0,
            max: 100,
            value: that.model.states.volume
        });
        volumeControl.find(".ui-slider-handle").attr({
            "aria-label": that.options.strings.volume,
            "aria-valuemin": 0,
            "aria-valuemax": 100,
            "aria-valuenow": that.model.states.volume,
            "aria-valuetext": that.model.states.volume + "%",
            "role": "slider"
        });
        volumeControl.hide();
        that.container.append(volumeControl);
    };

    fluid.defaults("fluid.videoPlayer.controllers.volumeControl", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        finalInitFunction: "fluid.videoPlayer.controllers.volumeControl.finalInit",
        preInitFunction: "fluid.videoPlayer.controllers.volumeControl.preInit",
        events: {
            onReady: null,
            onChange: null
        },
        selectors: {
            volume: ".flc-videoPlayer-controller-volume",
            volumeControl: ".flc-videoPlayer-controller-volumeControl"
        },
        styles: {
            volume: "fl-videoPlayer-controller-volume",
            volumeControl: "fl-videoPlayer-controller-volumeControl",
            buttonIcon: "ui-icon-signal"
        },
        strings: {
            volume: "Volume"
        }
    });

    fluid.videoPlayer.controllers.volumeControl.preInit = function (that) {
        
        that.toggleSlider = function (ev) {
            var volume = that.locate("volumeControl");
            if (volume.css("display") !== "none") {
                volume.hide();
                that.locate("volume").focus();
            } else {
                //is there a more correct way?
                volume.show().find(".ui-slider-handle").focus();
            }
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

    fluid.videoPlayer.controllers.volumeControl.finalInit = function (that) {
        createVolumeMarkup(that);
        bindVolumeDOMEvents(that);
        bindVolumeModel(that);
        that.events.onReady.fire();
    };

    fluid.demands("fluid.videoPlayer.controllers.volumeControl", "fluid.videoPlayer.controllers", {
        options: {
            model: "{videoPlayer}.model",
            applier: "{videoPlayer}.applier",
            listeners: {
                onChange: "{controllers}.events.onVolumeChange.fire"
            }
        }
    });

    /********************************************************
    * Menu: a menu to choose the caption and other options  *
    *********************************************************/
    var bindMenuDOMEvents = function (that) {
        that.locate("menuButton").click(that.toggleMenu);
        that.locate("helpButton").click(that.toggleHelp);
        that.locate("help").mouseleave(that.toggleHelp);
        that.locate("helpButton").focusout(that.hideHelp);
        that.locate("captions").mouseleave(that.toggleMenu);
    };

    var bindMenuModel = function (that) {
        that.applier.modelChanged.addListener("states.canPlay", function () {
            if (that.model.states.canPlay === true) {
                that.locate("menuButton").button("enable");
                that.locate("helpButton").button("enable");
            } else {
                that.locate("menuButton").button("disable");
                that.locate("helpButton").button("disable");
            }
        });
    };

    var createMenuMarkup = function (that) {
        that.locate("menuButton").button({
            icons: {
                primary: that.options.styles.buttonIcon
            },
            disabled: !that.model.states.canPlay,
            label: that.options.strings.menuButton,
            text: false
        });
        
        that.locate("helpButton").button({
            icons: {
                primary: that.options.styles.helpIcon
            },
            disabled: !that.model.states.canPlay,
            label: that.options.strings.helpButton,
            text: false        
        });

        that.locate("captions").hide();
        that.locate("help").hide();
        that.locate("element").buttonset();
        // Because UI buttons is not working properly with check
        that.locate("label").click(function (e) {
            e.preventDefault();
            var id = "#" + $.escapeSelector($(this).attr('for'));
            that.locate("input").removeAttr("checked");
            $(id).attr('checked', true);
            that.applier.fireChangeRequest({
                path: "captions.currentTrack",
                value: $(id).attr("value")
            });
        });
        that.locate("menu").fluid("selectable");
    };

    fluid.defaults("fluid.videoPlayer.controllers.menu", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        finalInitFunction: "fluid.videoPlayer.controllers.menu.finalInit",
        preInitFunction: "fluid.videoPlayer.controllers.menu.preInit",
        events: {
            onMenuReady: null
        },
        selectors: {
            menuButton: ".flc-videoPlayer-controller-menu-button",
            menu: ".flc-videoPlayer-controller-menu-container",
            captions: ".flc-videoPlayer-controller-menu-captions",
            title: ".flc-videoPlayer-controller-menu-title",
            input: ".flc-videoPlayer-controller-menu-input",
            element: ".flc-videoPlayer-controller-menu-element",
            label: ".flc-videoPlayer-controller-menu-label",
            helpButton: ".flc-videoPlayer-controller-menu-helpButton",
            help: ".flc-videoPlayer-controller-menu-help"
        },
        styles: {
            buttonIcon: "ui-icon-arrow",
            helpIcon: "ui-icon-info"
        },
        strings: {
            menuButton: "Subtitle selection Menu",
            helpButton: "Help menu (keyboard shortcuts)",
            help: "HELP"
        },
        rendererOptions: {
            autoBind: true
        },
        repeatingSelectors: ["element"],
        produceTree: "fluid.videoPlayer.controllers.menu.produceTree"
    });

    fluid.videoPlayer.controllers.menu.produceTree = function (that) {
        var list = [];
        for (var key in that.model.captions.sources) {
            list.push(key);
        }
        return {
            captions: {},
            title: {},
            menuButton: {},
            menu: {},
            expander: [{
                type: "fluid.renderer.selection.inputs",
                rowID: "element",
                labelID: "label",
                inputID: "input",
                selectID: "caption",
                tree: {
                    "selection": "${captions.currentTrack}",
                    "optionlist": list,
                    "optionnames": list
                }
            }],
            helpButton: {},
            help: {}
        };
    };

    fluid.videoPlayer.controllers.menu.preInit = function (that) {
        that.toggleMenu = function () {
            var menu = that.locate("captions");
            menu.toggle();
            if (menu.css("display") !== "none") {
                that.locate("input").first().focus();
            } else {
                that.locate("menuButton").focus();
            }
        };
        
        that.toggleHelp = function () {
            that.locate("help").toggle();
        };
        
        that.hideHelp = function () {
            that.locate("help").hide();
        };
    };

    fluid.videoPlayer.controllers.menu.finalInit = function (that) {
        that.refreshView();
        createMenuMarkup(that);
        bindMenuDOMEvents(that);
        bindMenuModel(that);
        that.events.onMenuReady.fire();
    };

    fluid.demands("fluid.videoPlayer.controllers.menu", "fluid.videoPlayer.controllers", {
        options: {
            model: "{videoPlayer}.model",
            applier: "{videoPlayer}.applier"
        }
    });

})(jQuery);
