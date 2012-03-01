/*

Copyright 2012 OCAD University

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
        fluid.pageEnhancer({
            tocTemplate: "../lib/infusion/components/tableOfContents/html/TableOfContents.html"
        });

        var uiOptions = fluid.uiOptions.fatPanel(".flc-uiOptions", {
            prefix: "../lib/infusion/components/uiOptions/html/",
            components: {
                relay: {
                    type: "fluid.videoPlayer.relay"
                }
            }
        });
        
        var videoPlayerInstances = [ {
            container: ".mammals-video", 
            options: {
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
                            type: "youtube"
                        }
                    ],
                    captions: [
                        {
                            src: "videos/Mammals/Mammals.en.vtt",
                            type: "text/vtt",
                            srclang: "en",
                            label: "English Subtitles"
                        }, 
                        {
                            src: "videos/Mammals/Mammals.fr.vtt",
                            type: "text/vtt",
                            srclang: "fr",
                            label: "French Subtitles"
                        }
                    ],
                    transcripts: [
                        {
                            src: "videos/Mammals/Mammals.transcripts.en.json",
                            type: "JSONcc",
                            srclang: "en",
                            label: "English Transcripts"
                        }, 
                        {
                            src: "videos/Mammals/Mammals.transcripts.fr.json",
                            type: "JSONcc",
                            srclang: "fr",
                            label: "French Transcripts"
                        }
                    ]
                }
            }
        }, {
            container: ".polar-mammals-video", 
            options: {
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
                            type: "youtube"
                        }
                    ],
                    captions: [
                        {
                            src: "videos/PolarMammals/PolarMammals.en.vtt",
                            type: "text/vtt",
                            srclang: "en",
                            label: "English Subtitles"
                        }, 
                        {
                            src: "videos/PolarMammals/PolarMammals.fr.vtt",
                            type: "text/vtt",
                            srclang: "fr",
                            label: "French Subtitles"
                        }
                    ],
                    transcripts: [
                        {
                            src: "videos/PolarMammals/PolarMammals.transcripts.en.json",
                            type: "JSONcc",
                            srclang: "en",
                            label: "English Transcripts"
                        }, 
                        {
                            src: "videos/PolarMammals/PolarMammals.transcripts.fr.json",
                            type: "JSONcc",
                            srclang: "fr",
                            label: "French Transcripts"
                        }
                    ]
                }
            }
        }, {
            container: ".polar-adapt-video", 
            options: {
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
                            type: "youtube"
                        }
                    ],
                    captions: [
                        {
                            src: "videos/PolarMammalAdaptations/PolarMammalAdaptations.en.vtt",
                            type: "text/vtt",
                            srclang: "en",
                            label: "English Subtitles"
                        }, 
                        {
                            src: "videos/PolarMammalAdaptations/PolarMammalAdaptations.fr.vtt",
                            type: "text/vtt",
                            srclang: "fr",
                            label: "French Subtitles"
                        }
                    ],
                    transcripts: [
                        {
                            src: "videos/PolarMammalAdaptations/PolarMammalAdaptations.transcripts.en.json",
                            type: "JSONcc",
                            srclang: "en",
                            label: "English Transcripts"
                        }, 
                        {
                            src: "videos/PolarMammalAdaptations/PolarMammalAdaptations.transcripts.fr.json",
                            type: "JSONcc",
                            srclang: "fr",
                            label: "French Transcripts"
                        }
                    ]
                }
            }
        }
    ];
    
    fluid.videoPlayer.makeEnhancedInstances(videoPlayerInstances, uiOptions.relay);
    });
    
})(jQuery);
