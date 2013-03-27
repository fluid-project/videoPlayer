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

(function () {

    "use strict";
    
    fluid.defaults("fluid.dataSource", {
        gradeNames: ["autoInit", "fluid.eventedComponent"],
        events: {
            onError: null,
            onSuccess: null
        },
        invokers: {
            buildUrl: {
                funcName: "fluid.dataSource.buildUrl",
                args: ["{dataSource}.options.baseURL", "{dataSource}.options.params"]
            },
            get: "fluid.dataSource.get",
            modelParse: {
                funcName: "fluid.dataSource.modelParse",
                args: ["{arguments}.0"]
            }
        },
        model: {
            url: null       // URL which will be used to create a jsonp request in order to return data
        },
        dataType: "jsonp",  // Default ajax data type    
        params: {},         // parameters which will be added to the url
        baseURL: null       // url where the call will be made
    });
    
    fluid.dataSource.buildUrl = function (baseURL, params) {
        return [baseURL, "?", $.param(params)].join("");
    };
    
    fluid.dataSource.modelParse = function (data) {
        return data;
    };
    
    fluid.dataSource.get = function (that) {
        var url = that.buildUrl(),
            events = that.events;
        
        $.ajax({
            dataType: that.options.dataType,
            url: url
        }).done(function (data) {
            events.onSuccess.fire(that.modelParse(data));
        }).fail(function () {
            events.onError.fire();
        });  
    };
    
})();