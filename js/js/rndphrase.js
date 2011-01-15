#include "lib/rndphrase.js"

window.addEventListener('load', function() {
    if(!rndphrase.RndPhrase.self_test()) {
        throw "Self test failed!";
    } else {
        rndphrase.RndPhrase.patch_document(document.location.host, document);
    }
}, false);

// configure the seed here or by sometime later depending on platform
rndphrase.RndPhrase.seed = "";
