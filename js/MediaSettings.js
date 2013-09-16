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
    fluid.defaults("fluid.videoPlayer.panels.mediaSettings", {
        gradeNames: ["fluid.uiOptions.panels", "autoInit"],
        model: {
            show: false,
            language: "en",
            type: "media"
        },
        listeners: {
            onCreate: "fluid.videoPlayer.panels.mediaSettings.toggleLanguageOnShow"
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
            label: ".flc-videoPlayer-media-label",
            show: ".flc-videoPlayer-media",
            choiceLabel: ".flc-videoPlayer-media-choice-label",
            language: ".flc-videoPlayer-media-language"
        },
        produceTree: "fluid.videoPlayer.panels.mediaSettings.produceTree"
    });

    fluid.videoPlayer.panels.mediaSettings.produceTree = function (that) {
        return {
            label: {messagekey: that.mediaType + "Label"},
            choiceLabel: {messagekey: that.mediaType + "ChoiceLabel"},
            icon: {
                decorators: [{
                    type: "addClass",
                    classes: that.options.styles.icon
                }]
            },
            show: "${show}",
            language: {
                optionnames: "${{that}.options.strings.language}",
                optionlist: "${{that}.options.controlValues.language}",
                selection: "${language}",
                decorators: [{
                    type: "jQuery",
                    func: "prop",
                    args: ["disabled", !that.model.show]
                }]
            }
        };
    };

    fluid.videoPlayer.panels.mediaSettings.toggleLanguageOnShow = function (that) {
        that.applier.modelChanged.addListener("show", function (newModel, oldModel, request) {
            that.locate("language").prop("disabled", !that.model.show);
        });
    };

    /**
     * Captions settings panel.
     */
    fluid.defaults("fluid.videoPlayer.panels.captionsSettings", {
        gradeNames: ["fluid.videoPlayer.panels.mediaSettings", "autoInit"],
        preferenceMap: {
            "fluid.videoPlayer.displayCaptions": {
                "model.show": "default"
            },
            "fluid.videoPlayer.captionLanguage": {
                "model.language": "default"
            }
        },
        model: {
            type: "captions"
        },
        styles: {
            icon: "fl-icon-captions"
        },
        members: {
            mediaType: "captions"
        }
    });
    /**
     * Transcripts settings panel.
     */
    fluid.defaults("fluid.videoPlayer.panels.transcriptsSettings", {
        gradeNames: ["fluid.videoPlayer.panels.mediaSettings", "autoInit"],
        preferenceMap: {
            "fluid.videoPlayer.displayTranscripts": {
                "model.show": "default"
            },
            "fluid.videoPlayer.transcriptLanguage": {
                "model.language": "default"
            }
        },
        model: {
            type: "transcripts"
        },
        styles: {
            icon: "fl-icon-transcripts"
        },
        members: {
            mediaType: "transcripts"
        }
    });


    // Grade for adding the media panels to uiOptions
    fluid.defaults("fluid.videoPlayer.mediaPanels", {
        // The ideal grade list is to include "fluid.uiOptions" so that the "mediaPanels" can be
        // used independently without specifying "fluid.uiOptinos" explicitly in API. However,
        // applying it in the grade list causing uiOptions rendered twice. Needs to find out where
        // the problem is.
        gradeNames: [/*"fluid.uiOptions",*/"fluid.viewComponent", "autoInit"],
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
                type: "fluid.videoPlayer.panels.transcriptsSettings",
                container: "{uiOptions}.dom.transcriptsSettings",
                createOnEvent: "onUIOptionsMarkupReady",
                options: {
                    gradeNames: "fluid.uiOptions.defaultPanel",
                    rules: {
                        "selections.transcripts": "show",
                        "selections.transcriptLanguage": "language"
                    },
                    model: {
                        show: "{fluid.uiOptions.rootModel}.rootModel.transcripts",
                        language: "{fluid.uiOptions.rootModel}.rootModel.transcriptLanguage"
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
        funcName: "fluid.videoPlayer.panels.captionsSettings",
        container: "{uiOptions}.dom.captionsSettings",
        options: {
            gradeNames: "fluid.uiOptions.defaultPanel",
            rules: {
                "selections.captions": "show",
                "selections.captionLanguage": "language"
            },
            model: {
                show: "{fluid.uiOptions.rootModel}.rootModel.captions",
                language: "{fluid.uiOptions.rootModel}.rootModel.captionLanguage"
            },
            resources: {
                template: "{templateLoader}.resources.captionsSettings"
            }
        }
    });

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

    // Tell uiOptions where to find the templates for the media panels
    // TODO: These paths will all have to be overridden by integrators. Need a better way, through a prefix?
    fluid.defaults("fluid.videoPlayer.mediaPanelTemplateLoader", {
        gradeNames: ["fluid.uiOptions.resourceLoader", "autoInit"],
        templates: {
            // XXX Still need to handle no-native-video case; demands block not working
            uiOptions: "../html/FatPanelUIOptions.html",
            captionsSettings: "../html/MediaPanelTemplate.html",
            transcriptsSettings: "../html/MediaPanelTemplate.html"
        }
    });

/*
    fluid.demands("fluid.videoPlayer.mediaPanelTemplateLoader", ["fluid.videoPlayer.addMediaPanels"], {
        options: {
            templates: {
                uiOptions: "../html/FatPanelUIOptionsNoNativeVideo.html"
            }
        }
    });
    fluid.demands("fluid.videoPlayer.mediaPanelTemplateLoader", ["fluid.videoPlayer.addMediaPanels", "fluid.browser.nativeVideoSupport"], {
        options: {
            templates: {
                uiOptions: "../html/FatPanelUIOptions.html"
            }
        }
    });
*/

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

    fluid.defaults("fluid.videoPlayer.mediaPanelMessageLoader", {
        gradeNames: ["fluid.uiOptions.resourceLoader", "autoInit"],
        templates: {
            captionSettings: "../messages/captions.json",
            transcriptSettings: "../messages/transcripts.json",
        }
    });
})(jQuery);
