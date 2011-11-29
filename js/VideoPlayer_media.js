/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, window, fluid*/


(function ($) {

    /********************************************************
     *      VideoPlayer Media                               *
     *          Deals with the content of the videoTag      *
     *      And link the events the changeApplier and model *
     ********************************************************/

    var renderSources = function (that) {
        $.each(that.model.video.sources, function (idx, source) {
            var renderer = that.options.mediaRenderers[source.type];
            if ($.isFunction(renderer)) {
                renderer.apply(that, source);
            } else {
                fluid.invokeGlobalFunction(renderer, [that, source]); 
            }                                      
        });
    };

    var bindMediaModel = function (that) {
        that.applier.modelChanged.addListener("states.play", that.play);
    };

    var getcanPlayData = function (data) {
        return data.readyState === 4 || data.readyState === 3 
            || data.readyState === 2; 
    };

    var bindMediaDOMEvents = function (that) {
        var video = that.container;
        video.bind("timeupdate", {obj: video[0]}, function (ev) {
            //weirdly on event a timeupdate event is sent after the ended event 
            //so the condition is to avoid that
            if (ev.data.obj.currentTime !== ev.data.obj.duration) {
                that.applier.fireChangeRequest({
                    path: "states.currentTime", 
                    value: ev.data.obj.currentTime
                });
            }
        });

        video.bind("durationchange", {obj: video[0]}, function (ev) {
            // FF doesn't implement startTime from the HTML 5 spec.
            var startTime = ev.data.obj.startTime || 0;
            that.applier.fireChangeRequest({
                path: "states.totalTime",
                value: ev.data.obj.duration
            });
            that.applier.fireChangeRequest({
                path: "states.currentTime",
                value: ev.data.obj.currentTime
            });
            that.applier.fireChangeRequest({
                path: "states.startTime",
                value: startTime
            });
        });

        video.bind("volumechange", {obj: video[0]}, function (ev) {
            that.applier.fireChangeRequest({
                path: "states.volume",
                value: ev.data.obj.volume * 100
            });
        });

        //all browser don't support the canplay so we do all different states
        video.bind("canplay", {obj: video[0]}, function (ev) {
            that.applier.fireChangeRequest({
                path: "states.canPlay",
                value: getcanPlayData(ev.data.obj)
            });
        });

        video.bind("canplaythrough", {obj: video[0]}, function (ev) {
            that.applier.fireChangeRequest({
                path: "states.canPlay",
                value: getcanPlayData(ev.data.obj)
            });
        });

        video.bind("loadeddata", {obj: video[0]}, function (ev) {
            that.applier.fireChangeRequest({
                path: "states.canPlay",
                value: getcanPlayData(ev.data.obj)
            });
        });

        video.bind("ended", function () {
            that.applier.fireChangeRequest({
                path: "states.play",
                value: false
            });
            that.applier.fireChangeRequest({
                path: "states.currentTime",
                value: 0
            });
        });
    };

    fluid.defaults("fluid.videoPlayer.media", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        finalInitFunction: "fluid.videoPlayer.media.finalInit",
        preInitFunction: "fluid.videoPlayer.media.preInit",
        events: {
            onMediaReady: null
        },

        mediaRenderers: {
            "video/mp4": "fluid.videoPlayer.mediaRenderers.html5SourceTag",
            "video/webm": "fluid.videoPlayer.mediaRenderers.html5SourceTag",
            "video/ogg": "fluid.videoPlayer.mediaRenderers.html5SourceTag",
            "video/ogv": "fluid.videoPlayer.mediaRenderers.html5SourceTag",
            "youtube": "fluid.videoPlayer.mediaRenderers.youTubePlayer"
        }
    });

    fluid.videoPlayer.media.preInit = function (that) {
        that.setTime = function (time) {
            that.container[0].currentTime = time;
        };

        that.setVolume = function (vol) {
            that.container[0].volume = vol;
        };

        that.play = function () {
            if (that.model.states.play === true) {
                that.container[0].play();
            } else {
                that.container[0].pause();
            }
        };

        that.refresh = function () {
            that.setVolume(that.model.states.volume / 100);
            that.play();
        };
    };

    fluid.videoPlayer.media.finalInit = function (that) {
        renderSources(that);
        bindMediaModel(that);
        bindMediaDOMEvents(that);
        that.events.onMediaReady.fire();
    };

    fluid.demands("fluid.videoPlayer.media", "fluid.videoPlayer", {
        options: {
            model: "{videoPlayer}.model",
            applier: "{videoPlayer}.applier",
            listeners: {
                onMediaReady: "{videoPlayer}.events.onMediaReady.fire"
            }
        }
    });

})(jQuery);
