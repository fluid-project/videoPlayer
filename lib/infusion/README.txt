MyInfusion was built from an unreleased version of Infusion master branch (be0b2ff095fa3ea1b1cb4abd3e38e41462d333d1) using the following command:

Build the minified Infusion:
ant customBuild -Dinclude="uiOptions, uploader, tooltip" -lib lib/rhino

Build the un-minified Infusion:
ant customBuild -Dinclude="uiOptions, uploader, tooltip" -lib lib/rhino -DnoMinify="true"
