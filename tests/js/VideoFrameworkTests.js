/*
Copyright 2012 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, expect, jQuery, start*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

fluid.registerNamespace("fluid.tests");

(function ($) {
    $(document).ready(function () {

        var videoFrameworkTests = new jqUnit.TestCase("Video Framework Tests");

        videoFrameworkTests.asyncTest("linearRangeGuard", function () {
            expect(3);

            var model = {
                volume: 60,
                minVolume: 0,
                maxVolume: 100
            };
            var applier = fluid.makeChangeApplier(model);
            applier.guards.addListener({path: "volume", transactional: true}, fluid.linearRangeGuard(0, 100));

            applier.fireChangeRequest({
                path: "volume",
                value: model.maxVolume + 10
            });
            jqUnit.assertEquals("linearRangeGuard should prevent a value higher than the max", model.maxVolume, model.volume);

            applier.fireChangeRequest({
                path: "volume",
                value: model.minVolume - 10
            });
            jqUnit.assertEquals("linearRangeGuard should prevent a value lower than the min", model.minVolume, model.volume);

            var newValue = model.volume / 2;
            applier.fireChangeRequest({
                path: "volume",
                value: newValue
            });
            jqUnit.assertEquals("linearRangeGuard should allow a value within the range", newValue, model.volume);

            start();
        });

    });
})(jQuery);
