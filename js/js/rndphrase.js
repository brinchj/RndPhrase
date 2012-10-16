#include "lib/rndphrase.js"

// Call this with either seed or seed_hash to initialise RndPhrase
function initRndPhrase(seed, seed_hash, mods) {
    if (!rndphrase.self_test()) {
        throw "Self test failed!";
    }

    var doc = document;
    var host = doc.location.hostname;

    var r = new rndphrase.RndPhrase(host);

    if(seed_hash) {
        r.set_seed_hash(seed_hash);
    } else if (seed) {
        r.set_seed(seed);
    } else {
        throw "RndPhrase: Need either seed or seed_hash!";
    }

    if(mods) {
        r.mods = mods;
    }

    r.patch_document(doc);
}


