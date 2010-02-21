#!/usr/bin/env sh

cd chrome
zip -r rndphrase.jar content skin
cd ..
zip rndphrase.xpi chrome/rndphrase.jar install.js install.rdf license.txt
rm -f chrome/rndphrase.jar

