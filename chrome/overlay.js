#include "lib/rndphrase.js"

init();
function init() {
    window.alert("patching..");
    var doc = document;
    RndPhrase.patch_document(doc.location.host, doc);
}
