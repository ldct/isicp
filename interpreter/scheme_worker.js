onmessage = function(event) {

  importScripts('reader.js', 'tokenizer.js', 'primitives.js', 'scheme.js');
  
  var env = create_global_frame();
  var codebuffer = new Buffer(tokenize_lines([event.data]));
  
  while (codebuffer.current() != null) {
	
    var result = scheme_eval(scheme_read(codebuffer), env);
    if (! (result === null || result === undefined)) {
	  this.postMessage(result.toString());
    }
  }
  
};
