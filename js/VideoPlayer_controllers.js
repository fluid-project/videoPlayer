//Controllers
var fluid_1_4 = fluid_1_4 || {};

(function ($, fluid) {
    //bind the right events according to the type of the button
    var  bindMenuDOMEvent = function (obj, type, indice, that) {
        if (type === "captions") { 
            obj.bind({
                "click" : function() {
                    console.log("caption" + indice);
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
    
    var bindDOMEvents = function (that) {
        var scrubber = that.locate("scrubber");
        var currentTime = that.locate("currentTime");
        var totalTime = that.locate("totalTime");
        
        var jVideo = $(that.video);
        
        // Setup the scrubber when we know the duration of the video.
        jVideo.bind("durationchange", function () {
            var startTime = that.video.startTime || 0; // FF doesn't implement startTime from the HTML 5 spec.
            scrubber.slider("option", "min", startTime);
            scrubber.slider("option", "max", that.video.duration + startTime);
            scrubber.slider("enable");
            currentTime.text(fluid.videoPlayer.formatTime(startTime));
            totalTime.text(fluid.videoPlayer.formatTime(that.video.duration));
        });
        
        // Bind to the video's timeupdate event so we can programmatically update the slider.
        //TODO get time in hh:mm:ss
        jVideo.bind("timeupdate", function () {
            scrubber.slider("value", that.video.currentTime);  
            currentTime.text(fluid.videoPlayer.formatTime(that.video.currentTime));
        });
        
        // Bind the scrubbers slide event to change the video's time.
        scrubber.bind({
            "slide": function (evt, ui) {
                that.video.currentTime = ui.value;
                currentTime.text(fluid.videoPlayer.formatTime(that.video.currentTime));
            },
            "slidestop": function () {
                that.events.afterScrub.fire(that.video.currentTime);
            }
        });
        
        var volumeButton = that.locate("volume");
        var volumeControl = that.locate("volumeControl");       
        // Bind the volume Control slide event to change the video's volume and its image.
        volumeControl.bind("slide", function (evt, ui) {
            that.video.volume = ui.value / 100.0;
            if (ui.value > 66) {
                $(volumeButton).css("background-image", "url(../images/volume3.png)");
            } else if (ui.value > 33) {
                $(volumeButton).css("background-image", "url(../images/volume2.png)");
            } else if (ui.value !== 0) {
                $(volumeButton).css("background-image", "url(../images/volume1.png)");
            } else {
                $(volumeButton).css("background-image", "url(../images/volume0.png)");
            }
            
        });

        //destroy the volume slider when the mouse leaves the slider
        volumeControl.mouseleave(function (evt, ui) {
            if (volumeControl.css("display") !== "none") {
                volumeControl.hide();
                volumeButton.fadeIn("fast", "linear");            
            }         
        });

        // hide the volume slider when the button is clicked
        volumeButton.click(function () {
            if (volumeControl.css("display") === "none") { 
                volumeButton.hide();
                volumeControl.fadeIn("fast", "linear");
            } else {
                volumeControl.fadeOut("fast", "linear");
                volumeButton.show();
            }
        });

        var plusButton = that.locate("plus");
        var menu = that.locate("menu");           
        // Display the menu when the plus button is clicked
        plusButton.click(function () {
            if (menu.css("display") === "none") { 
                plusButton.hide();
                menu.fadeIn("fast", "linear");
            } else {
                menu.fadeOut("fast", "linear");
                plusButton.show();
            }
        });
        
        //hide the menu when the mouse leaves the slider
        menu.mouseleave(function (evt, ui) {
            if (menu.css("display") !== "none") {
                menu.hide();
                plusButton.fadeIn("fast", "linear");
            }
        });
        
        var captionButton = that.locate("captionButton");
        //Shows or hides the caption when the button is clicked
        captionButton.click(function () {
            var captionArea = $(that.options.selectors.captionArea);
            if (captionArea.css("display") === "none") { 
                captionArea.fadeIn("fast", "linear");
                captionButton.text(that.options.strings.captionOn);
                captionButton.removeClass(that.options.states.captionOff).addClass(that.options.states.captionOn);
            } else {
                captionArea.fadeOut("fast", "linear");
                captionButton.text(that.options.strings.captionOff);
                captionButton.removeClass(that.options.states.captionOn).addClass(that.options.states.captionOff);
            }
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
            if (that.video.paused) {
                that.video.play();
            } else {
                that.video.pause();
            }
        });
        
        
        // Bind the Play/Pause button's text status to the HTML 5 video events.
        jVideo.bind("play", function () {
            playButton.text(that.options.strings.pause);
            playButton.removeClass(that.options.states.play).addClass(that.options.states.pause);
        });
        jVideo.bind("pause", function () {
            playButton.text(that.options.strings.play);
            playButton.removeClass(that.options.states.pause).addClass(that.options.states.play);
        });
        
        // Enable the Play/Pause button when the video can start playing.
        jVideo.bind("canplay", function () {
            playButton.removeAttr("disabled");
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
            afterScrub: null,
            onReady: null
        },
        
        components: {
            plus: {
                type: "fluid.videoPlayer.controllers.plusMenu",
                createOnEvent: "onReady",
                container: "{controllers}.menuContainer",
                options: {
                    menu: "{videoPlayer}.options.menu"
                }
            }
        },
        
        selectors: {
            playButton: ".flc-videoPlayer-controller-play",
            captionButton: ".flc-videoPlayer-controller-caption",
            scrubber: ".flc-videoPlayer-controller-scrubber",
            totalTime: ".flc-videoPlayer-controller-total",
            currentTime: ".flc-videoPlayer-controller-current",
            volume: ".flc-videoPlayer-controller-volume",
            volumeControl: ".flc-videoPlayer-controller-volumeControl",
            fullscreenButton: ".flc-videoPlayer-controller-fullscreen",
            plus: ".flc-videoPlayer-controller-plus",
            menu: ".flc-videoPlayer-controllers-plusMenu-menu"
        },
        
        styles: {
            time: "fl-videoPlayer-controller-time",
            scrubber: "fl-videoPlayer-controller-scrubber",
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
            scrubber: "Scrubber",
            totalTime: "Total time",
            currentTime: "Current time",
            volume: "Volume",
            captionOn: "Captions On",
            captionOff: "Captions Off",
            fullscreen: "Fullscreen",
            menu : "Menu"
        }
    });

    fluid.videoPlayer.controllers.finalInit = function (that) {
        that.video = fluid.unwrap(that.options.video);
        // Initially disable the play button and scrubber until the video is ready to go.
        bindDOMEvents(that);
        that.locate("scrubber").slider({
            unittext: "seconds",
            disabled: true
        });
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
            tag: "div",
            selector: "flc-videoPlayer-controller-current", 
            classes: that.options.styles.time,
            content: that.options.strings.currentTime
        }, { 
            tag: "div", 
            selector: "flc-videoPlayer-controller-scrubber", 
            classes: that.options.styles.scrubber,
            content: that.options.strings.scrubber
        }, {
            tag: "div",
            selector: "flc-videoPlayer-controller-total",
            classes: that.options.styles.time,
            content: that.options.strings.totalTime
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
        listeners: {
           onReady: function() { console.log("plus ready");}
        },
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
