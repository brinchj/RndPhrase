chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse)
    {
        switch (request.name)
        {
        case "getPreferences":
            chrome.storage.sync.get('seed', function (data) {
              if (data && data.seed) {
                sendResponse({ prefSeed : data.seed });
              } else {
	        // Fallback to localStorage (will migrate on options save).
                sendResponse({ prefSeed : localStorage["RndPhraseExtPrefSeed"] });
	      }
	    });
            break;
        }
    }
);
