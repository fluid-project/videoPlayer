/*
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global demo:true, fluid, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var demo = demo || {};

(function ($) {
    
    fluid.registerNamespace("demo.html5BackwardsCompatability");
    
    demo.html5BackwardsCompatability.createElm = function (tag) {
        $("<" + tag + "/>");
    };

    demo.html5BackwardsCompatability.finalInit = function (that) {
        fluid.each(that.options.elements, that.createElm);
    };
    
    fluid.defaults("demo.html5BackwardsCompatability", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        finalInitFunction: "demo.html5BackwardsCompatability.finalInit",
        invokers: {
            createElm: "demo.html5BackwardsCompatability.createElm"
        },
        elements: ["abbr", "article", "aside", "audio", "canvas", "datalist", "details", "figure", "footer", "header", "hgroup", "mark", "menu", "meter", "nav", "output", "progress", "section", "time", "video"]
    });
})(jQuery);
