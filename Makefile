include Makefile.config

CPP=gcc -c -C -P -E -xc -I. \
        -D"Q0(w)=\# w" -D"Q(w)=Q0(w)" \
	    	-DNAME=${NAME} -DDESC=${DESC} \
        -DCREATOR=${CREATOR} \
        -DHOMEPAGE=${HOMEPAGE} -DVERSION=${VERSION}
export CPP

LIB=Makefile lib/cubehash.js lib/rndphrase.js
ROOT=$(shell pwd)

.PHONY: data/suffix-list.js clean all firefox_addon firefox_install \
	conkeror_mode js_ext \
	chrome_addon chrome_install www_html

all: firefox_addon chrome_addon conkeror_mode www_html js_ext

clean:
	rm -rf work build

data/suffix-list.js:
	@./scripts/update-suffixlist.py || true

${WORK}: $(wildcard lib/*)
	@rm -rf ${WORK} && mkdir -p ${WORK}

# Build a work dir
${WORK}/%: % data/suffix-list.js ${WORK}
	@ rm -rf ${BUILD}/$< && \
	mkdir -p $@ && touch $@ && \
	cp -r $< work/ && \
	for fname in $(shell find $< -type f | grep -e ".*\.\(js\|xul\|rdf\|dtd\|html\|json\)"); do \
		${CPP} "$$fname" -o "work/$$fname" 3>/dev/null 2>/dev/null; \
	done

# Build an addon (using platform specific build.sh)
${BUILD}/%: %
	@mkdir -p $@ && touch $@ && \
	cd work/$< && ./build.sh >/dev/null && \
	cp -r build/* ${ROOT}/$@

# Firefox
firefox_addon: $(shell find ${FIREFOX} -type f) ${WORK}/${FIREFOX} ${BUILD}/${FIREFOX}
	@echo ">> Firefox addon build."
firefox_install: firefox_addon
	${FIREFOX_BIN} ${BUILD}/${FIREFOX}/rndphrase.xpi

# Conkeror
conkeror_mode: $(shell find ${CONKEROR} -type f) ${WORK}/${CONKEROR} ${BUILD}/${CONKEROR}
	@echo ">> Conkeror page-mode build."

# Generic JavaScript extension
js_ext: $(shell find ${JS_EXT} -type f) ${WORK}/${JS_EXT} ${BUILD}/${JS_EXT}
	@echo ">> Generic JavaScript Extension build."

# Chrome
chrome_addon: $(shell find ${CHROME} -type f) ${WORK}/${CHROME} ${BUILD}/${CHROME}
	@echo ">> Chrome addon build."
chrome_install: chrome_addon
	${CHROME_BIN} ${BUILD}/${CHROME}/rndphrase.crx

# WWW
www_html: $(shell find ${WWW} -type f) ${WORK}/${WWW} ${BUILD}/${WWW}
	@echo ">> HTML version build."
