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

        jqUnit.module("SubtitlesFinderComponent Tests");

        var note = " PLEASE NOTE: This test relies on Amara service being up as well as video URLs, API and Data returned back to be compliant with the component at the time when this test was written";
        
        fluid.tests.testSubtitlesFinderComponent = function (testConfigs) {
            fluid.each(testConfigs, function (config, index) {
                jqUnit.asyncTest(config.desc + note, function () {
                    jqUnit.expect(1);
                    fluid.subtitlesFinder({
                        sources: config.sources,
                        serviceURL: "https://www.universalsubtitles.org/api2/partners/videos/",
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
        
        fluid.subtitlesFinder.mockGet = function (data, that) {
            // We need to execute dataParse here so that subtitlesFinder dataParse() function is executed on the returned data
            that.events.onSuccess.fire(that.dataParse(data));
        };
        
        fluid.subtitlesFinder.fetchDataCheckUrlTest = function (url, compareUrl) {
            jqUnit.assertEquals("url is set properly", compareUrl, url);
            jqUnit.start();
        };
        
        fluid.subtitlesFinder.createLanguageObjectTest = function (language, path) {
            return {
                language: language.code,
                src: "http://some_weird_source/" + language.name
            };
        };
        
        jqUnit.test("generateAbsolutePath url tests", function () {
            jqUnit.expect(6);
            var testUrlProtocol = function (url) {
                    var protocol = window.location.protocol;
                    return (url.indexOf(protocol) === 0);
                },
                getUrlEnd = function (url) {
                    return url.split("/").pop();
                };
            
            fluid.each(["myFile.html", "../test.html", "path/path_again/test.html"], function (relUrl) {
                var absoluteUrl = fluid.subtitlesFinder.generateAbsolutePath(relUrl);
                jqUnit.assertTrue(relUrl, testUrlProtocol(absoluteUrl));
                jqUnit.assertEquals(relUrl, getUrlEnd(absoluteUrl), getUrlEnd(relUrl));
            });
        });
        
        jqUnit.asyncTest("generateAbsolutePath tests with real files", function () {
            jqUnit.expect(1);
            var testData = { "someData": 1 },
                absoluteUrl = fluid.subtitlesFinder.generateAbsolutePath("../data/generateAbsolutePathTest.json");
            $.ajax({
                dataType: "json",
                url: absoluteUrl,
                success: function (data) {
                    jqUnit.assertDeepEq("The retreived data is correct", data, testData);
                    jqUnit.start();
                },
                error: function () {
                    jqUnit.start();
                }
            });
        });
        
        jqUnit.asyncTest("Component without any useful options", function () {
            jqUnit.expect(1);
            fluid.subtitlesFinder({
                sources: [],
                serviceURL: null,
                languagesPath: "objects.0.languages",
                listeners: {
                    onReady: function (data) {
                        jqUnit.assertUndefined("there is no data", data);
                        jqUnit.start();
                    }
                }
            });
        });
        
        jqUnit.asyncTest("Component is set properly but no sources were provided", function () {
            jqUnit.expect(1);
            fluid.subtitlesFinder({
                sources: [],
                serviceURL: "some funky url here but since nothing to look up then component simply does not do anything",
                languagesPath: "objects.0.languages",
                listeners: {
                    onReady: function (data) {
                        jqUnit.assertUndefined("there is no data", data);
                        jqUnit.start();
                    }
                }
            });
        });
        
        jqUnit.asyncTest("Invalid web-service URL", function () {
            jqUnit.expect(2);
            fluid.subtitlesFinder({
                sources: [{
                    src: "http://some_source_here"
                }],
                serviceURL: "http://i_do_not_exist.org/",
                languagesPath: "objects.0.languages",
                components: {
                    dataSource: {
                        options: {
                            // We are overwriting default timeout setting so that we do not need to wait long for a request to timeout
                            timeout: 1
                        }
                    }
                },
                listeners: {
                    onError: {
                        listener: function () {
                            jqUnit.assert("We got here.");
                        },
                        priority: "first"
                    },
                    onReady: function (data) {
                        jqUnit.assertUndefined("Since URL was invalid, nothing is returned", data);
                        jqUnit.start();
                    }
                }
            });
        });
        
        jqUnit.asyncTest("Empty data is returned back from the web-service", function () {
            jqUnit.expect(1);
            fluid.subtitlesFinder({
                sources: [{
                    src: "http://some_source_here"
                }],
                serviceURL: "http://fluidproject.org/",
                languagesPath: "objects.0.languages",
                components: {
                    dataSource: {
                        options: {
                            invokers: {
                                get: {
                                    funcName: "fluid.subtitlesFinder.mockGet",
                                    args: [{}, "{dataSource}"]
                                }
                            }
                        }
                    }
                },
                listeners: {
                    onReady: function (data) {
                        jqUnit.assertUndefined("Since it was empty data, parsing did not get us anything useful -> nothing is returned", data);
                        jqUnit.start();
                    }
                }
            });
        });
        
        jqUnit.asyncTest("Integration test. Video has a URL source path", function () {
            jqUnit.expect(1);
            fluid.subtitlesFinder({
                sources: [{
                    src: "http://my_video.com"
                }],
                serviceURL: "http://i_do_not_exist.org/",
                languagesPath: "languages",
                components: {
                    dataSource: {
                        options: {
                            // We are overwriting default timeout setting so that we do not need to wait long for a request to timeout
                            timeout: 1
                        }
                    }
                },
                listeners: {
                    onCreate: function (that) {
                        var urlPath = "params.video_url",
                            url = fluid.get(that.dataSource.model, urlPath);
                        jqUnit.assertEquals("Url is proper", url, "http://my_video.com");
                        jqUnit.start();
                    }
                }
            });
        });
        
        jqUnit.asyncTest("Integration test. Video has a relative source path", function () {
            jqUnit.expect(1);
            fluid.subtitlesFinder({
                sources: [{
                    src: "my_video.mp4"
                }],
                serviceURL: "http://i_do_not_exist.org/",
                languagesPath: "languages",
                components: {
                    dataSource: {
                        options: {
                            // We are overwriting default timeout setting so that we do not need to wait long for a request to timeout
                            timeout: 1
                        }
                    }
                },
                listeners: {
                    onCreate: function (that) {
                        var urlPath = "params.video_url",
                            url = fluid.get(that.dataSource.model, urlPath);
                        jqUnit.assertEquals("Url is proper", url, "file:///Users/alexn/Documents/github/videoPlayer/tests/html/my_video.mp4");
                        jqUnit.start();
                    }
                }
            });
        });
        
        jqUnit.asyncTest("2 extra languages are returned back from the service", function () {
            jqUnit.expect(1);
            fluid.subtitlesFinder({
                sources: [{
                    src: "http://some_source_here"
                }],
                serviceURL: "http://i_do_not_exist.org/",
                languagesPath: "languages",
                components: {
                    dataSource: {
                        options: {
                            invokers: {
                                get: {
                                    funcName: "fluid.subtitlesFinder.mockGet",
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
                                    }, "{dataSource}"]
                                }
                            }
                        }
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
            fluid.subtitlesFinder({
                sources: [{
                    src: "http://some_source_here"
                }],
                serviceURL: "http://i_do_not_exist.org/",
                languagesPath: "other.languages",
                components: {
                    dataSource: {
                        options: {
                            invokers: {
                                get: {
                                    funcName: "fluid.subtitlesFinder.mockGet",
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
                                    }, "{dataSource}"]
                                }
                            }
                        }
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
            fluid.subtitlesFinder({
                sources: [{
                    src: "http://some_source_here"
                }],
                serviceURL: "http://i_do_not_exist.org/",
                languagesPath: "languages",
                components: {
                    dataSource: {
                        options: {
                            invokers: {
                                get: {
                                    funcName: "fluid.subtitlesFinder.mockGet",
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
                                    }, "{dataSource}"]
                                }
                            }
                        }
                    }
                },
                invokers: {
                    createLanguageObject: {
                        funcName: "fluid.subtitlesFinder.createLanguageObjectTest",
                        args: ["{arguments}.0", "{subtitlesFinder}"]
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
        fluid.tests.testSubtitlesFinderComponent([{
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
