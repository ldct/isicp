// It associates each element from class "footnote_marker" 
// with immediately following element from class "footnote". 
// It binds all such pairs in one go.

$(function() {
  $(".footnote_marker").tooltip({
    tipClass: 'footnote',
    delay: 600
  }).dynamic();
});
