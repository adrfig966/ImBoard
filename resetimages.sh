#!/bin/bash
#This script is responsible for copyiing images from placeholder image directory into live directory. It should be ran with a cronjob.
SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
rm /root/imboard_staging/uploads/*
for file in /root/imboard_staging/demoimages/*; do
        echo $file
	cp $file /root/imboard_staging/uploads/
done
