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


/////////////////////
// Data Structures //
/////////////////////

function Pair(first, second) {
    var self = this;
    this.first = first;
    this.second = second;
    this.length = {
        // hack to avoid having to call a function to get length of a Pair
        'valueOf' : function() {return self.getlength();},
        'toString' : function() {return self.getlength().toString();}
    };
}

Pair.prototype = {
    valueOf : function() {
        return "Pair(" + this.first.valueOf() + ", "
                       + this.second.valueOf() + ")";
    },
    toString : function() {
        var s = "(" + (this.first === undefined ? "undefined" : this.first.toString());
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
    getlength : function() {
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
    seperate_dotted : function() {
        // Returns an array; its first element is a well-formed list
        // without the last element of the dotted list; its second element
        // is the element after the dot.
        if (! (this.second instanceof Pair)) {
            return [new Pair(this.first, nil), this.second];
        } else {
            var a = this.second.seperate_dotted();
            var list = a[0];
            var last = a[1];
            return [new Pair(this.first, list), last];
        }
    },
    map : function(fn) {
        // Return a Scheme list after mapping JavaScript function FN to THIS
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
    length : 0,
    getitem : function(k) {
        if (k < 0) {
            throw "IndexError: negative index into list";
        }
        throw "IndexError: list index out of bounds";
    },
    map : function(fn) {
        return this;
    }
};

/*
A Buffer provides a way of accessing a sequence of tokens across lines.

Its constructor takes an array, called "the source", that returns the
next line of tokens as a list each time it is queried, or null to indicate
the end of data.

The Buffer in effect concatenates the sequences returned from its source
and then supplies the items from them one at a time through its pop()
method, calling the source for more sequences of items only when needed.

In addition, Buffer provides a current method to look at the
next item to be supplied, without sequencing past it.
*/

function Buffer(source) {
    this.line_index = 0;
    this.index = 0;
    this.source = source;
    this.current_line = [];
    this.current();
}

Buffer.prototype = {
    pop : function() {
        // Remove the next item from self and return it. If self has
        // exhausted its source, returns null
        var current = this.current();
        this.index += 1;
        return current;
    },
    more_on_line : function() {
        return (this.index < this.current_line.length);
    },
    current : function() {
        while (! this.more_on_line()) {
            this.index = 0;
            if (this.line_index < this.source.length) {
                this.current_line = this.source[this.line_index];
                this.line_index += 1;
            } else {
                this.current_line = [];
                return null;
            }
        }
        return this.current_line[this.index];
    }
};

////////////////////////
// Scheme list parser //
////////////////////////

function scheme_read(src) {
    // Read the next expression from SRC, a Buffer of tokens
    var val, quoted;
    if (src.current() === null) {
        throw "EOFError";
    }
    val = src.pop();
    if (val === "nil") {
        return nil;
    } else if (! (DELIMITERS.inside(val))) {
        return val;
    } else if (val === "'") {
        quoted = scheme_read(src);
        return new Pair('quote', new Pair(quoted, nil));
    } else if (val === "(") {
        return read_tail(src);
    } else {
        throw "SyntaxError: unexpected token: " + val;
    }
}


function read_tail(src) {
    // Return the remainder of an array in SRC, starting before an element or )
    var first, rest, end_token, next_token;
    if (src.current() === null) {
        throw "SyntaxError: unexpected end of file";
    }
    if (src.current() === ")") {
        src.pop();
        return nil;
    }
    if (src.current() === ".") {
        src.pop();
        end_token = scheme_read(src);
        next_token = src.pop();
        if (next_token != ")") {
            throw "SyntaxError: Expected one element after .";
        }
        return end_token;
    }
    first = scheme_read(src);
    rest = read_tail(src);
    return new Pair(first, rest);
}
