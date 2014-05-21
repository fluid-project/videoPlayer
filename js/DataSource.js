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
    
    fluid.defaults("fluid.dataSource", {
        gradeNames: ["autoInit", "fluid.eventedComponent", "fluid.modelComponent"],
        events: {
            onError: null,
            onSuccess: null
        },
        invokers: {
            get: "fluid.dataSource.get",
            dataParse: {
                funcName: "fluid.dataSource.dataParse",
                args: ["{arguments}.0"]
            }
        },
        model: {
            dataType: "jsonp",  // Default ajax data type    
            params: {},         // parameters which will be added to the url
            baseURL: null       // url where the call will be made
        },
        timeout: 10000          // do not allow jsonp to halt. max timeout request
    });
    
    fluid.dataSource.dataParse = function (data) {
        return data;
    };
    
    fluid.dataSource.get = function (that) {
        var events = that.events,
            model = that.model;
        
        $.ajax({
            dataType: /* "jsonp", */model.dataType,
            url: model.baseURL,
            data: model.params,
            timeout : that.options.timeout
        }).done(function (data) {
            events.onSuccess.fire(that.dataParse(data));
        }).fail(function () {
            events.onError.fire();
        });
    };
    
})();