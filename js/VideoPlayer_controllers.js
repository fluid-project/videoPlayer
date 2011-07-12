//Controllers
var fluid_1_4 = fluid_1_4 || {};

(function ($, fluid) {
    //bind the right events according to the type of the button
    var  bindMenuDOMEvent = function (obj, type, indice, that) {
        if (type === "captions") { 
            obj.bind({
                "click" : function() {
                    that.events.onCaptionChange.fire(indice);
                }
            });
        } else if (type === "colors") {
            obj.bind({
                "click" : function() {
                    that.events.onColorChange.fire(indice);
                }
            });
        }
    };
    
    var toggleDisplay = function (obj1, obj2) {
        if (obj1.css("display") === "none") { 
            obj2.hide();
            obj1.fadeIn("fast", "linear");
            return "show";
        } else {
            obj1.fadeOut("fast", "linear");
            obj2.show();
            return "hide";
        }
    };
    
    var bindDOMEvents = function (that) {
        
        var volumeButton = that.locate("volume");
        var volumeControl = that.locate("volumeControl");       
        // Bind the volume Control slide event to change the video's volume and its image.
        volumeControl.bind("slide", function (evt, ui) {
           that.events.onVolumeChange.fire(ui.value / 100.0);
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
        volumeControl.mouseleave(toggleDisplay(volumeControl, volumeButton));

        // hide the volume slider when the button is clicked
        volumeButton.click(toggleDisplay(volumeButton, volumeControl));

        var plusButton = that.locate("plus");
        var menu = that.locate("menu");           
        // Display the menu when the plus button is clicked
        plusButton.click(toggleDisplay(plusButton, menu));
        
        //hide the menu when the mouse leaves the slider
        menu.mouseleave(toggleDisplay(menu, plusButton));
        
        var captionButton = that.locate("captionButton");
        //Shows or hides the caption when the button is clicked
        captionButton.click(function () {
            var captionArea = that.locate("captionArea");
            if (captionButton.hasClass(that.options.states.captionOn)) { 
                captionButton.text(that.options.strings.captionOn);
                captionButton.removeClass(that.options.states.captionOff).addClass(that.options.states.captionOn);
            } else {
                captionButton.text(that.options.strings.captionOff);
                captionButton.removeClass(that.options.states.captionOn).addClass(that.options.states.captionOff);
            }
            that.events.onChangeCaptionVisibility.fire();
        });
        
        //toggle from fullscreen to normal view...
        var fullscreenButton = that.locate("fullscreenButton");
        fullscreenButton.click(function () {
            if (fullscreenButton.hasClass(that.options.states.fullscreenOn)) {
                fullscreenButton.removeClass(that.options.states.fullscreenOn).addClass(that.options.states.fullscreenOff);
            } else {
                fullscreenButton.removeClass(that.options.states.fullscreenOff).addClass(that.options.states.fullscreenOn);
            }
            that.events.onChangeFullscreen.fire();
        });
        
        // Bind the play button.
        var playButton = that.locate("playButton");
        playButton.click(function () {
            that.events.onChangePlay.fire();
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
            onChangeFullscreen: null,
            onReady: null,
            onChangePlay: null,
            onVolumeChange: null,
            onChangeCaptionVisibility: null
        },
        
        components: {
            plus: {
                type: "fluid.videoPlayer.controllers.plusMenu",
                createOnEvent: "onReady",
                container: "{controllers}.menuContainer",
                options: {
                    menu: "{videoPlayer}.options.menu"
                }
            },
            times: {
                type: "fluid.videoPlayer.controllers.scrubberAndTime",
                createOnEvent: "onReady",
                container: "{controllers}.container",
                options: {
                    test: "test"
                }
            }
        },
        
        selectors: {
            playButton: ".flc-videoPlayer-controller-play",
            captionButton: ".flc-videoPlayer-controller-caption",
            volume: ".flc-videoPlayer-controller-volume",
            volumeControl: ".flc-videoPlayer-controller-volumeControl",
            fullscreenButton: ".flc-videoPlayer-controller-fullscreen",
            plus: ".flc-videoPlayer-controller-plus",
            menu: ".flc-videoPlayer-controllers-plusMenu-menu"
        },
        
        styles: {
            volume: "fl-videoPlayer-controller-volume",
            volumeControl: "fl-videoPlayer-controller-volumeControl",
            plus: "fl-videoPlayer-controller-plus",
            menu: "fl-videoPlayer-controllers-plusMenu-menu"
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
            volume: "Volume",
            captionOn: "Captions On",
            captionOff: "Captions Off",
            fullscreen: "Fullscreen",
            menu : "Menu"
        }
    });

    fluid.videoPlayer.controllers.finalInit = function (that) {
        // Initially disable the play button and scrubber until the video is ready to go.
        bindDOMEvents(that);
        
        // Bind the Play/Pause button's text status to the HTML 5 video events.
        that.play = function () {
            var playButton = that.locate("playButton");
            playButton.text(that.options.strings.pause);
            playButton.removeClass(that.options.states.play).addClass(that.options.states.pause);
        };
        that.pause = function () {
            var playButton = that.locate("playButton");
            playButton.text(that.options.strings.play);
            playButton.removeClass(that.options.states.pause).addClass(that.options.states.play);
        };
        
        // Enable the Play/Pause button when the video can start playing.
        that.canPlay = function () {
            var playButton = that.locate("playButton");
            playButton.removeAttr("disabled");
        };
        
        
        that.locate("volumeControl").slider({
            orientation: "vertical",
            range: "min",
            min: 0,
            max: 100,
            value: 60
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
            selector: "flc-videoPlayer-controller-volume",
            classes: that.options.styles.volume,
            content: that.options.strings.volume
        }, {
            tag: "div",
            selector: "flc-videoPlayer-controller-volumeControl",
            classes: that.options.styles.volumeControl
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
        
        //we only do the menu if we need it
        if (that.options.plusAvailable === true) {
            rend.render([{
                tag: "button",
                selector: "flc-videoPlayer-controller-plus",
                classes: that.options.styles.plus,
                content: that.options.strings.plus
            }, {
                tag: "div",
                selector: "flc-videoPlayer-controllers-plusMenu-menu",
                classes: that.options.styles.menu
            }]);
            that.menuContainer = that.locate("menu");
        }
    };
    
    fluid.defaults("fluid.videoPlayer.controllers.scrubberAndTime", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        finalInitFunction: "fluid.videoPlayer.controllers.scrubberAndTime.finalInit",
        events: {
            afterScrub: null,
            onScrub: null,
            onReady: null
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
        that.setValue = function (startTime, duration) {
            var scrubber = that.locate("scrubber");
            var currentTime = that.locate("currentTime");
            var totalTime = that.locate("totalTime");
            scrubber.slider("option", "min", startTime);
            scrubber.slider("option", "max", duration + startTime);
            scrubber.slider("enable");
            currentTime.text(fluid.videoPlayer.formatTime(startTime));
            totalTime.text(fluid.videoPlayer.formatTime(duration));
        };
        
        // Bind to the video's timeupdate event so we can programmatically update the slider.
        //TODO get time in hh:mm:ss
        that.updateTime = function (currentTime) {
            var curTime = that.locate("currentTime");
            var scrubber = that.locate("scrubber");
            scrubber.slider("value", currentTime);  
            curTime.text(fluid.videoPlayer.formatTime(currentTime));
        };
        
        that.locate("scrubber").slider({
            unittext: "seconds",
            disabled: true
        });
        that.events.onReady.fire();
    };
    /**
     * plusMenu is a smallMenu that is highly scalable
     * 
     * @param {Object} container the container which this component is rooted
     * @param {Object} options configuration options for the component
     */
    fluid.defaults("fluid.videoPlayer.controllers.plusMenu", {
        gradeNames: ["fluid.viewComponent", "autoInit"], 
        finalInitFunction: "fluid.videoPlayer.controllers.plusMenu.finalInit",
        events: {
            onReady: null,
            onCaptionChange: null,
            onColorChange: null,
            onCloseMenu: null
        },
       /* listeners: {
           onReady: function() { console.log("plus ready");}
        },*/
        styles: {
            element: "fl-videoPlayer-controllers-plusMenu-element",
            subMenu: "fl-videoPlayer-controllers-plusMenu-subMenu",
            up: "fl-videoPlayer-controllers-plusMenu-subMenu-up"
        },
        
        selectors: {
            up: ".flc-videoPlayer-controllers-plusMenu-subMenu-up"
        }
        /*
        
        strings: {
        }*/
        
        
    });
    
    fluid.videoPlayer.controllers.plusMenu.finalInit = function (that) {
        var container;
        var menuRenderer = fluid.simpleRenderer(that.container, {});
        var subMenuRenderer;
        var select;
        fluid.each(that.options.menu, function (val, key) {
            //do each subMenu
            menuRenderer.render({
                tag: "div",
                selector: val.selector,
                classes: that.options.styles.subMenu,
                content: {
                    tag: "a",
                    content: key
                }
            });
            $("." + val.selector + "> a").bind({
                "click": function () {
                    var sel = $("." + val.selector);
                    sel.siblings().fadeOut("fast", function () {
                        sel.children().fadeIn("slow", "linear");
                    });
                }
            });
            
            subMenuRenderer = fluid.simpleRenderer($("." + val.selector));
            //render the up arrow
            subMenuRenderer.render({
                tag: "div",
                selector: "flc-videoPlayer-controllers-plusMenu-subMenu-up",
                classes: [that.options.styles.element, that.options.styles.up],
                content: "up"
            });
            that.locate("up", $("." + val.selector)).bind({
                click: function () {
                    var elt = that.locate("up", $("." + val.selector));
                    elt.parent().children("div").fadeOut("fast", function () {
                        elt.parent().siblings().fadeIn("slow", "linear");
                    });
                }
            });
            
            //add the elements to each subMenu
            fluid.each(val.elements, function (val2, key2) {
                select = "flc-videoPlayer-menu-" + key + "-" + key2;
                subMenuRenderer.render({
                    tag: "div",
                    selector: select,
                    classes: that.options.styles.element, 
                    content: val2.label
                });
                bindMenuDOMEvent($("." + select), key, key2, that);
            });
        });
        that.events.onReady.fire();
        return that;
    };

})(jQuery, fluid_1_4);
