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


var fluid_1_5 = fluid_1_5 || {};

(function ($, fluid) {

    fluid.isTracing = false;

    // definitions of candidate framework functions developed during VideoPlayer development
    
    
    
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
        gradeNames: ["fluid.eventedComponent", "fluid.modelComponent", "autoInit"],
        postInitFunction: "fluid.modelRelay.postInit",
        targets: {},
        rules: {},
        events: {
            // triggerEvent [optional injected event]
        },
        // TODO: upgrade event framework to support "latched events"
        bindingTriggered: false
        // sourceApplier [required]
    });
    
    fluid.modelRelay.registerTarget = function(that, target) {
        var specListeners = fluid.transform(that.options.rules, function(value, key) {
            var listener = function (newModel, oldModel, changeList) {
                var newValue = fluid.get(newModel, key);
                if (typeof(value) === "string") {
                    target.applier.requestChange(value, newValue);
                } else {
                    var fullargs = [newValue, key, target, changeList]
                    if (value.lens) {
                        var transformed = value.lens.transform.apply(null, [newValue, key]);
                        target.applier.requestChange(value.targetPath, newValue);
                    }
                    else if (target !== that) {
                        var changes = value.func.apply(null, fullargs);
                        fluid.requestChanges(target.applier, changes);
                    }
                    else {
                        // Do not apply irreversible/general operations to the modelRelay's own model
                        // instead, replay the original changes into the "pent model" reach to be
                        // transformed later
                        fluid.requestChanges(that.pentApplier, changeList);
                    }
                }   
            };
            that.options.sourceApplier.modelChanged.addListener(key, listener);
            return value.func? listener: null;
        });
        // Replay any pent-up changes into a new genuine target 
        if (target !== that) {
            fluid.each(that.options.rules, function(value, key) {
                if (value.func) {
                    var newValue = fluid.get(that.pentModel, key);
                    // synthetic change summarising ultimate individual effect of pent change
                    var synthChange = {type: "ADD", path: key, value: newValue};
                    // fluid.log("Replaying pent change ", synthChange, " to target ", target);
                    var changes = value.func(newValue, key, target, [synthChange]);
                    fluid.requestChanges(target.applier, changes);
                }
            });
        }
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
        // This is used for holding pent up changes produced by irreversible transforms - it holds
        // the raw changes which would be destined for the model, ready to be re-transformed
        that.pentModel = {};
        that.pentApplier = fluid.makeChangeApplier(that.pentModel);
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
        if (that.events.bindingTrigger) {
            that.events.bindingTrigger.addListener(function () { // TODO: add this as a framework facility
                that.options.bindingTriggered = true;
            });
        }
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
    

// TODO: move into DataBinding
    fluid.linearRangeGuard = function(min, max) {
        return function (model, changeRequest, applier) {
            var newValue = changeRequest.value;
    
            if (newValue < min) {
                newValue = min;
            } else if (newValue > max) {
                newValue = max;
            }
            changeRequest.value = newValue;
        }
    };


    
    
    // A "mini-grade" to ease the work of dealing with "modelPath" idiom components - this
    // is only desirable until changeApplier relay gets into the core framework
    fluid.defaults("fluid.videoPlayer.indirectReader", {
        gradeNames: ["fluid.modelComponent", "autoInit"],
        preInitFunction: "fluid.videoPlayer.makeIndirectReader"
    });
    
    fluid.videoPlayer.makeIndirectReader = function(that) {
         that.readIndirect = function(pathName) {
             return fluid.get(that.model, fluid.get(that.options, pathName));
         };
         that.writeIndirect = function(pathName, value, source) {
             fluid.fireSourcedChange(that.applier, fluid.get(that.options, pathName), value, source);
         };
    };
    
    
})(jQuery, fluid);
    