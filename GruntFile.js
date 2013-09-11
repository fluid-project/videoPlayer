module.exports = function (grunt) {

    // load dependency files
    var dependencyFiles = grunt.file.expand("**/*Dependencies.json");
    var moduleDependencies = {};
    grunt.util._.forEach(dependencyFiles, function (dependencyFile) {
        var dependencyObj = grunt.file.readJSON(dependencyFile);
        grunt.util._.merge(moduleDependencies, dependencyObj);
    });

    // paths to concatenated files
    var srcConcatenatedPath = "build/videoPlayer-all.js";
    var minConcatenatedPath = "build/videoPlayer-all-min.js";

    // command line arguments
    var inclusions = grunt.option("include") || Object.keys(moduleDependencies);
    var exclusions = grunt.option("exclude") || [];

    // helper functions
    var buildFiles = function (concatenatedFilePath) {
        return [
            // expand makes the src relative to cwd path, and flatten collapses the file down to the cwd directory
            {src: [concatenatedFilePath], dest: "./", expand: true, cwd: "./", flatten: true},
            {src: ["ReleaseNotes.txt", "README.txt", "css/**", "demos/**", "html/**", "images/**", "js/**", "lib/**", "tests/**"], dest: "./"}
        ];
    };

    var getModulesImp = function (moduleDependencies, module, exclusions) {
        var dependencies = grunt.util._.difference(module.dependencies, exclusions);
        var paths = [];
        grunt.util._.forEach(dependencies, function (dependency) {
            paths = grunt.util._.union(paths, getModulesImp(moduleDependencies, moduleDependencies[dependency], exclusions));
        });
        paths = grunt.util._.union(paths, module.files);
        return paths;
    };

    var getModules = function (moduleDependencies, inclusions, exclusions) {
        inclusions = grunt.util._.isArray(inclusions) ? inclusions : inclusions.split(",");
        exclusions = grunt.util._.isArray(exclusions) ? exclusions : exclusions.split(",");
        var paths = [];
        var selectedModules = grunt.util._.difference(inclusions, exclusions);
        grunt.util._.forEach(selectedModules, function (module) {
            var modulePaths = getModulesImp(moduleDependencies, moduleDependencies[module], exclusions);
            paths = grunt.util._.union(paths, modulePaths);
        });
        return paths;
    };

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
                files: buildFiles(srcConcatenatedPath)
            },
            min: {
                options: {
                    archive: "products/videoPlayer-all-min-<%= pkg.version %>.zip"
                },
                files: buildFiles(minConcatenatedPath)
            }
        },
        concat: {
            all: {
                src: getModules(moduleDependencies, inclusions, exclusions),
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
