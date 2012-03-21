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
    sourceApplier: "{fluid.uiOptions.fatPanel}.applier",
    events: {
        // This is rather late - the settings store actually executes on "onUIOptionsComponentReady" but
        // this is an implementation detail that the relayer may as well not be aware of
        bindingTrigger: "{fluid.uiOptions.fatPanel}.events.onReady"
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

fluid.videoPlayer.makeEnhancedInstances = function(instances, relay, callback) {
    callback = callback || fluid.identity;
    instances = fluid.makeArray(instances);
    
    var listener = function() {
        var players = fluid.transform(instances, function(instance) {
            var mergedOptions = $.extend(true, {}, fluid.videoPlayer.defaultModel, {model: relay.model}, instance.options);
            var player = fluid.videoPlayer(instance.container, mergedOptions);
            relay.addTarget(player);
            return player;
        });
        callback(players);
    };
    var lateListener = function() {
        // awful workaround for FLUID-4192, "broken trees"
        setTimeout(listener, 1);
    }
    
    if (!relay.events.bindingTrigger) {
        relay.events.bindingTrigger.addListener(lateListener);
    }
    else {
        lateListener();
    }
};

})(jQuery);
