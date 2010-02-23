#ifndef __RndPhrase__
#define __RndPhrase__

#include "lib/cubehash.js"

var RndPhrase = {
    seed : "",
    mods : [],
    hash : function(seed, passwd, host) {
        var H = CubeHash.hash;
        return H(passwd + H(seed + H(passwd + host.toLowerCase()))).substring(0,16);
    },
    self_test : function() {
        if(!CubeHash.self_test()) {
            window.dump("Cubehash failed.");
            return false;
        }
        var prng_tests = new Array(["foo", "bar", "example.net"]);
        var prng_hashs = new Array("af46cafb05fe3bc4");
        while(prng_tests.length > 0) {
            var test = prng_tests.pop();
            var seed = test[0], passwd = test[1], host = test[2];
            if(RndPhrase.hash(seed, passwd, host) != prng_hashs.pop()) {
                return false;
            }
        }
        return true;
    },
    is_password : function(f) {
        return f.type != undefined && f.type.toLowerCase() == 'password';
    },
    strip_host : function(host) {
        var idx = host.substring(host.search(/[^\.]+\.[^\./]+$/));
        if(idx == -1) {
            throw "This is no hostname: " + host;
        }
        return host.substring(idx);
    },
    get_mods : function(host) {
        var mods = RndPhrase.mods.filter(function(el) { return host.search(el[0]) != -1; } );
        return mods.length ? mods[0][1] : function(s) { return s; };
    },
    update_input : function(host, mods, I) {
        return function(e) {
            if(I.value[0] == '@')
                I.value = mods(RndPhrase.hash(RndPhrase.seed, I.value.substring(1), host));
        };
    },
    keypress: function(host, mods) {
        return function(E) {
            var I = E.target;
            if(RndPhrase.is_password(I) && I._rndphrase != true) {
                var _update  = RndPhrase.update_input(host,mods,I);
                var _keydown = function(_E) { if(_E.which == 13) _update(); }; // 13 == ENTER
                I.addEventListener('blur', _update, false);
                I.addEventListener('keydown', _keydown, false);
                I._rndphrase = true;
            }
        };
    },
    patch_document : function(_host, doc) {
        var host = RndPhrase.strip_host(_host);
        var mods = RndPhrase.get_mods(host);
        doc.addEventListener("keydown", RndPhrase.keypress(host, mods), true);
    }
};
#endif