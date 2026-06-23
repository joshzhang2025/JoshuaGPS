var compareProGuid = [];
// $(document).findAsyncElem({
//     target: '.Action_btnDetails',
//     success: function (x) {
//         setTimeout(function () {
//             $('.Action_btnDetails').prependTo($('ul.breadcrumb'));
//         }, 1000);
//     }
// });

// Add fa paper icon in newsletter footer//
$(document).findAsyncElem({
    target: '.renNewsletter .newsletterButton',
    success: function (x) {
        $(".renNewsletter .newsletterButton a span").remove();
        $(".renNewsletter .newsletterButton a").append(`<i class="fa fa-paper-plane" aria-hidden="true"></i>`)
    }
});
// /* MCustom Scroolbar */
// $(document).findAsyncElem({
//     target: '.bottom-header .category-menu-container',
//     success: function (x) {
//         loadDesktopCustomScroll();
//     }
// });

$(document).findAsyncElem({
    target: '.renProducts .category-menu-container .category-menu',
    success: function () {
        // $('.category-menu:first-child a').addClass('down-btn');
    }
});


$(window).bind("resize", function () {
    loadDesktopCustomScroll
});


if ($(window).width() >= 991) {
    loadDesktopCustomScroll();
}

function loadDesktopCustomScroll() {
    if (typeof $.fn.mCustomScrollbar != "undefined") {
        console.log("mCustomScrollbar loaded.");
        $('.bottom-header .category-menu-container .category-menu > ul').mCustomScrollbar({ axis: "y" })
    } else {
        console.log("mCustomScrollbar not loaded. trying again");
        setTimeout(() => {
            loadDesktopCustomScroll();
        }, 1000)
    }
}
$(document).on('mouseover', '.bottom-header .category-menu', function () {

    var offset = $('.bottom-header .renProducts .category-menu-container .category-menu').offset();
    var W1 = parseInt($('.bottom-header .renProducts .category-menu-container .category-menu>ul').width());
    var W2 = parseInt($('.bottom-header .renProducts .category-menu-container .category-menu>ul .sub-menu.s1').width());

    $('.bottom-header .renProducts .category-menu-container .category-menu>ul').css("left", offset.left);
    $('.bottom-header .renProducts .category-menu-container .category-menu>ul li a .categoryImg, .bottom-header .renProducts .category-menu-container .category-menu>ul li.has-menu ul.sub-menu.s1').css("left", (offset.left + W1));
    if ($(window).width() < 800) {
        $(".sub-menu.s1").css("display", "none");
    }
    $('.bottom-header .renProducts .category-menu-container .category-menu>ul li.has-menu ul.sub-menu.s1 li a .categoryImg').css("left", (offset.left + W1 + W2));

});

/*----header js--*/



// $(document).on('click', '.bottom-header.mobView nav .renDecoration a.dec-heading', function () {
//     var testiss = $(this);
//     testiss.removeAttr("href");
//     clickCheck(testiss);
// });


$(document).on('click', '.bottom-header.mobView nav .MobDist .dist-tools li a', function () {
    var testiss = $(this)
    clickCheck(testiss);
});




$(document).on('click', '.bottom-header.mobView nav .MobCompany .company-tools li a', function () {
    var testiss = $(this)
    clickCheck(testiss);
});
$(document).on('click', '.bottom-header.mobView .category-menu > a', function () {
    var testiss = $(this)
    clickCheck(testiss);
});

function clickCheck(e) {
    if ($(window).width() < 991) {
        //event.preventDefault();
        $(e).toggleClass('clicked');
        $(e).siblings('ul').toggleClass('show', 400);
        var testing = $(e).siblings()
        $('.clicked').not(e).removeClass('clicked');
        $('.show').not(testing).removeClass('show')
    }
}

//}
$(document).on('click', 'header .menuicon', function () {
    $(this).toggleClass('open');
    $('body,.bottom-header,html').toggleClass("mobopen");
});




$(document).on('click', '.bottom-header.mobView .category-menu .has-menu > a', function () {
    if ($(window).width() < 991){
    $(this).removeAttr('href');
    $(this).toggleClass('clicked');
    $(this).siblings().slideToggle().toggleClass('show', 400);
    $(this).parent().siblings().children('.show').slideUp('normal').removeClass('show');
    $(this).parent().siblings().children('a').removeClass('clicked');
    }
});


