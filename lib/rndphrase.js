#ifndef __RNDPHRASE__
#define __RNDPHRASE__

#include "lib/common.js"
#include "lib/domainmanager.js"
#include "lib/cubehash.js"

// Is this macro really neccessary to reference rndphrase.RndPhrase inside closures?
#define RNDPHRASE rndphrase.RndPhrase

rndphrase.RndPhrase = {

    mods : [], // mods :: [[String, (String -> String)]]
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
        var strip_host = this.strip_host, get_mods = this.get_mods;
        return function (host) {
            var _host = strip_host(host);
            var _mods = get_mods(host);
            var H = RNDPHRASE.hash;
            return function (passwd) {
                // produce secure hash from seed, password and host
                return RNDPHRASE.pack(H(H(H(passwd + '$' + _host) + seed) + passwd));
            };};},
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
        var s = '', alpha = RNDPHRASE.alphabet;
        for(var i = 0; i < msg.length; i+=4) {
            s += alpha.charAt(parseInt(msg.substring(i, i+4),16) % alpha.length);
        }
        return s;
    },
    // self_test :: () -> Bool
    self_test : function () {
        if (!rndphrase.CubeHash.self_test()) {
            return false;
        }
        var prng_tests = new Array(["foo", "bar", "example.net"]);
        var prng_hashs = new Array("e9hn8rxt33h8pwon");
        while(prng_tests.length > 0) {
            var test = prng_tests.pop();
            var _seed = test[0], passwd = test[1], host = test[2];
            if (RNDPHRASE.build_generator(_seed)(host)(passwd) != prng_hashs.pop()) {
                return false;
            }
        }
        return true;
    },
    // is_password :: DOMField -> Bool
    is_password : function (f) { return f.type.toLowerCase() == 'password'; },
    // strip_host :: (host::string -> host::string)
    strip_host : function (host) {
        // Only for debug!
        if (DEBUG)
            if(host == undefined || host == "") return "localhost__TEST";
        var real_host = rndphrase.DomainManager.get_host(host);
        if (real_host == undefined || real_host.indexOf('.') == -1) {
            throw "This is no hostname: " + host;
        }
        return real_host;
    },
    // get_mods :: String -> String -> String
    get_mods : function (host) {
        var mods = RNDPHRASE.mods.filter(function (el) {
                       return host.search(el[0]) != -1; } );
        return mods.length ? mods[0][1] : function(s) { return s; };
    },
    // update_input :: State -> DOMInputField -> DOMEvent -> ()
    update_input : function(I) { return function(E) {
            if (I._rndphrase == "ready") {
                I.value = RNDPHRASE.generator(I.value);
                RNDPHRASE.field_set_tag(I, "clear");
            }
    };},
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
        if (!RNDPHRASE.is_password(I)) {
            return true;
        }
        if (String.fromCharCode(E.which) == '@' &&
            (I.value == undefined || I.value.length == 0)) {
            // new rndphrase password field
            RNDPHRASE.field_set_tag(I, "ready");
            var _update  = RNDPHRASE.update_input(I);
            I.addEventListener('blur', _update, false);
            // don't add the @ to the value
            E.stopPropagation();
            E.preventDefault();
        }
        return true;
    },
    // keydown :: State -> DOMEvent -> ()
    keydown: function(E) {
        var I = E.target;
        if (I._rndphrase != undefined) {
            var _update = RNDPHRASE.update_input(I);
            var must_update = [ 13, 9 ]; // enter, tab
            if (must_update.indexOf(E.which) != -1) _update();
            var delete_code = [ 8, 46 ]; // backspace, delete
            if (delete_code.indexOf(E.which) != -1 && I.value.length == 0) {
                RNDPHRASE.field_set_tag(I, "clear");
            }
        }
    },
    // patch_document :: (String, HTMLDocument) -> ()
    patch_document : function(host, doc) {
        RNDPHRASE.generator = RNDPHRASE.generator_from_host(host);
        doc.addEventListener("keypress", this.keypress, true);
        doc.addEventListener("keydown",  this.keydown, true);
    }
};
RNDPHRASE.__defineSetter__("seed", RNDPHRASE.set_seed);
RNDPHRASE.__defineSetter__("seed_hash", RNDPHRASE.set_seed_hash);
RNDPHRASE.seed = "";

#endif
