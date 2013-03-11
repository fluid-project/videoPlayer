/*
Copyright 2012 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/*global jQuery, window, fluid*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {

    "use strict";

    fluid.defaults("fluid.unisubComponent", {
        gradeNames: ["fluid.eventedComponent", "fluid.modelComponent", "autoInit"],
        finalInitFunction: "fluid.unisubComponent.finalInit",
        sources: [],
        events: {
            onReady: null,
            modelReady: null
        },
        urls: {
            captionsUrl: null,
            videoUrl: null
        },
        languagesPath: "",
        invokers: {
            buildUrl: "fluid.unisubComponent.buildUrl",
            loadCaptionsData: {
                funcName: "fluid.unisubComponent.loadCaptionsData",
                args: ["{that}", "{arguments}.0"]
            }
        }
    });
    
    fluid.unisubComponent.finalInit = function (that) {
        var sources = that.options.sources;
        if (!sources || sources.length === 0) {
            that.events.modelReady.fire();
            that.events.onReady.fire(that);
            return;
        }
        
        var videoUrl = sources[0].src;
        
        that.options.urls.videoUrl = videoUrl;
        
        // Grab captions data from Amara for the video
        that.loadCaptionsData({
            url: that.buildUrl(that.options.urls.captionsUrl, {
                video_url: videoUrl
            })
        });
    };
    
    //// Invokers ////
    
    fluid.unisubComponent.buildUrl = function (baseURL, params) {
        return [baseURL, "?", $.param(params)].join("");
    };
    
    fluid.unisubComponent.loadCaptionsData = function (that, options) {
        $.ajax({
            dataType: "jsonp",
            url: options.url
        }).done(function (data) {
            if (!data) {
                that.events.modelReady.fire();
                that.events.onReady.fire(that);
                return;
            }
            
            var languages = fluid.get(data, that.options.languagesPath),
                videoUrl = that.options.urls.videoUrl;
            
            if (!languages) {
                that.events.modelReady.fire();
                that.events.onReady.fire(that);
                return;
            }
            languages = fluid.transform(languages, function (language) {
                return {
                    // This is to comply with current VP caption format
                    src: [videoUrl, "&", $.param( {"language": language.code} )].join(""),
                    // Amara 2.0 caption link
                    // src: language.subtitles_uri
                    type: "text/amarajson",
                    srclang: language.code,
                    label: language.name
                };
            });
            
            if (languages.length > 0) {
                that.events.modelReady.fire(languages);
                that.events.onReady.fire(that);
            }
        }).fail(function (data) {
            that.events.modelReady.fire();
            that.events.onReady.fire(that);
        });
    };

})(jQuery);