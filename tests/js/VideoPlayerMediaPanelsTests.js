/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt

 */

// Declare dependencies
/*global fluid, jqUnit, QUnit, jQuery*/

// JSLint options
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    QUnit.config.reorder = false;

    fluid.staticEnvironment.vpTest = fluid.typeTag("fluid.tests.videoPlayer");

    /*******************************************************************************
     * set up test environment
     *******************************************************************************/

    fluid.demands("fluid.prefs.store", ["fluid.globalSettingsStore", "fluid.tests.videoPlayer"], {
        funcName: "fluid.tempStore"
    });

    fluid.demands("templateLoader", ["fluid.prefs.separatedPanel", "fluid.tests.videoPlayer"], {
        options: {
            templates: {
                prefsEditor: "../../html/SeparatedPanelNoNativeVideo.html",
                captionsSettings: "../../html/MediaPanelTemplate.html",
                transcriptsSettings: "../../html/MediaPanelTemplate.html"
            }
        }
    });

    fluid.demands("templateLoader", ["fluid.browser.nativeVideoSupport", "fluid.prefs.separatedPanel", "fluid.tests.videoPlayer"], {
        options: {
            templates: {
                prefsEditor: "../../html/SeparatedPanel.html"
            }
        }
    });

    fluid.demands("messageLoader", ["fluid.prefs.separatedPanel", "fluid.tests.videoPlayer"], {
        options: {
            templates: {
                captionSettings: "../../messages/captions.json",
                transcriptSettings: "../../messages/transcripts.json"
            }
        }
    });

    var vpEventsOpts = {
        listeners: {
            onReady: "{fluid.tests.videoPlayerMediaPanels}.events.onVPReady"
        }
    };
    var opts = fluid.copy(fluid.testUtils.baseOpts);
    $.extend(true, opts, vpEventsOpts);

    /*******************************************************************************
     * The to-be-tested component that contains Prefs Editor and video player
     *******************************************************************************/

    fluid.defaults("fluid.tests.videoPlayerMediaPanels", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        components: {
            separatedPanel: {
                type: "fluid.prefs.separatedPanel",
                container: ".flc-prefsEditor",
                options: {
                    gradeNames: ["fluid.prefs.transformDefaultPanelsOptions"],
                    templatePrefix: "../../lib/infusion/framework/preferences/html/",
                    messagePrefix: "../../lib/infusion/framework/preferences/messages/",
                    templateLoader: {
                        gradeNames: ["fluid.videoPlayer.mediaPanelTemplateLoader", "fluid.prefs.starterTemplateLoader"]
                    },
                    messageLoader: {
                        gradeNames: ["fluid.videoPlayer.mediaPanelMessageLoader", "fluid.prefs.starterMessageLoader"]
                    },
                    prefsEditor: {
                        gradeNames: ["fluid.videoPlayer.mediaPanels", "fluid.prefs.starterPanels", "fluid.prefs.rootModel.starter", "fluid.prefs.uiEnhancerRelay"]
                    },
                    listeners: {
                        onReady: "{fluid.tests.videoPlayerMediaPanels}.events.onPrefsEditorReady"
                    }
                }
            },
            videoPlayer: {
                type: "fluid.videoPlayer",
                container: ".videoPlayer-test",
                options: opts
            }
        },
        distributeOptions: {
            source: "{that}.options.vpContainer",
            removeSource: true,
            target: "{that > videoPlayer}.container"
        },
        events: {
            onPrefsEditorReady: null,
            onVPReady: null,
            onReady: {
                events: {
                    onPrefsEditorReady: "onPrefsEditorReady",
                    onVPReady: "onVPReady"
                },
                args: ["{separatedPanel}", "{videoPlayer}"]
            }
        }
    });

    /*******************************************************************************
     * Unit test for initial setup
     *******************************************************************************/

    fluid.tests.checkPanelsPresent = function (separatedPanel, videoPlayer) {
        var defs = fluid.defaults("fluid.videoPlayer.mediaPanels");
        var capsPanel = $(defs.selectors.captionsSettings, separatedPanel.iframeRenderer.iframeDocument);
        var transPanel = $(defs.selectors.transcriptsSettings, separatedPanel.iframeRenderer.iframeDocument);

        jqUnit.assertEquals("IFrame is present and invisible", false, separatedPanel.iframeRenderer.iframe.is(":visible"));

        if (fluid.browser.nativeVideoSupport()) {
            jqUnit.assertEquals("Captions panel is present", 1, capsPanel.length);
        } else {
            jqUnit.assertEquals("Captions panel is not present", 0, capsPanel.length);
        }
        jqUnit.assertEquals("Transcripts panel is present", 1, transPanel.length);

        jqUnit.assertNotUndefined("Video player has been instantiated", videoPlayer);

        jqUnit.start();
    };

    jqUnit.asyncTest("PrefsEditor setup", function () {
        var options = {
            listeners: {
                onReady: "fluid.tests.checkPanelsPresent"
            },
            vpContainer: ".videoPlayer-test-setup"
        };

        fluid.tests.videoPlayerMediaPanels(options);
    });

    /*******************************************************************************
     * Unit tests for transcripts and captions
     *******************************************************************************/

    var mediaControlsSelectors = {
        captions: ".flc-videoPlayer-captionControls-container button",
        transcripts: ".flc-videoPlayer-transcriptControls-container button"
    };
    fluid.tests.languageCodes = ["en", "fr"];

    fluid.tests.capitaliseFirstLetter = function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    fluid.tests.checkTopComponents = function (separatedPanel, videoPlayer) {
        jqUnit.assertNotUndefined("Prefs Editor has been instantiated", separatedPanel);
        jqUnit.assertNotUndefined("Video player has been instantiated", videoPlayer);
    };

    fluid.tests.changePrefsEditorModel = function (separatedPanel, panel, path, value) {
        separatedPanel.prefsEditor[panel].applier.requestChange(path, value);
    };

    fluid.tests.checkMediaState = function (separatedPanel, videoPlayer, media, expectedState, scenario) {
        var prefsEditor = separatedPanel.prefsEditor;
        var langCtrlsEnabled = !prefsEditor[media + "Settings"].locate("language").prop("disabled");
        var mediaEnabled = !!videoPlayer.model["display" + fluid.tests.capitaliseFirstLetter(media)];
        var mediaMenuButtonOn = $(mediaControlsSelectors[media]).hasClass("fl-videoPlayer-" + media + "-button-on");
        jqUnit.assertEquals(scenario + media + " language dropdown is " + (expectedState ? " " : " not ") + "enabled", expectedState, langCtrlsEnabled);
        jqUnit.assertEquals(scenario + media + " are " + (expectedState ? "on" : "off"), expectedState, mediaEnabled);
        jqUnit.assertEquals(scenario + media + " button is " + (expectedState ? "on" : "off"), expectedState, mediaMenuButtonOn);
    };

    fluid.tests.verifyMedia = function (separatedPanel, videoPlayer, media) {
        fluid.tests.checkMediaState(separatedPanel, videoPlayer, media, false, "Initially, ");

        fluid.tests.changePrefsEditorModel(separatedPanel, media + "Settings", "show", true);
        fluid.tests.checkMediaState(separatedPanel, videoPlayer, media, true, "After enabling " + media + ", ");

        fluid.tests.changePrefsEditorModel(separatedPanel, media + "Settings", "language", "fr");
        var actualLang = fluid.tests.languageCodes[videoPlayer.model.currentTracks[media][0]];
        jqUnit.assertEquals(media + " language is set to fr", "fr", actualLang);

        fluid.tests.changePrefsEditorModel(separatedPanel, media + "Settings", "show", false);
        fluid.tests.checkMediaState(separatedPanel, videoPlayer, media, false, "After disabling " + media + ", ");

        jqUnit.start();
    };

    fluid.tests.testMedia = function (media, vpContainer) {
        jqUnit.asyncTest("Video player responds to changes in Prefs Editor " + media + " settings model", function () {
            var options = {
                listeners: {
                    onReady: {
                        listener: "fluid.tests.verifyMedia",
                        args: ["{arguments}.0", "{arguments}.1", media]
                    }
                },
                vpContainer: vpContainer
            };

            fluid.tests.videoPlayerMediaPanels(options);
        });
    };

    fluid.tests.testMedia("transcripts", ".videoPlayer-test-transcripts");

    if (fluid.browser.nativeVideoSupport()) {
        fluid.tests.testMedia("captions", ".videoPlayer-test-captions");
    }

    $(document).ready(function () {
        fluid.globalSettingsStore();
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
    });

})(jQuery);
