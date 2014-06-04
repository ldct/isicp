create_TOC = function () {
    $("h3, h4").each(function(i) {

        var current = $(this);

        var title = current.text().slice(0,50).replace(/^\s+/, "").replace(/\s+$/, "").replace(/:/, "").replace(/\s+/g, "-").replace(/\./g, "-").replace(/\-+/g, "-").replace(/[\(\)]/g, "").replace(/\?/, "").replace(/'/g, "");

        current.attr("id", title);

        var a = $("<a>", {href: "#" + title, html: current.text().slice(0,50), 'class': current[0].coding.nodeName.toLowerCase()});

        a.click(function() {
            $('html, body').animate({
                'scrollTop':   $('#' + title).offset().top
            }, 250);
        });

        $("#toc").append(a).append($('<br>'));
    });

    $('#sidebox').animate({'right':'0%'});
};
