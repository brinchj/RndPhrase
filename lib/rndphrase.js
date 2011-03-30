#ifndef __RNDPHRASE__
#define __RNDPHRASE__

#include "lib/common.js"
#include "lib/domainmanager.js"
#include "lib/cubehash.js"

// Is this macro really neccessary to reference rndphrase.RndPhrase inside closures?
#define RNDPHRASE rndphrase.RndPhrase

rndphrase.RndPhrase = {

    mods : [], // mods :: [ { pattern: RegExp, fn: (String -> String) } ]
    alphabet : "abcdefghijklmnopqrstuvwxyz0123456789",

    // hash_seed :: (String, String) -> String
    generator_from_host : undefined,
    generator : undefined,

    // hash :: String -> String[32]
    hash : function (msg) {
        return rndphrase.CubeHash.hash(msg);
    },
    // generate :: String -> String -> String -> String
    build_generator : function (seed) {
        var strip_host = this.strip_host;
        // var get_mods = this.get_mods; // Not implemented yet
        return function (host) {
            host = strip_host(host);
            var H = RNDPHRASE.hash;
            // var _mods = get_mods(_host); // Not implemented yet
            return function (passwd) {
                // produce secure hash from seed, password and host
                return RNDPHRASE.pack(H(H(H(passwd + '$' + host) + seed) + passwd));
            };
        };
    },
    // set_seed :: String -> ()
    set_seed : function (seed) {
	    RNDPHRASE.set_seed_hash(RNDPHRASE.hash(seed));
    },
    // set_seed_hash :: String -> ()
    set_seed_hash : function (seed_hash) {
        // encapsulate the hashed seed
        RNDPHRASE.generator_from_host = RNDPHRASE.build_generator(seed_hash);
    },
    // pack :: String[64] -> String[16]
    pack : function (msg) {
        // Note: modulus introduces a bias
        // use 2 bytes to pick the letter to relax this
        var s = '',
            alpha = RNDPHRASE.alphabet,
            i;
        for(i = 0; i < msg.length; i += 4) {
            s += alpha.charAt(parseInt(msg.substring(i, i + 4),16) % alpha.length);
        }
        return s;
    },
    // self_test :: () -> Bool
    self_test : function () {
        if (!rndphrase.CubeHash.self_test()) {
            return false;
        }
        var i,
            tests = [
                {
                    seed: "foo",
                    passwd: "bar",
                    domain: "example.net",
                    hash: "e9hn8rxt33h8pwon"
                }
            ];

        for (i = 0; i < tests.length; i++) {
            var test = tests[i];
            var generator = RNDPHRASE.build_generator(test.seed);
            if (generator(test.domain)(test.passwd) !== test.hash) {
                return false;
            }
        }
        return true;
    },
    // strip_host :: (host::string -> host::string)
    strip_host : function (host) {
        // Only for debug!
        if (DEBUG) {
            if (host === undefined || host === "") {
                return "localhost__TEST";
            }
        }
        var real_host = rndphrase.DomainManager.get_host(host);
        if (!real_host) {
            throw "This is no hostname: " + host;
        }
        return real_host;
    },
    // get_mods :: String -> String -> String
    get_mods : function (host) {
        var mods = RNDPHRASE.mods.filter(function (mod) {
            return host.search(mod.pattern) !== -1;
        });
        if (mods.length) {
            return mods[0].fn;
        } else {
            // default to identity function
            return function(s) { return s; };
        }
    },
    // update_input :: State -> DOMInputField -> DOMEvent -> ()
    update_input : function(I) {
        return function(E) {
            if (I._rndphrase === "ready") { // WTF
                I.value = RNDPHRASE.generator(I.value);
                RNDPHRASE.field_set_tag(I, "clear");
            }
        };
    },
    // field_set_tag :: State -> (DOMInputField, String) -> ()
    field_set_tag : function(I, tag) {
        switch(tag) {
            case "clear":
                I._rndphrase = undefined;
                I.style.backgroundColor = '#FFFFFF';
                return;
            case "ready":
                I.style.backgroundColor = '#CCCCFF';
                break;
        }
        I._rndphrase = tag;
    },
    // keypress :: State -> DOMEvent -> ()
    keypress: function (E) {
        var I = E.target;
        if (I.type.toLowerCase() === 'password' && I.value === '' && String.fromCharCode(E.which) === '@') {
            // new rndphrase password field
            RNDPHRASE.field_set_tag(I, "ready");
            var _update  = function (E) {
                RNDPHRASE.update_input(I);
                I.removeEventListener('blur', _update, false);
            };
            I.addEventListener('blur', _update, false);
            // don't add the @ to the value
            E.stopPropagation();
            E.preventDefault();
        }
    },
    // keydown :: State -> DOMEvent -> ()
    keydown: function(E) {
        var I = E.target;
        if (I._rndphrase !== undefined) {
            switch(E.which) {
                case  9: // Tab
                case 13: // Enter
                    RNDPHRASE.update_input(I)();
                    break;
                case  8: // Backspace
                case 46: // Delete
                    RNDPHRASE.field_set_tag(I, "clear");
                    break;
                default:
            }
        }
    },
    // patch_document :: (String, HTMLDocument) -> ()
    patch_document : function(host, doc) {
        if (host === "") {
            // Empty tab
            return;
        }
        RNDPHRASE.generator = RNDPHRASE.generator_from_host(host);
        doc.addEventListener("keypress", this.keypress, true);
        doc.addEventListener("keydown",  this.keydown, true);
    }
};
RNDPHRASE.__defineSetter__("seed", RNDPHRASE.set_seed);
RNDPHRASE.__defineSetter__("seed_hash", RNDPHRASE.set_seed_hash);
RNDPHRASE.seed = "";

#endif
