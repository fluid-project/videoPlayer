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
//    fluid.setLogging(fluid.logLevel.TRACE);

    /**
     * Captions settings panel.
     */
    fluid.defaults("fluid.uiOptions.captionsSettings", {
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
        produceTree: "fluid.uiOptions.captionsSettings.produceTree",
        resources: {
            template: {
                url: "../html/CaptionsPanelTemplate.html"
            }
        }
    });

    /**
     * Transcripts settings panel.
     */
    fluid.defaults("fluid.uiOptions.transcriptsSettings", {
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
        produceTree: "fluid.uiOptions.transcriptsSettings.produceTree",
        resources: {
            template: {
                url: "../html/TranscriptsPanelTemplate.html"
            }
        }
    });

    fluid.uiOptions.captionsSettings.produceTree = function (that) {
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

    fluid.uiOptions.transcriptsSettings.produceTree = function (that) {
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

    fluid.defaults("fluid.uiOptions.vpPanels", {
        gradeNames: ["fluid.uiOptions", "autoInit"],
        selectors: {
             captionsSettings: ".flc-uiOptions-captions-settings",
             transcriptsSettings: ".flc-uiOptions-transcripts-settings"
        },
        components: {
            captionsSettings: {
                type: "fluid.uiOptions.captionsSettings",
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
                type: "fluid.uiOptions.transcriptsSettings",
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

    fluid.defaults("fluid.uiOptions.enactors.captionsSettingsEnactor", {
        gradeNames: ["fluid.viewComponent", "fluid.uiOptions.enactor", "autoInit"],
        model: {
            captions: false,
            language: "en"
        }
    });
    fluid.defaults("fluid.uiOptions.enactors.transcriptsSettingsEnactor", {
        gradeNames: ["fluid.viewComponent", "fluid.uiOptions.enactor", "autoInit"],
        model: {
            transcript: false,
            language: "en"
        }
    });
    fluid.defaults("fluid.uiEnhancer.vpEnactors", {
        gradeNames: ["fluid.uiEnhancer", "autoInit"],
        components: {
            captionsSettingsEnactor: {
                type: "fluid.uiOptions.enactors.captionsSettingsEnactor",
                container: "{uiEnhancer}.container",
                options: {
                    sourceApplier: "{uiEnhancer}.applier",
                    rules: {
                        "captions": "captions",
                        "language": "language"
                    }
                }
            },
            transcriptsSettingsEnactor: {
                type: "fluid.uiOptions.enactors.transcriptsSettingsEnactor",
                container: "{uiEnhancer}.container",
                options: {
                    sourceApplier: "{uiEnhancer}.applier",
                    rules: {
                        "transcripts": "transcripts",
                        "language": "language"
                    }
                }
            }
        }
    });

    fluid.staticEnvironment.addMediaPanels = fluid.typeTag("fluid.addMediaPanels");
    var extraSettings = {
        captions: false,
        captionLanguage: "en",
        transcripts: false,
        transcriptLanguage: "en"
    };
    fluid.demands("fluid.uiEnhancer", ["fluid.addMediaPanels"], {
        options: {
            gradeNames: ["fluid.uiEnhancer.defaultActions", "fluid.uiEnhancer.vpEnactors"],
            defaultSiteSettings: extraSettings
        }
    });
    fluid.demands("fluid.uiOptions", ["fluid.addMediaPanels"], {
        options: {
            gradeNames: ["fluid.uiOptions.defaultSettingsPanels", "fluid.uiOptions.vpPanels"]
        }
    });
    fluid.demands("fluid.uiOptions.templateLoader", ["fluid.addMediaPanels"], {
        options: {
            templates: {
                uiOptions: "../html/FatPanelUIOptions.html",
                captionsSettings: "../html/CaptionsPanelTemplate.html",
                transcriptsSettings: "../html/TranscriptsPanelTemplate.html"
             }
        }
    });
    fluid.demands("fluid.uiOptions.fatPanel", ["fluid.addMediaPanels"], {
        options: {
            outerEnhancerOptions: {
                defaultSiteSettings: extraSettings
            }
        }
    });
})(jQuery);
