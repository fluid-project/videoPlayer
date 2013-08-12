MyInfusion was built from an unreleased version of Infusion branch https://github.com/jobara/infusion/tree/FLUID-4907, commit=3999bdef2983bda47f0a59026dab4eb7ae16e680 using the following command:

Build the minified Infusion:
ant customBuild -Dinclude="enhancement, uiOptions, progress, tooltip, jQueryScrollToPlugin" -lib lib/rhino

Build the un-minified Infusion:
ant customBuild -Dinclude="enhancement, uiOptions, progress, tooltip, jQueryScrollToPlugin" -lib lib/rhino -DnoMinify="true"



Customizations of UI Options
============================

The following edits have been made to the UI Options HTML files:

FatPanelUIOptionsFrame.html:
32,38c32
<         <script type="text/javascript" src="../../../lib/jquery/core/js/jquery.js"></script>
<         <script type="text/javascript" src="../../../lib/jquery/ui/js/jquery.ui.core.js"></script>
<         <script type="text/javascript" src="../../../lib/jquery/ui/js/jquery.ui.widget.js"></script>
<         <script type="text/javascript" src="../../../lib/jquery/ui/js/jquery.ui.mouse.js"></script>
<         <script type="text/javascript" src="../../../lib/jquery/ui/js/jquery.ui.slider.js"></script>
<         <script type="text/javascript" src="../../../lib/jquery/plugins/touchPunch/js/jquery.ui.touch-punch.js"></script>
<         <script type="text/javascript" src="../../../lib/json/js/json2.js"></script>
---
>          <script type="text/javascript" src="../../../MyInfusion.js"></script>
