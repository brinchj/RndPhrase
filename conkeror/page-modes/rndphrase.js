#include "lib/rndphrase.js"
var rndPhraseExt = {
    onPageLoad: function(buffer) {
        if(!RndPhrase.self_test()) throw "Self test failed!";
        var doc = buffer.document;
        RndPhrase.patch_document(doc.location.host, doc);
    }
};
define_page_mode("rndphrase_mode", "RndPhrase",
    $enable = function (buffer) {
        do_when("buffer_dom_content_loaded_hook", buffer, rndPhraseExt.onPageLoad);
    },
    $disable = function (buffer) {
        remove_hook.call(buffer, "buffer_dom_content_loaded_hook", rndPhraseExt.onPageLoad);
    }
);