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

    fluid.demands("fluid.uiOptions.templateLoader", ["fluid.videoPlayer.addMediaPanels", "fluid.tests.videoPlayer"], {
        options: {
            templates: {
                uiOptions: "../../html/FatPanelUIOptions.html",
                captionsSettings: "../../html/MediaPanelTemplate.html",
                transcriptsSettings: "../../html/MediaPanelTemplate.html"
            }
        }
    });

    fluid.defaults("fluid.tests.videoPlayerMediaPanels", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            fatPanel: {
                type: "fluid.uiOptions.fatPanel",
                container: ".flc-uiOptions",
                createOnEvent: "{tester}.events.onTestCaseStart",
                options: {
                    gradeNames: ["fluid.uiOptions.transformDefaultPanelsOptions"],
                    prefix: "../../lib/infusion/components/uiOptions/html/",
                    templateLoader: {
                        options: {
                            gradeNames: ["fluid.uiOptions.starterTemplateLoader"]
                        }
                    },
                    uiOptions: {
                        options: {
                            gradeNames: ["fluid.uiOptions.starterSettingsPanels", "fluid.uiOptions.initialModel.starter", "fluid.uiOptions.uiEnhancerRelay"]
                        }
                    }
                }
            },
            videoPlayer: {
                type: "fluid.videoPlayer",
                container: ".videoPlayer-test",
//                createOnEvent: "{tester}.events.onTestCaseStart",
                options: fluid.testUtils.baseOpts
            },
            tester: {
                type: "fluid.tests.videoPlayerMediaPanelsTester"
            }
        }
    });

    fluid.tests.assertUIOReady = function (uioLoader, uio) {
        jqUnit.assertEquals("IFrame is present and invisible", false, uio.iframeRenderer.iframe.is(":visible"));
    };

    fluid.tests.checkPanelsPresent = function (fatPanel) {
        var defs = fluid.defaults("fluid.videoPlayer.mediaPanels");
        var capsPanel = $(defs.selectors.captionsSettings, fatPanel.iframeRenderer.iframeDocument);
        var transPanel = $(defs.selectors.transcriptsSettings, fatPanel.iframeRenderer.iframeDocument);
        jqUnit.assertEquals("Captions panel is present", 1, capsPanel.length);
        jqUnit.assertEquals("Transcripts panel is present", 1, transPanel.length);
    };

    fluid.tests.checkLanguageControlState = function (fatPanel, panel, expectedState, scenario) {
        var uio = fatPanel.uiOptionsLoader.uiOptions;
        var state = uio[panel].locate("language").prop("disabled");
        jqUnit.assertEquals(scenario + panel + " language dropdown is " + (expectedState ? " " : " not ") + "disabled", expectedState, state);
    };
    fluid.tests.languageControlStateListener = function (fatPanel, panel, expectedState, scenario) {
        return function (newModel, oldModel, requests) {
            fluid.tests.checkLanguageControlState(fatPanel, panel, expectedState, scenario);
        };
    };
    fluid.tests.changeModel = function (fatPanel, panel, path, value) {
        fatPanel.uiOptionsLoader.uiOptions[panel].applier.requestChange(path, value);
    };

    fluid.defaults("fluid.tests.videoPlayerMediaPanelsTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "Basics",
            tests: [{
//                expect: 2,
                name: "Media settings panels initialized correctly",
                sequence: [{
                    listener: "fluid.tests.assertUIOReady",
                    event: "{videoPlayerMediaPanels fatPanel uiOptionsLoader}.events.onReady"
                }, {
                    func: "fluid.tests.checkPanelsPresent",
                    args: ["{fatPanel}"]
                }, {
                    func: "fluid.tests.checkLanguageControlState",
                    args: ["{fatPanel}", "captionsSettings", true, "Initially, "]
                }, {
                    func: "fluid.tests.changeModel",
                    args: ["{fatPanel}", "captionsSettings", "show", true]
                }, {
                    listenerMaker: "fluid.tests.languageControlStateListener",
                    changeEvent: "{fatPanel}.applier.modelChanged",
                    spec: {path: "selections.captions", priority: "last"},
                    makerArgs: ["{fatPanel}", "captionsSettings", false, "After enabling captions, "]
                }, {
                    func: "fluid.tests.changeModel",
                    args: ["{fatPanel}", "captionsSettings", "show", false]
                }, {
                    listenerMaker: "fluid.tests.languageControlStateListener",
                    changeEvent: "{fatPanel}.applier.modelChanged",
                    spec: {path: "selections.captions", priority: "last"},
                    makerArgs: ["{fatPanel}", "captionsSettings", true, "After disabling captions, "]
                }, {
                    func: "fluid.tests.checkLanguageControlState",
                    args: ["{fatPanel}", "transcriptsSettings", true, "Initially, "]
                }, {
                    func: "fluid.tests.changeModel",
                    args: ["{fatPanel}", "transcriptsSettings", "show", true]
                }, {
                    listenerMaker: "fluid.tests.languageControlStateListener",
                    changeEvent: "{fatPanel}.applier.modelChanged",
                    spec: {path: "selections.transcripts", priority: "last"},
                    makerArgs: ["{fatPanel}", "transcriptsSettings", false, "After enabling transcripts, "]
                }, {
                    func: "fluid.tests.changeModel",
                    args: ["{fatPanel}", "transcriptsSettings", "show", false]
                }, {
                    listenerMaker: "fluid.tests.languageControlStateListener",
                    changeEvent: "{fatPanel}.applier.modelChanged",
                    spec: {path: "selections.transcripts", priority: "last"},
                    makerArgs: ["{fatPanel}", "transcriptsSettings", true, "After disabling transcripts, "]
                }]
            }]
        }]
    });

    $(document).ready(function () {
        fluid.globalSettingsStore();
        fluid.pageEnhancer({
            gradeNames: ["fluid.uiEnhancer.starterActions"],
            tocTemplate: "../lib/infusion/components/tableOfContents/html/TableOfContents.html"
        });
        fluid.test.runTests([
            "fluid.tests.videoPlayerMediaPanels"
        ]);
    });

})(jQuery);
