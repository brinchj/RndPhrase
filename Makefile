all: conkeror firefox

BUILD_VERSION=0
BUILD_PATCH=6
BUILD_SUB=2

VERSION = "$(BUILD_VERSION).$(BUILD_PATCH).$(BUILD_SUB)"


NAME="RndPhrase"
DESC="Auto-generated secure passwords."
CREATOR="Johan Brinch"
HOMEPAGE="http://github.com/brinchj/RndPhrase"


CONKEROR_BUILD=build/conkeror
FIREFOX_BUILD=build/firefox
CHROME_BUILD=build/chrome

CHROME=google-chrome

CPP=gcc -c -P -E -xc -I. \
	-D'NAME=${NAME}' -D'DESC=${DESC}' -D'CREATOR=${CREATOR}' \
	-D'HOMEPAGE=${HOMEPAGE}' -D'VERSION=${VERSION}'
LIB=Makefile lib/cubehash.js lib/rndphrase.js


conkeror_js.js: ${LIB} conkeror/page-modes/rndphrase.js
	${CPP} conkeror/page-modes/rndphrase.js -o conkeror_js.js

conkeror: conkeror_js.js
	mkdir -p ${CONKEROR_BUILD}/page-modes && \
  mv conkeror_js.js ${CONKEROR_BUILD}/page-modes/rndphrase.js && \
	echo ">> Conkeror page-mode: ${CONKEROR_BUILD}/page-modes/rndphrase.js"


firefox_meta: ${LIB} firefox/install.rdf
	${CPP} firefox/install.rdf -o firefox_meta

firefox_js.js: ${LIB} firefox/chrome/content/rndphrase/rndphrase.xul
	${CPP} firefox/chrome/content/rndphrase/rndphrase.xul -o firefox_js.js

firefox: firefox_meta firefox_js.js
	mkdir -p ${FIREFOX_BUILD}/_src && \
	cp -r firefox/* ${FIREFOX_BUILD}/_src && \
	mv firefox_meta ${FIREFOX_BUILD}/_src/ && \
	mv firefox_js.js ${FIREFOX_BUILD}/_src/chrome/content/rndphrase/rndphrase.xul && \
	cd ${FIREFOX_BUILD}/_src && \
	./pack.sh && \
	mv rndphrase.xpi ../ && \
	cd .. && rm -rf _src && \
	echo ">> Firefox addon: ${FIREFOX_BUILD}/rndphrase.xpi"


chrome_meta: ${LIB} chrome/manifest.json
	${CPP} chrome/manifest.json -o chrome_meta

chrome_js.js: ${LIB} chrome/overlay.js
	${CPP} chrome/overlay.js -o chrome_js.js

chrome: chrome_meta chrome_js.js
	mkdir -p ${CHROME_BUILD}/_src && \
	cp -r chrome/* ${CHROME_BUILD}/_src && \
	mv chrome_meta ${CHROME_BUILD}/_src/manifest.json && \
	mv chrome_js.js ${CHROME_BUILD}/_src/overlay.js && \
  ${CHROME} --pack-extension=${CHROME_BUILD}/_src --pack-extension-key=chrome/unofficial_key.pem && \
  mv ${CHROME_BUILD}/_src.crx ${CHROME_BUILD}/rndphrase.crx && \
  rm -rf ${CHROME_BUILD}/_src && \
	echo ">> Chrome addon: build/chrome/rndphrase.crm"