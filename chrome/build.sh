#!/bin/sh
if (pgrep chrome); then
    echo "!! Google Chrome is currently running.";
    echo "!! Cannot continue.";
    exit 1;
fi

mkdir -p src build
cp *.html *.js *.json src
${CHROME_BIN} --pack-extension=src --pack-extension-key=unofficial_key.pem
cp src.crx build/rndphrase.crx