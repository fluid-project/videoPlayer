/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/*global jQuery, fluid*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */


(function ($) {
    fluid.staticEnvironment["fluid--videoPlayer--addMediaPanels"] = fluid.typeTag("fluid.videoPlayer.addMediaPanels");

    /**
     * Captions settings panel.
     */
    fluid.defaults("fluid.videoPlayer.captionsSettings", {
        gradeNames: ["fluid.uiOptions.settingsPanel", "autoInit"],
        model: {
            captions: false,
            language: "en"
        },
        strings: {
            language: ["English", "French", "Klingon"]
        },
        controlValues: { 
            language: ["en", "fr", "kg"]
        },
        selectors: {
            captions: ".flc-uiOptions-captions",
            language: ".flc-uiOptions-caption-language"
        },
        produceTree: "fluid.videoPlayer.captionsSettings.produceTree",
        resources: {
            template: {
                url: "../html/CaptionsPanelTemplate.html"
            }
        }
    });

    /**
     * Transcripts settings panel.
     */
    fluid.defaults("fluid.videoPlayer.transcriptsSettings", {
        gradeNames: ["fluid.uiOptions.settingsPanel", "autoInit"],
        model: {
            transcripts: false,
            language: "en"
        },
        strings: {
            language: ["English", "French", "Klingon"]
        },
        controlValues: { 
            language: ["en", "fr", "kg"]
        },
        selectors: {
            transcripts: ".flc-uiOptions-transcripts",
            language: ".flc-uiOptions-transcript-language"
        },
        produceTree: "fluid.videoPlayer.transcriptsSettings.produceTree",
        resources: {
            template: {
                url: "../html/TranscriptsPanelTemplate.html"
            }
        }
    });

    fluid.videoPlayer.captionsSettings.produceTree = function (that) {
        return {
            captions: "${captions}",
            language: {
                optionnames: that.options.strings.language,
                optionlist: that.options.controlValues.language,
                selection: "${language}",
                decorators: {
                    type: "fluid",
                    func: "fluid.uiOptions.selectDecorator"
                }
            }
        };
    };

    fluid.videoPlayer.transcriptsSettings.produceTree = function (that) {
        return {
            transcripts: "${transcripts}",
            language: {
                optionnames: that.options.strings.language,
                optionlist: that.options.controlValues.language,
                selection: "${language}",
                decorators: {
                    type: "fluid",
                    func: "fluid.uiOptions.selectDecorator"
                }
            }
        };
    };

    // Grade for adding the media panels to uiOptions
    fluid.defaults("fluid.videoPlayer.mediaPanels", {
        gradeNames: ["fluid.uiOptions", "autoInit"],
        selectors: {
            captionsSettings: ".flc-uiOptions-captions-settings",
            transcriptsSettings: ".flc-uiOptions-transcripts-settings"
        },
        components: {
            captionsSettings: {
                type: "fluid.videoPlayer.captionsSettings",
                container: "{uiOptions}.dom.captionsSettings",
                createOnEvent: "onUIOptionsMarkupReady",
                options: {
                    sourceApplier: "{uiOptions}.applier",
                    rules: {
                        "selections.captions": "captions",
                        "selections.captionLanguage": "language"
                    },
                    listeners: {
                        "{uiOptions}.events.onUIOptionsRefresh": "{that}.refreshView"
                    },
                    resources: {
                        template: "{templateLoader}.resources.captionsSettings"
                    }
                }
            },
            transcriptsSettings: {
                type: "fluid.videoPlayer.transcriptsSettings",
                container: "{uiOptions}.dom.transcriptsSettings",
                createOnEvent: "onUIOptionsMarkupReady",
                options: {
                    sourceApplier: "{uiOptions}.applier",
                    rules: {
                        "selections.transcripts": "transcripts",
                        "selections.transcriptLanguage": "language"
                    },
                    listeners: {
                        "{uiOptions}.events.onUIOptionsRefresh": "{that}.refreshView"
                    },
                    resources: {
                        template: "{templateLoader}.resources.transcriptsSettings"
                    }
                }
            }
        }
    });

    var extraSettings = {
        captions: false,
        captionLanguage: "en",
        transcripts: false,
        transcriptLanguage: "fr"
    };

    /**
     * A grade used to add the relay subcomponent to uiEnhancer
     */
    fluid.defaults("fluid.videoPlayer.vpRelay", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        components: {
            relay: {
                type: "fluid.videoPlayer.relay"
            }
        }
    });

    // Add the relay to UIEnhancer
    fluid.demands("fluid.uiEnhancer", ["fluid.videoPlayer.addMediaPanels"], {
        options: {
            gradeNames: ["fluid.uiEnhancer.defaultActions", "fluid.videoPlayer.vpRelay"]
        }
    });

    // Add the extra settings to the outer enhancer
    fluid.demands("fluid.uiOptions.fatPanel", ["fluid.videoPlayer.addMediaPanels"], {
        options: {
            outerEnhancerOptions: {
                defaultSiteSettings: extraSettings
            }
        }
    });

    // Add the media panels to UIOptions
    fluid.demands("fluid.uiOptions", ["fluid.videoPlayer.addMediaPanels"], {
        options: {
            gradeNames: ["fluid.uiOptions.defaultSettingsPanels", "fluid.videoPlayer.mediaPanels"]
        }
    });

    // Tell uiOptions where to find the templates for the media panels
    fluid.demands("fluid.uiOptions.templateLoader", ["fluid.videoPlayer.addMediaPanels"], {
        options: {
            templates: {
                uiOptions: "../html/FatPanelUIOptions.html",
                captionsSettings: "../html/CaptionsPanelTemplate.html",
                transcriptsSettings: "../html/TranscriptsPanelTemplate.html"
            }
        }
    });

    /**
     * A grade responsible for binding the UIEnhancer relay to the VideoPlayer
     */
    fluid.defaults("fluid.videoPlayer.enhancerBinder", {
        gradeNames: ["fluid.littleComponent", "autoInit"],
        listeners: {
            onCreate: "fluid.videoPlayer.enhancerBinder.bindRelay"
        }
    });

    fluid.videoPlayer.enhancerBinder.bindRelay = function (that, callback) {
        callback = callback || fluid.identity;
        // TODO: We need a way to wait for UIE if necessary (see FLUID-5016)
        if (fluid.staticEnvironment.uiEnhancer) {
            fluid.staticEnvironment.uiEnhancer.relay.addTarget(that);
        }
        callback(that);
    };

    // Add the grade to the video player
    fluid.demands("fluid.videoPlayer", ["fluid.videoPlayer.addMediaPanels", "fluid.uiEnhancer"], {
        options: {
            gradeNames: ["fluid.videoPlayer.enhancerBinder"]
        }
    });

})(jQuery);
