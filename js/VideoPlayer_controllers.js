//Controllers
var fluid_1_4 = fluid_1_4 || {};

(function ($, fluid) {
    
    var toggleDisplay = function (obj1, obj2) {
        obj1.fadeOut("fast", function() {
            obj2.fadeIn("fast", "linear");
        });
    };
    
    var bindDOMEvents = function (that) {      
        
        var captionButton = that.locate("captionButton");
        //Shows or hides the caption when the button is clicked
        captionButton.click(function () {
            if (that.model.states.displayCaptions) { 
                captionButton.text(that.options.strings.captionOn);
                captionButton.removeClass(that.options.states.captionOff).addClass(that.options.states.captionOn);
            } else {
                captionButton.text(that.options.strings.captionOff);
                captionButton.removeClass(that.options.states.captionOn).addClass(that.options.states.captionOff);
            }
            that.applier.fireChangeRequest({
                path: "states.displayCaptions",
                value: !that.model.states.displayCaptions
            });
        });
        
        //toggle from fullscreen to normal view...
        var fullscreenButton = that.locate("fullscreenButton");
        fullscreenButton.click(function () {
            if (that.model.states.fullscreen) {
                fullscreenButton.removeClass(that.options.states.fullscreenOn).addClass(that.options.states.fullscreenOff);
            } else {
                fullscreenButton.removeClass(that.options.states.fullscreenOff).addClass(that.options.states.fullscreenOn);
            }
            that.applier.fireChangeRequest({
                path: "states.fullscreen",
                value: !that.model.states.fullscreen
            });
        });
        
        // Bind the play button.
        var playButton = that.locate("playButton");
        playButton.click(function () {
            that.applier.fireChangeRequest({
                path: "states.play",
                value: !that.model.states.play
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
        gradeNames: ["fluid.viewComponent", "autoInit"], 
        finalInitFunction: "fluid.videoPlayer.controllers.finalInit",
        postInitFunction: "fluid.videoPlayer.controllers.postInit",
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
        }
    });

    fluid.videoPlayer.controllers.finalInit = function (that) {
        // Initially disable the play button and scrubber until the video is ready to go.
        bindDOMEvents(that);
        
        // Bind the Play/Pause button's text status to the HTML 5 video events.
        that.applier.modelChanged.addListener("states.play", 
            function (model, oldModel, changeRequest) {
            var playButton = that.locate("playButton");
            if (changeRequest[0].value === true) {
                playButton.text(that.options.strings.play);
                playButton.removeClass(that.options.states.pause).addClass(that.options.states.play);                
            } else {
                playButton.text(that.options.strings.pause);
                playButton.removeClass(that.options.states.play).addClass(that.options.states.pause);
           }
        });
        // Enable the Play/Pause button when the video can start playing.
        that.applier.modelChanged.addListener("states.canPlay", function(model, oldModel, changeRequest) {
            var playButton = that.locate("playButton");
            if (changeRequest[0].value === true) {
                playButton.removeAttr("disabled");
            } else {
                playButton.attr("disabled", "disabled");
            }
        });
        that.events.onReady.fire();
    };
    
    fluid.videoPlayer.controllers.postInit = function (that) {
        var rend = fluid.simpleRenderer(that.container, {});
        rend.render([{
            tag: "button",
            selector: "flc-videoPlayer-controller-play",
            classes: that.options.states.play,
            attributes: {disabled: "disabled" },
            content: that.options.strings.play
        }, {
            tag: "button",
            selector: "flc-videoPlayer-controller-caption",
            classes: that.options.states.captionOn,
            content: that.options.strings.captionOn
        }, {
            tag: "button",
            selector: "flc-videoPlayer-controller-fullscreen",
            classes: that.options.states.fullscreenOn,
            content: that.options.strings.fullscreen
        }]);
    };
    
    fluid.defaults("fluid.videoPlayer.controllers.volumeControl",{
        gradeNames: ["fluid.viewComponent", "autoInit"],
        finalInitFunction: "fluid.videoPlayer.controllers.volumeControl.finalInit",
        events: {
            onReady: null
        }, listeners: {
            onReady : function() {console.log("valume");}
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
            if (ui.value > 66) {
                volumeButton.css("background-image", "url(../images/volume3.png)");
            } else if (ui.value > 33) {
                volumeButton.css("background-image", "url(../images/volume2.png)");
            } else if (ui.value !== 0) {
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
                that.applier.fireChangeRequest({
                    path: "states.currentTime",
                    value: ui.value
                });
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
                var currentTime = changeRequest[0].value;
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
