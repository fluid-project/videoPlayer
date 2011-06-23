//Controllers
(function ($) {
    
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
        that.locate("scrubber").bind({
            "slide": function (evt, ui) {
                that.video.currentTime = ui.value;
                currentTime.text(fluid.videoPlayer.formatTime(that.video.currentTime));
            },
            "slidestop": that.events.scrubbed.fire
        });
        
        var volumeButton = that.locate("volume");
        var volumeControl = that.locate("volumeControl");       
        // Bind the volume Control slide event to change the video's volume and its image.
        volumeControl.bind("slide", function (evt, ui) {
            that.video.volume = ui.value/100.0;
            if (ui.value > 66) {
                $(volumeButton).css("background-image","url(../images/volume3.png)");
            } else if( ui.value > 33 ) {
                $(volumeButton).css("background-image","url(../images/volume2.png)");
            } else if( ui.value /= 0) {
                $(volumeButton).css("background-image", "url(../images/volume1.png)");
            } else {
                $(volumeButton).css("background-image", "url(../images/volume0.png)");
            }
            
        });

        //destroy the volume slider when the mouse leaves the slider
        volumeControl.mouseleave( function (evt, ui) {
            if ($(volumeControl).css("display") !== "none") {
                $(volumeControl).hide();
                $(volumeButton).fadeIn("fast","linear");            
            }         
        });

        // Display the volume slider when the button is clicked
        volumeButton.click(function () {
            if ($(volumeControl).css("display") === "none") { 
                $(volumeButton).hide();
                $(volumeControl).fadeIn("fast","linear");
            } else {
                $(volumeControl).fadeOut("fast","linear");
                $(volumeButton).show();
            }
        });
        

        
        var captionButton = that.locate("captionButton");
        captionButton.click(function () {
            var captionArea = $(that.options.selectors.captionArea);
            if (captionArea.css("display") === "none") { 
                captionArea.fadeIn("fast","linear");
                captionButton.text(that.options.strings.captionOn);
                captionButton.removeClass(that.options.states.captionOff).addClass(that.options.states.captionOn);
            } else {
                captionArea.fadeOut("fast","linear");
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
            that.events.fullscreen.fire();
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
    
    var setupController = function (that) {
        // Render the play button if it's not already there.
        var rend = fluid.simpleRenderer(that.container, {});
        rend.render([{
            tag: "button",
            selector: "flc-videoPlayer-controller-play",
            classes: that.options.states.play,
            attributes: {disabled: "disabled" },
            content: that.options.strings.play
        },{
            tag: "div",
            selector: "flc-videoPlayer-controller-current", 
            classes: that.options.styles.time,
            content: that.options.strings.currentTime
        },{ 
            tag: "div", 
            selector: "flc-videoPlayer-controller-scrubber", 
            classes: that.options.styles.scrubber,
            content: that.options.strings.scrubber
        },{
            tag: "div",
            selector: "flc-videoPlayer-controller-total",
            classes: that.options.styles.time,
            content: that.options.strings.totalTime
        },{
            tag: "button",
            selector: "flc-videoPlayer-controller-volume",
            classes: that.options.styles.volume,
            content: that.options.strings.volume
        },{
            tag: "div",
            selector: "flc-videoPlayer-controller-volumeControl",
            classes: that.options.styles.volumeControl
        },{
            tag: "button",
            selector: "flc-videoPlayer-controller-caption",
            classes: that.options.states.captionOn,
            content: that.options.strings.captionOn
        },{
            tag: "button",
            selector: "flc-videoPlayer-controller-fullscreen",
            classes: that.options.states.fullscreenOn,
            content: that.options.strings.fullscreen
        }]);
               
        // Initially disable the play button and scrubber until the video is ready to go.
        that.locate("scrubber").slider({unittext: " seconds"}).slider("disable");
        that.locate("volumeControl").slider({
            orientation: "vertical",
            range: "min",
            min: 0,
            max: 100,
            value: 0//60 normally but the sound annoys me :)
        });
        /*scrubber.slider("option", "min", startTime);
            scrubber.slider("option", "max", that.video.duration + startTime);
            scrubber.slider("enable");*/
        bindDOMEvents(that);
    };
    
    /**
     * PlayAndScrubController is a simple video controller containing a play button and a time scrubber.
     * 
     * @param {Object} container the container which this component is rooted
     * @param {Object} options configuration options for the component
     */
    fluid.videoPlayer.controllers = function (container, options) {
        var that = fluid.initView("fluid.videoPlayer.playAndScrubController", container, options);
        that.video = fluid.unwrap(that.options.video);
        that.captions = fluid.unwrap(that.options.captions);
        
        setupController(that);
        return that;
    };
    
    fluid.demands("playAndScrubController","fluid.videoPlayer", {funcName: "fullscreen", args: ["bool"]});
    
    fluid.defaults("fluid.videoPlayer.playAndScrubController", {        
        video: null,
        
        selectors: {
            playButton: ".flc-videoPlayer-controller-play",
            captionButton: ".flc-videoPlayer-controller-caption",
            scrubber: ".flc-videoPlayer-controller-scrubber",
            totalTime: ".flc-videoPlayer-controller-total",
            currentTime: ".flc-videoPlayer-controller-current",
            volume: ".flc-videoPlayer-controller-volume",
            volumeControl: ".flc-videoPlayer-controller-volumeControl",
            fullscreenButton: ".flc-videoPlayer-controller-fullscreen"
        },
        
        styles: {
            time: "fl-videoPlayer-controller-time",
            scrubber: "fl-videoPlayer-controller-scrubber",
            volume: "fl-videoPlayer-controller-volume",
            volumeControl: "fl-videoPlayer-controller-volumeControl"
        },
        
        states: {
            play: "fl-videoPlayer-state-play",
            pause: "fl-videoPlayer-state-pause",
            captionOn: "fl-videoPlayer-state-captionOn",
            captionOff: "fl-videoPlayer-state-captionOff",
            fullscreenOn: "fl-videoPlayer-state-fullscreenOn",
            fullscreenOff: "fl-videoPlayer-state-fullscreenOff"
        },
        
        events: {
            fullscreen: null,
            scrubbed: null,
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
            fullscreen: "Fullscreen"
        }
    });

})(jQuery);
