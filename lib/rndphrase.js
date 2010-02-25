#ifndef __RndPhrase__
#define __RndPhrase__

#include "lib/cubehash.js"
#define ENTER_KEY 13

var RndPhrase = {
    seed : "",
    mods : [],
    alphabet : "abcdefghijklmnopqrstuvwxyz0123456789",
    hash : function(seed, passwd, host) {
        var H = CubeHash.hash;
        return RndPhrase.pack(H(passwd + H(seed + H(passwd + host))));
    },
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
        var prng_hashs = new Array("opwayyjc0dojsq95");
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
        var idx = host.toLowerCase().substring(host.search(/[^\.]+\.[^\./]+$/));
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
                var _keydown = function(_E) { if(_E.which == ENTER_KEY) _update(); };
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