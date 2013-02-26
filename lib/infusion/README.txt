MyInfusion was built from an unreleased version of Infusion master branch (585ae84e652099a9f944d0bd8dd3fe342bff411e) using the following command:

Build the minified Infusion:
ant customBuild -Dinclude="enhancement, uiOptions, progress, tooltip, jQueryScrollToPlugin" -lib lib/rhino

Build the un-minified Infusion:
ant customBuild -Dinclude="enhancement, uiOptions, progress, tooltip, jQueryScrollToPlugin" -lib lib/rhino -DnoMinify="true"



Customizations of UI Options
============================

The following edits have been made to the UI Options HTML files:

FatPanelUIOptions.html:
9a10
>             <li><a href="#tab4" class="fl-tab-media">Audio + Video</a></li>
14c15,16
<         <div id="tab3" class="flc-uiOptions-links-controls fl-uiOptions-links"></div>
---
>         <div id="tab3" class="flc-uiOptions-links-controls fl-uiOptions-links"></div>
>         <div id="tab4" class="flc-uiOptions-media-controls fl-uiOptions-media"></div>

FatPanelUIOptionsFrame.html:
24a25,26
>         <!-- Note that this line differs from the framework version -->
>         <link rel="stylesheet" type="text/css" href="../../../../../css/UIOptions-media.css" />
28,35c30
<         <script type="text/javascript" src="../../../lib/jquery/core/js/jquery.js"></script>
<         <script type="text/javascript" src="../../../lib/jquery/ui/js/jquery.ui.core.js"></script>
<         <script type="text/javascript" src="../../../lib/jquery/ui/js/jquery.ui.widget.js"></script>
<         <script type="text/javascript" src="../../../lib/jquery/ui/js/jquery.ui.mouse.js"></script>
<         <script type="text/javascript" src="../../../lib/jquery/ui/js/jquery.ui.slider.js"></script>
<         <script type="text/javascript" src="../../../lib/jquery/ui/js/jquery.ui.tabs.js"></script>
<         <script type="text/javascript" src="../../../lib/jquery/plugins/ariaTabs/js/ui.ariaTabs.js"></script>          
<         <script type="text/javascript" src="../../../lib/json/js/json2.js"></script>
---
>         <script type="text/javascript" src="../../../MyInfusion.js"></script>
