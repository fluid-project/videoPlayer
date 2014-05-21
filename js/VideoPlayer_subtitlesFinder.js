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

    fluid.defaults("fluid.subtitlesFinder", {
        gradeNames: ["fluid.eventedComponent", "fluid.modelComponent", "autoInit"],
        sources: [],
        events: {
            onReady: null,
            onError: null,
            onDataSourceCreate: null,
            onAllCreated: {
                events: {
                    onDataSourceCreate: "onDataSourceCreate",
                    onSubtitlesFinder: "onCreate"
                },
                args: ["{dataSource}"]
            }
        },
        listeners: {
            onError: "{subtitlesFinder}.events.onReady",
            onAllCreated: {
                listener: "fluid.subtitlesFinder.onCreate"
            }
        },
        serviceURL: null,
        languagesPath: "",
        invokers: {
            generateAbsolutePath: "fluid.subtitlesFinder.generateAbsolutePath",
            createLanguageObject: {
                funcName: "fluid.subtitlesFinder.createLanguageObject",
                args: ["{arguments}.0", "{dataSource}.model.params.video_url"]
            }
        },
        components: {
            dataSource: {
                type: "fluid.dataSource",
                options: {
                    model: {
                        baseURL: "{subtitlesFinder}.options.serviceURL",
                        params: {
                            video_url: "{subtitlesFinder}.options.sources.0.src"
                        }
                    },
                    invokers: {
                        dataParse: {
                            funcName: "fluid.subtitlesFinder.dataParse",
                            args: ["{subtitlesFinder}", "{arguments}.0"]
                        }
                    },
                    listeners: {
                        onCreate: "{subtitlesFinder}.events.onDataSourceCreate",
                        onSuccess: "{subtitlesFinder}.events.onReady",
                        onError: "{subtitlesFinder}.events.onError"
                    }
                }
            }
        }
    });
    
    // Should be an invoker once we have a ginger framework
    fluid.subtitlesFinder.onCreate = function (that) {
        // we might want to parameterize "params.video_url"
        var urlPath = "params.video_url",
            url = fluid.get(that.model, urlPath);
        
        // Change URL for locally hosted subtitles
        if (!fluid.url.isAbsoluteUrl(url)) {
            that.applier.requestChange(urlPath, fluid.subtitlesFinder.generateAbsolutePath(url));
        }
        
        that.get(that);
    };
    
    fluid.subtitlesFinder.dataParse = function (that, data) {
        // If there is data then get the language array in the returned data
        var languages = fluid.get(data, that.options.languagesPath);
        if (!languages) {
            return;
        }
        
        return fluid.transform(languages, that.createLanguageObject);
    };
    
    //// Invokers ////
    
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
    
    fluid.subtitlesFinder.generateAbsolutePath = function (url) {
        var pathSegments = window.location.href.split("/");
        pathSegments.pop();
        return [pathSegments.join("/"), url].join("/");
    };

})(jQuery);