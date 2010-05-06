include Makefile.config

CPP=gcc -c -C -P -E -xc -I. \
        -D'QUOTE="' -DNAME=${NAME} -DDESC=${DESC} \
        -DCREATOR=${CREATOR} \
        -DHOMEPAGE=${HOMEPAGE} -DVERSION=${VERSION}
export CPP

LIB=Makefile lib/cubehash.js lib/rndphrase.js
ROOT=$(shell pwd)

all: firefox

clean:
	rm -rf work

${WORK}: $(wildcard lib/*)
	rm -rf ${WORK} && mkdir -p ${WORK}

# Build a work dir
${WORK}/%: %
	mkdir -p $@ && touch $@ && \
	cp -r $< work/ && \
	for fname in $(shell find $< -type f -regex ".*\.\(js\|xul\|rdf\|dtd\|html\|json\)"); do \
		${CPP} "$$fname" -o "work/$$fname" 3>/dev/null 2>/dev/null; \
	done

# Build an addon (using platform specific build.sh)
${BUILD}/%: %
	mkdir -p $@ && touch $@ && \
	cd work/$< && ./build.sh && \
	cp -r build/* ${ROOT}/$@


# Firefox
firefox_addon: $(shell find ${FIREFOX}) ${WORK}/${FIREFOX} ${BUILD}/${FIREFOX}

firefox_install: firefox_plugin
	${FIREFOX_BIN} ${BUILD}/${FIREFOX}/rndphrase.xpi


# Conkeror
conkeror_mode: $(shell find ${CONKEROR}) ${WORK}/${CONKEROR} ${BUILD}/${CONKEROR}


# Chrome
chrome_addon: $(shell find ${CHROME}) ${WORK}/${CHROME} ${BUILD}/${CHROME}
chrome_install: chrome_addon
	${CHROME_BIN} ${BUILD}/${CHROME}/rndphrase.crx