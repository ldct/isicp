if (typeof LambdaJS == 'undefined') var LambdaJS = {};
if (typeof LambdaJS.App == 'undefined') LambdaJS.App = {};

(function(ns) {
    ns.testJS18 = function() {
        return [
            '(function(x) x)(1)',
            'let x = 1'
        ].every(function(t) {
            try {
                eval(t);
                return true;
            } catch (e) {
                return false;
            }
        });
    };
    ns.isJS18Enabled = function() {
        if (typeof ns._isJS18Enabled == 'undefined') {
            ns._isJS18Enabled = ns.testJS18();
        }
        return ns._isJS18Enabled;
    };
    ns.hideSyntax = function(table, hide) {
        var hideCols = function(table, i) {
            for (var j=0; j < table.rows.length; j++) {
                var row = table.rows[j];
                if (row) {
                    var elm = row.cells[i];
                    if (elm) elm.style.display = 'none';
                }
            }
        };
        var head = table.rows[0];
        if (!head) return;
        for (var i=0; i < head.cells.length; i++) {
            if (head.cells[i].className == hide) {
                hideCols(table, i);
                break;
            }
        }
    };
    ns.Repl = function(elm, cont) {
        var self = {
            getWait: function(){ return 500; },
            getStrategy: function() {
                return new LambdaJS.Strategy.Leftmost();
            },
            getPP: function() {
                return new LambdaJS.PP.Lambda();
            },
            env: new LambdaJS.Env(),
            destruct: function() {
                delete self.strategy; delete self.marker; delete self.exp;
                if (self.abort) self.abort.die();
            },
            contDefault: function() {
                self.console.prompt();
                self.destruct();
            },
            parseDefault: function(cmd){ return self.env.evalLine(cmd); }
        };
        self.cont = cont || self.contDefault;
        self.parse = self.parseDefault;
        self.makeAbortButton = function() {
            var parent = self.console.enclosing;
            self.abort = new UI.AbortButton(parent, {
                position: 'absolute'
            }, function() {
                if (self.marker) {
                    self.marker.setCallback(function(){});
                    self.marker = null;
                }
                self.cont();
            });
            var btn = self.abort.button;
            var height = btn.offsetHeight;
            var val = function(p){ return parseInt(UI.getStyle(btn, p))||0; };
            height += val('borderTopWidth') || val('borderWidth');
            height += val('marginTop') || val('margin');
            btn.style.right = 0; btn.style.bottom = (-height)+'px';
        };
        self.console = new UI.Console(elm, function(cmd) {
            self.sandbox(function() {
                self.exp = self.parse(cmd);
                if (self.exp) {
                    self.strategy = self.getStrategy();
                    self.console.insert(self.getPP().pp(self.exp));
                    self.makeAbortButton();
                    self.mark();
                } else {
                    self.cont();
                }
                return true;
            }, self.cont);
        }, null, function(evnt) {
            if ((evnt.charCode || evnt.keyCode) == 220) {
                UI.insertText(self.console.input, '\u03bb');
                return true;
            }
            return false;
        });
        self.sandbox = function(fun, cont) {
            try {
                if (fun()) return;
            } catch (e) {
                var meta = [];
                [ 'fileName', 'lineNumber' ].forEach(function(x) {
                    if (/^([a-z]+)/.test(x) && e[x])
                        meta.push(RegExp.$1 + ': ' + e[x]);
                });
                meta = meta.length ? ' ['+meta.join(', ')+']' : '';
                self.console.err(e.message + meta);
            }
            cont();
        };
        self.mark = function() {
            self.sandbox(function() {
                var strategy = self.getStrategy();
                self.exp = strategy.mark(self.exp);
                if (strategy.marked) {
                    setTimeout(function() {
                        if (self.abort()) return;
                        self.marker = self.getPP();
                        UI.replaceLastChild(self.console.view.lastChild,
                                            self.marker.pp(self.exp));
                        self.reduce(self.marker);
                    }, self.getWait());
                    return true;
                }
            }, self.cont);
        };
        self.reduce = function(marker) {
            self.sandbox(function() {
                var strategy = self.getStrategy();
                self.exp = strategy.reduceMarked(self.exp);
                if (strategy.reduced) {
                    var red = UI.$new('span', {
                        klass: 'reduce',
                        child: '\u2192'
                    });
                    setTimeout(function() {
                        if (self.abort()) return;
                        self.console.insert(red, self.marker.pp(self.exp));
                        self.mark();
                    }, self.getWait());
                } else {
                    marker.setCallback(function(){ self.mark(); });
                }
                return true;
            }, self.cont);
        };
        self.cont();
        return self;
    };
    ns.StaticCode = function(decl) {
        var self = ns.StaticCode;
        self.hash = {};
        self.run = function(id) {
            var code = self.hash[id];
            if (code) {
                code.run();
            }
        };
        self.forEach = function(fun) {
            if (typeof fun == 'string') {
                var name = fun;
                fun = function(obj){ obj[name](); };
            }
            for (var id in self.hash) fun(self.hash[id]);
        };
        self.toLambda = function(){ self.forEach('toLambda'); };
        self.toJavaScript = function(){ self.forEach('toJavaScript'); };
        self.toJavaScript18 = function(){ self.forEach('toJavaScript18'); };
        var Code = function(node, decl) {
            var self = { node: node, code: node.textContent, decl: decl };
            if (typeof node.textContent == 'undefined') { // IE fix
                var s = ''; var len=node.childNodes.length; var child;
                for (var i=0; i < len && (child=node.childNodes[i]); i++) {
                    if (child instanceof Text) s += child.toString();
                }
                self.code = s;
            }
            (node.className||'').split(/\s+/).forEach(function(name) {
                name = name.split('-').map(function(s) {
                    return s.charAt(0).toUpperCase()+s.substring(1);
                }).join('');
                if (name in LambdaJS.Strategy) self.st = name;
            });
            var conv = function(pp, decl, code) {
                return code.split(/[\n\r]/).map(function(l) {
                    var expr = l; var pre = ''; var post = '';
                    if (/^(var|let)\s+([^\s=]+)\s*=\s*(.*)$/.test(expr)) {
                        var d = RegExp.$1; var v = RegExp.$2; expr = RegExp.$3;
                        pre = [ decl(d), v, '=', '' ].join(' ');
                    }
                    if (new RegExp('^([^;]*)(;.*)$').test(expr) ||
                        new RegExp('^(.*?)( //.*)$').test(expr) ||
                        new RegExp('^()(//.*)$').test(expr)) {
                        expr = RegExp.$1; post = RegExp.$2;
                    }
                    var env = new LambdaJS.Env();
                    try {
                        if (expr.length > 0) {
                            expr = env.evalLine(expr);
                            expr = expr || { pp: function(){ return ''; } };
                            expr = UI.text(pp.pp(expr));
                        }
                        return pre+expr+post;
                    } catch (e) {
                        return e.message;
                    }
                }).join('\n');
            };
            self.t = function(what) {
                if (!self['code'+what]) {
                    var pp = new LambdaJS.PP[what]();
                    self['code'+what] = conv(pp, self.decl, self.code);
                }
                UI.removeAllChildren(self.node);
                self.node.appendChild(UI.$text(self['code'+what]));
                return self['code'+what];
            };
            self.toLambda = function(){ return self.t('Lambda'); };
            self.toJavaScript = function() {
                UI.removeAllChildren(self.node);
                self.node.appendChild(UI.$text(self.code));
                return self.code;
            };
            self.toJavaScript18 = function(){ return self.t('JavaScript18'); };
            self.run = function() {
                var parent = self.node.parentNode;
                console.log(parent);
                if (self.repl) {
                    self.repl.abort.doAbort();
                    parent = self.repl.console.enclosing;
                    self.repl.console.destroy();
                    parent.removeChild(UI.$('result-'+self.node.id));
                }
                var div = UI.$new('div', {
                    klass: 'console', id: 'result-'+self.node.id
                });
                parent.appendChild(div);
                var repl = self.repl = new ns.Repl(div, function(){});
                var get = function(k){ return UI.$('input-'+k).value; };
                repl.getStrategy = function() {
                    var st = self.st || get('strategy') || 'Leftmost';
                    return new LambdaJS.Strategy[st];
                };
                repl.getPP = function() {
                    return new LambdaJS.PP[get('pp') || 'JavaScript'];
                };
                repl.getWait = function() {
                    var wait = get('wait');
                    return (typeof wait != 'undefined') ? wait : 500;
                };
                repl.cont = function() {
                    repl.destruct();
                    repl.cont = repl.contDefault;
                    repl.parse = repl.parseDefault;
                    repl.console.prompt();
                };
                repl.parse = function(c){ return repl.env.evalLines(c); };
                repl.console.insert([
                    '[', repl.getStrategy().name,
                    '/', repl.getPP().name,
                    ']' ].join(' '));
                repl.console.command(self.code);
            };
            return self;
        };
        var name = 'LambdaJS.App.StaticCode';
        var links = UI.doc.getElementsByTagName('a');
        for (var i=0; i < links.length; i++) {
            var node;
            if (links[i].id.match(/^run-(.+)/) && (node=UI.$(RegExp.$1))) {
                links[i].href = 'javascript:'+name+'.run(\''+node.id+'\')';
                self.hash[node.id] = new Code(node, decl);
            }
        }
        return self;
    };
})(LambdaJS.App);

