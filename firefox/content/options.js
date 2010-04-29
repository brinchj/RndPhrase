// #include "lib/rndphrase.js"

/* 
 * Gain access to the Prefences service.
 */
var prefManager = Components.classes["@mozilla.org/preferences-service;1"]
                            .getService(Components.interfaces.nsIPrefBranch);
/*
 * Called when the seed has been updated
 */
function savePref() {
    // alert("savePref");
    //    rndphrase.RndPhrase.seed = prefManager.getCharPref("extensions.rndphrase.seedpref");
}