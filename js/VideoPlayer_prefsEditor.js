/*
Copyright 2012-2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/*global jQuery, window, fluid_1_5*/

// JSLint options
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_5 = fluid_1_5 || {};

(function ($, fluid) {

    fluid.videoPlayer.transformVolumeChange = fluid.scaleLens({scaleFactor: 0.01});

    // Returns the index of a track record whose language matches the supplied - suitable for use with fluid.find
    fluid.videoPlayer.matchLanguageRecord = function (language) {
        return function (record, index) {
            return record.srclang === language ? index : undefined;
        };
    };

    // Transforms a language change request as output from prefsEditor into a changeApplier stream
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
        if (valuePath === "captionLanguage") {
            pushRecord("options.video.captions",    "currentTracks.captions");
        } else {
            pushRecord("options.video.transcripts", "currentTracks.transcripts");
        }
        return togo;
    };

    // A "relay component" suitable to appear as a subcomponent of prefsEditor in order to
    // perform relay from its model changes to any number of target videoPlayer components
    // currently, the targets should be added procedurally using the "addTarget" member
    fluid.defaults("fluid.videoPlayer.relay", {
        gradeNames: ["fluid.modelRelay", "autoInit"],
        // unpleasant lack of encapsulation caused by requirement for immediate access to applier
        // (fetch is called in finalInit function) TODO: make a proper API for this, although
        // better to implement "model events system"
        // Must use "short nickname" here because of FLUID-4636/FLUID-4392
        sourceApplier: "{uiEnhancer}.applier",
        events: {
            // This is rather late - the settings store actually executes on "onPrefsEditorComponentReady" but
            // this is an implementation detail that the relayer may as well not be aware of
            bindingTrigger: "{uiEnhancer}.events.onCreate"
        },
        rules: {
            "captions": "displayCaptions",
            "transcripts": "displayTranscripts",
            "captionLanguage": {func: "fluid.videoPlayer.transformLanguageChange"},
            "transcriptLanguage": {func: "fluid.videoPlayer.transformLanguageChange"}
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

})(jQuery, fluid_1_5);
