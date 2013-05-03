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
                    "js/VideoPlayer_framework.js",
                    "js/VideoPlayer_showHide.js",
                    "js/VideoPlayer.js",
                    "js/VideoPlayer_html5Captionator.js",
                    "js/VideoPlayer_controllers.js",
                    "js/ToggleButton.js",
                    "js/MenuButton.js",
                    "js/VideoPlayer_media.js",
                    "js/VideoPlayer_trascript.js",
                    "js/VideoPlayer_intervalEventsConductor.js",
                    "js/VideoPlayer_uiOptions.js"
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
