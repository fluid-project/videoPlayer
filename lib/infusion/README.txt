MyInfusion was built from Infusion master branch https://github.com/fluid-project/infusion/, commit=73889463d799973a3a858c921d7bd2f9361c5906 using the following command:

Build the minified Infusion:
ant customBuild -Dinclude="enhancement, preferences, progress, tooltip, jQueryScrollToPlugin" -lib lib/rhino

Build the un-minified Infusion:
ant customBuild -Dinclude="enhancement, preferences, progress, tooltip, jQueryScrollToPlugin" -lib lib/rhino -DnoMinify="true"


The following directories were stripped out of the build since they contain code that is included in the MyInfusion.js file:

	lib/infusion/components/progress/
    lib/infusion/components/slidingPanel/
    lib/infusion/components/tableOfContents/js/
    lib/infusion/components/textfieldSlider/
    lib/infusion/components/tooltip/
    lib/infusion/framework/core/
    lib/infusion/framework/enhancement/
    lib/infusion/framework/preferences/js/
    lib/infusion/framework/renderer/
    lib/infusion/lib/fastXmlPull/
    lib/infusion/lib/jquery/core/
    lib/infusion/lib/jquery/plugins/scrollTo/
    lib/infusion/lib/jquery/plugins/tooltip/js/
    lib/infusion/lib/jquery/plugins/touchPunch/
    lib/infusion/lib/jquery/ui/js/
    lib/infusion/lib/json/

Customizations of Preference Framework
============================

The following edits have been made to the preference framework HTML files:

lib/infusion/framework/preferneces/html/SeparatedPanelPrefsEditorFrame.html:

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
