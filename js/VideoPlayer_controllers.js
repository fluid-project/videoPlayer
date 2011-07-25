//Controllers
var fluid_1_4 = fluid_1_4 || {};

(function ($, fluid) {
    
    var toggleDisplay = function (obj1, obj2) {
        obj1.fadeOut("fast", function() {
            obj2.fadeIn("fast", "linear");
        });
    };
    //selector, path
    var toggleChangeModel = function (that, elements) {
        fluid.each(elements, function(elt) {
            that.locate(elt.selector).bind(elt.event,function () {
                that.applier.fireChangeRequest({
                    "path": elt.path,
                    "value": !fluid.get(that.model, elt.path)
                });
            });
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
            onReady : function() {console.log("controllers");}
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
                type: "fluid.videoPlayer.controllers.scrubberAndTime",
                createOnEvent: "onReady",
                container: "{controllers}.container",
                options: {
                    model: "{controllers}.model",
                    applier: "{controllers}.applier"
                }
            }
        },
        
        selectors: {
            playButton: ".flc-videoPlayer-controller-play",
            captionButton: ".flc-videoPlayer-controller-caption",
            fullscreenButton: ".flc-videoPlayer-controller-fullscreen"
        },
        
        rendererOptions: {
            autoBind: true
        },
        protoTree: {
            playButton: "${states.play}",
            captionButton: "${states.displayCaptions}",
            fullscreenButton: "${states.fullscreen}"
        },
        
        states: {
            play: "fl-videoPlayer-state-play",
            pause: "fl-videoPlayer-state-pause",
            captionOn: "fl-videoPlayer-state-captionOn",
            captionOff: "fl-videoPlayer-state-captionOff",
            fullscreenOn: "fl-videoPlayer-state-fullscreenOn",
            fullscreenOff: "fl-videoPlayer-state-fullscreenOff"
        },
        
        strings: {
            play: "Play",
            pause: "Pause",
            captionOn: "Captions On",
            captionOff: "Captions Off",
            fullscreen: "Fullscreen"
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
        
        that.applier.modelChanged.addListener("states.play", 
            function(model, oldModel, changeRequest) {
                console.log(that.model.states.play);
        });
        that.events.onReady.fire();
    };
    
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
    
    fluid.defaults("fluid.videoPlayer.controllers.scrubberAndTime", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        finalInitFunction: "fluid.videoPlayer.controllers.scrubberAndTime.finalInit",
        events: {
            afterScrub: null,
            onScrub: null,
            onReady: null
        }, listeners: {
            onReady : function() {console.log("scrub");}
        },
        selectors: {
            scrubber: ".flc-videoPlayer-controller-scrubberAndTime-scrubber",
            totalTime: ".flc-videoPlayer-controller-scrubberAndTime-total",
            currentTime: ".flc-videoPlayer-controller-scrubberAndTime-current"
        },
        strings: {
            scrubber: "Scrubber",
            totalTime: "Total time",
            currentTime: "Current time"
        },
        styles: {
            time: "fl-videoPlayer-controller-time",
            scrubber: "fl-videoPlayer-controller-scrubber"
        }
    });
    
    fluid.videoPlayer.controllers.scrubberAndTime.finalInit = function (that) {
        var rend = fluid.simpleRenderer(that.container, {});        
        rend.render([{
            tag: "div",
            selector: "flc-videoPlayer-controller-scrubberAndTime-current", 
            classes: that.options.styles.time,
            content: that.options.strings.currentTime
        }, { 
            tag: "div", 
            selector: "flc-videoPlayer-controller-scrubberAndTime-scrubber", 
            classes: that.options.styles.scrubber,
            content: that.options.strings.scrubber
        }, {
            tag: "div",
            selector: "flc-videoPlayer-controller-scrubberAndTime-total",
            classes: that.options.styles.time,
            content: that.options.strings.totalTime
        }]);
        
        var scrubber = that.locate("scrubber");
        var currentTime = that.locate("currentTime");
        var totalTime = that.locate("totalTime");
        
        // Bind the scrubbers slide event to change the video's time.
        scrubber.bind({
            "slide": function (evt, ui) {
                currentTime.text(fluid.videoPlayer.formatTime(ui.value));
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
                var totalTime = that.locate("totalTime");
                var scrubber = that.locate("scrubber");
                scrubber.slider("option", "max", duration + that.model.states.startTime);
                totalTime.text(fluid.videoPlayer.formatTime(duration));
        });
        
        that.applier.modelChanged.addListener("states.canPlay", 
            function(model, oldModel, changeRequest) {
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
                var curTime = that.locate("currentTime");
                var scrubber = that.locate("scrubber");
                scrubber.slider("value", currentTime);  
                curTime.text(fluid.videoPlayer.formatTime(currentTime));
        });
        
        that.locate("scrubber").slider({
            unittext: "seconds",
            disabled: true
        });
        that.events.onReady.fire();
    };

})(jQuery, fluid_1_4);
