all: conkeror firefox

BUILD_VERSION=0
BUILD_PATCH=6
BUILD_SUB=1

VERSION = "$(BUILD_VERSION).$(BUILD_PATCH).$(BUILD_SUB)"


NAME="RndPhrase"
DESC="Auto-generated secure passwords."
CREATOR="Johan Brinch"
HOMEPAGE="http://github.com/brinchj/RndPhrase"


CPP=gcc -c -P -E -xc -I. \
	-D'NAME=${NAME}' -D'DESC=${DESC}' -D'CREATOR=${CREATOR}' \
	-D'HOMEPAGE=${HOMEPAGE}' -D'VERSION=${VERSION}'
LIB=Makefile lib/cubehash.js lib/rndphrase.js


conkeror_js.js: ${LIB} conkeror/page-modes/rndphrase.js
	${CPP} conkeror/page-modes/rndphrase.js -o conkeror_js.js

conkeror: conkeror_js.js
	mkdir -p build/conkeror/page-modes && \
  mv conkeror_js.js build/conkeror/page-modes/rndphrase.js && \
	echo ">> Conkeror page-mode: build/conkeror/page-modes/rndphrase.js"


firefox_meta: ${LIB} firefox/install.rdf
	${CPP} firefox/install.rdf -o firefox_meta

firefox_js.js: ${LIB} firefox/chrome/content/rndphrase/rndphrase.xul
	${CPP} firefox/chrome/content/rndphrase/rndphrase.xul -o firefox_js.js

firefox: firefox_meta firefox_js.js
	mkdir -p build/firefox/_src && \
	cp -r firefox/* build/firefox/_src && \
	mv firefox_meta build/firefox/_src/ && \
	mv firefox_js.js build/firefox/_src/chrome/content/rndphrase/rndphrase.xul && \
	cd build/firefox/_src && \
	./pack.sh && \
	mv rndphrase.xpi ../ && \
	cd .. && rm -rf _src && \
	echo ">> Firefox addon: build/firefox/rndphrase.xpi"


chrome_meta: ${LIB} chrome/manifest.json
	${CPP} chrome/manifest.json -o chrome_meta

chrome_js.js: ${LIB} chrome/overlay.js
	${CPP} chrome/overlay.js -o chrome_js.js

chrome: chrome_meta chrome_js.js
	mkdir -p build/chrome/_src && \
	cp -r chrome/* build/chrome/_src && \
	mv chrome_meta build/chrome/_src/manifest.json && \
	mv chrome_js.js build/chrome/_src/overlay.js && \
	echo ">> Chrome addon: build/chrome/rndphrase.crm"