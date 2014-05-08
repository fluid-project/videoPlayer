/*

Copyright 2012-2013 OCAD University

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
    $(document).ready(function () {
        fluid.globalSettingsStore();
        fluid.pageEnhancer({
            uiEnhancer: {
                gradeNames: ["fluid.uiEnhancer.starterEnactors", "fluid.videoPlayer.vpRelay"],
                tocTemplate: "../lib/infusion/components/tableOfContents/html/TableOfContents.html",
                classnameMap: {
                    theme: {
                        "default": "fl-videoPlayer-theme"
                    }
                }
            }
        });

        var prefsEditor = fluid.prefs.separatedPanel(".flc-prefsEditor", {
            gradeNames: ["fluid.prefs.transformDefaultPanelsOptions"],
            templatePrefix: "../lib/infusion/framework/preferences/html/",
            messagePrefix: "../lib/infusion/framework/preferences/messages/",
            templateLoader: {
                gradeNames: ["fluid.videoPlayer.mediaPanelTemplateLoader", "fluid.prefs.starterTemplateLoader"]
            },
            messageLoader: {
                gradeNames: ["fluid.videoPlayer.mediaPanelMessageLoader", "fluid.prefs.starterMessageLoader"]
            },
            prefsEditor: {
                gradeNames: ["fluid.videoPlayer.mediaPanels", "fluid.prefs.starterPanels", "fluid.prefs.rootModel.starter", "fluid.prefs.uiEnhancerRelay"],
                members: {
                    rootModel: {
                        captions: false,
                        captionLanguage: "en",
                        transcripts: false,
                        transcriptLanguage: "en"
                    }
                }
            },
            slidingPanel: {
                strings: {
                    showText: "+ Show Learner Options"
                }
            }
        });

        var earlyVideoPlayerInstances = [ {
            container: ".mammals-video",
            options: {
                gradeNames: ["fluid.videoPlayer.enhancerBinder"],
                videoTitle: "Mammals",
                video: {
                    sources: [
                        {
                            src: "videos/Mammals/Mammals.mp4",
                            type: "video/mp4"
                        },
                        {
                            src: "videos/Mammals/Mammals.webm",
                            type: "video/webm"
                        },
                        {
                            src: "http://www.youtube.com/v/0jw74pfWfxA",
                            type: "video/youtube"
                        }
                    ],
                    captions: [
                        {
                            src: "videos/Mammals/Mammals.en.vtt",
                            type: "text/vtt",
                            srclang: "en",
                            label: "English"
                        },
                        {
                            src: "videos/Mammals/Mammals.fr.vtt",
                            type: "text/vtt",
                            srclang: "fr",
                            label: "French"
                        }
                    ],
                    transcripts: [
                        {
                            src: "videos/Mammals/Mammals.transcripts.en.json",
                            type: "JSONcc",
                            srclang: "en",
                            label: "English"
                        },
                        {
                            src: "videos/Mammals/Mammals.transcripts.fr.json",
                            type: "JSONcc",
                            srclang: "fr",
                            label: "French"
                        }
                    ]
                }
            }
        }, {
            container: ".polar-mammals-video",
            options: {
                gradeNames: ["fluid.videoPlayer.enhancerBinder"],
                videoTitle: "Polar Mammals",
                video: {
                    sources: [
                        {
                            src: "videos/PolarMammals/PolarMammals.mp4",
                            type: "video/mp4"
                        },
                        {
                            src: "videos/PolarMammals/PolarMammals.webm",
                            type: "video/webm"
                        },
                        {
                            src: "http://www.youtube.com/v/h_oHNP50FGM",
                            type: "video/youtube"
                        }
                    ],
                    captions: [
                        {
                            src: "videos/PolarMammals/PolarMammals.en.vtt",
                            type: "text/vtt",
                            srclang: "en",
                            label: "English"
                        },
                        {
                            src: "videos/PolarMammals/PolarMammals.fr.vtt",
                            type: "text/vtt",
                            srclang: "fr",
                            label: "French"
                        }
                    ],
                    transcripts: [
                        {
                            src: "videos/PolarMammals/PolarMammals.transcripts.en.json",
                            type: "JSONcc",
                            srclang: "en",
                            label: "English"
                        },
                        {
                            src: "videos/PolarMammals/PolarMammals.transcripts.fr.json",
                            type: "JSONcc",
                            srclang: "fr",
                            label: "French"
                        }
                    ]
                }
            }
        }];

        var lateVideoPlayerInstances = [{
            container: ".polar-adapt-video",
            options: {
                gradeNames: ["fluid.videoPlayer.enhancerBinder"],
                videoTitle: "Polar Mammal Adaptation",
                video: {
                    sources: [
                        {
                            src: "videos/PolarMammalAdaptations/PolarMammalAdaptations.mp4",
                            type: "video/mp4"
                        },
                        {
                            src: "videos/PolarMammalAdaptations/PolarMammalAdaptations.webm",
                            type: "video/webm"
                        },
                        {
                            src: "http://www.youtube.com/v/3_3p2ylZDAE",
                            type: "video/youtube"
                        }
                    ],
                    captions: [
                        {
                            src: "videos/PolarMammalAdaptations/PolarMammalAdaptations.en.vtt",
                            type: "text/vtt",
                            srclang: "en",
                            label: "English"
                        },
                        {
                            src: "videos/PolarMammalAdaptations/PolarMammalAdaptations.fr.vtt",
                            type: "text/vtt",
                            srclang: "fr",
                            label: "French"
                        }
                    ],
                    transcripts: [
                        {
                            src: "videos/PolarMammalAdaptations/PolarMammalAdaptations.transcripts.en.json",
                            type: "JSONcc",
                            srclang: "en",
                            label: "English"
                        },
                        {
                            src: "videos/PolarMammalAdaptations/PolarMammalAdaptations.transcripts.fr.json",
                            type: "JSONcc",
                            srclang: "fr",
                            label: "French"
                        }
                    ]
                }
            }
        }];

        // TODO: This still needs cleaning up
        fluid.transform(earlyVideoPlayerInstances, function (instance) {
            fluid.invoke("fluid.videoPlayer", [instance.container, instance.options]);
        });

        // Initialise one video player extremely late to show that this method still works
        fluid.invoke("fluid.videoPlayer", [lateVideoPlayerInstances[0].container, lateVideoPlayerInstances[0].options]);
    });

})(jQuery);
