The TODO list
=============

(This is a Markdown file)

Feel free to take anything on the list if you want, but do coordinate
so we don't do multiple work on the same thing. Feel free to add
anything to the list as well.


List of things that need to be done before v1.0:

* Implement KECCAK (SHA-3).
* Implement PBKDF2 based on KECCAK and use this function to generate passwords.

* Decide on a final set of alphabet groups (a-z, 0-9, A-Z).
* Make sure *every* generated password has at least one character from each
  alphabet group.

* Look into the Public Suffix list - is the Mozilla list the most complete?
* Does the regex handle utf8 characters and punycode correctly?

* Code review.
* Set up a non-public key for Chrome to allow signing of addon.


Other:

* Add functionality for adding rules, e.g. max length, or required upper case letter.
* Try to prevent host from "spying" on the passphrase (investigate ways of doing
  so).
