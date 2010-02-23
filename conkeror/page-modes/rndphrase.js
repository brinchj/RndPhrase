var EXPORTED_SYMBOLS = ["CubeHash_Hash", "CubeHash_SelfTest"];

var ROTATE = function(a,b) { return (((a) << (b)) | ((a) >>> (32-b))); };

var CubeHash_INIT = new Array(-2096419883, 658334063, -679114902,
                              1246757400, -1523021469, -289996037, 1196718146, 1168084361,
                              -2027445816, -1170162360, -822837272, 625197683, 1543712850,
                              -1365258909, 759513533, -424228083, -13765010209, -2824905881,
                              -9887154026, 19352563566, 5669379852, -31581549269, 21359466527,
                              10648459874, -8561790247, 9779462261, -22434204802, -4124492433,
                              19608647852, 9541915967, 5144979599, -4355863926);

function CubeHash_Transform(state)
{
    var i,r;
    var y = new Array();
    for (r = 0;r < 8;++r) {
        for (i = 0;i < 16;++i) state[i + 16] += state[i];
        for (i = 0;i < 16;++i) y[i ^ 8] = state[i];
        for (i = 0;i < 16;++i) state[i] = ROTATE(y[i],7);
        for (i = 0;i < 16;++i) state[i] ^= state[i + 16];
        for (i = 0;i < 16;++i) y[i ^ 2] = state[i + 16];
        for (i = 0;i < 16;++i) state[i + 16] = y[i];
        for (i = 0;i < 16;++i) state[i + 16] += state[i];
        for (i = 0;i < 16;++i) y[i ^ 4] = state[i];
        for (i = 0;i < 16;++i) state[i] = ROTATE(y[i],11);
        for (i = 0;i < 16;++i) state[i] ^= state[i + 16];
        for (i = 0;i < 16;++i) y[i ^ 1] = state[i + 16];
        for (i = 0;i < 16;++i) state[i + 16] = y[i];
    }
    for(i = 0; i < 32; i++) y[i] = 0;
}

function CubeHash_Hash(data)
{
    // init state
    var i,s="",state = new Array();
    for (i = 0; i < 32; i++) state[i] = CubeHash_INIT[i];
    // update with data
    data += String.fromCharCode(128);
    for (i = 0; i < data.length; i++) {
        state[0] ^= data.charCodeAt(i);
        CubeHash_Transform(state);
    }
    // finalize
    state[31] ^= 1;
    for (i = 0; i < 10; i++) CubeHash_Transform(state);
    // convert to hex
    for (i = 0; i < 8; i++) s += state[i].toHexStr();
    return s;
}

Number.prototype.toHexStr = function() {
    var s="";
    for(var v = this; v != 0; v >>>= 8)
        s += ((v>>4)&0xF).toString(16) + (v&0xF).toString(16);
    return s;
};

function CubeHash_SelfText() {

    var tests = ["", "Hello", "The quick brown fox jumps over the lazy dog"];
    var hashs = [
        "38d1e8a22d7baac6fd5262d83de89cacf784a02caa866335299987722aeabc59",
        "692638db57760867326f851bd2376533f37b640bd47a0ddc607a9456b692f70f",
        "94e0c958d85cdfaf554919980f0f50b945b88ad08413e0762d6ff0219aff3e55"];
    for(var i = 0; i < tests.length; i++) {
        if(CubeHash_Hash(tests[i]) != hashs[i]) return false;
    }
    return true;
}


var Hash = CubeHash_Hash;

function rndphrase_prng(rndphrase_seed, passwd, host) {
    return Hash(passwd + Hash(rndphrase_seed + Hash(passwd + host.toLowerCase()))).substring(0,16);
}

function rndphrase_selftest() {
    if(!CubeHash_SelfText()) {
        return false;
    }
    var prng_tests = new Array(["foo", "bar", "example.net"]);
    var prng_hashs = new Array("af46cafb05fe3bc4");
    while(prng_tests.length > 0) {
        var test = prng_tests.pop();
        var seed = test[0], passwd = test[1], host = test[2];
        if(rndphrase_prng(seed, passwd, host) != prng_hashs.pop()) {
            return false;
        }
    }
    return true;
}


function is_password_field(f) {
    return f.type != undefined && f.type.toLowerCase() == 'password';
}
function has_value(f) {
    return f.value != undefined && f.value.length > 0;
}

function get_host(host) {
    var idx = host.substring(host.search(/[^\.]+\.[^\./]+$/));
    if(idx == -1) {
        throw "This is no hostname: " + host;
    }
    return host.substring(idx);
}

function get_mods(host) {
    var mods = rndphrase_mods.filter(function(el) { return host.search(el[0]) != -1; } );
    return mods.length ? mods[0][1] : function(s) { return s; };
}

var rndPhraseExt = {

    onPageLoad: function(buffer) {
        if(!rndphrase_selftest()) throw "Self Test failed!";
        var doc = buffer.document;
        var host = get_host(doc.location.host);
        var mods = get_mods(host);
        doc.addEventListener("keydown", rndPhraseExt.onKeypress(host, mods), true);
    },

    onKeypress: function(host, mods) {
        return function(aEvent) {
            var I = aEvent.target;
            if(is_password_field(I)) {
                if(I._rndphrase != true) {
                    var _update = function() {
                        if(has_value(I) && I.value[0] == '@') {
                            I.value = mods((rndphrase_prng(rndphrase_seed, I.value.substring(1), host)));
                        }
                    };
                    I.addEventListener('blur', _update, false);
                    var _keydown = function(e) {
                        if(e.which == 13) { // enter
                            _update();
                        }
                    };
                    I.addEventListener('keydown', _keydown, false);
                    I._rndphrase = true;
                }
            }
        };
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
