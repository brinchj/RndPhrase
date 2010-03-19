#include "lib/rndphrase.js"

chrome.extension.sendRequest({name: "getPreferences"},
    function(response)
    {
        com.rndphrase.RndPhrase.seed = response.prefSeed;
        com.rndphrase.RndPhrase.patch_document(doc.location.host, document);
    });



