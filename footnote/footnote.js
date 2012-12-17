// It seems to associate each element from class "footnote" 
// with immediately following element from class "tooltip". 
// Apparently it binds all such pairs in one go.

$(function() {
  $(".footnote").tooltip({
    delay: 600
  }).dynamic();
});
