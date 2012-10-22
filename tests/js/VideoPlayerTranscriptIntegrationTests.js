/*
Copyright 2012 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
 
 */

// Declare dependencies
/*global fluid, jqUnit, jQuery, start*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    $(document).ready(function () {

        var uiOptions = fluid.uiOptions.fatPanel.withMediaPanel(".flc-uiOptions", {
            prefix: "../../lib/infusion/components/uiOptions/html/",
            components: {
                relay: {
                    type: "fluid.videoPlayer.relay"
                }
            },
            templateLoader: {
                options: {
                    templates: {
                        mediaControls: "../../html/UIOptionsTemplate-media.html"
                    }
                }
            }
        });

        var videoPlayerTranscriptIntegrationTests = new jqUnit.TestCase("Video Player Transcript Integration Tests");

        videoPlayerTranscriptIntegrationTests.asyncTest("FLUID-4812: Transcripts showing on UIO reset", function () {
            jqUnit.expect(2);
            var instance = {
                container: ".videoPlayer-transcript",
                options: {
                    templates: {
                        videoPlayer: {
                            href: "../../html/videoPlayer_template.html"
                        }
                    },
                    listeners: {
                        onReady: function (that) {
                            jqUnit.notVisible("Before UIO reset, transcripts are not visible", $(".flc-videoPlayer-transcriptArea"));
                            uiOptions.uiOptionsLoader.uiOptions.events.onUIOptionsRefresh.addListener(function () {
                                jqUnit.notVisible("After UIO reset, transcripts are not visible", $(".flc-videoPlayer-transcriptArea"));
                                start();
                            });
                            uiOptions.uiOptionsLoader.uiOptions.reset();
                        }
                    }
                }
            };
            fluid.testUtils.initEnhancedVideoPlayer(instance, uiOptions.relay);
        });

    });
})(jQuery);
