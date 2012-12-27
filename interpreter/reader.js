/*This file implements the built-in data types of the Scheme language, along
with a parser for Scheme expressions.

In addition to the types defined in this file, some data types in Scheme are
represented by their corresponding type in JavaScript:
    number:       int or float
    symbol:       string
    boolean:      bool
    unspecified:  null

The valueOf() method of a Scheme value will return a JavaScript expression that
would be evaluated to the value, where possible.

The toString() method of a Scheme value will return a Scheme expression that
would be read to the value, where possible.
*/

function read(form) {
    var code = form.readarea.value.split("\n");
    form.writearea.value = tokenize_lines(code);
    code = new Pair(1, new Pair(2, new Pair(3, nil)))
    console.log(code.toString());
    console.log(code.valueOf());
    console.log(code.length());
    console.log(code.getitem(0));
    console.log(code.getitem(2));
    console.log(code.map(function(n) {return n*n;}).toString());
}
    
function Pair(first, second) {
    
    this.first = first;
    this.second = second;
}

Pair.prototype = {
    valueOf : function() {
	return "Pair(" + this.first.valueOf() + ", " + this.second.valueOf() + ")";
    },
    toString : function() {
	var s = "(" + this.first.toString();
	var second = this.second;
	while (second instanceof Pair) {
	    s += " " + second.first.toString();
	    second = second.second;
	}
	if (second !== nil) {
	    s += " . " + second.toString();
	}
	return s + ")";
    },
    length : function() {
	var n = 1;
	var second = this.second;
	while (second instanceof Pair) {
	    n += 1;
	    second = second.second;
	}
	if (second !== nil) {
	    throw "TypeError: length attempted on improper list";
	}
	return n;
    },
    getitem : function(k) {
	if (k < 0) {
	    throw "IndexError: negative index into list";
	}
	var y = this;
	for (var i = 0; i < k; i++) {
	    if (y.second === nil) {
		throw "IndexError: list out of bounds";
	    } else if (! (y.second instanceof Pair)) {
		throw "TypeError: ill-formed list";
	    }
	    y = y.second;
	}
	return y.first;
    },
    map : function(fn) {
	// Return a Scheme list after mapping JavaScript function FN to SELF
	var mapped = fn(this.first);
	if ((this.second === nil) || (this.second instanceof Pair)) {
	    return new Pair(mapped, this.second.map(fn)) ;
	} else {
	    throw "TypeError : ill-formed list";
	}
    }
}

// nil is a singleton object

var nil = {
    valueOf : function() {
	return 'nil';
    },
    toString : function() {
	return '()';
    },
    length : function() {
	return 0;
    },
    getitem : function(self, k) {
        if (k < 0) {
            throw "IndexError: negative index into list";
	}
        throw "IndexError: list index out of bounds";
    },
    map : function(fn) {
	return this
    }
};
