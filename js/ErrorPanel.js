/*
Copyright 2012 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/*global jQuery, fluid*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */


(function ($) {

    /***************************************************************
     * A simple component for rendering messages when errors happen.
     ***************************************************************/
    fluid.defaults("fluid.errorPanel", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        preInitFunction: "fluid.errorPanel.preInit",
        finalInitFunction: "fluid.errorPanel.finalInit",
        selectors: {
            message: ".flc-errorPanel-message",
            dismissButton: ".flc-errorPanel-dismissButton",
            dismissButtonText: ".flc-errorPanel-dismissButton-text",
            retryButton: ".flc-errorPanel-retryButton",
            retryButtonText: ".flc-errorPanel-retryButton-text"
        },
        retryCallback: null,
        templates: {
            panel: {
                href: "errorPanel_template.html"
            }
        },
        strings: {
            messageTemplate: "Sorry, %0 %1 is not currently available.", // %0 = language, %1 = medium
            dismissLabel: "Dismiss error",
            retryLabel: "Retry action"
        },
        styles: {
            hidden: "fl-hidden"
        },
        events: {
            onReady: null
        }
    });
    
    fluid.errorPanel.preInit = function (that) {
        /**
         * @param {Object} values   A collection of token keys and values.
         *                          Keys and values can be of any data type that can be coerced into a string.
         *                          Arrays will work here as well.
         */
        that.show = function (values) {
            that.locate("message").text(fluid.stringTemplate(that.options.strings.messageTemplate, fluid.makeArray(values)));
            that.container.show();
        };

        that.hide = function () {
            that.container.hide();
        };
    };

    fluid.errorPanel.processTemplate = function (that) {
        if (that.options.templates.panel.fetchError) {
            fluid.log("couldn't fetch error message template");
            fluid.log("status: " + that.options.templates.panel.fetchError.status +
                ", textStatus: " + that.options.templates.panel.fetchError.textStatus +
                ", errorThrown: " + that.options.templates.panel.fetchError.errorThrown);
            return;
        }

        that.container.append(that.options.templates.panel.resourceText);
        that.locate("dismissButtonText").text(that.options.strings.dismissLabel);
        that.locate("retryButtonText").text(that.options.strings.retryLabel);

        that.locate("dismissButton").click(that.hide);

        that.locate("retryButton").click(function (ev) {
            ev.preventDefault();
            fluid.invokeGlobalFunction(that.options.retryCallback, fluid.makeArray(that.options.retryArgs));
        });

        that.events.onReady.fire(that);
    };

    fluid.errorPanel.finalInit = function (that) {
        that.container.hide();
        if (!that.options.templates.panel.resourceText) {
            fluid.fetchResources(that.options.templates, function (res) {
                fluid.errorPanel.processTemplate(that);
            });
        } else {
            fluid.errorPanel.processTemplate(that);
        }
    };
})(jQuery);
