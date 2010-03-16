#ifndef __RndPhrase__
#define __RndPhrase__

#include "lib/cubehash.js"

var RndPhrase = {

    mods : [], // mods :: [[String, (String -> String)]]
    alphabet : "abcdefghijklmnopqrstuvwxyz0123456789",


    // hash :: (String, String, String) -> String[16]
    hash : function(seed, passwd, host) {
        // produce secure hash from seed, password and host
        var H = CubeHash.hash;
        return RndPhrase.pack(H(H(H(passwd + '$' + host) + seed) + passwd));
    },
    // set_seed :: String -> ()
    set_seed : function(seed) {
	RndPhrase.set_seed_hash(CubeHash.hash(seed));
    },
    set_seed_hash : function(seed_hash) {
        // encapsulate the seed
        RndPhrase.hash_seed = function(passwd, host) {
            return RndPhrase.hash(seed_hash, passwd, host); };
    },
    // hash_seed :: (String, String) -> String
    hash_seed : undefined,
    // pack :: String[64] -> String[16]
    pack : function(msg) {
        // Note: modulus introduces a bias
        // use 2 bytes to pick the letter to relax this
        var s = '', alpha = RndPhrase.alphabet;
        for(var i = 0; i < msg.length; i+=4) {
            s += alpha.charAt(parseInt(msg.substring(i, i+4),16) % alpha.length);
        }
        return s;
    },
    // self_test :: () -> Bool
    self_test : function() {
        if(!CubeHash.self_test()) {
            return false;
        }
        var prng_tests = new Array(["foo", "bar", "example.net"]);
        var prng_hashs = new Array("e9hn8rxt33h8pwon");
        while(prng_tests.length > 0) {
            var test = prng_tests.pop();
            var _seed = test[0], passwd = test[1], host = test[2];
            if(RndPhrase.hash(_seed, passwd, host) != prng_hashs.pop()) {
                return false;
            }
        }
        return true;
    },
    // is_password :: DOMField -> Bool
    is_password : function(f) { return f.type.toLowerCase() == 'password'; },
    // strip_host :: (host::string -> host::string)
    strip_host : function(host) {
        // Only for debug! if(host == undefined || host == "") return "localhost__TEST";
        var idx = host.search(/[^\.]+\.[^\./]+$/);
        if(idx == -1) {
            throw "This is no hostname: " + host;
        }
        return host.substring(idx);
    },
    // get_mods :: String -> String -> String
    get_mods : function(host) {
        var mods = RndPhrase.mods.filter(function(el) { return host.search(el[0]) != -1; } );
        return mods.length ? mods[0][1] : function(s) { return s; };
    },
    // update_input :: State -> DOMInputField -> DOMEvent -> ()
    update_input : function(S) { return function(I) { return function(E) {
            if(I._rndphrase == "ready") {
                I.value = S.B(function(host,mods){return mods(RndPhrase.hash_seed(I.value,host));});
                S.A(RndPhrase.field_set_tag)(I, "clear");
            }
    };};},
    // field_set_tag :: State -> (DOMInputField, String) -> ()
    field_set_tag : function(S) { return function(I, tag) {
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
    };},
    // keypress :: State -> DOMEvent -> ()
    keypress: function(S) { return function(E) {
            var I = E.target;
            if(!RndPhrase.is_password(I)) return true;
            if(String.fromCharCode(E.which) == '@' &&
                (I.value == undefined || I.value.length == 0)) {
                // new rndphrase password field
                S.A(RndPhrase.field_set_tag)(I, "ready");
                var _update  = S.A(RndPhrase.update_input)(I);
                I.addEventListener('blur', _update, false);
                // don't add the @ to the value
                E.stopPropagation();
                E.preventDefault();
            }
            return true;
    };},
    // keydown :: State -> DOMEvent -> ()
    keydown: function(S) { return function(E) {
            I = E.target;
            if(I._rndphrase != undefined) {
                var _update = S.A(RndPhrase.update_input)(I);
                var must_update = [ 13, 9 ]; // enter, tab
                if(must_update.indexOf(E.which) != -1) _update();
                var delete_code = [ 8, 46 ]; // backspace, delete
                if(delete_code.indexOf(E.which) != -1 && I.value.length == 0) {
                    S.A(RndPhrase.field_set_tag)(I, "clear");
                }
            }
        };
    },
    // patch_document :: (String, HTMLDocument) -> ()
    patch_document : function(_host, doc) {
        var host = RndPhrase.strip_host(_host);
        var mods = RndPhrase.get_mods(host);
        var S = function() {
            this.A = function(f) { return f(this); };
            this.B = function(f) { return f(host,mods); };
            return this;
        }();
        doc.addEventListener("keypress", S.A(RndPhrase.keypress), true);
        doc.addEventListener("keydown",  S.A(RndPhrase.keydown), true);
    }
};
RndPhrase.__defineSetter__("seed", RndPhrase.set_seed);
RndPhrase.seed = "";

#endif
