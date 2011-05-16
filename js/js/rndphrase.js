#include "lib/rndphrase.js"

// configure the seed here or by sometime later depending on platform
rndphrase.RndPhrase.seed = "";

if (!rndphrase.RndPhrase.self_test()) {
    throw "Self test failed!";
} else {
    rndphrase.RndPhrase.patch_document(document.location.hostname, document);
}


