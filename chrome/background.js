chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse)
    {
        switch (request.name)
        {
        case "getPreferences":
            chrome.storage.sync.get('seed', function (data) {
              sendResponse({ prefSeed : data.seed });
            });
            break;
        }
    }
);
