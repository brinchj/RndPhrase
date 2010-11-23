#include "lib/rndphrase.js"

var rndPhraseExt = {
    onPageLoad: function(doc) {
        if(!rndphrase.RndPhrase.self_test()) throw "Self test failed!";
        rndphrase.RndPhrase.patch_document(doc.location.host, doc);
    }
};

window.addEventListener('load', function(){
                            rndPhraseExt.onPageLoad(document);}, false
                       );

// configure the seed here or by sometime later depending on platform
rndphrase.RndPhrase.seed = "";
