#!/usr/bin/env python
import os, shutil, sys
import urllib2 as urllib
from datetime import datetime
import httplib

try:
    import json
except:
    print "Could not import module 'json'."
    print "Please install this Python module (probably called python-json)."
    sys.exit(1)

DOM_LIST = "mxr.mozilla.org"
URL_LIST = "http://mxr.mozilla.org/mozilla-central/source/netwerk/dns/src/effective_tld_names.dat?raw=1"
SUFFIX_FILE = "data/suffix-list.js"
SUFFIX_TIME = "%s.timestamp" % SUFFIX_FILE

MIN_INTERVAL = 30 * 60


sys.stdout.write('Updating suffix list.. ')
sys.stdout.flush()

def last_check():
    try:
        return datetime.fromtimestamp(os.stat(SUFFIX_TIME).st_mtime)
    except: pass
    return datetime.fromtimestamp(0)

def check_again():
    delta = datetime.now() - last_check()
    secs  = delta.days * 24 * 3600 + delta.seconds
    return secs > MIN_INTERVAL

def get_modified_url():
    conn = httplib.HTTPConnection(DOM_LIST)
    conn.request("HEAD", URL_LIST)
    res = conn.getresponse()
    s = dict(res.getheaders())['last-modified']
    return datetime.strptime(s, '%a, %d %b %Y %H:%M:%S %Z')

def get_modified_file():
    try:
        return datetime.fromtimestamp(os.stat(SUFFIX_FILE).st_mtime)
    except: pass
    return datetime.fromtimestamp(0)

# Compare modification dates
if not check_again():
    print "Too early to check again."
    sys.exit()

# update timestamp
if os.path.isfile(SUFFIX_TIME):
    os.utime(SUFFIX_TIME, None)
else:
    file(SUFFIX_TIME,'w').close()

if get_modified_url() < get_modified_file():
    print "Already up to date."
    sys.exit()

# generate json
rules = {}
lst = urllib.urlopen(URL_LIST).read()

lines = lst.split('\n')
for i,line in enumerate(lines):
    if line[:2] == '//' or len(line) == 0:
        continue # skip comments
    EXCEPT = line[0] == '!'
    if EXCEPT: # exception rule
        line = line[1:]
    doms = line.split('.')
    lst = rules
    # find node to update
    for d in reversed(doms):
        node = lst.get(d, None)
        if not node:
            node = {}
            lst[d] = node
        lst = node
    if EXCEPT:
        lst['!'] = {};

# functions for checking domains
def get_reg_domain(rules, doms):
    node = rules.get(doms[0],None)
    if node == None: node = rules.get('*',None)
    if node == None or (len(node) == 1 and node['!'] == 1):
        return doms[0]
    elif len(doms) == 1:
        return None
    reg = get_reg_domain(node, doms[1:])
    if(reg != None):
        return '%s.%s' % (reg, doms[0])
def get_host(domain):
    doms = list(reversed(domain.split('.')))
    return get_reg_domain(rules, doms)

# test the list
tests = {'qwe.parliament.co.uk': 'parliament.co.uk',
         'foo.bar.version2.dk': 'version2.dk',
         'www.facebook.com':    'facebook.com',
         'ecs.soton.ac.uk': 'soton.ac.uk'}
for (test,res) in tests.items():
    assert get_host(test) == res

# convert the dictionary into a list
def build_string(rules):
    lst = []
    for key in rules:
        c = build_string(rules[key])
        s = key
        if len(c) != 0: s += '(%s)' % c
        lst.append(s)
    return ','.join(lst)
def set_length(d):
    for key in d:
        set_length(d[key])
    d['L'] = len(d)

# output new list as javascript
set_length(rules)
json = json.serialize(rules).replace(' ','')
js = 'var SUFFIX_LIST=%s;' % json
file('%s.new' % SUFFIX_FILE,'w').write(js);
shutil.move('%s.new' % SUFFIX_FILE, SUFFIX_FILE)

print 'Updated!'

