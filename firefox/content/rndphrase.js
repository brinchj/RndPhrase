#include "lib/rndphrase.js"

	alert("Before");
//var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);					
//					alert(prefManager.getCharPref("extensions.rndphrase.seedpref");
	alert("after");
/*
        var rndPhraseExt = {
            init: function() {
                var appcontent = document.getElementById("appcontent");   // browser
                if(appcontent) {
                    appcontent.addEventListener("DOMContentLoaded", rndPhraseExt.onPageLoad, true);
					var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);					
					alert(prefManager.getCharPref("extensions.rndphrase.seedpref");
					rndphrase.seed = prefManager.getCharPref("extensions.rndphrase.seedpref");               
				}
            },
            onPageLoad: function(aEvent) {
                if(!rndphrase.RndPhrase.self_test()) throw "Self test failed!";
                var doc = aEvent.originalTarget;
                rndphrase.RndPhrase.patch_document(doc.location.host, doc);
            },
        };
        window.addEventListener("load", function() { rndPhraseExt.init(); }, false);
*/
