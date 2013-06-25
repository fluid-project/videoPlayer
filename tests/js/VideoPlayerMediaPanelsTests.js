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

    fluid.demands("fluid.uiOptions.store", ["fluid.globalSettingsStore", "fluid.tests.videoPlayer"], {
        funcName: "fluid.tempStore"
    });

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
                options: fluid.testUtils.baseOpts
            },
            tester: {
                type: "fluid.tests.videoPlayerMediaPanelsTester"
            }
        }
    });

    var mediaControlsSelectors = {
        captions: ".flc-videoPlayer-captionControls-container button",
        transcripts: ".flc-videoPlayer-transcriptControls-container button"
    };
    fluid.tests.languageCodes = ["en", "fr"];

    fluid.tests.capitaliseFirstLetter = function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    fluid.tests.changeUIOModel = function (fatPanel, panel, path, value) {
        fatPanel.uiOptionsLoader.uiOptions[panel].applier.requestChange(path, value);
    };

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

    fluid.tests.checkMediaState = function (fatPanel, videoPlayer, media, expectedState, scenario) {
        var uio = fatPanel.uiOptionsLoader.uiOptions;
        var langCtrlsEnabled = !uio[media + "Settings"].locate("language").prop("disabled");
        var mediaEnabled = !!videoPlayer.model["display" + fluid.tests.capitaliseFirstLetter(media)];
        var mediaMenuButtonOn = $(mediaControlsSelectors[media]).hasClass("fl-videoPlayer-" + media + "-button-on");
        jqUnit.assertEquals(scenario + media + " language dropdown is " + (expectedState ? " " : " not ") + "enabled", expectedState, langCtrlsEnabled);
        jqUnit.assertEquals(scenario + media + " are " + (expectedState ? "on" : "off"), expectedState, mediaEnabled);
        jqUnit.assertEquals(scenario + media + " button is " + (expectedState ? "on" : "off"), expectedState, mediaMenuButtonOn);
    };

    fluid.tests.mediaStateListener = function (fatPanel, videoPlayer, media, expectedState, scenario) {
        return function (newModel, oldModel, requests) {
            fluid.tests.checkMediaState(fatPanel, videoPlayer, media, expectedState, scenario);
        };
    };

    fluid.tests.mediaLanguageListener = function (videoPlayer, media, expectedLang, scenario) {
        return function (newModel, oldModel, requests) {
            var actualLang = fluid.tests.languageCodes[videoPlayer.model.currentTracks[media][0]];
            jqUnit.assertEquals(scenario + media + " language is set to " + expectedLang, expectedLang, actualLang);
        };
    };

    fluid.defaults("fluid.tests.videoPlayerMediaPanelsTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "Media Panels",
            tests: [{
                expect: 13,
                name: "Video player responds to changes in UIO model",
                sequence: [{
                    listener: "fluid.tests.assertUIOReady",
                    event: "{videoPlayerMediaPanels fatPanel uiOptionsLoader}.events.onReady"
                }, {
                    func: "fluid.tests.checkPanelsPresent",
                    args: ["{fatPanel}"]
                }, {
                    func: "fluid.tests.checkMediaState",
                    args: ["{fatPanel}", "{videoPlayer}", "captions", false, "Initially, "]
                }, {
                    func: "fluid.tests.changeUIOModel",
                    args: ["{fatPanel}", "captionsSettings", "show", true]
                }, {
                    listenerMaker: "fluid.tests.mediaStateListener",
                    changeEvent: "{fatPanel}.applier.modelChanged",
                    spec: {path: "selections.captions", priority: "last"},
                    makerArgs: ["{fatPanel}", "{videoPlayer}", "captions", true, "After enabling captions, "]
                }, {
                    func: "fluid.tests.changeUIOModel",
                    args: ["{fatPanel}", "captionsSettings", "language", "fr"]
                }, {
                    listenerMaker: "fluid.tests.mediaLanguageListener",
                    changeEvent: "{fatPanel}.applier.modelChanged",
                    spec: {path: "selections.captionLanguage", priority: "last"},
                    makerArgs: ["{videoPlayer}", "captions", "fr", "After setting lang to 'fr', "]
                }, {
                    func: "fluid.tests.changeUIOModel",
                    args: ["{fatPanel}", "captionsSettings", "show", false]
                }, {
                    listenerMaker: "fluid.tests.mediaStateListener",
                    changeEvent: "{fatPanel}.applier.modelChanged",
                    spec: {path: "selections.captions", priority: "last"},
                    makerArgs: ["{fatPanel}", "{videoPlayer}", "captions", false, "After disabling captions, "]
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
