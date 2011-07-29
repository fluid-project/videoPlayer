//Controllers
var fluid_1_4 = fluid_1_4 || {};

(function ($, fluid) {
    
    //change the classes/title/checked of the selected checkbox
    var toggleView = function (that, element) {
        var tag = that.locate(element);
        if (that.model.states[element] === false) {
            tag.removeAttr("checked");
            tag.attr({
                "title": that.options.strings[element + "On"]
            });
            tag.removeClass(that.options.styles[element + "Off"]).addClass(that.options.styles[element + "On"]);                
        } else {
            tag.attr({
                "checked": "checked",
                "title": that.options.strings[element + "Off"]
            });
            tag.removeClass(that.options.styles[element + "On"]).addClass(that.options.styles[element + "Off"]);
       }
    };
    
    //change the text of the selected time
    var updateTime = function (that, element) {
        var time = that.locate(element);
        time.text(fluid.videoPlayer.formatTime(that.model.states[element]));
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
        that.applier.modelChanged.addListener("states.canPlay", function() {
            var playButton = that.locate("play");
            if (that.model.states.canPlay === true) {
                playButton.removeAttr("disabled");
            } else {
                playButton.attr("disabled", "disabled");
            }
        });
        
        that.applier.modelChanged.addListener("states.play", that.togglePlayView);
        that.applier.modelChanged.addListener("states.displayCaptions", that.toggleCaptionsView);
        that.applier.modelChanged.addListener("states.fullscreen", that.toggleFullscreenView);
        
        that.applier.modelChanged.addListener("states.currentTime", that.setCurrentTime);
        that.applier.modelChanged.addListener("states.totalTime", that.setTotalTime);
    };
    
    var bindControllerDOMEvents = function (that) {
        return;
    };
    
    fluid.defaults("fluid.videoPlayer.controllers", { 
        gradeNames: ["fluid.rendererComponent", "autoInit"], 
        finalInitFunction: "fluid.videoPlayer.controllers.finalInit",
        events: {
            onControllerReady: null,
            onVolumeChange: null,
            onTimeChange: null,
            afterTimeChange: null
        }, 

        listeners: {
            onControllerReady : function () {
                console.log("controllers");
            }
        },

        selectors: {
            play: ".flc-videoPlayer-controller-play",
            displayCaptions: ".flc-videoPlayer-controller-caption",
            fullscreen: ".flc-videoPlayer-controller-fullscreen",
            totalTime: ".flc-videoPlayer-controller-total",
            currentTime: ".flc-videoPlayer-controller-current",
            scrubberContainer: ".flc-videoPlayer-controller-scrubberContainer",
            volumeContainer: ".flc-videoPlayer-controller-volumeContainer"
        },

        styles: {
            time: "fl-videoPlayer-controller-time",
            playOn: "fl-videoPlayer-state-play",
            playOff: "fl-videoPlayer-state-pause",
            displayCaptionsOn: "fl-videoPlayer-state-captionOn",
            displayCaptionsOff: "fl-videoPlayer-state-captionOff",
            fullscreenOn: "fl-videoPlayer-state-fullscreenOn",
            fullscreenOff: "fl-videoPlayer-state-fullscreenOff"
        },

        strings: {
            playOn: "Play",
            playOff: "Pause",
            displayCaptionsOn: "Captions On",
            displayCaptionsOff: "Captions Off",
            fullscreenOn: "Fullscreen On",
            fullscreenOff: "Fullscreen Off",
        },
        
        rendererOptions: {
            autoBind: true,
            applier: "{controllers}.applier"
        },
        
        produceTree: "fluid.videoPlayer.controllers.produceTree",
        resources: {
            template: {
                forceCache: true,
                href: "../html/controller_template.html"
            }
        }
    });

    fluid.videoPlayer.controllers.produceTree = function (that) {
        var tree = {};
        var value;
        for (var item in that.model.states) {
            if (that.options.selectors[item]) {
                tree[item] = {
                        valuebinding: "states." + item
                };
                if (item === "play" || item === "displayCaptions" || item === "fullscreen") {
                    value = that.model.states[item] ? "On" : "Off";
                    // render radio buttons
                    tree[item].decorators = {
                        addClass: that.options.styles[item + value]
                    };
                    if (item === "play") {
                        tree[item].decorators.attributes = {"disabled": "disabled"};
                    }
                } else if (item === "currentTime" || item === "totalTime") {
                    tree[item].decorators = {
                        addClass: that.options.styles.time
                    };
                }
            }
        }
        if (that.options.selectors.scrubberContainer) {
            tree.scrubberContainer = {
                decorators: {
                    type: "fluid",
                    func: "fluid.videoPlayer.controllers.scrubber",
                    options: {
                        model: that.model,
                        applier: that.applier,
                        listeners: {
                            onScrub: that.events.onTimeChange.fire,
                            afterScrub: that.events.afterTimeChange.fire
                        }
                    }
                }
            };
        }
        if (that.options.selectors.volumeContainer) {
            tree.volumeContainer = {
                decorators: {
                    type: "fluid",
                    func: "fluid.videoPlayer.controllers.volumeControl",
                    options: {
                        model: that.model,
                        applier: that.applier,
                        listeners: {
                            onChange: that.events.onVolumeChange.fire
                        }
                    }
                }
            };
        }
        console.log(tree);
        return tree;
    };

    fluid.videoPlayer.controllers.finalInit = function (that) {
        that.renderer.refreshView();
        // Enable the Play/Pause button when the video can start playing.
        
        that.setCurrentTime = function () {
            updateTime(that, "currentTime");
        };
        
        that.setTotalTime = function () {
            updateTime(that, "totalTime");
        };
        
        that.togglePlayView = function () {
            toggleView(that, "play");
        };
        
        that.toggleCaptionsView = function () {
            toggleView(that, "displayCaptions");
        };
        
        that.toggleFullscreenView = function () {
            toggleView(that, "fullscreen");
        };
        
        bindControllerModel(that);
        
        bindControllerDOMEvents(that);
        
        that.events.onControllerReady.fire();
    };
    
    
    /********************************************
    * scrubber: a slider to follow the progress *
    *           of the video                    *
    ********************************************/
    var bindScrubberDOMEvents = function (that) {
        // Bind the scrubbers slide event to change the video's time.
        scrubber.bind({
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
                scrubber.slider({disabled: false});
            } else {
                scrubber.slider({disabled: true});
            }
        });
    };
    
    var createScrubberMarkup = function (that) {
        var scrub = $("<div class='flc-videoPlayer-controller-scrubber'>");
        scrub.addClass(that.options.styles.scrubber);
        that.container.append(scrub);

        var scrubber = that.locate("scrubber");
        scrubber.slider({
            unittext: "seconds",
            disabled: true
        });
    };
    
    fluid.defaults("fluid.videoPlayer.controllers.scrubber", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        finalInitFunction: "fluid.videoPlayer.controllers.scrubber.finalInit",
        events: {
            afterScrub: null,
            onScrub: null,
            onScrubberReady: null
        }, listeners: {
            onScrubberReady : function () {console.log("scrub");}
        },
        selectors: {
            scrubber: ".flc-videoPlayer-controller-scrubber"
        },
        styles: {
            scrubber: "fl-videoPlayer-controller-scrubber"
        }
    });
    
    fluid.videoPlayer.controllers.scrubber.finalInit = function (that) {
        createScrubberMarkup(that);
        
        that.updateMin = function () {
            var startTime = that.model.states.startTime || 0;
            scrubber.slider("option", "min", that.model.states.startTime +
                that.model.states.currentTime);
        }
        
        that.updateMax = function () {
            scrubber.slider("option", "max", that.model.states.totalTime);
        }
        
        that.updateCurrent = function () {
            scrubber.slider("value", that.model.states.currentTime);
        }

        bindScrubberDOMEvents(that);
        
        bindScrubberModel(that);

        that.events.onScrubberReady.fire();
    };
    
    
    /********************************************************
    * Volume Control: a button that turns into a slider     *
    *           To control the volume                       *
    *********************************************************/
    var bindVolumeDOMEvents = function (that) {
        var volumeButton = that.locate("volume");
        // hide the volume slider when the button is clicked
        volumeButton.click(that.showSlider);
        
        volumeButton.focusout(that.showButton);
        
        // Bind the volume Control slide event to change the video's volume and its image.
        volumeButton.bind("slide", function (evt, ui) {
            that.events.onChange.fire(ui.value / 100.0);
        });
    };
    
    var bindVolumeModel = function (that) {
        that.applier.modelChanged.addListener("states.volume", that.updateVolume);
    };
    
    var createVolumeMarkup = function (that) {
        var volumeElt = $("<div class='flc-videoPlayer-controller-volume'/>");
        volumeElt.addClass(that.options.styles.volume);
        that.container.append(volumeElt);
    };
    
    fluid.defaults("fluid.videoPlayer.controllers.volumeControl",{
        gradeNames: ["fluid.viewComponent", "autoInit"],
        finalInitFunction: "fluid.videoPlayer.controllers.volumeControl.finalInit",
        events: {
            onReady: null,
            onChange: null
        }, 
        listeners: {
            onReady : function() {console.log("volume");}
        },
        selectors: {
            volume: ".flc-videoPlayer-controller-volume",
            volumeControl: ".flc-videoPlayer-controller-volumeControl"
        },
        styles: {
            volume: "fl-videoPlayer-controller-volume",
            volumeControl: "fl-videoPlayer-controller-volumeControl"
        },
        strings: {
            volume: "Volume"
        }
    });
    
    fluid.videoPlayer.controllers.volumeControl.finalInit = function (that) {
        createVolumeMarkup(that);
        
        that.showSlider = function () {
            var volume = that.locate("volume");
            if (volume.hasClass(that.options.styles.volume)) {
                volume.slider({
                    orientation: "vertical",
                    range: "min",
                    min: 0,
                    max: 100,
                    value: that.model.states.volume
                });
                volume.removeClass(that.options.styles.volume);
                volume.addClass(that.options.styles.volumeControl);
            }
        };
        
        that.showButton = function () {
            var volume = that.locate("volume");
            if (volume.hasClass(that.options.styles.volumeControl)) {
                volume.slider("destroy");
                volume.removeClass(that.options.styles.volumeControl).
                valume.addClass(that.options.styles.volume);
            }
        };
        
        that.updateVolume = function () {
            var volume = that.model.states.volume;
            var volumeButton = that.locate("volume");
            if (volumeButton.hasClass(that.options.styles.volume)) {
                if (volume > 66) {
                    volumeButton.css("background-image", "url(../images/volume3.png)");
                } else if (volume > 33) {
                    volumeButton.css("background-image", "url(../images/volume2.png)");
                } else if (volume !== 0) {
                    volumeButton.css("background-image", "url(../images/volume1.png)");
                } else {
                    volumeButton.css("background-image", "url(../images/volume0.png)");
                }
            }
        };
        
        bindVolumeDOMEvents(that);
        
        bindVolumeModel(that);
        //destroy the volume slider when the mouse leaves the slider
        that.events.onReady.fire();
    };

})(jQuery, fluid_1_4);
