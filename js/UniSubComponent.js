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
            fetchedData: null
        },
        urls: {
            captionsUrl: null
            //videoUrl: null
        },
        languagesPath: "",
        listeners: {
            fetchedData: {
                listener: "fluid.unisubComponent.fetchedData",
                args: ["{arguments}.0", "{unisubComponent}"]
            }
        },
        invokers: {
            buildUrl: "fluid.unisubComponent.buildUrl",
            loadCaptionsData: {
                funcName: "fluid.unisubComponent.loadCaptionsData",
                args: ["{unisubComponent}", "{arguments}.0"]
            },
            createLanguageObject: {
                funcName: "fluid.unisubComponent.createLanguageObject",
                args: ["{arguments}.0", "{unisubComponent}.options.urls.videoUrl"]
            },
            
            fetchData: {
                funcName: "fluid.unisubComponent.fetchData",
                args: ["{arguments}.0", "{unisubComponent}"]
            }
        }
    });
    
    fluid.unisubComponent.finalInit = function (that) {
        var sources = that.options.sources;
        if (!sources || sources.length === 0) {
            that.events.onReady.fire();
            return;
        }
        var videoUrl = sources[0].src;
        
        that.options.urls.videoUrl = videoUrl;
        
        // Start our component by trying to get the data for the specified videoUrl
        var data = that.fetchData(that.buildUrl(that.options.urls.captionsUrl, {
            video_url: videoUrl
        }));
    };
    
    fluid.unisubComponent.fetchedData = function (data, that) {
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
    
    fluid.unisubComponent.fetchData = function (url, that) {
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
    fluid.unisubComponent.createLanguageObject = function (language, videoUrl) {
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
    
    fluid.unisubComponent.buildUrl = function (baseURL, params) {
        return [baseURL, "?", $.param(params)].join("");
    };

})(jQuery);