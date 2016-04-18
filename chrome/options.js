#include "lib/cubehash.js"

// For masking seed hash
var MASK = "********";

// Set status
function set_status(msg) {
    var status = document.getElementById("status");
    status.textContent = msg;
    setTimeout(function(){ status.textContent = ""; }, 2000);
}

// Saves options to storage.
function save_options() {
    var inp = document.getElementById("rndphrase_seed");
    if(inp.value == MASK) {
        set_status("Cowardly refused to store '"+MASK+"' as seed.");
        return;
    }
    var hash = rndphrase.CubeHash.hash(inp.value);

    return chrome.storage.sync.set({ seed: hash }, function () {
      inp.value = MASK;
      // Update status to let user know options were saved.
      set_status("Seed updated.");
    });
}

// Restores select box state to saved value from storage.
function restore_options(callback) {
    var seed;

    var cb = function () {
      if (!seed) {
          return callback();
      }
      var inp = document.getElementById("rndphrase_seed");
      inp.value = MASK;

      callback();
    }

    // Legacy localStorage migration code
    if (localStorage.getItem("RndPhraseExtPrefSeed") !== null) {
      seed = localStorage.getItem("RndPhraseExtPrefSeed");

      // Remove all traces of RndPhrase from localStorage
      localStorage.removeItem("RndPhraseExtPrefSeed");

      return chrome.storage.sync.set({ seed: seed }, cb);
    }

    chrome.storage.sync.get('seed', function (data) {
      seed = data.seed;

      return cb();
    });
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
    restore_options(function () {
      document.getElementById('rndphrase_seed').addEventListener('focus', reset_seed, false);

      document.getElementById('options_form').addEventListener('submit', save_options, false);
    });

}

window.onload = init;
