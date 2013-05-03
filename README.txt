What Is VideoPlayer?
====================

VideoPlayer is an HTML5 video player, built with the Fluid Infusion framework.


Where Can I See a Demo?
=======================

    http://build.fluidproject.org/videoPlayer/videoPlayer/demos/Mammals.html


How Do I Build VideoPlayer?
===========================

VideoPlayer can be used as is, by linking in all of the necessary dependencies into the <head>. 
However you may want to minimize on round trips to the server and on file size. With this in mind, 
you may want to run the build which will create source and minified versions of the concatenated js files.
Note that this only includes, the js files. The other files will be included in the packages and must be
linked in independently. The ony js file which isn't included is the optional "lib/html5shiv/js/html5shiv.js".
If you need to  support older versions of IE you should inlucde this file with a conditional comment.

        <!--[if lt IE 9]>
            <script type="text/javascript" src="../lib/html5shiv/js/html5shiv.js"></script>
        <![endif]-->

Dependencies:

    node.js (http://nodejs.org)

Build:

    # only need to run this the first time, as it will install all necessary dependencies.
    npm install 

    # runs the build and creates
    # products/videoPlayer-all-VERSION.zip
    # products/videoPlayer-all-min-VERSION.zip
    grunt

Other build tasks:

    # will remove all build related directories and files
    grunt clean

    # will just build the concatenated source file
    grunt build-src

    # will just build the concatentated files, source and min
    gurnt build-min

Who Makes VideoPlayer, and How Can I Help?
==========================================

The Fluid community is an international group of designers, developers, and testers who focus on a 
common mission: improving the user experience and accessibility of the open web.

The best way to join the Fluid Community is to jump in to any of our community activities.
Visit our "Get Involved" page for links to our mailing lists, chat room, wiki, etc.:

    http://fluidproject.org/getinvolved/