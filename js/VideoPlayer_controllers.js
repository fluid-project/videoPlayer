//Controllers
var fluid_1_4 = fluid_1_4 || {};

(function ($, fluid) {
    
    var toggleDisplay = function (obj1, obj2) {
        obj1.fadeOut("fast", function () {
            obj2.fadeIn("fast", "linear");
        });
    };
    
    
    /**
     * controllers is a video controller containing a play button, a time scrubber, 
     *      a volume controller, a button to put captions on/off and a menu
     * 
     * @param {Object} container the container which this component is rooted
     * @param {Object} options configuration options for the component
     */
    fluid.defaults("fluid.videoPlayer.controllers", { 
        gradeNames: ["fluid.rendererComponent", "autoInit"], 
        finalInitFunction: "fluid.videoPlayer.controllers.finalInit",
        events: {
            onReady: null
        }, listeners: {
            onReady : function () {console.log("controllers");}
        },
        
        components: {
            volumeControl: {
                type: "fluid.videoPlayer.controllers.volumeControl",
                container: "{controllers}.container",
                options: {
                    model: "{controllers}.model",
                    applier: "{controllers}.applier"
                }
            },
            times: {
                type: "fluid.videoPlayer.controllers.scrubber",
                createOnEvent: "onReady",
                container: "{controllers}.dom.scrubberContainer",
                options: {
                    model: "{controllers}.model",
                    applier: "{controllers}.applier"
                }
            }
        },
        
        selectors: {
            playButton: ".flc-videoPlayer-controller-play",
            captionButton: ".flc-videoPlayer-controller-caption",
            fullscreenButton: ".flc-videoPlayer-controller-fullscreen",
            totalTime: ".flc-videoPlayer-controller-total",
            currentTime: ".flc-videoPlayer-controller-current",
            scrubberContainer: ".flc-videoPlayer-controller-scrubberContainer"
        },
        
        rendererOptions: {
            autoBind: true,
            applier: "{controllers}.applier"
        },
        protoTree: {
            scrubberContainer: {
                value: ""
            },
            playButton: {
                valuebinding: "states.play",
            },
            captionButton: {
                valuebinding: "states.displayCaptions"
            },
            fullscreenButton: {
                valuebinding: "states.fullscreen"
            },
            currentTime: {
                valuebinding: "states.currentTime"
            },
            totalTime: {
                valuebinding: "states.totalTime"
            }
        },
        resources: {
            template: {
                forceCache: true,
                href: "../html/controller_template.html"
            }
        }
    });

    fluid.videoPlayer.controllers.finalInit = function (that) {
        
        // Enable the Play/Pause button when the video can start playing.
        that.applier.modelChanged.addListener("states.canPlay", 
            function(model, oldModel, changeRequest) {
                var playButton = that.locate("playButton");
                if (changeRequest[0].value === true) {
                    playButton.removeAttr("disabled");
                } else {
                    playButton.attr("disabled", "disabled");
                }
        });
        
        that.applier.modelChanged.addListener("", function () {
            that.refreshView();
        });
    };
    
    
    /********************************************
    * scrubber: a slider to follow the progress *
    *           of the video                    *
    ********************************************/
    fluid.defaults("fluid.videoPlayer.controllers.scrubber", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        finalInitFunction: "fluid.videoPlayer.controllers.scrubber.finalInit",
        events: {
            afterScrub: null,
            onScrub: null,
            onReady: null
        }, listeners: {
            onReady : function () {console.log("scrub");}
        },
        selectors: {
            scrubber: ".flc-videoPlayer-controller-scrubber"
        },
        strings: {
            scrubber: "Scrubber"
        },
        styles: {
            scrubber: "fl-videoPlayer-controller-scrubber"
        }
    });
    
    fluid.videoPlayer.controllers.scrubber.finalInit = function (that) {
        var scrub = $("<div/>");
        scrub.addClass("flc-videoPlayer-controller-scrubber");
        that.container.append(scrub);
        var scrubber = that.locate("scrubber");
        scrubber.slider({
            unittext: "seconds",
            disabled: true
        });

        // Bind the scrubbers slide event to change the video's time.
        scrubber.bind({
            "slide": function (evt, ui) {
                that.events.onScrub.fire(ui.value);
            },
            "slidestop": function (evt, ui) {
                that.events.afterScrub.fire(ui.value);
            }
        });
        
        // Setup the scrubber when we know the duration of the video.
        that.applier.modelChanged.addListener("states.startTime",
            function (model, oldModel, changeRequest) {
                var startTime = changeRequest[0].value || 0;
                var scrubber = that.locate("scrubber");
                scrubber.slider("option", "min", startTime);
                scrubber.slider("option", "max", that.model.states.totalTime + startTime);
        });        
        
        that.applier.modelChanged.addListener("states.totalTime", 
            function (model, oldModel, changeRequest) {
                var duration = changeRequest[0].value;
                var scrubber = that.locate("scrubber");
                scrubber.slider("option", "max", duration + that.model.states.startTime);
        });
        
        that.applier.modelChanged.addListener("states.canPlay", 
            function (model, oldModel, changeRequest) {
                var scrubber = that.locate("scrubber");
                if (changeRequest[0].value === true) {
                    scrubber.slider({disabled: false});
                } else {
                    scrubber.slider({disabled: true});
                }
        });
        
        // Bind to the video's timeupdate event so we can programmatically update the slider.
        //TODO get time in hh:mm:ss
        that.applier.modelChanged.addListener("states.currentTime",
            function (model, oldModel, changeRequest) {
                var currentTime = that.model.states.currentTime;
                var scrubber = that.locate("scrubber");
                scrubber.slider("value", currentTime);
        });
        that.events.onReady.fire();
    };
    
    
    /********************************************
    * Volume Control: a button and a slider     *
    *           To control the volume           *
    ********************************************/
    fluid.defaults("fluid.videoPlayer.controllers.volumeControl",{
        gradeNames: ["fluid.viewComponent", "autoInit"],
        finalInitFunction: "fluid.videoPlayer.controllers.volumeControl.finalInit",
        events: {
            onReady: null
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
        var rend = fluid.simpleRenderer(that.container, {});
        rend.render([{
            tag: "button",
            selector: "flc-videoPlayer-controller-volume",
            classes: that.options.styles.volume,
            content: that.options.strings.volume
        }, {
            tag: "div",
            selector: "flc-videoPlayer-controller-volumeControl",
            classes: that.options.styles.volumeControl
        }]);  
        
        that.locate("volumeControl").slider({
            orientation: "vertical",
            range: "min",
            min: 0,
            max: 100,
            value: 60
        });
        
        var volumeButton = that.locate("volume");
        var volumeControl = that.locate("volumeControl");    
        // hide the volume slider when the button is clicked
        volumeButton.click(function () {
            toggleDisplay(volumeButton, volumeControl);
        });
        
        volumeControl.mouseleave(function () {
            toggleDisplay(volumeControl, volumeButton);
        });
        
        // Bind the volume Control slide event to change the video's volume and its image.
        volumeControl.bind("slide", function (evt, ui) {
           that.applier.fireChangeRequest({
                path: "states.volume",
                value: ui.value / 100.0
            });
        });
        
        that.applier.modelChanged.addListener("states.volume",
            function (model, oldModel, changeRequest) {
                var volumeButton = that.locate("volume");
                if (that.model.states.volume > 66) {
                    volumeButton.css("background-image", "url(../images/volume3.png)");
                } else if (that.model.states.volume > 33) {
                    volumeButton.css("background-image", "url(../images/volume2.png)");
                } else if (that.model.states.volume !== 0) {
                    volumeButton.css("background-image", "url(../images/volume1.png)");
                } else {
                    volumeButton.css("background-image", "url(../images/volume0.png)");
                }
        });
        //destroy the volume slider when the mouse leaves the slider
        that.events.onReady.fire();
    };

})(jQuery, fluid_1_4);
