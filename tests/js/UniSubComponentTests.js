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

        var note = " PLEASE NOTE: This test relies on Amara service being up as well as video URLs, API and Data returned back to be compliant with the component at the time when this test was written";
        
        fluid.tests.testUniSubComponent = function (testConfigs) {
            fluid.each(testConfigs, function (config, index) {
                jqUnit.asyncTest(config.desc + note, function () {
                    jqUnit.expect(1);
                    fluid.unisubComponent({
                        sources: config.sources,
                        urls: {
                            captionsUrl: "https://www.universalsubtitles.org/api2/partners/videos/"
                        },
                        languagesPath: "objects.0.languages",
                        listeners: {
                            onReady: function (data) {
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
        
        fluid.unisubComponent.fetchDataTest = function (data, that) {
            that.events.fetchedData.fire(data);
        };
        
        fluid.unisubComponent.fetchDataCheckUrlTest = function (url, compareUrl) {
            jqUnit.assertEquals("url is set properly", compareUrl, url);
            jqUnit.start();
        };
        
        fluid.unisubComponent.createLanguageObjectTest = function (language, path) {
            return {
                language: language.code,
                src: "http://some_weird_source/" + language.name
            };
        };
        
        jqUnit.test("generateAbsolutePath tests", function () {
            jqUnit.expect(3);
            jqUnit.assertEquals("myFile.html", fluid.unisubComponent.generateAbsolutePath("myFile.html"), "file:///Users/alexn/Documents/github/videoPlayer/tests/html/myFile.html");
            jqUnit.assertEquals("../test.html", fluid.unisubComponent.generateAbsolutePath("../test.html"), "file:///Users/alexn/Documents/github/videoPlayer/tests/html/../test.html");
            jqUnit.assertEquals("path/path_again/test.html", fluid.unisubComponent.generateAbsolutePath("path/path_again/test.html"), "file:///Users/alexn/Documents/github/videoPlayer/tests/html/path/path_again/test.html");
        });
        
        jqUnit.asyncTest("No captions URL provided", function () {
            jqUnit.expect(1);
            fluid.unisubComponent({
                sources: [],
                urls: {},
                languagesPath: "objects.0.languages",
                listeners: {
                    onReady: function (data) {
                        jqUnit.assertUndefined("there is no data", data);
                        jqUnit.start();
                    }
                }
            });
        });
        
        jqUnit.asyncTest("No sources provided", function () {
            jqUnit.expect(1);
            fluid.unisubComponent({
                sources: [],
                urls: {
                    captionsUrl: "some url here"
                },
                languagesPath: "objects.0.languages",
                listeners: {
                    onReady: function (data) {
                        jqUnit.assertUndefined("there is no data", data);
                        jqUnit.start();
                    }
                }
            });
        });
        
        jqUnit.asyncTest("No data is returned back from the service", function () {
            jqUnit.expect(1);
            fluid.unisubComponent({
                sources: [
                    {
                        src: "http://some_source_here"
                    }
                ],
                urls: {
                    captionsUrl: "some url here"
                },
                languagesPath: "objects.0.languages",
                invokers: {
                    fetchData: {
                        funcName: "fluid.unisubComponent.fetchDataTest",
                        args: [{}, "{unisubComponent}"]
                    } 
                },
                listeners: {
                    onReady: function (data) {
                        jqUnit.assertUndefined("there is no data", data);
                        jqUnit.start();
                    }
                }
            });
        });
        
        jqUnit.asyncTest("Component with an absolute source path", function () {
            jqUnit.expect(1);
            fluid.unisubComponent({
                sources: [
                    {
                        src: "http://my_video.com"
                    }
                ],
                urls: {
                    captionsUrl: "http://my_api_service.com"
                },
                languagesPath: "languages",
                invokers: {
                    fetchData: {
                        funcName: "fluid.unisubComponent.fetchDataCheckUrlTest",
                        args: ["{arguments}.0", "http://my_api_service.com?video_url=http%3A%2F%2Fmy_video.com"]
                    } 
                }
            });
        });
        
        jqUnit.asyncTest("Component with a relative source path", function () {
            jqUnit.expect(1);
            fluid.unisubComponent({
                sources: [
                    {
                        src: "my_video.mp4"
                    }
                ],
                urls: {
                    captionsUrl: "http://my_api_service.com"
                },
                languagesPath: "languages",
                invokers: {
                    fetchData: {
                        funcName: "fluid.unisubComponent.fetchDataCheckUrlTest",
                        args: ["{arguments}.0", "http://my_api_service.com?video_url=file%3A%2F%2F%2FUsers%2Falexn%2FDocuments%2Fgithub%2FvideoPlayer%2Ftests%2Fhtml%2Fmy_video.mp4"]
                    } 
                }
            });
        });
        
        jqUnit.asyncTest("2 extra languages are returned back from the service", function () {
            jqUnit.expect(1);
            fluid.unisubComponent({
                sources: [
                    {
                        src: "http://some_source_here"
                    }
                ],
                urls: {
                    captionsUrl: "some_url_here"
                },
                languagesPath: "languages",
                invokers: {
                    fetchData: {
                        funcName: "fluid.unisubComponent.fetchDataTest",
                        args: [{
                            languages: [
                                {
                                    code: "rs",
                                    name: "Rastafarian"
                                },
                                {
                                    code: "mr",
                                    name: "Mordorian"
                                }
                            ]
                        }, "{unisubComponent}"]
                    } 
                },
                listeners: {
                    onReady: function (data) {
                        jqUnit.assertDeepEq("We have data which is extra 2 languages here", [
                            {
                                label: "Rastafarian",
                                src: "http://some_source_here&language=rs",
                                srclang: "rs",
                                type: "text/amarajson"
                            },
                            {
                                label: "Mordorian",
                                src: "http://some_source_here&language=mr",
                                srclang: "mr",
                                type: "text/amarajson"
                            }
                        ], data);
                        jqUnit.start();
                    }
                }
            });
        });
        
        jqUnit.asyncTest("2 extra languages are returned back from the service. Different languagesPath", function () {
            jqUnit.expect(1);
            fluid.unisubComponent({
                sources: [
                    {
                        src: "http://some_source_here"
                    }
                ],
                urls: {
                    captionsUrl: "some_url_here"
                },
                languagesPath: "other.languages",
                invokers: {
                    fetchData: {
                        funcName: "fluid.unisubComponent.fetchDataTest",
                        args: [{
                            languages: [
                                {
                                    code: "rs",
                                    name: "Rastafarian"
                                },
                                {
                                    code: "mr",
                                    name: "Mordorian"
                                }
                            ],
                            other: {
                                languages: [
                                    {
                                        code: "el",
                                        name: "Elvish"
                                    }
                                ]
                            }
                        }, "{unisubComponent}"]
                    } 
                },
                listeners: {
                    onReady: function (data) {
                        jqUnit.assertDeepEq("We have data which is extra 2 languages here", [
                            {
                                label: "Elvish",
                                src: "http://some_source_here&language=el",
                                srclang: "el",
                                type: "text/amarajson"
                            }
                        ], data);
                        jqUnit.start();
                    }
                }
            });
        });
        
        jqUnit.asyncTest("2 extra languages are returned back from the service. Changed function to create other captions object format", function () {
            jqUnit.expect(1);
            fluid.unisubComponent({
                sources: [
                    {
                        src: "http://some_source_here"
                    }
                ],
                urls: {
                    captionsUrl: "some_url_here"
                },
                languagesPath: "languages",
                invokers: {
                    createLanguageObject: {
                        funcName: "fluid.unisubComponent.createLanguageObjectTest",
                        args: ["{arguments}.0", "{unisubComponent}"]
                    },
                    fetchData: {
                        funcName: "fluid.unisubComponent.fetchDataTest",
                        args: [{
                            languages: [
                                {
                                    code: "rs",
                                    name: "Rastafarian"
                                },
                                {
                                    code: "mr",
                                    name: "Mordorian"
                                }
                            ]
                        }, "{unisubComponent}"]
                    } 
                },
                listeners: {
                    onReady: function (data) {
                        jqUnit.assertDeepEq("We have data which is extra 2 languages here", [
                            {
                                src: "http://some_weird_source/Rastafarian",
                                language: "rs",
                            },
                            {
                                src: "http://some_weird_source/Mordorian",
                                language: "mr",
                            }
                        ], data);
                        jqUnit.start();
                    }
                }
            });
        });
        
        // Amara tests go here. These tests are VERY brittle. They are heavily relying on video URLs and Amara service as well as Amara API.
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
            desc: "Multiple videos, component grabs cpations only the first source",
            sources: [
                {
                    src: "http://www.youtube.com/watch?v=_VxQEPw1x9E" // "A chance to reorganize our future?", two captions
                },
                {
                    src: "http://www.youtube.com/watch?v=Xxj0jWQo6ao" // Totally different URL "Cultivating loving awareness", nine captions
                }
            ],
            assertMsg: "Two (or more) captions were found",
            assertExpect: 2
        }]);
    
    });
})(jQuery);
