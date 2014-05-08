/*
Copyright 2012-2014 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
 
 */

// Declare dependencies
/*global fluid, jqUnit, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    fluid.registerNamespace("fluid.tests");

    fluid.tests.localTranscriptOpts = {
        transcripts: [
            {
                src: "TestTranscripts.en.json",
                type: "JSONcc",
                srclang: "en",
                label: "English"
            },
            {
                src: "TestTranscripts.fr.json",
                type: "JSONcc",
                srclang: "fr",
                label: "French"
            }
        ]
    };

    fluid.defaults("fluid.tests.transcriptsTests", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            transcripts: {
                type: "fluid.videoPlayer.transcript",
                container: ".flc-videoPlayer-transcriptArea",
                options: {
                    model: {
                        currentTranscriptTracks: [0]
                    },
                    transcripts: fluid.tests.localTranscriptOpts.transcripts
                }
            },
            tester: {
                type: "fluid.tests.transcriptTester"
            }
        }
    });

    fluid.defaults("fluid.tests.transcriptTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "Multiple Transcripts",
            tests: [{
                expect: 4,
                name: "Load and switch transcript",
                sequence: [{
                    event: "{transcripts}.events.onTranscriptsLoaded",
                    listener: "fluid.tests.transcriptsInitialized"
                },{
                    func: "fluid.tests.switchTranscript",
                    args: ["{transcripts}"]
                },{
                    event: "{transcripts}.events.onTranscriptsLoaded",
                    listener: "fluid.tests.transcriptsSwitched"
                }]
            }]
        }]
    });

    fluid.tests.initialTranscriptText = null;

    fluid.tests.transcriptsInitialized = function (intervalList, id, that) {
        jqUnit.assertTrue("The transcript text is filled in", $(".flc-videoPlayer-transcript-text").text().length > 0);
        jqUnit.assertTrue("Each transcript element is wrapped in a properly-named span", 
                ($(".flc-videoPlayer-transcript-text").find('[id|="' + that.options.transcriptElementIdPrefix + '"]').length > 0));

        fluid.tests.initialTranscriptText = $(".flc-videoPlayer-transcript-text").text();
    };

    fluid.tests.switchTranscript = function (that) {
        that.applier.change("currentTranscriptTracks", [1]);
    };

    fluid.tests.transcriptsSwitched = function (intervalList, id, that) {
        jqUnit.assertTrue("The transcript text is filled in", $(".flc-videoPlayer-transcript-text").text().length > 0);
        jqUnit.assertNotEquals("The transcript text is switched", $(".flc-videoPlayer-transcript-text").text(), fluid.tests.initialTranscriptText.substring(0, 100));
    };

    $(document).ready(function () {

        fluid.test.runTests([
            "fluid.tests.transcriptsTests"
        ]);

        jqUnit.module("Video Player Transcript Tests");
    
        // The transcript files sit in the local disk
        var baseOptions = {
                model: {
                    currentTranscriptTracks: [0]
                }
            };
        
        var testConvertToMilli = function (inTime, expected, extraMsg) {
            jqUnit.expect(1);
            var result = fluid.videoPlayer.transcript.convertToMilli(inTime);
            
            jqUnit.assertEquals("The result to convert " + inTime + " to milliseconds is expected" + (extraMsg ? " - " + extraMsg : ""), expected, result);
        };
        
        // Test convertToMilli
        jqUnit.test("Test convertToMilli function", function () {
            // Success cases
            testConvertToMilli("12:01.1", 721001);
            testConvertToMilli("12:01.10", 721010);
            testConvertToMilli("12:01.100", 721100);
            testConvertToMilli("1:12:01.100", 4321100);
            testConvertToMilli("10:12:01.100", 36721100);

            // Failed cases
            testConvertToMilli("12:01", null, "Missing mmm part"); // Missing mmm part
            testConvertToMilli("12:1.100", null, "Only 1 digit at ss part. Must be 2 digits");
            testConvertToMilli("2:01.100", null, "Only 1 digit at mm part. Must be 2 digits");
        });

        var initTranscript = function () {
            var opts = fluid.copy(baseOptions);
            
            // merge all the options
            for (var index in arguments) {
                $.extend(true, opts, arguments[index]);
            }
            
            return fluid.videoPlayer.transcript(".flc-videoPlayer-transcriptArea", opts);
        };
        
        fluid.videoPlayer.testInstantiation = function (that) {
            jqUnit.assertNotNull("Transcript component is instantiated", that);
            jqUnit.notVisible("Transcript area is hidden by default", $(".flc-videoPlayer-transcriptArea"));
            
            // Display transcript area
            that.applier.requestChange("displayTranscripts", true);
            
            jqUnit.isVisible("The transcript area is shown", $(".flc-videoPlayer-transcriptArea"));
            jqUnit.assertEquals("The language combo box has expected number of options", that.options.transcripts.length, $(".flc-videoPlayer-transcripts-language-dropdown option").length);
            jqUnit.assertTrue("The default selected language is the first option", $(".flc-videoPlayer-transcripts-language-dropdown option")[0].selected);
        };
        
        
        var initialTranscriptText;
        
        var testProcess = function (transcriptOps, purpose) {
            // initialize the var that saves the loaded transcript for a fresh start.
            initialTranscriptText = undefined;
            
            jqUnit.asyncTest(purpose + " - instantiation", function () {
                jqUnit.expect(5);
                
                var testOpts = {
                        listeners: {
                            onReady: fluid.videoPlayer.testInstantiation
                        }
                    };
                
                var that = initTranscript(transcriptOps, testOpts);
                
                jqUnit.start();
            });
    
        };

        // Load transcript files from universal subtitles
        var universalSubsOpts = {
                transcripts: [
                    {
                        src: "http://www.youtube.com/watch?v=_VxQEPw1x9E&language=en",
                        type: "text/amarajson",
                        srclang: "en",
                        label: "English"
                    },
                    {
                        src: "http://www.youtube.com/watch?v=_VxQEPw1x9E&language=fr",
                        type: "text/amarajson",
                        srclang: "fr",
                        label: "French"
                    }
                ]
            };
        
        testProcess(fluid.tests.localTranscriptOpts, "Local transcript files");
        
        // Wait a second for the previous test process to complete
        setTimeout(function () {
            testProcess(universalSubsOpts, "Universal Subtitle transcript files");
        }, 1500);

        jqUnit.asyncTest("Drop-down aria-controls text area", function () {
            var testOpts = {
                listeners: {
                    onReady: function (that) {
                        var attr = that.locate("languageDropdown").attr("aria-controls");
                        jqUnit.assertTrue("Drop-down should have aria-controls attribute", !!attr);
                        jqUnit.assertEquals("aria-controls should reference the text area", that.locate("transcriptText").attr("id"), attr);
                        jqUnit.start();
                    }
                }
            };
            var that = initTranscript(fluid.tests.localTranscriptOpts, testOpts);
        });

        jqUnit.asyncTest("transcriptTextId", function () {
            var testOpts = {
                listeners: {
                    onReady: function (that) {
                        jqUnit.assertEquals("should be able to retrieve transcript id", that.locate("transcriptText").attr("id"), that.transcriptTextId());
                        jqUnit.start();
                    }
                }
            };
            var that = initTranscript(fluid.tests.localTranscriptOpts, testOpts);
        });

    });

})(jQuery);
