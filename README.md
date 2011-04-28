RndPhrase - Auto-generated secure passwords
==========


Introduction
----------

This small addon will replace your everyday passwords with secure per domain passwords.



Installation
----------
First, you need to prepare the addon you would like to install. Simply run one of the following:

        make firefox
        make chrome
        make conkeror

Or, to make them all:

        make

You may need to adjust the "CHROME" variable in Makefile to fit your environment.

After the addon has been packed it is ready to install. This can also be done automatically by:

        make firefox_install
        make chrome_install

For Conkeror, you will need to manually move the generated page mode into the correct folder, e.g.:

    mv build/conkeror/page-modes/rndphrase.js  /usr/share/conkeror/modules/page-modes



Usage
----------
To activate the transformation of a password, simply prefix it with '@'. For example, the password 'lenny' is then typed as '@lenny'. This tag tells RndPhrase to process the password.



Bugs
----------
Bugs, issues or requests can be added at:
http://github.com/brinchj/RndPhrase/issues