var sectionCarouselOptions = {
            margin: ($(window).width() <= 991.98) ? 15 : 30,
            dots: false,
            nav: true,
            lazyLoad: true,
            navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
            responsive: {
                   0: { items: 2, slideBy: 2 },
                 576: { items: 2, slideBy: 2 },
                 992: { items: 4, slideBy: 4 },
                1200: { items: 4, slideBy: 4 },
                1600: { items: 4, slideBy: 4 }
            }

        }
var checkIneter;
let _isAlreadyCreated=0;
$(document).findAsyncElem({
    target: [
        '.featured-products .na4 .owl-carousel .product-card .card-block',
        '.featured-products .bs4 .owl-carousel .product-card .card-block',
        '.featured-products .os4 .owl-carousel .product-card .card-block'
    ],
    success: function(){
    
        if(_isAlreadyCreated==0)
        {
            _isAlreadyCreated++;
            //tabbed carousel code
            var _html = '<div class="tabbed-carousel t1"><ul></ul></div>';
            $(_html).insertAfter('[data-subelementname="Featured Products"] h2');
            // checkIneter = setInterval( checkSection, 200);
             checkSection();
        }
    }
});
         function checkSection(){
        
            var totalSection = $('.featured-products [data-saaselementtype="Section With Carousel"]').length;
            var loadedSection = $('.featured-products [data-saaselementtype="Section With Carousel"][data-apiloaded="done_success"]').length;
            if( totalSection == loadedSection){
                $('.featured-products [data-saaselementtype="Section With Carousel"][data-apiloaded="done_success"]:not(.doneJS)').each(function(i){
                    // var name = $(this).attr('data-subelementname');
                    var name = $(this).find('.seperator h3').text();
                    name = name.replace(/\s\s+/g, ' ');
                    $(this).addClass("doneJS collapse section"+i).removeClass('d-block d-sm-block d-lg-block');
                    $(this).attr('data-parent',".featured-products");
                    // $('<li data-tab="'+name+'" data-toggle="collapse" href=".section'+i+'" aria-controls="section'+i+'" aria-expanded="false" class="page-heading collapsed">'+name +'</li>').appendTo('.tabbed-carousel ul');                    
                    var sectionCarousels = $(this).find('.owl-carousel')
                   // sectionCarousels.trigger("destroy.owl.carousel");
                    sectionCarousels.owlCarousel(sectionCarouselOptions);
                })
                //for default show of tab
               $('.featured-products .tabbed-carousel li[href=".section0"]').trigger('click');
                              
                $('.featured-products').removeClass('d-none');
                stopCheckIneter();
            }
        }
        function stopCheckIneter() {
            clearInterval(checkIneter);
        }
$(document).on('change','select#nav-Select',function(e){
    $('.featured-products .tabbed-carousel [aria-controls="'+$(this).val()+'"]').trigger('click');
});

///new home page changes//
$(document).findAsyncElem({
    target: '[data-customclass="home-slider"] .owl-dots,[data-customclass="home-slider"] .owl-prev, [data-customclass="home-slider"] .owl-next, [data-customclass="home-slider"] .owl-carousel',
    success: function(){
        $('[data-customclass="home-slider"] .owl-dots').after('<div id="playPauseButton" class="playPause owl-dot"><span class="fa fa-pause"></span></div>');
        let owlHomeslider= $('[data-customclass="home-slider"] #OWL_CAROUSEL .owl-carousel');
        const icon = $('#playPauseButton').find('span');
        
        $('#playPauseButton').on('click', function() {
            debugger
            if (icon.hasClass('fa-pause')) {
                icon.removeClass('fa-pause').addClass('fa-play');               
                owlHomeslider.trigger('stop.owl.autoplay'); 
            } else {
                icon.removeClass('fa-play').addClass('fa-pause');
                owlHomeslider.trigger('play.owl.autoplay');
            }

        });
    }
});
