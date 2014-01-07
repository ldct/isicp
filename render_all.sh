#!/usr/bin/env bash

for f in content/*.content.html; do ./render.py $f > `echo ${f} | sed 's/content.//g'`; done