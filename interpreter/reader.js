/*This module implements the built-in data types of the Scheme language, along
with a parser for Scheme expressions.

In addition to the types defined in this file, some data types in Scheme are
represented by their corresponding type in JavaScript:
    number:       int or float
    symbol:       string
    boolean:      bool
    unspecified:  null

The valueOf method of a Scheme value will return a JavaScript expression that
would be evaluated to the value, where possible.

The toString method of a Scheme value will return a Scheme expression that
would be read to the value, where possible.
*/

function read(form) {
    code = form.readarea.value.split("\n");
    form.writearea.value = tokenize_lines(code);
    console.log(tokenize_lines(code));
}
    
function Pair(first, second) {
    
    this.first = first;
    this.second = second;
    
    this.valueOf = function() {
	return "Pair(" + this.first.valueOf + ", " + this.second.valueOf + ")";
    }

    this.toString = function() {
	var s = "(" + this.first.toString;
	var second = this.second;
	while (second instanceof Pair) {
	    s += " " + second.first.toString;
	    second = second.second;
	}
	if (! (second instanceof nil)) {
	    s += " . " + second.toString;
	}
	return s + ")";
    }

    this.length = function() {
	var n = 1;
	var second = this.second;
	while (second instanceof Pair) {
	    n += 1;
	    second = second.second;
	}
	if (! (second instanceof nil)) {
	    throw "TypeError: length attempted on improper list";
	}
	return n;
    }

    this.getitem = function(k) {
	if (k < 0) {
	    throw "IndexError: negative index into list"
	}
	var y = this
	for (var i = 0; i < k; i++) {
	    if (y.second instanceof nil) {
		throw "IndexError: list out of bounds"
	    } else if {
		throw
	    
    
	
	
