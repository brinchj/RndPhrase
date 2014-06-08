#!/usr/bin/env python
import os
import re
import sys
from datetime import datetime
import httplib2


URL_LIST = "https://publicsuffix.org/list/effective_tld_names.dat"
SUFFIX_FILE = "data/suffix-list.js"

MIN_INTERVAL = 30 * 60


sys.stdout.write('Updating suffix list.. ')
sys.stdout.flush()


def last_check():
    try:
        ts = os.stat(SUFFIX_FILE).st_mtime
    except:
        ts = 0
    return datetime.fromtimestamp(ts)


def check_again():
    delta = datetime.now() - last_check()
    secs = delta.days * 24 * 3600 + delta.seconds
    return secs > MIN_INTERVAL


def get_modified_url():
    http = httplib2.Http()
    (hdrs, data) = http.request(URL_LIST, method='HEAD')
    if not hdrs.status == 200:
        print 'Could not grab list (%i).' % hdrs.status
        sys.exit(1)
    last_modified = hdrs['last-modified']
    return datetime.strptime(last_modified, '%a, %d %b %Y %H:%M:%S %Z')


def main():
    # Compare modification dates
    if not check_again():
        print "Too early to check again."
        sys.exit()

    if get_modified_url() < last_check():
        print "Already up to date."
        sys.exit()

    # generate javascript
    rules = {}
    lines = httplib2.Http().request(URL_LIST)[1].split('\n')

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
    suffix_list_js = 'rndphrase.DomainManager.SUFFIX_LIST = "%s";' % \
      js.replace('\\', '\\\\')
    file(SUFFIX_FILE, 'w').write(suffix_list_js)

    print 'Updated!'


if __name__ == '__main__':
    main()
