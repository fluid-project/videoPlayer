/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, window*/

var fluid_1_4 = fluid_1_4 || {};

(function ($, fluid) {

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
    
    var bindMediaDOMEvents = function (that) {
        var video = that.container;
        video.bind("timeupdate", {obj: video[0]}, function (ev) {
            that.applier.fireChangeRequest({
                path: "states.currentTime", 
                value: ev.data.obj.currentTime
            });
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
        
        video.bind("canplay", function () {
            that.applier.fireChangeRequest({
                path: "states.canPlay", 
                value: true
            });
        });
    };
    
    fluid.defaults("fluid.videoPlayer.media", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        finalInitFunction: "fluid.videoPlayer.media.finalInit",
        events: {
            onMediaReady: null
        }, 
        listeners: {
            onMediaReady : function() {console.log("media");}
        },
        
        mediaRenderers: {
            "video/mp4": "fluid.videoPlayer.mediaRenderers.html5SourceTag",
            "video/ogg": "fluid.videoPlayer.mediaRenderers.html5SourceTag",
            "youtube": "fluid.videoPlayer.mediaRenderers.youTubePlayer"
        }
    });
    
    fluid.videoPlayer.media.finalInit = function (that) {
        renderSources(that);
        
        that.setTime = function (time) {
            that.container[0].currentTime = time;
        };
        
        that.setVolume = function (volume) {
            that.container[0].volume = volume;
        };
        
        that.play = function () {
            if (that.model.states.play === true) {
                that.container[0].play();
            } else {
                that.container[0].pause();
            }
        };
        
        bindMediaModel(that);
        bindMediaDOMEvents(that);
        
        that.events.onMediaReady.fire();
    };
    
    fluid.demands("fluid.videoPlayer.media", "fluid.videoPlayer", {
        options: {
            model: "{videoPlayer}.model",
            applier: "{videoPlayer}.applier",
        }
    });

})(jQuery, fluid_1_4);