function init(id) {
    with (LambdaJS.App) {

        // examples
        var declLet = function(){ return 'let'; };
        var declVar = function(){ return 'var'; };
        var exmpls = new StaticCode(isJS18Enabled() ? declLet : declVar);

        // REPL
        var elm = document.getElementById(id);
        var repl = new Repl(elm);

        var makeSelector = function(what, dflt, extra) {
            extra = extra || function(){};
            var lc = what.toLowerCase();
            var cat = LambdaJS[what]; var hash = {};
            for (var k in cat) hash[k] = { name: new cat[k]().name };
            new UI.Selector(lc, hash, function(key) {
                repl['get'+what] = function(){ return new cat[key]; };
                UI.$('input-'+lc).value = key;
                extra(key);
                if (repl.console.input) repl.console.input.focus();
            }, UI.$('input-'+lc).value || dflt);
        };

        // strategy
        makeSelector('Strategy', 'Leftmost');

        // output
        if (!isJS18Enabled()) delete LambdaJS.PP.JavaScript18;
        var lang = /\#js$/.test(location.href) ? 'JavaScript' : 'Lambda';
        makeSelector('PP', lang, function(key){ exmpls['to'+key](); });

        // wait
        var ul = UI.$('pp');
        ul.appendChild(UI.$new('li', { klass: 'label', child: 'Wait:' }));
        var input = UI.$new('input', { id: 'wait' });
        var sync = function(){ UI.$('input-wait').value = input.value; };
        new UI.Observer(input, 'onchange', sync);
        new UI.Observer(input, 'onkeyup', sync);
        var w = UI.$('input-wait').value;
        input.value = w.length ? w : 500;
        sync();
        ul.appendChild(input);
        repl.getWait = function(){ return input.value; };
    }
};
