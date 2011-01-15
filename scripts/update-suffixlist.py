#!/usr/bin/env python
import os
import re
import sys
import urllib2 as urllib
from datetime import datetime
import httplib


DOM_LIST = "mxr.mozilla.org"
URL_LIST = "http://mxr.mozilla.org/mozilla-central/source/netwerk/dns/effective_tld_names.dat?raw=1"
SUFFIX_FILE = "data/suffix-list.js"
SUFFIX_TIME = "%s.timestamp" % SUFFIX_FILE

MIN_INTERVAL = 30 * 60


sys.stdout.write('Updating suffix list.. ')
sys.stdout.flush()


def last_check():
    try:
        return datetime.fromtimestamp(os.stat(SUFFIX_TIME).st_mtime)
    except:
        pass
    return datetime.fromtimestamp(0)


def check_again():
    delta = datetime.now() - last_check()
    secs = delta.days * 24 * 3600 + delta.seconds
    return secs > MIN_INTERVAL


def get_modified_url():
    conn = httplib.HTTPConnection(DOM_LIST)
    conn.request("HEAD", URL_LIST)
    res = conn.getresponse()
    if not res.status == 200:
        print 'Could not grab list (%i).' % res.status
        sys.exit(1)
    s = dict(res.getheaders())['last-modified']
    return datetime.strptime(s, '%a, %d %b %Y %H:%M:%S %Z')


def get_modified_file():
    try:
        return datetime.fromtimestamp(os.stat(SUFFIX_FILE).st_mtime)
    except:
        pass
    return datetime.fromtimestamp(0)

# Compare modification dates
if not check_again():
    print "Too early to check again."
    sys.exit()

# update timestamp
if os.path.isfile(SUFFIX_TIME):
    os.utime(SUFFIX_TIME, None)
else:
    file(SUFFIX_TIME, 'w').close()

if get_modified_url() < get_modified_file():
    print "Already up to date."
    sys.exit()

# generate javascript
rules = {}
lines = urllib.urlopen(URL_LIST).read().split('\n')

lines = filter(lambda l: '.' in l and re.search(r'^([^!/])', l),
               map(lambda l: l.strip().replace('*', r'[^\.]+'), lines))
js = '|'.join(lines)

# check list against test cases
tests = {
    'qwe.parliament.co.uk': 'parliament.co.uk',
    'foo.bar.version2.dk': 'version2.dk',
    'www.facebook.com': 'facebook.com',
    'ecs.soton.ac.uk': 'soton.ac.uk',
    'www.oakham.rutland.sch.uk': 'oakham.rutland.sch.uk',
    }

RE_DOMAIN = r"([^\.]+\.(?:" + js.replace(".", r"\.") + "|[a-z]+))$"
for test, exp in tests.items():
    match = re.search(RE_DOMAIN, test)
    assert match.group(1) == exp

# write new javascript file
file(SUFFIX_FILE, 'w').write(
    'rndphrase.DomainManager.SUFFIX_LIST = "%s"' % js)

print 'Updated!'
