module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            build: "build",
            products: "products"
        },
        compress: {
            src: {
                options: {
                    archive: "products/videoPlayer-all-<%= pkg.version %>.zip"
                },
                files: [
                    // expand makes the src relative to cwd path, and flatten collapses the file down to the cwd directory
                    {src: ["build/videoPlayer-all.js"], dest: "./", expand: true, cwd: "./", flatten: true},
                    {src: ["./ReleaseNotes.txt"], dest: "./"},
                    {src: ["css/**", "demos/**", "html/**", "images/**", "js/**", "lib/**", "tests/**"], dest: "./"}
                ]
            },
            min: {
                options: {
                    archive: "products/videoPlayer-all-min-<%= pkg.version %>.zip"
                },
                files: [
                    // expand makes the src relative to cwd path, and flatten collapses the file down to the cwd directory
                    {src: ["build/videoPlayer-all-min.js"], dest: "./", expand: true, cwd: "./", flatten: true},
                    {src: ["./ReleaseNotes.txt"], dest: "./"},
                    {src: ["css/**", "demos/**", "html/**", "images/**", "js/**", "lib/**", "tests/**"], dest: "./"}
                ]
            }
        },
        concat: {
            all: {
                src: [
                    "lib/infusion/MyInfusion.js",
                    "lib/jqeury-ui/js/jquery.ui.button.js",
                    "lib/captionator/js/captionator.js",
                    "lib/mediaelement/js/mediaelement.js",
                    "js/VideoPlayer_framework.js",
                    "js/VideoPlayer_showHide.js",
                    "js/VideoPlayer.js",
                    "js/VideoPlayer_html5Captionator.js",
                    "js/VideoPlayer_controllers.js",
                    "js/ToggleButton.js",
                    "js/MenuButton.js",
                    "js/VideoPlayer_media.js",
                    "js/VideoPlayer_transcript.js",
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
    grunt.loadNpmTasks("grunt-contrib-compress");
    grunt.loadNpmTasks("grunt-contrib-uglify");

    grunt.registerTask("build-src", ["clean", "concat"]);
    grunt.registerTask("build-min", ["build-src", "uglify"]);
    grunt.registerTask("build", ["build-min", "compress", "clean:build"]);
    grunt.registerTask("default", ["build"]);
};
