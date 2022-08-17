#!/bin/bash

### Script installs root.cert.pem to certificate trust store of applications using NSS
### (e.g. Firefox, Thunderbird, Chromium)
### Mozilla uses cert8, Chromium and Chrome use cert9

###
### Requirement: apt install libnss3-tools
###


###
### CA file to install (CUSTOMIZE!)
###

certfile="C:\Users\austincheney\share-file-systems\lib\certificate\share-file-root.crt"
certname="share-file"


###
### For cert8 (legacy - DBM)
###

for certDB in $(find ~/ -name "cert8.db")
do
    certdir=$(dirname ${certDB});
    certutil -d dbm:${certdir} -A -t "CP,CP," -n "${certname}" -i ${certfile}
done


###
### For cert9 (SQL)
###

for certDB in $(find ~/ -name "cert9.db")
do
    certdir=$(dirname ${certDB});
    certutil -d sql:${certdir} -A -t "CP,CP," -n "${certname}" -i ${certfile}
done

### Prior permissions
### TCu,Cu,Tu