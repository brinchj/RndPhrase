all: conkeror firefox

CPP=gcc -c -P -E -xc -I.
LIB=lib/cubehash.js lib/rndphrase.js

conkeror: ${LIB} conkeror/page-modes/rndphrase.js
	mkdir -p build/conkeror/page-modes && \
	${CPP} conkeror/page-modes/rndphrase.js -o build/conkeror/page-modes/rndphrase.js && \
	echo ">> Conkeror page-mode: build/conkeror/page-modes/rndphrase.js"


firefox: ${LIB} xpi/chrome/content/rndphrase/rndphrase.xul
	mkdir -p build/firefox/_src && \
	cp -r xpi/* build/firefox/_src && \
	${CPP} xpi/chrome/content/rndphrase/rndphrase.xul -o build/firefox/_src/chrome/content/rndphrase/rndphrase.xul && \
	cd build/firefox/_src && \
	./pack.sh && \
	mv rndphrase.xpi ../ && \
	cd .. && rm -rf _src && \
	echo ">> Firefox addon: build/firefox/rndphrase.xpi"
