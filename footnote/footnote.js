$(function() {
  // Configuration
  var document_selector = "html",
      footnote_selector = ".footnote",
      trigger_selector = ".footnote_trigger",
      old_document_bg = $("html").css("background"),
      old_footnote_bg = $(".footnote").css("background"),
      new_document_bg = "#e8e8e8",
      new_footnote_bg = "#ffffff";
  // Makes document background darker 
  // and footnote lighter during display.
  // Most of it is borrowed from tooltip.js.
  $.tools.tooltip.addEffect("darken",
    // on show 
    function(done) { 
      var conf = this.getConf(), 
	  tip = this.getTip(), 
	  o = conf.opacity;
      if (o < 1) { tip.css({ opacity: o }); }
      tip.show();
      $(document_selector).css({ background: new_document_bg });
      $(footnote_selector).css({ background: new_footnote_bg });
      done.call();
    },
    // on hide 
    function(done) { 
      this.getTip().hide();
      $(document_selector).css({ background: old_document_bg });
      $(footnote_selector).css({ background: old_footnote_bg });
      done.call();
    } 
  );
  // Associates a <trigger_selector> 
  // with nearest <footnote_selector>. 
  // It binds all such pairs in one go.
  $(trigger_selector).tooltip({
    tipClass: footnote_selector.substring(1),
    delay: 600,
    effect: 'darken'
  }).dynamic(); // keeps footnote in viewport
});
