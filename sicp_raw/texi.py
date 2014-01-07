#!/usr/bin/env python

import re

with open("sicp.texi") as sicp:
  
  r = sicp.read()
  
  r = re.sub("@dots{}", "...", r)
  
  r = re.sub("@section (.*?)\n", "<h2> \\1 </h2> \n", r)  
  r = re.sub("@subsection (.*?)\n", "<h3> \\1 </h3> \n", r)
  r = re.sub("@subsubheading (.*?)\n", "<h4> \\1 </h4> \n", r)

  r = re.sub("@example", "<pre>", r)
  r = re.sub("@end example", "</pre>", r)
  
  r = re.sub("@anchor{(.*?)}", "", r, flags=re.DOTALL)
  r = re.sub("@ref{(.*?)}", "\\1", r, flags=re.DOTALL)

  r = re.sub("@newterm{(.*?)}", "<tt> \\1 </tt> \n", r, flags=re.DOTALL)  
  r = re.sub("@code{(.*?)}", "<tt> \\1 </tt>", r, flags=re.DOTALL)
  r = re.sub("@var{(.*?)}", "\\1", r, flags=re.DOTALL)
  r = re.sub("@i{(.*?)}", "\\1", r, flags=re.DOTALL)
  r = re.sub("@emph{(.*?)}", "<em>\\1</em>", r, flags=re.DOTALL)
  
  r = re.sub("@r{(.*?)}", "\\1", r, flags=re.DOTALL)
  
  r = re.sub("@strong{(.*?)}", "<b>\\1</b>", r, flags=re.DOTALL)
  
  r = re.sub("@footnote{(.*?)}", "<div class='footnote'> \\1 </div>", r, flags=re.DOTALL)

  r = re.sub("@lisp", '<div id="">', r)
  r = re.sub("@end lisp", "</div>\n<script>\nprompt();\n</script>", r)
  
  r = re.sub("@noindent", "", r)
  
  r = re.sub("@quotation", '<div class="exercise">', r)
  r = re.sub("@end quotation", '</div>', r)
  
  r = re.sub("@itemize @bullet", "<ul>", r)
  r = re.sub("@end itemize", "</ul>", r)

  r = re.sub("@item", "<li>", r)
  
  r = re.sub("@enumerate .*?\n", "<ul>", r)
  r = re.sub("@end enumerate", "</ul>", r)
  
  r = re.sub("@node(.*?)\n", "", r)
  
  print r
