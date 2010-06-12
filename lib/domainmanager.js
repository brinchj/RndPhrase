#ifndef __DOMAIN_MANAGER__
#define __DOMAIN_MANAGER__


#include "lib/common.js"
#include "data/suffix-list.js"


rndphrase.DomainManager = {
    get_reg_domain: function(rules, doms) {
        var node = rules[doms[0]];
        if(node == undefined) node = rules['*'];
        if(node == undefined || (node.L==1 && node['!'] == 1)) {
            return doms[0];
        } else if (node.L == 1) return node;
        var dom = this.get_reg_domain(node, doms.splice(1));
        if(dom != undefined)
            return dom + '.' + doms[0];
        return undefined;
    },
    get_host: function(domain) {
        // Try to use Firefox' built in list
        var eTLDService = Components.classes["@mozilla.org/network/effective-tld-service;1"]
                  .getService(Components.interfaces.nsIEffectiveTLDService);
        if(eTLDService) {
            return eTLDService.getBaseDomainFromHost(domain);
        }
        // Fall back to own list
        var doms = domain.split('.').reverse();
        return this.get_reg_domain(rndphrase.SUFFIX_LIST, doms);
    }
};


#endif