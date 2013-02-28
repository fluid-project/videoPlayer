/*
Copyright 2012 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, jQuery, start*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

fluid.registerNamespace("fluid.tests");

(function ($) {
    $(document).ready(function () {

        var uniSubComponentTests = new jqUnit.TestCase("UniSubComponent Tests");

        fluid.tests.testUniSubComponent = function (testConfigs) {
            fluid.each(testConfigs, function (config, index) {
                uniSubComponentTests.asyncTest(config.desc, function () {
                    jqUnit.expect(1);
                    fluid.unisubComponent({
                        urls: {
                            video: config.video
                        },
                        listeners: {
                            modelReady: function (data) {
                                if (config.exact) {
                                    jqUnit.assertEquals(config.assertMsg, config.assertExpect, data.length);
                                } else {
                                    jqUnit.assertTrue(config.assertMsg, data.length >= config.assertExpect);
                                }
                                start();
                            }
                        }
                    });
                });
            });
        };

        fluid.tests.testUniSubComponent([{
            desc: "Single video (url as string), no captions",
            video: "http://build.fluidproject.org/videoPlayer/videoPlayer/demos/videos/ReorganizeFuture/ReorganizeFuture.webm",
                                    /* "A chance to reorganize our future?", no captions */
            exact: true,
            assertMsg: "No captions were found",
            assertExpect: 0
        }, {
            desc: "Single video (url as string), two captions",
            video: "http://www.youtube.com/v/_VxQEPw1x9E", /* "A chance to reorganize our future?", two captions */
            assertMsg: "Two (or more) captions were found",
            assertExpect: 2
        }, {
            desc: "Single video as array (urls as string), two captions",
            video: ["http://www.youtube.com/v/_VxQEPw1x9E"], /* "A chance to reorganize our future?", two captions */
            assertMsg: "Two (or more) captions were found",
            assertExpect: 2
        }, {
            desc: "Multiple videos (urls as strings), multiple captions",
            video: [
                "http://www.youtube.com/v/_VxQEPw1x9E", /* "A chance to reorganize our future?", two captions */
                "http://www.youtube.com/v/Xxj0jWQo6ao" /* "Cultivating loving awareness", nine captions (as of Nov. 30, 2012) */
            ],
            assertMsg: "Eleven (or more) captions were found",
            assertExpect: 11
        }, {
            desc: "Multiple videos (urls as src properties), multiple captions",
            video: [
                {src: "http://www.youtube.com/v/_VxQEPw1x9E"}, /* "A chance to reorganize our future?", two captions */
                {src: "http://www.youtube.com/v/Xxj0jWQo6ao"} /* "Cultivating loving awareness", nine captions (as of Nov. 30, 2012) */
            ],
            assertMsg: "Eleven (or more) captions were found",
            assertExpect: 11
        }, {
            desc: "Non-http video URLs",
            video: [
                {src: "../../demos/videos/ReorganizeFuture/ReorganizeFuture.webm"},
                {src: "../../demos/videos/ReorganizeFuture/ReorganizeFuture.mp4"}
            ],
            exact: true,
            assertMsg: "No captions were found",
            assertExpect: 0
        }, {
            desc: "Mixed video URLs",
            video: [
                {src: "http://www.youtube.com/v/_VxQEPw1x9E"}, /* "A chance to reorganize our future?", two captions */
                {src: "../../demos/videos/ReorganizeFuture/ReorganizeFuture.mp4"}
            ],
            assertMsg: "Two (or more) captions were found",
            assertExpect: 2
        }]);

    });
})(jQuery);
