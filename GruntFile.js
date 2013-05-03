module.exports = function (grunt) {
    grunt.initConfig({
        clean: {
            build: "build"
        },
        concat: {
            all: {
                src: [
                    "lib/infusion/MyInfusion.js",
                    "lib/jqeury-ui/js/jquery.ui.button.js",
                    "lib/captionator/js/captionator.js",
                    "lib/mediaelement.js",
                    "videoPlayer/js/VideoPlayer_framework.js",
                    "videoPlayer/js/VideoPlayer_showHide.js",
                    "videoPlayer/js/VideoPlayer.js",
                    "videoPlayer/js/VideoPlayer_html5Captionator.js",
                    "videoPlayer/js/VideoPlayer_controllers.js",
                    "videoPlayer/js/ToggleButton.js",
                    "videoPlayer/js/MenuButton.js",
                    "videoPlayer/js/VideoPlayer_media.js",
                    "videoPlayer/js/VideoPlayer_trascript.js",
                    "videoPlayer/js/VideoPlayer_intervalEventsConductor.js",
                    "videoPlayer/js/VideoPlayer_uiOptions.js"
                ],
                dest: "build/videoPlayer-all.js"
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-concat");

    grunt.registerTask("build", ["clean", "concat"]);
    grunt.registerTask("default", ["build"]);
};
