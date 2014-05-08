/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
 
 */

// Declare dependencies
/*global fluid, jqUnit, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    fluid.staticEnvironment.vpTest = fluid.typeTag("fluid.tests.videoPlayer");

    fluid.globalSettingsStore();

    fluid.defaults("fluid.tests.videoPlayerEnhancer", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            videoPlayer: {
                type: "fluid.videoPlayer",
                container: ".videoPlayer-enhancer",
                options: fluid.testUtils.baseOpts
            },
            tester: {
                type: "fluid.tests.videoPlayerEnhancerTester"
            }
        }
    });

    fluid.tests.assert = function (that) {
        jqUnit.assert("VideoPlayer ready");
    };

    fluid.tests.changeEnhancerModel = function (path, value) {
        fluid.staticEnvironment.uiEnhancer.applier.requestChange(path, value);
    };

    fluid.tests.checkPlayerModel = function (path, value) {
        return function (newModel, oldModel, requests) {
            jqUnit.assertEquals("player model at " + path + " should be " + value, value, fluid.get(newModel, path));
        };
    };

    fluid.defaults("fluid.tests.videoPlayerEnhancerTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "Setup",
            tests: [{
                expect: 1,
                name: "Video Player initialised",
                sequence: [{
                    listener: "fluid.tests.assert",
                    event: "{videoPlayer}.events.onReady"
                }]
            }]
        }, {
            name: "Transcripts",
            tests: [{
                expect: 4,
                name: "Video Player responds to changes in transcripts UIEnhancer settings",
                sequence: [{
                    func: "fluid.tests.changeEnhancerModel",
                    args: ["transcripts", true]
                }, {
                    listenerMaker: "fluid.tests.checkPlayerModel",
                    changeEvent: "{videoPlayer}.applier.modelChanged",
                    spec: {path: "*", priority: "last"},
                    makerArgs: ["displayTranscripts", true]
                }, {
                    func: "fluid.tests.changeEnhancerModel",
                    args: ["transcripts", false]
                }, {
                    listenerMaker: "fluid.tests.checkPlayerModel",
                    changeEvent: "{videoPlayer}.applier.modelChanged",
                    spec: {path: "*", priority: "last"},
                    makerArgs: ["displayTranscripts", false]
                }, {
                    func: "fluid.tests.changeEnhancerModel",
                    args: ["transcriptLanguage", "fr"]
                }, {
                    listenerMaker: "fluid.tests.checkPlayerModel",
                    changeEvent: "{videoPlayer}.applier.modelChanged",
                    spec: {path: "*", priority: "last"},
                    makerArgs: ["currentTracks.transcripts.0", 1]
                }, {
                    func: "fluid.tests.changeEnhancerModel",
                    args: ["transcriptLanguage", "en"]
                }, {
                    listenerMaker: "fluid.tests.checkPlayerModel",
                    changeEvent: "{videoPlayer}.applier.modelChanged",
                    spec: {path: "*", priority: "last"},
                    makerArgs: ["currentTracks.transcripts.0", 0]
                }]
            }]
        }, {
            name: "Captions",
            tests: [{
                expect: 4,
                name: "Video Player responds to changes in caption UIEnhancer settings",
                sequence: [{
                    func: "fluid.tests.changeEnhancerModel",
                    args: ["captions", true]
                }, {
                    listenerMaker: "fluid.tests.checkPlayerModel",
                    changeEvent: "{videoPlayer}.applier.modelChanged",
                    spec: {path: "*", priority: "last"},
                    makerArgs: ["displayCaptions", true]
                }, {
                    func: "fluid.tests.changeEnhancerModel",
                    args: ["captions", false]
                }, {
                    listenerMaker: "fluid.tests.checkPlayerModel",
                    changeEvent: "{videoPlayer}.applier.modelChanged",
                    spec: {path: "*", priority: "last"},
                    makerArgs: ["displayCaptions", false]
                }, {
                    func: "fluid.tests.changeEnhancerModel",
                    args: ["captionLanguage", "fr"]
                }, {
                    listenerMaker: "fluid.tests.checkPlayerModel",
                    changeEvent: "{videoPlayer}.applier.modelChanged",
                    spec: {path: "*", priority: "last"},
                    makerArgs: ["currentTracks.captions.0", 1]
                }, {
                    func: "fluid.tests.changeEnhancerModel",
                    args: ["captionLanguage", "en"]
                }, {
                    listenerMaker: "fluid.tests.checkPlayerModel",
                    changeEvent: "{videoPlayer}.applier.modelChanged",
                    spec: {path: "*", priority: "last"},
                    makerArgs: ["currentTracks.captions.0", 0]
                }]
            }]
        }]
    });

    $(document).ready(function () {
        fluid.pageEnhancer({
            uiEnhancer: {
                gradeNames: ["fluid.uiEnhancer.starterEnactors", "fluid.videoPlayer.vpRelay"],
                tocTemplate: "../lib/infusion/components/tableOfContents/html/TableOfContents.html",
                classnameMap: {
                    theme: {
                        "default": null
                    }
                }
            }
        });
        fluid.test.runTests([
            "fluid.tests.videoPlayerEnhancer"
        ]);
    });

})(jQuery);
