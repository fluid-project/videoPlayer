/*
Copyright 2012 OCAD University

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
    $(document).ready(function () {

        jqUnit.module("Video Player Transcript Tests");
    
        // The transcript files sit in the local disk
        var baseOptions = {
                model: {
                    currentTracks: {
                        transcripts: [0]
                    }
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
            jqUnit.assertEquals("The language combo box has expected number of options", that.options.model.transcripts.length, $(".flc-videoPlayer-transcripts-language-dropdown option").length);
            jqUnit.assertTrue("The default selected language is the first option", $(".flc-videoPlayer-transcripts-language-dropdown option")[0].selected);
        };
        
        fluid.videoPlayer.switchTranscript = function (that) {
            // Switch the current transcript selection to trigger onTranscriptsLoaded event that fires the listener fluid.videoPlayer.testTranscriptLoaded
            // to re-load the transcript in another language
            that.applier.requestChange("currentTracks.transcripts.0", 1);
        };
        
        var initialTranscriptText;
        
        fluid.videoPlayer.testTranscriptLoaded = function (intervalList, id, that) {
            jqUnit.assertNotNull("The transcript text is filled in", $(".flc-videoPlayer-transcript-text").text());
            jqUnit.assertTrue("Each transcript element is wrapped in a properly-named span", 
                    ($(".flc-videoPlayer-transcript-text").find('[id|="' + that.options.transcriptElementIdPrefix + '"]').length > 0));
            
            // make sure the transcript text is switched when another option is selected from the language combo box
            // Depending on the connection with universal subtitle site, the test below may not get run with remote universal subtitle transcript files.
            if (!initialTranscriptText) {
                initialTranscriptText = $(".flc-videoPlayer-transcript-text").text();
                jqUnit.start();
            } else {
                jqUnit.assertNotEquals("The transcript text is switched", $(".flc-videoPlayer-transcript-text").text(), initialTranscriptText);
            }
        };
        
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
    
            jqUnit.asyncTest(purpose + " - load and switch transcript", function () {
                var testOpts = {
                        listeners: {
                            onReady: fluid.videoPlayer.switchTranscript,
                            onTranscriptsLoaded: fluid.videoPlayer.testTranscriptLoaded
                        }
                    };
                
                var that = initTranscript(transcriptOps, testOpts);
            });
        };

        var localTranscriptOpts = {
            model: {
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
            }
        };

        // Load transcript files from universal subtitles
        var universalSubsOpts = {
            model: {
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
            }
        };
        
        testProcess(localTranscriptOpts, "Local transcript files");
        
        // Wait a second for the previous test process to complete
        // TODO: It should be changed to use promises instead
        setTimeout(function () {
            testProcess(universalSubsOpts, "Universal Subtitle transcript files");
        }, 1000);

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
            var that = initTranscript(localTranscriptOpts, testOpts);
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
            var that = initTranscript(localTranscriptOpts, testOpts);
        });
    });
})(jQuery);
