#include "lib/rndphrase.js"

chrome.extension.sendRequest(
    {name: "getPreferences"},
    function(response)
    {
        if(!rndphrase.self_test()) {
            throw "Self test failed!";
        }
        var doc = document;
        var host = doc.location.hostname;
        var r = new rndphrase.RndPhrase(host);

        var seed = response.prefSeed;
        if(seed != null && seed.length > 0) {
            r.set_seed_hash(seed);
        }

        r.patch_document(doc);
    });



