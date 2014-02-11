What Is VideoPlayer?
====================

VideoPlayer is an HTML5 video player, built with the Fluid Infusion framework.


Where Can I See a Demo?
=======================

    http://build.fluidproject.org/videoPlayer/demos/Mammals.html


How Do I Build VideoPlayer?
===========================

VideoPlayer can be used as is, by linking in all of the necessary dependencies into the <head>.
However, you may want to minimize on round trips to the server and on file size. With this in mind,
you will likely want to create source and minified versions of the concatenated JavaScript files by using
the grunt build described below. This will only minify and concatenate the js files, the other files will need
to be linked in independently. "lib/html5shiv/js/html5shiv.js" is the only JavaScript file which isn't included.
If you need to support older versions of IE you should include this file with a conditional comment.

        <!--[if lt IE 9]>
            <script type="text/javascript" src="../lib/html5shiv/js/html5shiv.js"></script>
        <![endif]-->

Dependencies:

    node.js (http://nodejs.org)
    grunt-cli (http://gruntjs.com)

Build:

    # only need to run if the grunt-cli has not already been installed
    npm install -g grunt-cli

    # only need to run this the first time, as it will install all necessary dependencies.
    npm install

    # runs the build and creates
    # products/videoPlayer-all-VERSION.zip
    # products/videoPlayer-all-min-VERSION.zip
    grunt

Build Options:

    # a comma separated list of modules to be included in the package
    # Example: grunt --include="core"
    include

    # a comma separated list of modules to be excluded from the package.
    # Example: grunt --exclude="infusion"
    exclude

    # the name of the package, used for both zip and js files. The minified version will have "-min" appeneded to the end.
    # Example: grunt --packageName="customVP"
    packageName

Other build tasks:

    # will remove all build related directories and files
    grunt clean

    # will just build the concatenated source file
    grunt build-src

    # will just build the concatentated files, source and min
    gurnt build-min

Modules:

    # The main video player js files
    core

    # The js files for the Captionator dependency
    captionator

    # The js files for the Infusion dependency
    infusion

    # The js files for jQueryUI Widgets not included in infusion
    jQueryUI

    # the js files for the MediaElement dependency
    mediaelement


Who Makes VideoPlayer, and How Can I Help?
==========================================

The Fluid community is an international group of designers, developers, and testers who focus on a
common mission: improving the user experience and accessibility of the open web.

The best way to join the Fluid Community is to jump in to any of our community activities.
Visit our "Get Involved" page for links to our mailing lists, chat room, wiki, etc.:

    http://fluidproject.org/getinvolved/