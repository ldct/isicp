onmessage = function(event) {

  importScripts('reader.js', 'tokenizer.js', 'primitives.js', 'scheme.js');
  
  var env = create_global_frame();
  var codebuffer = new Buffer(tokenize_lines([event.data]));
  this.postMessage(scheme_eval(scheme_read(codebuffer), env));

/*
  var args=event.data.args;
  switch(event.data.op) {
    case "+":
      var sum=0;
      for (var i in args) {
        sum += args[i];
      }
      this.postMessage(sum);
      break;
    case "*":
      var prod=1;
      for (var i in args) {
        prod *= args[i];
      }
      this.postMessage(prod);
      break;
    case "display":
      for (var i=0, length=args.length; i<length;i++) {
        this.postMessage(args[i]);
      }
      break;
  }
*/
};
