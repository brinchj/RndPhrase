#ifndef __RNDPHRASE__
#define __RNDPHRASE__

#include "lib/common.js"
#include "lib/domainmanager.js"
#include "lib/cubehash.js"

rndphrase.RndPhrase = function(host) {

    var alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
    var r = {

        mods : [], // mods :: [ { pattern: RegExp, fn: (String -> String) } ]

        // hash_seed :: (String, String) -> String
        generator_from_host : undefined,
        generator : undefined,

        // hash :: String -> String[32]
        hash : function (msg) {
            return rndphrase.CubeHash.hash(msg);
        },
        // generate :: String -> String -> String -> String
        build_generator : function (seed) {
            // var get_mods = this.get_mods; // Not implemented yet
            var that = this,
            H = that.hash;
            return function () {
                var host = that.strip_host();
                // var _mods = get_mods(_host); // Not implemented yet
                return function (passwd) {
                    // produce secure hash from seed, password and host
                    return that.pack(
                        H(H(H(passwd + '$' + host) + seed) + passwd));
                };
            };
        },
        // set_seed :: String -> ()
        set_seed : function (seed) {
	          this.set_seed_hash(this.hash(seed));
        },
        // set_seed_hash :: String -> ()
        set_seed_hash : function (seed_hash) {
            // encapsulate the hashed seed
            this.generator_from_host = this.build_generator(seed_hash);
        },
        // pack :: String[64] -> String[16]
        pack : function (msg) {
            // Note: modulus introduces a bias
            // use 2 bytes to pick the letter to relax this
            var s = '',
                alpha = alphabet,
                i;
            for(i = 0; i < msg.length; i += 4) {
                s += alpha.charAt(
                    parseInt(msg.substring(i, i + 4),16) % alpha.length);
            }
            return s;
        },
        // strip_host :: (host::string -> host::string)
        strip_host : function () {
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
        get_mods : function () {
            var mods = this.mods.filter(
                function (mod) {
                    return host.search(mod.pattern) !== -1;
                });
            if (mods.length) {
                return mods[0].fn;
            } else {
                // default to identity function
                return function(s) { return s; };
            }
        },
        // update_input :: State -> DOMInputField -> ()
        update_input : function(that, I) {
            if (I._rndphrase === "ready") { // WTF
                I.value = that.generator(I.value);
                that.field_set_tag(I, "clear");
            }
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
        keypress: function (that) {
            return function (E) {
                var I = E.target;
                if (I.type === undefined) {
                    return;
                }
                if (I.type.toLowerCase() === 'password'
                    && I.value === '' && String.fromCharCode(E.which) === '@')
                {
                    // new rndphrase password field
                    that.field_set_tag(I, "ready");
                    var _update  = function (E) {
                        that.update_input(that.generator, I);
                        I.removeEventListener('blur', _update, false);
                    };
                    I.addEventListener('blur', _update, false);
                    // don't add the @ to the value
                    E.stopPropagation();
                    E.preventDefault();
                }
            };
        },
        // keydown :: State -> DOMEvent -> ()
        keydown: function(that) {
            return function(E) {
                var I = E.target;
                if (I._rndphrase !== undefined) {
                    switch(E.which) {
                    case  9: // Tab
                    case 13: // Enter
                        that.update_input(that, I, E);
                        break;
                    case  8: // Backspace
                case 46: // Delete
                        that.field_set_tag(I, "clear");
                        break;
                    default:
                    }
                }
            };
        },
        // patch_document :: (String, HTMLDocument) -> ()
        patch_document : function(doc) {
            if (rndphrase.DomainManager.is_host(host) === true) {
                this.generator = this.generator_from_host();
                doc.addEventListener("keypress", this.keypress(this), true);
                doc.addEventListener("keydown",  this.keydown(this), true);
            }
        }
    };

    return r;
};

// rndphrase.self_test :: () -> Bool
rndphrase.self_test = function() {
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
        var test = tests[i],
            r = new rndphrase.RndPhrase(test.domain),
            generator = r.build_generator(test.seed);
        if (generator()(test.passwd) !== test.hash) {
            return false;
        }
    }
    return true;
};


#endif
