module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        packageName: grunt.option("packageName") || "videoPlayer-all",
        srcConcatenatedPath: "build/<%= packageName %>.js",
        minConcatenatedPath: "build/<%= packageName %>-min.js",
        vpFiles: {
            src: ["ReleaseNotes.txt", "README.txt", "css/**", "demos/**", "html/**", "images/**", "js/**", "lib/**", "tests/**"], dest: "./"},
        clean: {
            build: "build",
            products: "products"
        },
        compress: {
            src: {
                options: {
                    archive: "products/<%= packageName %>-<%= pkg.version %>.zip"
                },
                files: [
                    {src: ["<%= srcConcatenatedPath %>"], dest: "./", expand: true, cwd: "./", flatten: true},
                    "<%= vpFiles %>"
                ]
            },
            min: {
                options: {
                    archive: "products/<%= packageName %>-min-<%= pkg.version %>.zip"
                },
                files: [
                    {src: ["<%= minConcatenatedPath %>"], dest: "./", expand: true, cwd: "./", flatten: true},
                    "<%= vpFiles %>"
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
                    "js/MediaSettings.js",
                    "js/VideoPlayer_media.js",
                    "js/VideoPlayer_transcript.js",
                    "js/VideoPlayer_intervalEventsConductor.js",
                    "js/VideoPlayer_prefsEditor.js"
                ],
                dest: "build/videoPlayer-all.js"
            }
        },
        uglify: {
            options: {
                mangle: false
            },
            my_target: {
                src: ["<%= srcConcatenatedPath %>"],
                dest: "<%= minConcatenatedPath %>"
            }
        },
        modulefiles: {
            main: {
                options: {
                    exclude: grunt.option("exclude") || [],
                    include: grunt.option("include")
                },
                src: ["**/*Dependencies.json"]
            }
        }
    });

    console.log("src path: " + grunt.config.get("srcConcatenatedPath"));

    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-compress");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks('grunt-modulefiles');

    grunt.registerTask("build-src", ["clean", "modulefiles", "concat"]);
    grunt.registerTask("build-min", ["build-src", "uglify"]);
    grunt.registerTask("build", ["build-min", "compress", "clean:build"]);
    grunt.registerTask("default", ["build"]);
};
