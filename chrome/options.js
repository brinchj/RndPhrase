#include "lib/cubehash.js"

// For masking seed hash
var MASK = "********";

// Set status
function set_status(msg) {
    var status = document.getElementById("status");
    status.innerHTML = msg;
    setTimeout(function(){ status.innerHTML = ""; }, 2000);
}

// Saves options to localStorage.
function save_options() {
    var inp = document.getElementById("rndphrase_seed");
    if(inp.value == MASK) {
        set_status("Cowardly refused to store '"+MASK+"' as seed.");
        return;
    }
    var hash = rndphrase.CubeHash.hash(inp.value);
    localStorage.setItem("RndPhraseExtPrefSeed", hash);
    inp.value = MASK;
    // Update status to let user know options were saved.
    set_status("Seed updated.");
}

// Restores select box state to saved value from localStorage.
function restore_options() {
    var seed = localStorage.getItem("RndPhraseExtPrefSeed");
    if (!seed) {
        return;
    }
    var inp = document.getElementById("rndphrase_seed");
    inp.value = MASK;
}

// Handler to reset seed input-field if masked
function reset_seed(e) {
    var inp = e.target;
    if(inp.value == MASK) {
        inp.value = "";
    }
}

// Set event handlers when DOM has loaded
function init() {
    // reset
    restore_options();

    document.getElementById('rndphrase_seed').addEventListener(
        'focus', reset_seed, false);

    document.getElementById('options_form').addEventListener(
        'submit', save_options, false);
}

window.onload = init;
