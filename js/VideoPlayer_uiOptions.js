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


// The "model relay" system - a framework sketch for a junction between an applier
// bound to one model and another. It accepts (currently) 3 types of handler,
// i) a simple string representing a direct relay between changes to one path and another
// ii) a reference to a "lens" which in addition to the relay between paths, allows the value to be
// (reversibly) transformed as it is relayed
// iii) a general (irreversible) transform of the value change, which may return any number of
// change requests to be applied to the target.
// In addition to acting "live" as a dynamic relay of changes, at any time the relay maintains its own
// model which may be used as a static record of the accumulated effect of the changes to date. This 
// is useful to prevent "jank" through providing this static record to a target component on initialisation
// as part of its options, rather than relaying a stream of events after initialisation.
// All of this machinery relies crucially on the possibility for all interesting changes to be summarised
// as "state".

fluid.defaults("fluid.modelRelay", {
    gradeNames: ["fluid.modelComponent", "autoInit"],
    postInitFunction: "fluid.modelRelay.postInit",
    targets: {},
    rules: {},
    // sourceApplier
});

fluid.modelRelay.registerTarget = function(that, target) {
    fluid.each(that.options.rules, function(value, key) {
        var listener = function (newModel, oldModel, changeList) {
            var newValue = fluid.get(newModel, key);
            if (typeof(value) === "string") {
                 target.applier.requestChange(value, newValue);
            } else {
                var fullargs = [newValue, key, fluid.makeArray(arguments)]
                if (value.lens) {
                    var transformed = value.lens.transform.apply(null, fullargs);
                    target.applier.requestChange(value.targetPath, newValue);
                }
                else {
                    var changes = value.func.apply(null, fullargs);
                    fluid.each(changes, function(change) {
                        target.applier.fireChangeRequest(change);
                    });
                }
            }   
        };
        that.options.sourceApplier.modelChanged.addListener(key, listener); 
    });
};

fluid.modelRelay.processLookup = function(struct, member, relayType, key, expectedType) {
    var func = struct[member];
    if (!func) {
        fluid.fail("Relay rule " + key + " requires a " + relayType + " to be specified");
    }
    if (typeof(func) === "string") {
        var funcval = fluid.getGlobalValue(func);
        if (typeof(funcval) !== expectedType) {
            fluid.fail("Relay func " + func + " could not be looked up to " + expectedType + " function for rule " + key); 
        }
        struct[member] = funcval;
    }
};

fluid.modelRelay.postInit = function(that) {
    that.targets = {};
    that.addTarget = function(target) {
        fluid.modelRelay.registerTarget(that, target);
        that.targets[target.id] = target;
    };
    fluid.each(that.options.rules, function(value, key) {
        if (typeof(value) !== "string") {
            if (value.targetPath) {
                // replace this crude system with IoC later
                fluid.modelRelay.processLookup(value, "lens", "lens", key, "object");
            }
            else {
                fluid.modelRelay.processLookup(value, "func", "relay func", key, "function");
            }
        }
    });
    fluid.each(that.options.targets, function(target) {
        fluid.modelRelay.registerTarget(that, target);
    });
    fluid.modelRelay.registerTarget(that, that);
};

fluid.defaults("fluid.lens", {
    gradeNames: ["fluid.littleComponent"]
});

fluid.defaults("fluid.scaleLens", {
    gradeNames: ["fluid.lens", "autoInit"],
    scaleFactor: 1.0,
    postInitFunction: "fluid.scaleLens.postInit"
});

fluid.scaleLens.postInit = function(that) {
    that.transform = function(value) {
        return value * that.options.scaleFactor; 
    };
    that.reverseTransform = function(value) {
        return value / that.options.scaleFactor;
    };
};

// End of sketch framework - beginning of videoPlayer/uiOptions specific material

fluid.videoPlayer.transformVolumeChange = fluid.scaleLens({scaleFactor: 0.01});

// Returns the index of a track record whose language matches the supplied - suitable for use with fluid.find
fluid.videoPlayer.matchLanguageRecord = function (language) {
    return function(record, index) {
        return record.srclang === language? index : undefined;
    };
};

// Transforms a language change request as output from UIOptions into a changeApplier stream
// capable of modifying the target videoPlayer model to match it
fluid.videoPlayer.transformLanguageChange = function (value, videoPlayer) {
    var ml = fluid.videoPlayer.matchLanguageRecord(value);
    var togo = [];
    function pushRecord(path) {
        var index = fluid.find(videoPlayer[path], ml);
        if (index !== undefined) {
            togo.push({
                type: "ADD",
                path: "currentTracks."+path,
                value: index
            });
        }
    }
    pushRecord("captions");
    pushRecord("transcripts");
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
    rules: {
        "selections.captions": "displayCaptions",
        "selections.transcripts": "displayTranscripts",
        "selections.volume": {targetPath: "volume",
                 lens: "fluid.videoPlayer.transformVolumeChange"},
        "selections.language": {func: "fluid.videoPlayer.transformLanguageChange"}
    }
});

fluid.videoPlayer.makeEnhancedInstances = function(instances, relay) {
    return fluid.transform(instances, function(instance) {
        var mergedOptions = $.extend(true, {}, {model: fluid.copy(relay.model)}, instance.options);
        var player = fluid.videoPlayer(instance.container, mergedOptions);
        relay.addTarget(player);
        return player;
    }); 
};

})(jQuery);
