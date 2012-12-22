#!/usr/bin/env python

import re

tag_re = re.compile("(\{\{[\w@]+\}\}\n)")

tag_content = {}

with open("1-1-elements.content.html") as content:
  lines = [l for l in content.readlines() if l[0:2] != "@@"]
  lines = ''.join(lines)
  split = tag_re.split(lines)
  for i, s in enumerate(split):
    if re.match("@@", s):
      continue
    if tag_re.match(s):
      tag_content[s] = split[i+1][:-1]


with open("template.html") as template:
  lines = template.readlines()
  for l in lines:
    if tag_re.match(l):
      print tag_content[l],
    else:
      print l,
