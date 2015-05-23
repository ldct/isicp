#!/usr/bin/env python

import sys, re

tag_re = re.compile(
  r"^({{[\w@]+}})$"  # ()Capture {{Tag}} word,
  r"(.*?)"  # then ()capture characters until
  r"^@@$",  # terminating "@@" line.
  flags=re.DOTALL|re.MULTILINE)  # '.' includes '\n' | '^' and '$' are per line.

with open(sys.argv[1]) as content:
  tag_content = dict(re.findall(tag_re, ''.join(content.readlines())))

with open("template.html") as template:
  for L in template.readlines():
    print tag_content.get(L.strip(), L)
