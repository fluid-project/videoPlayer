Release Notes for Fluid Video Player 0.1
=========================================
Main Project Site:  http://fluidproject.org
Documentation:      http://wiki.fluidproject.org/display/fluid/%28Floe%29+video+player


What's New in 0.1?
==================

    * Support for captions
    * Support for transcripts
    * Integration into UI Options
    * keyboard accessibility
    
Downloading Video Player
========================

    zip: https://github.com/fluid-project/videoPlayer/archive/vp-0.1.zip
    tar: https://github.com/fluid-project/videoPlayer/archive/vp-0.1.tar.gz

For development, you can download the Video Player source code from Github:
    
   https://github.com/fluid-project/videoPlayer

Demos
=====

Video Player ships with demos for seeing it in action. You can
find it in the "demos" folder in the release bundle or nightly builds on our web site at:

    http://build.fluidproject.org/videoPlayer/videoPlayer/demos/VideoPlayer.html
    http://build.fluidproject.org/videoPlayer/videoPlayer/demos/Mammals.html

When run from your local machine, the demos must be served through a web server to function properly.

License
=======

Fluid Video Player is licensed under both the ECL 2.0 and new BSD licenses.

More information is available in our wiki:

    http://wiki.fluidproject.org/display/fluid/Fluid+Licensing


Third Party Software in Video Player
====================================

This is a list of publicly available software that is redistributed with Fluid Video Player, 
categorized by license:

MIT License:
    * jQuery UI css v1.8.14 http://ui.jquery.com/
    * html5shiv v3.6.1 http://code.google.com/p/html5shiv/
    * MediaElement.js v2.9.1 http://mediaelementjs.com
  
BSD License:
    * Fluid Infusion 1.5 Snapshot (http://fluidproject.org)
    ** see lib/infusion/README.txt for specific details on the version used

Other licenses:
    * Captionator https://github.com/cgiffard/Captionator

Supported Browsers
==================

The following browsers are fully supported and were actively tested against for Video Player 0.1:

    * Chrome 25
    * Firefox 19
    * Internet Explorer 8, 9
    * Safari 6.0.2
    
For more information on Fluid Video Player browser support, please see:
    http://wiki.fluidproject.org/display/fluid/Video+Player+Browser+Support+Chart

Known Issues
============

The Fluid Project uses a JIRA website to track bugs: http://issues.fluidproject.org
Some of the known issues in this release are described here:

Captions:
    VP-100: Make captions show for YouTube videos
    VP-87:  Captions don't work in IE8
    VP-264: Captions don't show with .mp4 videos
    VP-4:   Safari; Track elements with data sources not working
    
Full Screen:
    VP-258: YouTube videos break in full screen mode
    VP-191: Implement fullscreen functionality for Opera and IE
    VP-279: In IE8, invisible full screen button is tab focusable. Going full screen removes video player from tab order upon returning to normal mode.
    
UIO Integration:
    VP-269: Transcript language is incorrect in the language drop down after specifying a language in UIO
    VP-88:  UIO inputs preferences not being correctly applied on load
    VP-280: Contrast styles don't apply to captions
    VP-107: Changing text size with UIO does not change Video Player size until refresh for Flash videos
    VP-278: In IE8, focus appears on video player container, but activates UIO instead
    
Playback:
    VP-277: Pressing space on the video container does not start the video in IE9 and IE8.
    
Scrubbing:
    VP-284: In IE8, keyboard scrubbing stops working after attempting to scrub
