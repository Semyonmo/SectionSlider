/**
 * Created by semyon on 14.02.14.
 */
'use strict';

(function (window, undefined) {
    var sectionSlider = {},
        elem = "",
        easing = "",
        resizeTime = "",
        activeSelector = "",
        timeoutID = null,
        scrollToValue = 0,
        menu = "",
        scrollState = "top",
        scrolledElement = 'html,body',
        section = {},
        scrollWay = "",
        scrollSpeed = 0,
        displayedSection = {},
        activeMenuItem = "",
        fullScreenSections = [];

    sectionSlider.options = function (options) {
        sectionSlider.options = options || {};
        sectionSlider.init();
    }

    sectionSlider.init = function () {
        elem = sectionSlider.options.elem || "section";
        easing = sectionSlider.options.easing || "linear";
        resizeTime = sectionSlider.options.resizeDelay || 50;
        activeSelector = sectionSlider.options.activeSelector || "section-active";
        scrollSpeed = sectionSlider.options.scrollSpeed || 400;
        menu = sectionSlider.options.menu;
        fullScreenSections = sectionSlider.options.fullScreenSections || [];

        updateSectionHeight();
        scrollHash();
        scrollHappens();

        $(menu +' a').on('click', function (e) {
            e.preventDefault();
            location.hash = $(this).attr('href');
            $(window).trigger('hashchange');
        });
    };

    sectionSlider.resize = function () {
        updateSectionHeight();
    }

    function clientHeight() {
        return document.documentElement.clientHeight;
    }

    function scrollTop() {
        return window.pageYOffset || document.documentElement.scrollTop;
    }

    function updateSectionHeight() {
        if ($(fullScreenSections).length > 0) {
            $(fullScreenSections).each(function () {
                $(this).height(clientHeight() + "px");
            });
        }
    }

    function scrollHappens() {
        sectionShows();
        var sectionMenuItem = $(displayedSection).data('menu-item');
        if (activeMenuItem != sectionMenuItem) {
            $(activeMenuItem).removeClass("active");
            activeMenuItem = sectionMenuItem;
            //window.history.pushState("text", "hello", activeMenuItem);
        }
        $(activeMenuItem).addClass("active");
        $(displayedSection).addClass(activeSelector).siblings().removeClass(activeSelector);
    }

    sectionSlider.scrollTo = function (selector) {
        sectionShows();
        $(selector).addClass(activeSelector).siblings().removeClass(activeSelector);
        sectionSlider.scrollActive();
    }

    function sectionShows() {
        var centerScrollPos = scrollTop() + clientHeight() / 2;

        $(elem).each(function () {
            var positionTop = $(this).offset().top;
            var positionBottom = positionTop + $(this).height();

            if (centerScrollPos > positionTop && centerScrollPos < positionBottom) {
                displayedSection = $(this);
            }
        });
    }

    function sectionsParse() {
        var sections = $(elem);
        for (var i = 0; i < sections.length; i++) {
            if ($(sections[i]).hasClass(activeSelector)) {
                section = {
                    height: parseInt($(sections[i]).css('height')),
                    offset: $(sections[i]).offset()
                }
                section.prev = {
                    height: parseInt($(sections[i - 1]).css('height')) || 0,
                    offset: $(sections[i - 1]).offset() || 0
                };
                section.next = {
                    height: parseInt($(sections[i + 1]).css('height')) || section.height,
                    offset: $(sections[i + 1]).offset() || section.offset
                }
                return false;
            }
        }
    }

    sectionSlider.scrollPrev = function () {
        sectionsParse();

        scrollWay = "prev";

        if (scrollState == "bottom" && section.height > clientHeight()) {
            scrollInternalPrev();
            return false;
        }

        if (scrollState == "bottom" || scrollState == "top") {
            if (section.prev.height <= clientHeight()) {
                scrollCenterPrev();
            } else {
                scrollTopPrev();
            }
            return false;
        }
    }

    sectionSlider.scrollActive = function () {
        sectionsParse();

        scrollWay = "active";

        if (section.height > clientHeight()) {
            scrollTopActive();
        }

        if (section.height <= clientHeight()) {
            scrollCenterActive();
        }

        return false;
    }

    sectionSlider.scrollNext = function () {
        sectionsParse();

        scrollWay = "next";

        if (scrollState == "top" && section.height > clientHeight()) {
            scrollInternalNext();
            return false;
        }

        if (scrollState == "bottom" || scrollState == "top") {
            if (section.next.height <= clientHeight()) {
                scrollCenterNext();
            } else {
                scrollTopNext();
            }
            return false;
        }
    }

    function scrollInternalPrev() {
        if (scrollState == "bottom") {
            scrollTo(section.offset.top, sectionSlider.options.scrollSpeed / 3);
            scrollState = "top";
        }
    }

    function scrollInternalNext() {
        if (scrollState == "top") {
            scrollTo(section.offset.top + section.height - clientHeight(), sectionSlider.options.scrollSpeed / 3);
            scrollState = "bottom";
        }
    }

    function scrollTo(value, speed) {
        var speed = speed || sectionSlider.options.scrollSpeed;
        var value = value;
        if (value == scrollToValue && scrollWay != "active" ||
            isNaN(value) ||
            (scrollWay == "next" && value < scrollTop()) ||
            (scrollWay == "prev" && value > scrollTop())) {
            return false;
        }

        sectionSlider.options.scrollTop = value + "px";
        $(scrolledElement).stop().animate(
            sectionSlider.options,
            speed);
        scrollToValue = value;
    }

    function scrollCenterPrev() {
        var value = section.prev.offset.top + (section.prev.height / 2) - (clientHeight() / 2);
        scrollTo(value);
        scrollState = "top";
    }

    function scrollCenterNext() {
        var value = section.next.offset.top + (section.next.height / 2) - (clientHeight() / 2);
        scrollTo(value);
        scrollState = "top";
    }

    function scrollCenterActive() {
        var value = section.offset.top + (section.height / 2) - (clientHeight() / 2);
        scrollTo(value, 0);
        scrollState = "top";
    }

    function scrollTopPrev() {
        var value = section.prev.offset.top;
        scrollTo(value);
        scrollState = "top";
    }

    function scrollTopNext() {
        var value = section.next.offset.top;
        scrollTo(value);
        scrollState = "top";
    }

    function scrollTopActive() {
        var value = section.offset.top;
        scrollTo(value, 0);
        scrollState = "top";
    }

    $(document).keydown(function (e) {
        switch (e.which) {
            //up key press
            case 38:
            case 33:
            {
                sectionSlider.scrollPrev();
                return false;
                break;
            }
            //down key press
            case 40:
            case 34:
            {
                sectionSlider.scrollNext();
                return false;
                break;
            }
            default:
                break;
        }
    });

    function scrollHash() {
        var value = window.location.hash.split('/');
        var section = value[0];

        $(elem).each(function () {
            if ($(this).data('menu-item') == section) {
                sectionSlider.scrollTo(this);
            }
        });
    }

    $(window).on('hashchange', function () {
        scrollHash();
    });

    $(window).resize(function () {
        clearTimeout(timeoutID);
        timeoutID = setTimeout(sectionSlider.resize, resizeTime);
    });

    $(window).bind('orientationchange', function () {
        sectionSlider.resize();
    });

    $(window).scroll(function () {
        scrollHappens();
    });
    window.sectionSlider = sectionSlider;

    sectionSlider.init();
}(this));
