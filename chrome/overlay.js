#include "lib/rndphrase.js"

chrome.extension.sendRequest({name: "getPreferences"},
    function(response)
    {
        RndPhrase.seed = response.prefSeed;
        var doc = document;
        RndPhrase.patch_document(doc.location.host, doc);
    });



