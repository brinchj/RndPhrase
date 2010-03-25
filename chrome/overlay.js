#include "lib/rndphrase.js"

chrome.extension.sendRequest({name: "getPreferences"},
    function(response)
    {
        rndphrase.RndPhrase.seed = response.prefSeed;
        rndphrase.RndPhrase.patch_document(document.location.host, document);
    });



