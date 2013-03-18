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

    fluid.defaults("fluid.subtitlesFinder", {
        gradeNames: ["fluid.eventedComponent", "fluid.modelComponent", "autoInit"],
        finalInitFunction: "fluid.subtitlesFinder.finalInit",
        sources: [],
        events: {
            onReady: null,
            fetchedData: null
        },
        urls: {
            captionsUrl: null
            //videoUrl: null
        },
        languagesPath: "",
        listeners: {
            fetchedData: {
                listener: "fluid.subtitlesFinder.fetchedData",
                args: ["{arguments}.0", "{subtitlesFinder}"]
            }
        },
        invokers: {
            buildUrl: "fluid.subtitlesFinder.buildUrl",
            generateAbsolutePath: "fluid.subtitlesFinder.generateAbsolutePath",
            loadCaptionsData: {
                funcName: "fluid.subtitlesFinder.loadCaptionsData",
                args: ["{subtitlesFinder}", "{arguments}.0"]
            },
            createLanguageObject: {
                funcName: "fluid.subtitlesFinder.createLanguageObject",
                args: ["{arguments}.0", "{subtitlesFinder}.options.urls.videoUrl"]
            },
            
            fetchData: {
                funcName: "fluid.subtitlesFinder.fetchData",
                args: ["{arguments}.0", "{subtitlesFinder}"]
            }
        }
    });
    
    fluid.subtitlesFinder.finalInit = function (that) {
        that.options.urls = that.options.urls || {};
        var captionsUrl = that.options.urls.captionsUrl;
        
        if (!captionsUrl) {
            that.events.onReady.fire();
            return;
        }
        
        var sources = that.options.sources;
        if (!sources || sources.length === 0) {
            that.events.onReady.fire();
            return;
        }
        var videoUrl = sources[0].src;
        
        if (!fluid.url.isAbsoluteUrl(videoUrl)) {
            videoUrl = that.generateAbsolutePath(videoUrl);
        }
        
        that.options.urls.videoUrl = videoUrl;
        
        // Start our component by trying to get the data for the specified videoUrl
        var data = that.fetchData(that.buildUrl(captionsUrl, {
            video_url: videoUrl
        }));
    };
    
    fluid.subtitlesFinder.fetchedData = function (data, that) {
        // If there is not data then stop immediately
        if (!data) {
            that.events.onReady.fire();
            return;
        }
        
        // If there is data then get the language array in the returned data
        var languages = fluid.get(data, that.options.languagesPath);
        if (!languages) {
            that.events.onReady.fire();
            return;
        }
        
        // Convert each object array into supported format
        languages = fluid.transform(languages, that.createLanguageObject);
        
        that.events.onReady.fire(languages);
    };
    
    //// Invokers ////
    
    fluid.subtitlesFinder.fetchData = function (url, that) {
        $.ajax({
            dataType: "jsonp",
            url: url
        }).done(function (data) {
            that.events.fetchedData.fire(data);
            return data;
        }).fail(function (data) {
            that.events.fetchedData.fire();
        });
    };
    
    // Function to convert each object of the retreived language array into the object format supported by our videoPlayer (listed in captions, transcripts, ... options)
    fluid.subtitlesFinder.createLanguageObject = function (language, videoUrl) {
        return {
            // This is to comply with current VP caption format
            src: [videoUrl, "&", $.param( {"language": language.code} )].join(""),
            // Amara 2.0 caption link
            // src: language.subtitles_uri
            type: "text/amarajson",
            srclang: language.code,
            label: language.name
        };
    };
    
    fluid.subtitlesFinder.buildUrl = function (baseURL, params) {
        return [baseURL, "?", $.param(params)].join("");
    };
    
    fluid.subtitlesFinder.generateAbsolutePath = function (url) {
        var pathSegments = window.location.href.split("/");
        pathSegments.pop();
        return [pathSegments.join("/"), url].join("/");
    };

})(jQuery);