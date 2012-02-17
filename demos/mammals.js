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

        fluid.uiOptions.fatPanel(".flc-uiOptions", {
            prefix: "../lib/infusion/components/uiOptions/html/"
        });

        fluid.videoPlayer(".mammals-video", {
            model: {
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
                    ]
                },
                captions: {
                    sources: {
                        english: {
                            src: "videos/Mammals/Mammals.en.json",
                            type: "JSONcc"
                        }, 
                        francaise: {
                            src: "videos/Mammals/Mammals.fr.json",
                            type: "JSONcc"
                        }
                    },
                    selection: "english"
                }
            }
        });

        // TODO: There is repetition here when creating the video players - can it be refactored?  
        fluid.videoPlayer(".polar-mammals-video", {
            model: {
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
                    ]
                },
                captions: {
                    sources: {
                        english: {
                            src: "videos/PolarMammals/PolarMammals.en.json",
                            type: "JSONcc"
                        }, 
                        francaise: {
                            src: "videos/PolarMammals/PolarMammals.fr.json",
                            type: "JSONcc"
                        }
                    },
                    selection: "english"
                }
            }
        });

        fluid.videoPlayer(".polar-adapt-video", {
            model: {
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
                    ]
                },
                captions: {
                    sources: {
                        english: {
                            src: "videos/PolarMammalAdaptations/PolarMammalAdaptations.en.json",
                            type: "JSONcc"
                        }, 
                        francaise: {
                            src: "videos/PolarMammalAdaptations/PolarMammalAdaptations.fr.json",
                            type: "JSONcc"
                        }
                    },
                    selection: "english"
                }
            }
        });
    });
    
})(jQuery);
