MyInfusion was built from an unreleased version of Infusion (1e7f0d8f071a69ef5d9cd75e18fc0fe3da170622) using the following command:

Build the minified MyInfusion.js:
ant customBuild -Dinclude="renderer, uploader, tooltip, jQueryUIWidgets" -lib lib/rhino

Build the un-minified MyInfusion.js:
ant customBuild -Dinclude="renderer, uploader, tooltip, jQueryUIWidgets" -lib lib/rhino -DnoMinify="true"
