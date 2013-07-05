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
     * Shared grade for both settings panels
     */
    fluid.defaults("fluid.videoPlayer.mediaSettings", {
        gradeNames: ["fluid.uiOptions.settingsPanel", "autoInit"],
        model: {
            show: false,
            language: "en",
            type: "media"
        },
        listeners: {
            onCreate: "fluid.videoPlayer.mediaSettings.toggleLanguageOnShow"
        },
        strings: {
            language: ["English", "French"]
        },
        controlValues: {
            language: ["en", "fr"]
        },
        styles: {
            icon: "fl-icon"
        },
        selectors: {
            type: ".flc-videoPlayer-media-type",
            icon: ".flc-videoPlayer-media-icon",
            show: ".flc-videoPlayer-media-show",
            language: ".flc-videoPlayer-media-language"
        },
        produceTree: "fluid.videoPlayer.mediaSettings.produceTree"
    });
    fluid.videoPlayer.mediaSettings.produceTree = function (that) {
        return {
            icon: {
                decorators: [{
                    type: "addClass",
                    classes: that.options.styles.icon
                }]
            },
            type: "${type}",
            show: "${show}",
            language: {
                optionnames: that.options.strings.language,
                optionlist: that.options.controlValues.language,
                selection: "${language}",
                decorators: [{
                    type: "jQuery",
                    func: "prop",
                    args: ["disabled", !that.model.show]
                }]
            }
        };
    };
    fluid.videoPlayer.mediaSettings.toggleLanguageOnShow = function (that) {
        that.applier.modelChanged.addListener("show", function (newModel, oldModel, request) {
            that.locate("language").prop("disabled", !that.model.show);
        });
    };

    /**
     * Captions settings panel.
     */
    fluid.defaults("fluid.videoPlayer.captionsSettings", {
        gradeNames: ["fluid.videoPlayer.mediaSettings", "autoInit"],
        model: {
            type: "captions"
        },
        styles: {
            icon: "fl-icon-captions"
        }
    });
    /**
     * Transcripts settings panel.
     */
    fluid.defaults("fluid.videoPlayer.transcriptsSettings", {
        gradeNames: ["fluid.videoPlayer.mediaSettings", "autoInit"],
        model: {
            type: "transcripts"
        },
        styles: {
            icon: "fl-icon-transcripts"
        }
    });


    // Grade for adding the media panels to uiOptions
    fluid.defaults("fluid.videoPlayer.mediaPanels", {
        gradeNames: ["fluid.uiOptions", "autoInit"],
        selectors: {
            captionsSettings: ".flc-uiOptions-captions-settings",
            transcriptsSettings: ".flc-uiOptions-transcripts-settings"
        },
        components: {
            captionsSettings: {
                type: "fluid.emptyEventedSubcomponent",
                createOnEvent: "onUIOptionsMarkupReady"
            },
            transcriptsSettings: {
                type: "fluid.videoPlayer.transcriptsSettings",
                container: "{uiOptions}.dom.transcriptsSettings",
                createOnEvent: "onUIOptionsMarkupReady",
                options: {
                    gradeNames: "fluid.uiOptions.defaultSettingsPanel",
                    rules: {
                        "selections.transcripts": "show",
                        "selections.transcriptLanguage": "language"
                    },
                    resources: {
                        template: "{templateLoader}.resources.transcriptsSettings"
                    }
                }
            }
        }
    });

    // Captions are only supported in browsers wtih native video support
    fluid.demands("captionsSettings", ["fluid.browser.nativeVideoSupport"], {
        funcName: "fluid.videoPlayer.captionsSettings",
        container: "{uiOptions}.dom.captionsSettings",
//        createOnEvent: "onUIOptionsMarkupReady",
        options: {
            gradeNames: "fluid.uiOptions.defaultSettingsPanel",
            rules: {
                "selections.captions": "show",
                "selections.captionLanguage": "language"
            },
            resources: {
                template: "{templateLoader}.resources.captionsSettings"
            }
        }
    });

    var extraSettings = {
        captions: false,
        captionLanguage: "en",
        transcripts: false,
        transcriptLanguage: "en"
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
            gradeNames: ["fluid.uiEnhancer.defaultActions", "fluid.videoPlayer.vpRelay"],
            defaultSiteSettings: extraSettings
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
                captionsSettings: "../html/MediaPanelTemplate.html",
                transcriptsSettings: "../html/MediaPanelTemplate.html"
            }
        }
    });
    fluid.demands("fluid.uiOptions.templateLoader", ["fluid.videoPlayer.addMediaPanels"], {
        options: {
            templates: {
                uiOptions: "../html/FatPanelUIOptionsNoNativeVideo.html"
            }
        }
    });
    fluid.demands("fluid.uiOptions.templateLoader", ["fluid.videoPlayer.addMediaPanels", "fluid.browser.nativeVideoSupport"], {
        options: {
            templates: {
                uiOptions: "../html/FatPanelUIOptions.html"
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
