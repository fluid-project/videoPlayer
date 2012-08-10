/*
Copyright 2012 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/*global jQuery, window, fluid*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */


(function ($) {

    /** A "mixin grade" for use by clients wanting to add the media panel controls
     * to a UIOptions configuration */
    fluid.defaults("fluid.uiOptions.withMediaPanel", {
      // TODO: This part currently not honoured
        uiOptionsTransform: {
            config: {
                "*.uiOptionsLoader.*.uiOptions.*.mediaControls": "mediaControls",
            }
        },
        components: {
            templateLoader: {
                options: {
                    templates: {
                        mediaControls: "%prefix/UIOptionsTemplate-media.html"
                    }
                }
            },
            // The Pointy Birds (Oh, Pointy, Pointy!)
            // Anoint my Head (Anointy-nointy!)
            uiOptionsLoader: {
                options: {
                    components: {
                        uiOptions: {
                            options: {
                                components: {
                                    mediaControls: {
                                        type: "fluid.uiOptions.mediaControls",
                                        container: "{uiOptions}.dom.mediaControls",
                                        createOnEvent: "onUIOptionsMarkupReady",
                                        options: {
                                            model: "{uiOptions}.model",
                                            applier: "{uiOptions}.applier",
                                            rendererOptions: "{uiOptions}.options.rendererOptions",
                                            events: {
                                                onUIOptionsRefresh: "{uiOptions}.events.onUIOptionsRefresh"
                                            }
                                        }
                                    }
                                },
                                selectors: {
                                    mediaControls: ".flc-uiOptions-media-controls", 
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    
    fluid.defaults("fluid.uiOptions.fatPanel.withMediaPanel", {
        gradeNames: ["fluid.uiOptions.fatPanel", "fluid.uiOptions.withMediaPanel"]
    });
    
    fluid.uiOptions.inline.makeCreator("fluid.uiOptions.fatPanel.withMediaPanel", fluid.uiOptions.fatPanel.optionsProcessor);

    /**********************************************
     * UI Options Media Controls Panel Components *
     **********************************************/
    /**
     * A sub-component of fluid.uiOptions that renders the "media" panel of the user preferences interface.
     */
    fluid.defaults("fluid.uiOptions.mediaControls", {
        gradeNames: ["fluid.uiOptions.ant", "autoInit"], 
        strings: {
            language: ["English", "French"]
        },
        controlValues: {
            language: ["en", "fr"] 
        },
        volume: {
            min: 0,
            max: 100,
            sliderOptions: {
                orientation: "horizontal",
                step: 10
            }
        },
        selectors: {
            volume: ".flc-uiOptions-volume",
            captions: ".flc-uiOptions-captions",
            transcripts: ".flc-uiOptions-transcripts",
            language: ".flc-uiOptions-language"
        },
        defaultModel: {
            captions: false,             // boolean
            transcripts: false,          // boolean
            language: "en",               // ISO 639-1 language code
            volume: 50                    // number between 0 and 100
        },
        produceTree: "fluid.uiOptions.mediaControls.produceTree",
        resources: {
            template: "{templateLoader}.resources.mediaControls"
        }
    });

    fluid.uiOptions.mediaControls.produceTree = function (that) {
        var tree = {};
        for (var item in that.model.selections) {
            if (item === "captions" || item === "transcripts") {
                tree[item] = "${selections." + item + "}";
            } 
            else if (item === "language") {
                tree[item] = {
                    optionnames: "${labelMap." + item + ".names}",
                    optionlist: "${labelMap." + item + ".values}",
                    selection: "${selections.language}",
                }
            } 
            else if (item === "volume") {
                tree[item] = fluid.uiOptions.createSliderNode(that, item, "fluid.textfieldSlider.slider");
            }
        }

        return tree;
    };


    
    
    fluid.videoPlayer.transformVolumeChange = fluid.scaleLens({scaleFactor: 0.01});
    
    // Returns the index of a track record whose language matches the supplied - suitable for use with fluid.find
    fluid.videoPlayer.matchLanguageRecord = function (language) {
        return function(record, index) {
            return record.srclang === language? index : undefined;
        };
    };
    
    // Transforms a language change request as output from UIOptions into a changeApplier stream
    // capable of modifying the target videoPlayer model to match it
    fluid.videoPlayer.transformLanguageChange = function (value, valuePath, videoPlayer) {
        var ml = fluid.videoPlayer.matchLanguageRecord(value);
        var togo = [];
        function pushRecord(sourcePath, targetPath) {
            var index = fluid.find(fluid.get(videoPlayer, sourcePath), ml);
            if (index !== undefined) {
                togo.push({
                    type: "ADD",
                    path: targetPath,
                    value: [index]
                });
            }
        }
        pushRecord("options.video.captions",    "currentTracks.captions");
        pushRecord("options.video.transcripts", "currentTracks.transcripts");
        return togo;
    }; 
    
    // A "relay component" suitable to appear as a subcomponent of uiOptions in order to 
    // perform relay from its model changes to any number of target videoPlayer components
    // currently, the targets should be added procedurally using the "addTarget" member
    fluid.defaults("fluid.videoPlayer.relay", { 
        gradeNames: ["fluid.modelRelay", "autoInit"],
        // unpleasant lack of encapsulation caused by requirement for immediate access to applier
        // (fetch is called in finalInit function) TODO: make a proper API for this, although
        // better to implement "model events system"
        // Must use "short nickname" here because of FLUID-4636/FLUID-4392
        sourceApplier: "{fatPanel}.applier",
        events: {
            // This is rather late - the settings store actually executes on "onUIOptionsComponentReady" but
            // this is an implementation detail that the relayer may as well not be aware of
            bindingTrigger: "{fatPanel}.events.onReady"
        },
        rules: {
            "selections.captions": "displayCaptions",
            "selections.transcripts": "displayTranscripts",
            "selections.volume": "volume",
            "selections.language": {func: "fluid.videoPlayer.transformLanguageChange"}
        }
    });
    
    fluid.videoPlayer.defaultModel = {
        model: {
            currentTracks: {
                captions: [0],
                transcripts: [0]
            }
        }
    };
    
    fluid.videoPlayer.makeEnhancedInstances = function (instances, relay, callback) {
        callback = callback || fluid.identity;
        instances = fluid.makeArray(instances);
        
        var listener = function () {
            var players = fluid.transform(instances, function (instance) {
                var mergedOptions = $.extend(true, {}, fluid.videoPlayer.defaultModel, {model: relay.model}, instance.options);
                var player = fluid.videoPlayer(instance.container, mergedOptions);
                relay.addTarget(player);
                return player;
            });
            callback(players);
        };
        var lateListener = function () {
            // fluid.log("Listener for " + instances.length);
            // awful workaround for FLUID-4192, "broken trees"
            setTimeout(listener, 1);
        };
        
        if (relay.events.bindingTrigger && !relay.options.bindingTriggered) {
            // fluid.log("Late binding instances " + instances.length);
            relay.events.bindingTrigger.addListener(lateListener);
        }
        else {
            // fluid.log("Immediate binding instances " + instances.length);
            lateListener();
        }
    };

})(jQuery);
