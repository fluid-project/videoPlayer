MyInfusion was built from an unreleased version of Infusion (24356162b4ed56891af361b682c211f3fed67e39) using the following command:

Build the minified Infusion:
ant customBuild -Dinclude="uiOptions, uploader, tooltip" -lib lib/rhino

Build the un-minified Infusion:
ant customBuild -Dinclude="uiOptions, uploader, tooltip" -lib lib/rhino -DnoMinify="true"
