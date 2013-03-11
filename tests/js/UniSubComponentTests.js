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

        jqUnit.module("UniSubComponent Tests");

        fluid.tests.testUniSubComponent = function (testConfigs) {
            fluid.each(testConfigs, function (config, index) {
                jqUnit.asyncTest(config.desc, function () {
                    jqUnit.expect(1);
                    fluid.unisubComponent({
                        sources: config.sources,
                        urls: {
                            captionsUrl: "https://www.universalsubtitles.org/api2/partners/videos/"
                        },
                        languagesPath: "objects.0.languages",
                        listeners: {
                            modelReady: function (data) {
                                data = data || [];
                                if (config.exact) {
                                    jqUnit.assertEquals(config.assertMsg, config.assertExpect, data.length);
                                } else {
                                    jqUnit.assertTrue(config.assertMsg, data.length >= config.assertExpect);
                                }
                                jqUnit.start();
                            }
                        }
                    });
                });
            });
        };

        fluid.tests.testUniSubComponent([{
            desc: "No video, no captions",
            sources: [],
            exact: true,
            assertMsg: "No captions were found",
            assertExpect: 0
        }, {
            desc: "Wrong source",
            sources: [
                {
                    src: "http://w.youte.m/watch?v=_VxQx9E"
                }
            ],
            assertMsg: "No captions were found",
            assertExpect: 0
        }, {
            desc: "Single video, two captions",
            sources: [
                {
                    src: "http://www.youtube.com/watch?v=_VxQEPw1x9E" // "A chance to reorganize our future?", two captions
                }
            ],
            assertMsg: "Two (or more) captions were found",
            assertExpect: 2
        }, {
            desc: "Multiple videos, multiple captions",
            sources: [
                {
                    src: "http://www.youtube.com/watch?v=_VxQEPw1x9E" // "A chance to reorganize our future?", two captions
                },
                {
                    src: "http://www.youtube.com/watch?v=Xxj0jWQo6ao" // Totally different URL "Cultivating loving awareness", nine captions (as of Nov. 30, 2012)
                }
            ],
            assertMsg: "Eleven (or more) captions were found",
            assertExpect: 2
        }, {
            desc: "Non-http video URLs",
            sources: [
                {
                    src: "../../demos/videos/ReorganizeFuture/ReorganizeFuture.webm"
                },
                {
                    src: "../../demos/videos/ReorganizeFuture/ReorganizeFuture.mp4"
                }
            ],
            exact: true,
            assertMsg: "No captions were found",
            assertExpect: 0
        }, {
            desc: "Mixed video URLs",
            sources: [
                {
                    src: "http://www.youtube.com/watch?v=_VxQEPw1x9E" // "A chance to reorganize our future?", two captions
                },
                {
                    src: "../../demos/videos/ReorganizeFuture/ReorganizeFuture.mp4"
                }
            ],
            assertMsg: "Two (or more) captions were found",
            assertExpect: 2
        }]);

    });
})(jQuery);
