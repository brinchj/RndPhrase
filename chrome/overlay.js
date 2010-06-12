#include "lib/rndphrase.js"

chrome.extension.sendRequest({name: "getPreferences"},
    function(response)
    {
        if(!rndphrase.RndPhrase.self_test()) {
            throw "Self test failed!";
        }
        var seed = response.prefSeed;
        if(seed != null && seed.length > 0) {
            rndphrase.RndPhrase.seed_hash = seed;
        }
        rndphrase.RndPhrase.patch_document(document.location.host, document);
    });



