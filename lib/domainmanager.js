#ifndef __DOMAIN_MANAGER__
#define __DOMAIN_MANAGER__


#include "lib/common.js"
#include "data/suffix-list.js"

rndphrase.DomainManager.suffix_regex = false;
rndphrase.DomainManager.get_host = function (domain) {
    // Try to use Firefox' built in list
    if (typeof(Components) !== "undefined") {
        var host,
            mozComponent;

        try {
            mozComponent = Components.classes["@mozilla.org/network/effective-tld-service;1"];
        } catch(err) {
            // Security exception
        }

        if (mozComponent && mozComponent.getService) {
            try {
                host = mozComponent.
                    getService(Components.interfaces.nsIEffectiveTLDService).
                    getBaseDomainFromHost(domain);
            } catch(err) {
                // getBaseDomainFromHost failed
            }
            if (host) {
                // tld-service worked
                return host;
            }
        }
    }

    // Fall back to own list
    if (rndphrase.DomainManager.suffix_regex === false) {
        // Build regex for matching domain using the Public Suffix List
        var suffixRegex = new RegExp("([^\\.]+\\.(?:" + rndphrase.DomainManager.SUFFIX_LIST.replace(/\./g, "\\.") + "|[a-z]+))$","i");
        rndphrase.DomainManager.suffix_regex = suffixRegex;
    }

    // Use pre-built cache
    var match = domain.match(rndphrase.DomainManager.suffix_regex);
    if(match) {
        return match[0];
    }

    return '';
};

rndphrase.DomainManager.is_host = function (domain) {
    var host;
    try {
        host = rndphrase.DomainManager.get_host(domain);
    } catch(err) {
        return false;
    }
    return host.indexOf(".") != -1;
};

#endif