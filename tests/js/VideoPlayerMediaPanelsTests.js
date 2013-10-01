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

    fluid.demands("fluid.uiOptions.store", ["fluid.globalSettingsStore", "fluid.tests.videoPlayer"], {
        funcName: "fluid.tempStore"
    });

    fluid.demands("templateLoader", ["fluid.uiOptions.fatPanel", "fluid.tests.videoPlayer"], {
        options: {
            templates: {
                uiOptions: "../../html/FatPanelUIOptionsNoNativeVideo.html",
                captionsSettings: "../../html/MediaPanelTemplate.html",
                transcriptsSettings: "../../html/MediaPanelTemplate.html"
            }
        }
    });

    fluid.demands("templateLoader", ["fluid.browser.nativeVideoSupport", "fluid.uiOptions.fatPanel", "fluid.tests.videoPlayer"], {
        options: {
            templates: {
                uiOptions: "../../html/FatPanelUIOptions.html"
            }
        }
    });

    fluid.demands("messageLoader", ["fluid.uiOptions.fatPanel", "fluid.tests.videoPlayer"], {
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
     * The to-be-tested component that contains UIO and video player
     *******************************************************************************/

    fluid.defaults("fluid.tests.videoPlayerMediaPanels", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        components: {
            fatPanel: {
                type: "fluid.uiOptions.fatPanel",
                container: ".flc-uiOptions",
                options: {
                    gradeNames: ["fluid.uiOptions.transformDefaultPanelsOptions"],
                    templatePrefix: "../../lib/infusion/components/uiOptions/html/",
                    messagePrefix: "../../lib/infusion/components/uiOptions/messages/",
                    templateLoader: {
                        gradeNames: ["fluid.videoPlayer.mediaPanelTemplateLoader", "fluid.uiOptions.starterTemplateLoader"]
                    },
                    messageLoader: {
                        gradeNames: ["fluid.videoPlayer.mediaPanelMessageLoader", "fluid.uiOptions.starterMessageLoader"]
                    },
                    uiOptions: {
                        gradeNames: ["fluid.videoPlayer.mediaPanels", "fluid.uiOptions.starterPanels", "fluid.uiOptions.rootModel.starter", "fluid.uiOptions.uiEnhancerRelay"]
                    },
                    listeners: {
                        onReady: "{fluid.tests.videoPlayerMediaPanels}.events.onUIOReady"
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
            onUIOReady: null,
            onVPReady: null,
            onReady: {
                events: {
                    onUIOReady: "onUIOReady",
                    onVPReady: "onVPReady"
                },
                args: ["{fatPanel}", "{videoPlayer}"]
            }
        }
    });

    /*******************************************************************************
     * Unit test for initial setup
     *******************************************************************************/

    fluid.tests.checkPanelsPresent = function (fatPanel, videoPlayer) {
        var defs = fluid.defaults("fluid.videoPlayer.mediaPanels");
        var capsPanel = $(defs.selectors.captionsSettings, fatPanel.iframeRenderer.iframeDocument);
        var transPanel = $(defs.selectors.transcriptsSettings, fatPanel.iframeRenderer.iframeDocument);

        jqUnit.assertEquals("IFrame is present and invisible", false, fatPanel.iframeRenderer.iframe.is(":visible"));

        if (fluid.browser.nativeVideoSupport()) {
            jqUnit.assertEquals("Captions panel is present", 1, capsPanel.length);
        } else {
            jqUnit.assertEquals("Captions panel is not present", 0, capsPanel.length);
        }
        jqUnit.assertEquals("Transcripts panel is present", 1, transPanel.length);

        jqUnit.assertNotUndefined("Video player has been instantiated", videoPlayer);

        jqUnit.start();
    };

    jqUnit.asyncTest("UIO setup", function () {
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

    fluid.tests.checkTopComponents = function (fatPanel, videoPlayer) {
        jqUnit.assertNotUndefined("UIO has been instantiated", fatPanel);
        jqUnit.assertNotUndefined("Video player has been instantiated", videoPlayer);
    };

    fluid.tests.changeUIOModel = function (fatPanel, panel, path, value) {
        fatPanel.uiOptions[panel].applier.requestChange(path, value);
    };

    fluid.tests.checkMediaState = function (fatPanel, videoPlayer, media, expectedState, scenario) {
        var uio = fatPanel.uiOptions;
        var langCtrlsEnabled = !uio[media + "Settings"].locate("language").prop("disabled");
        var mediaEnabled = !!videoPlayer.model["display" + fluid.tests.capitaliseFirstLetter(media)];
        var mediaMenuButtonOn = $(mediaControlsSelectors[media]).hasClass("fl-videoPlayer-" + media + "-button-on");
        jqUnit.assertEquals(scenario + media + " language dropdown is " + (expectedState ? " " : " not ") + "enabled", expectedState, langCtrlsEnabled);
        jqUnit.assertEquals(scenario + media + " are " + (expectedState ? "on" : "off"), expectedState, mediaEnabled);
        jqUnit.assertEquals(scenario + media + " button is " + (expectedState ? "on" : "off"), expectedState, mediaMenuButtonOn);
    };

    fluid.tests.verifyMedia = function (fatPanel, videoPlayer, media) {
        fluid.tests.checkMediaState(fatPanel, videoPlayer, media, false, "Initially, ");

        fluid.tests.changeUIOModel(fatPanel, media + "Settings", "show", true);
        fluid.tests.checkMediaState(fatPanel, videoPlayer, media, true, "After enabling " + media + ", ");

        fluid.tests.changeUIOModel(fatPanel, media + "Settings", "language", "fr");
        var actualLang = fluid.tests.languageCodes[videoPlayer.model.currentTracks[media][0]];
        jqUnit.assertEquals(media + " language is set to fr", "fr", actualLang);

        fluid.tests.changeUIOModel(fatPanel, media + "Settings", "show", false);
        fluid.tests.checkMediaState(fatPanel, videoPlayer, media, false, "After disabling " + media + ", ");

        jqUnit.start();
    };

    fluid.tests.testMedia = function (media, vpContainer) {
        jqUnit.asyncTest("Video player responds to changes in UIO " + media + " settings model", function () {
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
