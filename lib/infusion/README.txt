MyInfusion was built from an unreleased version of Infusion (1e7f0d8f071a69ef5d9cd75e18fc0fe3da170622) using the following command:

Build the minified Infusion:
ant customBuild -Dinclude="uiOptions, swfobject"

Build the un-minified Infusion:
ant customBuild -Dinclude="uiOptions, swfobject" -DnoMinify="true"