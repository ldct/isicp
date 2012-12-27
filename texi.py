#!/usr/bin/env python

import re

with open("sicp.texi") as sicp:
  
  r = sicp.read()
  
  r = re.sub("@subsection (.*?)\n", "<h3> \\1 </h3> \n", r)
  r = re.sub("@subsubheading (.*?)\n", "<h4> \\1 </h4> \n", r)
  r = re.sub("@newterm{(.*?)}", "<em> \\1 </em> \n", r)
  
  r = re.sub("@code{(.*?)}", "<tt> \\1 </tt>", r)
  r = re.sub("@var{(.*?)}", "\\1", r)
  
  r = re.sub("@lisp", '<div id="">', r)
  r = re.sub("@end lisp", "</div>\n<script>\nprompt();\n</script>", r)
  
  r = re.sub("@noindent", "", r)
  
  r = re.sub("@quotation", '<div class="exercise">', r)
  r = re.sub("@end quotation", '</div>', r)
  
  r = re.sub("@itemize @bullet", "<ul>", r)
  r = re.sub("@end itemize", "</ul>", r)
  
  print r
