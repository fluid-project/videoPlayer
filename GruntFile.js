module.exports = function (grunt) {

    // paths to concatenated files
    var srcConcatenatedPath = "build/videoPlayer-all.js";
    var minConcatenatedPath = "build/videoPlayer-all-min.js";

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        vpFiles: {src: ["ReleaseNotes.txt", "README.txt", "css/**", "demos/**", "html/**", "images/**", "js/**", "lib/**", "tests/**"], dest: "./"},
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
                    {src: [srcConcatenatedPath], dest: "./", expand: true, cwd: "./", flatten: true},
                    "<%= vpFiles %>"
                ]
            },
            min: {
                options: {
                    archive: "products/videoPlayer-all-min-<%= pkg.version %>.zip"
                },
                files: [
                    {src: [minConcatenatedPath], dest: "./", expand: true, cwd: "./", flatten: true},
                    "<%= vpFiles %>"
                ]
            }
        },
        concat: {
            main: {
                src: "<%= modulefiles.main.output %>",
                dest: srcConcatenatedPath
            }
        },
        uglify: {
            options: {
                mangle: false
            },
            my_target: {
                src: [srcConcatenatedPath],
                dest: minConcatenatedPath
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
