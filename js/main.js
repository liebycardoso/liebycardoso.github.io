/*
* ----------------------------------------------------------------------------------------
Author       : Onepageboss
Template Name: MINIMA - Minimal Onepage Agency Template
Version      : 1.0

   ____                   _____                             ____     ____     _____    _____ 
  / __ \                 |  __ \                           |  _ \   / __ \   / ____|  / ____|
 | |  | |  _ __     ___  | |__) |   __ _    __ _    ___    | |_) | | |  | | | (___   | (___  
 | |  | | | '_ \   / _ \ |  ___/   / _` |  / _` |  / _ \   |  _ <  | |  | |  \___ \   \___ \ 
 | |__| | | | | | |  __/ | |      | (_| | | (_| | |  __/   | |_) | | |__| |  ____) |  ____) |
  \____/  |_| |_|  \___| |_|       \__,_|  \__, |  \___|   |____/   \____/  |_____/  |_____/ 
                                            __/ |                                            
                                           |___/                                             
* ----------------------------------------------------------------------------------------
*/

(function ($) {
    'use strict';

    jQuery(document).ready(function () {

        /*
         * ----------------------------------------------------------------------------------------
         *  PRELOADER JS
         * ----------------------------------------------------------------------------------------
         */
        $(window).load(function () {
            $('.preloader').fadeOut();
            $('.preloader-area').delay(350).fadeOut('slow');

            $(".menu-area").sticky({
                topSpacing: 0,
            });

            $('.work .work-posts').isotope({
                itemSelector: '.col-md-4'
            });

            // init Isotope
            var $container = $('.work-posts').isotope({
                itemSelector: '.item'
            });
            // filter functions
            var filterFns = {
                // show if number is greater than 50
                numberGreaterThan50: function () {
                    var number = $(this).on('.number').text();
                    return parseInt(number, 10) > 50;
                },
                // show if name ends with -ium
                ium: function () {
                    var name = $(this).on('.name').text();
                    return name.match(/ium$/);
                }
            };

            // bind filter button click
            $('#filters').on('click', 'li', function () {
                var filterValue = $(this).attr('data-filter');
                // use filterFn if matches value
                filterValue = filterFns[filterValue] || filterValue;
                $container.isotope({
                    filter: filterValue
                });
            });

            // change is-checked class on buttons
            $('.filters').each(function (i, buttonGroup) {
                var $buttonGroup = $(buttonGroup);
                $buttonGroup.on('click', 'li', function () {
                    $buttonGroup.on('.active').removeClass('active');
                    $(this).addClass('active');
                });
            });

        });


        /*
         * ----------------------------------------------------------------------------------------
         *  SMOTH SCROOL JS
         * ----------------------------------------------------------------------------------------
         */

        $('a.smoth-scroll').on("click", function (e) {
            var anchor = $(this);
            $('html, body').stop().animate({
                scrollTop: $(anchor.attr('href')).offset().top - 50
            }, 1000);
            e.preventDefault();
        });


        /*
         * ----------------------------------------------------------------------------------------
         *  TESTIMONIAL JS
         * ----------------------------------------------------------------------------------------
         */

        $(".testimonial-list").owlCarousel({
            items: 1,
            autoPlay: true,
            navigation: false,
            itemsDesktop: [1199, 1],
            itemsDesktopSmall: [980, 1],
            itemsTablet: [768, 1],
            itemsTabletSmall: false,
            itemsMobile: [479, 1],
            pagination: true,
            autoHeight: true,
        });


        /*
         * ----------------------------------------------------------------------------------------
         *  EXTRA JS
         * ----------------------------------------------------------------------------------------
         */
        $(document).on('click', '.navbar-collapse.in', function (e) {
            if ($(e.target).is('a') && $(e.target).attr('class') != 'dropdown-toggle') {
                $(this).collapse('hide');
            }
        });
        $('body').scrollspy({
            target: '.navbar-collapse',
            offset: 195
        });

        /*
         * ----------------------------------------------------------------------------------------
         *  SCROOL TO UP JS
         * ----------------------------------------------------------------------------------------
         */
        $(window).scroll(function () {
            if ($(this).scrollTop() > 250) {
                $('.scrollup').fadeIn();
            } else {
                $('.scrollup').fadeOut();
            }
        });
        $('.scrollup').on("click", function () {
            $("html, body").animate({
                scrollTop: 0
            }, 800);
            return false;
        });


    });

})(jQuery);