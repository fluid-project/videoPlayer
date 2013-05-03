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
        },
        uglify: {
            options: {
                mangle: false
            },
            my_target: {
                files: {
                    "build/videoPlayer-all-min.js": ["build/videoPlayer-all.js"]
                }
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");

    grunt.registerTask("build-src", ["clean", "concat"]);
    grunt.registerTask("build-min", ["build-src", "uglify"]);
    grunt.registerTask("default", ["build-min"]);
};
