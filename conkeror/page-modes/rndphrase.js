in_module(null);
#include "lib/rndphrase.js"

var rndPhraseExt = {
    onPageLoad: function(buffer) {
        if(!rndphrase.RndPhrase.self_test()) throw "Self test failed!";
        var doc = buffer.document;
        rndphrase.RndPhrase.patch_document(doc.location.hostname, doc);
    }
};
define_page_mode("rndphrase_mode",
    $display_name = "RndPhrase",
    $enable = function (buffer) {
        do_when("buffer_dom_content_loaded_hook", buffer, rndPhraseExt.onPageLoad);
    },
    $disable = function (buffer) {
        remove_hook.call(buffer, "buffer_dom_content_loaded_hook", rndPhraseExt.onPageLoad);
    }
);
// enable at all sites: auto_mode_list.push([/.*/, rndphrase_mode]);
provide("rndphrase");
