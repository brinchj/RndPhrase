#!/bin/sh

# CRX addon
mkdir -p src build
cp ../../images/*.png *.html *.js *.json src
${CHROME_BIN} --pack-extension=src --pack-extension-key=unofficial_key.pem
cp src.crx build/rndphrase.crx

# ZIP file
cd src
zip ../build/rndphrase.zip *
cd ..
