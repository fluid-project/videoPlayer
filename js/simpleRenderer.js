/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery, window*/

var fluid = fluid || {};

(function ($) {
    /**
     * SimpleRenderer injects one or many elements in a the container passed in parameter to the render method
     * @param {Object} container the container in which the elements will be added
     * @param {Object} options configuration options for the comoponent
     */
    fluid.simpleRenderer = function (container, options) {
        var that = fluid.initView("fluid.simpleRenderer", container, options);
        var create;
        var renderAttributes = function (values) {
            var ret = "";
            fluid.each(values, function (val, key) {
                ret += fluid.stringTemplate(" %name='%value' ", {name: key, value: val});
            });
            return ret;
        };
        
        var renderContent = function (elt) {
            if (jQuery.isArray(elt)) {
                var ret = "";
                fluid.each(elt, function (value) {
                    ret += create(value);
                });
                return ret;
            } else if (typeof (elt) === "string") {
                return elt;
            } else {
                return create(elt);
            }
        };
        
        var renderClasses = function (elt, selector) {
            var ret = " class=' " + selector + " "; 
            if (typeof (elt) === "object" && elt) {
                fluid.each(elt, function (value) {
                    ret += " " + value;
                });
            } else {
                ret += elt;
            }
            return ret + "' ";
        };
        
        create = function (values) {
            var data = {
                tag: values.tag,
                classes: (values.classes || values.selector || 0) ? renderClasses(values.classes, values.selector) : "",
                attributes: (values.attributes || 0) ? renderAttributes(values.attributes) : "",
                content: (values.content || 0) ? renderContent(values.content) : ""
            };
            return fluid.stringTemplate(that.options.template, data);
        };
        
        /*
        * Injects the generated code into the container
        * @param {array || string} all the data that will be inject into the container
        * Compulsory shape of the tree parameter (it can be an array or a single object):
        * {
        *   tag: "name of the html tag", (compulsory),
        *   selector: "name of the selector", (only one name),
        *   classes: "an string or array of class names",
        *   attributes: "an object containing the name and the value of each attribute",
        *   content: "either another object describing a child or an array of children or a string containing the data",
        * }
        */
        that.render = function (tree) {
            if (jQuery.isArray(tree)) {
                fluid.each(tree, function (value) {
                    that.container.append(create(value));
                });
            } else {
                that.container.append(create(tree));
            }
        };
        
        that.clear = function () {
            that.container.html("");
        };
        
        return that; 
    };
    
    fluid.defaults("fluid.simpleRenderer", {
        template: "<%tag %classes %attributes >%content </%tag >"
    });

})(jQuery);