$(document).findAsyncElem({
    target: '.bottom-header.mobView .category-menu .has-menu',
    success: function () {
        $('.has-menu a').click(function () {
            $('.sub-menu').addClass("subShow");
            $(this).removeClass("subShow");
        });
    }
});



$(document).findAsyncElem({
    target: '.quick-view-wrap',
    success: function () {
        setTimeout(function () {
            $('.product-card #products .card.product-card:not(.twiked)').each(function (i, item) {
                var prodImg = $(this).find('.productImage');
                var quickViewbtn = $(this).find(".quick-view-wrap .btn");
                var quickViewDiv = $(this).find(".quick-view-wrap");
                var cpr_pst = $(this).find(".compare-presentation");
                $(cpr_pst).appendTo(prodImg);
                $("<span>Quick View</span>").appendTo(quickViewbtn)
                $('<div class="icon"><i class="fa fa-eye" aria-hidden="true"></i></div>').prependTo(quickViewbtn)
                $(quickViewDiv).appendTo(cpr_pst)
                $(this).addClass("twiked")
            });
        }, 1000);
    }
});

$(document).on('click', 'ul.pricebreake li', function (e) {
    e.preventDefault();
    $('ul.pricebreake li').removeClass('active');
    $(this).addClass('active');
    var id = $(this).attr('data-toggle');
    $("[data-saaselementtype='Multiple PriceBreak'] .tab-content .collapse").each(function () {
        $(this).hide();
        if ($(this).attr('id') == id) {
            $(this).show();
        }
    });
});
$(document).findAsyncElem({
    target: '.collapsible-details.product-pricing',
    success: function () {
        $('.pricebreake li:first-child').addClass("active");
        $('.pricebreake li').click(function () {
            $('.pricebreake li').addClass("active");
            $(this).removeClass("active");
        });
    }
});

// RE: Parvez Mohammed sent you Ticket [30417] - New items [ApolloEMB]
 $(document).findAsyncElem({
    target: '.bottom-header.mobView .renProducts .category-menu >ul [data-category="Aprons"]',
    success: function () {
        let newLi= $('<li class="newArrivals"><a href="' + WebsiteURL + 'category/new-arrival"><div>New Arrivals</div></a></li>');
        // $(newLi).insertBefore('.bottom-header.mobView .renProducts .category-menu >ul [data-category="Aprons"]');
        $('.bottom-header.mobView .renProducts .category-menu >ul [data-category="Aprons"]').before(newLi);
    }
});

$(document).findAsyncElem({
    target: '.category-menu-container .category-menu ul li .categoryImg',
    success: function () {
         $('.bottom-header .renProducts .category-menu ul li').each(function(){
            var NewSrc = $(this).find("img").attr('data-src')
            $(this).find(".categoryImg img").attr('src',NewSrc);
        });        
    }
 });

 $(document).findAsyncElem({
    target: '.category-menu-container .category-menu ul li .categoryImg',
    success: function () {
         $('.category-menu-container .category-menu ul li').each(function(){
            var NewSrc = $(this).find("img").attr('data-src')
            $(this).find(".categoryImg img").attr('src',NewSrc);
        });        
    }
 });

 $(document).ready(function(){
     if(UserEmail){
         $(".footerSec .footerLoginLink").hide();
     }
 });

/////////////
 $(document).ready(function(){
    if (!UserEmail || UserEmail.trim() === "") {
            $('.footerSec.Sec3 .viewAllInventory_footer a').click(function(event){ 
                event.preventDefault(); 
                popupV2({
                content: "User must be logged in to Check Inventory",
                title: 'Warning',
                classes: 'LogginPopup',
                actions: [
                    {
                        text: "ok",
                        do: function () {
                            window.location.href = WebsiteURL + 'login';
                        },
                        dismiss: true,
                    }
                ]
            });
            });
    } 
 });

/////////
// $(document).ready(function(){
//     console.log("loader triggered");
//     $('.animsition-loading').hide()
//     // $('.animsition-loading').show();
//     // setTimeout(function () {
//     //     $('.animsition-loading').hide();
//     // }, 5000);
// });