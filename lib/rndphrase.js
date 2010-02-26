#ifndef __RndPhrase__
#define __RndPhrase__

#include "lib/cubehash.js"
#define ENTER_KEY 13

var RndPhrase = {
    mods : [],
    alphabet : "abcdefghijklmnopqrstuvwxyz0123456789",
    hash : function(seed, passwd, host) {
        var H = CubeHash.hash;
        return RndPhrase.pack(H(H(H(passwd + '$' + host) + seed) + passwd));
    },
    set_seed : function(seed) {
        // encapsulate the seed
        RndPhrase.hash_seed = function(passwd, host) {
            return RndPhrase.hash(seed, passwd, host); };
    },
    hash_seed : undefined,
    pack : function(msg) {
        // Note: modulus introduces a bias
        // use 2 bytes to pick the letter to relax this
        var s = '', alpha = RndPhrase.alphabet;
        for(var i = 0; i < msg.length; i+=4) {
            s += alpha.charAt(parseInt(msg.substring(i, i+4),16) % alpha.length);
        }
        return s;
    },
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
    is_password : function(f) {
        return f.type != undefined && f.type.toLowerCase() == 'password';
    },
    strip_host : function(host) {
        if(host == undefined || host == "") return "localhost__TEST";
        var idx = host.search(/[^\.]+\.[^\./]+$/);
        if(idx == -1) {
            throw "This is no hostname: " + host;
        }
        return host.substring(idx);
    },
    get_mods : function(host) {
        var mods = RndPhrase.mods.filter(function(el) { return host.search(el[0]) != -1; } );
        return mods.length ? mods[0][1] : function(s) { return s; };
    },
    update_input : function(S) { return function(I) {
        return function(e) {
            if(I._rndphrase == "ready") {
                I.value = I._rndphrase_val();
                S.A(RndPhrase.field_set_tag)(I, "done");
            }
        };
    };},
    field_set_tag : function(S) { return function(I, tag) {
        switch(tag) {
            case "clear":
                I.value = "";
                I._rndphrase = undefined;
                I.style.backgroundColor = '#FFFFFF';
                break;
            case "ready":
                var f = function(acc) {
                    return function(chr) {
                        if(chr) { return f(acc+chr); }
                        else { return S.B(function(host,mods){
                            return mods(RndPhrase.hash_seed(acc, host));
                        }); };
                    }; };
                I._rndphrase_val = f("");
                I.style.backgroundColor = '#CCCCFF';
                break;
            case "done":
                break;
        }
        I._rndphrase = tag;
    };},
    keypress: function(S) {
        return function(E) {
            var I = E.target;
            if(!RndPhrase.is_password(I)) return true;
            if(String.fromCharCode(E.which) == '@' &&
                (I.value == undefined || I.value.length == 0)) {
                // new rndphrase password field
                S.A(RndPhrase.field_set_tag)(I, "ready");
                var _update  = S.A(RndPhrase.update_input)(I);
                I.addEventListener('blur', _update, false);
                E.stopPropagation(); E.preventDefault();
            } else if(I._rndphrase == "ready") {
                // old rndphrase password field
                I._rndphrase_val = I._rndphrase_val(String.fromCharCode(E.which));
                I.value += 'x';
                E.stopPropagation(); E.preventDefault();
            } else {
                // regular password field
            }
            return true;
        };
    },
    change: function(S) {
        return function(E) {
            var I = E.target;
            I.value = "asdasdasdasdasd";
        };
    },
    keydown: function(S) {
        return function(E) {
            I = E.target;
            if(I._rndphrase != undefined) {
                var _update = S.A(RndPhrase.update_input)(I);
                var not_allowed = [
                    8 // backspace
                    , 45,46 // backspace, insert, delete
                    , 37,38,39,40 // arrows
                    , 35, 36 // home, end
                    , 33, 34 // page up / down
                ];
                var must_update = [
                    13 // enter
                    , 9 // tab
                ];
                if(not_allowed.indexOf(E.which) != -1) S.A(RndPhrase.field_set_tag)(I, "clear");
                if(must_update.indexOf(E.which) != -1) _update();
                E.stopPropagation();
                //E.preventDefault();
            }
        };
    },
    keyup: function(S) { return function(E) {
        I = E.target;
        if(I._rndphrase == "ready") {
            E.stopPropagation();
        }
    }; },
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
        doc.addEventListener("keyup",    S.A(RndPhrase.keyup), true);
    }
};
RndPhrase.__defineSetter__("seed", RndPhrase.set_seed);
RndPhrase.seed = "";

#endif
