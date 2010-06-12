#ifndef __CUBEHASH__
#define __CUBEHASH__

#include "lib/common.js"

#define CubeHash_RotL(a,b) (((a) << (b)) | ((a) >>> (32-b)))
rndphrase.CubeHash = {
    // For info on CubeHash see: http://cubehash.cr.yp.to/
    // Init vector was computed by 10r rounds as described in the specification
    INIT : new Array(-2096419883, 658334063, -679114902,
                     1246757400, -1523021469, -289996037, 1196718146, 1168084361,
                     -2027445816, -1170162360, -822837272, 625197683, 1543712850,
                     -1365258909, 759513533, -424228083, -13765010209, -2824905881,
                     -9887154026, 19352563566, 5669379852, -31581549269, 21359466527,
                     10648459874, -8561790247, 9779462261, -22434204802, -4124492433,
                     19608647852, 9541915967, 5144979599, -4355863926),
    int_to_hex : function(v) {
        var s="";
        for( ; v != 0; v >>>= 8)
            s += ((v>>4)&0xF).toString(16) + (v&0xF).toString(16);
        return s;
    },
    transform : function(state)
    {
        var i,r;
        var y = new Array(16);
        for (r = 0;r < 8;++r) {
            for (i = 0;i < 16; ++i) state[i + 16] += y[i^8] = state[i];
            for (i = 0;i < 16; ++i) state[i] = CubeHash_RotL(y[i],7)^state[i+16];
            for (i = 0;i < 16; ++i) y[i ^ 2] = state[i + 16];
            for (i = 0;i < 16; ++i) state[i + 16] = y[i] + state[i];
            for (i = 0;i < 16; ++i) y[i ^ 4] = state[i];
            for (i = 0;i < 16; ++i) state[i] = CubeHash_RotL(y[i],11) ^ state[i+16];
            for (i = 0; i < 16; i+=2) {
		    var t = state[i+17];
		    state[i+17] = state[i+16];
        state[i+16] = t;
	          }
        }
	      for(i = 0; i < 16; ++i) y[i] = 0;
    },
    hash : function(data)
    {
        // init state
        var i,s="",state = new Array(32);
        for (i = 0; i < 32; i++) state[i] = this.INIT[i];
        // update with data
        data += String.fromCharCode(128);
        for (i = 0; i < data.length; i++) {
            state[0] ^= data.charCodeAt(i);
            this.transform(state);
        }
        // finalize
        state[31] ^= 1;
        for (i = 0; i < 10; i++) this.transform(state);
        // convert to hex
        for (i = 0; i < 8; i++) s += this.int_to_hex(state[i]);
        return s;
    },
    self_test : function() {
        var tests = ["", "Hello", "The quick brown fox jumps over the lazy dog"];
        var hashs = [
            "38d1e8a22d7baac6fd5262d83de89cacf784a02caa866335299987722aeabc59",
            "692638db57760867326f851bd2376533f37b640bd47a0ddc607a9456b692f70f",
            "94e0c958d85cdfaf554919980f0f50b945b88ad08413e0762d6ff0219aff3e55"];
        for(var i = 0; i < tests.length; i++) {
            if(this.hash(tests[i]) != hashs[i]) return false;
        }
        return true;
    }
};
#endif
